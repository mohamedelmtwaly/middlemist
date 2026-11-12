import { useQuery } from '@tanstack/react-query';
import { getSupabaseClient } from './supabase';
import { SupabaseProduct } from './types';
import type { Product } from './store-data';

/**
 * تحويل منتج Supabase إلى منتج المكون
 */
function transformProduct(product: SupabaseProduct): Product {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    subcategory_id: product.subcategory_id,
    price: product.price,
    image: product.image_url,
    desc: product.description || undefined,
    occasions: product.occasions,
    display_sections: product.display_sections,
  };
}

/**
 * Hook لجلب المنتجات من Supabase
 */
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const supabase = getSupabaseClient();

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: false });

      if (error) {
        throw new Error(`فشل في جلب المنتجات: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return [];
      }

      // تحويل البيانات إلى شكل المكون
      return data.map(transformProduct);
    },
    staleTime: 5 * 60 * 1000, // 5 دقائق
  });
}
