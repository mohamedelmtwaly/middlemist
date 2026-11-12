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

const CATEGORY_ID = 'ebc12058-3f22-4a0c-bbe6-1e1b51219685';
const CATEGORY_NAME = 'بوكسات الهدايا';

async function reviewGiftBoxes() {
  console.log('🔍 Starting comprehensive review of Gift Boxes products...\n');

  const report = {
    database: {
      totalProducts: 0,
      correctCategory: 0,
      incorrectCategory: 0,
      missingCategory: 0,
      missingPrice: 0,
      missingDescription: 0,
      products: []
    },
    images: {
      totalWithImage: 0,
      totalWithoutImage: 0,
      validUrls: 0,
      invalidUrls: 0,
      missingImages: []
    },
    issues: []
  };

  try {
    // 1. Database Review
    console.log('📊 1. DATABASE REVIEW');
    console.log('='.repeat(60));

    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', CATEGORY_ID);

    if (error) {
      throw error;
    }

    report.database.totalProducts = products.length;
    console.log(`✅ Total products with category_id ${CATEGORY_ID}: ${products.length}\n`);

    products.forEach((p, index) => {
      console.log(`${index + 1}. ${p.name}`);
      console.log(`   ID: ${p.id}`);
      console.log(`   Category: ${p.category}`);
      console.log(`   Category ID: ${p.category_id}`);
      console.log(`   Price: ${p.price} SAR`);
      console.log(`   Description: ${p.description || '(empty)'}`);
      console.log(`   Image URL: ${p.image_url || '(missing)'}`);
      console.log(`   Active: ${p.is_active}`);
      console.log(`   Sort Order: ${p.sort_order}`);

      // Check category
      if (p.category === CATEGORY_NAME) {
        report.database.correctCategory++;
      } else {
        report.database.incorrectCategory++;
        report.issues.push({
          type: 'category_mismatch',
          productId: p.id,
          productName: p.name,
          expected: CATEGORY_NAME,
          actual: p.category
        });
      }

      // Check price
      if (!p.price || p.price === 0) {
        report.database.missingPrice++;
        report.issues.push({
          type: 'missing_price',
          productId: p.id,
          productName: p.name
        });
      }

      // Check description
      if (!p.description || p.description.trim() === '') {
        report.database.missingDescription++;
        report.issues.push({
          type: 'missing_description',
          productId: p.id,
          productName: p.name
        });
      }

      // Check image
      if (p.image_url && p.image_url.length > 0) {
        report.images.totalWithImage++;

        // Check if URL is valid Supabase Storage URL
        if (p.image_url.includes('product-images/products/gift-boxes/')) {
          report.images.validUrls++;
        } else {
          report.images.invalidUrls++;
          report.issues.push({
            type: 'invalid_image_url',
            productId: p.id,
            productName: p.name,
            imageUrl: p.image_url
          });
        }
      } else {
        report.images.totalWithoutImage++;
        report.images.missingImages.push({
          productId: p.id,
          productName: p.name
        });
        report.issues.push({
          type: 'missing_image',
          productId: p.id,
          productName: p.name
        });
      }

      report.database.products.push({
        id: p.id,
        name: p.name,
        category: p.category,
        category_id: p.category_id,
        price: p.price,
        description: p.description,
        image_url: p.image_url,
        is_active: p.is_active,
        sort_order: p.sort_order
      });

      console.log('');
    });

    // 2. Summary
    console.log('\n📋 SUMMARY');
    console.log('='.repeat(60));
    console.log(`Database:`);
    console.log(`  Total products: ${report.database.totalProducts}`);
    console.log(`  Correct category: ${report.database.correctCategory}`);
    console.log(`  Incorrect category: ${report.database.incorrectCategory}`);
    console.log(`  Missing price: ${report.database.missingPrice}`);
    console.log(`  Missing description: ${report.database.missingDescription}`);
    console.log(`\nImages:`);
    console.log(`  Products with image: ${report.images.totalWithImage}`);
    console.log(`  Products without image: ${report.images.totalWithoutImage}`);
    console.log(`  Valid image URLs: ${report.images.validUrls}`);
    console.log(`  Invalid image URLs: ${report.images.invalidUrls}`);
    console.log(`\nTotal issues found: ${report.issues.length}`);

    if (report.issues.length > 0) {
      console.log('\n⚠️  ISSUES:');
      report.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.type}: ${issue.productName || issue.productId}`);
        if (issue.expected) console.log(`   Expected: ${issue.expected}, Actual: ${issue.actual}`);
        if (issue.imageUrl) console.log(`   Image URL: ${issue.imageUrl}`);
      });
    }

    // Save report to file
    const fs = require('fs');
    const reportPath = 'gift-boxes-database-review.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`\n💾 Report saved to: ${reportPath}`);

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

reviewGiftBoxes();
