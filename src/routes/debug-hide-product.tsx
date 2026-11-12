import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export const Route = createFileRoute('/debug-hide-product')({
  component: DebugHideProduct,
});

function DebugHideProduct() {
  const [productId, setProductId] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('ar-SA');
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const runDiagnostic = async () => {
    if (!productId) {
      addLog('❌ يرجى إدخال معرف المنتج');
      return;
    }

    setLoading(true);
    setLogs([]);
    addLog('🔍 بدء التشخيص...');

    try {
      const supabase = getSupabaseClient();

      // 1. قراءة القيمة الحالية
      addLog('📖 قراءة قيمة is_active الحالية...');
      const { data: currentProduct, error: readError } = await supabase
        .from('products')
        .select('id, name, is_active')
        .eq('id', productId)
        .single();

      if (readError) {
        addLog(`❌ خطأ في القراءة: ${readError.message}`);
        addLog(`   Code: ${readError.code}`);
        addLog(`   Details: ${JSON.stringify(readError.details)}`);
        setLoading(false);
        return;
      }

      if (!currentProduct) {
        addLog('❌ المنتج غير موجود');
        setLoading(false);
        return;
      }

      const initialValue = currentProduct.is_active;
      addLog(`✅ تم العثور على المنتج: ${currentProduct.name}`);
      addLog(`📊 قيمة is_active قبل التحديث: ${initialValue}`);

      if (initialValue === false) {
        addLog('⚠️ المنتج مخفي بالفعل. سيتم تحويله إلى ظاهر.');
      }

      // 2. تنفيذ UPDATE
      const newValue = !initialValue;
      addLog(`🔄 تنفيذ UPDATE لتحويل is_active إلى ${newValue}...`);

      const { data: updateResult, error: updateError } = await supabase
        .from('products')
        .update({ is_active: newValue })
        .eq('id', productId)
        .select('id, name, is_active')
        .single();

      if (updateError) {
        addLog(`❌ خطأ في UPDATE: ${updateError.message}`);
        addLog(`   Code: ${updateError.code}`);
        addLog(`   Details: ${JSON.stringify(updateError.details)}`);
        addLog(`   Hint: ${updateError.hint || 'N/A'}`);
        setLoading(false);
        return;
      }

      const updatedValue = updateResult.is_active;
      addLog(`✅ UPDATE نجح`);
      addLog(`📊 قيمة is_active بعد UPDATE مباشرة: ${updatedValue}`);

      // 3. SELECT جديد للتأكد
      addLog('📖 تنفيذ SELECT جديد للتأكد من القيمة المحفوظة...');
      const { data: verifyProduct, error: verifyError } = await supabase
        .from('products')
        .select('id, name, is_active')
        .eq('id', productId)
        .single();

      if (verifyError) {
        addLog(`❌ خطأ في SELECT التحققي: ${verifyError.message}`);
        setLoading(false);
        return;
      }

      const verifiedValue = verifyProduct.is_active;
      addLog(`✅ SELECT التحققي نجح`);
      addLog(`📊 قيمة is_active بعد SELECT جديد: ${verifiedValue}`);

      // 4. التحقق من استعلام الواجهة العامة
      addLog('🔍 فحص استعلام الواجهة العامة (is_active = true)...');
      const { data: activeProducts, error: activeError } = await supabase
        .from('products')
        .select('id, name, is_active')
        .eq('is_active', true);

      if (activeError) {
        addLog(`❌ خطأ في استعلام الواجهة العامة: ${activeError.message}`);
      } else {
        const productStillVisible = activeProducts?.some(p => p.id === productId);
        addLog(`📊 عدد المنتجات النشطة: ${activeProducts?.length || 0}`);
        addLog(`🔍 هل المنتج ما زال يظهر في استعلام الواجهة العامة؟ ${productStillVisible ? 'نعم ❌' : 'لا ✅'}`);
      }

      // 5. فحص المنتجات في لوحة الإدارة
      addLog('🔍 فحص استعلام لوحة الإدارة (بدون فلتر)...');
      const { data: allProducts, error: allError } = await supabase
        .from('products')
        .select('id, name, is_active');

      if (allError) {
        addLog(`❌ خطأ في استعلام لوحة الإدارة: ${allError.message}`);
      } else {
        const productInAdmin = allProducts?.some(p => p.id === productId);
        addLog(`📊 عدد المنتجات الكلي: ${allProducts?.length || 0}`);
        addLog(`🔍 هل المنتج يظهر في لوحة الإدارة؟ ${productInAdmin ? 'نعم ✅' : 'لا ❌'}`);
      }

      // 6. التشخيص النهائي
      addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      addLog('📋 التقرير النهائي:');
      addLog(`   - قيمة is_active قبل التحديث: ${initialValue}`);
      addLog(`   - نتيجة UPDATE: نجح ✅`);
      addLog(`   - قيمة is_active بعد UPDATE: ${updatedValue}`);
      addLog(`   - قيمة is_active بعد SELECT جديد: ${verifiedValue}`);
      addLog(`   - المنتج في استعلام الواجهة العامة: ${productStillVisible ? 'ما زال يظهر ❌ (مشكلة!)' : 'لا يظهر ✅ (صحيح)'}`);
      addLog(`   - المنتج في لوحة الإدارة: ${productInAdmin ? 'يظهر ✅ (صحيح)' : 'لا يظهر ❌ (مشكلة!)'}`);

      if (updatedValue === verifiedValue && !productStillVisible) {
        addLog('✅ الاختبار نجح! المنتج مخفي بشكل صحيح.');
      } else if (updatedValue === verifiedValue && productStillVisible) {
        addLog('❌ المشكلة: قاعدة البيانات محدثة، لكن المنتج ما زال يظهر في استعلام الواجهة العامة.');
        addLog('   السبب المحتمل: استعلام الواجهة العامة لا يستبعد is_active = false بشكل صحيح.');
      } else if (updatedValue !== verifiedValue) {
        addLog('❌ المشكلة: UPDATE نجح لكن SELECT أعاد قيمة مختلفة.');
        addLog('   السبب المحتمل: مشكلة في قاعدة البيانات أو RLS.');
      }

    } catch (error: any) {
      addLog(`❌ خطأ غير متوقع: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-6">تشخيص إخفاء المنتج</h1>

        <div className="bg-card border border-border rounded-xl p-6 shadow-soft mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                معرف المنتج (Product ID)
              </label>
              <input
                type="text"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                placeholder="أدخل معرف المنتج من لوحة التحكم"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                disabled={loading}
              />
            </div>

            <Button
              onClick={runDiagnostic}
              disabled={loading || !productId}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري التشخيص...
                </>
              ) : (
                'بدء التشخيص'
              )}
            </Button>
          </div>
        </div>

        {logs.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
            <h2 className="text-xl font-bold text-foreground mb-4">نتائج التشخيص</h2>
            <div className="bg-muted rounded-lg p-4 max-h-[600px] overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap font-mono">
                {logs.join('\n')}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
