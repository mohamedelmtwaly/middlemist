import { useState, useEffect } from 'react';
import { useAdminCategories as useMainCategories, type AdminCategory } from '@/lib/use-admin-categories';
import { useCreateProduct, useUpdateProduct, type ProductFormData, type AdminProduct } from '@/lib/use-admin-products';
import { APPROVED_OCCASIONS } from '@/lib/store-data';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Upload, X, Package } from 'lucide-react';
import { toast } from 'sonner';

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  product?: AdminProduct | null;
}

export function ProductModal({ open, onClose, product }: ProductModalProps) {
  const { data: categories } = useMainCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    category_id: '',
    subcategory_id: null,
    category: '',
    price: 0,
    description: '',
    image_url: '',
    is_active: true,
    occasions: [],
    display_sections: [],
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category_id: product.category_id,
        subcategory_id: product.subcategory_id || null,
        category: product.category,
        price: product.price,
        description: product.description || '',
        image_url: product.image_url || '',
        is_active: product.is_active,
        occasions: product.occasions || [],
        display_sections: product.display_sections || [],
      });
      setImagePreview(product.image_url || '');
    } else {
      setFormData({
        name: '',
        category_id: '',
        subcategory_id: null,
        category: '',
        price: 0,
        description: '',
        image_url: '',
        is_active: true,
        occasions: [],
        display_sections: [],
      });
      setImagePreview('');
      setImageFile(null);
    }
    setErrors({});
  }, [product, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('يجب أن يكون الملف صورة');
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('حجم الصورة يجب أن يكون أقل من 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData({ ...formData, image_url: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'يجب كتابة اسم المنتج';
    }

    if (!formData.category_id) {
      newErrors.category = 'يجب اختيار التصنيف';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'يجب كتابة سعر أكبر من صفر';
    }

    if (!imageFile && !formData.image_url) {
      newErrors.image = 'يجب رفع صورة المنتج';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      setIsSubmitting(false);
      return;
    }

    setErrors({});

    try {
      if (product) {
        await updateProduct.mutateAsync({
          id: product.id,
          data: { ...formData, imageFile: imageFile || undefined },
        });
        toast.success('تم تحديث المنتج بنجاح');
      } else {
        await createProduct.mutateAsync({
          ...formData,
          imageFile: imageFile || undefined,
        });
        toast.success('تمت إضافة المنتج بنجاح');
      }
      onClose();
    } catch (error: any) {
      toast.error(product ? 'فشل تحديث المنتج' : 'فشلت إضافة المنتج');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    const category = categories?.find((c: AdminCategory) => c.id === categoryId);
    setFormData({
      ...formData,
      category_id: categoryId,
      subcategory_id: null, // Reset subcategory when main category changes
      category: category?.name_ar || '',
    });
  };

  const handleSubcategoryChange = (subcategoryId: string) => {
    setFormData({
      ...formData,
      subcategory_id: subcategoryId === 'all' ? null : subcategoryId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) {
        setErrors({});
      }
      onClose();
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'تعديل المنتج' : 'إضافة منتج جديد'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-[#282A18] mb-2">صورة المنتج *</label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-[#5E6B2F]/20">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-lg border-2 border-dashed border-[#5E6B2F]/30 flex items-center justify-center bg-[#F5F5F0]">
                  <Package className="h-8 w-8 text-[#77796D]" />
                </div>
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="product-image"
                />
                <label
                  htmlFor="product-image"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#5E6B2F] text-white rounded-lg hover:bg-[#5E6B2F]/90 cursor-pointer transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  <span>رفع صورة</span>
                </label>
                <p className="text-xs text-[#77796D] mt-1">PNG, JPG حتى 5MB</p>
                {errors.image && <p className="text-xs text-red-500 mt-1">{errors.image}</p>}
              </div>
            </div>
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-[#282A18] mb-2">اسم المنتج *</label>
            <Input
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              placeholder="أدخل اسم المنتج"
              required
              className={`border-[#5E6B2F]/30 ${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-[#282A18] mb-2">التصنيف الرئيسي *</label>
            <Select value={formData.category_id} onValueChange={(value) => {
              handleCategoryChange(value);
              if (errors.category) setErrors({ ...errors, category: '' });
            }} required>
              <SelectTrigger className={`border-[#5E6B2F]/30 ${errors.category ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="اختر التصنيف الرئيسي" />
              </SelectTrigger>
              <SelectContent>
                {categories?.filter(cat => !cat.parent_id).map((mainCategory) => (
                  <SelectItem key={mainCategory.id} value={mainCategory.id} className="font-semibold text-[#282A18]">
                    {mainCategory.name_ar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
          </div>

          {/* Subcategory */}
          {formData.category_id && (
            <div>
              <label className="block text-sm font-medium text-[#282A18] mb-2">التصنيف الفرعي (اختياري)</label>
              {(() => {
                const selectedMainCategory = categories?.find((c: AdminCategory) => c.id === formData.category_id);
                const subCategories = selectedMainCategory
                  ? categories?.filter((c: AdminCategory) => c.parent_id === selectedMainCategory.id)
                  : [];
                
                if (subCategories && subCategories.length > 0) {
                  return (
                    <Select value={formData.subcategory_id || 'all'} onValueChange={handleSubcategoryChange}>
                      <SelectTrigger className="border-[#5E6B2F]/30">
                        <SelectValue placeholder="اختر التصنيف الفرعي" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">بدون تصنيف فرعي</SelectItem>
                        {subCategories.map((subCategory) => (
                          <SelectItem key={subCategory.id} value={subCategory.id} className="pr-8 text-[#77796D]">
                            ↳ {subCategory.name_ar}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  );
                } else {
                  return (
                    <div className="text-sm text-[#77796D] bg-[#F5F5F0] rounded-lg p-3 border border-[#5E6B2F]/20">
                      لا توجد تصنيفات فرعية لهذا التصنيف الرئيسي
                    </div>
                  );
                }
              })()}
            </div>
          )}

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-[#282A18] mb-2">السعر (ر.س) *</label>
            <Input
              type="number"
              value={formData.price || ''}
              onChange={(e) => {
                setFormData({ ...formData, price: parseFloat(e.target.value) || 0 });
                if (errors.price) setErrors({ ...errors, price: '' });
              }}
              placeholder="أدخل السعر"
              min="0"
              step="0.01"
              required
              className={`border-[#5E6B2F]/30 ${errors.price ? 'border-red-500' : ''}`}
            />
            {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[#282A18] mb-2">الوصف</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="أدخل وصف المنتج"
              rows={3}
              className="border-[#5E6B2F]/30"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-[#282A18] mb-2">الحالة</label>
            <Select
              value={formData.is_active ? 'active' : 'inactive'}
              onValueChange={(value) => setFormData({ ...formData, is_active: value === 'active' })}
            >
              <SelectTrigger className="border-[#5E6B2F]/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">مخفي</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Homepage Sections */}
          <div className="pt-4 border-t border-[#5E6B2F]/10">
            <h3 className="text-base font-semibold text-[#282A18] mb-2">الظهور في أقسام الصفحة الرئيسية</h3>
            <p className="text-xs text-[#77796D] mb-4">اختر الأقسام التي تريد عرض هذا المنتج فيها على الصفحة الرئيسية (اختياري)</p>

            {/* حكايات من متجرنا */}
            <div className="mb-4 p-4 bg-[#F5F5F0]/50 rounded-xl border border-[#5E6B2F]/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#5E6B2F]/10 flex items-center justify-center">
                    <span className="text-sm">📖</span>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-[#282A18]">حكايات من متجرنا</label>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const currentSections = formData.display_sections || [];
                    if (currentSections.includes('spotlight')) {
                      setFormData({
                        ...formData,
                        display_sections: currentSections.filter((s) => s !== 'spotlight'),
                      });
                    } else {
                      setFormData({
                        ...formData,
                        display_sections: [...currentSections, 'spotlight'],
                      });
                    }
                  }}
                  className={`relative w-12 h-6 rounded-full transition-all ${
                    formData.display_sections?.includes('spotlight')
                      ? 'bg-[#5E6B2F]'
                      : 'bg-[#5E6B2F]/30'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${
                      formData.display_sections?.includes('spotlight') ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-[#77796D] mr-10">قسم خاص لعرض منتجات مميزة ومختارة بعناية لتظهر في أعلى الصفحة الرئيسية</p>
            </div>

            {/* تسوق حسب المناسبة */}
            <div className="mb-4 p-4 bg-[#F5F5F0]/50 rounded-xl border border-[#5E6B2F]/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#8A9A5B]/10 flex items-center justify-center">
                  <span className="text-sm">🎉</span>
                </div>
                <div>
                  <label className="text-sm font-semibold text-[#282A18]">تسوق حسب المناسبة</label>
                </div>
              </div>
              <p className="text-xs text-[#77796D] mb-3 mr-10">اختر المناسبات التي يناسبها المنتج ليظهر في قسم تسوق حسب المناسبة</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {APPROVED_OCCASIONS.map((occasion) => (
                  <button
                    key={occasion}
                    type="button"
                    onClick={() => {
                      const currentOccasions = formData.occasions || [];
                      if (currentOccasions.includes(occasion)) {
                        setFormData({
                          ...formData,
                          occasions: currentOccasions.filter((o) => o !== occasion),
                        });
                      } else {
                        setFormData({
                          ...formData,
                          occasions: [...currentOccasions, occasion],
                        });
                      }
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all text-center border-2 ${
                      formData.occasions?.includes(occasion)
                        ? 'bg-[#8A9A5B] text-white border-[#8A9A5B]'
                        : 'bg-white text-[#77796D] border-[#8A9A5B]/20 hover:border-[#8A9A5B]/40'
                    }`}
                  >
                    {occasion}
                  </button>
                ))}
              </div>
            </div>

            {/* تنسيقات الهدايا */}
            <div className="p-4 bg-[#F5F5F0]/50 rounded-xl border border-[#5E6B2F]/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#B5655C]/10 flex items-center justify-center">
                    <span className="text-sm">🎁</span>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-[#282A18]">تنسيقات الهدايا</label>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const currentSections = formData.display_sections || [];
                    if (currentSections.includes('gifts')) {
                      setFormData({
                        ...formData,
                        display_sections: currentSections.filter((s) => s !== 'gifts'),
                      });
                    } else {
                      setFormData({
                        ...formData,
                        display_sections: [...currentSections, 'gifts'],
                      });
                    }
                  }}
                  className={`relative w-12 h-6 rounded-full transition-all ${
                    formData.display_sections?.includes('gifts')
                      ? 'bg-[#B5655C]'
                      : 'bg-[#B5655C]/30'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${
                      formData.display_sections?.includes('gifts') ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-[#77796D] mr-10">قسم يعرض الهدايا والتنسيقات المتنوعة للهدايا والبوكسات</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setErrors({});
                onClose();
              }}
              className="border-[#5E6B2F]/30 text-[#282A18]"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#5E6B2F] hover:bg-[#5E6B2F]/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  جاري الحفظ...
                </>
              ) : (
                product ? 'تحديث' : 'إضافة'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
