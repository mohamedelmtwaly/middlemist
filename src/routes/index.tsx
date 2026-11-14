import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { MapPin, MessageCircle, ShoppingBag, Sparkles, Star, ChevronLeft, ChevronRight, Menu, X, Gift, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartProvider, useCart, type CartItem } from "@/lib/cart";
import { CartSheet } from "@/components/CartSheet";
import { CustomizeDialog } from "@/components/CustomizeDialog";
import { PageHeader } from "@/components/PageHeader";
import { PageFooter } from "@/components/PageFooter";
import {
  ADDRESS, MAP_URL, WHATSAPP, bouquets, collections,
  occasions, services, testimonials, type Product, categoryImages, APPROVED_OCCASIONS,
} from "@/lib/store-data";
import type { Category } from "@/lib/use-categories";
import { useProducts } from "@/lib/use-products";
import { useCategories } from "@/lib/use-categories";
import logo from "@/assets/logo-middlemist-transparent.png";
import hero from "@/assets/hero.jpg";
import heroBg from "@/assets/hero-bg.jpg";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Middlemist Flower | ورد وهدايا وطباعة في جدة" },
      { name: "description", content: "متجر Middlemist Flower في جدة: باقات ورد، مسكات عروس، بوكسات هدايا، دروع، طباعة وتنسيق حفلات. صمّم باقتك واطلب عبر واتساب." },
      { property: "og:title", content: "Middlemist Flower | ورد وهدايا وطباعة" },
      { property: "og:description", content: "صمّم باقتك بلونك وميزانيتك وعبارتك، واطلب مباشرة عبر واتساب." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      // Preload critical images for better performance
      { link: { rel: "preload", as: "image", href: hero } },
      { link: { rel: "preload", as: "image", href: heroBg } },
    ],
  }),
  component: () => (
    <CartProvider>
      <Store />
      <CartSheet />
    </CartProvider>
  ),
});

const desc: Record<string, string> = {
  "Balloons & Teddy Bears": "البالونات والدباديب لمزيد من الفرح",
  "Vases & Stands": "فازات وأستاندات راقية لتنسيق الورود",
  "Bridal Collection": "مسكات وتجهيزات العروس الفاخرة",
  "Printing & Acrylic": "طباعة وأكريليك عالي الجودة",
};

