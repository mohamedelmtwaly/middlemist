const data = require('./middlemist-products.json');

// Find products with vase-related names or descriptions in other sections
const otherVases = data.products.filter(p => {
  if (p.source_section === 'فازات') return false;

  const nameHasVase = p.name.includes('فاز') || p.name.includes('فازة') || p.name.includes('فازات');
  const descHasVase = p.description && (p.description.includes('فاز') || p.description.includes('فازة') || p.description.includes('فازات'));

  return nameHasVase || descHasVase;
});

console.log('=== VASE PRODUCTS IN OTHER SECTIONS ===\n');
console.log(`Total found: ${otherVases.length}\n`);

otherVases.forEach((p, i) => {
  console.log(`${i+1}. ${p.name}`);
  console.log(`   Section: ${p.source_section}`);
  console.log(`   Price: ${p.price} ${p.currency}`);
  console.log(`   Description: ${p.description}`);
  console.log(`   Image: ${p.image_filename}`);
  console.log('');
});
