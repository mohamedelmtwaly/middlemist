const fs = require('fs');
const path = require('path');

const mappingPath = path.join(__dirname, 'product-image-mapping.json');
const imagesDir = path.join(__dirname, 'src', 'assets', 'middlemist-images');

console.log('='.repeat(60));
console.log('فحص مطابقة الصور مع المنتجات');
console.log('='.repeat(60));

// Read mapping file
const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
console.log(`\n1. عدد سجلات المنتجات في ملف الربط: ${mapping.length}`);

// Get all images in directory
const allImageFiles = fs.readdirSync(imagesDir).filter(f => f.endsWith('.webp'));
console.log(`2. عدد الصور في مجلد middlemist-images: ${allImageFiles.length}`);

// Check each mapping
const imageNamesInMapping = new Set();
const missingImages = [];
const foundImages = [];
const duplicateImageNames = new Map();

mapping.forEach((item, index) => {
  const productName = item['اسم المنتج'];
  const imageName = item['اسم الصورة بالإنجليزي (بدون الامتداد)'];
  const expectedFile = `${imageName}.webp`;

  imageNamesInMapping.add(imageName);

  // Check for duplicates
  if (imageNamesInMapping.has(imageName) && [...imageNamesInMapping].filter(n => n === imageName).length > 1) {
    if (!duplicateImageNames.has(imageName)) {
      duplicateImageNames.set(imageName, []);
    }
    duplicateImageNames.get(imageName).push({ index, productName });
  }

  const exists = allImageFiles.includes(expectedFile);
  if (exists) {
    foundImages.push({ productName, imageName, expectedFile });
  } else {
    missingImages.push({ productName, imageName, expectedFile });
  }
});

console.log(`3. عدد الصور المطابقة (موجودة): ${foundImages.length}`);
console.log(`4. عدد الصور المفقودة (غير موجودة): ${missingImages.length}`);

// Find unused images
const usedImageNames = new Set(mapping.map(m => m['اسم الصورة بالإنجليزي (بدون الامتداد)']));
const unusedImages = allImageFiles.filter(f => !usedImageNames.has(f.replace('.webp', '')));
console.log(`5. عدد الصور الموجودة في المجلد وغير المستخدمة في ملف الربط: ${unusedImages.length}`);

// Check for duplicate image names
const imageCounts = {};
mapping.forEach(item => {
  const name = item['اسم الصورة بالإنجليزي (بدون الامتداد)'];
  imageCounts[name] = (imageCounts[name] || 0) + 1;
});
const duplicates = Object.entries(imageCounts).filter(([name, count]) => count > 1);
console.log(`6. عدد أسماء الصور المكررة في ملف الربط: ${duplicates.length}`);

console.log('\n' + '='.repeat(60));
console.log('تفاصيل الصور المفقودة:');
console.log('='.repeat(60));
if (missingImages.length > 0) {
  missingImages.forEach(({ productName, expectedFile }) => {
    console.log(`  - ${productName} → ${expectedFile}`);
  });
} else {
  console.log('  لا توجد صور مفقودة ✓');
}

console.log('\n' + '='.repeat(60));
console.log('أسماء الصور المكررة في ملف الربط:');
console.log('='.repeat(60));
if (duplicates.length > 0) {
  duplicates.forEach(([name, count]) => {
    console.log(`  - ${name} (يظهر ${count} مرة)`);
    // Show which products use this image
    const products = mapping.filter(m => m['اسم الصورة بالإنجليزي (بدون الامتداد)'] === name)
      .map(m => m['اسم المنتج']);
    console.log(`    المنتجات: ${products.join(', ')}`);
  });
} else {
  console.log('  لا توجد أسماء صور مكررة ✓');
}

console.log('\n' + '='.repeat(60));
console.log('الصور الموجودة في المجلد وغير المستخدمة:');
console.log('='.repeat(60));
if (unusedImages.length > 0) {
  unusedImages.forEach(file => {
    console.log(`  - ${file}`);
  });
} else {
  console.log('  جميع الصور مستخدمة ✓');
}

