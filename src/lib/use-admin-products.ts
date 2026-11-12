import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient } from './supabase';

export interface AdminProduct {
  id: string;
  legacy_id: string | null;
  name: string;
  category: string;
  category_id: string;
  subcategory_id: string | null;
  price: number;
  image_url: string | null;
  description: string | null;
  is_active: boolean;
  occasions: string[] | null;
  display_sections: string[] | null;
  sort_order: number;
}

export interface Category {
  id: string;
  name_ar: string;
  parent_id: string | null;
}

export interface ProductFormData {
  name: string;
  category_id: string;
  subcategory_id: string | null;
  category: string;
  price: number;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  occasions: string[] | null;
  display_sections: string[] | null;
}

export function useAdminProducts() {
  return useQuery({
    queryKey: ['admin-products'],
    queryFn: async (): Promise<AdminProduct[]> => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('products')
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

export function useAdminCategories() {
  return useQuery({
    queryKey: ['admin-categories'],
    queryFn: async (): Promise<Category[]> => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('categories')
        .select('id, name_ar, parent_id')
        .order('sort_order', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export async function uploadProductImage(file: File): Promise<string> {
  const supabase = getSupabaseClient();

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('يجب أن يكون الملف صورة');
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('حجم الصورة يجب أن يكون أقل من 5MB');
  }

  // Generate unique filename
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const extension = file.name.split('.').pop();
  const filename = `${timestamp}-${random}.${extension}`;

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

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProductFormData & { imageFile?: File }) => {
      const supabase = getSupabaseClient();

      // Upload image if provided
      let imageUrl = data.image_url;
      if (data.imageFile) {
        imageUrl = await uploadProductImage(data.imageFile);
      }

      // Get the highest sort_order
      const { data: products } = await supabase
        .from('products')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1);

      const newSortOrder = products && products.length > 0
        ? ((products[0]?.sort_order) || 0) + 1
        : 1;

      // Insert product
      const { data: newProduct, error } = await supabase
        .from('products')
        .insert({
          name: data.name,
          category_id: data.category_id,
          subcategory_id: data.subcategory_id || null,
          category: data.category,
          price: data.price,
          image_url: imageUrl,
          description: data.description,
          is_active: data.is_active,
          occasions: data.occasions,
          display_sections: data.display_sections,
          sort_order: newSortOrder,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return newProduct;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProductFormData & { imageFile?: File } }) => {
      const supabase = getSupabaseClient();

      // Upload new image if provided
      let imageUrl = data.image_url;
      if (data.imageFile) {
        imageUrl = await uploadProductImage(data.imageFile);
      }

      // Update product
      const { data: updatedProduct, error } = await supabase
        .from('products')
        .update({
          name: data.name,
          category_id: data.category_id,
          subcategory_id: data.subcategory_id || null,
          category: data.category,
          price: data.price,
          image_url: imageUrl,
          description: data.description,
          is_active: data.is_active,
          occasions: data.occasions,
          display_sections: data.display_sections,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return updatedProduct;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseClient();

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useToggleProductStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const supabase = getSupabaseClient();

      const { data, error } = await supabase
        .from('products')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
