const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

console.log('='.repeat(80));
console.log('تحليل ومطابقة صور المنتجات (READ ONLY)');
console.log('='.repeat(80));

// Load environment variables (Secret Key for storage list access in read-only mode)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  console.error('✗ خطأ: متغيرات البيئة غير موجودة');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'موجود' : 'مفقود');
  console.error('SUPABASE_SECRET_KEY:', supabaseSecretKey ? 'موجود' : 'مفقود');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseSecretKey);

console.log('\n⚠ تحذير: استخدام Secret Key للفحص فقط (READ ONLY)');
console.log('   لن يتم إجراء أي تعديلات على قاعدة البيانات أو Storage');

// Load mapping
const mappingPath = path.join(__dirname, 'product-image-mapping.json');
const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

console.log(`\n✓ تم تحميل product-image-mapping.json: ${mapping.length} منتج`);

// Arabic text normalization
function normalizeArabic(text) {
  if (!text) return '';
  // Remove diacritics
  text = text.replace(/[\u064B-\u065F\u0670]/g, '');
  // Normalize alef variations
  text = text.replace(/[أإآ]/g, 'ا');
  // Normalize teh marbuta
  text = text.replace(/ة/g, 'ه');
  // Normalize alef maqsura
  text = text.replace(/ى/g, 'ي');
  // Remove extra spaces
  text = text.replace(/\s+/g, ' ').trim();
  // Remove hamza
  text = text.replace(/[\u0621-\u0622]/g, '');
  return text.toLowerCase();
}

// Calculate similarity score
function calculateSimilarity(str1, str2) {
  const norm1 = normalizeArabic(str1);
  const norm2 = normalizeArabic(str2);

  if (norm1 === norm2) return 100;

  // Check if one contains the other
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    const shorter = Math.min(norm1.length, norm2.length);
    const longer = Math.max(norm1.length, norm2.length);
    return Math.round((shorter / longer) * 100);
  }

  // Word-based similarity
  const words1 = norm1.split(' ');
  const words2 = norm2.split(' ');

  let matches = 0;
  words1.forEach(w1 => {
    if (words2.some(w2 => w2.includes(w1) || w1.includes(w2))) {
      matches++;
    }
  });

  const wordSimilarity = (matches / Math.max(words1.length, words2.length)) * 100;
  return Math.round(wordSimilarity);
}

// Get best match from mapping
function findBestMatch(productName, categoryName, mapping) {
  let bestMatch = null;
  let bestScore = 0;
  let bestReason = '';

  const normProductName = normalizeArabic(productName);
  const normCategoryName = normalizeArabic(categoryName);

  mapping.forEach(m => {
    const mappingName = m['اسم المنتج'];
    const imageName = m['اسم الصورة بالإنجليزي (بدون الامتداد)'];
    const normMappingName = normalizeArabic(mappingName);

    // Exact match
    if (normProductName === normMappingName) {
      return {
        mappingName,
        imageName,
        score: 100,
        reason: 'تطابق تام بعد التوحيد'
      };
    }

    // Contains match
    if (normProductName.includes(normMappingName) || normMappingName.includes(normProductName)) {
      const score = calculateSimilarity(productName, mappingName);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = { mappingName, imageName };
        bestReason = 'تطابق جزئي (احتواء)';
      }
    }

    // Word-based match
    const productWords = normProductName.split(' ');
    const mappingWords = normMappingName.split(' ');
    let wordMatches = 0;
    productWords.forEach(w => {
      if (mappingWords.some(mw => mw.includes(w) || w.includes(mw))) {
        wordMatches++;
      }
    });

    if (wordMatches > 0) {
      const score = (wordMatches / Math.max(productWords.length, mappingWords.length)) * 100;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = { mappingName, imageName };
        bestReason = `تطابق كلمات (${wordMatches}/${Math.max(productWords.length, mappingWords.length)})`;
      }
    }
  });

  if (bestMatch) {
    return {
      mappingName: bestMatch.mappingName,
      imageName: bestMatch.imageName,
      score: bestScore,
      reason: bestReason
    };
  }

  return null;
}

