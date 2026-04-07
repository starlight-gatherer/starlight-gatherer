import Link from "next/link";

export function Nav() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-amber-400
                          flex items-center justify-center text-white font-black text-lg shadow-lg shadow-red-200/50
                          group-hover:scale-110 transition-transform">S</div>
          <span className="font-black text-lg tracking-tight hidden sm:block">Starlight Gatherer</span>
        </Link>
        <div className="flex items-center gap-8 text-sm font-bold">
          <Link href="/" className="text-slate-600 hover:text-red-500 transition-colors">首页</Link>
          <Link href="/admin" className="text-slate-400 hover:text-red-500 transition-colors">管理</Link>
        </div>
      </div>
    </nav>
  );
}
