const fs = require('fs');
const path = require('path');

const mappingPath = path.join(__dirname, 'product-image-mapping.json');
const imagesDir = path.join(__dirname, 'src', 'assets', 'middlemist-images');
const backupDir = path.join(__dirname, 'src', 'assets', 'middlemist-images-backup');

console.log('='.repeat(80));
console.log('تحليل الصور المفقودة والبحث عن بدائل (الإصدار المحسن)');
console.log('='.repeat(80));

// Read mapping file
const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

// Get all images in both directories
const mainImages = fs.readdirSync(imagesDir).filter(f => f.endsWith('.webp'));
const backupImages = fs.readdirSync(backupDir).filter(f => f.endsWith('.webp'));

console.log(`\nالصور في المجلد الرئيسي: ${mainImages.length}`);
console.log(`الصور في مجلد النسخة الاحتياطية: ${backupImages.length}`);

// Missing images from previous analysis
const missingImageNames = [
  'chocolate-gift-003.webp',
  'flower-vase-003.webp',
  'chocolate-gift-005.webp',
  'flower-stand-010.webp',
  'gift-box-008.webp',
  'gift-box-009.webp',
  'rose-bouquet-006.webp',
  'flower-vase-005.webp',
  'flower-vase-006.webp',
  'flower-vase-007.webp',
  'flower-vase-008.webp',
  'rose-bouquet-007.webp',
  'flower-vase-019.webp',
  'flower-vase-021.webp',
  'flower-vase-022.webp',
  'flower-vase-023.webp',
  'flower-vase-024.webp',
  'flower-vase-026.webp',
  'flower-vase-029.webp',
  'flower-vase-031.webp',
  'flower-vase-032.webp',
  'rose-bouquet-008.webp',
  'flower-vase-034.webp',
  'flower-vase-037.webp',
  'flower-vase-039.webp',
  'flower-vase-046.webp',
  'flower-vase-048.webp',
  'flower-vase-049.webp',
  'flower-vase-050.webp',
  'flower-vase-052.webp',
  'flower-vase-057.webp',
  'teddy-bear-001.webp',
  'balloon-arrangement-007.webp',
  'rose-bouquet-027.webp',
  'rose-bouquet-038.webp',
  'rose-bouquet-049.webp',
  'rose-bouquet-059.webp',
  'rose-bouquet-096.webp',
  'chocolate-gift-016.webp',
  'rose-bouquet-099.webp',
  'rose-bouquet-101.webp',
  'rose-bouquet-102.webp',
  'gift-box-013.webp',
  'chocolate-gift-018.webp',
  'chocolate-gift-019.webp',
  'flower-necklace-002.webp',
  'teddy-bear-013.webp',
  'rose-bouquet-122.webp',
  'rose-bouquet-123.webp',
  'rose-bouquet-124.webp',
  'rose-bouquet-125.webp',
  'rose-bouquet-126.webp',
  'rose-bouquet-127.webp',
  'rose-bouquet-128.webp'
];

// Known typos mapping
const knownTypos = {
  'ose-bouquet': 'rose-bouquet',
  'lower-stand': 'flower-stand',
  'batchi-rose': 'batchi-rose'
};

// Function to find similar file names (more strict)
function findSimilarFiles(targetName, allFiles) {
  const baseName = targetName.replace('.webp', '');
  const similar = [];

  allFiles.forEach(file => {
    const fileName = file.replace('.webp', '');

    // Exact match with (2), (3), etc.
    if (fileName === `${baseName} (2)` || fileName === `${baseName} (3)`) {
      similar.push({ file, confidence: 'عالية', reason: 'نسخة احتياطية مطابقة' });
      return;
    }

    // Check for known typos (ose -> rose, lower -> flower)
    Object.entries(knownTypos).forEach(([wrong, correct]) => {
      if (fileName.includes(wrong) && baseName.includes(correct)) {
        // Extract the number part
        const targetNum = baseName.replace(/^[a-z-]+-/, '');
        const fileNum = fileName.replace(/^[a-z-]+-/, '');
        if (targetNum === fileNum) {
          similar.push({ file, confidence: 'عالية', reason: 'خطأ إملائي واضح (مسافة/حرف مفقود)' });
        }
      }
    });

    // Check for missing characters at start (ose-bouquet-040 -> rose-bouquet-040)
    if (fileName.startsWith('ose-') && baseName.startsWith('rose-')) {
      const targetNum = baseName.replace('rose-', '');
      const fileNum = fileName.replace('ose-', '');
      if (targetNum === fileNum) {
        similar.push({ file, confidence: 'عالية', reason: 'حرف مفقود في البداية (r)' });
      }
    }

    // Check for missing characters at start (lower-stand -> flower-stand)
    if (fileName.startsWith('lower-') && baseName.startsWith('flower-')) {
      const targetNum = baseName.replace('flower-', '');
      const fileNum = fileName.replace('lower-', '');
      if (targetNum === fileNum) {
        similar.push({ file, confidence: 'عالية', reason: 'كلمة مختصرة (lower بدلاً من flower)' });
      }
    }
  });

  return similar;
}

