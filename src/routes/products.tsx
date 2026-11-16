import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Search, ShoppingBag, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CartProvider, useCart, type CartItem } from "@/lib/cart";
import { CartSheet } from "@/components/CartSheet";
import { CustomizeDialog } from "@/components/CustomizeDialog";
import { PageHeader } from "@/components/PageHeader";
import { PageFooter } from "@/components/PageFooter";
import { useProducts } from "@/lib/use-products";
import { useCategories } from "@/lib/use-categories";
import { type Product } from "@/lib/store-data";
import type { Category } from "@/lib/use-categories";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "المنتجات | Middlemist Flower | باقات ورد ومسكات عروس وهدايا في جدة" },
      { name: "description", content: "تصفح جميع منتجات Middlemist Flower في جدة: باقات الورد الفاخرة، مسكات العروس، بوكسات الهدايا، الفازات، الأستاندات، البالونات، الدباديب، والطباعة. اطلب الآن عبر واتساب." },
      { name: "keywords", content: "منتجات ورد جدة, باقات ورد للطلب, مسكات عروس للطلب, بوكسات هدايا جدة, فازات ورد جدة, بالونات جدة, دباديب جدة" },
      { property: "og:title", content: "المنتجات | Middlemist Flower" },
      { property: "og:description", content: "تصفح جميع منتجات Middlemist Flower في جدة: باقات الورد الفاخرة، مسكات العروس، بوكسات الهدايا، الفازات، الأستاندات، البالونات، الدباديب، والطباعة." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.middlemist.store/products" },
      { property: "og:locale", content: "ar_SA" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "المنتجات | Middlemist Flower" },
      { name: "twitter:description", content: "تصفح جميع منتجات Middlemist Flower في جدة: باقات الورد الفاخرة، مسكات العروس، بوكسات الهدايا، الفازات، الأستاندات، البالونات، الدباديب، والطباعة." },
      { name: "robots", content: "index, follow" },
      { link: { rel: "canonical", href: "https://www.middlemist.store/products" } },
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
              "name": "المنتجات",
              "item": "https://www.middlemist.store/products"
            }
          ]
        })
      }
    ]
  }),
  validateSearch: (s: Record<string, unknown>): { cat?: string; product?: string } =>
    ({
      cat: typeof s["cat"] === "string" ? s["cat"] : undefined,
      product: typeof s["product"] === "string" ? s["product"] : undefined,
    }),
  component: () => (
    <CartProvider>
      <ProductsPage />
      <CartSheet />
    </CartProvider>
  ),
});

type Add = (i: Omit<CartItem, "key" | "qty">) => void;

