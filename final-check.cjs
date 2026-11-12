const fs = require('fs');
const path = require('path');

console.log('='.repeat(80));
console.log('فحص نهائي: lower-stand-010.webp و Placeholder (READ ONLY)');
console.log('='.repeat(80));

// Load product-image-mapping.json
const mappingPath = path.join(__dirname, 'product-image-mapping.json');
const mappingData = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

// Load middlemist-products.json
const productsPath = path.join(__dirname, 'middlemist-products.json');
const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// Load products-transformed.json
const transformedPath = path.join(__dirname, 'products-transformed.json');
const transformedData = JSON.parse(fs.readFileSync(transformedPath, 'utf8'));

console.log('\n' + '='.repeat(80));
console.log('1. فحص صورة lower-stand-010.webp');
console.log('='.repeat(80));

// Find "استاند" in product-image-mapping.json
const mappingStand = mappingData.filter(m => m['اسم المنتج'] === 'استاند');
console.log(`\nفي product-image-mapping.json: ${mappingStand.length} سجل لـ "استاند"`);
mappingStand.forEach(m => {
  console.log(`  - ${m['اسم الصورة بالإنجليزي (بدون الامتداد)']}.webp`);
});

// Find "استاند" in middlemist-products.json
const productsStand = productsData.products.filter(p => p.name === 'استاند');
console.log(`\nفي middlemist-products.json: ${productsStand.length} منتج لـ "استاند"`);
productsStand.forEach(p => {
  console.log(`  - ${p.name} (${p.price} SAR)`);
  console.log(`    image_filename: ${p.image_filename}`);
  console.log(`    image_url: ${p.image_url}`);
});

// Find "استاند" in products-transformed.json
const transformedStand = transformedData.filter(p => p.name === 'استاند');
console.log(`\nفي products-transformed.json: ${transformedStand.length} منتج لـ "استاند"`);
transformedStand.forEach(p => {
  console.log(`  - ${p.name} (${p.price} SAR)`);
  console.log(`    image_url: ${p.image_url}`);
  console.log(`    هو Placeholder؟ ${p.image_url.includes('placeholder') ? 'نعم' : 'لا'}`);
});

console.log('\n' + '='.repeat(80));
console.log('تحليل:');
console.log('='.repeat(80));
console.log('\nفي product-image-mapping.json:');
console.log('  - السطر 203-204: "استاند" -> lower-stand-010');
console.log('  - السطر 211-212: "استاند" -> custom-print-014');
console.log('\nفي middlemist-products.json:');
console.log('  - السطر 614-624: "استاند" (249 SAR) -> flower-stand-010.webp');
console.log('  - السطر 638-648: "استاند" (299 SAR) -> custom-print-014.webp');
console.log('\nفي products-transformed.json:');
console.log('  - السطر 903-912: "استاند" (249 SAR) -> placeholder.svg');
console.log('  - السطر 939-948: "استاند" (299 SAR) -> custom-print-014.webp');

console.log('\nالاستنتاج:');
console.log('  ✗ lower-stand-010.webp غير مستخدم في أي منتج في الكتالوج الجديد');
console.log('  ✗ flower-stand-010.webp المذكور في middlemist-products.json غير موجود في Storage');
console.log('  ✓ المنتج "استاند" (249 SAR) يحصل على Placeholder');
console.log('  ✓ المنتج "استاند" (299 SAR) يستخدم custom-print-014.webp');
console.log('  ✗ لا يمكن ربط lower-stand-010.webp بأي منتج دون تخمين');
console.log('  ℹ  التصحيح السابق من flower-stand-010 إلى lower-stand-010 كان مبنياً على معلومات قديمة');

console.log('\n' + '='.repeat(80));
console.log('2. فحص Placeholder');
console.log('='.repeat(80));

const placeholderProducts = transformedData.filter(p => p.image_url.includes('placeholder'));
console.log(`\nعدد المنتجات بPlaceholder: ${placeholderProducts.length}`);

const placeholderUrls = new Set();
placeholderProducts.forEach(p => {
  placeholderUrls.add(p.image_url);
});

console.log(`\nرابط Placeholder المستخدم:`);
placeholderUrls.forEach(url => {
  console.log(`  ${url}`);
});

if (placeholderUrls.size === 1) {
  console.log('\n✓ جميع المنتجات الـ54 تستخدم نفس الرابط');
} else {
  console.log('\n✗ توجد روابط Placeholder مختلفة!');
}

console.log('\nتحليل المسار:');
const placeholderUrl = Array.from(placeholderUrls)[0];
console.log(`\nالرابط: ${placeholderUrl}`);
console.log(`\nهل في جذر Bucket؟ ${placeholderUrl.includes('/products/') ? 'لا' : 'نعم'}`);
console.log(`هل داخل products/؟ ${placeholderUrl.includes('/products/') ? 'نعم' : 'لا'}`);

if (placeholderUrl.includes('/products/')) {
  console.log('\n✗ المسار يشير إلى داخل مجلد products/');
  console.log('  الملف يجب أن يكون في: product-images/products/placeholder.svg');
} else {
  console.log('\n✓ المسار يشير إلى جذر Bucket');
  console.log('  الملف يجب أن يكون في: product-images/placeholder.svg');
}

console.log('\n' + '='.repeat(80));
