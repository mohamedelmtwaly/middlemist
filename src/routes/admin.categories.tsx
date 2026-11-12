import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/use-auth';
import {
  useAdminCategories,
  useMainCategories,
  useCategoryProductCount,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  type AdminCategory,
  type CategoryFormData,
} from '@/lib/use-admin-categories';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { CategoryModal } from '@/components/admin/CategoryModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, Plus, Folder, Edit, Trash2, ChevronDown, ChevronUp, Leaf, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import bridalNatural from '@/assets/products/bridal-natural.jpg';
import redRose from '@/assets/products/red-rose.jpg';
import birthday from '@/assets/products/birthday.jpg';
import giftBoxRose from '@/assets/products/gift-box-rose.jpg';
import naturalVase from '@/assets/products/natural-vase.jpg';
import royalStand from '@/assets/products/royal-stand.jpg';
import flowerBasket from '@/assets/products/flower-basket.jpg';
import roseChocolate from '@/assets/products/rose-chocolate.jpg';
import rosesTeddy from '@/assets/products/roses-teddy.jpg';
import heliumBalloons from '@/assets/products/helium-balloons.jpg';
import teddyMedium from '@/assets/products/teddy-medium.jpg';
import printedTags from '@/assets/products/printed-tags.jpg';

const defaultCategoryImages: Record<string, string> = {
  'مسكات العروس': bridalNatural,
  'باقات الورد': redRose,
  'باقات المناسبات': birthday,
  'بوكسات الهدايا': giftBoxRose,
  'الفازات': naturalVase,
  'الأستاندات': royalStand,
  'سلات الورد': flowerBasket,
  'الورد والشوكولاتة': roseChocolate,
  'باقات الورد والهدايا': rosesTeddy,
  'البالونات': heliumBalloons,
  'الدباديب': teddyMedium,
  'الطباعة والإضافات': printedTags,
};

export const Route = createFileRoute('/admin/categories')({
  component: AdminCategories,
});

type FilterType = 'all' | 'main' | 'sub';

