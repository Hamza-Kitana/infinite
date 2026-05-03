/** صانع محتوى واحد في الشبكة العامة ومحرر الإدارة */
export type StreamerEntry = {
  id: string;
  name: string;
  role: string;
  bio: string;
  streamUrl: string;
  /** مسار عام `/file.webp` أو رابط كامل أو `data:image/...` من الرفع */
  image: string;
};

export type StreamersPersisted = {
  v: 1;
  items: StreamerEntry[];
};
