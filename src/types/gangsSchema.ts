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
};

export type GangsPersisted = {
  v: 1;
  gangs: GangCard[];
};