function AdminCategories() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: authUser, isLoading: authLoading } = useAuth();
  const { data: categories, isLoading: categoriesLoading } = useAdminCategories();
  const { data: mainCategories } = useMainCategories();
  const { data: productCounts } = useCategoryProductCount();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | undefined>();
  const [defaultParentId, setDefaultParentId] = useState<string | undefined>();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<AdminCategory | null>(null);

  // Redirect if not authenticated or not an admin
  if (!authLoading && (!authUser || !authUser.isAdmin)) {
    router.navigate({ to: '/admin/login' });
    return null;
  }

  if (authLoading || categoriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0]">
        <Loader2 className="h-8 w-8 animate-spin text-[#5E6B2F]" />
      </div>
    );
  }

  // Filter categories by search and type
  const filteredCategories = categories?.filter((category) => {
    const matchesSearch = category.name_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (category.name_en?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === 'all' ||
                       (filterType === 'main' && !category.parent_id) ||
                       (filterType === 'sub' && category.parent_id);
    return matchesSearch && matchesType;
  }) || [];

  // Separate main and subcategories
  const mainCategoriesList = filteredCategories.filter(c => !c.parent_id);
  const subCategoriesList = filteredCategories.filter(c => c.parent_id);

  // Group subcategories by parent
  const subCategoriesByParent = subCategoriesList.reduce((acc, sub) => {
    if (!acc[sub.parent_id!]) {
      acc[sub.parent_id!] = [];
    }
    acc[sub.parent_id!].push(sub);
    return acc;
  }, {} as Record<string, AdminCategory[]>);

  // Count subcategories for each main category
  const subCategoryCounts = mainCategoriesList.reduce((acc, main) => {
    acc[main.id] = subCategoriesByParent[main.id]?.length || 0;
    return acc;
  }, {} as Record<string, number>);

  // Handle delete
  const handleDelete = async (category: AdminCategory) => {
    setCategoryToDelete(category);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategory.mutateAsync(categoryToDelete.id);
      toast.success('تم حذف التصنيف بنجاح');
      setDeleteConfirmOpen(false);
      setCategoryToDelete(null);
    } catch (error: any) {
      toast.error('فشل حذف التصنيف');
    }
  };

  // Handle edit
  const handleEdit = (category: AdminCategory) => {
    setEditingCategory(category);
    setDefaultParentId(undefined);
    setIsModalOpen(true);
  };

  // Handle add main category
  const handleAddMainCategory = () => {
    setEditingCategory(undefined);
    setDefaultParentId(undefined);
    setIsModalOpen(true);
  };

  // Handle add subcategory
  const handleAddSubcategory = (parentId: string) => {
    setEditingCategory(undefined);
    setDefaultParentId(parentId);
    setIsModalOpen(true);
  };

  // Toggle category expansion
  const toggleExpand = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Handle modal submit
  const handleModalSubmit = async (data: CategoryFormData & { imageFile?: File }) => {
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, data });
        toast.success('تم تحديث التصنيف بنجاح');
      } else {
        await createCategory.mutateAsync(data);
        toast.success('تمت إضافة التصنيف بنجاح');
      }
      setIsModalOpen(false);
      setEditingCategory(undefined);
      setDefaultParentId(undefined);
    } catch (error: any) {
      toast.error(editingCategory ? 'فشل تحديث التصنيف' : 'فشلت إضافة التصنيف');
    }
  };

  return (
    <AdminLayout currentPage="/admin/categories">
      <div className="space-y-6 sm:p-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#5E6B2F]/10 flex items-center justify-center">
              <Leaf className="h-5 w-5 text-[#5E6B2F]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#282A18]">إدارة التصنيفات</h1>
              <p className="text-sm text-[#77796D]">إدارة التصنيفات الرئيسية والفرعية لمتجرك</p>
            </div>
          </div>
          <Button
            onClick={handleAddMainCategory}
            className="gap-2 bg-[#5E6B2F] hover:bg-[#5E6B2F]/90 text-white rounded-xl shadow-md hover:shadow-lg transition-all w-full sm:w-auto"
          >
            <Plus className="h-5 w-5" />
            <span>إضافة تصنيف رئيسي</span>
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5E6B2F]" />
            <Input
              placeholder="البحث في التصنيفات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 border-[#5E6B2F]/30 bg-[#F5F5F0]"
            />
          </div>
          <Select value={filterType} onValueChange={(value: FilterType) => setFilterType(value)}>
            <SelectTrigger className="w-full sm:w-[180px] border-[#5E6B2F]/30 bg-[#F5F5F0]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع التصنيفات</SelectItem>
              <SelectItem value="main">التصنيفات الرئيسية</SelectItem>
              <SelectItem value="sub">التصنيفات الفرعية</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Categories List */}
        {filteredCategories.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#5E6B2F]/10">
            <Folder className="h-12 w-12 text-[#77796D] mx-auto mb-4" />
            <p className="text-[#77796D]">
              {searchQuery ? 'لا توجد تصنيفات تطابق البحث' : 'لا توجد تصنيفات'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {mainCategoriesList.map((mainCategory) => {
              const subCategories = subCategoriesByParent[mainCategory.id] || [];
              const isExpanded = expandedCategories.has(mainCategory.id);
              const subCount = subCategoryCounts[mainCategory.id] || 0;

              return (
                <div key={mainCategory.id} className="space-y-3">
                  {/* Main Category Row */}
                  <div className="bg-white rounded-xl border border-[#5E6B2F]/10 p-3 sm:p-4 hover:shadow-sm transition-shadow">
                    {/* Mobile Layout */}
                    <div className="flex flex-col sm:hidden gap-3">
                      {/* Top row: Image + Name + Expand */}
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#F5F5F0] flex-shrink-0">
                          {(mainCategory.image_url || defaultCategoryImages[mainCategory.name_ar]) ? (
                            <img
                              src={mainCategory.image_url || defaultCategoryImages[mainCategory.name_ar]}
                              alt={mainCategory.name_ar}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Folder className="h-5 w-5 text-[#77796D]" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-bold text-[#282A18]">{mainCategory.name_ar}</h3>
                            <span className="px-1.5 py-0.5 bg-[#5E6B2F] text-white text-[10px] rounded-full flex-shrink-0">رئيسي</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-[#77796D]">
                            <span>{productCounts?.[mainCategory.id] || 0} منتج</span>
                            <span>•</span>
                            <span>{subCount} تصنيف فرعي</span>
                          </div>
                        </div>
                        {subCount > 0 && (
                          <button
                            onClick={() => toggleExpand(mainCategory.id)}
                            className="p-2 rounded-lg hover:bg-[#5E6B2F]/10 text-[#5E6B2F] transition-colors flex-shrink-0"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Bottom row: Actions */}
                      <div className="flex items-center justify-center gap-2 pt-2 border-t border-[#5E6B2F]/10">
                        <button
                          onClick={() => handleAddSubcategory(mainCategory.id)}
                          className="p-2 rounded-lg hover:bg-[#5E6B2F]/10 text-[#5E6B2F] transition-colors"
                          title="إضافة تصنيف فرعي"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(mainCategory)}
                          className="p-2 rounded-lg hover:bg-[#5E6B2F]/10 text-[#5E6B2F] transition-colors"
                          title="تعديل"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(mainCategory)}
                          className="p-2 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:flex items-center gap-4">
                      {/* Image */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#F5F5F0] flex-shrink-0">
                        {(mainCategory.image_url || defaultCategoryImages[mainCategory.name_ar]) ? (
                          <img
                            src={mainCategory.image_url || defaultCategoryImages[mainCategory.name_ar]}
                            alt={mainCategory.name_ar}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Folder className="h-6 w-6 text-[#77796D]" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-lg font-bold text-[#282A18]">{mainCategory.name_ar}</h3>
                          <span className="px-1.5 py-0.5 bg-[#5E6B2F] text-white text-[10px] rounded-full">رئيسي</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-[#77796D]">
                          <span>{productCounts?.[mainCategory.id] || 0} منتج</span>
                          <span>•</span>
                          <span>{subCount} تصنيف فرعي</span>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#5E6B2F]/10">
                        <div className={`w-2 h-2 rounded-full ${mainCategory.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span className="text-xs text-[#5E6B2F]">{mainCategory.is_active ? 'نشط' : 'غير نشط'}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleAddSubcategory(mainCategory.id)}
                          className="p-2 rounded-lg hover:bg-[#5E6B2F]/10 text-[#5E6B2F] transition-colors"
                          title="إضافة تصنيف فرعي"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(mainCategory)}
                          className="p-2 rounded-lg hover:bg-[#5E6B2F]/10 text-[#5E6B2F] transition-colors"
                          title="تعديل"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(mainCategory)}
                          className="p-2 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        {subCount > 0 && (
                          <button
                            onClick={() => toggleExpand(mainCategory.id)}
                            className="p-2 rounded-lg hover:bg-[#5E6B2F]/10 text-[#5E6B2F] transition-colors"
                            title={isExpanded ? 'إغلاق' : 'فتح'}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Subcategories */}
                  {isExpanded && subCategories.length > 0 && (
                    <div className="bg-[#F5F5F0]/50 rounded-xl border-r-4 border-[#5E6B2F]/30 p-2 sm:p-4 space-y-2 mr-0 sm:mr-4">
                      {subCategories.map((subCategory) => (
                        <div
                          key={subCategory.id}
                          className="bg-white rounded-lg p-2 sm:p-3 hover:shadow-sm transition-shadow"
                        >
                          {/* Mobile Layout */}
                          <div className="flex flex-col sm:hidden gap-2">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#F5F5F0] flex-shrink-0">
                                {(subCategory.image_url || defaultCategoryImages[subCategory.name_ar]) ? (
                                  <img
                                    src={subCategory.image_url || defaultCategoryImages[subCategory.name_ar]}
                                    alt={subCategory.name_ar}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Folder className="h-4 w-4 text-[#77796D]" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-semibold text-[#282A18] truncate">{subCategory.name_ar}</h4>
                                <p className="text-[10px] text-[#77796D]">
                                  {productCounts?.[subCategory.id] || 0} منتج
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-center gap-2 pt-2 border-t border-[#5E6B2F]/10">
                              <button
                                onClick={() => handleEdit(subCategory)}
                                className="p-2 rounded-lg hover:bg-[#5E6B2F]/10 text-[#5E6B2F] transition-colors"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(subCategory)}
                                className="p-2 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {/* Desktop Layout */}
                          <div className="hidden sm:flex items-center gap-3">
                            {/* Image */}
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#F5F5F0] flex-shrink-0">
                              {(subCategory.image_url || defaultCategoryImages[subCategory.name_ar]) ? (
                                <img
                                  src={subCategory.image_url || defaultCategoryImages[subCategory.name_ar]}
                                  alt={subCategory.name_ar}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Folder className="h-5 w-5 text-[#77796D]" />
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-base font-semibold text-[#282A18] truncate">{subCategory.name_ar}</h4>
                              <p className="text-xs text-[#77796D]">
                                {productCounts?.[subCategory.id] || 0} منتج
                              </p>
                            </div>

                            {/* Status */}
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#5E6B2F]/10">
                              <div className={`w-1.5 h-1.5 rounded-full ${subCategory.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                              <span className="text-xs text-[#5E6B2F]">{subCategory.is_active ? 'نشط' : 'غير نشط'}</span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => handleEdit(subCategory)}
                                className="p-1.5 rounded-lg hover:bg-[#5E6B2F]/10 text-[#5E6B2F] transition-colors"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(subCategory)}
                                className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Standalone subcategories (when filtering by sub only) */}
            {filterType === 'sub' && subCategoriesList.filter(c => !mainCategoriesList.find(m => m.id === c.parent_id)).map((subCategory) => (
              <div key={subCategory.id} className="bg-white rounded-xl border border-[#5E6B2F]/10 p-3 sm:p-4 hover:shadow-sm transition-shadow">
                {/* Mobile Layout */}
                <div className="flex flex-col sm:hidden gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#F5F5F0] flex-shrink-0">
                      {(subCategory.image_url || defaultCategoryImages[subCategory.name_ar]) ? (
                        <img
                          src={subCategory.image_url || defaultCategoryImages[subCategory.name_ar]}
                          alt={subCategory.name_ar}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Folder className="h-5 w-5 text-[#77796D]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-bold text-[#282A18]">{subCategory.name_ar}</h3>
                        <span className="px-1.5 py-0.5 bg-[#8A9A5B] text-white text-[10px] rounded-full flex-shrink-0">فرعي</span>
                      </div>
                      <p className="text-xs text-[#77796D]">
                        {productCounts?.[subCategory.id] || 0} منتج
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-2 border-t border-[#5E6B2F]/10">
                    <button
                      onClick={() => handleEdit(subCategory)}
                      className="p-2 rounded-lg hover:bg-[#5E6B2F]/10 text-[#5E6B2F] transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(subCategory)}
                      className="p-2 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#F5F5F0] flex-shrink-0">
                    {(subCategory.image_url || defaultCategoryImages[subCategory.name_ar]) ? (
                      <img
                        src={subCategory.image_url || defaultCategoryImages[subCategory.name_ar]}
                        alt={subCategory.name_ar}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Folder className="h-6 w-6 text-[#77796D]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-lg font-bold text-[#282A18]">{subCategory.name_ar}</h3>
                      <span className="px-1.5 py-0.5 bg-[#8A9A5B] text-white text-[10px] rounded-full">فرعي</span>
                    </div>
                    <p className="text-sm text-[#77796D]">
                      {productCounts?.[subCategory.id] || 0} منتج
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#5E6B2F]/10">
                    <div className={`w-2 h-2 rounded-full ${subCategory.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className="text-xs text-[#5E6B2F]">{subCategory.is_active ? 'نشط' : 'غير نشط'}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(subCategory)}
                      className="p-2 rounded-lg hover:bg-[#5E6B2F]/10 text-[#5E6B2F] transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(subCategory)}
                      className="p-2 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Category Modal */}
        <CategoryModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCategory(undefined);
            setDefaultParentId(undefined);
          }}
          onSubmit={handleModalSubmit}
          category={editingCategory}
          mainCategories={mainCategories}
          defaultParentId={defaultParentId}
          isSubmitting={createCategory.isPending || updateCategory.isPending}
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
                هل أنت متأكد من حذف التصنيف <span className="font-bold">"{categoryToDelete?.name_ar}"</span>؟
              </p>
              <p className="text-sm text-[#77796D] mt-2">لا يمكن التراجع عن هذا الإجراء.</p>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setCategoryToDelete(null);
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
