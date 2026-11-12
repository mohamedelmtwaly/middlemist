const data = require('./middlemist-products.json');
const vases = data.products.filter(p => p.source_section === 'فازات');

console.log('Total vases:', vases.length);
console.log('\n=== VASES PRODUCTS ===\n');

vases.forEach((p, i) => {
  console.log(`${i+1}. ${p.name}`);
  console.log(`   Price: ${p.price} ${p.currency}`);
  console.log(`   Description: ${p.description}`);
  console.log(`   Image: ${p.image_filename}`);
  console.log('');
});
