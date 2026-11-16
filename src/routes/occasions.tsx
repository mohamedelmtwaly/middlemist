import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { PageFooter } from "@/components/PageFooter";
import { CartProvider, useCart, type CartItem } from "@/lib/cart";
import { CartSheet } from "@/components/CartSheet";
import { occasions, products, type Product } from "@/lib/store-data";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/occasions")({
  head: () => ({
    meta: [
      { title: "مناسباتنا | Middlemist Flower | باقات ورد لكل مناسبة في جدة" },
      { name: "description", content: "اكتشف باقات الورد والهدايا المخصصة لكل مناسبة في Middlemist Flower جدة: مولود، خطوبة، تخرج، عيد ميلاد، شكر واعتذار، وغيرها. اطلب الآن عبر واتساب." },
      { name: "keywords", content: "ورد للمولود جدة, باقة ورد للتخرج, ورد للخطوبة, هدايا عيد ميلاد جدة, ورد للشكر والاعتذار, مناسبات ورد جدة" },
      { property: "og:title", content: "مناسباتنا | Middlemist Flower" },
      { property: "og:description", content: "اكتشف باقات الورد والهدايا المخصصة لكل مناسبة في Middlemist Flower جدة: مولود، خطوبة، تخرج، عيد ميلاد، شكر واعتذار، وغيرها." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.middlemist.store/occasions" },
      { property: "og:locale", content: "ar_SA" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "مناسباتنا | Middlemist Flower" },
      { name: "twitter:description", content: "اكتشف باقات الورد والهدايا المخصصة لكل مناسبة في Middlemist Flower جدة: مولود، خطوبة، تخرج، عيد ميلاد، شكر واعتذار، وغيرها." },
      { name: "robots", content: "index, follow" },
      { link: { rel: "canonical", href: "https://www.middlemist.store/occasions" } },
    ],
    scripts: [
      {
        type: "application/ld+json",
        innerHTML: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "الرئيسية",
              "item": "https://www.middlemist.store/"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "مناسباتنا",
              "item": "https://www.middlemist.store/occasions"
            }
          ]
        })
      }
    ]
  }),
  component: () => (
    <CartProvider>
      <OccasionsPage />
      <CartSheet />
    </CartProvider>
  ),
});

const occasionData = [
  {
    id: "newborn",
    title: "مولود",
    description: "تهنئة بالسرور والفرح",
    image: hero,
  },
  {
    id: "engagement",
    title: "خطوبة",
    description: "باقة لتعلن الحب",
    image: hero,
  },
  {
    id: "graduation",
    title: "تخرج",
    description: "احتفال بالإنجاز",
    image: hero,
  },
  {
    id: "birthday",
    title: "عيد ميلاد",
    description: "تهنئة بالسنة الحلوة",
    image: hero,
  },
  {
    id: "wedding",
    title: "زفاف",
    description: "باقة للعروسين",
    image: hero,
  },
  {
    id: "anniversary",
    title: "ذكرى زواج",
    description: "احتفال بالحب المستمر",
    image: hero,
  },
];

function OccasionsPage() {
  const { add } = useCart();
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);

  const handleAddToCart = (occasion: typeof occasionData[0]) => {
    add({
      name: `باقة ${occasion.title}`,
      image: occasion.image,
      price: 150,
    });
  };

  return (
    <div className="min-h-screen font-sans bg-background">
      <PageHeader currentPage="مناسباتنا" />

      <section className="bg-section-1 px-4 py-12 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="mb-4 text-xs tracking-[0.3em] text-gold">EVERY OCCASION A ROSE</p>
            <h1 className="font-display text-4xl text-primary md:text-5xl mb-4">كل مناسبة وردة</h1>
            <h2 className="font-display text-3xl text-primary md:text-4xl mb-6">مناسباتنا</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              فرح يستحق الورد وشعر يتيق . باقة لكل لحظة مزيل
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {occasionData.map((occasion) => (
              <div key={occasion.id} className="rounded-2xl bg-card shadow-soft overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={occasion.image}
                    alt={occasion.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div className="p-4 space-y-3">
                  <h3 className="font-display text-xl font-bold text-primary">{occasion.title}</h3>
                  <p className="text-sm text-muted-foreground">{occasion.description}</p>
                  <div className="flex gap-2 pt-2">
                    <Button
                      asChild
                      size="sm"
                      className="flex-1 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <a href="/gift">اطلب من المناسبة</a>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 rounded-full"
                      onClick={() => handleAddToCart(occasion)}
                    >
                      أضف سلة
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PageFooter />
    </div>
  );
}
