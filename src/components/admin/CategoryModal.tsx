import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import type { AdminCategory, CategoryFormData } from '@/lib/use-admin-categories';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData & { imageFile?: File }) => Promise<void>;
  category?: AdminCategory;
  mainCategories?: AdminCategory[];
  defaultParentId?: string;
  isSubmitting?: boolean;
}

export function CategoryModal({
  isOpen,
  onClose,
  onSubmit,
  category,
  mainCategories,
  defaultParentId,
  isSubmitting = false,
}: CategoryModalProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name_ar: '',
    name_en: '',
    is_active: true,
    image_url: null,
    parent_id: null,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      setFormData({
        name_ar: category.name_ar,
        name_en: category.name_en || '',
        is_active: category.is_active,
        image_url: category.image_url,
        parent_id: category.parent_id,
      });
      setImagePreview(category.image_url);
    } else {
      setFormData({
        name_ar: '',
        name_en: '',
        is_active: true,
        image_url: null,
        parent_id: defaultParentId || null,
      });
      setImagePreview(null);
    }
  }, [category, defaultParentId, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image_url: null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name_ar.trim()) {
      toast.error('يرجى إدخال اسم التصنيف بالعربية');
      return;
    }
    // Only include image for main categories (when parent_id is null)
    const isMainCategory = !category && !formData.parent_id || (category && !category.parent_id);
    await onSubmit({ ...formData, imageFile: isMainCategory ? imageFile : undefined });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto w-[95vw]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#282A18]">
            {category ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Parent Category Selection - Only show when adding subcategory */}
          {!category && defaultParentId && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#282A18]">التصنيف الأب</label>
              <div className="text-sm text-[#77796D] bg-[#F5F5F0] rounded-lg p-3 border border-[#5E6B2F]/20">
                {mainCategories?.find((cat) => cat.id === defaultParentId)?.name_ar || 'غير محدد'}
              </div>
            </div>
          )}

          {/* Parent Category Selection - When editing subcategory */}
          {category && category.parent_id && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#282A18]">التصنيف الأب</label>
              <Select
                value={formData.parent_id || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, parent_id: value || null }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر التصنيف الأب" />
                </SelectTrigger>
                <SelectContent>
                  {mainCategories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name_ar}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Arabic Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#282A18]">اسم التصنيف بالعربية *</label>
            <Input
              value={formData.name_ar}
              onChange={(e) => setFormData(prev => ({ ...prev, name_ar: e.target.value }))}
              placeholder="مثال: باقات الورد"
              className="border-[#5E6B2F]/30"
              required
            />
          </div>

          {/* English Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#282A18]">اسم التصنيف بالإنجليزية</label>
            <Input
              value={formData.name_en}
              onChange={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
              placeholder="مثال: Rose Bouquets"
              className="border-[#5E6B2F]/30"
            />
          </div>

          {/* Image Upload - Only for main categories */}
          {(!category && !formData.parent_id) || (category && !category.parent_id) ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#282A18]">صورة التصنيف</label>
              {imagePreview ? (
                <div className="relative w-full h-36 sm:h-48 rounded-lg overflow-hidden border border-[#5E6B2F]/20">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 left-2"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-[#5E6B2F]/30 rounded-lg p-4 sm:p-6 text-center hover:border-[#5E6B2F]/50 transition-colors">
                  <input
                    type="file"
                    id="category-image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="category-image"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-[#5E6B2F]" />
                    <span className="text-xs sm:text-sm text-[#77796D]">اضغط لرفع صورة</span>
                    <span className="text-xs text-[#77796D]">JPEG, PNG, WebP (حد أقصى 5MB)</span>
                  </label>
                </div>
              )}
            </div>
          ) : null}

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#282A18]">الحالة</label>
            <Select
              value={formData.is_active ? 'active' : 'inactive'}
              onValueChange={(value) => setFormData(prev => ({ ...prev, is_active: value === 'active' }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 flex-col sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              className="bg-[#5E6B2F] hover:bg-[#5E6B2F]/90 w-full sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  جاري الحفظ...
                </>
              ) : (
                category ? 'حفظ التغييرات' : 'إضافة التصنيف'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
