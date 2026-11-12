// أنواع Supabase (من قاعدة البيانات)
export type SupabaseProduct = {
  id: string;
  name: string;
  category: string;
  category_id: string;
  subcategory_id: string | null;
  price: number;
  image_url: string;
  description?: string | null;
  is_active: boolean;
  occasions: string[] | null;
  display_sections: string[] | null;
  created_at: string;
  updated_at: string;
  sort_order?: number;
  legacy_id?: string;
};

export type SupabaseCategory = {
  id: string;
  name_ar: string;
  name_en?: string | null;
  slug?: string | null;
  sort_order: number;
  is_active: boolean;
  image_url?: string | null;
  parent_id?: string | null;
  created_at: string;
  updated_at: string;
};

// أنواع المكونات (متوافقة مع الواجهة الحالية)
export type Category = {
  id: string;
  name_ar: string;
  name_en?: string;
  slug?: string;
  sort_order: number;
  is_active: boolean;
};
