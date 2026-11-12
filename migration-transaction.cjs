const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

console.log('='.repeat(80));
console.log('إنشاء وإنشاء SQL Function للTransaction');
console.log('='.repeat(80));

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(supabaseUrl, supabaseSecretKey);

// Category mapping
const categoryMapping = {
  'مسكة عروس': '57d70a1f-20b8-4dbf-800c-6ea29de5a778',
  'باقات وهدايا التخرج': '44ab4768-8ab8-49a2-964e-2779d3860a24',
  'استاندات': '04c3fa1e-7f19-499e-b401-4a1ae3fb2e1d',
  'شرايط': '91d11ac7-df3e-4aff-a689-e043a615372c',
  'سلات ورد': '1972b3d0-405e-47ae-960c-1eb858279d42',
  'بوكسات': 'ebc12058-3f22-4a0c-bbe6-1e1b51219685',
  'فازات': '00bb1aa6-49a6-4a38-b83e-5223046274ad',
  'دباديب': '7e0404c0-0259-4548-9dc7-504687b2ff22',
  'بالونات': '3edcc1e9-2221-41ec-bb8a-c6a62021fb82',
  'باقات': '8260dfef-f052-4db4-a084-d9a30ebbcb38',
  'Rose Bouquet': '8260dfef-f052-4db4-a084-d9a30ebbcb38',
  'Helium Bouquets': '3edcc1e9-2221-41ec-bb8a-c6a62021fb82'
};

// Placeholder URL for missing images
const placeholderUrl = 'https://rgnpxovzbwzfofbbsaja.supabase.co/storage/v1/object/public/product-images/placeholder.svg';

async function createMigrationFunction() {
  try {
    // Load new products
    const productsPath = path.join(__dirname, 'middlemist-products.json');
    const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

    console.log(`\n✓ تم تحميل ${productsData.products.length} منتج`);

    // Transform products for database
    const transformedProducts = productsData.products.map((p, index) => {
      const categoryId = categoryMapping[p.source_section];
      if (!categoryId) {
        console.log(`⚠ تحذير: لا يوجد category_id لـ "${p.source_section}"`);
      }

      return {
        name: p.name,
        category: p.source_section,
        price: p.price,
        image_url: p.image_exists !== false ? p.image_url : placeholderUrl,
        description: JSON.stringify({ ar: p.description || '', en: '' }),
        is_active: true,
        sort_order: index + 1,
        category_id: categoryId || null,
        legacy_id: null,
        is_featured: false,
        occasions: null,
        display_sections: null,
        subcategory_id: null
      };
    });

    console.log(`✓ تم تحويل ${transformedProducts.length} منتج`);

    // Save transformed data for review
    const transformedPath = path.join(__dirname, 'products-transformed.json');
    fs.writeFileSync(transformedPath, JSON.stringify(transformedProducts, null, 2), 'utf8');
    console.log(`✓ تم حفظ البيانات المحولة: ${transformedPath}`);

    // Create SQL function
    const sqlFunction = `
-- Create function to replace products in a single transaction
CREATE OR REPLACE FUNCTION replace_products_catalog(new_products JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  inserted_count INTEGER;
  deleted_count INTEGER;
BEGIN
  -- Start transaction (implicit in function)
  
  -- Delete all existing products
  DELETE FROM products;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Insert new products
  INSERT INTO products (
    name,
    category,
    price,
    image_url,
    description,
    is_active,
    sort_order,
    category_id,
    legacy_id,
    is_featured,
    occasions,
    display_sections,
    subcategory_id
  )
  SELECT
    (elem->>'name')::text,
    (elem->>'category')::text,
    (elem->>'price')::numeric,
    (elem->>'image_url')::text,
    (elem->>'description')::jsonb,
    (elem->>'is_active')::boolean,
    (elem->>'sort_order')::integer,
    (elem->>'category_id')::uuid,
    (elem->>'legacy_id')::text,
    (elem->>'is_featured')::boolean,
    (elem->>'occasions')::jsonb,
    (elem->>'display_sections')::jsonb,
    (elem->>'subcategory_id')::jsonb
  FROM jsonb_array_elements(new_products) AS elem;
  
  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  
  -- Build result
  result = jsonb_build_object(
    'success', true,
    'deleted_count', deleted_count,
    'inserted_count', inserted_count,
    'message', 'Products replaced successfully'
  );
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Rollback happens automatically on exception
    result = jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Transaction rolled back due to error'
    );
    RETURN result;
END;
$$;
`;

    console.log('\n[SQL Function المطلوب للتنفيذ]:');
    console.log('='.repeat(80));
    console.log(sqlFunction);
    console.log('='.repeat(80));

    // Save SQL to file
    const sqlPath = path.join(__dirname, 'migration-function.sql');
    fs.writeFileSync(sqlPath, sqlFunction, 'utf8');
    console.log(`\n✓ تم حفظ SQL Function: ${sqlPath}`);

    console.log('\nالخطوات التالية:');
    console.log('1. نفذ SQL Function في Supabase SQL Editor');
    console.log('2. استخدم supabase.rpc() لتنفيذ replace_products_catalog');
    console.log('3. مرر البيانات المحولة من products-transformed.json');

  } catch (error) {
    console.error('\n✗ خطأ:', error.message);
    console.error(error.stack);
  }
}

createMigrationFunction();
