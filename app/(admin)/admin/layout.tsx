import AdminGuard  from "@/guards/AdminGuard";
import AdminLayout from "@/modules/admin/components/AdminLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <AdminLayout>{children}</AdminLayout>
    </AdminGuard>
  );
}
