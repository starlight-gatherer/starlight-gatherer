import fs from 'fs';
import path from 'path';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { FriendCard } from '@/components/friend-card';

interface FriendLink {
  avatar: string;
  name: string;
  introduction: string;
  url: string;
}

export default function AboutPage() {
  const filePath = path.join(process.cwd(), 'content/about.md');
  const fileContent = fs.readFileSync(filePath, 'utf8');

  const friendsPath = path.join(process.cwd(), 'content/friends.json');
  const friends: FriendLink[] = JSON.parse(fs.readFileSync(friendsPath, 'utf8'));

  return (
    <main className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
      <div className="flex-1 min-w-0 max-w-3xl">
        <article className="prose prose-blue lg:prose-xl mx-auto">
          <ReactMarkdown>{fileContent}</ReactMarkdown>
        </article>

        <br/><br/>

        <section>
          <h1 className="text-2xl font-bold text-slate-800 mb-4">友情链接</h1>
          <br/>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {friends.map((friend) => (
              <FriendCard key={friend.url} {...friend} />
            ))}
          </div>
        </section>
      </div>

      <aside className="hidden lg:block w-80 xl:w-96 shrink-0">
        <div className="sticky top-24">
          <Image
            src="/images/starlight_cover.png"
            alt="Starlight Cover"
            width={600}
            height={800}
            className="w-full rounded-2xl"
            priority
          />
        </div>
      </aside>
    </main>
  );
}
