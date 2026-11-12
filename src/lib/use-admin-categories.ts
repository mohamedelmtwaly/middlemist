import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient } from './supabase';

export interface AdminCategory {
  id: string;
  name_ar: string;
  name_en: string | null;
  slug: string | null;
  is_active: boolean;
  sort_order: number;
  image_url: string | null;
  parent_id: string | null;
}

export interface CategoryFormData {
  name_ar: string;
  name_en: string;
  is_active: boolean;
  image_url: string | null;
  imageFile?: File;
  parent_id: string | null;
}

/**
 * رفع صورة تصنيف إلى Supabase Storage
 */
export async function uploadCategoryImage(file: File): Promise<string> {
  const supabase = getSupabaseClient();

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('يجب أن يكون الملف صورة (JPEG, PNG, WebP, GIF)');
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('حجم الصورة يجب أن يكون أقل من 5MB');
  }

  // Generate unique filename
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const extension = file.name.split('.').pop();
  const filename = `category-${timestamp}-${random}.${extension}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(filename, file, {
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    throw error;
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(filename);

  return publicUrl;
}

export function useAdminCategories() {
  return useQuery({
    queryKey: ['admin-categories'],
    queryFn: async (): Promise<AdminCategory[]> => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useMainCategories() {
  return useQuery({
    queryKey: ['admin-main-categories'],
    queryFn: async (): Promise<AdminCategory[]> => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .filter('parent_id', 'is', null)
        .order('sort_order', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCategoryProductCount() {
  return useQuery({
    queryKey: ['category-product-count'],
    queryFn: async () => {
      const supabase = getSupabaseClient();
      
      // Get all categories
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('id, parent_id');

      if (catError) {
        throw catError;
      }

      // Get all products
      const { data: products, error: prodError } = await supabase
        .from('products')
        .select('category_id')
        .eq('is_active', true);

      if (prodError) {
        throw prodError;
      }

      // Count products per category (by category_id)
      const counts: Record<string, number> = {};
      products?.forEach((product) => {
        const key = product.category_id;
        counts[key] = (counts[key] || 0) + 1;
      });

      // For main categories, add subcategory counts
      const mainCategories = categories?.filter((c) => !c.parent_id) || [];
      mainCategories.forEach((mainCat) => {
        const subCategories = categories?.filter((c) => c.parent_id === mainCat.id) || [];
        let totalCount = counts[mainCat.id] || 0;
        subCategories.forEach((subCat) => {
          totalCount += counts[subCat.id] || 0;
        });
        counts[mainCat.id] = totalCount;
      });

      return counts;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CategoryFormData & { imageFile?: File }) => {
      const supabase = getSupabaseClient();

      // Upload image if provided
      let imageUrl = data.image_url;
      if (data.imageFile) {
        imageUrl = await uploadCategoryImage(data.imageFile);
      }

      // Get the highest sort_order
      const { data: categories } = await supabase
        .from('categories')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1);

      const newSortOrder = categories && categories.length > 0
        ? ((categories[0]?.sort_order) || 0) + 1
        : 1;

      // Generate slug from Arabic name
      const slug = data.name_ar
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-\u0600-\u06FF]/g, '');

      // Insert category
      const { data: newCategory, error } = await supabase
        .from('categories')
        .insert({
          name_ar: data.name_ar,
          name_en: data.name_en || null,
          slug,
          is_active: data.is_active,
          sort_order: newSortOrder,
          image_url: imageUrl || null,
          parent_id: data.parent_id || null,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return newCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['category-product-count'] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CategoryFormData & { imageFile?: File } }) => {
      const supabase = getSupabaseClient();

      // Upload new image if provided
      let imageUrl = data.image_url;
      if (data.imageFile) {
        imageUrl = await uploadCategoryImage(data.imageFile);
      }

      // Generate slug from Arabic name
      const slug = data.name_ar
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-\u0600-\u06FF]/g, '');

      // Update category
      const { data: updatedCategory, error } = await supabase
        .from('categories')
        .update({
          name_ar: data.name_ar,
          name_en: data.name_en || null,
          slug,
          is_active: data.is_active,
          image_url: imageUrl || null,
          parent_id: data.parent_id || null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return updatedCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['category-product-count'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseClient();

      // Check if category has subcategories
      const { data: subcategories, error: subCheckError } = await supabase
        .from('categories')
        .select('id')
        .eq('parent_id', id);

      if (subCheckError) {
        throw subCheckError;
      }

      if (subcategories && subcategories.length > 0) {
        throw new Error(`لا يمكن حذف هذا التصنيف لأنه لديه ${subcategories.length} تصنيفات فرعية`);
      }

      // Check if category has products
      const { data: products, error: checkError } = await supabase
        .from('products')
        .select('id')
        .eq('category_id', id);

      if (checkError) {
        throw checkError;
      }

      if (products && products.length > 0) {
        throw new Error(`لا يمكن حذف هذا التصنيف لأنه مرتبط بـ ${products.length} منتج`);
      }

      // Delete category
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['category-product-count'] });
    },
  });
}

export function useToggleCategoryStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const supabase = getSupabaseClient();

      const { data: updatedCategory, error } = await supabase
        .from('categories')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return updatedCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['category-product-count'] });
    },
  });
}
