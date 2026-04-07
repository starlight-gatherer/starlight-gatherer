import Link from "next/link";
import Image from "next/image";

interface SeriesCardProps {
  seriesId: number;
  title: string;
  count: number;
  coverImage?: string | null;  // 本地图片路径，如 "/images/series/1.png"
  accentColor?: "red" | "yellow" | "blue";
}

const accentMap = {
  red:    "from-red-500 to-rose-600",
  yellow: "from-amber-500 to-yellow-600",
  blue:   "from-blue-500 to-indigo-600",
};

export function SeriesCard({ seriesId, title, count, coverImage, accentColor = "red" }: SeriesCardProps) {
  return (
    <Link href={`/series/${seriesId}`} className="group block">
      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-900">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${accentMap[accentColor]} opacity-80`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-xl font-black text-white leading-tight mb-1 group-hover:underline decoration-2 underline-offset-4">
            {title}
          </h3>
          <p className="text-sm text-white/60 font-medium">{count} 项资源</p>
        </div>
        <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm
                        flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-white text-lg">→</span>
        </div>
      </div>
    </Link>
  );
}
