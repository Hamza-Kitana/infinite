export type GangStatus = "taken" | "available";

export type GangCard = {
  id: string;
  name: string;
  nameEn?: string;
  specialty: string;
  location: string;
  description: string;
  youtubeVideo: string;
  logoImage: string;
  status: GangStatus;
  brandColor: string;
  profilePoints: string[];
  leaderName?: string;
  /** مخفية من العرض في الموقع العام */
  hidden?: boolean;
};

export type GangsPersisted = {
  v: 1;
  gangs: GangCard[];
};
