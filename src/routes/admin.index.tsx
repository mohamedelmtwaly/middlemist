import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/use-auth';
import { useAdminProducts, useAdminCategories } from '@/lib/use-admin-products';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatCard } from '@/components/admin/StatCard';
import { Loader2, Package, Folder, Eye, EyeOff, Leaf } from 'lucide-react';

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
});

function AdminDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: authUser, isLoading } = useAuth();
  const { data: products } = useAdminProducts();
  const { data: categories } = useAdminCategories();

  // Redirect if not authenticated or not an admin
  if (!isLoading && (!authUser || !authUser.isAdmin)) {
    router.navigate({ to: '/admin/login' });
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0]">
        <Loader2 className="h-8 w-8 animate-spin text-[#5E6B2F]" />
      </div>
    );
  }

  // Calculate stats
  const totalProducts = products?.length || 0;
  const activeProducts = products?.filter(p => p.is_active).length || 0;
  const hiddenProducts = products?.filter(p => !p.is_active).length || 0;
  const mainCategories = categories?.filter(c => !c.parent_id).length || 0;
  const subCategories = categories?.filter(c => c.parent_id).length || 0;

  return (
    <AdminLayout currentPage="/admin">
      <div className="space-y-4 sm:space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#5E6B2F]/10 flex items-center justify-center">
            <Leaf className="h-6 w-6 text-[#5E6B2F]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#282A18]">مرحباً بك</h1>
            <p className="text-sm sm:text-base text-[#77796D]">إدارة متجر Middlemist Flower</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="إجمالي المنتجات"
            value={totalProducts}
            icon={Package}
            color="#5E6B2F"
          />
          <StatCard
            title="المنتجات النشطة"
            value={activeProducts}
            icon={Eye}
            color="#8A9A5B"
          />
          <StatCard
            title="المنتجات المخفية"
            value={hiddenProducts}
            icon={EyeOff}
            color="#B5655C"
          />
          <StatCard
            title="التصنيفات الرئيسية"
            value={mainCategories}
            icon={Folder}
            color="#5E6B2F"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2">
          <StatCard
            title="التصنيفات الفرعية"
            value={subCategories}
            icon={Folder}
            color="#8A9A5B"
          />
          <StatCard
            title="إجمالي التصنيفات"
            value={mainCategories + subCategories}
            icon={Folder}
            color="#5E6B2F"
          />
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-xl border border-[#5E6B2F]/20 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-[#282A18] mb-3 sm:mb-4">معلومات الحساب</h2>
          <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between items-center">
              <span className="text-[#77796D]">البريد الإلكتروني:</span>
              <span className="text-[#282A18] font-medium truncate max-w-[150px] sm:max-w-none">{authUser?.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#77796D]">الصلاحية:</span>
              <span className="text-[#5E6B2F] font-bold">مسؤول</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
