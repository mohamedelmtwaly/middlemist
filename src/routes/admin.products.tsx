import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/use-auth';
import { useAdminProducts, useToggleProductStatus, type AdminProduct } from '@/lib/use-admin-products';
import { useAdminCategories as useMainCategories, type AdminCategory } from '@/lib/use-admin-categories';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProductModal } from '@/components/admin/ProductModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Search, Plus, Package, Eye, EyeOff, Edit, Trash2, X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { getSupabaseClient } from '@/lib/supabase';

export const Route = createFileRoute('/admin/products')({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminProducts,
});

function AdminProducts() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: authUser, isLoading: authLoading } = useAuth();
  const { data: products, isLoading: productsLoading } = useAdminProducts();
  const { data: categories, isLoading: categoriesLoading } = useMainCategories();
  const toggleProductStatus = useToggleProductStatus();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<AdminProduct | null>(null);

  // Redirect if not authenticated or not an admin
  if (!authLoading && (!authUser || !authUser.isAdmin)) {
    router.navigate({ to: '/admin/login' });
    return null;
  }

  // Filter products
  const filteredProducts = useMemo(() => {
    return products?.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());

      const category = categories?.find((c: AdminCategory) => c.id === product.category_id);
      const matchesMainCategory = selectedMainCategory === 'all' ||
        (!category?.parent_id && category.name_ar === selectedMainCategory) ||
        (category?.parent_id && categories?.find((c: AdminCategory) => c.id === category.parent_id)?.name_ar === selectedMainCategory);

      const matchesSubCategory = !selectedSubCategory || product.subcategory_id === selectedSubCategory;

      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && product.is_active) ||
        (filterStatus === 'inactive' && !product.is_active);

      return matchesSearch && matchesMainCategory && matchesSubCategory && matchesStatus;
    }) || [];
  }, [products, categories, searchQuery, selectedMainCategory, selectedSubCategory, filterStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Reset pagination when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedMainCategory, selectedSubCategory, filterStatus]);

  // Get subcategories for selected main category
  const selectedMainCategoryObj = categories?.find((c: AdminCategory) => c.name_ar === selectedMainCategory);
  const subCategoriesForMain = selectedMainCategoryObj
    ? categories?.filter((c: AdminCategory) => c.parent_id === selectedMainCategoryObj.id) || []
    : [];

  // Reset subcategory when main category changes
  useMemo(() => {
    if (selectedMainCategory === 'all') {
      setSelectedSubCategory(null);
    }
  }, [selectedMainCategory]);

  // Get main category name
  const getMainCategoryName = (categoryId: string) => {
    const category = categories?.find((c: AdminCategory) => c.id === categoryId);
    if (!category) return '—';
    if (!category.parent_id) return category.name_ar;
    const parentCategory = categories?.find((c: AdminCategory) => c.id === category.parent_id);
    return parentCategory?.name_ar || '—';
  };

  // Get subcategory name
  const getSubcategoryName = (subcategoryId: string | null) => {
    if (!subcategoryId) return '—';
    const subCategory = categories?.find((c: AdminCategory) => c.id === subcategoryId);
    return subCategory?.name_ar || '—';
  };

  // Handle toggle status
  const handleToggleStatus = async (product: AdminProduct) => {
    try {
      await toggleProductStatus.mutateAsync({
        id: product.id,
        is_active: !product.is_active,
      });
      toast.success(
        product.is_active ? 'تم إخفاء المنتج بنجاح' : 'تم إظهار المنتج بنجاح'
      );
    } catch (error: any) {
      toast.error('فشل تغيير حالة المنتج');
    }
  };

  // Handle edit
  const handleEdit = (product: AdminProduct) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDelete = async (product: AdminProduct) => {
    setProductToDelete(product);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('products').delete().eq('id', productToDelete.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('تم حذف المنتج بنجاح');
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
    } catch (error: any) {
      toast.error('فشل حذف المنتج');
    }
  };

  // Handle add new product
  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedMainCategory('all');
    setSelectedSubCategory(null);
    setFilterStatus('all');
  };

  const hasActiveFilters = searchQuery || selectedMainCategory !== 'all' || selectedSubCategory !== null || filterStatus !== 'all';

  // Show loading state
  if (authLoading || productsLoading || categoriesLoading) {
    return (
      <AdminLayout currentPage="/admin/products">
        <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0]">
          <Loader2 className="h-8 w-8 animate-spin text-[#5E6B2F]" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="/admin/products">
      <div className="space-y-4 sm:space-y-6 sm:p-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#5E6B2F] tracking-tight">المنتجات</h1>
          <p className="text-[#77796D] font-medium">إدارة المنتجات والمخزون</p>
        </div>

        {/* Add Product Button */}
        <Button
          onClick={handleAddProduct}
          className="gap-2 bg-[#5E6B2F] hover:bg-[#5E6B2F]/90 text-white rounded-xl shadow-md hover:shadow-lg transition-all w-full sm:w-auto mb-4"
        >
          <Plus className="h-4 w-4" />
          <span>إضافة منتج</span>
        </Button>

        {/* Search & Filters - Desktop */}
        <div className="hidden sm:flex flex-wrap gap-3 sm:gap-4 bg-white rounded-xl border border-[#5E6B2F]/20 p-3 sm:p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1 w-full">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5E6B2F]" />
              <input
                type="text"
                placeholder="ابحث بالاسم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 rounded-lg border border-[#5E6B2F]/30 bg-[#F5F5F0] text-[#282A18] placeholder:text-[#77796D] focus:outline-none focus:ring-2 focus:ring-[#5E6B2F]/30 focus:border-[#5E6B2F] transition-all text-sm font-medium shadow-sm hover:shadow-md"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedMainCategory} onValueChange={setSelectedMainCategory}>
              <SelectTrigger className="flex-1 min-w-[140px] border-[#5E6B2F]/30 bg-[#F5F5F0]">
                <SelectValue placeholder="كل التصنيفات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل التصنيفات</SelectItem>
                {categories?.filter((cat: AdminCategory) => !cat.parent_id).map((mainCat) => (
                  <SelectItem key={mainCat.id} value={mainCat.name_ar}>{mainCat.name_ar}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Subcategory Filter - Only show when main category is selected */}
            {selectedMainCategory !== 'all' && (
              <Select value={selectedSubCategory || 'all'} onValueChange={(value) => setSelectedSubCategory(value === 'all' ? null : value)}>
                <SelectTrigger className="flex-1 min-w-[140px] border-[#5E6B2F]/30 bg-[#F5F5F0]">
                  <SelectValue placeholder="كل التصنيفات الفرعية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل التصنيفات الفرعية</SelectItem>
                  {subCategoriesForMain.map((subCat) => (
                    <SelectItem key={subCat.id} value={subCat.id}>{subCat.name_ar}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Status Filter */}
            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as 'all' | 'active' | 'inactive')}>
              <SelectTrigger className="flex-1 min-w-[120px] border-[#5E6B2F]/30 bg-[#F5F5F0]">
                <SelectValue placeholder="كل الحالات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الحالات</SelectItem>
                <SelectItem value="active">ظاهر</SelectItem>
                <SelectItem value="inactive">مخفي</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search & Filters - Mobile */}
        <div className="sm:hidden space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5E6B2F]" />
            <input
              type="text"
              placeholder="ابحث بالاسم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 rounded-lg border border-[#5E6B2F]/30 bg-[#F5F5F0] text-[#282A18] placeholder:text-[#77796D] focus:outline-none focus:ring-2 focus:ring-[#5E6B2F]/30 focus:border-[#5E6B2F] transition-all text-sm font-medium shadow-sm hover:shadow-md"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-3">
            <Select value={selectedMainCategory} onValueChange={setSelectedMainCategory}>
              <SelectTrigger className="w-full border-[#5E6B2F]/30 bg-[#F5F5F0]">
                <SelectValue placeholder="كل التصنيفات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل التصنيفات</SelectItem>
                {categories?.filter((cat: AdminCategory) => !cat.parent_id).map((mainCat) => (
                  <SelectItem key={mainCat.id} value={mainCat.name_ar}>{mainCat.name_ar}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedMainCategory !== 'all' && (
              <Select value={selectedSubCategory || 'all'} onValueChange={(value) => setSelectedSubCategory(value === 'all' ? null : value)}>
                <SelectTrigger className="w-full border-[#5E6B2F]/30 bg-[#F5F5F0]">
                  <SelectValue placeholder="كل التصنيفات الفرعية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل التصنيفات الفرعية</SelectItem>
                  {subCategoriesForMain.map((subCat) => (
                    <SelectItem key={subCat.id} value={subCat.id}>{subCat.name_ar}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as 'all' | 'active' | 'inactive')}>
              <SelectTrigger className="w-full border-[#5E6B2F]/30 bg-[#F5F5F0]">
                <SelectValue placeholder="كل الحالات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الحالات</SelectItem>
                <SelectItem value="active">ظاهر</SelectItem>
                <SelectItem value="inactive">مخفي</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                onClick={resetFilters}
                variant="outline"
                className="w-full gap-2 border-[#5E6B2F]/30 text-[#5E6B2F]"
              >
                <X className="h-4 w-4" />
                <span>إعادة تعيين</span>
              </Button>
            )}
          </div>
        </div>

        {/* Products List */}
        {paginatedProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-[#5E6B2F]/10">
            <Package className="h-12 w-12 text-[#77796D] mx-auto mb-4" />
            <p className="text-[#77796D]">
              {hasActiveFilters ? 'لا توجد منتجات تطابق البحث' : 'لا توجد منتجات'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block bg-white rounded-xl border border-[#5E6B2F]/20 overflow-hidden shadow-sm">
              <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-[#F5F5F0] border-b border-[#5E6B2F]/20 font-semibold text-sm text-[#282A18]">
                <div className="col-span-2 text-center">الإجراءات</div>
                <div className="col-span-1">الحالة</div>
                <div className="col-span-1">السعر</div>
                <div className="col-span-2">التصنيف الفرعي</div>
                <div className="col-span-2">التصنيف الرئيسي</div>
                <div className="col-span-4">المنتج</div>
              </div>

              <div className="divide-y divide-[#5E6B2F]/10">
                {paginatedProducts.map((product) => {
                  const mainCategoryName = getMainCategoryName(product.category_id);
                  const subCategoryName = getSubcategoryName(product.subcategory_id);

                  return (
                    <div key={product.id} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-[#F5F5F0]/50 transition-colors items-center">
                      {/* Actions */}
                      <div className="col-span-2 flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                          title="تعديل"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(product)}
                          className="p-2 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
                          title={product.is_active ? 'إخفاء' : 'إظهار'}
                        >
                          {product.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Status */}
                      <div className="col-span-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          product.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {product.is_active ? (
                            <>
                              <Eye className="h-3 w-3" />
                              <span>نشط</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3" />
                              <span>مخفي</span>
                            </>
                          )}
                        </span>
                      </div>

                      {/* Price */}
                      <div className="col-span-1 font-bold text-[#5E6B2F] text-sm">{product.price} ر.س</div>

                      {/* Sub Category */}
                      <div className="col-span-2 text-sm text-[#77796D] truncate">{subCategoryName}</div>

                      {/* Main Category */}
                      <div className="col-span-2 text-sm text-[#282A18] truncate">{mainCategoryName || '—'}</div>

                      {/* Product */}
                      <div className="col-span-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#F5F5F0] flex-shrink-0">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-5 w-5 text-[#77796D]" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-[#282A18] text-sm truncate">{product.name}</p>
                          <p className="text-xs text-[#77796D] truncate">{product.description || 'لا يوجد وصف'}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile Compact Cards */}
            <div className="sm:hidden space-y-3">
              {paginatedProducts.map((product) => {
                const mainCategoryName = getMainCategoryName(product.category_id);
                const subCategoryName = getSubcategoryName(product.subcategory_id);

                return (
                  <div key={product.id} className="bg-white rounded-xl border border-[#5E6B2F]/10 p-3 shadow-sm">
                    {/* Top Row: Name + Status + Price */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[#282A18] text-sm line-clamp-2">{product.name}</h3>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                          product.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {product.is_active ? 'نشط' : 'مخفي'}
                        </span>
                        <span className="font-bold text-[#5E6B2F] text-sm">{product.price} ر.س</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-[#77796D] mb-3 line-clamp-1">{product.description || 'لا يوجد وصف'}</p>

                    {/* Image + Categories */}
                    <div className="flex gap-3 mb-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#F5F5F0] flex-shrink-0">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-5 w-5 text-[#77796D]" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <div className="flex items-center gap-2 text-xs text-[#77796D]">
                          <span>{mainCategoryName || '—'}</span>
                          {subCategoryName && <span>• {subCategoryName}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-center gap-2 pt-2 border-t border-[#5E6B2F]/10">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(product)}
                        className="p-2 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
                      >
                        {product.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white rounded-xl border border-[#5E6B2F]/20 shadow-sm">
              <div className="text-xs sm:text-sm text-[#77796D]">
                عرض {Math.min((currentPage - 1) * itemsPerPage + 1, filteredProducts.length)} - {Math.min(currentPage * itemsPerPage, filteredProducts.length)} من {filteredProducts.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-[#5E6B2F]/30 hover:bg-[#5E6B2F]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="text-sm">السابق</span>
                </button>
                <span className="text-sm text-[#282A18] font-medium min-w-[60px] text-center">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-[#5E6B2F]/30 hover:bg-[#5E6B2F]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="text-sm">التالي</span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#77796D]">عرض:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="px-2 py-1 rounded-lg border border-[#5E6B2F]/30 bg-white text-[#282A18] text-xs focus:outline-none focus:ring-2 focus:ring-[#5E6B2F]/30"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </>
        )}

        {/* Product Modal */}
        <ProductModal
          open={isModalOpen}
          onClose={handleModalClose}
          product={selectedProduct}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                تأكيد الحذف
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-[#282A18]">
                هل أنت متأكد من حذف المنتج <span className="font-bold">"{productToDelete?.name}"</span>؟
              </p>
              <p className="text-sm text-[#77796D] mt-2">لا يمكن التراجع عن هذا الإجراء.</p>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setProductToDelete(null);
                }}
                className="border-[#5E6B2F]/30 text-[#5E6B2F]"
              >
                إلغاء
              </Button>
              <Button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                حذف
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
