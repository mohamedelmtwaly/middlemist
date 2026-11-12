const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY; // Use service role key for uploads

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Category ID for مسكات العروس
const CATEGORY_ID = '57d70a1f-20b8-4dbf-800c-6ea29de5a778';
const CATEGORY_NAME = 'مسكات العروس';

// Products to add
const products = [
  {
    name: 'مسكة عروس',
    price: 350,
    description: 'بالورد الهولندي بنوع الورد توليب، جولبير، اوستوما، بيبي روس، وكس فلاور',
    imageFile: 'bridal-bouquet-001.webp'
  },
  {
    name: 'مسكه العروس',
    price: 250,
    description: 'على حسب الطلب',
    imageFile: 'bridal-bouquet-002.webp'
  },
  {
    name: 'مسكه العروس',
    price: 700,
    description: 'ورد طبيعي',
    imageFile: 'bridal-bouquet-003.webp'
  },
  {
    name: 'مسكه العروس صناعية',
    price: 450,
    description: 'ورد صناعي على حسب الطلب',
    imageFile: 'bridal-bouquet-004.webp'
  },
  {
    name: 'مسكه عروس',
    price: 350,
    description: 'ورد طبيعي منوع',
    imageFile: 'bridal-bouquet-005.webp'
  }
];

// Local path to images
const imagesPath = path.join(__dirname, 'src', 'assets', 'new-products', 'bridal-bouquets');

async function uploadImage(filename) {
  const filePath = path.join(imagesPath, filename);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Image file not found: ${filePath}`);
  }

  const fileBuffer = fs.readFileSync(filePath);
  const fileExt = path.extname(filename);
  const storagePath = `products/bridal-bouquets/${filename}`;

  console.log(`📤 Uploading ${filename} to Supabase Storage...`);

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(storagePath, fileBuffer, {
      contentType: 'image/webp',
      upsert: true
    });

  if (error) {
    // Check if file already exists
    if (error.message.includes('already exists')) {
      console.log(`⚠️  File already exists, using existing file: ${filename}`);
    } else {
      throw error;
    }
  } else {
    console.log(`✅ Uploaded ${filename} successfully`);
  }

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
  console.log('🚀 Starting to add bridal products...\n');

  try {
    // Step 1: Get highest sort_order
    console.log('📊 Getting highest sort_order...');
    const highestSortOrder = await getHighestSortOrder();
    console.log(`✅ Highest sort_order: ${highestSortOrder}\n`);

    // Step 2: Upload images and add products
    let currentSortOrder = highestSortOrder + 1;

    for (const product of products) {
      try {
        // Upload image
        const imageUrl = await uploadImage(product.imageFile);
        console.log(`🔗 Image URL: ${imageUrl}\n`);

        // Add product
        await addProduct(product, imageUrl, currentSortOrder);
        currentSortOrder++;

        console.log('---\n');
      } catch (error) {
        console.error(`❌ Error processing ${product.name}:`, error.message);
        throw error;
      }
    }

    console.log('🎉 All products added successfully!');
    console.log(`\n📦 Total products added: ${products.length}`);
    console.log(`📁 Category: ${CATEGORY_NAME} (ID: ${CATEGORY_ID})`);

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
