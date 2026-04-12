export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-500 pt-8 pb-10 px-6 text-center text-sm">
      <div className="max-w-4xl mx-auto space-y-3">
        <div className="flex justify-center gap-10 font-medium">
          <a href="/admin" className="hover:text-red-400 transition-colors">Admin</a>
        </div>
        <p className="opacity-90">
          星摘みは罪の赦し 星摘みは夜の奇跡
          <br/>
          Powered by Next.js
        </p>
      </div>
    </footer>
  );
}