type Add = (i: Omit<CartItem, "key" | "qty">) => void;

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const itemsPerPage = () => {
    if (typeof window === 'undefined') return 1;
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 640) return 2;
    return 1;
  };

  const [cardsPerPage, setCardsPerPage] = useState(1);

  useEffect(() => {
    setCardsPerPage(itemsPerPage());
    const handleResize = () => setCardsPerPage(itemsPerPage());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.ceil(testimonials.length / cardsPerPage));
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, cardsPerPage]);

  const totalPages = Math.ceil(testimonials.length / cardsPerPage);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const currentTestimonials = testimonials.slice(
    currentIndex * cardsPerPage,
    (currentIndex + 1) * cardsPerPage
  );

  return (
    <section id="testimonials" style={{ backgroundColor: '#F5F1E9' }} className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 text-center">
          <p className="mb-4 text-xs tracking-[0.3em] text-primary/70 sm:text-xs">TESTIMONIALS</p>
          <h2 className="font-display text-3xl text-primary md:text-5xl">آراء عملائنا</h2>
          <p className="mt-6 text-sm text-primary/75 md:text-base">ماذا يقول عملاؤنا عنا</p>
        </div>

        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
            {currentTestimonials.map((testimonial, index) => (
              <article key={index} className="flex h-[200px] flex-col rounded-2xl bg-card p-4 shadow-soft md:h-[220px] md:p-5">
                <div className="mb-2 flex gap-1 md:mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-gold text-gold md:h-4 md:w-4" />
                  ))}
                </div>
                <p className="mb-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3 md:mb-3 md:text-sm">{testimonial.review}</p>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs md:h-9 md:w-9 md:text-sm">
                    {testimonial.name.charAt(0)}
                  </div>
                  <p className="text-sm font-bold text-primary md:text-base">{testimonial.name}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              className="rounded-full"
              aria-label="السابق"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>

            <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    "h-2 w-2 rounded-full transition-all",
                    index === currentIndex ? "w-8 bg-primary" : "bg-muted-foreground/30"
                  )}
                  aria-label={`الشريحة ${index + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              className="rounded-full"
              aria-label="التالي"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

const VisitUsSection = () => {
  const today = new Date().getDay();
  return (
    <section id="visit-us" style={{ backgroundColor: '#F5F1E9' }} className="py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 text-center">
          <p className="mb-4 text-xs tracking-[0.3em] text-gold">VISIT US</p>
          <h2 className="font-display text-4xl text-primary md:text-5xl">زورونا</h2>
          <p className="mt-6 text-muted-foreground">موقعنا وتواصل معنا</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-card p-6 shadow-soft">
            <div className="mb-6">
              <h3 className="mb-2 text-lg font-bold text-primary">العنوان</h3>
              <p className="text-muted-foreground">{ADDRESS}</p>
            </div>
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-bold text-primary">ساعات العمل</h3>
              <div className="space-y-2 text-sm">
                {[
                  { day: "الأحد", time: "٢:٠٠م – ٢:٣٠ص", index: 0 },
                  { day: "الاثنين", time: "٢:٠٠م – ٢:٣٠ص", index: 1 },
                  { day: "الثلاثاء", time: "٢:٠٠م – ٢:٣٠ص", index: 2 },
                  { day: "الأربعاء", time: "٢:٠٠م – ٢:٣٠ص", index: 3 },
                  { day: "الخميس", time: "٢:٠٠م – ٢:٣٠ص", index: 4 },
                  { day: "الجمعة", time: "٢:٠٠م – ٢:٣٠ص", index: 5 },
                  { day: "السبت", time: "٢:٠٠م – ٢:٣٠ص", index: 6 },
                ].map((item) => (
                  <div key={item.day} className={cn("flex justify-between", item.index === today ? "font-bold text-primary" : "text-muted-foreground")}>
                    <span>{item.day}{item.index === today ? " (اليوم)" : ""}</span>
                    <span>{item.time}</span>
                  </div>
                ))}
                <p className="mt-2 text-xs text-muted-foreground">ملاحظة: ساعات العمل من ٢:٠٠م إلى ٢:٣٠ص، بما في ذلك الجمعة</p>
              </div>
            </div>
            <div className="mb-6">
              <h3 className="mb-2 text-lg font-bold text-primary">الهاتف</h3>
              <p className="text-muted-foreground" dir="ltr">053 984 4144</p>
            </div>
            <Button asChild className="w-full rounded-full">
              <a href={MAP_URL} target="_blank" rel="noreferrer">
                افتح في خرائط جوجل
              </a>
            </Button>
          </div>
          <div className="overflow-hidden rounded-2xl bg-card shadow-soft flex flex-col">
            <a href={MAP_URL} target="_blank" rel="noreferrer" className="relative block flex-1 min-h-[300px] w-full bg-muted">
              <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                <MapPin className="h-12 w-12 text-primary" />
                <p className="text-center font-medium">اضغط لفتح الموقع في خرائط جوجل</p>
              </div>
            </a>
            <div className="p-4 text-center border-t border-border space-y-1">
              <p className="text-sm font-medium text-primary">حي أبو ذر الغفار رضي الله عنه</p>
              <p className="text-xs text-muted-foreground">النسيم، جدة 23233، المملكة العربية السعودية</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Head = ({ en, title, description }: { en: string; title: string; description?: string }) => (
  <div className="mb-8 text-center md:mb-10">
    <p className="mb-3 text-xs tracking-[0.3em] text-gold md:mb-4 md:text-xs">{en}</p>
    <h2 className="font-display text-3xl text-primary md:text-4xl lg:text-5xl">{title}</h2>
    {description && <p className="mt-4 text-sm text-muted-foreground md:mt-6 md:text-sm">{description}</p>}
  </div>
);

// دالة مساعدة للاختيار العشوائي اليومي (نفس منطق picked)
const getDailyRandomProducts = (allProducts: Product[], count: number) => {
  // احصل على المنتجات النشطة فقط مع صور صالحة
  const activeProducts = allProducts.filter((p) => p.image && p.image.length > 0);

  // المنتجات المحددة لقسم spotlight (تظهر دائماً في البداية)
  const spotlightProducts = activeProducts.filter((p) => p.display_sections?.includes('spotlight'));

  // المنتجات غير المحددة (للاختيار العشوائي)
  const nonSpotlightProducts = activeProducts.filter((p) => !p.display_sections?.includes('spotlight'));

  // احسب اليوم الحالي في المنطقة الزمنية السعودية
  const getDayInSaudi = () => {
    const now = new Date();
    const options = { timeZone: 'Asia/Riyadh', year: 'numeric', month: 'numeric', day: 'numeric' } as const;
    const dateStr = now.toLocaleDateString('en-CA', options); // YYYY-MM-DD
    return dateStr;
  };

  const today = getDayInSaudi();

  // دالة بسيطة لتوليد رقم ثابت من نص
  const simpleHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };

  // فرز المنتجات غير المحددة بطريقة determinism بناءً على اليوم
  const sortedNonSpotlight = [...nonSpotlightProducts].sort((a, b) => {
    const hashA = simpleHash(`${today}-${a.id}`);
    const hashB = simpleHash(`${today}-${b.id}`);
    return hashA - hashB;
  });

  // دمج المنتجات المحددة مع المنتجات العشوائية
  // المنتجات المحددة تأتي أولاً، ثم العشوائية
  const combinedProducts = [...spotlightProducts, ...sortedNonSpotlight];

  // اختيار العدد المطلوب من المنتجات
  return combinedProducts.slice(0, count);
};

function SpotlightSlider({ products }: { products: Product[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [touchX, setTouchX] = useState<number | null>(null);
  
  // اختيار 10 منتجات عشوائية يوميًا
  const slides = useMemo(() => {
    const selectedProducts = getDailyRandomProducts(products, 10);
    
    // تحويل المنتجات إلى format الشرائح
    return selectedProducts.map((p) => ({
      en: p.category, // استخدام التصنيف كعنوان إنجليزي
      title: p.name, // اسم المنتج كعنوان عربي
      desc: p.desc || p.category, // الوصف أو التصنيف
      img: p.image, // صورة المنتج
      cta: "عرض المنتج", // نص الزر
      href: `/products?product=${p.id}`, // رابط لصفحة المنتجات مع ID المنتج
      product: p, // حفظ المنتج كامل
    }));
  }, [products]);
  
  const n = slides.length;
  const go = (d: number) => setI((v) => (v + d + n) % n);
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((v) => (v + 1) % n), 6000);
    return () => clearInterval(t);
  }, [paused, n]);
  
  if (n === 0) return null; // لا تعرض شيئًا إذا لم توجد منتجات
  
  return (
    <section aria-roledescription="carousel" aria-label="مختارات مميزة" style={{ backgroundColor: '#D5D2BC' }} className="py-12 text-primary md:py-24"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6 text-center md:mb-8">
          <p className="mb-2 text-xs tracking-[0.3em] text-gold sm:mb-3 sm:text-xs">SIGNATURE STORIES</p>
          <h2 className="font-display text-3xl md:text-5xl">حكايات من متجرنا</h2>
        </div>
        <div className="relative overflow-hidden rounded-2xl shadow-2xl md:rounded-3xl"
          onTouchStart={(e) => { setTouchX(e.touches[0]?.clientX ?? null); setPaused(true); }}
          onTouchEnd={(e) => { if (touchX !== null) { const dx = (e.changedTouches[0]?.clientX ?? touchX) - touchX; if (Math.abs(dx) > 40) go(dx > 0 ? 1 : -1); } setTouchX(null); setPaused(false); }}>
          <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(${i * 100}%)` }}>
            {slides.map((s) => {
              const img = s.img;
              return (
                <div key={s.product.id} className="grid w-full shrink-0 items-center gap-4 p-4 md:gap-8 md:grid-cols-2 md:p-12" style={{ backgroundColor: '#F5F1E9' }}>
                  <div className="relative order-2 md:order-1">
                    <div className="absolute -inset-3 rounded-2xl border-2 border-gold/20 md:-inset-4 md:rounded-3xl" />
                    <img src={img} alt={s.title} loading="lazy" className="relative aspect-square w-full rounded-xl object-cover shadow-lg md:rounded-2xl md:aspect-[4/3]" />
                  </div>
                  <div className="order-1 space-y-3 text-center md:order-2 md:space-y-5 md:text-start">
                    <p className="text-xs tracking-[0.3em] text-gold md:text-xs">{s.en}</p>
                    <h3 className="font-display text-2xl leading-tight md:text-3xl lg:text-4xl">{s.title}</h3>
                    <p className="text-sm text-muted-foreground md:text-sm">{s.desc}</p>
                    <Button asChild size="lg" className="h-10 rounded-full px-6 text-sm shadow-lg transition hover:shadow-xl md:h-12 md:px-8 md:text-base"><a href={s.href}>{s.cta}</a></Button>
                  </div>
                </div>
              );
            })}
          </div>
          <button aria-label="السابق" onClick={() => go(-1)} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg transition hover:bg-primary hover:scale-110 md:right-4 md:h-12 md:w-12"><ChevronRight className="h-5 w-5 md:h-6 md:w-6" /></button>
          <button aria-label="التالي" onClick={() => go(1)} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg transition hover:bg-primary hover:scale-110 md:left-4 md:h-12 md:w-12"><ChevronLeft className="h-5 w-5 md:h-6 md:w-6" /></button>
        </div>
        <div className="mt-6 flex justify-center gap-3 md:mt-8">
          {slides.map((s, k) => (
            <button key={s.product.id} aria-label={`الشريحة ${k + 1}`} aria-current={k === i} onClick={() => setI(k)}
              className={cn("h-2.5 rounded-full transition-all duration-300 hover:scale-125", k === i ? "w-10 bg-primary shadow-md" : "w-2.5 bg-primary/30 hover:bg-primary/50")} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ p, onOpen, add }: { p: Product; onOpen: (p: Product) => void; add: Add }) {
  return (
    <article className="group card-lift flex h-full flex-col overflow-hidden rounded-xl border border-border/50 bg-card shadow-soft transition-shadow">
      <div className="relative overflow-hidden">
        <img src={p.image} alt={p.name} loading="lazy" width={600} height={600} className="aspect-square w-full object-cover transition duration-700 group-hover:scale-105 sm:aspect-square md:aspect-square" />
        <span className="absolute right-1.5 top-1.5 max-w-[70%] truncate rounded-full bg-card/90 px-1.5 py-0.5 text-xs font-medium text-primary backdrop-blur sm:right-2 sm:top-2 sm:px-2 sm:py-0.5 sm:text-[10px] md:right-3 md:top-3 md:px-3 md:py-1 md:text-[11px]">{p.category}</span>
        <button onClick={() => onOpen(p)} className="absolute inset-x-1.5 bottom-1.5 translate-y-2 rounded-full bg-primary/90 py-1 text-xs font-bold text-primary-foreground opacity-0 backdrop-blur transition group-hover:translate-y-0 group-hover:opacity-100 sm:inset-x-2 sm:bottom-2 sm:py-1.5 sm:text-[10px] md:inset-x-3 md:bottom-3 md:py-2 md:text-xs">
          خصّص
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-2 sm:gap-1.5 sm:p-3 md:gap-2 md:p-4">
        <h3 className="line-clamp-1 text-sm font-bold text-foreground sm:text-sm md:text-base">{p.name}</h3>
        {p.desc && <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-[10px] md:text-xs">{p.desc}</p>}
        <div className="mt-auto flex items-center justify-between gap-1.5 pt-0.5 sm:gap-2 sm:pt-1 md:pt-2">
          <p className="text-sm font-bold text-primary sm:text-sm md:text-lg">{p.price} <span className="text-xs font-medium text-muted-foreground sm:text-[10px] md:text-xs">ر.س</span></p>
          <Button size="sm" className="h-6 rounded-full px-1.5 text-xs sm:h-7 sm:px-2 sm:text-[10px] md:h-8 md:px-4 md:text-xs" aria-label={`أضف ${p.name} للسلة`} onClick={() => onOpen(p)}>
            <ShoppingBag className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4" /> أضف
          </Button>
        </div>
      </div>
    </article>
  );
}

function Shelf({ title, en, items, onOpen, add, description }: { title: string; en?: string; items: Product[]; onOpen: (p: Product) => void; add: Add; description?: string }) {
  if (!items.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 md:py-20">
      {en ? <Head en={en} title={title} {...(description !== undefined && { description })} /> : title && <h2 className="mb-8 font-display text-3xl text-primary">{title}</h2>}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-4">
        {items.map((p: Product) => (
          <ProductCard key={p.id} p={p} onOpen={onOpen} add={add} />
        ))}
      </div>
    </section>
  );
}

function Store() {
  const { count, setOpen, add } = useCart();
  const [customizing, setCustomizing] = useState<Product | null>(null);
  const [occ, setOcc] = useState<typeof APPROVED_OCCASIONS[number]>(APPROVED_OCCASIONS[0]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [flowerDisplayCount, setFlowerDisplayCount] = useState(20);
  const [giftDisplayCount, setGiftDisplayCount] = useState(20);
  const [selectionDisplayCount, setSelectionDisplayCount] = useState(20);
  const [customBouquetOpen, setCustomBouquetOpen] = useState(false);
  const [customBouquetForm, setCustomBouquetForm] = useState({
    name: "",
    phone: "",
    address: "",
    occasion: "",
    colors: "",
    budget: "",
    message: "",
    notes: "",
  });

  // جلب البيانات من Supabase
  const { data: products = [], isLoading: productsLoading, error: productsError } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useCategories();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const nav = target.closest('nav');
      const menuButton = target.closest('button[aria-label="القائمة"]');

      if (mobileMenuOpen && !nav && !menuButton) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  const setMobileMenuOpenExternal = (value: boolean) => {
    setMobileMenuOpen(value);
  };

  const flowers = useMemo(() => {
    const filtered = products.filter((p) => p.category === "باقات الورد");
    return filtered.slice(0, flowerDisplayCount);
  }, [products, flowerDisplayCount]);
  const occItems = useMemo(
    () => {
      // المنتجات المحددة لقسم المناسبات
      const sectionProducts = products.filter((p) => p.display_sections?.includes('occasions'));
      
      // المنتجات التي تطابق المناسبة
      const occasionProducts = products.filter((p) => p.occasions?.includes(occ) ?? false);
      
      // دمج بدون تكرار
      const combined = [...sectionProducts];
      occasionProducts.forEach(p => {
        if (!combined.find(cp => cp.id === p.id)) {
          combined.push(p);
        }
      });
      
      return combined;
    },
    [occ, products],
  );
  const picked = useMemo(() => {
    // احصل على المنتجات النشطة فقط مع صور صالحة
    const activeProducts = products.filter((p) => p.image && p.image.length > 0);
    
    // احسب اليوم الحالي في المنطقة الزمنية السعودية
    const getDayInSaudi = () => {
      const now = new Date();
      const options = { timeZone: 'Asia/Riyadh', year: 'numeric', month: 'numeric', day: 'numeric' } as const;
      const dateStr = now.toLocaleDateString('en-CA', options); // YYYY-MM-DD
      return dateStr;
    };
    
    const today = getDayInSaudi();
    
    // دالة بسيطة لتوليد رقم ثابت من نص
    const simpleHash = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return Math.abs(hash);
    };
    
    // فرز المنتجات بطريقة determinism بناءً على اليوم
    const sortedProducts = [...activeProducts].sort((a, b) => {
      const hashA = simpleHash(`${today}-${a.id}`);
      const hashB = simpleHash(`${today}-${b.id}`);
      return hashA - hashB;
    });
    
    // اختيار أول 5 منتجات
    return sortedProducts.slice(0, 5);
  }, [products]);
  const gifts = collections[0]!;
  const tabs: [string, string, string[] | null, string][] = [
    ...collections.slice(1).map(([t, en, c]) => [t, en, c, desc[en] ?? ""] as [string, string, string[], string]),
    ["اختياراتنا", "Our Selection", null, "تشكيلة يدوية من أجمل المنتجات التي اخترناها لك بعناية"],
  ];
  const [tab, setTab] = useState(tabs[0]![1]);
  const tabCats = tabs.find((t) => t[1] === tab)?.[2];
  const allTabItems = tabCats ? products.filter((p) => tabCats.includes(p.category)) : picked;
  const tabItems = allTabItems.slice(0, selectionDisplayCount);
  const hasMoreSelections = allTabItems.length > selectionDisplayCount;
  const open = (p: Product) => setCustomizing(p);

  // حالة التحميل
  if (productsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen overflow-x-clip font-sans">
        <PageHeader currentPage="الرئيسية" showBreadcrumb={false} />
        <section className="relative overflow-hidden bg-hero text-primary-foreground min-h-[calc(100svh-4rem)] sm:min-h-[calc(100svh-5rem)] lg:min-h-[calc(100svh-6rem)]">
          <img src={heroBg} alt="" aria-hidden width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover opacity-40" />
          <span className="absolute inset-0 bg-hero-veil" />
          <div className="relative mx-auto grid w-full max-w-7xl items-center gap-6 px-4 py-8 sm:gap-12 sm:px-5 sm:py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-12">
            <div className="order-2 space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 sm:order-1 sm:space-y-6 sm:space-y-8">
              <p className="inline-flex items-center gap-2 rounded-full border border-gold-bright/30 bg-primary-foreground/5 px-3 py-1.5 text-xs tracking-[0.25em] text-gold-bright backdrop-blur sm:gap-3 sm:px-4 sm:py-2 sm:text-xs">
                <Sparkles className="h-3.5 w-3.5 sm:h-3.5 sm:w-3.5" /> MIDDLEMIST FLOWER · جدة
              </p>
              <h1 className="font-display text-3xl leading-[1.25] sm:text-4xl lg:text-7xl">
                لكل مناسبة
                <span className="mt-2 block text-gold-bright sm:text-4xl lg:text-7xl">وردة تحكي عنك</span>
              </h1>
              <p className="max-w-xl text-sm leading-loose text-primary-foreground/85 sm:text-base sm:text-lg">
                باقات ومسكات عروس وبوكسات هدايا وتنسيق مناسبات، تُصمَّم بلونك وميزانيتك مع تغريسة مطبوعة بعبارتك.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                <Button asChild size="lg" variant="secondary" className="h-10 rounded-full px-4 text-xs font-bold shadow-soft sm:h-14 sm:px-10 sm:text-base"><a href="/gift">صمّم باقتك</a></Button>
                <Button asChild size="lg" variant="outline" className="h-10 rounded-full border-primary-foreground/40 bg-transparent px-4 text-xs text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground sm:h-14 sm:px-10 sm:text-base"><a href="/products">تسوّق الآن</a></Button>
              </div>
              <a href={MAP_URL} target="_blank" rel="noreferrer" className="flex items-start gap-2 text-xs text-primary-foreground/75 transition-colors hover:text-gold-bright sm:text-sm">
                <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-gold-bright sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">{ADDRESS} · <span dir="ltr" className="whitespace-nowrap">+966 53 984 4144</span></span>
              </a>
            </div>
            <div className="order-1 relative mx-auto w-full max-w-[160px] sm:order-2 sm:max-w-xs lg:max-w-md">
              <div className="absolute -inset-1.5 rounded-[1.5rem] border border-gold-bright/25 sm:-inset-4 sm:rounded-[2.5rem]" />
              <img src={hero} alt="باقة ورد من Middlemist" width={800} height={1000} className="relative aspect-[4/5] w-full rounded-[1rem] object-cover shadow-soft sm:rounded-[2rem]" />
              <div className="absolute -right-1.5 bottom-3 flex items-center gap-1.5 rounded-lg bg-card px-2 py-1.5 text-foreground shadow-soft sm:-right-3 sm:bottom-8 sm:gap-3 sm:rounded-2xl sm:px-5 sm:py-4 lg:-right-8">
                <div className="flex text-gold">{Array.from({ length: 5 }, (_, k) => <Star key={k} className="h-2 w-2 fill-current sm:h-4 sm:w-4" />)}</div>
                <div className="text-[10px] sm:text-sm"><p className="font-bold">تنسيق يدوي</p><p className="text-[9px] text-muted-foreground sm:text-xs">بعناية لكل تفصيلة</p></div>
              </div>
              <div className="absolute -left-1.5 top-3 rounded-lg bg-secondary px-2 py-1.5 text-[10px] font-bold text-secondary-foreground shadow-soft sm:-left-3 sm:top-8 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm lg:-left-6">تغريسة بعبارتك ✦</div>
            </div>
          </div>
        </section>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // حالة الخطأ
  if (productsError || categoriesError) {
    return (
      <div className="min-h-screen overflow-x-clip font-sans">
        <PageHeader currentPage="الرئيسية" showBreadcrumb={false} />
        <section className="relative overflow-hidden bg-hero text-primary-foreground min-h-[calc(100svh-4rem)] sm:min-h-[calc(100svh-5rem)] lg:min-h-[calc(100svh-6rem)]">
          <img src={heroBg} alt="" aria-hidden width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover opacity-40" />
          <span className="absolute inset-0 bg-hero-veil" />
          <div className="relative mx-auto grid w-full max-w-7xl items-center gap-6 px-4 py-8 sm:gap-12 sm:px-5 sm:py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-12">
            <div className="order-2 space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 sm:order-1 sm:space-y-6 sm:space-y-8">
              <p className="inline-flex items-center gap-2 rounded-full border border-gold-bright/30 bg-primary-foreground/5 px-3 py-1.5 text-xs tracking-[0.25em] text-gold-bright backdrop-blur sm:gap-3 sm:px-4 sm:py-2 sm:text-xs">
                <Sparkles className="h-3.5 w-3.5 sm:h-3.5 sm:w-3.5" /> MIDDLEMIST FLOWER · جدة
              </p>
              <h1 className="font-display text-3xl leading-[1.25] sm:text-4xl lg:text-7xl">
                لكل مناسبة
                <span className="mt-2 block text-gold-bright sm:text-4xl lg:text-7xl">وردة تحكي عنك</span>
              </h1>
              <p className="max-w-xl text-sm leading-loose text-primary-foreground/85 sm:text-base sm:text-lg">
                باقات ومسكات عروس وبوكسات هدايا وتنسيق مناسبات، تُصمَّم بلونك وميزانيتك مع تغريسة مطبوعة بعبارتك.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                <Button asChild size="lg" variant="secondary" className="h-10 rounded-full px-4 text-xs font-bold shadow-soft sm:h-14 sm:px-10 sm:text-base"><a href="/gift">صمّم باقتك</a></Button>
                <Button asChild size="lg" variant="outline" className="h-10 rounded-full border-primary-foreground/40 bg-transparent px-4 text-xs text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground sm:h-14 sm:px-10 sm:text-base"><a href="/products">تسوّق الآن</a></Button>
              </div>
              <a href={MAP_URL} target="_blank" rel="noreferrer" className="flex items-start gap-2 text-xs text-primary-foreground/75 transition-colors hover:text-gold-bright sm:text-sm">
                <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-gold-bright sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">{ADDRESS} · <span dir="ltr" className="whitespace-nowrap">+966 53 984 4144</span></span>
              </a>
            </div>
            <div className="order-1 relative mx-auto w-full max-w-[160px] sm:order-2 sm:max-w-xs lg:max-w-md">
              <div className="absolute -inset-1.5 rounded-[1.5rem] border border-gold-bright/25 sm:-inset-4 sm:rounded-[2.5rem]" />
              <img src={hero} alt="باقة ورد من Middlemist" width={800} height={1000} className="relative aspect-[4/5] w-full rounded-[1rem] object-cover shadow-soft sm:rounded-[2rem]" />
              <div className="absolute -right-1.5 bottom-3 flex items-center gap-1.5 rounded-lg bg-card px-2 py-1.5 text-foreground shadow-soft sm:-right-3 sm:bottom-8 sm:gap-3 sm:rounded-2xl sm:px-5 sm:py-4 lg:-right-8">
                <div className="flex text-gold">{Array.from({ length: 5 }, (_, k) => <Star key={k} className="h-2 w-2 fill-current sm:h-4 sm:w-4" />)}</div>
                <div className="text-[10px] sm:text-sm"><p className="font-bold">تنسيق يدوي</p><p className="text-[9px] text-muted-foreground sm:text-xs">بعناية لكل تفصيلة</p></div>
              </div>
              <div className="absolute -left-1.5 top-3 rounded-lg bg-secondary px-2 py-1.5 text-[10px] font-bold text-secondary-foreground shadow-soft sm:-left-3 sm:top-8 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm lg:-left-6">تغريسة بعبارتك ✦</div>
            </div>
          </div>
        </section>
        <div className="flex items-center justify-center py-16">
          <AlertCircle className="h-8 w-8 text-destructive mb-4" />
          <p className="text-destructive mb-2">حدث خطأ في تحميل البيانات</p>
          <p className="text-sm text-primary-foreground/85">{productsError?.message || categoriesError?.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-clip font-sans">
      <PageHeader currentPage="الرئيسية" showBreadcrumb={false} />

      <section className="relative overflow-hidden bg-hero text-primary-foreground min-h-[calc(100svh-4rem)] sm:min-h-[calc(100svh-5rem)] lg:min-h-[calc(100svh-6rem)]">
        <img src={heroBg} alt="" aria-hidden width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <span className="absolute inset-0 bg-hero-veil" />
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-6 px-4 py-8 sm:gap-12 sm:px-5 sm:py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-12">
          <div className="order-2 space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 sm:order-1 sm:space-y-6 sm:space-y-8">
            <p className="inline-flex items-center gap-2 rounded-full border border-gold-bright/30 bg-primary-foreground/5 px-3 py-1.5 text-xs tracking-[0.25em] text-gold-bright backdrop-blur sm:gap-3 sm:px-4 sm:py-2 sm:text-xs">
              <Sparkles className="h-3.5 w-3.5 sm:h-3.5 sm:w-3.5" /> MIDDLEMIST FLOWER · جدة
            </p>
            <h1 className="font-display text-3xl leading-[1.25] sm:text-4xl lg:text-7xl">
              لكل مناسبة
              <span className="mt-2 block text-gold-bright sm:text-4xl lg:text-7xl">وردة تحكي عنك</span>
            </h1>
            <p className="max-w-xl text-sm leading-loose text-primary-foreground/85 sm:text-base sm:text-lg">
              باقات ومسكات عروس وبوكسات هدايا وتنسيق مناسبات، تُصمَّم بلونك وميزانيتك مع تغريسة مطبوعة بعبارتك.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
              <Button asChild size="lg" variant="secondary" className="h-10 rounded-full px-4 text-xs font-bold shadow-soft sm:h-14 sm:px-10 sm:text-base"><a href="/gift">صمّم باقتك</a></Button>
              <Button asChild size="lg" variant="outline" className="h-10 rounded-full border-primary-foreground/40 bg-transparent px-4 text-xs text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground sm:h-14 sm:px-10 sm:text-base"><a href="/products">تسوّق الآن</a></Button>
            </div>
            <a href={MAP_URL} target="_blank" rel="noreferrer" className="flex items-start gap-2 text-xs text-primary-foreground/75 transition-colors hover:text-gold-bright sm:text-sm">
              <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-gold-bright sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">{ADDRESS} · <span dir="ltr" className="whitespace-nowrap">+966 53 984 4144</span></span>
            </a>
          </div>
          <div className="order-1 relative mx-auto w-full max-w-[160px] sm:order-2 sm:max-w-xs lg:max-w-md">
            <div className="absolute -inset-1.5 rounded-[1.5rem] border border-gold-bright/25 sm:-inset-4 sm:rounded-[2.5rem]" />
            <img src={hero} alt="باقة ورد من Middlemist" width={800} height={1000} className="relative aspect-[4/5] w-full rounded-[1rem] object-cover shadow-soft sm:rounded-[2rem]" />
            <div className="absolute -right-1.5 bottom-3 flex items-center gap-1.5 rounded-lg bg-card px-2 py-1.5 text-foreground shadow-soft sm:-right-3 sm:bottom-8 sm:gap-3 sm:rounded-2xl sm:px-5 sm:py-4 lg:-right-8">
              <div className="flex text-gold">{Array.from({ length: 5 }, (_, k) => <Star key={k} className="h-2 w-2 fill-current sm:h-4 sm:w-4" />)}</div>
              <div className="text-[10px] sm:text-sm"><p className="font-bold">تنسيق يدوي</p><p className="text-[9px] text-muted-foreground sm:text-xs">بعناية لكل تفصيلة</p></div>
            </div>
            <div className="absolute -left-1.5 top-3 rounded-lg bg-secondary px-2 py-1.5 text-[10px] font-bold text-secondary-foreground shadow-soft sm:-left-3 sm:top-8 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm lg:-left-6">تغريسة بعبارتك ✦</div>
          </div>
        </div>
      </section>

      <div style={{ backgroundColor: '#D5D2BC' }} id="bouquets">
        <section className="mx-auto max-w-7xl px-4 py-14 md:py-20">
          <Head en="Featured Flowers" title="باقات الورد المميزة" description="اختر من أشهر تشكيلاتنا الأكثر طلباً وإعجاباً" />
        </section>
        <div className="mx-auto max-w-7xl px-4 pb-14 md:pb-20">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-4">
            {flowers.map((p: Product) => (
              <ProductCard key={p.id} p={p} onOpen={open} add={add} />
            ))}
          </div>
          {products.filter((p) => p.category === "باقات الورد").length > flowerDisplayCount && (
            <div className="flex justify-center mt-8">
              <Button
                onClick={() => setFlowerDisplayCount(prev => prev + 20)}
                variant="outline"
                className="rounded-lg bg-white/80 border-primary/30 px-8 py-3 text-sm md:text-base"
              >
                تعرف علي المزيد
              </Button>
            </div>
          )}
        </div>
      </div>

      <div style={{ backgroundColor: '#F5F1E9' }}><section id="categories" className="mx-auto max-w-7xl px-4 py-14 md:py-20">
        <Head en="Shop by Category" title="تسوق حسب التصنيف" description="تصفح المنتجات حسب نوعها لتعثر بسرعة على ما تبحث عنه" />
        <div className="mt-10 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6 md:gap-4">
          {categories.filter((c: Category) => !c.parent_id).map((c: Category) => (
            <a key={c.name_ar} href={`/products?cat=${encodeURIComponent(c.name_ar)}`} className="group card-lift overflow-hidden rounded-xl border border-border/50 bg-cream">
              <img src={c.image_url ?? categoryImages[c.name_ar] ?? hero} alt={c.name_ar} loading="lazy" className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105" />
              <p className="truncate p-1.5 text-center text-xs font-bold sm:p-2 sm:text-xs">{c.name_ar}</p>
            </a>
          ))}
        </div>
      </section></div>

      <SpotlightSlider products={products} />

      <section id="occasions" style={{ backgroundColor: '#F5F1E9' }}>
        <div className="mx-auto max-w-7xl px-4 pt-14 md:pt-20">
          <Head en="Shop by Occasion" title="تسوق حسب المناسبة" description="اختر المناسبة المناسبة ونقترح لك الهدايا المثالية" />
          <div className="mt-10 flex flex-wrap gap-2 justify-center">
            {APPROVED_OCCASIONS.map((name) => (
              <button key={name} onClick={() => setOcc(name)}
                className={cn("rounded-full border px-3 py-1.5 text-sm transition md:px-4 md:py-2 md:text-sm", occ === name ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary")}>
                {name}
              </button>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Button asChild variant="outline" className="rounded-full">
              <a href="/occasions" className="flex items-center gap-2"><Gift className="h-5 w-5" />طلب ورد مخصص لمناسبة معينة</a>
            </Button>
          </div>
        </div>
        <Shelf title={`اختيارات مناسبة ${occ}`} items={occItems} onOpen={open} add={add} />
      </section>

      <div style={{ backgroundColor: '#D5D2BC' }}>
        <section className="mx-auto max-w-7xl px-4 py-14 md:py-20">
          <Head en="Gift Collections" title={gifts[0]} description="مجموعات هدايا متنوعة تناسب كل الأذواق" />
        </section>
        <div className="mx-auto max-w-7xl px-4 pb-14 md:pb-20">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-4">
            {(() => {
              const sectionProducts = products.filter((p) => p.display_sections?.includes('gifts'));
              const categoryProducts = products.filter((p) => gifts[2].includes(p.category));

              // دمج بدون تكرار
              const combined = [...sectionProducts];
              categoryProducts.forEach(p => {
                if (!combined.find(cp => cp.id === p.id)) {
                  combined.push(p);
                }
              });

              return combined.slice(0, giftDisplayCount);
            })().map((p: Product) => (
              <ProductCard key={p.id} p={p} onOpen={open} add={add} />
            ))}
          </div>
          {(() => {
            const sectionProducts = products.filter((p) => p.display_sections?.includes('gifts'));
            const categoryProducts = products.filter((p) => gifts[2].includes(p.category));
            const combined = [...sectionProducts];
            categoryProducts.forEach(p => {
              if (!combined.find(cp => cp.id === p.id)) {
                combined.push(p);
              }
            });
            return combined.length > giftDisplayCount;
          })() && (
            <div className="flex justify-center mt-8">
              <Button
                onClick={() => setGiftDisplayCount(prev => prev + 5)}
                variant="outline"
                className="rounded-lg bg-white/80 border-primary/30 px-8 py-3 text-sm md:text-base"
              >
                المزيد
              </Button>
            </div>
          )}
        </div>
      </div>

      <section className="relative overflow-hidden bg-hero px-4 py-20 text-primary-foreground md:py-28">
        <img src={heroBg} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-20" />
        <div className="relative mx-auto max-w-3xl space-y-6 text-center">
          <p className="text-xs tracking-[0.3em] text-gold-bright sm:text-xs">DESIGN YOUR GIFT</p>
          <h2 className="font-display text-3xl leading-tight md:text-6xl">صمّم هديتك بنفسك</h2>
          <p className="text-sm text-primary-foreground/85 md:text-lg">اختر اللون والتغليف والحجم والإضافات، وأضف عبارتك على تغريسة مطبوعة.</p>
          <Button asChild size="lg" variant="secondary" className="h-14 rounded-full px-12 text-base font-bold shadow-soft"><a href="/gift"><Sparkles className="h-5 w-5" /> ابدأ التصميم</a></Button>
        </div>
      </section>

      <section style={{ backgroundColor: '#F5F1E9' }}>
        <div className="mx-auto max-w-7xl px-4 pt-14 md:pt-20">
          <Head en="Curated Collections" title="مجموعات متخصصة" description={tabs.find((t) => t[1] === tab)?.[3] ?? ""} />
          <div className="flex flex-wrap gap-2 justify-center" role="tablist">
            {tabs.map(([t, en]) => (
              <button key={en} role="tab" aria-selected={tab === en} onClick={() => { setTab(en); setSelectionDisplayCount(20); }}
                className={cn("rounded-full border px-4 py-2 text-sm transition", tab === en ? "border-primary bg-primary text-primary-foreground" : "bg-cream hover:border-primary")}>{t}</button>
            ))}
          </div>
        </div>
        <Shelf title="" items={tabItems} onOpen={open} add={add} />
        {hasMoreSelections && (
          <div className="flex justify-center pb-14 md:pb-20">
            <Button
              onClick={() => setSelectionDisplayCount(prev => prev + 5)}
              variant="outline"
              className="rounded-full border-primary/30 px-6 py-2 text-sm hover:bg-primary/5 transition-all"
            >
              تعرف على المزيد
            </Button>
          </div>
        )}
      </section>

      <section style={{ backgroundColor: '#D5D2BC' }} className="px-4 py-14 md:py-20">
        <div className="mx-auto max-w-7xl">
          <Head en="Our Services" title="خدماتنا" description="نقدم لك مجموعة متكاملة من الخدمات لتلبية احتياجاتك" />
          <div className="mt-10 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 md:gap-3">
            {services.map((s) => (
              <div key={s} className="card-lift flex items-center gap-2 rounded-xl border border-border/60 bg-card p-3 shadow-soft md:gap-3 md:rounded-2xl md:p-5">
                <Sparkles className="h-3 w-3 shrink-0 text-gold md:h-4 md:w-4" />
                <span className="text-sm font-bold md:text-base">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TestimonialsSection />

      <section id="contact" style={{ backgroundColor: '#D5D2BC' }} className="px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <p className="mb-4 text-xs tracking-[0.3em] text-gold">MIDDLEMIST FLOWER</p>
            <h2 className="font-display text-4xl text-primary md:text-5xl">تواصل معنا</h2>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              يسعدنا تنسيق وردك وهديتك، ونرحب بزيارتك في جدة.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 text-xs font-bold shadow-lg hover:shadow-xl transition-all">
              <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer" className="flex items-center gap-1">
                <MessageCircle className="h-2 w-2" />
                تواصل عبر واتساب
              </a>
            </Button>
            <Button asChild variant="outline" className="rounded-full border border-primary/30 px-4 py-2 text-xs hover:bg-primary/5 transition-all">
              <a href={`tel:966539844144`} className="flex items-center gap-1">
                <ShoppingBag className="h-2 w-2" />
                اتصل بنا
              </a>
            </Button>
            <Button asChild variant="outline" className="rounded-full border border-primary/30 px-4 py-2 text-xs hover:bg-primary/5 transition-all">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="flex items-center gap-1">
                <svg className="h-2 w-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                إنستجرام
              </a>
            </Button>
            <Button asChild variant="outline" className="rounded-full border border-primary/30 px-4 py-2 text-xs hover:bg-primary/5 transition-all">
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="flex items-center gap-1">
                <svg className="h-2 w-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
                تيكتوك
              </a>
            </Button>
          </div>
        </div>
      </section>

      <VisitUsSection />

      <PageFooter />

      {customizing && <CustomizeDialog product={customizing} onClose={() => setCustomizing(null)} />}

      {customBouquetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setCustomBouquetOpen(false)}>
          <div className="bg-card border border-border rounded-2xl shadow-soft w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-display text-xl text-primary">طلب باقة مخصصة</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCustomBouquetOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const message = `مرحباً، أريد طلب باقة مخصصة:\n\nالاسم: ${customBouquetForm.name}\nرقم الجوال: ${customBouquetForm.phone}\nالعنوان: ${customBouquetForm.address}\nالمناسبة: ${customBouquetForm.occasion}\nالألوان المفضلة: ${customBouquetForm.colors}\nالميزانية: ${customBouquetForm.budget} ر.س\nالتغريسة: ${customBouquetForm.message}\nملاحظات: ${customBouquetForm.notes}`;
                const whatsappUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
                setCustomBouquetOpen(false);
                setCustomBouquetForm({
                  name: "",
                  phone: "",
                  address: "",
                  occasion: "",
                  colors: "",
                  budget: "",
                  message: "",
                  notes: "",
                });
              }}
              className="p-6 space-y-4"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">الاسم</label>
                <input
                  type="text"
                  value={customBouquetForm.name}
                  onChange={(e) => setCustomBouquetForm({ ...customBouquetForm, name: e.target.value })}
                  placeholder="اسمك"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">رقم الجوال</label>
                <input
                  type="tel"
                  value={customBouquetForm.phone}
                  onChange={(e) => setCustomBouquetForm({ ...customBouquetForm, phone: e.target.value })}
                  placeholder="05xxxxxxxx"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">العنوان</label>
                <input
                  type="text"
                  value={customBouquetForm.address}
                  onChange={(e) => setCustomBouquetForm({ ...customBouquetForm, address: e.target.value })}
                  placeholder="العنوان للتوصيل"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">المناسبة</label>
                <select
                  value={customBouquetForm.occasion}
                  onChange={(e) => setCustomBouquetForm({ ...customBouquetForm, occasion: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                >
                  <option value="">اختر المناسبة</option>
                  {APPROVED_OCCASIONS.map((occ) => (
                    <option key={occ} value={occ}>{occ}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">الألوان المفضلة</label>
                <input
                  type="text"
                  value={customBouquetForm.colors}
                  onChange={(e) => setCustomBouquetForm({ ...customBouquetForm, colors: e.target.value })}
                  placeholder="مثل: وردي وأبيض"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">الميزانية (ر.س)</label>
                <input
                  type="number"
                  value={customBouquetForm.budget}
                  onChange={(e) => setCustomBouquetForm({ ...customBouquetForm, budget: e.target.value })}
                  placeholder="الميزانية المتوقعة"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">التغريسة</label>
                <input
                  type="text"
                  value={customBouquetForm.message}
                  onChange={(e) => setCustomBouquetForm({ ...customBouquetForm, message: e.target.value })}
                  placeholder="اكتب العبارة المطلوبة"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">ملاحظات إضافية</label>
                <textarea
                  value={customBouquetForm.notes}
                  onChange={(e) => setCustomBouquetForm({ ...customBouquetForm, notes: e.target.value })}
                  placeholder="أي تفاصيل إضافية عن الباقة المطلوبة"
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                >
                  إرسال الطلب
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCustomBouquetOpen(false)}
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
