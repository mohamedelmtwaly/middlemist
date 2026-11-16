import { MessageCircle, MapPin, Phone, Clock, Instagram, Facebook, MoreHorizontal } from "lucide-react";
import { WHATSAPP, ADDRESS } from "@/lib/store-data";
import logo from "@/assets/logo-middlemist-transparent.png";

export function PageFooter() {
  return (
    <>
      <footer className="text-primary-foreground" style={{ backgroundColor: '#282A18' }}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10 md:py-12">
          <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand Section */}
            <div className="space-y-3 sm:space-y-4 sm:col-span-2 lg:col-span-1 text-center sm:text-left">
              <div className="flex justify-center sm:justify-start">
                <img src={logo} alt="Middlemist Flower" className="h-18 sm:h-20 md:h-24 w-auto object-contain" />
              </div>
              <p className="text-xs sm:text-sm md:text-base text-primary-foreground/80">
                Middlemist Flower - ورد يفرح. هدايا من القلب لمن تحب.
              </p>
              <div className="flex gap-2 sm:gap-3 justify-center sm:justify-start">
                <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer" aria-label="واتساب"
                  className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors">
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
                <a href="https://www.instagram.com/middlemist2626" target="_blank" rel="noreferrer" aria-label="إنستغرام"
                  className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors">
                  <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
                <a href="https://www.tiktok.com/@middlemist65" target="_blank" rel="noreferrer" aria-label="تيك توك"
                  className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors">
                  <MoreHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
                <a href="https://snapchat.com/t/fqR672CO" target="_blank" rel="noreferrer" aria-label="سناب شات"
                  className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors">
                  <MoreHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-3 sm:space-y-4 text-center sm:text-left">
              <h3 className="font-display text-sm sm:text-base md:text-lg font-bold text-gold-bright">معلومات التواصل</h3>
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <div className="flex items-start gap-2 sm:gap-3 justify-center sm:justify-start">
                  <MapPin className="h-3 w-3 sm:h-4 sm:h-5 w-4 sm:w-5 shrink-0 text-gold-bright mt-0.5" />
                  <span className="text-primary-foreground/80 text-[11px] sm:text-xs md:text-sm">{ADDRESS}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 justify-center sm:justify-start">
                  <Phone className="h-3 w-3 sm:h-4 sm:h-5 w-4 sm:w-5 shrink-0 text-gold-bright" />
                  <span dir="ltr" className="text-primary-foreground/80 text-[11px] sm:text-xs md:text-sm">+966 53 984 4144</span>
                </div>
                <div className="flex items-start gap-2 sm:gap-3 justify-center sm:justify-start">
                  <Clock className="h-3 w-3 sm:h-4 sm:h-5 w-4 sm:w-5 shrink-0 text-gold-bright mt-0.5" />
                  <div className="text-primary-foreground/80 text-[11px] sm:text-xs md:text-sm">
                    <p>مواعيد العمل:</p>
                    <p>٢:٠٠م – ٢:٣٠ص</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-3 sm:space-y-4 text-center sm:text-left">
              <h3 className="font-display text-sm sm:text-base md:text-lg font-bold text-gold-bright">روابط سريعة</h3>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <li><a href="/" className="text-primary-foreground/80 hover:text-gold-bright transition-colors text-[11px] sm:text-xs md:text-sm">الرئيسية</a></li>
                <li><a href="/products" className="text-primary-foreground/80 hover:text-gold-bright transition-colors text-[11px] sm:text-xs md:text-sm">المنتجات</a></li>
                <li><a href="/gift" className="text-primary-foreground/80 hover:text-gold-bright transition-colors text-[11px] sm:text-xs md:text-sm">أرسل هدية</a></li>
                <li><a href="/occasions" className="text-primary-foreground/80 hover:text-gold-bright transition-colors text-[11px] sm:text-xs md:text-sm">مناسباتنا</a></li>
                <li><a href="/faq" className="text-primary-foreground/80 hover:text-gold-bright transition-colors text-[11px] sm:text-xs md:text-sm">الأسئلة الشائعة</a></li>
              </ul>
            </div>

            {/* About Store */}
            <div className="space-y-3 sm:space-y-4 text-center sm:text-left">
              <h3 className="font-display text-sm sm:text-base md:text-lg font-bold text-gold-bright">عن المتجر</h3>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <li><a href="/about" className="text-primary-foreground/80 hover:text-gold-bright transition-colors text-[11px] sm:text-xs md:text-sm">من نحن</a></li>
                <li><a href="#visit-us" className="text-primary-foreground/80 hover:text-gold-bright transition-colors text-[11px] sm:text-xs md:text-sm">موقعنا</a></li>
                <li><a href="#testimonials" className="text-primary-foreground/80 hover:text-gold-bright transition-colors text-[11px] sm:text-xs md:text-sm">آراء العملاء</a></li>
                <li><a href="#contact" className="text-primary-foreground/80 hover:text-gold-bright transition-colors text-[11px] sm:text-xs md:text-sm">تواصل معنا</a></li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-6 sm:mt-8 md:mt-12 border-t border-primary-foreground/20 pt-4 sm:pt-6 md:pt-8 text-center">
            <p className="text-[10px] sm:text-xs md:text-sm text-primary-foreground/70">© 2024 Middlemist Flower. جميع الحقوق محفوظة</p>
          </div>
        </div>
      </footer>

      <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer" aria-label="واتساب"
        className="fixed bottom-4 sm:bottom-5 right-4 sm:right-5 z-30 grid h-11 w-11 sm:h-12 sm:w-12 md:h-14 md:w-14 place-items-center rounded-full bg-accent text-accent-foreground shadow-soft">
        <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
      </a>
    </>
  );
}
