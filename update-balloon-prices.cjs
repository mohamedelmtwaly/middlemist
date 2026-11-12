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

async function updateBalloonPrices() {
  console.log('🔄 Updating all balloon product prices to 99 SAR...\n');

  try {
    // Step 1: Find all products in البالونات category
    console.log('🔍 Finding products in "البالونات" category...');
    const { data: products, error: findError } = await supabase
      .from('products')
      .select('id, name, category, price')
      .eq('category', 'البالونات');

    if (findError) {
      throw findError;
    }

    if (!products || products.length === 0) {
      console.log('⚠️  No products found in "البالونات" category');
      process.exit(0);
    }

    console.log(`✅ Found ${products.length} products in "البالونات" category\n`);

    // Display current prices
    console.log('Current prices:');
    products.forEach((p, index) => {
      console.log(`${index + 1}. ${p.name}: ${p.price} SAR`);
    });
    console.log('');

    // Step 2: Update all prices to 99
    console.log('📝 Updating prices to 99 SAR...');
    const { error: updateError } = await supabase
      .from('products')
      .update({ price: 99 })
      .eq('category', 'البالونات');

    if (updateError) {
      throw updateError;
    }

    console.log(`✅ Updated ${products.length} products\n`);

    // Step 3: Verify the update
    console.log('🔍 Verifying update...');
    const { data: updatedProducts, error: verifyError } = await supabase
      .from('products')
      .select('id, name, category, price')
      .eq('category', 'البالونات');

    if (verifyError) {
      throw verifyError;
    }

    console.log('Updated prices:');
    updatedProducts.forEach((p, index) => {
      console.log(`${index + 1}. ${p.name}: ${p.price} SAR`);
    });

    console.log('\n🎉 All balloon prices updated successfully to 99 SAR!');

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

updateBalloonPrices();
