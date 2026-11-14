import type { Metadata } from "next";
import { Alexandria, IBM_Plex_Sans_Arabic, Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/app";

const plex = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-plex",
});
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const grotesk = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], display: "swap", variable: "--font-grotesk" });
const alexandria = Alexandria({ subsets: ["arabic"], weight: ["600", "700"], display: "swap", variable: "--font-alexandria" });

export const metadata: Metadata = {
  metadataBase: new URL("https://dar-dashboard.vercel.app"),
  title: "دار — لوحة تحكم المتجر | Dar Store Dashboard",
  description:
    "لوحة تحكم تجريبية لمتجر إلكتروني: طلبات، إيرادات، صلاحيات للمدير والموظف، فلترة وتصدير Excel، عربي وإنجليزي. تصميم وتنفيذ محمود النجدي.",
  openGraph: {
    title: "Dar — Store Dashboard (demo)",
    description: "Orders, revenue, roles, filters and Excel export. Arabic RTL + English.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${plex.variable} ${inter.variable} ${grotesk.variable} ${alexandria.variable}`} suppressHydrationWarning>
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
