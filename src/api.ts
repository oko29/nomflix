const API_KEY = "f24a0465a510cada09a4f4bf2dded3fa";
const BASE_PATH = "https://api.themoviedb.org/3/movie";

interface IMovie {
  id: number;
  backdrop_path: string;
  poster_path: string;
  title: string;
  overview: string;
  release_date: string;
  vote_average: number;
}

export interface IGetMoviesResult {
  dates: {
    maximum: string;
    minimum: string;
  };
  page: number;
  results: IMovie[];
  total_pages: number;
  total_results: number;
}

export function getMovies() {
  return fetch(`${BASE_PATH}/now_playing?api_key=${API_KEY}`).then((response) =>
    response.json()
  );
}
