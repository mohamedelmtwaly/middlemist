const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

console.log('='.repeat(80));
console.log('تحليل مطابقة الأسماء بين قاعدة البيانات و product-image-mapping.json');
console.log('='.repeat(80));

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const mappingPath = path.join(__dirname, 'product-image-mapping.json');
const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

async function analyzeNames() {
  try {
    const { data: products } = await supabase
      .from('products')
      .select('id, name, category, image_url')
      .order('name', { ascending: true });

    console.log(`\nإجمالي المنتجات في قاعدة البيانات: ${products.length}`);
    console.log(`إجمالي المنتجات في mapping: ${mapping.length}`);

    // Show all DB product names
    console.log('\n' + '='.repeat(80));
    console.log('أسماء المنتجات في قاعدة البيانات:');
    console.log('='.repeat(80));
    products.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name} (${p.category})`);
    });

    // Show mapping sample
    console.log('\n' + '='.repeat(80));
    console.log('عينة من أسماء المنتجات في product-image-mapping.json (أول 20):');
    console.log('='.repeat(80));
    mapping.slice(0, 20).forEach((m, i) => {
      console.log(`${i + 1}. ${m['اسم المنتج']}`);
    });

    // Try fuzzy matching (partial match)
    console.log('\n' + '='.repeat(80));
    console.log('محاولة مطابقة جزئية (اسم في DB يحتوي على اسم من mapping):');
    console.log('='.repeat(80));

    const mappingNames = mapping.map(m => m['اسم المنتج']);
    const partialMatches = [];

    products.forEach(p => {
      mappingNames.forEach(mName => {
        if (p.name.includes(mName) || mName.includes(p.name)) {
          partialMatches.push({ db: p.name, mapping: mName });
        }
      });
    });

    if (partialMatches.length > 0) {
      console.log(`\nوجد ${partialMatches.length} مطابقة جزئية:`);
      partialMatches.slice(0, 20).forEach(m => {
        console.log(`  DB: "${m.db}" ←→ Mapping: "${m.mapping}"`);
      });
    } else {
      console.log('\nلم يتم العثور على مطابقة جزئية');
    }

    // Check for "استاند" variants
    console.log('\n' + '='.repeat(80));
    console.log('المنتجات التي تحتوي على "استاند" في قاعدة البيانات:');
    console.log('='.repeat(80));
    const standProducts = products.filter(p => p.name.includes('استاند') || p.name.includes('أستاند'));
    console.log(`\nوجد ${standProducts.length} منتج:`);
    standProducts.forEach(p => {
      console.log(`  - ${p.name} (ID: ${p.id})`);
      console.log(`    Image: ${p.image_url}`);
    });

    // Check for "استاند" in mapping
    console.log('\n' + '='.repeat(80));
    console.log('المنتجات التي تحتوي على "استاند" في product-image-mapping.json:');
    console.log('='.repeat(80));
    const standMapping = mapping.filter(m => m['اسم المنتج'].includes('استاند'));
    console.log(`\nوجد ${standMapping.length} منتج:`);
    standMapping.forEach(m => {
      console.log(`  - ${m['اسم المنتج']} → ${m['اسم الصورة بالإنجليزي (بدون الامتداد)']}.webp`);
    });

    console.log('\n' + '='.repeat(80));

  } catch (error) {
    console.error('\n✗ خطأ:');
    console.error(error.message);
  }
}

analyzeNames();
