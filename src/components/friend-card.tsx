import Image from "next/image";

interface FriendCardProps {
  avatar: string;
  name: string;
  introduction: string;
  url: string;
}

export function FriendCard({ avatar, name, introduction, url }: FriendCardProps) {
  const isExternal = avatar.startsWith("http");

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-white rounded-2xl border border-slate-100 p-5
                 hover:border-red-300 hover:shadow-lg hover:shadow-red-50
                 transition-all duration-300"
    >
      <div className="flex items-start gap-4">
        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
          <Image
            src={avatar}
            alt={name}
            fill
            className="object-cover"
            sizes="48px"
            unoptimized={isExternal}
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-sm text-slate-800 leading-snug break-all group-hover:text-red-600 transition-colors">
            {name}
          </h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed line-clamp-2">
            {introduction}
          </p>
        </div>
      </div>
    </a>
  );
}
