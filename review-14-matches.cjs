const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

console.log('='.repeat(80));
console.log('مراجعة المطابقات التامة وعالية الثقة (14 مطابقة)');
console.log('='.repeat(80));

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(supabaseUrl, supabaseSecretKey);

const reportPath = path.join(__dirname, 'product-image-matching-report.json');
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

// Filter exact_match and high_confidence
const matches = report.filter(r => r.match_status === 'exact_match' || r.match_status === 'high_confidence');

console.log(`\nعدد المطابقات المختارة: ${matches.length}\n`);

// Verify images exist in Storage
async function verifyImages() {
  console.log('جاري التحقق من وجود الصور في Storage...\n');

  const { data: storageFiles } = await supabase
    .storage
    .from('product-images')
    .list('products', { limit: 1000 });

  const storageFileNames = new Set(storageFiles.map(f => f.name));

  const verifiedMatches = matches.map(m => ({
    ...m,
    image_verified: storageFileNames.has(m.image_filename)
  }));

  // Display results
  console.log('='.repeat(80));
  console.log('المطابقات التامة (exact_match) - 6 منتجات');
  console.log('='.repeat(80));

  const exactMatches = verifiedMatches.filter(m => m.match_status === 'exact_match');
  exactMatches.forEach((m, i) => {
    console.log(`\n${i + 1}. ${m.supabase_name}`);
    console.log(`   Product ID: ${m.product_id}`);
    console.log(`   التصنيف: ${m.supabase_category}`);
    console.log(`   Mapping: ${m.mapping_name}`);
    console.log(`   الصورة: ${m.image_filename}`);
    console.log(`   URL: ${m.public_url}`);
    console.log(`   نسبة المطابقة: ${m.match_score}%`);
    console.log(`   السبب: ${m.match_reason}`);
    console.log(`   الصورة موجودة: ${m.image_verified ? '✓ نعم' : '✗ لا'}`);
    console.log(`   الصورة الحالية: ${m.current_image_url}`);
  });

  console.log('\n' + '='.repeat(80));
  console.log('المطابقات عالية الثقة (high_confidence) - 8 منتجات');
  console.log('='.repeat(80));

  const highConfidence = verifiedMatches.filter(m => m.match_status === 'high_confidence');
  highConfidence.forEach((m, i) => {
    console.log(`\n${i + 1}. ${m.supabase_name}`);
    console.log(`   Product ID: ${m.product_id}`);
    console.log(`   التصنيف: ${m.supabase_category}`);
    console.log(`   Mapping: ${m.mapping_name}`);
    console.log(`   الصورة: ${m.image_filename}`);
    console.log(`   URL: ${m.public_url}`);
    console.log(`   نسبة المطابقة: ${m.match_score}%`);
    console.log(`   السبب: ${m.match_reason}`);
    console.log(`   الصورة موجودة: ${m.image_verified ? '✓ نعم' : '✗ لا'}`);
    console.log(`   الصورة الحالية: ${m.current_image_url}`);
  });

  // Check for duplicate product IDs
  console.log('\n' + '='.repeat(80));
  console.log('فحص تكرار Product IDs');
  console.log('='.repeat(80));

  const ids = verifiedMatches.map(m => m.product_id);
  const uniqueIds = new Set(ids);
  if (ids.length === uniqueIds.size) {
    console.log(`✓ جميع Product IDs فريدة (${ids.length} منتج)`);
  } else {
    console.log(`✗ يوجد تكرار في Product IDs!`);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    console.log(`  IDs المكررة: ${duplicates.join(', ')}`);
  }

  // Check for duplicate image filenames
  console.log('\n' + '='.repeat(80));
  console.log('فحص تكرار أسماء الصور');
  console.log('='.repeat(80));

  const images = verifiedMatches.map(m => m.image_filename);
  const uniqueImages = new Set(images);
  if (images.length === uniqueImages.size) {
    console.log(`✓ جميع أسماء الصور فريدة (${images.length} صورة)`);
  } else {
    console.log(`⚠ يوجد تكرار في أسماء الصور (${images.length} - ${uniqueImages.size} = ${images.length - uniqueImages.size} مكرر)`);
    const imageCounts = {};
    images.forEach(img => {
      imageCounts[img] = (imageCounts[img] || 0) + 1;
    });
    Object.entries(imageCounts).forEach(([img, count]) => {
      if (count > 1) {
        console.log(`  ${img}: ${count} مرات`);
      }
    });
  }

  // Save review file
  const reviewPath = path.join(__dirname, 'review-14-matches.json');
  fs.writeFileSync(reviewPath, JSON.stringify(verifiedMatches, null, 2), 'utf8');
  console.log(`\n✓ تم حفظ ملف المراجعة: ${reviewPath}`);

  // Save summary
  const summaryPath = path.join(__dirname, 'review-14-summary.txt');
  const summary = `
ملخص مراجعة 14 مطابقة
================================================================================

المطابقات التامة (exact_match): ${exactMatches.length}
المطابقات عالية الثقة (high_confidence): ${highConfidence.length}
المجموع: ${verifiedMatches.length}

التحقق من الصور:
----------------
الصور الموجودة في Storage: ${verifiedMatches.filter(m => m.image_verified).length}
الصور غير الموجودة: ${verifiedMatches.filter(m => !m.image_verified).length}

Product IDs:
-----------
فريدة: ${ids.length === uniqueIds.size ? 'نعم' : 'لا'}
العدد: ${ids.length}

أسماء الصور:
------------
فريدة: ${images.length === uniqueImages.size ? 'نعم' : 'لا'}
العدد: ${images.length}
المكرر: ${images.length - uniqueImages.size}

المحفوظات:
---------
- review-14-matches.json (التفاصيل الكاملة)
- review-14-summary.txt (هذا الملف)
`;
  fs.writeFileSync(summaryPath, summary, 'utf8');
  console.log(`✓ تم حفظ الملخص: ${summaryPath}`);

  console.log('\n' + '='.repeat(80));
}

verifyImages();
