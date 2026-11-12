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

async function createAdminAccount() {
  console.log('🔐 Creating admin account...\n');

  try {
    const email = 'middlemist@yahoo.com';
    const password = 'mohamed22';

    // Step 1: Create the user in Supabase Auth
    console.log('📧 Creating user in Supabase Auth...');
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        role: 'admin',
        full_name: 'Middlemist Owner'
      }
    });

    if (userError) {
      // If user already exists, try to update metadata
      if (userError.message.includes('already registered')) {
        console.log('⚠️  User already exists, updating metadata...\n');

        // Get the user by email
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) throw listError;

        const existingUser = users.find(u => u.email === email);
        if (!existingUser) {
          throw new Error('User not found in list');
        }

        // Update user metadata
        const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
          existingUser.id,
          {
            user_metadata: {
              role: 'admin',
              full_name: 'Middlemist Owner'
            }
          }
        );

        if (updateError) throw updateError;

        console.log(`✅ User metadata updated successfully!`);
        console.log(`   User ID: ${existingUser.id}`);
        console.log(`   Email: ${email}`);
        console.log(`   Role: admin\n`);
      } else {
        throw userError;
      }
    } else {
      console.log(`✅ User created successfully!`);
      console.log(`   User ID: ${userData.user.id}`);
      console.log(`   Email: ${email}`);
      console.log(`   Role: admin\n`);
    }

    console.log('🎉 Admin account setup completed!');
    console.log('\n📋 Login credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Dashboard URL: http://localhost:8081/admin/login`);

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

createAdminAccount();
