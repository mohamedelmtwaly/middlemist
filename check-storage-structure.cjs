const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('='.repeat(80));
console.log('فحص هيكل Supabase Storage');
console.log('='.repeat(80));

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkStorage() {
  try {
    console.log('\n1. فحص root of product-images bucket:');
    const { data: rootFiles, error: rootError } = await supabase
      .storage
      .from('product-images')
      .list('', { limit: 1000 });

    if (rootError) {
      console.error('✗ خطأ:', rootError.message);
    } else {
      console.log(`✓ عدد الملفات في root: ${rootFiles.length}`);
      if (rootFiles.length > 0) {
        console.log('\nأول 20 ملف:');
        rootFiles.slice(0, 20).forEach(f => {
          console.log(`  - ${f.name} (${f.metadata?.size || 0} bytes)`);
        });
      }
    }

    console.log('\n2. فحص products/ folder:');
    const { data: productsFiles, error: productsError } = await supabase
      .storage
      .from('product-images')
      .list('products', { limit: 1000 });

    if (productsError) {
      console.error('✗ خطأ:', productsError.message);
    } else {
      console.log(`✓ عدد الملفات في products/: ${productsFiles.length}`);
      if (productsFiles.length > 0) {
        console.log('\nأول 20 ملف:');
        productsFiles.slice(0, 20).forEach(f => {
          console.log(`  - ${f.name} (${f.metadata?.size || 0} bytes)`);
        });
      }
    }

    console.log('\n3. فحص جميع المجلدات (subfolders):');
    const { data: allFiles, error: allError } = await supabase
      .storage
      .from('product-images')
      .list('', { limit: 1000, sortBy: { column: 'name', order: 'asc' } });

    if (allError) {
      console.error('✗ خطأ:', allError.message);
    } else {
      console.log(`✓ إجمالي الملفات: ${allFiles.length}`);
      const folders = new Set();
      allFiles.forEach(f => {
        if (f.name.includes('/')) {
          const folder = f.name.split('/')[0];
          folders.add(folder);
        }
      });
      console.log(`المجلدات الموجودة: ${Array.from(folders).join(', ') || '(لا يوجد مجلدات)'}`);
    }

  } catch (error) {
    console.error('\n✗ خطأ:', error.message);
  }
}

checkStorage();
