const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

console.log('='.repeat(80));
console.log('فحص الصورة المختلفة (READ ONLY)');
console.log('='.repeat(80));

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(supabaseUrl, supabaseSecretKey);

async function findDifference() {
  try {
    // Get storage files
    const { data: storageFiles } = await supabase
      .storage
      .from('product-images')
      .list('products', { limit: 1000 });

    const storageFileNames = new Set(storageFiles.map(f => f.name));
    console.log(`Storage: ${storageFileNames.size} صورة`);

    // Load products-transformed.json
    const transformedPath = path.join(__dirname, 'products-transformed.json');
    const transformedData = JSON.parse(fs.readFileSync(transformedPath, 'utf8'));

    // Extract used image filenames from products-transformed.json
    const usedImageFilenames = new Set();
    transformedData.forEach(p => {
      if (!p.image_url.includes('placeholder')) {
        // Extract filename from URL
        const match = p.image_url.match(/products\/([^\/]+\.webp)$/);
        if (match) {
          usedImageFilenames.add(match[1]);
        }
      }
    });

    console.log(`المستخدمة في products-transformed.json: ${usedImageFilenames.size} صورة`);

    // Find images in storage but not used
    const unusedImages = [...storageFileNames].filter(f => !usedImageFilenames.has(f));
    console.log(`\nصور في Storage غير مستخدمة: ${unusedImages.length}`);

    if (unusedImages.length > 0) {
      unusedImages.forEach(f => console.log(`  - ${f}`));
    }

    // Find images used but not in storage
    const usedNotInStorage = [...usedImageFilenames].filter(f => !storageFileNames.has(f));
    console.log(`\nصور مستخدمة وليست في Storage: ${usedNotInStorage.length}`);

    if (usedNotInStorage.length > 0) {
      usedNotInStorage.forEach(f => console.log(`  - ${f}`));
    }

    console.log('\n' + '='.repeat(80));

  } catch (error) {
    console.error('\n✗ خطأ:', error.message);
    console.error(error.stack);
  }
}

findDifference();
