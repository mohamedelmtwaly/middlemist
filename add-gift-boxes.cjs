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

// Category ID for بوكسات الهدايا
const CATEGORY_ID = 'ebc12058-3f22-4a0c-bbe6-1e1b51219685';
const CATEGORY_NAME = 'بوكسات الهدايا';

// The 10 confirmed gift box products (excluding duplicates and missing image)
const targetProducts = [
  { name: 'بوكس كرتوني اسود', price: 120, description: 'اسود في فراشه', image: 'gift-box-002.webp' },
  { name: 'بوكس الورد الطبيعي', price: 179, description: 'ورد طبيعي منوع', image: 'gift-box-003.webp' },
  { name: 'بوكس المفرحات', price: 269, description: 'ورد و شكلاته و بوكس', image: 'gift-box-004.webp' },
  { name: 'بكس ميدل بيست صناعي', price: 269, description: 'بكس ميدل بيست صناعي', image: 'gift-box-006.webp' },
  { name: 'بكس ميدل بيست 1', price: 249, description: 'بكس ميدل بيست احمر', image: 'gift-box-007.webp' },
  { name: 'بكس ميدل ميست 2', price: 249, description: 'بكس ميدل ميست طبيعي احمر', image: 'gift-box-008.webp' },
  { name: 'بوكس شوكولاته بالورد', price: 289, description: 'بوكس بالورد مع شوكولاته حسب الطلب', image: 'gift-box-009.webp' },
  { name: 'بوكس ميدل ميست فلاور', price: 250, description: 'ورد طبيعي منوع', image: 'gift-box-010.webp' },
  { name: 'بوكس هدايا ميدل ميست', price: 300, description: 'بوكس مع هدايا و ورد على حسب الطلب', image: 'gift-box-011.webp' },
  { name: 'بوكس هدايا ميدل ميست فلاور', price: 180, description: 'بوكس مع ورد طبيعي منوع على حسب الطلب', image: 'gift-box-012.webp' }
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
  const storagePath = `products/gift-boxes/${filename}`;

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
  console.log('🚀 Starting to add gift box products...\n');

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
      const existingKey = `${userProduct.name}|products/gift-boxes/${userProduct.image}`;
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
