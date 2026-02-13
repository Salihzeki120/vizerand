import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  UserPlus,
  Clock,
  FileText,
  CreditCard,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { Customer, getAllCustomers, initializeDB } from "@/lib/db";

export default function Dashboard() {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    registered: 0,
    scheduled: 0,
    invoiced: 0,
    paid: 0,
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<Customer[]>(
    []
  );

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      await initializeDB();
      const allCustomers = await getAllCustomers();
      setCustomers(allCustomers);

      // Calculate stats
      setStats({
        total: allCustomers.length,
        registered: allCustomers.filter((c) => c.status === "registered").length,
        scheduled: allCustomers.filter(
          (c) => c.status === "appointment-scheduled"
        ).length,
        invoiced: allCustomers.filter((c) => c.status === "invoiced").length,
        paid: allCustomers.filter((c) => c.status === "paid").length,
      });

      // Get upcoming appointments (sorted by date)
      const withAppointments = allCustomers
        .filter((c) => c.appointmentDate)
        .sort((a, b) => {
          const dateA = new Date(a.appointmentDate!);
          const dateB = new Date(b.appointmentDate!);
          return dateA.getTime() - dateB.getTime();
        })
        .slice(0, 5);

      setUpcomingAppointments(withAppointments);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "registered":
        return "bg-blue-100 text-blue-800";
      case "appointment-scheduled":
        return "bg-teal-100 text-teal-800";
      case "invoiced":
        return "bg-amber-100 text-amber-800";
      case "paid":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
              <Calendar className="w-8 h-8" />
              {t('app.title')}
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              {t('app.subtitle')}
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/register">
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                <UserPlus className="w-4 h-4" />
                {t('buttons.newRegistration')}
              </Button>
            </Link>
            <Link to="/search">
              <Button variant="outline" className="gap-2">
                <Clock className="w-4 h-4" />
                {t('buttons.findAppointment')}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Toplam Müşteri</p>
                <p className="text-4xl font-bold text-primary mt-2">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <UserPlus className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Kayıtlı</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">
                  {stats.registered}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Randevulu</p>
                <p className="text-4xl font-bold text-teal-600 mt-2">
                  {stats.scheduled}
                </p>
              </div>
              <div className="bg-teal-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-teal-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Faturalı</p>
                <p className="text-4xl font-bold text-amber-600 mt-2">
                  {stats.invoiced}
                </p>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Ödenen</p>
                <p className="text-4xl font-bold text-green-600 mt-2">
                  {stats.paid}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Link to="/register">
            <Card className="p-6 border-0 shadow-sm hover:shadow-lg hover:scale-105 transition-all cursor-pointer h-full">
              <div className="text-primary mb-3">
                <UserPlus className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-foreground">Müşteri Kayıt</h3>
              <p className="text-sm text-slate-600 mt-1">Yeni müşteri ekle & takip kodu oluştur</p>
            </Card>
          </Link>

          <Link to="/search">
            <Card className="p-6 border-0 shadow-sm hover:shadow-lg hover:scale-105 transition-all cursor-pointer h-full">
              <div className="text-teal-600 mb-3">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-foreground">Randevu Güncelle</h3>
              <p className="text-sm text-slate-600 mt-1">Müşteri bul & randevu tarihi ekle</p>
            </Card>
          </Link>

          <Link to="/invoice">
            <Card className="p-6 border-0 shadow-sm hover:shadow-lg hover:scale-105 transition-all cursor-pointer h-full">
              <div className="text-amber-600 mb-3">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-foreground">Fatura Oluştur</h3>
              <p className="text-sm text-slate-600 mt-1">Fatura oluştur & yönet</p>
            </Card>
          </Link>

          <Link to="/payment">
            <Card className="p-6 border-0 shadow-sm hover:shadow-lg hover:scale-105 transition-all cursor-pointer h-full">
              <div className="text-green-600 mb-3">
                <CreditCard className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-foreground">Ödeme Kayıt</h3>
              <p className="text-sm text-slate-600 mt-1">Ödeme alındı işlemini tamamla</p>
            </Card>
          </Link>
        </div>

        {/* Upcoming Appointments */}
        <Card className="border-0 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Yaklaşan Randevular
            </h2>
          </div>
          {upcomingAppointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">
                      Takip Kodu
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">
                      Müşteri Adı
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">
                      Randevu Tarihi
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">
                      Durum
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {upcomingAppointments.map((customer) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <code className="bg-slate-100 px-3 py-1 rounded text-sm font-mono text-primary">
                          {customer.trackingCode}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {customer.fullName}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {customer.appointmentDate
                          ? new Date(customer.appointmentDate).toLocaleDateString(
                              "tr-TR"
                            )
                          : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={`${getStatusColor(customer.status)}`}>
                          {customer.status === "appointment-scheduled"
                            ? "Randevulu"
                            : customer.status === "invoiced"
                            ? "Faturalı"
                            : customer.status === "paid"
                            ? "Ödenen"
                            : "Kayıtlı"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600">No upcoming appointments</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
