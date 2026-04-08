interface ArchiveItem {
  id: number;
  videoUrl: string | null;
  title: string;
}

export function handleVideoAction(archive: ArchiveItem): void {
  if (archive.videoUrl) {
    window.open(archive.videoUrl, "_blank", "noopener,noreferrer");
  }
}
