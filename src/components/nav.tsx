import Link from "next/link";

const NAV_ITEMS = [
  { href: "/", label: "首页" },
  { href: "/timeline", label: "时间线" },
  { href: "/music", label: "音乐" },
  { href: "/characters", label: "角色" },
  { href: "/about", label: "关于" },
];

export function Nav() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl 
                          flex items-center justify-center
                          group-hover:scale-110 transition-transform
                          bg-[url('/starlight.svg')] bg-center bg-no-repeat bg-[length:80%]">
          </div>
          <span className="font-black text-lg tracking-tight hidden sm:block">Starlight Gatherer</span>
        </Link>
        <div className="flex items-center gap-6 text-sm font-bold">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-slate-500 hover:text-red-500 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
