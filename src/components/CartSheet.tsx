import { useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCart, whatsappOrderUrl } from "@/lib/cart";
import logo from "@/assets/logo-middlemist-transparent.png";

export function CartSheet() {
  const { items, open, setOpen, setQty, total } = useCart();
  const [note, setNote] = useState("");
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="left"
        className="flex w-full flex-col bg-background p-0 sm:max-w-md"
        style={{ "--sheet-overlay-opacity": "0.5" } as React.CSSProperties}
      >
        <SheetHeader className="relative px-4 py-3 sm:px-6 sm:py-5" style={{ backgroundColor: '#282A18' }}>
          <button
            onClick={() => setOpen(false)}
            className="absolute left-3 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-primary-foreground/20 text-primary-foreground transition-all hover:bg-primary-foreground/30 hover:scale-110 sm:left-4 sm:h-8 sm:w-8"
            aria-label="إغلاق"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <div className="flex items-center gap-2 sm:gap-3">
            <img src={logo} alt="Middlemist Flower" className="h-10 w-auto object-contain sm:h-14" />
          </div>
        </SheetHeader>
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-muted-foreground sm:gap-4 sm:p-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted sm:h-24 sm:w-24">
              <ShoppingBag className="h-8 w-8 sm:h-12 sm:w-12" />
            </div>
            <p className="text-center text-base font-medium sm:text-lg">سلتك فارغة</p>
            <p className="text-center text-xs sm:text-sm">اختر باقتك المفضلة من مجموعتنا</p>
            <Button onClick={() => setOpen(false)} variant="outline" className="rounded-full text-xs sm:text-sm">
              تصفح المنتجات
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:space-y-4 sm:px-6 sm:py-5">
              {items.map((i) => (
                <div key={i.key} className="flex gap-3 rounded-xl border-2 border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md sm:gap-4 sm:rounded-2xl sm:p-4">
                  <img src={i.image} alt={i.name} className="h-16 w-16 rounded-lg object-cover shadow-sm sm:h-24 sm:w-24 sm:rounded-xl" />
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <p className="font-bold text-primary text-xs sm:text-sm">{i.name}</p>
                      {i.options?.map((o) => (
                        <p key={o} className="mt-0.5 text-[10px] text-muted-foreground sm:mt-1 sm:text-xs">{o}</p>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-6 w-6 rounded-full border-2 sm:h-8 sm:w-8"
                          onClick={() => setQty(i.key, i.qty + 1)}
                        >
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <span className="w-6 text-center font-bold text-primary text-xs sm:w-8 sm:text-sm">{i.qty}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-6 w-6 rounded-full border-2 sm:h-8 sm:w-8"
                          onClick={() => setQty(i.key, i.qty - 1)}
                        >
                          {i.qty === 1 ? <Trash2 className="h-3 w-3 text-destructive sm:h-4 sm:w-4" /> : <Minus className="h-3 w-3 sm:h-4 sm:w-4" />}
                        </Button>
                      </div>
                      <span className="font-bold text-primary text-sm sm:text-lg">{i.price * i.qty} ر.س</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3 border-t-2 border-border bg-card px-4 py-4 shadow-lg sm:space-y-4 sm:px-6 sm:py-6">
              <Textarea
                placeholder="ملاحظات التوصيل (الموعد، العنوان...)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="rounded-xl border-2 resize-none text-xs sm:text-sm"
                rows={2}
              />
              <div className="flex justify-between text-base font-bold sm:text-xl">
                <span className="text-muted-foreground text-xs sm:text-sm">الإجمالي</span>
                <span className="text-primary text-sm sm:text-lg">{total} ر.س</span>
              </div>
              <Button
                asChild
                size="lg"
                className="w-full rounded-full py-4 text-sm font-bold shadow-lg transition-all hover:shadow-xl sm:py-6 sm:text-lg"
              >
                <a href={whatsappOrderUrl(items, total, note)} target="_blank" rel="noreferrer">
                  إتمام الطلب عبر واتساب
                </a>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
