const fs = require('fs');
const path = require('path');

console.log('='.repeat(80));
console.log('استخراج المنتجات الـ54 بPlaceholder');
console.log('='.repeat(80));

const transformedPath = path.join(__dirname, 'products-transformed.json');
const transformedData = JSON.parse(fs.readFileSync(transformedPath, 'utf8'));

const placeholderProducts = transformedData.filter(p => p.image_url.includes('placeholder'));

console.log(`\nعدد المنتجات بPlaceholder: ${placeholderProducts.length}`);

// Extract info for each product
const productsInfo = placeholderProducts.map(p => ({
  name: p.name,
  price: p.price,
  category: p.category,
  image_filename: 'N/A' // Will need to get from middlemist-products.json
}));

// Load middlemist-products.json to get image_filename
const productsPath = path.join(__dirname, 'middlemist-products.json');
const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// Map image_filename
productsInfo.forEach(p => {
  const original = productsData.products.find(orig => orig.name === p.name);
  if (original) {
    p.image_filename = original.image_filename;
  }
});

// Group by category
const byCategory = {};
productsInfo.forEach(p => {
  if (!byCategory[p.category]) {
    byCategory[p.category] = [];
  }
  byCategory[p.category].push(p);
});

console.log('\n' + '='.repeat(80));
console.log('التوزيع حسب التصنيف:');
console.log('='.repeat(80));
Object.keys(byCategory).sort().forEach(cat => {
  console.log(`\n${cat}: ${byCategory[cat].length} منتج`);
  byCategory[cat].forEach(p => {
    console.log(`  - ${p.name} (${p.price} SAR) - ${p.image_filename}`);
  });
});

// Save to JSON for reference
const outputPath = path.join(__dirname, 'missing-images-products.json');
fs.writeFileSync(outputPath, JSON.stringify(productsInfo, null, 2));
console.log('\n' + '='.repeat(80));
console.log(`تم حفظ القائمة في: ${outputPath}`);
console.log('='.repeat(80));
