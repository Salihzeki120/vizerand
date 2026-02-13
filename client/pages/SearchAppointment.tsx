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
  initializeDB,
  Customer,
} from "@/lib/db";
import { ArrowLeft, Search, Save } from "lucide-react";

export default function SearchAppointment() {
  const { toast } = useToast();
  const [trackingCode, setTrackingCode] = useState("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");

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
        setAppointmentDate(
          foundCustomer.appointmentDate
            ? new Date(foundCustomer.appointmentDate).toISOString().split("T")[0]
            : ""
        );
        setAppointmentTime(foundCustomer.appointmentTime || "");
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

  const handleSaveAppointment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!appointmentDate || !appointmentTime) {
      toast({
        title: "Error",
        description: "Please fill in both date and time",
        variant: "destructive",
      });
      return;
    }

    if (!customer) return;

    setIsSaving(true);

    try {
      await initializeDB();
      const updatedCustomer: Customer = {
        ...customer,
        appointmentDate: new Date(appointmentDate),
        appointmentTime: appointmentTime,
        status: "appointment-scheduled",
      };

      await updateCustomer(updatedCustomer);
      setCustomer(updatedCustomer);
      toast({
        title: "Success",
        description: "Appointment updated successfully",
      });
    } catch (error) {
      console.error("Failed to save appointment:", error);
      toast({
        title: "Error",
        description: "Failed to save appointment",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">
            Update Appointment
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
                    placeholder="Enter tracking code (e.g., ABC12345)"
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
        ) : (
          <div className="space-y-6">
            {/* Customer Info Card */}
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
                  <p className="text-sm text-slate-600 font-medium">Passport</p>
                  <p className="text-foreground mt-1">{customer.passportNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">Consulate</p>
                  <p className="text-foreground mt-1">{customer.consulate}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">Visa Type</p>
                  <p className="text-foreground mt-1">{customer.visaType}</p>
                </div>
              </div>
            </Card>

            {/* Appointment Form */}
            <Card className="border-0 shadow-sm p-8">
              <h2 className="text-xl font-bold text-foreground mb-6">
                Appointment Details
              </h2>
              <form onSubmit={handleSaveAppointment} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="appointmentDate" className="font-medium">
                      Appointment Date
                    </Label>
                    <Input
                      id="appointmentDate"
                      type="date"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="appointmentTime" className="font-medium">
                      Appointment Time
                    </Label>
                    <Input
                      id="appointmentTime"
                      type="time"
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>

                {customer.appointmentDate && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-slate-600">
                      <strong>Current Appointment:</strong>{" "}
                      {new Date(customer.appointmentDate).toLocaleDateString(
                        "tr-TR"
                      )}{" "}
                      at {customer.appointmentTime}
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 h-11 gap-2"
                  disabled={isSaving}
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "Saving..." : "Save Appointment"}
                </Button>
              </form>
            </Card>

            {/* Navigation */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setCustomer(null);
                setTrackingCode("");
                setAppointmentDate("");
                setAppointmentTime("");
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
