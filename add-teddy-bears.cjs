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

// Category ID for الدباديب
const CATEGORY_ID = '7e0404c0-0259-4548-9dc7-504687b2ff22';
const CATEGORY_NAME = 'الدباديب';

// The 11 target products with their image filenames
const targetProducts = [
  { name: 'هولكاتي ابيض', price: 70, description: 'طوله 45 سم', image: 'teddy-bear-001.webp' },
  { name: 'دبدوب استيتش صغير', price: 40, description: 'لونه ازرق', image: 'teddy-bear-002.webp' },
  { name: 'دبدوب ابو فيونكه سكري', price: 180, description: 'في كرفته', image: 'teddy-bear-003.webp' },
  { name: 'دبدوب بيجي ابو قلب', price: 80, description: 'دبدوب في قلب', image: 'teddy-bear-004.webp' },
  { name: 'دبدوب باندا وسط', price: 50, description: 'في كرفته', image: 'teddy-bear-005.webp' },
  { name: 'دبدوب باندا كبير', price: 70, description: 'في كرفته', image: 'teddy-bear-006.webp' },
  { name: 'دبدوب باندا ابو فنيله', price: 300, description: 'دبدوب اسود باندا ابو فنيله', image: 'teddy-bear-007.webp' },
  { name: 'باقة ورد ودبدوب', price: 179, description: 'باقة ورد جميلة مع دبدوب لطيف تجمع بين جمال الورود الطازجة والحنان الدافئ للدبدوب الناعم هدية مثالية للتعبير عن المشاعر والحب', image: 'teddy-bear-008.webp' },
  { name: 'دبدوب صغير ب ألوان محتلفه', price: 49, description: 'دبدوب صغير ابو ربطه', image: 'teddy-bear-009.webp' },
  { name: 'استيتش بنفسجي صغير', price: 35, description: 'استيتش بنفسجي بملمس ناعم', image: 'teddy-bear-010.webp' },
  { name: 'دبدوب صغير ابو فلينه', price: 35, description: 'دبدوب صغير وناعم الملمس', image: 'teddy-bear-011.webp' }
];

// Local path to images
const imagesPath = path.join(__dirname, 'src', 'assets', 'middlemist-images');

async function uploadImage(filename) {
  const filePath = path.join(imagesPath, filename);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Image file not found: ${filePath}`);
  }

  const fileBuffer = fs.readFileSync(filePath);
  const fileExt = path.extname(filename);
  const storagePath = `products/teddy-bears/${filename}`;

  console.log(`📤 Uploading ${filename} to Supabase Storage...`);

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(storagePath, fileBuffer, {
      contentType: 'image/webp',
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
      description: product.description,
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
  console.log('🚀 Starting to add teddy bear products...\n');

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
    let alreadyExistsCount = 0;

    for (const userProduct of targetProducts) {
      // Check if product already exists (name + image combination)
      const existingKey = `${userProduct.name}|products/teddy-bears/${userProduct.image}`;
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
    console.log(`📦 Total products skipped (already exists): ${alreadyExistsCount}`);
    console.log(`📁 Category: ${CATEGORY_NAME} (ID: ${CATEGORY_ID})`);

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
