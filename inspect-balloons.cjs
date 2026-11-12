const data = require('./middlemist-products.json');

// The 55 target products with their image filenames
const targetProducts = [
  { name: 'balloon Number Rose gold', image: 'rose-bouquet-124.webp', price: 57.5 },
  { name: 'balloon latters Rose gold', image: 'rose-bouquet-125.webp', price: 57.5 },
  { name: 'balloons Numbers gold', image: 'rose-bouquet-126.webp', price: 57.5 },
  { name: 'balloones latter gold', image: 'rose-bouquet-127.webp', price: 57.5 },
  { name: 'balloons Number sliver', image: 'rose-bouquet-128.webp', price: 57.5 },
  { name: 'balloones latter sliver', image: 'balloon-arrangement-017.webp', price: 57.5 },
  { name: 'Chrome latex 12"', image: 'balloon-arrangement-018.webp', price: 110.4 },
  { name: 'باقة بالونات كروم هيليوم 1', image: 'balloon-arrangement-019.webp', price: 124.2 },
  { name: 'Latex 12"', image: 'balloon-arrangement-020.webp', price: 41.4 },
  { name: 'باقة بالونات هيليوم ذهبية', image: 'balloon-arrangement-021.webp', price: 41.4 },
  { name: 'باقة بالونات هيليوم فوشيا', image: 'balloon-arrangement-022.webp', price: 82.8 },
  { name: 'باقة بالونات هيليوم أزرق غامق', image: 'balloon-arrangement-023.webp', price: 82.8 },
  { name: 'باقة بالونات هيليوم سوداء', image: 'balloon-arrangement-024.webp', price: 41.4 },
  { name: 'باقة بالونات هيليوم اصفر غامق (مكرر)', image: 'balloon-arrangement-025.webp', price: 41.4 },
  { name: 'باقة بالونات هيليوم حمراء', image: 'balloon-arrangement-026.webp', price: 41.4 },
  { name: 'باقة بالونات هيليوم بنفسجية', image: 'balloon-arrangement-027.webp', price: 41.4 },
  { name: 'latex balloons Chrome', image: 'balloon-arrangement-028.webp', price: 13.8 },
  { name: 'Latex balloons', image: 'balloon-arrangement-029.webp', price: 6.9 },
  { name: 'باقة مولود جديد ولد 3', image: 'balloon-arrangement-030.webp', price: 99 },
  { name: 'باقة عيد ميلاد سعيد 2', image: 'balloon-arrangement-031.webp', price: 99 },
  { name: 'باقة عيد ميلاد سعيد 3', image: 'balloon-arrangement-032.webp', price: 99 },
  { name: 'باقة عيد ميلاد سعيد 4', image: 'balloon-arrangement-033.webp', price: 99 },
  { name: 'باقة عيد ميلاد سعيد 5', image: 'balloon-arrangement-034.webp', price: 99 },
  { name: 'باقة عيد ميلاد سعيد 6', image: 'balloon-arrangement-035.webp', price: 99 },
  { name: 'باقة عيد ميلاد سعيد 7', image: 'balloon-arrangement-036.webp', price: 99 },
  { name: 'باقة عيد ميلاد سعيد 8', image: 'balloon-arrangement-037.webp', price: 99 },
  { name: 'باقة عيد ميلاد سعيد 9', image: 'balloon-arrangement-038.webp', price: 99 },
  { name: 'باقة عيد ميلاد سعيد 10', image: 'balloon-arrangement-039.webp', price: 99 },
  { name: 'باقة عيد ميلاد سعيد 1', image: 'balloon-arrangement-040.webp', price: 99 },
  { name: 'باقة مولود جديد ولد 3 (مكرر)', image: 'balloon-arrangement-041.webp', price: 99 },
  { name: 'باقة مولود جديد ولد 2', image: 'balloon-arrangement-042.webp', price: 99 },
  { name: 'باقة مولود جديد ولد 2 (مكرر)', image: 'balloon-arrangement-043.webp', price: 239 },
  { name: 'باقة تحديد جنس المولود ولد', image: 'balloon-arrangement-044.webp', price: 129 },
  { name: 'باقة مولود جديد ولد 4', image: 'balloon-arrangement-045.webp', price: 99 },
  { name: 'باقة مولود جديد ولد 1', image: 'balloon-arrangement-046.webp', price: 89 },
  { name: 'باقة الباستيل', image: 'balloon-arrangement-047.webp', price: 129 },
  { name: 'باقة زواج 2', image: 'balloon-arrangement-048.webp', price: 99 },
  { name: 'أنا أحبك', image: 'balloon-arrangement-049.webp', price: 99 },
  { name: 'باقة تمنيات سعيدة', image: 'balloon-arrangement-050.webp', price: 99 },
  { name: 'باقة ذكرى الزواج', image: 'balloon-arrangement-051.webp', price: 99 },
  { name: 'رقم رز جولد (ذهبي وردي) 34 بوصة', image: 'balloon-arrangement-052.webp', price: 99 },
  { name: 'باقة تخرج 2', image: 'balloon-arrangement-053.webp', price: 92 },
  { name: 'باقة بالونات حروف هيليوم فضية', image: 'balloon-arrangement-054.webp', price: 92 },
  { name: 'باقة بالونات حروف هيليوم ذهبية', image: 'balloon-arrangement-055.webp', price: 92 },
  { name: 'باقة بالونات حروف هيليوم رز جولد', image: 'balloon-arrangement-056.webp', price: 49 },
  { name: 'باقة الأناناس', image: 'balloon-arrangement-057.webp', price: 49 },
  { name: 'باقة زواج 2 (مكرر)', image: 'balloon-arrangement-058.webp', price: 99 },
  { name: 'باقة عيد الأم 1', image: 'balloon-arrangement-059.webp', price: 99 },
  { name: 'باقة عيد أم سعيدة 2', image: 'balloon-arrangement-060.webp', price: 99 },
  { name: 'باقة الحب 1', image: 'balloon-arrangement-061.webp', price: 99 },
  { name: 'باقة الحب 2', image: 'balloon-arrangement-062.webp', price: 99 },
  { name: 'باقة الحب 4', image: 'balloon-arrangement-063.webp', price: 99 },
  { name: 'باقة تخرج 6', image: 'balloon-arrangement-064.webp', price: 99 },
  { name: 'باقة تخرج 7', image: 'balloon-arrangement-065.webp', price: 99 },
  { name: 'باقة تخرج 8', image: 'balloon-arrangement-066.webp', price: 99 }
];

