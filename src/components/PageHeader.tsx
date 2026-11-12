import { useState, useEffect } from "react";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/lib/cart";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import logo from "@/assets/logo-middlemist-transparent.png";

interface PageHeaderProps {
  currentPage: string;
  showCart?: boolean;
  showBreadcrumb?: boolean;
}

export function PageHeader({ currentPage, showCart = true, showBreadcrumb = true }: PageHeaderProps) {
  const { count, setOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  return (
    <>
      <header className="sticky top-0 z-40 text-primary-foreground shadow-soft" style={{ backgroundColor: '#282A18' }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 sm:py-2">
          <a href="/" className="flex items-center">
            <img src={logo} alt="Middlemist Flower" className="h-14 w-auto object-contain sm:h-20" />
          </a>
          <nav className="hidden gap-8 text-sm xl:flex">
            <a href="/#categories">التصنيفات</a>
            <a href="/#bouquets">الباقات</a>
            <a href="/#occasions">المناسبات</a>
            <a href="/products">المنتجات</a>
            <a href="/gift">صمم هدية</a>
            <a href="/occasions">مناسباتنا</a>
            <a href="/faq">الأسئلة الشائعة</a>
            <a href="/#testimonials">آراء العملاء</a>
            <a href="/#visit-us">زورونا</a>
            <a href="/#contact">تواصل معنا</a>
          </nav>
          <div className="flex items-center gap-2">
            {showCart && (
              <button onClick={() => setOpen(true)} className="relative rounded-full border border-primary-foreground/30 p-2 sm:p-3" aria-label="السلة">
                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                {count > 0 && <span className="absolute -top-1 -left-1 grid h-4 w-4 place-items-center rounded-full bg-accent text-[10px] sm:h-5 sm:w-5 sm:text-xs">{count}</span>}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden rounded-full border border-primary-foreground/30 p-2"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <nav className="xl:hidden border-t border-primary-foreground/20" style={{ backgroundColor: '#282A18' }}>
            <div className="mx-auto max-w-7xl px-4 py-3 space-y-1">
              <a href="/#categories" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm">التصنيفات</a>
              <a href="/#bouquets" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm">الباقات</a>
              <a href="/#occasions" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm">المناسبات</a>
              <a href="/products" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm">المنتجات</a>
              <a href="/gift" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm">صمم هدية</a>
              <a href="/occasions" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm">مناسباتنا</a>
              <a href="/faq" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm">الأسئلة الشائعة</a>
              <a href="/#testimonials" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm">آراء العملاء</a>
              <a href="/#visit-us" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm">زورونا</a>
              <a href="/#contact" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm">تواصل معنا</a>
            </div>
          </nav>
        )}
      </header>

      {showBreadcrumb && (
        <div className="bg-section-1 py-14">
          <div className="mx-auto max-w-7xl px-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">الرئيسية</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{currentPage}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      )}
    </>
  );
}
