import Sidebar from "../../../components/admin/Sidebar";
import AdminHeader from "../../../components/admin/AdminHeader";
import StatistikCard from "../../../components/admin/StatistikCard";
import TabelLaporan from "../../../components/admin/TabelLaporan";

export default function AdminDashboardPage() {
  return (
    <main className="flex min-h-screen bg-[#F2F7FF]">
      <Sidebar />

      <section className="flex-1 p-8">
        <AdminHeader />
        <StatistikCard />
        <TabelLaporan />
      </section>
    </main>
  );
}