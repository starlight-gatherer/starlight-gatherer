export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-500 py-16 px-6 text-center text-sm">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-center gap-10 font-medium">
          <a href="/admin" className="hover:text-red-400 transition-colors">Admin</a>
          <a href="/api/v1/series" className="hover:text-red-400 transition-colors">API</a>
        </div>
        <p className="opacity-30 text-xs">Position Zero.</p>
      </div>
    </footer>
  );
}
