import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader } from "@/components/PageHeader";
import { PageFooter } from "@/components/PageFooter";
import { CartProvider } from "@/lib/cart";
import { CartSheet } from "@/components/CartSheet";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/gift")({
  head: () => ({
    meta: [
      { title: "صمم هدية | Middlemist Flower" },
      { name: "description", content: "صمم هديتك الخاصة لمن تحب باقات ورد وهدايا مخصصة" },
    ],
  }),
  component: () => (
    <CartProvider>
      <GiftPage />
      <CartSheet />
    </CartProvider>
  ),
});

function GiftPage() {
  const [formData, setFormData] = useState({
    senderName: "",
    senderMobile: "",
    recipientName: "",
    recipientMobile: "",
    hideSender: false,
    occasion: "",
    giftType: "باقة ورد",
    colors: "",
    budget: "",
    deliveryType: "توصيل",
    address: "",
    deliveryDate: "",
    message: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add WhatsApp integration here
  };

  return (
    <div className="min-h-screen font-sans bg-background">
      <PageHeader currentPage="أرسل هدية" />

      <section className="bg-section-1 py-12 md:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-10 text-center">
            <p className="mb-4 text-xs tracking-[0.3em] text-gold">GIFT FROM THE HEART</p>
            <h1 className="font-display text-4xl text-primary md:text-5xl">الهدية من القلب</h1>
            <p className="mt-4 text-muted-foreground">أرسل هدية لمن تحب مع رسالة من القلب</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
            {/* Right Panel - Form */}
            <form onSubmit={handleSubmit} className="space-y-6 order-2 lg:order-1">
              {/* Sender and Recipient Details */}
              <div className="rounded-3xl bg-card p-6 shadow-soft">
                <h3 className="mb-4 font-display text-xl text-primary">بيانات المرسل والمستلم</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="senderName">اسم المرسل</Label>
                    <Input
                      id="senderName"
                      value={formData.senderName}
                      onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                      placeholder="اسمك الكامل"
                      className="rounded-xl border-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="senderMobile">جوال المرسل</Label>
                    <Input
                      id="senderMobile"
                      value={formData.senderMobile}
                      onChange={(e) => setFormData({ ...formData, senderMobile: e.target.value })}
                      placeholder="05x0000000"
                      className="rounded-xl border-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="recipientName">اسم المستلم</Label>
                    <Input
                      id="recipientName"
                      value={formData.recipientName}
                      onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                      placeholder="اسم المستلم"
                      className="rounded-xl border-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="recipientMobile">جوال المستلم</Label>
                    <Input
                      id="recipientMobile"
                      value={formData.recipientMobile}
                      onChange={(e) => setFormData({ ...formData, recipientMobile: e.target.value })}
                      placeholder="05000000000"
                      className="rounded-xl border-2"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="hideSender"
                      checked={formData.hideSender}
                      onCheckedChange={(checked) => setFormData({ ...formData, hideSender: checked as boolean })}
                    />
                    <Label htmlFor="hideSender" className="cursor-pointer">إخفاء اسم المرسل عن المستلم</Label>
                  </div>
                </div>
              </div>

              {/* Gift Details */}
              <div className="rounded-3xl bg-card p-6 shadow-soft">
                <h3 className="mb-4 font-display text-xl text-primary">تفاصيل الهدية</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="occasion">المناسبة</Label>
                    <select
                      id="occasion"
                      value={formData.occasion}
                      onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                      className="w-full rounded-xl border-2 px-4 py-3 bg-background"
                    >
                      <option value="">اختر المناسبة</option>
                      <option value="عيد ميلاد">عيد ميلاد</option>
                      <option value="عيد زواج">عيد زواج</option>
                      <option value="تهنئة">تهنئة</option>
                      <option value="شكر">شكر</option>
                      <option value="حب">حب</option>
                      <option value="أخرى">أخرى</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="giftType">نوع الهدية</Label>
                    <select
                      id="giftType"
                      value={formData.giftType}
                      onChange={(e) => setFormData({ ...formData, giftType: e.target.value })}
                      className="w-full rounded-xl border-2 px-4 py-3 bg-background"
                    >
                      <option value="باقة ورد">باقة ورد</option>
                      <option value="بوكس هدايا">بوكس هدايا</option>
                      <option value="فازة ورد">فازة ورد</option>
                      <option value="دبدوب وورد">دبدوب وورد</option>
                      <option value="شوكولاتة وورد">شوكولاتة وورد</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="colors">الألوان المفضلة</Label>
                    <Input
                      id="colors"
                      value={formData.colors}
                      onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                      placeholder="مثل: وردي وابيض"
                      className="rounded-xl border-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="budget">الميزانية (ر.س)</Label>
                    <Input
                      id="budget"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      placeholder="الميزانية المناسبة لك"
                      className="rounded-xl border-2"
                    />
                  </div>
                </div>
              </div>

              {/* Pickup and Delivery */}
              <div className="rounded-3xl bg-card p-6 shadow-soft">
                <h3 className="mb-4 font-display text-xl text-primary">الاستلام والتوصيل</h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="deliveryType"
                        value="توصيل"
                        checked={formData.deliveryType === "توصيل"}
                        onChange={(e) => setFormData({ ...formData, deliveryType: e.target.value })}
                        className="h-4 w-4"
                      />
                      <span>توصيل</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="deliveryType"
                        value="استلام من المحل"
                        checked={formData.deliveryType === "استلام من المحل"}
                        onChange={(e) => setFormData({ ...formData, deliveryType: e.target.value })}
                        className="h-4 w-4"
                      />
                      <span>استلام من المحل</span>
                    </label>
                  </div>
                  {formData.deliveryType === "توصيل" && (
                    <div>
                      <Label htmlFor="address">عنوان التوصيل</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="المدينة الحي الشارع"
                        className="rounded-xl border-2"
                      />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="deliveryDate">تاريخ الاستلام المطلوب</Label>
                    <Input
                      id="deliveryDate"
                      type="date"
                      value={formData.deliveryDate}
                      onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                      className="rounded-xl border-2"
                    />
                  </div>
                </div>
              </div>

              {/* Message from Heart */}
              <div className="rounded-3xl bg-card p-6 shadow-soft">
                <h3 className="mb-4 font-display text-xl text-primary">رسالة من القلب</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="message">رسالة بطاقة الهدية (اختياري)</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="اكتب كلماتك لمن تحب..."
                      className="rounded-xl border-2 resize-none"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">ملاحظات إضافية (اختياري)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="أي تفاصيل خاصة بهديتك"
                      className="rounded-xl border-2 resize-none"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full rounded-full bg-primary text-primary-foreground py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
              >
                <Gift className="mr-2 h-5 w-5" />
                إرسال طلب الهدية
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                سيتم تنسيق ميدلي لتحديد الأسعار والتوصيل بعد الاتفاق مع العميل.
              </p>
            </form>

            {/* Left Panel - Gift Details */}
            <div className="rounded-3xl bg-card p-6 shadow-soft order-1 lg:order-2">
              <div className="mb-6 overflow-hidden rounded-2xl">
                <img src={hero} alt="Gift Box" className="h-auto w-full object-contain" />
              </div>
              <h2 className="mb-3 font-display text-2xl text-primary">تفاصيل صغيرة، فرحة كبيرة</h2>
              <p className="mb-6 text-muted-foreground">
                Middlemist - ورد يفرح. هدايا من القلب لمن تحب.
              </p>
              <Button asChild className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                <a href="https://wa.me/966539844144" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2">
                  <Gift className="h-5 w-5" />
                  تواصل معنا عبر واتساب
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <PageFooter />
    </div>
  );
}
