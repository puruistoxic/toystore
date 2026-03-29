/** Extract YouTube video id from watch, embed, shorts, or youtu.be URLs. */
export function parseYoutubeVideoId(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})(?:&|$)/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = s.match(p);
    if (m) return m[1];
  }
  return null;
}

export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
}

export function youtubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}
