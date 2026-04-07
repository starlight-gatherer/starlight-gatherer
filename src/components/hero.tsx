export function Hero() {
  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-red-500 via-rose-500 to-amber-400 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 to-transparent" />
      <div className="relative max-w-7xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl sm:text-6xl font-black mb-6 tracking-tight drop-shadow-lg">
          少女☆歌剧<br className="sm:hidden" /> 资源归档站
        </h1>
        <p className="text-lg sm:text-xl text-white/80 max-w-xl mx-auto font-medium">
          按现实时间线补完计划 —— 舞台剧、Live、生放送全纪录
        </p>
      </div>
    </header>
  );
}
