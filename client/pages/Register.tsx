import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import { addCustomer, initializeDB } from "@/lib/db";
import { ArrowLeft, CheckCircle, Copy } from "lucide-react";

const CONSULATES = [
  "Istanbul",
  "Ankara",
  "Izmir",
  "Antalya",
  "Adana",
  "Gaziantep",
  "Bursa",
  "Konya",
];

const VISA_TYPES = [
  "Tourist Visa",
  "Business Visa",
  "Student Visa",
  "Work Visa",
  "Residence Visa",
  "Transit Visa",
];

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    passportNumber: "",
    consulate: "",
    visaType: "",
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phone ||
      !formData.passportNumber ||
      !formData.consulate ||
      !formData.visaType
    ) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await initializeDB();
      const customer = await addCustomer({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        passportNumber: formData.passportNumber,
        consulate: formData.consulate,
        visaType: formData.visaType,
      });

      setTrackingCode(customer.trackingCode);
      toast({
        title: "Success",
        description: "Customer registered successfully",
      });
    } catch (error) {
      console.error("Failed to register:", error);
      toast({
        title: "Error",
        description: "Failed to register customer",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (trackingCode) {
      navigator.clipboard.writeText(trackingCode);
      toast({
        title: "Success",
        description: "Tracking code copied to clipboard",
      });
    }
  };

  if (trackingCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link to="/">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Success Message */}
        <div className="max-w-2xl mx-auto px-6 py-12">
          <Card className="border-0 shadow-lg p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Registration Successful!
            </h1>
            <p className="text-slate-600 mb-6">
              Customer has been registered. Save the tracking code below to access
              the customer's information.
            </p>

            <div className="bg-slate-50 border-2 border-primary rounded-lg p-6 mb-6">
              <p className="text-sm text-slate-600 mb-2">Tracking Code</p>
              <div className="flex items-center justify-center gap-3">
                <code className="text-4xl font-bold text-primary">
                  {trackingCode}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="gap-2"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-6">
              Share this code with the customer. They will use it to track their
              appointment status.
            </p>

            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => navigate("/")}
                className="bg-primary hover:bg-primary/90"
              >
                Back to Dashboard
              </Button>
              <Button variant="outline" onClick={() => {
                setTrackingCode(null);
                setFormData({
                  fullName: "",
                  email: "",
                  phone: "",
                  passportNumber: "",
                  consulate: "",
                  visaType: "",
                });
              }}>
                Register Another Customer
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">
            Register New Customer
          </h1>
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <Card className="border-0 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <Label htmlFor="fullName" className="font-medium">
                Full Name
              </Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter customer's full name"
                className="mt-2"
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                className="mt-2"
              />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone" className="font-medium">
                Phone Number
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                className="mt-2"
              />
            </div>

            {/* Passport Number */}
            <div>
              <Label htmlFor="passportNumber" className="font-medium">
                Passport Number
              </Label>
              <Input
                id="passportNumber"
                name="passportNumber"
                value={formData.passportNumber}
                onChange={handleChange}
                placeholder="Enter passport number"
                className="mt-2"
              />
            </div>

            {/* Consulate */}
            <div>
              <Label className="font-medium">Consulate</Label>
              <Select
                value={formData.consulate}
                onValueChange={(value) => handleSelectChange("consulate", value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select consulate" />
                </SelectTrigger>
                <SelectContent>
                  {CONSULATES.map((consulate) => (
                    <SelectItem key={consulate} value={consulate}>
                      {consulate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Visa Type */}
            <div>
              <Label className="font-medium">Visa Type</Label>
              <Select
                value={formData.visaType}
                onValueChange={(value) => handleSelectChange("visaType", value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select visa type" />
                </SelectTrigger>
                <SelectContent>
                  {VISA_TYPES.map((visa) => (
                    <SelectItem key={visa} value={visa}>
                      {visa}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 h-11 text-base"
              disabled={isLoading}
            >
              {isLoading ? "Registering..." : "Register Customer"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
