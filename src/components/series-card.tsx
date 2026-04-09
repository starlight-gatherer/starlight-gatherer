import Link from "next/link";
import Image from "next/image";

interface SeriesCardProps {
  seriesId: number;
  title: string;
  count: number;
  coverImage: string;
}

export function SeriesCard({ seriesId, title, count, coverImage }: SeriesCardProps) {
  return (
    <Link href={`/series/${seriesId}`} className="group block">
      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-900">
        {<Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-xl font-black text-white leading-tight mb-1 group-hover:underline decoration-2 underline-offset-4">
            {title}
          </h3>
          <p className="text-sm text-white/60 font-medium">{count} 个活动</p>
        </div>
        <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm
                        flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-white text-lg">→</span>
        </div>
      </div>
    </Link>
  );
}
