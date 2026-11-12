const fs = require('fs');
const path = require('path');

console.log('='.repeat(80));
console.log('فحص حجم الصور المرتبطة بالمنتجات والموجودة فعليًا');
console.log('='.repeat(80));

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

// Check which mapped images exist locally and get their sizes
const existingImages = [];
const missingImages = [];

mappedImageNames.forEach(imageName => {
  const imagePath = path.join(imagesDir, imageName);
  if (fs.existsSync(imagePath)) {
    const stats = fs.statSync(imagePath);
    existingImages.push({
      name: imageName,
      size: stats.size
    });
  } else {
    missingImages.push(imageName);
  }
});

console.log(`2. الصور المرتبطة والموجودة فعليًا: ${existingImages.length}`);
console.log(`3. الصور المرتبطة والمفقودة: ${missingImages.length}`);

// Check for lower-stand-010.webp
const lowerStand = existingImages.find(img => img.name === 'lower-stand-010.webp');
console.log(`4. صورة lower-stand-010.webp: ${lowerStand ? '✓ موجودة ومحسوبة' : '✗ غير موجودة'}`);

// Calculate total size
const totalBytes = existingImages.reduce((sum, img) => sum + img.size, 0);
const totalMB = totalBytes / (1024 * 1024);
const avgSize = existingImages.length > 0 ? totalBytes / existingImages.length : 0;

console.log(`\n5. الحجم الإجمالي للصور: ${totalBytes.toLocaleString()} Bytes (${totalMB.toFixed(2)} MB)`);
console.log(`6. متوسط حجم الصورة: ${avgSize.toLocaleString()} Bytes (${(avgSize / 1024).toFixed(2)} KB)`);

// Find top 10 largest images
const sortedBySize = [...existingImages].sort((a, b) => b.size - a.size);
const top10 = sortedBySize.slice(0, 10);

console.log(`\n7. أكبر 10 صور من حيث الحجم:`);
top10.forEach((img, index) => {
  console.log(`   ${index + 1}. ${img.name} - ${(img.size / 1024).toFixed(2)} KB`);
});

// Check unused images (for verification)
const allLocalImages = fs.readdirSync(imagesDir).filter(f => f.endsWith('.webp'));
const unusedImages = allLocalImages.filter(img => !mappedImageNames.has(img));
console.log(`\n8. الصور المحلية غير المستخدمة (مستبعدة من الحساب): ${unusedImages.length}`);

// Check against Supabase free tier limit (1 GB)
const limitBytes = 1024 * 1024 * 1024; // 1 GB
const limitMB = 1024;
const usagePercent = (totalBytes / limitBytes) * 100;

console.log('\n' + '='.repeat(80));
console.log('مقارنة مع حد التخزين المجاني في Supabase (1 GB):');
console.log('='.repeat(80));
console.log(`الحد المسموح: ${limitBytes.toLocaleString()} Bytes (${limitMB} MB)`);
console.log(`الاستخدام الحالي: ${totalBytes.toLocaleString()} Bytes (${totalMB.toFixed(2)} MB)`);
console.log(`نسبة الاستخدام: ${usagePercent.toFixed(2)}%`);
console.log(`المتبقي: ${(limitBytes - totalBytes).toLocaleString()} Bytes (${(limitMB - totalMB).toFixed(2)} MB)`);

if (usagePercent < 50) {
  console.log('\n✓ الاستخدام أقل من 50% من الحد المسموح');
} else if (usagePercent < 80) {
  console.log('\n⚠ الاستخدام بين 50% و 80% من الحد المسموح');
} else {
  console.log('\n✗ الاستخدام يتجاوز 80% من الحد المسموح');
}

console.log('\n' + '='.repeat(80));