// Main analysis function
async function analyzeMatching() {
  try {
    console.log('\nجاري جلب المنتجات من Supabase...');
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, category, image_url')
      .order('name', { ascending: true });

    if (error) {
      console.error('✗ خطأ في جلب المنتجات:', error.message);
      return;
    }

    console.log(`✓ تم جلب ${products.length} منتج`);

    console.log('\nجاري فحص الصور في Supabase Storage...');
    const { data: storageFiles, error: storageError } = await supabase
      .storage
      .from('product-images')
      .list('products', { limit: 1000 });

    if (storageError) {
      console.error('✗ خطأ في فحص Storage:', storageError.message);
      return;
    }

    console.log(`✓ تم العثور على ${storageFiles.length} صورة في products/`);

    const storageFileNames = new Set(storageFiles.map(f => f.name));

    console.log('\nجاري تحليل المطابقة...');
    const results = [];
    const stats = {
      exact_match: 0,
      high_confidence: 0,
      needs_review: 0,
      no_match: 0,
      missing_image: 0
    };

    const usedImages = new Set();

    products.forEach(product => {
      const match = findBestMatch(product.name, product.category, mapping);
      const imageFilename = match ? `${match.imageName}.webp` : null;
      const storagePath = imageFilename ? `products/${imageFilename}` : null;
      const publicUrl = storagePath
        ? `${supabaseUrl}/storage/v1/object/public/product-images/${storagePath}`
        : null;
      const imageExists = imageFilename ? storageFileNames.has(imageFilename) : false;

      let matchStatus = 'no_match';
      let matchScore = 0;
      let matchReason = 'لا يوجد تطابق';

      if (match) {
        matchScore = match.score;
        matchReason = match.reason;

        if (matchScore === 100) {
          matchStatus = 'exact_match';
          stats.exact_match++;
        } else if (matchScore >= 70) {
          matchStatus = 'high_confidence';
          stats.high_confidence++;
        } else if (matchScore >= 40) {
          matchStatus = 'needs_review';
          stats.needs_review++;
        } else {
          matchStatus = 'no_match';
          stats.no_match++;
        }

        if (imageExists) {
          usedImages.add(imageFilename);
        } else {
          matchStatus = 'missing_image';
          stats.missing_image++;
        }
      } else {
        stats.no_match++;
      }

      results.push({
        product_id: product.id,
        supabase_name: product.name,
        supabase_category: product.category,
        mapping_name: match ? match.mappingName : null,
        image_filename: imageFilename,
        storage_path: storagePath,
        public_url: publicUrl,
        match_score: matchScore,
        match_reason: matchReason,
        image_exists: imageExists,
        match_status: matchStatus,
        current_image_url: product.image_url
      });
    });

    // Save JSON report
    const jsonReportPath = path.join(__dirname, 'product-image-matching-report.json');
    fs.writeFileSync(jsonReportPath, JSON.stringify(results, null, 2), 'utf8');
    console.log(`\n✓ تم حفظ التقرير JSON: ${jsonReportPath}`);

    // Save CSV report
    const csvReportPath = path.join(__dirname, 'product-image-matching-report.csv');
    const csvHeader = 'Product ID,Supabase Name,Supabase Category,Mapping Name,Image Filename,Storage Path,Public URL,Match Score,Match Reason,Image Exists,Match Status,Current Image URL\n';
    const csvRows = results.map(r =>
      `"${r.product_id}","${r.supabase_name}","${r.supabase_category}","${r.mapping_name || ''}","${r.image_filename || ''}","${r.storage_path || ''}","${r.public_url || ''}",${r.match_score},"${r.match_reason}","${r.image_exists}","${r.match_status}","${r.current_image_url || ''}"`
    ).join('\n');
    fs.writeFileSync(csvReportPath, csvHeader + csvRows, 'utf8');
    console.log(`✓ تم حفظ التقرير CSV: ${csvReportPath}`);

    // Save summary
    const summaryPath = path.join(__dirname, 'product-image-matching-summary.txt');
    const unusedImages = storageFileNames.size - usedImages.size;
    const summary = `
ملخص تحليل مطابقة الصور
================================================================================

إحصائيات المطابقة:
--------------------
إجمالي المنتجات في قاعدة البيانات: ${products.length}
إجمالي المنتجات في mapping: ${mapping.length}
إجمالي الصور المرفوعة في Storage: ${storageFiles.length}

المطابقات التامة (exact_match): ${stats.exact_match}
المطابقات عالية الثقة (high_confidence): ${stats.high_confidence}
تحتاج مراجعة يدوية (needs_review): ${stats.needs_review}
لا يوجد تطابق (no_match): ${stats.no_match}
الصور المفقودة (missing_image): ${stats.missing_image}

الصور:
------
الصور المستخدمة في المطابقة: ${usedImages.size}
الصور غير المستخدمة: ${unusedImages}

الحالات:
--------
حفظت التفاصيل في:
- product-image-matching-report.json (التقرير الكامل)
- product-image-matching-report.csv (للعرض في Excel)
`;
    fs.writeFileSync(summaryPath, summary, 'utf8');
    console.log(`✓ تم حفظ الملخص: ${summaryPath}`);

    console.log('\n' + '='.repeat(80));
    console.log('الملخص:');
    console.log('='.repeat(80));
    console.log(`المطابقات التامة: ${stats.exact_match}`);
    console.log(`المطابقات عالية الثقة: ${stats.high_confidence}`);
    console.log(`تحتاج مراجعة يدوية: ${stats.needs_review}`);
    console.log(`لا يوجد تطابق: ${stats.no_match}`);
    console.log(`الصور المفقودة: ${stats.missing_image}`);
    console.log(`الصور غير المستخدمة: ${unusedImages}`);
    console.log('='.repeat(80));

  } catch (error) {
    console.error('\n✗ خطأ غير متوقع:', error.message);
    console.error(error.stack);
  }
}

analyzeMatching();
