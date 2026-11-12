const fs = require('fs');
const path = require('path');

console.log('='.repeat(80));
console.log('استخراج المنتجات الـ54 بPlaceholder من products-transformed.json');
console.log('='.repeat(80));

const transformedPath = path.join(__dirname, 'products-transformed.json');
const transformedData = JSON.parse(fs.readFileSync(transformedPath, 'utf8'));

const placeholderProducts = transformedData.filter(p => p.image_url.includes('placeholder'));

console.log(`\nعدد المنتجات بPlaceholder: ${placeholderProducts.length}`);

// Load middlemist-products.json to get image_filename
const productsPath = path.join(__dirname, 'middlemist-products.json');
const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

console.log('\n' + '='.repeat(80));
console.log('القائمة الكاملة:');
console.log('='.repeat(80));

placeholderProducts.forEach((p, index) => {
  const original = productsData.products.find(orig => orig.name === p.name);
  const imageFilename = original ? original.image_filename : 'N/A';
  
  console.log(`\n${index + 1}. ${p.name}`);
  console.log(`   السعر: ${p.price} SAR`);
  console.log(`   التصنيف: ${p.category}`);
  console.log(`   اسم ملف الصورة الأصلي: ${imageFilename}`);
});

console.log('\n' + '='.repeat(80));
console.log(`العدد الإجمالي: ${placeholderProducts.length} منتج`);
console.log('='.repeat(80));
