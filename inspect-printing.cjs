const data = require('./middlemist-products.json');

// Look for printing-related products
const printingProducts = data.products.filter(p => {
  // Filter by source_section if it exists
  if (p.source_section === 'طباعة') return true;
  if (p.source_section === 'طباعة والإضافات') return true;

  // Also check by name/description if section doesn't match
  const nameKeywords = ['طباع', 'اكرليك', 'ثيم', 'استيكر', 'شرايط', 'تغرسه'];
  const nameMatch = nameKeywords.some(kw => p.name.includes(kw));
  const descMatch = p.description && nameKeywords.some(kw => p.description.includes(kw));

  return nameMatch || descMatch;
});

console.log('=== PRINTING & ADDONS PRODUCTS ===\n');
console.log(`Total found: ${printingProducts.length}\n`);

printingProducts.forEach((p, i) => {
  console.log(`${i+1}. ${p.name}`);
  console.log(`   Section: ${p.source_section}`);
  console.log(`   Price: ${p.price} ${p.currency}`);
  console.log(`   Description: ${p.description}`);
  console.log(`   Image: ${p.image_filename}`);
  console.log('');
});
