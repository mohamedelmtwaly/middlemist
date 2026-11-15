import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import { colorOptions, extras, sizeOptions, wrapOptions } from "@/lib/store-data";
import type { Product } from "@/lib/store-data";
import { toast } from "sonner";

export function CustomizeDialog({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { add } = useCart();
  const [color, setColor] = useState("بيبي روز");
  const [wrap, setWrap] = useState(wrapOptions[0]);
  const [size, setSize] = useState("متوسط");
  const [chosen, setChosen] = useState<string[]>([]);
  const [useBudget, setUseBudget] = useState(false);
  const [budget, setBudget] = useState(400);
  const [phrase, setPhrase] = useState("");
  const [customColor, setCustomColor] = useState("");
  const [notes, setNotes] = useState("");

  if (!product) return null;
  const sizeMultiplier = sizeOptions.find((s) => s.name === size)?.multiplier ?? 1;
  const extrasSum = extras.filter((e) => chosen.includes(e.name)).reduce((s, e) => s + e.price, 0);
  
  // حساب السعر الأساسي الفعلي (السعر من المنتج أو الميزانية)
  const effectiveBasePrice = useBudget ? budget : product.price;
  
  // حساب سعر الحجم بناءً على المعامل
  const sizePrice = effectiveBasePrice * sizeMultiplier;
  
  // السعر النهائي = سعر الحجم + الإضافات
  const calculatedPrice = sizePrice + extrasSum;
  
  // منع السعر السالب: إذا كان السعر المحسوب أقل من 0، استخدم 0
  const price = Math.max(0, calculatedPrice);
  
  // التحقق من أن السعر صالح
  const isPriceInvalid = calculatedPrice < 0;

  const chip = (active: boolean) =>
    cn("rounded-full border px-4 py-1.5 text-sm transition", active ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary");

  const submit = () => {
    // منع إضافة منتج بسعر سالب
    if (isPriceInvalid) {
      toast.error("الحجم المختار غير متاح بهذا السعر. يرجى اختيار حجم آخر أو زيادة الميزانية.");
      return;
    }
    
    const options = [
      `اللون: ${customColor.trim() || color}`,
      `التغليف: ${wrap}`,
      useBudget ? `ميزانية محددة: ${budget} ر.س (ننسقها لك)` : `الحجم: ${size}`,
      ...(chosen.length ? [`إضافات: ${chosen.join("، ")}`] : []),
      ...(phrase ? [`التغريسة: «${phrase}»`] : []),
      ...(notes.trim() ? [`إضافات أخرى: ${notes.trim()}`] : []),
    ];
    add({ name: product.name, image: product.image, price, options });
    onClose();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] w-[95vw] overflow-y-auto sm:max-w-2xl [&>button:last-child]:rounded-full [&>button:last-child]:h-8 [&>button:last-child]:w-8 [&>button:last-child]:border-2 [&>button:last-child]:border-border [&>button:last-child]:absolute [&>button:last-child]:left-4 [&>button:last-child]:top-4 [&>button:last-child]:flex [&>button:last-child]:items-center [&>button:last-child]:justify-center" dir="rtl">
        <DialogHeader className="flex flex-row items-center justify-center space-y-0 pb-4">
          <DialogTitle className="text-center font-display text-2xl text-primary sm:text-3xl">صمّم باقتك: {product.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 md:grid-cols-[140px_1fr]">
          <img src={product.image} alt={product.name} className="aspect-square w-full max-w-[140px] rounded-2xl object-cover mx-auto" />
          <div className="space-y-3">
            <section>
              <h4 className="mb-2 font-bold text-sm sm:text-base">لون الورد</h4>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {colorOptions.map((c) => (
                  <button key={c.name} onClick={() => setColor(c.name)} className="flex flex-col items-center gap-1 text-xs sm:text-xs">
                    <span className={cn("h-7 w-7 rounded-full border-2 sm:h-9 sm:w-9", color === c.name ? "border-primary ring-2 ring-primary/30" : "border-border")} style={{ background: c.value }} />
                    {c.name}
                  </button>
                ))}
              </div>
              <Input maxLength={40} placeholder="أو اكتب اللون اللي تحبه… مثال: موف فاتح" value={customColor} onChange={(e) => setCustomColor(e.target.value)} className="mt-2 h-9 text-xs" />
            </section>
            <section>
              <h4 className="mb-2 font-bold text-sm sm:text-base">لون التغليف</h4>
              <div className="flex flex-wrap gap-2">
                {wrapOptions.map((w) => <button key={w} className={cn(chip(wrap === w), "text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-1.5")} onClick={() => setWrap(w)}>{w}</button>)}
              </div>
            </section>
            <section>
              <h4 className="mb-2 font-bold text-sm sm:text-base">الحجم</h4>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map((s) => <button key={s.name} className={cn(chip(size === s.name), "text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-1.5")} onClick={() => setSize(s.name)}>{s.name}</button>)}
              </div>
            </section>
            <section>
              <h4 className="mb-2 font-bold text-sm sm:text-base">إضافات</h4>
              <div className="flex flex-wrap gap-2">
                {extras.map((e) => (
                  <button key={e.name} className={cn(chip(chosen.includes(e.name)), "text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-1.5")}
                    onClick={() => setChosen((p) => (p.includes(e.name) ? p.filter((x) => x !== e.name) : [...p, e.name]))}>
                    {e.name} {e.price ? `+${e.price}` : "مجاناً"}
                  </button>
                ))}
              </div>
            </section>
            <section>
              <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <h4 className="font-bold text-sm sm:text-base">الميزانية</h4>
                <Button variant={useBudget ? "default" : "outline"} size="sm" className="w-full sm:w-auto rounded-full text-xs sm:text-sm h-7" onClick={() => setUseBudget(!useBudget)}>
                  {useBudget ? "إلغاء تحديد الميزانية" : "حدد ميزانيتك ونحن ننسق"}
                </Button>
              </div>
              {useBudget && (
                <div className="space-y-2 rounded-2xl bg-secondary p-3">
                  <label className="block text-xs font-bold text-primary mb-1">حدد ميزانيتك</label>
                  <Input 
                    type="number" 
                    min={0} 
                    max={2000} 
                    step={50} 
                    value={budget} 
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      // منع الميزانية السالبة
                      if (value >= 0) {
                        setBudget(value);
                      }
                    }} 
                    className="h-9 text-xs" 
                    placeholder="أدخل الميزانية" 
                  />
                  <p className="text-center font-bold text-primary text-sm">{budget} ر.س</p>
                </div>
              )}
            </section>
            <section>
              <h4 className="mb-1 font-bold text-sm sm:text-base">التغريسة (عبارتك المطبوعة)</h4>
              <p className="mb-2 text-xs text-muted-foreground">تُطبع عبارتك على كرت أنيق يُغرس داخل الباقة</p>
              <Input maxLength={60} placeholder="اكتب عبارتك هنا… مثال: كل عام وأنتِ أجمل" value={phrase} onChange={(e) => setPhrase(e.target.value)} className="h-9 text-xs" />
              {phrase && <p className="mt-2 rounded-xl bg-primary px-3 py-2 text-center font-display text-sm sm:text-xl text-primary-foreground">{phrase}</p>}
            </section>
            <section>
              <h4 className="mb-2 font-bold text-sm sm:text-base">إضافات أخرى</h4>
              <textarea maxLength={300} rows={3} placeholder="اكتب أي إضافات أو طلبات خاصة تحبها…" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </section>
          </div>
        </div>
        <div className="flex items-center justify-between border-t pt-3">
          <div className="flex flex-col">
            <span className={`text-xl font-bold sm:text-2xl ${isPriceInvalid ? 'text-destructive' : 'text-primary'}`}>
              {price} ر.س
            </span>
            {isPriceInvalid && (
              <span className="text-xs text-destructive mt-1">
                الحجم المختار غير متاح بهذا السعر
              </span>
            )}
          </div>
          <Button 
            size="lg" 
            className="rounded-full px-4 text-sm sm:px-8 sm:text-base h-9 sm:h-12" 
            onClick={submit}
            disabled={isPriceInvalid}
          >
            أضف للسلة
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
