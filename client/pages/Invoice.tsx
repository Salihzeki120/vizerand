import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  getCustomerByTrackingCode,
  updateCustomer,
  addInvoice,
  initializeDB,
  Customer,
} from "@/lib/db";
import { ArrowLeft, Search, FileText, Download } from "lucide-react";

export default function InvoicePage() {
  const { toast } = useToast();
  const [trackingCode, setTrackingCode] = useState("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [invoiceDescription, setInvoiceDescription] = useState("");
  const [invoiceId, setInvoiceId] = useState<string | null>(null);

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
        toast({
          title: "Success",
          description: "Customer found",
        });
      } else {
        setCustomer(null);
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

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!invoiceAmount || !invoiceDescription) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (!customer) return;

    setIsCreating(true);

    try {
      await initializeDB();
      
      // Create invoice
      const invoice = await addInvoice({
        trackingCode: customer.trackingCode,
        amount: parseFloat(invoiceAmount),
        currency: "USD",
        description: invoiceDescription,
        status: "issued",
      });

      // Update customer status
      const updatedCustomer: Customer = {
        ...customer,
        status: "invoiced",
        invoiceId: invoice.id,
      };
      await updateCustomer(updatedCustomer);

      setInvoiceId(invoice.id);
      setInvoiceAmount("");
      setInvoiceDescription("");
      
      toast({
        title: "Success",
        description: "Invoice created successfully",
      });
    } catch (error) {
      console.error("Failed to create invoice:", error);
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handlePrintInvoice = () => {
    if (!customer || !invoiceId) return;

    const printContent = `
      <html>
        <head>
          <title>Invoice - ${customer.trackingCode}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 40px; }
            .title { font-size: 24px; font-weight: bold; }
            .invoice-info { margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f0f0f0; }
            .total { font-weight: bold; font-size: 18px; }
            .footer { margin-top: 40px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">INVOICE</div>
          </div>
          <div class="invoice-info">
            <p><strong>Customer:</strong> ${customer.fullName}</p>
            <p><strong>Email:</strong> ${customer.email}</p>
            <p><strong>Phone:</strong> ${customer.phone}</p>
            <p><strong>Tracking Code:</strong> ${customer.trackingCode}</p>
            <p><strong>Invoice ID:</strong> ${invoiceId}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString("tr-TR")}</p>
          </div>
          <table>
            <tr>
              <th>Description</th>
              <th>Amount</th>
            </tr>
            <tr>
              <td>${invoiceDescription}</td>
              <td>$${parseFloat(invoiceAmount).toFixed(2)}</td>
            </tr>
            <tr>
              <td class="total">Total:</td>
              <td class="total">$${parseFloat(invoiceAmount).toFixed(2)}</td>
            </tr>
          </table>
          <div class="footer">
            <p>Thank you for your business!</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">
            Create Invoice
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
        ) : invoiceId ? (
          <Card className="border-0 shadow-sm p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 p-4 rounded-full">
                <FileText className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Invoice Created Successfully!
            </h2>
            <p className="text-slate-600 mb-6">Invoice ID: {invoiceId}</p>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-semibold text-foreground mb-4">
                Invoice Details
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
                  <span className="text-slate-600">Description:</span>{" "}
                  <span className="font-medium text-foreground">
                    {invoiceDescription}
                  </span>
                </p>
                <p>
                  <span className="text-slate-600">Amount:</span>{" "}
                  <span className="font-bold text-primary">
                    ${parseFloat(invoiceAmount).toFixed(2)}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button
                onClick={handlePrintInvoice}
                className="bg-primary hover:bg-primary/90 gap-2"
              >
                <Download className="w-4 h-4" />
                Print Invoice
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCustomer(null);
                  setTrackingCode("");
                  setInvoiceId(null);
                  setInvoiceAmount("");
                  setInvoiceDescription("");
                }}
              >
                Create Another Invoice
              </Button>
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

            {/* Invoice Form */}
            <Card className="border-0 shadow-sm p-8">
              <h2 className="text-xl font-bold text-foreground mb-6">
                Invoice Details
              </h2>
              <form onSubmit={handleCreateInvoice} className="space-y-4">
                <div>
                  <Label htmlFor="description" className="font-medium">
                    Description
                  </Label>
                  <Input
                    id="description"
                    value={invoiceDescription}
                    onChange={(e) => setInvoiceDescription(e.target.value)}
                    placeholder="e.g., Visa Application Fee"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="amount" className="font-medium">
                    Amount (USD)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={invoiceAmount}
                    onChange={(e) => setInvoiceAmount(e.target.value)}
                    placeholder="0.00"
                    className="mt-2"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 h-11"
                  disabled={isCreating}
                >
                  {isCreating ? "Creating..." : "Create Invoice"}
                </Button>
              </form>
            </Card>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setCustomer(null);
                setTrackingCode("");
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
