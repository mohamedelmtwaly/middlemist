import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { PageFooter } from "@/components/PageFooter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MessageCircle } from "lucide-react";
import { CartProvider } from "@/lib/cart";
import { CartSheet } from "@/components/CartSheet";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "الأسئلة الشائعة | Middlemist Flower" },
      { name: "description", content: "إجابات عن الأسئلة الشائعة حول خدماتنا ومنتجاتنا" },
    ],
  }),
  component: () => (
    <CartProvider>
      <FAQPage />
      <CartSheet />
    </CartProvider>
  ),
});

function FAQPage() {
  const faqs = [
    {
      question: "كيف أطلب من Middlemist؟",
      answer: "يمكنك الطلب مباشرة من موقعنا أو عبر واتساب. اختر المنتج الذي يعجبك، وحدد التخصيصات التي تريدها، ثم أرسل طلبك. سنتواصل معك لتأكيد التفاصيل والتوصيل."
    },
    {
      question: "ما أوقات العمل؟",
      answer: "نعمل يومياً من 7:30 صباحاً حتى 11:30 مساءً، بما في ذلك يوم الجمعة."
    },
    {
      question: "أين يقع المحل؟",
      answer: "نقع في جدة، يمكنك زيارتنا أو الطلب عبر واتساب للتوصيل داخل المدينة."
    },
    {
      question: "هل يمكن تنسيق باقة حسب الطلب؟",
      answer: "نعم! نحن متخصصون في التنسيق المخصص. يمكنك تحديد اللون، التغليف، الحجم، والميزانية، وسنقوم بتنسيق باقة حسب رغبتك."
    },
    {
      question: "هل يمكن إرسال هدية لشخص آخر؟",
      answer: "نعم، نقدم خدمة إرسال الهدايا. يمكنك ملء بيانات المرسل والمستلم، وسنقوم بتوصيل الهدية مع رسالة منك."
    },
    {
      question: "هل يتوفر التوصيل؟",
      answer: "نعم، نوفر خدمة التوصيل داخل جدة. يتم تحديد تكلفة التوصيل حسب الموقع."
    },
    {
      question: "ما أنواع التنسيقات المتوفرة؟",
      answer: "نقدم تشكيلة واسعة من التنسيقات: باقات الورد، الفازات، البوكسات، الدروع، المسكات، الدباديب، البالونات، وغيرها الكثير."
    },
    {
      question: "هل تقدمون خدمة للمناسبات؟",
      answer: "نعم، نقدم خدمات تنسيق المناسبات مثل حفلات الزفاف، التخرج، أعياد الميلاد، وغيرها من المناسبات الخاصة."
    },
    {
      question: "هل يمكن طلب الهدية مع الورد في توصيلة واحدة؟",
      answer: "نعم، يمكنك طلب باقة ورد مع هدايا إضافية (شوكولاتة، دبدوب، بالونات) وسنقوم بتوصيلها معاً في توصيلة واحدة."
    },
    {
      question: "كيف يتم تحديد السعر؟",
      answer: "يتم تحديد السعر حسب نوع الورد، الحجم، التغليف، والإضافات. يمكنك تحديد ميزانيتك ونحن سنساعدك في اختيار الأنسب."
    }
  ];

  return (
    <div className="min-h-screen font-sans bg-background">
      <PageHeader currentPage="الأسئلة الشائعة" />

      <section className="bg-section-1 px-4 py-12 md:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h1 className="font-display text-4xl text-primary md:text-5xl mb-4">الأسئلة العامة</h1>
            <p className="text-lg text-muted-foreground">إجابات عن تفاصيل</p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="rounded-2xl bg-card shadow-soft border-0 px-6">
                <AccordionTrigger className="text-right font-bold text-primary hover:text-primary/80 text-lg">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold text-primary mb-6">لديك سؤال آخر؟</h2>
            <Button asChild size="lg" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all">
              <a href="/#contact" className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                تواصل معنا
              </a>
            </Button>
          </div>
        </div>
      </section>

      <PageFooter />
    </div>
  );
}
