import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { LoadingScreen } from "@/components/LoadingScreen";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "description", content: "ميدل ميست فلاور متجر ورد وهدايا في جدة، نقدم باقات ورد فاخرة ومسكات عروس وبوكسات هدايا وتنسيق مناسبات. موقعنا في حي النسيم جدة." },
      { name: "keywords", content: "محل ورد في جدة, باقات ورد جدة, مسكات عروس جدة, بوكسات هدايا جدة, تنسيق مناسبات جدة, متجر هدايا جدة, محل ورد حي النسيم" },
      { property: "og:site_name", content: "Middlemist Flower" },
      { property: "og:title", content: "Middlemist Flower | ميدل ميست فلاور" },
      { property: "og:description", content: "لكل مناسبة وردة تحكي عنك. ورد يفرح، وهدايا من القلب لمن تحب." },
      { property: "og:image", content: "https://www.middlemist.store/hero.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Middlemist Flower – متجر ورد وهدايا" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.middlemist.store" },
      { property: "og:locale", content: "ar_SA" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Middlemist Flower | ميدل ميست فلاور" },
      { name: "twitter:description", content: "لكل مناسبة وردة تحكي عنك. ورد يفرح، وهدايا من القلب لمن تحب." },
      { name: "twitter:image", content: "https://www.middlemist.store/hero.jpg" },
      { name: "robots", content: "index, follow" },
      // Google Search Console Verification - Replace with actual verification code
      // { name: "google-site-verification", content: "YOUR_VERIFICATION_CODE_HERE" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=Tajawal:wght@400;500;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/favicon.png", sizes: "180x180" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    const unsubscribe = router.subscribe('onBeforeLoad', () => {
      setIsNavigating(true);
    });

    const unsubscribeAfter = router.subscribe('onResolved', () => {
      setIsNavigating(false);
    });

    return () => {
      unsubscribe();
      unsubscribeAfter();
    };
  }, [router]);

  return (
    <QueryClientProvider client={queryClient}>
      <LoadingScreen isLoading={isNavigating} />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
