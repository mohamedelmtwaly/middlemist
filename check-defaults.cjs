const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('='.repeat(80));
console.log('فحص DEFAULT values لأعمدة products (READ ONLY)');
console.log('='.repeat(80));

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(supabaseUrl, supabaseSecretKey);

async function checkDefaults() {
  try {
    // Since we can't use exec_sql RPC, just report that we need manual SQL
    console.log('\nℹ RPC exec_sql غير متاح');
    console.log('\nيرجى تنفيذ SQL التالي في Supabase SQL Editor:');
    console.log('='.repeat(80));
    console.log('SELECT column_name, data_type, is_nullable, column_default');
    console.log('FROM information_schema.columns');
    console.log('WHERE table_schema = \'public\'');
    console.log('  AND table_name = \'products\'');
    console.log('  AND column_name IN (\'id\', \'created_at\', \'updated_at\')');
    console.log('ORDER BY ordinal_position;');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('\n✗ خطأ:', error.message);
  }
}

checkDefaults();
