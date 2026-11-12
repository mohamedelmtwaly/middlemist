const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('='.repeat(80));
console.log('فحص التصنيفات في Supabase');
console.log('='.repeat(80));

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(supabaseUrl, supabaseSecretKey);

async function checkCategories() {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('✗ خطأ:', error.message);
      return;
    }

    console.log(`\nإجمالي التصنيفات: ${categories.length}\n`);

    // Main categories (no parent_id)
    const mainCategories = categories.filter(c => !c.parent_id);
    console.log('التصنيفات الرئيسية:');
    mainCategories.forEach(c => {
      console.log(`  - ${c.name_ar} (ID: ${c.id})`);
    });

    // Subcategories
    const subCategories = categories.filter(c => c.parent_id);
    if (subCategories.length > 0) {
      console.log('\nالتصنيفات الفرعية:');
      subCategories.forEach(c => {
        const parent = categories.find(p => p.id === c.parent_id);
        console.log(`  - ${c.name_ar} (ID: ${c.id}, Parent: ${parent?.name_ar || 'Unknown'})`);
      });
    }

    // Check which categories have products
    console.log('\nجاري فحص المنتجات لكل تصنيف...');
    const { data: products } = await supabase
      .from('products')
      .select('category_id, category')
      .eq('is_active', true);

    const categoryProductCount = {};
    products.forEach(p => {
      if (p.category_id) {
        categoryProductCount[p.category_id] = (categoryProductCount[p.category_id] || 0) + 1;
      }
    });

    console.log('\nعدد المنتجات لكل تصنيف:');
    categories.forEach(c => {
      const count = categoryProductCount[c.id] || 0;
      console.log(`  - ${c.name_ar}: ${count} منتج`);
    });

  } catch (error) {
    console.error('\n✗ خطأ:', error.message);
  }
}

checkCategories();
