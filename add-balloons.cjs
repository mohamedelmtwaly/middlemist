const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Category ID for البالونات
const CATEGORY_ID = '3edcc1e9-2221-41ec-bb8a-c6a62021fb82';
const CATEGORY_NAME = 'البالونات';

// Load the original products file
const productsData = JSON.parse(fs.readFileSync('middlemist-products.json', 'utf8'));

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

// Exclude products without images
const excludedImages = [
  'rose-bouquet-128.webp',
  'balloon-arrangement-018.webp',
  'balloon-arrangement-020.webp',
  'balloon-arrangement-044.webp',
  'balloon-arrangement-050.webp',
  'balloon-arrangement-052.webp',
  'balloon-arrangement-053.webp',
  'balloon-arrangement-054.webp',
  'balloon-arrangement-055.webp',
  'balloon-arrangement-056.webp',
  'balloon-arrangement-057.webp',
  'balloon-arrangement-058.webp',
  'balloon-arrangement-059.webp',
  'balloon-arrangement-060.webp',
  'balloon-arrangement-061.webp',
  'balloon-arrangement-062.webp',
  'balloon-arrangement-063.webp',
  'balloon-arrangement-064.webp',
  'balloon-arrangement-065.webp',
  'balloon-arrangement-066.webp'
];

const userProducts = targetProducts.filter(p => {
  if (excludedImages.includes(p.image)) return false;
  return true;
});

// Local path to images
const imagesPath = path.join(__dirname, 'src', 'assets', 'middlemist-images');

async function uploadImage(filename) {
  const filePath = path.join(imagesPath, filename);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Image file not found: ${filePath}`);
  }

  const fileBuffer = fs.readFileSync(filePath);
  const fileExt = path.extname(filename);
  const storagePath = `products/balloons/${filename}`;

  console.log(`📤 Uploading ${filename} to Supabase Storage...`);

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(storagePath, fileBuffer, {
      contentType: fileExt === '.webp' ? 'image/webp' : (fileExt === '.png' ? 'image/png' : 'image/jpeg'),
      upsert: true
    });

  if (error) {
    throw error;
  }

  console.log(`✅ Uploaded ${filename} successfully`);

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(storagePath);

  return publicUrl;
}

async function getHighestSortOrder() {
  const { data, error } = await supabase
    .from('products')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1);

  if (error) {
    throw error;
  }

  if (!data || data.length === 0) {
    return 0;
  }

  return data[0].sort_order || 0;
}

async function addProduct(product, imageUrl, sortOrder) {
  console.log(`📝 Adding product: ${product.name}`);

  const { data, error } = await supabase
    .from('products')
    .insert({
      name: product.name,
      category: CATEGORY_NAME,
      category_id: CATEGORY_ID,
      subcategory_id: null,
      price: product.price,
      image_url: imageUrl,
      description: '', // Will be empty since descriptions are mismatched
      is_active: true,
      sort_order: sortOrder,
      occasions: null,
      display_sections: null
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  console.log(`✅ Added product: ${product.name} (ID: ${data.id})`);
  return data;
}

async function main() {
  console.log('🚀 Starting to add balloon products...\n');

  try {
    // Step 1: Get highest sort_order
    console.log('📊 Getting highest sort_order...');
    const highestSortOrder = await getHighestSortOrder();
    console.log(`✅ Highest sort_order: ${highestSortOrder}\n`);

    // Step 1.5: Check for existing products with this category
    console.log('🔍 Checking for existing products in category...');
    const { data: existingProducts } = await supabase
      .from('products')
      .select('name, image_url')
      .eq('category_id', CATEGORY_ID);

    const existingNamesAndImages = new Set();
    if (existingProducts) {
      existingProducts.forEach(p => existingNamesAndImages.add(`${p.name}|${p.image_url}`));
    }
    console.log(`✅ Found ${existingProducts?.length || 0} existing products in category\n`);

    // Step 2: Upload images and add products
    let currentSortOrder = highestSortOrder + 1;
    let addedCount = 0;
    let skippedCount = 0;
    let alreadyExistsCount = 0;

    for (const userProduct of userProducts) {
      // Check if product already exists (name + image combination)
      const existingKey = `${userProduct.name}|products/balloons/${userProduct.image}`;
      if (existingNamesAndImages.has(existingKey)) {
        console.log(`⏭️  Skipping (already exists): ${userProduct.name}`);
        alreadyExistsCount++;
        continue;
      }

      try {
        // Upload image
        const imageUrl = await uploadImage(userProduct.image);
        console.log(`🔗 Image URL: ${imageUrl}\n`);

        // Add product
        await addProduct(userProduct, imageUrl, currentSortOrder);
        currentSortOrder++;
        addedCount++;

        console.log('---\n');
      } catch (error) {
        console.error(`❌ Error processing ${userProduct.name}:`, error.message);
        throw error;
      }
    }

    console.log('🎉 All products added successfully!');
    console.log(`\n📦 Total products added: ${addedCount}`);
    console.log(`📦 Total products skipped (no image): ${skippedCount}`);
    console.log(`📦 Total products skipped (already exists): ${alreadyExistsCount}`);
    console.log(`📁 Category: ${CATEGORY_NAME} (ID: ${CATEGORY_ID})`);

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
