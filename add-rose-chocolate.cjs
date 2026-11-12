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

// Category ID for الورد والشوكولاتة
const CATEGORY_ID = '5ca2de77-8221-4537-9582-c1040f751031';
const CATEGORY_NAME = 'الورد والشوكولاتة';

// The 18 products with available images
const targetProducts = [
  { name: 'حلاوه فاخره', price: 69, description: 'حلاوه تاوه شوكولاته فاخره', image: 'chocolate-gift-001.webp' },
  { name: 'شوكولاته لافيرا مع الورد', price: 269, description: 'شوكولاته مع الورد على حسب الطلب', image: 'chocolate-gift-002.webp' },
  { name: 'شوكولاتات', price: 249, description: 'شوكولاته باتشي مع الورد ورد مع شكلت', image: 'chocolate-gift-003.webp' },
  { name: 'شوكولاته هانوفريان الفاخره', price: 349, description: 'شوكولاته لندن الفاخره مع تنسيق ورد طبيعي', image: 'chocolate-gift-004.webp' },
  { name: 'باقة روز شوكلت 2', price: 249, description: 'شوكولاته روز شوكلت ورد طبيعي', image: 'chocolate-gift-006.webp' },
  { name: 'شوكولاته باتشي وباقة ميدل ميست', price: 250, description: 'ورد طبيعي شوكولاته', image: 'chocolate-gift-007.webp' },
  { name: 'بوكيه ورد مع شوكولاته', price: 289, description: 'الشوكولاتة حسب الطلب مع الورد', image: 'chocolate-gift-008.webp' },
  { name: 'كيك جاناش', price: 75, description: 'كيك جاناش على حسب الطلب مانجو . توت . فراوله . شوكلت', image: 'chocolate-gift-009.webp' },
  { name: 'شوكولاته اني وداني مع الورد', price: 280, description: 'ورد طبيعي منوع شوكولاته علي حسب الطلب', image: 'chocolate-gift-010.webp' },
  { name: 'شوكولاته لافيرا مع ورد طبيعي', price: 350, description: 'ورد طبيعي منوع على حسب الطلب', image: 'chocolate-gift-011.webp' },
  { name: 'شوكولاته أني وداني مع الورد', price: 340, description: 'ربع كيلو شوكولاته من اني وداني مع الورد', image: 'chocolate-gift-012.webp' },
  { name: 'باقة المحبه مع الكيك', price: 350, description: 'ورد مع كيك جاناش على حسب الطلب', image: 'chocolate-gift-013.webp' },
  { name: 'كيك إني وداني مع الورد', price: 350, description: 'كيك مع ورد طبيعي على حسب الطلب', image: 'chocolate-gift-014.webp' },
  { name: 'باقة ورد مع شوكولاته لافيرا', price: 319, description: 'ورد م شكلت فاخر', image: 'chocolate-gift-015.webp' },
  { name: 'باقة المشاعر', price: 229, description: 'باقه مع كيك علي حسب الطلب', image: 'chocolate-gift-017.webp' },
  { name: 'شوكولاته هانوفريان وفازة ورد طبيعي', price: 369, description: 'فازة ورد شوكولاته هانوفريان', image: 'flower-vase-002.webp' },
  { name: 'باقة روز شوكلت 1', price: 249, description: 'بكس الشوكلاته وباقة ورد طبيعي', image: 'gift-box-001.webp' },
  { name: 'بوكس شوكولاته كندر', price: 219, description: 'بوكس ورد مع اضافة شوكولاته كندر', image: 'gift-box-005.webp' },
  { name: 'تنسيق استاند ورد مع شوكلت', price: 240, description: 'تنسيق استاند مع ورد حسب الطلب', image: 'flower-stand-008.webp' }
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
  const storagePath = `products/rose-chocolate/${filename}`;

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
  console.log('🚀 Starting to add rose & chocolate products...\n');

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
      const existingKey = `${userProduct.name}|products/rose-chocolate/${userProduct.image}`;
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
