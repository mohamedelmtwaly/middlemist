import { useQuery } from '@tanstack/react-query';
import { getSupabaseClient } from './supabase';
import { SupabaseCategory } from './types';

export interface Category {
  id: string;
  name_ar: string;
  image_url: string | null | undefined;
  parent_id: string | null;
}

/**
 * Hook لجلب التصنيفات من Supabase
 */
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<Category[]> => {
      const supabase = getSupabaseClient();

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        throw new Error(`فشل في جلب التصنيفات: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return [];
      }

      // إرجاع التصنيفات مع الاسم والصورة
      return data.map((cat: SupabaseCategory) => ({
        id: cat.id,
        name_ar: cat.name_ar,
        image_url: cat.image_url,
        parent_id: cat.parent_id,
      }));
    },
    staleTime: 10 * 60 * 1000, // 10 دقائق
  });
}
