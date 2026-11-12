const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function reviewStorageImages() {
  console.log('🖼️  REVIEWING SUPABASE STORAGE IMAGES');
  console.log('='.repeat(60));

  try {
    // List all files in products/gift-boxes/
    const { data: files, error } = await supabase
      .storage
      .from('product-images')
      .list('products/gift-boxes', { limit: 100 });

    if (error) {
      throw error;
    }

    console.log(`✅ Found ${files.length} files in products/gift-boxes/\n`);

    const expectedFiles = [
      'gift-box-002.webp',
      'gift-box-003.webp',
      'gift-box-004.webp',
      'gift-box-006.webp',
      'gift-box-007.webp',
      'gift-box-008.webp',
      'gift-box-009.webp',
      'gift-box-010.webp',
      'gift-box-011.webp',
      'gift-box-012.webp'
    ];

    console.log('📋 Expected files:');
    expectedFiles.forEach((file, index) => {
      const exists = files.some(f => f.name === file);
      const status = exists ? '✅' : '❌';
      console.log(`${status} ${index + 1}. ${file}`);
    });

    console.log('\n📋 Actual files in storage:');
    files.forEach((file, index) => {
      console.log(`${index + 1}. ${file.name} (${file.metadata?.size || 'unknown'} bytes)`);
    });

    // Check for missing files
    const missingFiles = expectedFiles.filter(file => !files.some(f => f.name === file));
    const extraFiles = files.filter(file => !expectedFiles.includes(file.name));

    console.log('\n📊 SUMMARY:');
    console.log(`Expected files: ${expectedFiles.length}`);
    console.log(`Actual files: ${files.length}`);
    console.log(`Missing files: ${missingFiles.length}`);
    console.log(`Extra files: ${extraFiles.length}`);

    if (missingFiles.length > 0) {
      console.log('\n❌ Missing files:');
      missingFiles.forEach(file => console.log(`  - ${file}`));
    }

    if (extraFiles.length > 0) {
      console.log('\n⚠️  Extra files (not expected):');
      extraFiles.forEach(file => console.log(`  - ${file.name}`));
    }

    if (missingFiles.length === 0 && extraFiles.length === 0) {
      console.log('\n✅ All expected files are present and no extra files found!');
    }

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

reviewStorageImages();
