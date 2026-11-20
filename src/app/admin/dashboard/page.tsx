import Sidebar from "../../../components/admin/Sidebar";
import AdminHeader from "../../../components/admin/AdminHeader";
import StatistikCard from "../../../components/admin/StatistikCard";
import TabelLaporan from "../../../components/admin/TabelLaporan";

export default function AdminDashboardPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#F2F7FF] md:flex-row">
      <Sidebar />

      <section className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-6 md:p-8">
        <AdminHeader />
        <StatistikCard />
        <TabelLaporan />
      </section>
    </main>
  );
}