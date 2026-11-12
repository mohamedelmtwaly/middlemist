const fs = require('fs');
const path = require('path');

console.log('='.repeat(80));
console.log('فحص legacy_id في products-transformed.json (READ ONLY)');
console.log('='.repeat(80));

const transformedPath = path.join(__dirname, 'products-transformed.json');
const transformedData = JSON.parse(fs.readFileSync(transformedPath, 'utf8'));

console.log(`\n✓ تم تحميل ${transformedData.length} منتج`);

// Analyze legacy_id
const legacyIdStats = {
  total: transformedData.length,
  unique: new Set(),
  nullCount: 0,
  emptyStringCount: 0,
  duplicates: new Map()
};

const productMap = new Map(); // legacy_id -> array of product names

transformedData.forEach((p, index) => {
  const legacyId = p.legacy_id;
  const productName = p.name;

  // Count null and empty strings
  if (legacyId === null) {
    legacyIdStats.nullCount++;
  } else if (legacyId === '') {
    legacyIdStats.emptyStringCount++;
  }

  // Track unique values
  if (legacyId !== null && legacyId !== '') {
    legacyIdStats.unique.add(legacyId);
  }

  // Track duplicates
  if (legacyId !== null && legacyId !== '') {
    if (!productMap.has(legacyId)) {
      productMap.set(legacyId, []);
    }
    productMap.get(legacyId).push({ index, name: productName });
  }
});

// Find duplicates
productMap.forEach((products, legacyId) => {
  if (products.length > 1) {
    legacyIdStats.duplicates.set(legacyId, products);
  }
});

console.log('\n' + '='.repeat(80));
console.log('إحصائيات legacy_id:');
console.log('='.repeat(80));
console.log(`إجمالي المنتجات: ${legacyIdStats.total}`);
console.log(`قيم legacy_id الفريدة: ${legacyIdStats.unique.size}`);
console.log(`legacy_id null: ${legacyIdStats.nullCount}`);
console.log(`legacy_id فارغ (empty string): ${legacyIdStats.emptyStringCount}`);
console.log(`legacy_id مكرر: ${legacyIdStats.duplicates.size}`);

if (legacyIdStats.duplicates.size > 0) {
  console.log('\nالقيم المكررة:');
  legacyIdStats.duplicates.forEach((products, legacyId) => {
    console.log(`\n  legacy_id: "${legacyId}" (${products.length} منتج)`);
    products.forEach(p => {
      console.log(`    - [${p.index}] ${p.name}`);
    });
  });
}

// Check if duplicate names have different legacy_ids
const nameMap = new Map();
transformedData.forEach(p => {
  if (!nameMap.has(p.name)) {
    nameMap.set(p.name, []);
  }
  nameMap.get(p.name).push(p.legacy_id);
});

let nameWithDifferentLegacyIds = 0;
console.log('\n' + '='.repeat(80));
console.log('فحص الأسماء المكررة و legacy_id:');
console.log('='.repeat(80));

nameMap.forEach((legacyIds, name) => {
  if (legacyIds.length > 1) {
    const uniqueLegacyIds = new Set(legacyIds.filter(l => l !== null && l !== ''));
    if (uniqueLegacyIds.size > 1) {
      nameWithDifferentLegacyIds++;
      console.log(`\n  اسم مكرر: "${name}"`);
      console.log(`    legacy_ids: ${Array.from(uniqueLegacyIds).join(', ')}`);
    }
  }
});

if (nameWithDifferentLegacyIds === 0) {
  console.log('✓ لا توجد أسماء مكررة لها legacy_ids مختلفة');
}

console.log('\n' + '='.repeat(80));
