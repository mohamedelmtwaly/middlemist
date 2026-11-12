const fs = require('fs');
const path = require('path');

console.log('='.repeat(80));
console.log('التحقق من صحة products-transformed.json');
console.log('='.repeat(80));

const transformedPath = path.join(__dirname, 'products-transformed.json');
const transformedData = JSON.parse(fs.readFileSync(transformedPath, 'utf8'));

console.log(`\n✓ تم تحميل ${transformedData.length} منتج`);

// Valid category IDs from previous check
const validCategoryIds = new Set([
  '57d70a1f-20b8-4dbf-800c-6ea29de5a778', // مسكات العروس
  '44ab4768-8ab8-49a2-964e-2779d3860a24', // باقات المناسبات
  'ebc12058-3f22-4a0c-bbe6-1e1b51219685', // بوكسات الهدايا
  '00bb1aa6-49a6-4a38-b83e-5223046274ad', // الفازات
  '04c3fa1e-7f19-499e-b401-4a1ae3fb2e1d', // الأستاندات
  '1972b3d0-405e-47ae-960c-1eb858279d42', // سلات الورد
  '5ca2de77-8221-4537-9582-c1040f751031', // الورد والشوكولاتة
  '57048cbd-36b3-4283-8e62-81449c47467d', // باقات الورد والهدايا
  '3edcc1e9-2221-41ec-bb8a-c6a62021fb82', // البالونات
  '7e0404c0-0259-4548-9dc7-504687b2ff22', // الدباديب
  '91d11ac7-df3e-4aff-a689-e043a615372c', // الطباعة والإضافات
  '8260dfef-f052-4db4-a084-d9a30ebbcb38'  // باقات الورد
]);

const issues = {
  invalid_category_id: [],
  null_category_id: [],
  invalid_description: [],
  missing_image_url: [],
  null_image_url: [],
  placeholder_count: 0,
  missing_required_fields: []
};

transformedData.forEach((p, index) => {
  // Check category_id
  if (!p.category_id) {
    issues.null_category_id.push({ index, name: p.name });
  } else if (!validCategoryIds.has(p.category_id)) {
    issues.invalid_category_id.push({ index, name: p.name, category_id: p.category_id });
  }

  // Check description format
  if (p.description) {
    try {
      // Try to parse if it's a string
      if (typeof p.description === 'string') {
        const parsed = JSON.parse(p.description);
        if (!parsed.ar || typeof parsed.ar !== 'string') {
          issues.invalid_description.push({ index, name: p.name, reason: 'missing ar field' });
        }
      } else if (typeof p.description === 'object') {
        if (!p.description.ar || typeof p.description.ar !== 'string') {
          issues.invalid_description.push({ index, name: p.name, reason: 'missing ar field in object' });
        }
      }
    } catch (e) {
      issues.invalid_description.push({ index, name: p.name, reason: 'parse error' });
    }
  }

  // Check image_url
  if (!p.image_url) {
    issues.missing_image_url.push({ index, name: p.name });
  } else if (p.image_url.includes('placeholder')) {
    issues.placeholder_count++;
  }

  // Check required fields
  if (!p.name || !p.price || p.is_active === undefined) {
    issues.missing_required_fields.push({ index, name: p.name });
  }
});

console.log('\n' + '='.repeat(80));
console.log('تقرير المشاكل:');
console.log('='.repeat(80));

console.log(`\ncategory_id غير صالح: ${issues.invalid_category_id.length}`);
if (issues.invalid_category_id.length > 0 && issues.invalid_category_id.length <= 5) {
  issues.invalid_category_id.forEach(i => {
    console.log(`  - [${i.index}] ${i.name}: ${i.category_id}`);
  });
} else if (issues.invalid_category_id.length > 5) {
  console.log('  (أول 5 فقط)');
  issues.invalid_category_id.slice(0, 5).forEach(i => {
    console.log(`  - [${i.index}] ${i.name}: ${i.category_id}`);
  });
}

console.log(`\ncategory_id null: ${issues.null_category_id.length}`);
if (issues.null_category_id.length > 0) {
  issues.null_category_id.forEach(i => {
    console.log(`  - [${i.index}] ${i.name}`);
  });
}

console.log(`\ndescription غير صالح: ${issues.invalid_description.length}`);
if (issues.invalid_description.length > 0 && issues.invalid_description.length <= 5) {
  issues.invalid_description.forEach(i => {
    console.log(`  - [${i.index}] ${i.name}: ${i.reason}`);
  });
} else if (issues.invalid_description.length > 5) {
  console.log('  (أول 5 فقط)');
  issues.invalid_description.slice(0, 5).forEach(i => {
    console.log(`  - [${i.index}] ${i.name}: ${i.reason}`);
  });
}

console.log(`\nimage_url مفقود: ${issues.missing_image_url.length}`);
if (issues.missing_image_url.length > 0) {
  issues.missing_image_url.forEach(i => {
    console.log(`  - [${i.index}] ${i.name}`);
  });
}

console.log(`\nPlaceholder count: ${issues.placeholder_count}`);

console.log(`\nحقول مطلوبة مفقودة: ${issues.missing_required_fields.length}`);
if (issues.missing_required_fields.length > 0) {
  issues.missing_required_fields.forEach(i => {
    console.log(`  - [${i.index}] ${i.name}`);
  });
}

console.log('\n' + '='.repeat(80));

if (issues.invalid_category_id.length === 0 &&
    issues.null_category_id.length === 0 &&
    issues.invalid_description.length === 0 &&
    issues.missing_image_url.length === 0 &&
    issues.missing_required_fields.length === 0) {
  console.log('✓ جميع المنتجات صالحة للاستيراد');
} else {
  console.log('⚠ يوجد مشاكل تحتاج إصلاح');
}
