const fs = require('fs');
const path = require('path');

console.log('='.repeat(80));
console.log('تجهيز products-transformed.json للتنفيذ: تعيين image_url = null للمنتجات بPlaceholder');
console.log('='.repeat(80));

const transformedPath = path.join(__dirname, 'products-transformed.json');
const transformedData = JSON.parse(fs.readFileSync(transformedPath, 'utf8'));

console.log(`\nإجمالي المنتجات: ${transformedData.length}`);

// Create modified version with null images for placeholder products
const modifiedData = transformedData.map(p => {
  const product = { ...p };
  if (product.image_url.includes('placeholder')) {
    product.image_url = null;
  }
  return product;
});

const placeholderCount = modifiedData.filter(p => p.image_url === null).length;
const realImageCount = modifiedData.filter(p => p.image_url !== null).length;

console.log(`المنتجات بصورة حقيقية: ${realImageCount}`);
console.log(`المنتجات بimage_url = null: ${placeholderCount}`);

// Save to new file
const outputPath = path.join(__dirname, 'products-transformed-null-images.json');
fs.writeFileSync(outputPath, JSON.stringify(modifiedData, null, 2));

console.log(`\nتم حفظ الملف المعدل في: ${outputPath}`);
console.log('='.repeat(80));
