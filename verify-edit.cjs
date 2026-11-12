const fs = require('fs');

const data = JSON.parse(fs.readFileSync('product-image-mapping.json', 'utf8'));

console.log('JSON صالح ✓');

// Find all records with product name "استاند"
const records = data.filter(r => r['اسم المنتج'] === 'استاند');
console.log('عدد السجلات باسم "استاند":', records.length);

records.forEach((r, i) => {
  console.log(`\n${i + 1}. ${JSON.stringify(r, null, 2)}`);
});
