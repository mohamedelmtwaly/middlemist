import { createFileRoute } from "@tanstack/react-router";
import { Heart, Sparkles, Award, MapPin, Phone, Mail, Clock, Gift, Flower2, MessageCircle, MoreHorizontal } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { PageFooter } from "@/components/PageFooter";
import { CartProvider } from "@/lib/cart";
import { CartSheet } from "@/components/CartSheet";
import { WHATSAPP, ADDRESS } from "@/lib/store-data";
import logo from "@/assets/logo-middlemist-transparent.png";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "من نحن | Middlemist Flower | متجر ورد وهدايا في جدة حي النسيم" },
      { name: "description", content: "تعرف على Middlemist Flower متجر ورد وهدايا في جدة حي النسيم. نقدم باقات ورد فاخرة ومسكات عروس وبوكسات هدايا وتنسيق مناسبات. موقعنا: حي أبو ذر الغفاري، النسيم، جدة 23233." },
      { name: "keywords", content: "من نحن Middlemist Flower, عن المتجر, محل ورد جدة, متجر ورد حي النسيم, معلومات المحل, تاريخ المتجر" },
      { property: "og:title", content: "من نحن | Middlemist Flower" },
      { property: "og:description", content: "تعرف على Middlemist Flower متجر ورد وهدايا في جدة حي النسيم. نقدم باقات ورد فاخرة ومسكات عروس وبوكسات هدايا وتنسيق مناسبات." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.middlemist.store/about" },
      { property: "og:locale", content: "ar_SA" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "من نحن | Middlemist Flower" },
      { name: "twitter:description", content: "تعرف على Middlemist Flower متجر ورد وهدايا في جدة حي النسيم. نقدم باقات ورد فاخرة ومسكات عروس وبوكسات هدايا وتنسيق مناسبات." },
      { name: "robots", content: "index, follow" },
      { link: { rel: "canonical", href: "https://www.middlemist.store/about" } },
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
              "name": "من نحن",
              "item": "https://www.middlemist.store/about"
            }
          ]
        })
      }
    ]
  }),
  component: () => (
    <CartProvider>
      <PageHeader currentPage="من نحن" showCart={true} showBreadcrumb={true} />
      <AboutPage />
      <PageFooter />
      <CartSheet />
    </CartProvider>
  ),
});

