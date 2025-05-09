export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  original_language: string;
  genre_ids?: number[]; // present in search results
  popularity?: number;
  adult?: boolean;
}
