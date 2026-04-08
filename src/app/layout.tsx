import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Starlight Gatherer - 少女☆歌剧资源归档站",
  description: "按现实时间线补完计划：舞台剧、Live、生放送全纪录",
  icons: { icon: [{ url: '/starlight.svg', type: 'image/svg+xml' }]}
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
