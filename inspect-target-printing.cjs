const data = require('./middlemist-products.json');

// The 11 specific products from the user's list
const targetProducts = [
  'طباعات اكرلك على حسب الطلب',
  'طباعه',
  'ثيم العيد',
  'اكرليك',
  'طباعه ملونه وعادي',
  'طباعه أكواب',
  'اكرليك ذهبي 3 ملي',
  'طباعه اكرليك',
  'تغرسه اكرليك',
  'طباعه استيكر',
  'شرايط مطبوعه'
];

// Find these products in the JSON
const foundProducts = targetProducts.map(name => {
  const product = data.products.find(p => p.name === name);
  return product ? { ...product, found: true } : { name, found: false };
});

console.log('=== TARGET PRINTING PRODUCTS (11) ===\n');

foundProducts.forEach((p, i) => {
  if (p.found) {
    console.log(`${i+1}. ${p.name} ✅`);
    console.log(`   Section: ${p.source_section}`);
    console.log(`   Price: ${p.price} ${p.currency}`);
    console.log(`   Description: ${p.description}`);
    console.log(`   Image: ${p.image_filename}`);
  } else {
    console.log(`${i+1}. ${p.name} ❌ NOT FOUND`);
  }
  console.log('');
});

// Also check the deferred product
const deferredProduct = data.products.find(p => p.name === 'لقو نحت اكرليك');
console.log('=== DEFERRED PRODUCT ===\n');
if (deferredProduct) {
  console.log(`Name: ${deferredProduct.name}`);
  console.log(`Section: ${deferredProduct.source_section}`);
  console.log(`Price: ${deferredProduct.price} ${deferredProduct.currency}`);
  console.log(`Description: ${deferredProduct.description}`);
  console.log(`Image: ${deferredProduct.image_filename}`);
} else {
  console.log('NOT FOUND');
}
