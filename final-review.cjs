const fs = require('fs');
const path = require('path');

console.log('='.repeat(80));
console.log('مراجعة نهائية للصور قبل الرفع إلى Supabase Storage');
console.log('='.repeat(80));

// Read mapping file
const mappingPath = path.join(__dirname, 'product-image-mapping.json');
const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

console.log(`\n1. سجلات المنتجات في ملف الربط: ${mapping.length}`);

// Get local images
const imagesDir = path.join(__dirname, 'src', 'assets', 'middlemist-images');
const localImages = fs.readdirSync(imagesDir).filter(f => f.endsWith('.webp'));

console.log(`2. الصور المحلية في middlemist-images: ${localImages.length}`);

// Extract image names from mapping (add .webp extension)
const mappedImageNames = new Set(
  mapping.map(m => `${m['اسم الصورة بالإنجليزي (بدون الامتداد)']}.webp`)
);

console.log(`3. أسماء الصور الفريدة في ملف الربط: ${mappedImageNames.size}`);

// Check which mapped images exist locally
const mappedImagesExisting = [];
const mappedImagesMissing = [];

mappedImageNames.forEach(imageName => {
  if (localImages.includes(imageName)) {
    mappedImagesExisting.push(imageName);
  } else {
    mappedImagesMissing.push(imageName);
  }
});

console.log(`4. الصور المرتبطة والموجودة فعليًا: ${mappedImagesExisting.length}`);
console.log(`5. الصور المرتبطة والمفقودة: ${mappedImagesMissing.length}`);

// Find unused local images
const unusedLocalImages = localImages.filter(img => !mappedImageNames.has(img));
console.log(`6. الصور المحلية غير المستخدمة في ملف الربط: ${unusedLocalImages.length}`);

// Check for category images in the code
console.log('\n' + '='.repeat(80));
console.log('فحص صور التصنيفات في كود الموقع:');
console.log('='.repeat(80));

const storeDataPath = path.join(__dirname, 'src', 'lib', 'store-data.ts');
if (fs.existsSync(storeDataPath)) {
  const storeData = fs.readFileSync(storeDataPath, 'utf8');

  // Check for category images in store-data.ts
  const categoryImagesMatch = storeData.match(/categoryImages:\s*Record<string,\s*string>\s*=\s*{([^}]+)}/s);
  if (categoryImagesMatch) {
    console.log('\n✓ وجدت تعريف categoryImages في store-data.ts');
    console.log('هذه الصور موجودة في src/assets/products/ وليس في middlemist-images');
  }

  // Check if any middlemist-images are referenced as category images
  const middlemistReferences = storeData.match(/middlemist-images/g);
  if (middlemistReferences) {
    console.log(`\n⚠ وجدت ${middlemistReferences.length} إشارة إلى middlemist-images في store-data.ts`);
  } else {
    console.log('\n✓ لا توجد إشارات مباشرة إلى middlemist-images في store-data.ts');
  }
} else {
  console.log('\n✗ store-data.ts غير موجود');
}

// Check other files for category image references
const libFiles = fs.readdirSync(path.join(__dirname, 'src', 'lib')).filter(f => f.endsWith('.ts'));
let categoryImageFound = false;

libFiles.forEach(file => {
  const filePath = path.join(__dirname, 'src', 'lib', file);
  const content = fs.readFileSync(filePath, 'utf8');

  if (content.includes('category') && content.includes('image')) {
    if (!categoryImageFound) {
      console.log('\nملفات تحتوي على إشارات صور تصنيفات:');
      categoryImageFound = true;
    }
    console.log(`  - src/lib/${file}`);
  }
});

// Display unused images
console.log('\n' + '='.repeat(80));
console.log('الصور المحلية غير المستخدمة في ملف الربط:');
console.log('='.repeat(80));

if (unusedLocalImages.length > 0) {
  unusedLocalImages.forEach(img => {
    console.log(`  - ${img}`);
  });
} else {
  console.log('  لا توجد صور غير مستخدمة');
}

// Display missing images
console.log('\n' + '='.repeat(80));
console.log('الصور المرتبطة في ملف الربط والمفقودة محليًا:');
console.log('='.repeat(80));

if (mappedImagesMissing.length > 0) {
  mappedImagesMissing.forEach(img => {
    const product = mapping.find(m => `${m['اسم الصورة بالإنجليزي (بدون الامتداد)']}.webp` === img);
    const productName = product ? product['اسم المنتج'] : 'غير معروف';
    console.log(`  - ${img} (${productName})`);
  });
} else {
  console.log('  جميع الصور المرتبطة موجودة محليًا ✓');
}

// Prepare list of images to upload
console.log('\n' + '='.repeat(80));
console.log('قائمة الصور المرتبطة بالمنتجات فقط (للرفع إلى product-images):');
console.log('='.repeat(80));

const imagesToUpload = [...mappedImageNames].sort();
console.log(`\nإجمالي الصور للرفع: ${imagesToUpload.length}\n`);

imagesToUpload.forEach(img => {
  const exists = localImages.includes(img) ? '✓' : '✗';
  console.log(`  ${exists} ${img}`);
});

// Summary
console.log('\n' + '='.repeat(80));
console.log('ملخص المراجعة النهائية:');
console.log('='.repeat(80));
console.log(`إجمالي سجلات المنتجات في ملف الربط: ${mapping.length}`);
console.log(`إجمالي الصور المحلية: ${localImages.length}`);
console.log(`الصور المرتبطة الفريدة: ${mappedImageNames.size}`);
console.log(`الصور المرتبطة والموجودة: ${mappedImagesExisting.length}`);
console.log(`الصور المرتبطة والمفقودة: ${mappedImagesMissing.length}`);
console.log(`الصور المحلية غير المستخدمة: ${unusedLocalImages.length}`);
console.log(`الصور المقترحة للرفع: ${mappedImagesExisting.length}`);

if (mappedImagesMissing.length > 0) {
  console.log('\n⚠ تحذير: هناك صور مرتبطة في ملف الربط لكنها غير موجودة محليًا');
}

if (unusedLocalImages.length > 0) {
  console.log('\n⚠ تحذير: هناك صور محلية غير مستخدمة في ملف الربط');
}

console.log('\n' + '='.repeat(80));