// Analyze each missing image
console.log('\n' + '='.repeat(80));
console.log('تحليل الصور المفقودة:');
console.log('='.repeat(80));

const allFiles = [...mainImages, ...backupImages];
const analysisResults = [];

missingImageNames.forEach(missingName => {
  // Find the product that uses this image
  const product = mapping.find(m => m['اسم الصورة بالإنجليزي (بدون الامتداد)'] === missingName.replace('.webp', ''));

  const productName = product ? product['اسم المنتج'] : 'غير معروف';

  // Check if file exists in either directory
  const existsInMain = mainImages.includes(missingName);
  const existsInBackup = backupImages.includes(missingName);

  let alternatives = [];
  let status = 'غير موجودة';

  if (existsInMain || existsInBackup) {
    status = existsInMain ? 'موجودة في المجلد الرئيسي' : 'موجودة في النسخة الاحتياطية';
  } else {
    // Find similar files
    alternatives = findSimilarFiles(missingName, allFiles);
    if (alternatives.length > 0) {
      status = 'وجدت بدائل محتملة';
    }
  }

  analysisResults.push({
    productName,
    missingName,
    status,
    alternatives,
    existsInMain,
    existsInBackup
  });
});

// Display results
analysisResults.forEach((result, index) => {
  console.log(`\n${index + 1}. المنتج: ${result.productName}`);
  console.log(`   الصورة المتوقعة: ${result.missingName}`);

  if (result.existsInMain) {
    console.log(`   ✓ موجودة في: src/assets/middlemist-images/`);
  } else if (result.existsInBackup) {
    console.log(`   ✓ موجودة في: src/assets/middlemist-images-backup/`);
  } else if (result.alternatives.length > 0) {
    console.log(`   الحالة: وجدت بدائل محتملة`);
    result.alternatives.forEach(alt => {
      const dir = mainImages.includes(alt.file) ? 'main' : 'backup';
      console.log(`     - ${alt.file} (${dir}) - الثقة: ${alt.confidence} - ${alt.reason}`);
    });
  } else {
    console.log(`   ✗ لم يتم العثور على بديل`);
  }
});

// Summary
console.log('\n' + '='.repeat(80));
console.log('ملخص التحليل:');
console.log('='.repeat(80));

const foundInMain = analysisResults.filter(r => r.existsInMain).length;
const foundInBackup = analysisResults.filter(r => r.existsInBackup && !r.existsInMain).length;
const withAlternatives = analysisResults.filter(r => !r.existsInMain && !r.existsInBackup && r.alternatives.length > 0).length;
const trulyMissing = analysisResults.filter(r => !r.existsInMain && !r.existsInBackup && r.alternatives.length === 0).length;

console.log(`الصور الموجودة في المجلد الرئيسي: ${foundInMain}`);
console.log(`الصور الموجودة في النسخة الاحتياطية فقط: ${foundInBackup}`);
console.log(`الصور بدائل محتملة: ${withAlternatives}`);
console.log(`الصور فعليًا غير موجودة: ${trulyMissing}`);

// List the truly missing images
if (trulyMissing > 0) {
  console.log('\nالصور فعليًا غير موجودة:');
  analysisResults.filter(r => !r.existsInMain && !r.existsInBackup && r.alternatives.length === 0).forEach(r => {
    console.log(`  - ${r.missingName} (${r.productName})`);
  });
}

console.log('\n' + '='.repeat(80));