function ProductsPage() {
  const { add } = useCart();
  const [customizing, setCustomizing] = useState<Product | null>(null);
  const [q, setQ] = useState("");
  const { cat: initialCat, product: initialProduct } = Route.useSearch();

  // جلب البيانات من Supabase
  const { data: products = [], isLoading: productsLoading, error: productsError } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useCategories();

  // Filter main categories and subcategories
  const mainCategories = categories?.filter((c: Category) => !c.parent_id) || [];
  const subCategories = categories?.filter((c: Category) => c.parent_id) || [];

  const [mainCat, setMainCat] = useState("الكل");
  const [subCat, setSubCat] = useState<string | null>(null);

  useEffect(() => {
    if (initialCat && categories?.some((c: Category) => c.name_ar === initialCat)) {
      setMainCat(initialCat);
    }
  }, [initialCat, categories]);

  // Scroll to product when specified in URL
  useEffect(() => {
    if (initialProduct && products.length > 0) {
      const productElement = document.getElementById(`product-${initialProduct}`);
      if (productElement) {
        productElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Highlight the product
        productElement.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
        setTimeout(() => {
          productElement.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
        }, 3000);
      }
    }
  }, [initialProduct, products]);

  // Get subcategories for selected main category
  const selectedMainCategory = mainCategories.find((c: Category) => c.name_ar === mainCat);
  const subCategoriesForMain = selectedMainCategory
    ? subCategories.filter((c: Category) => c.parent_id === selectedMainCategory.id)
    : [];

  // Reset subcategory when main category changes
  useEffect(() => {
    setSubCat(null);
  }, [mainCat]);

  const filtered = useMemo(() => {
    let list = products.filter(
      (p) => (mainCat === "الكل" || p.category === mainCat) && (p.name.includes(q) || p.category.includes(q)),
    );
    // Filter by subcategory if selected - use category_id
    if (subCat) {
      list = list.filter((p) => p.category_id === subCat);
    }
    return list;
  }, [q, mainCat, subCat, products]);

  const open = (p: Product) => setCustomizing(p);

  // حالة التحميل
  if (productsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen font-sans bg-background">
        <PageHeader currentPage="المنتجات" />
        <section className="bg-section-1 py-12 md:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">جاري تحميل المنتجات...</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // حالة الخطأ
  if (productsError || categoriesError) {
    return (
      <div className="min-h-screen font-sans bg-background">
        <PageHeader currentPage="المنتجات" />
        <section className="bg-section-1 py-12 md:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex flex-col items-center justify-center py-16">
              <AlertCircle className="h-8 w-8 text-destructive mb-4" />
              <p className="text-destructive mb-2">حدث خطأ في تحميل البيانات</p>
              <p className="text-sm text-muted-foreground">{productsError?.message || categoriesError?.message}</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans bg-background">
      <PageHeader currentPage="المنتجات" />

      <section className="bg-section-1 py-12 md:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 text-center">
            <h1 className="font-display text-4xl text-primary md:text-5xl">جميع المنتجات</h1>
            <p className="mt-3 text-sm text-muted-foreground">تصفح كافة منتجاتنا وابحث عن هديتك المثالية</p>
          </div>

          <div className="mb-6 rounded-3xl bg-card p-6 shadow-soft">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-11 rounded-full pr-10"
                placeholder="ابحث عن باقة، فازة، دبدوب…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-8">
            <p className="mb-3 text-sm font-medium text-muted-foreground">التصنيفات الرئيسية</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {["الكل", ...mainCategories.map((c: Category) => c.name_ar)].map((c: string) => (
                <button
                  key={c}
                  onClick={() => {
                    setMainCat(c);
                    setSubCat(null);
                  }}
                  className={cn(
                    "rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all",
                    mainCat === c
                      ? "border-primary bg-primary text-primary-foreground shadow-md"
                      : "border-border bg-card hover:border-primary hover:bg-primary/5"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Subcategories filter - only show if main category has subcategories */}
          {subCategoriesForMain.length > 0 && (
            <div className="mb-8">
              <p className="mb-3 text-sm font-medium text-muted-foreground">التصنيفات الفرعية</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                <button
                  onClick={() => setSubCat(null)}
                  className={cn(
                    "rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all",
                    subCat === null
                      ? "border-primary bg-primary text-primary-foreground shadow-md"
                      : "border-border bg-card hover:border-primary hover:bg-primary/5"
                  )}
                >
                  الكل
                </button>
                {subCategoriesForMain.map((c: Category) => (
                  <button
                    key={c.id}
                    onClick={() => setSubCat(c.id)}
                    className={cn(
                      "rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all",
                      subCat === c.id
                        ? "border-primary bg-primary text-primary-foreground shadow-md"
                        : "border-border bg-card hover:border-primary hover:bg-primary/5"
                    )}
                  >
                    {c.name_ar}
                  </button>
                ))}
              </div>
            </div>
          )}

          {filtered.length === 0 ? (
            <p className="py-16 text-center text-muted-foreground">لا توجد منتجات مطابقة</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
              {filtered.map((p: Product) => (
                <article key={p.id} id={`product-${p.id}`} className="group flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card shadow-soft transition-shadow">
                  <div className="relative overflow-hidden">
                    <img src={p.image} alt={p.name} loading="lazy" className="aspect-square w-full object-cover transition duration-700 group-hover:scale-105" />
                    <span className="absolute right-1.5 top-1.5 max-w-[70%] truncate rounded-full bg-card/90 px-1.5 py-0.5 text-xs font-medium text-primary backdrop-blur sm:right-2 sm:top-2 sm:px-2 sm:py-0.5 sm:text-[10px] md:right-3 md:top-3 md:px-3 md:py-1 md:text-[11px]">{p.category}</span>
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-2 sm:gap-1.5 sm:p-3 md:gap-2 md:p-4">
                    <h3 className="line-clamp-1 text-sm font-bold text-foreground sm:text-sm md:text-base">{p.name}</h3>
                    <div className="mt-auto flex items-center justify-between gap-1.5 pt-0.5 sm:gap-2 sm:pt-1 md:pt-2">
                      <p className="text-sm font-bold text-primary sm:text-sm md:text-lg">{p.price} <span className="text-xs font-medium text-muted-foreground sm:text-[10px] md:text-xs">ر.س</span></p>
                      <Button size="sm" className="h-6 rounded-full px-1.5 text-xs sm:h-7 sm:px-2 sm:text-[10px] md:h-8 md:px-4 md:text-xs" aria-label={`أضف ${p.name} للسلة`} onClick={() => open(p)}>
                        <ShoppingBag className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4" /> أضف
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <PageFooter />

      {customizing && <CustomizeDialog product={customizing} onClose={() => setCustomizing(null)} />}
    </div>
  );
}
