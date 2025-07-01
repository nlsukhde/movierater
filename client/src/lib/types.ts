// types.ts
export interface Movie {
  id: number;
  title: string;
  year: number;
  genre: string[];
  duration: string;
  description: string;
  poster: string;
  director: string;
  cast: string[];
}

export interface Review {
  id: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  verified: boolean;
}