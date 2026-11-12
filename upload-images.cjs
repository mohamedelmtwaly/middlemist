const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

console.log('='.repeat(80));
console.log('رفع صور المنتجات إلى Supabase Storage');
console.log('='.repeat(80));

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('✗ خطأ: متغيرات البيئة غير موجودة');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Read mapping file
const mappingPath = path.join(__dirname, 'product-image-mapping.json');
const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

// Get local images directory
const imagesDir = path.join(__dirname, 'src', 'assets', 'middlemist-images');

// Extract image names from mapping
const mappedImageNames = new Set(
  mapping.map(m => `${m['اسم الصورة بالإنجليزي (بدون الامتداد)']}.webp`)
);

console.log(`\n1. الصور المرتبطة في ملف الربط: ${mappedImageNames.size}`);

// Check which mapped images exist locally
const existingImages = [];
const missingImages = [];

mappedImageNames.forEach(imageName => {
  const imagePath = path.join(imagesDir, imageName);
  if (fs.existsSync(imagePath)) {
    existingImages.push(imageName);
  } else {
    missingImages.push(imageName);
  }
});

console.log(`2. الصور المرتبطة والموجودة فعليًا: ${existingImages.length}`);
console.log(`3. الصور المرتبطة والمفقودة: ${missingImages.length}`);

// Check for lower-stand-010.webp
const hasLowerStand = existingImages.includes('lower-stand-010.webp');
console.log(`4. صورة lower-stand-010.webp: ${hasLowerStand ? '✓ موجودة' : '✗ غير موجودة'}`);

// Verify count
if (existingImages.length !== 295) {
  console.error(`\n✗ خطأ: العدد المتوقع 295 لكن العدد الفعلي ${existingImages.length}`);
  process.exit(1);
}

console.log(`\n✓ التحقق من القائمة صحيح: ${existingImages.length} صورة`);

// Upload function
async function uploadImage(imageName) {
  const imagePath = path.join(imagesDir, imageName);
  const fileBuffer = fs.readFileSync(imagePath);
  const fileName = path.basename(imageName);

  const { data, error } = await supabase
    .storage
    .from('product-images')
    .upload(`products/${fileName}`, fileBuffer, {
      upsert: false,
      contentType: 'image/webp'
    });

  if (error) {
    if (error.message.includes('already exists')) {
      return { success: 'skipped', name: fileName, reason: 'موجودة مسبقًا' };
    }
    return { success: 'failed', name: fileName, error: error.message };
  }

  return { success: 'uploaded', name: fileName, path: data.path };
}

// Upload in batches
async function uploadAllImages() {
  const batchSize = 10;
  const results = {
    uploaded: 0,
    skipped: 0,
    failed: 0,
    failures: []
  };

  console.log('\n' + '='.repeat(80));
  console.log('بدء عملية الرفع...');
  console.log('='.repeat(80));

  for (let i = 0; i < existingImages.length; i += batchSize) {
    const batch = existingImages.slice(i, i + batchSize);
    console.log(`\nرفع الدفعة ${Math.floor(i / batchSize) + 1} (${i + 1}-${Math.min(i + batchSize, existingImages.length)} من ${existingImages.length})...`);

    for (const imageName of batch) {
      const result = await uploadImage(imageName);

      if (result.success === 'uploaded') {
        results.uploaded++;
        console.log(`  ✓ ${result.name} - تم الرفع`);
      } else if (result.success === 'skipped') {
        results.skipped++;
        console.log(`  ⊘ ${result.name} - تم التخطي (${result.reason})`);
      } else {
        results.failed++;
        results.failures.push(result);
        console.log(`  ✗ ${result.name} - فشل الرفع: ${result.error}`);
      }
    }

    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return results;
}

// Verify upload
async function verifyUpload() {
  console.log('\n' + '='.repeat(80));
  console.log('التحقق من الملفات المرفوعة...');
  console.log('='.repeat(80));

  const { data: files, error } = await supabase
    .storage
    .from('product-images')
    .list('products', {
      limit: 1000,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' }
    });

  if (error) {
    console.error('✗ خطأ في التحقق:', error.message);
    return null;
  }

  return files;
}

// Main execution
async function main() {
  try {
    const uploadResults = await uploadAllImages();

    console.log('\n' + '='.repeat(80));
    console.log('ملخص عملية الرفع:');
    console.log('='.repeat(80));
    console.log(`الصور التي تم رفعها بنجاح: ${uploadResults.uploaded}`);
    console.log(`الصور التي تم تخطيها (موجودة مسبقًا): ${uploadResults.skipped}`);
    console.log(`الصور التي فشل رفعها: ${uploadResults.failed}`);

    if (uploadResults.failures.length > 0) {
      console.log('\nتفاصيل الفشل:');
      uploadResults.failures.forEach(f => {
        console.log(`  - ${f.name}: ${f.error}`);
      });
    }

    // Verify
    const files = await verifyUpload();

    if (files) {
      console.log(`\nالعدد الفعلي للصور في products/: ${files.length}`);

      // Calculate total size
      const totalBytes = files.reduce((sum, f) => sum + (f.metadata?.size || 0), 0);
      const totalMB = totalBytes / (1024 * 1024);

      console.log(`الحجم الإجمالي للملفات المرفوعة: ${totalBytes.toLocaleString()} Bytes (${totalMB.toFixed(2)} MB)`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('عملية الرفع مكتملة');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('\n✗ خطأ غير متوقع:', error.message);
    process.exit(1);
  }
}

main();
