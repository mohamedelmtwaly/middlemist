const data = require('./middlemist-products.json');

// Find products with stand-related names or descriptions in other sections
const otherStands = data.products.filter(p => {
  if (p.source_section === 'استاندات') return false;

  const nameHasStand = p.name.includes('استاند') || p.name.includes('ستاند');
  const descHasStand = p.description && (p.description.includes('استاند') || p.description.includes('ستاند'));

  // Exclude printing products that mention "استاندات" as in "طباعه اطواب استاندات"
  if (p.name.includes('طباع') || p.description?.includes('طباع')) {
    return false;
  }

  return nameHasStand || descHasStand;
});

console.log('=== STAND PRODUCTS IN OTHER SECTIONS ===\n');
console.log(`Total found: ${otherStands.length}\n`);

otherStands.forEach((p, i) => {
  console.log(`${i+1}. ${p.name}`);
  console.log(`   Section: ${p.source_section}`);
  console.log(`   Price: ${p.price} ${p.currency}`);
  console.log(`   Description: ${p.description}`);
  console.log(`   Image: ${p.image_filename}`);
  console.log('');
});