function AboutPage() {
  return (
    <div className="min-h-screen font-sans bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-section-1 via-section-2 to-section-1 py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <div className="mb-6">
              <p className="text-xs tracking-[0.3em] text-gold mb-4">MIDDLEMIST FLOWER</p>
            </div>
            <h1 className="font-display text-5xl text-primary md:text-7xl mb-6">من نحن</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Middlemist Flower - ورد يفرح. هدايا من القلب لمن تحب.
            </p>
          </div>
          <div className="flex justify-center mt-8">
            <div className="p-4 rounded-2xl shadow-soft" style={{ backgroundColor: '#282A18' }}>
              <img 
                src={logo} 
                alt="Middlemist Flower Logo" 
                className="h-28 md:h-36 w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 md:py-28 bg-background">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-12 justify-center">
              <Flower2 className="h-10 w-10 text-gold" />
              <h2 className="font-display text-4xl text-primary text-center">قصتنا</h2>
              <Flower2 className="h-10 w-10 text-gold" />
            </div>
            
            <div className="text-foreground space-y-4 max-w-none">
              <p className="text-center text-muted-foreground text-base leading-relaxed">
                في Middlemist Flower، نؤمن بأن كل زهرة تستحق الاحتفال بأجمل ورد. منذ البداية، كانت رؤيتنا بسيطة لكن طموحة: أن نكون وجهً مشرقًا للفرح والاحتفال في جدة ومحيطها.
              </p>
              <p className="text-base leading-relaxed">
                نحن فريق من الشغوفين بالورود، يعملون بحب وشغف لصنع باقات وتنسيقات لا تُنسى. من باقات الزفاف المصقمة، إلى مسكات العروس الفخمة، إلى البوكسات الهدايا الأنيقة، كل قطعة نعتز بها كأنها تُهدى لأعز الناس.
              </p>
              <p className="text-base leading-relaxed">
                في موقعنا في حي النسيم بجدة، نقدم لكم تشكيلة واسعة من المنتجات تشمل باقات الورد بأنواعها (الجوري، الروز، الليلك، والهيليكونيا)، مسكات العروس الفاخرة، الفازات والأستاندات الراقية، البالونات والدباديب، بالإضافة إلى خدمات الطاعة والتزيينت الاحترافية.
              </p>
              <p className="text-base leading-relaxed">
                نسعى دائماً لتقديم تجربة فريدة لكل عميل، حيث يهتم فريقنا بكل التفاصيل الصغيرة التي تجعل الهدية مميزة. نختار أفضل الورود الطازجة يومياً من أفضل الموردين، ونستخدم مواد تغليف عالية الجودة مثل الساتان والحرير لضمان وصول هديتك في أفضل حال.
              </p>
              <p className="text-base leading-relaxed">
                خدماتنا تشمل التوصيل لجميع مناطق جدة، مع خيارات متعددة لتلبية احتياجاتكم. نقدم أيضاً خدمة التصميم المخصص، حيث يمكنك اختيار كل تفاصيل باقتك من اللون والحجم إلى نوع التغليف والعبارة المطبوعة على الكرت.
              </p>
              <p className="text-base leading-relaxed">
                نحن نتفهم أهمية المناسبات الخاصة في حياتكم، لذلك نعمل بجد لتوفير كل ما تحتاجونه لجعل هذه اللحظات لا تُنسى. سواء كان عيد ميلاد، زفاف، ذكرى سنوية، تخرج، أو أي مناسبة أخرى، نحن هنا لمساعدتك في اختيار الهدية المثالية التي تعبر عن مشاعرك.
              </p>
              <p className="text-base leading-relaxed">
                بالإضافة إلى منتجاتنا، نقدم خدمات الطاعة وتزيينت المناسبات، حيث يمكننا تزيين المكان باقات الورد والبالونات لإضافة لمسة من الجمال والبهجة على مناسبتك الخاصة.
              </p>
              <p className="text-base leading-relaxed font-medium text-primary">
                ما يميزنا هو أننا لا نبيع مجرد ورد؛ نبيع الذكريات. كل طلب منكم يُصمم بعناية، من اختيار الألوان إلى اختيار الحجم، حتى التغليف والكرت المطبوع عليه.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 md:py-28 bg-section-2">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.3em] text-gold mb-4">OUR VALUES</p>
            <h2 className="font-display text-4xl text-primary mb-4">قيمنا</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              القيم التي نلتزم بها في كل عمل نقوم به
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-3xl bg-card shadow-soft border-2 border-border hover:border-primary/30 transition-all hover:shadow-lg group">
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Heart className="h-14 w-14 text-primary" />
                </div>
              </div>
              <h3 className="font-display text-2xl text-primary mb-4">الحب والشغف</h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                نعش كل منتج بحب واهتمام، ونعتبر أن العمل الذي نقوم به هو رسالة حب من قلبنا لقلوبكم.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-3xl bg-card shadow-soft border-2 border-border hover:border-primary/30 transition-all hover:shadow-lg group">
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Sparkles className="h-14 w-14 text-primary" />
                </div>
              </div>
              <h3 className="font-display text-2xl text-primary mb-4">الجودة</h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                نستخدم أجود أنواع الورود والإكسسوارات، ونضمن أن كل قطعة تُجهز بعناية فائقة لتظهر بأفضل صورة.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-3xl bg-card shadow-soft border-2 border-border hover:border-primary/30 transition-all hover:shadow-lg group">
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Award className="h-14 w-14 text-primary" />
                </div>
              </div>
              <h3 className="font-display text-2xl text-primary mb-4">الاحترافية</h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                نحترم خصوصية عملائنا ونلتزم بتقديم أفضل خدمة ممكنة. رضاكم هي أولويتنا القصوى.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-20 md:py-28 bg-background">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.3em] text-gold mb-4">WHAT WE OFFER</p>
            <h2 className="font-display text-4xl text-primary mb-4">ما نقدمه</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              تشكيلة واسعة من الخدمات لتلبية جميع احتياجاتكم
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-8 rounded-3xl bg-card shadow-soft border-2 border-border hover:border-primary/30 transition-all hover:shadow-lg group">
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Flower2 className="h-12 w-12 text-primary" />
                </div>
              </div>
              <h3 className="font-display text-xl text-primary mb-3">باقات الورد</h3>
              <p className="text-base text-muted-foreground">
                باقات متنوعة لكل مناسبة
              </p>
            </div>
            
            <div className="text-center p-8 rounded-3xl bg-card shadow-soft border-2 border-border hover:border-primary/30 transition-all hover:shadow-lg group">
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Gift className="h-12 w-12 text-primary" />
                </div>
              </div>
              <h3 className="font-display text-xl text-primary mb-3">مسكات العروس</h3>
              <p className="text-base text-muted-foreground">
                تجهيزات فاخرة للعروس
              </p>
            </div>
            
            <div className="text-center p-8 rounded-3xl bg-card shadow-soft border-2 border-border hover:border-primary/30 transition-all hover:shadow-lg group">
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <MapPin className="h-12 w-12 text-primary" />
                </div>
              </div>
              <h3 className="font-display text-xl text-primary mb-3">التوصيل والتوزيع</h3>
              <p className="text-base text-muted-foreground">
                خدمة توصيل في جدة
              </p>
            </div>
            
            <div className="text-center p-8 rounded-3xl bg-card shadow-soft border-2 border-border hover:border-primary/30 transition-all hover:shadow-lg group">
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Sparkles className="h-12 w-12 text-primary" />
                </div>
              </div>
              <h3 className="font-display text-xl text-primary mb-3">الطباعة والتزيينت</h3>
              <p className="text-base text-muted-foreground">
                طباعة وتزيينت احترافية
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 md:py-28 bg-section-2">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.3em] text-gold mb-4">CONTACT US</p>
            <h2 className="font-display text-4xl text-primary mb-4">تواصل معنا</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              نحن هنا لمساعدتك في إيجاد الهدية المثالية
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-8 rounded-3xl bg-card shadow-soft border-2 border-border hover:border-primary/30 transition-all hover:shadow-lg group">
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Phone className="h-14 w-14 text-primary" />
                </div>
              </div>
              <h3 className="font-display text-2xl text-primary mb-4">اتصل بنا</h3>
              <p dir="ltr" className="text-xl font-bold text-primary mb-3">+966 53 984 4144</p>
              <p className="text-base text-muted-foreground">
                متاح للاتصال يوميًا
              </p>
            </div>
            
            <div className="text-center p-8 rounded-3xl bg-card shadow-soft border-2 border-border hover:border-primary/30 transition-all hover:shadow-lg group">
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <MapPin className="h-14 w-14 text-primary" />
                </div>
              </div>
              <h3 className="font-display text-2xl text-primary mb-4">زورنا</h3>
              <p className="text-base text-muted-foreground mb-3">
                {ADDRESS}
              </p>
              <p className="text-base text-muted-foreground">
                حي أبو ذر الغفاري، النسيم، جدة
              </p>
            </div>
            
            <div className="text-center p-8 rounded-3xl bg-card shadow-soft border-2 border-border hover:border-primary/30 transition-all hover:shadow-lg group">
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Clock className="h-14 w-14 text-primary" />
                </div>
              </div>
              <h3 className="font-display text-2xl text-primary mb-4">ساعات العمل</h3>
              <p className="text-base text-muted-foreground mb-2">
                من ٢:٠٠م حتى ٢:٣٠ص
              </p>
              <p className="text-base text-muted-foreground">
                يوميًا
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="py-20 md:py-28 bg-background">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.3em] text-gold mb-4">FOLLOW US</p>
            <h2 className="font-display text-4xl text-primary mb-4">تابعنا على السوشيال ميديا</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              شاهد آخر تصاميمنا واكتشف عروضنا الحصرية
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 max-w-3xl mx-auto">
            <a 
              href={`https://wa.me/${WHATSAPP}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-4 px-8 py-6 bg-card rounded-3xl shadow-soft hover:shadow-lg transition-all border-2 border-border hover:border-primary/30 group"
            >
              <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <div className="text-right">
                <p className="font-display text-xl font-bold text-primary">واتساب</p>
                <p className="text-sm text-muted-foreground">تواصل معنا مباشرة</p>
              </div>
            </a>
            
            <a 
              href="https://www.instagram.com/middlemist2626"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-4 px-8 py-6 bg-card rounded-3xl shadow-soft hover:shadow-lg transition-all border-2 border-border hover:border-primary/30 group"
            >
              <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
              <div className="text-right">
                <p className="font-display text-xl font-bold text-primary">إنستغرام</p>
                <p className="text-sm text-muted-foreground">@middlemist2626</p>
              </div>
            </a>
            
            <a 
              href="https://www.tiktok.com/@middlemist65"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-4 px-8 py-6 bg-card rounded-3xl shadow-soft hover:shadow-lg transition-all border-2 border-border hover:border-primary/30 group"
            >
              <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </div>
              <div className="text-right">
                <p className="font-display text-xl font-bold text-primary">تيك توك</p>
                <p className="text-sm text-muted-foreground">@middlemist65</p>
              </div>
            </a>
            
            <a 
              href="https://snapchat.com/t/fqR672CO"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-4 px-8 py-6 bg-card rounded-3xl shadow-soft hover:shadow-lg transition-all border-2 border-border hover:border-primary/30 group"
            >
              <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <MoreHorizontal className="h-8 w-8 text-primary" />
              </div>
              <div className="text-right">
                <p className="font-display text-xl font-bold text-primary">سناب شات</p>
                <p className="text-sm text-muted-foreground">تواصل معنا</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-section-1 via-section-2 to-section-1">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs tracking-[0.3em] text-gold mb-4">GET IN TOUCH</p>
            <h2 className="font-display text-4xl text-primary mb-6">هل لديك استفسار؟</h2>
            <p className="text-muted-foreground mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
              فريقنا جاهز للإجابة على أي استفسار لديك حول منتجاتنا أو خدماتنا
            </p>
            <a 
              href={`https://wa.me/${WHATSAPP}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 px-10 py-4 bg-primary text-primary-foreground rounded-full font-display text-lg font-bold hover:bg-primary/90 transition-all hover:shadow-lg shadow-soft"
            >
              <MessageCircle className="h-6 w-6" />
              تواصل معنا عبر واتساب
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
