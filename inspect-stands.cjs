const data = require('./middlemist-products.json');
const stands = data.products.filter(p => p.source_section === 'استاندات');

console.log('Total stands:', stands.length);
console.log('\n=== FLOWER STANDS PRODUCTS ===\n');

stands.forEach((p, i) => {
  console.log(`${i+1}. ${p.name}`);
  console.log(`   Price: ${p.price} ${p.currency}`);
  console.log(`   Description: ${p.description}`);
  console.log(`   Image: ${p.image_filename}`);
  console.log('');
});
