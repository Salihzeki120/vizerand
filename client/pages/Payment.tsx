import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  getCustomerByTrackingCode,
  getInvoicesByTrackingCode,
  addPayment,
  updateCustomer,
  initializeDB,
  Customer,
  Invoice,
} from "@/lib/db";
import { ArrowLeft, Search, CheckCircle, CreditCard } from "lucide-react";

const PAYMENT_METHODS = [
  "Credit Card",
  "Bank Transfer",
  "Cash",
  "Check",
  "PayPal",
  "Other",
];

export default function PaymentPage() {
  const { toast } = useToast();
  const [trackingCode, setTrackingCode] = useState("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [paymentRecorded, setPaymentRecorded] = useState(false);

  const [formData, setFormData] = useState({
    invoiceId: "",
    amount: "",
    paymentMethod: "",
    notes: "",
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!trackingCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a tracking code",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);

    try {
      await initializeDB();
      const foundCustomer = await getCustomerByTrackingCode(trackingCode);

      if (foundCustomer) {
        setCustomer(foundCustomer);
        const customerInvoices = await getInvoicesByTrackingCode(trackingCode);
        setInvoices(customerInvoices);
        
        if (customerInvoices.length > 0) {
          setFormData({
            ...formData,
            invoiceId: customerInvoices[0].id,
            amount: customerInvoices[0].amount.toString(),
          });
        }
        
        toast({
          title: "Success",
          description: "Customer found",
        });
      } else {
        setCustomer(null);
        setInvoices([]);
        toast({
          title: "Not Found",
          description: "No customer found with this tracking code",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Search failed:", error);
      toast({
        title: "Error",
        description: "Failed to search for customer",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || !formData.paymentMethod) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!customer) return;

    setIsRecording(true);

    try {
      await initializeDB();
      
      // Record payment
      await addPayment({
        trackingCode: customer.trackingCode,
        invoiceId: formData.invoiceId,
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        paymentDate: new Date(),
        notes: formData.notes,
      });

      // Update customer status to paid
      const updatedCustomer: Customer = {
        ...customer,
        status: "paid",
      };
      await updateCustomer(updatedCustomer);

      setPaymentRecorded(true);
      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });
    } catch (error) {
      console.error("Failed to record payment:", error);
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      });
    } finally {
      setIsRecording(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">
            Record Payment
          </h1>
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        {!customer ? (
          <Card className="border-0 shadow-sm p-8">
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <Label htmlFor="trackingCode" className="font-medium">
                  Tracking Code
                </Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="trackingCode"
                    value={trackingCode}
                    onChange={(e) =>
                      setTrackingCode(e.target.value.toUpperCase())
                    }
                    placeholder="Enter tracking code"
                    className="font-mono text-lg"
                  />
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 gap-2"
                    disabled={isSearching}
                  >
                    <Search className="w-4 h-4" />
                    {isSearching ? "Searching..." : "Search"}
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        ) : paymentRecorded ? (
          <Card className="border-0 shadow-sm p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Payment Recorded Successfully!
            </h2>
            <p className="text-slate-600 mb-6">
              The payment has been recorded for {customer.fullName}
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-semibold text-foreground mb-4">
                Payment Summary
              </h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-slate-600">Customer:</span>{" "}
                  <span className="font-medium text-foreground">
                    {customer.fullName}
                  </span>
                </p>
                <p>
                  <span className="text-slate-600">Tracking Code:</span>{" "}
                  <span className="font-medium text-foreground">
                    {customer.trackingCode}
                  </span>
                </p>
                <p>
                  <span className="text-slate-600">Amount:</span>{" "}
                  <span className="font-bold text-green-600">
                    ${parseFloat(formData.amount).toFixed(2)}
                  </span>
                </p>
                <p>
                  <span className="text-slate-600">Payment Method:</span>{" "}
                  <span className="font-medium text-foreground">
                    {formData.paymentMethod}
                  </span>
                </p>
                <p>
                  <span className="text-slate-600">Date:</span>{" "}
                  <span className="font-medium text-foreground">
                    {new Date().toLocaleDateString("tr-TR")}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => {
                  setCustomer(null);
                  setTrackingCode("");
                  setPaymentRecorded(false);
                  setInvoices([]);
                  setFormData({
                    invoiceId: "",
                    amount: "",
                    paymentMethod: "",
                    notes: "",
                  });
                }}
                variant="outline"
              >
                Record Another Payment
              </Button>
              <Link to="/">
                <Button className="bg-primary hover:bg-primary/90">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Customer Info */}
            <Card className="border-0 shadow-sm p-8">
              <h2 className="text-xl font-bold text-foreground mb-6">
                Customer Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Full Name</p>
                  <p className="text-foreground mt-1">{customer.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">Email</p>
                  <p className="text-foreground mt-1">{customer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">Phone</p>
                  <p className="text-foreground mt-1">{customer.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">
                    Tracking Code
                  </p>
                  <p className="text-foreground font-mono mt-1">
                    {customer.trackingCode}
                  </p>
                </div>
              </div>
            </Card>

            {/* Payment Form */}
            <Card className="border-0 shadow-sm p-8">
              <h2 className="text-xl font-bold text-foreground mb-6">
                Payment Details
              </h2>
              <form onSubmit={handleRecordPayment} className="space-y-4">
                {invoices.length > 0 && (
                  <div>
                    <Label className="font-medium">Invoice</Label>
                    <Select
                      value={formData.invoiceId}
                      onValueChange={(value) =>
                        handleSelectChange("invoiceId", value)
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select invoice" />
                      </SelectTrigger>
                      <SelectContent>
                        {invoices.map((invoice) => (
                          <SelectItem key={invoice.id} value={invoice.id}>
                            {invoice.description} - $
                            {invoice.amount.toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="amount" className="font-medium">
                    Amount (USD) *
                  </Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="font-medium">Payment Method *</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value) =>
                      handleSelectChange("paymentMethod", value)
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes" className="font-medium">
                    Notes (Optional)
                  </Label>
                  <Input
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Add any notes about the payment"
                    className="mt-2"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 h-11 gap-2"
                  disabled={isRecording}
                >
                  <CreditCard className="w-4 h-4" />
                  {isRecording ? "Recording..." : "Record Payment"}
                </Button>
              </form>
            </Card>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setCustomer(null);
                setTrackingCode("");
                setInvoices([]);
              }}
            >
              Search Another Customer
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
