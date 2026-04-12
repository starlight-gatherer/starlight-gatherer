export function Hero() {
  return (
    <header className="relative overflow-hidden text-white">
      {/* Background image — anchored to top so the upper half is always visible */}
      <div
        className="absolute inset-0 bg-cover bg-top"
        style={{ backgroundImage: "url('/images/cover.png')" }}
      />
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative max-w-7xl mx-auto px-6 py-32 text-center">
        <h1 className="text-5xl sm:text-6xl font-black mb-6 tracking-tight drop-shadow-lg">
          <span className="text-white/85">The Starlight Gatherer</span>
        </h1>
        <p className="text-lg sm:text-xl text-white/80 max-w-xl mx-auto font-medium">
          少女☆歌剧资源归档站
        </p>
      </div>
    </header>
  );
}