console.log('\n' + '='.repeat(60));
console.log('ربط يبدو غير منطقي (للمراجعة):');
console.log('='.repeat(60));

// Check for suspicious mappings
const suspicious = [];

// 1. Product names with "balloon" mapped to non-balloon images
mapping.forEach(item => {
  const product = item['اسم المنتج'].toLowerCase();
  const image = item['اسم الصورة بالإنجليزي (بدون الامتداد)'].toLowerCase();

  if (product.includes('balloon') || product.includes('بالون')) {
    if (!image.includes('balloon')) {
      suspicious.push({
        type: 'منتج بالونات → صورة غير بالونات',
        product: item['اسم المنتج'],
        image: item['اسم الصورة بالإنجليزي (بدون الامتداد)']
      });
    }
  }

  // 2. Product names with "rose" mapped to non-rose images
  if (product.includes('rose') || product.includes('ورد') || product.includes('باقة')) {
    if (!image.includes('rose') && !image.includes('bouquet') && !image.includes('vase') && !image.includes('basket')) {
      suspicious.push({
        type: 'منتج ورد/باقة → صورة غير ورد',
        product: item['اسم المنتج'],
        image: item['اسم الصورة بالإنجليزي (بدون الامتداد)']
      });
    }
  }

  // 3. Product names with "chocolate" mapped to non-chocolate images
  if (product.includes('chocolate') || product.includes('شوكولات') || product.includes('كيك')) {
    if (!image.includes('chocolate') && !image.includes('gift')) {
      suspicious.push({
        type: 'منتج شوكولاتة → صورة غير شوكولاتة',
        product: item['اسم المنتج'],
        image: item['اسم الصورة بالإنجليزي (بدون الامتداد)']
      });
    }
  }

  // 4. Product names with "teddy" or "دبدوب" mapped to non-teddy images
  if (product.includes('teddy') || product.includes('دبدوب') || product.includes('هولكاتي')) {
    if (!image.includes('teddy') && !image.includes('bear')) {
      suspicious.push({
        type: 'منتج دبدوب → صورة غير دبدوب',
        product: item['اسم المنتج'],
        image: item['اسم الصورة بالإنجليزي (بدون الامتداد)']
      });
    }
  }

  // 5. Product names with "فازة" or "vase" mapped to non-vase images
  if (product.includes('فاز') || product.includes('vase')) {
    if (!image.includes('vase')) {
      suspicious.push({
        type: 'منتج فازة → صورة غير فازة',
        product: item['اسم المنتج'],
        image: item['اسم الصورة بالإنجليزي (بدون الامتداد)']
      });
    }
  }
});

if (suspicious.length > 0) {
  suspicious.forEach(({ type, product, image }) => {
    console.log(`  [${type}]`);
    console.log(`    المنتج: ${product}`);
    console.log(`    الصورة: ${image}.webp`);
  });
} else {
  console.log('  لا توجد روابط تبدو غير منطقية ملحوظة ✓');
}

console.log('\n' + '='.repeat(60));
console.log('ملخص الأرقام:');
console.log('='.repeat(60));
console.log(`  إجمالي السجلات في ملف الربط: ${mapping.length}`);
console.log(`  إجمالي الصور في المجلد: ${allImageFiles.length}`);
console.log(`  الصور المطابقة: ${foundImages.length} (${((foundImages.length/mapping.length)*100).toFixed(1)}%)`);
console.log(`  الصور المفقودة: ${missingImages.length} (${((missingImages.length/mapping.length)*100).toFixed(1)}%)`);
console.log(`  الصور غير المستخدمة: ${unusedImages.length}`);
console.log(`  أسماء الصور المكررة: ${duplicates.length}`);
console.log(`  روابط مشبوهة: ${suspicious.length}`);
console.log('='.repeat(60));
