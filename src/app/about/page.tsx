export default function AboutPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-black tracking-tight mb-12 text-slate-800">
        关于<span className="text-red-500">.</span>
      </h1>

      <section className="mb-16">
        <h2 className="text-2xl font-black mb-6 text-slate-700">站点介绍</h2>
        <div className="prose prose-slate max-w-2xl">
          <p className="text-slate-600 leading-relaxed">
            Starlight Gatherer 是一个《少女☆歌剧 Revue Starlight》的资源归档站，
            旨在按现实时间线整理和归档舞台剧、Live、生放送等视频资源。
          </p>
          <p className="text-slate-600 leading-relaxed mt-4">
            本站数据来源于粉丝社区的共同努力，感谢所有搬运和字幕制作人员的辛勤付出。
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-black mb-6 text-slate-700">友情链接</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-slate-100 text-slate-400 italic">
            暂无友链，欢迎联系添加
          </div>
        </div>
      </section>
    </main>
  );
}
