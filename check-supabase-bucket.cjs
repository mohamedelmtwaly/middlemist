const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

console.log('='.repeat(80));
console.log('فحص محتويات Supabase Storage Bucket: product-images');
console.log('='.repeat(80));

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('✗ خطأ: متغيرات البيئة غير موجودة');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'موجود' : 'مفقود');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'موجود' : 'مفقود');
  process.exit(1);
}

console.log('\nإعدادات Supabase:');
console.log(`  URL: ${supabaseUrl}`);
console.log(`  Anon Key: ${supabaseAnonKey.substring(0, 20)}...`);

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Get local files
const localImagesDir = path.join(__dirname, 'src', 'assets', 'middlemist-images');
const localFiles = fs.readdirSync(localImagesDir).filter(f => f.endsWith('.webp'));
console.log(`\nالصور المحلية في middlemist-images: ${localFiles.length}`);

async function checkBucket() {
  try {
    console.log('\nجاري الاتصال بـ Supabase Storage...');

    // List all files in the bucket
    const { data: files, error } = await supabase
      .storage
      .from('product-images')
      .list('', {
        limit: 1000,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (error) {
      console.error('\n✗ خطأ في الوصول إلى الـ Bucket:');
      console.error(error.message);
      console.error('\nقد يكون السبب:');
      console.error('  - الـ Bucket غير موجود');
      console.error('  - صلاحيات الوصول غير كافية');
      console.error('  - اسم الـ Bucket غير صحيح');
      return;
    }

    console.log(`\n✓ تم الوصول إلى الـ Bucket بنجاح`);
    console.log(`عدد الملفات الموجودة: ${files.length}`);

    if (files.length === 0) {
      console.log('\nالـ Bucket فارغ حاليًا');
    } else {
      console.log('\nأسماء الملفات الموجودة في الـ Bucket:');
      files.forEach((file, index) => {
        console.log(`  ${index + 1}. ${file.name} (${(file.metadata?.size || 0) / 1024} KB)`);
      });
    }

    // Compare with local files
    console.log('\n' + '='.repeat(80));
    console.log('مقارنة مع الصور المحلية:');
    console.log('='.repeat(80));

    const bucketFileNames = new Set(files.map(f => f.name));
    const conflictingFiles = [];
    const newFiles = [];

    localFiles.forEach(file => {
      if (bucketFileNames.has(file)) {
        conflictingFiles.push(file);
      } else {
        newFiles.push(file);
      }
    });

    console.log(`\nالملفات المتعارضة (موجودة في الـ Bucket والمحلي): ${conflictingFiles.length}`);
    if (conflictingFiles.length > 0) {
      conflictingFiles.forEach(file => {
        console.log(`  - ${file}`);
      });
    }

    console.log(`\nالملفات الجديدة (يمكن رفعها بأمان): ${newFiles.length}`);
    if (newFiles.length > 0) {
      newFiles.forEach(file => {
        console.log(`  - ${file}`);
      });
    }

    // Check for category images
    console.log('\n' + '='.repeat(80));
    console.log('التحقق من صور التصنيفات:');
    console.log('='.repeat(80));

    const categoryImagePatterns = files.filter(f =>
      f.name.includes('category') ||
      f.name.includes('category-') ||
      f.name.match(/^cat-/i)
    );

    if (categoryImagePatterns.length > 0) {
      console.log(`\nيوجد ${categoryImagePatterns.length} ملف قد يكون صور تصنيفات:`);
      categoryImagePatterns.forEach(f => {
        console.log(`  - ${f.name}`);
      });
    } else {
      console.log('\nلم يتم العثور على صور تصنيفات واضحة');
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('ملخص الفحص:');
    console.log('='.repeat(80));
    console.log(`إجمالي الملفات في Supabase: ${files.length}`);
    console.log(`إجمالي الصور المحلية: ${localFiles.length}`);
    console.log(`الملفات المتعارضة: ${conflictingFiles.length}`);
    console.log(`الملفات الجديدة للرفع: ${newFiles.length}`);
    console.log(`صور التصنيفات المحتملة: ${categoryImagePatterns.length}`);

    if (conflictingFiles.length > 0) {
      console.log('\n⚠ تحذير: سيتم استبدال الملفات المتعارضة عند الرفع');
    }

    console.log('\n' + '='.repeat(80));

  } catch (error) {
    console.error('\n✗ خطأ غير متوقع:');
    console.error(error.message);
  }
}

checkBucket();