console.log('=== MATCHING BALLOON PRODUCTS WITH JSON ===\n');

const matchedProducts = targetProducts.map(target => {
  const product = data.products.find(p => p.image_filename === target.image);
  if (product) {
    return {
      target,
      found: true,
      jsonPrice: product.price,
      jsonName: product.name,
      jsonDescription: product.description,
      jsonSection: product.source_section
    };
  } else {
    return {
      target,
      found: false
    };
  }
});

matchedProducts.forEach((item, i) => {
  console.log(`${i+1}. ${item.target.name}`);
  console.log(`   Image: ${item.target.image}`);
  console.log(`   Target Price: ${item.target.price} SAR`);
  
  if (item.found) {
    console.log(`   ✅ Found in JSON`);
    console.log(`   JSON Price: ${item.jsonPrice} SAR`);
    console.log(`   JSON Name: ${item.jsonName}`);
    console.log(`   JSON Section: ${item.jsonSection}`);
    console.log(`   JSON Description: ${item.jsonDescription}`);
    
    // Check price match
    if (item.jsonPrice !== item.target.price) {
      console.log(`   ⚠️  PRICE MISMATCH: Target ${item.target.price} vs JSON ${item.jsonPrice}`);
    }
  } else {
    console.log(`   ❌ NOT FOUND in JSON`);
  }
  console.log('');
});

// Summary
const foundCount = matchedProducts.filter(p => p.found).length;
const notFoundCount = matchedProducts.filter(p => !p.found).length;
const priceMismatches = matchedProducts.filter(p => p.found && p.jsonPrice !== p.target.price).length;

console.log('=== SUMMARY ===');
console.log(`Total target products: ${targetProducts.length}`);
console.log(`Found in JSON: ${foundCount}`);
console.log(`Not found in JSON: ${notFoundCount}`);
console.log(`Price mismatches: ${priceMismatches}`);
