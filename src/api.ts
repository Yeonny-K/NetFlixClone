const API_KEY = "6fbfc1dfc0405991245b339bc24910d4";
const BASE_PATH = "https://api.themoviedb.org/3";

interface IMovie {
    //https://api.themoviedb.org/3/movie/now_playing?api_key=6fbfc1dfc0405991245b339bc24910d4&language=en-US&page=1
    //여기 url 안에 result 배열 안에서 필요한 것만 골라 쓰기
    id: number;
    backdrop_path: string;
    poster_path: string;
    title: string;
    overview: string;
    vote_average: number;
    release_date : string;
}

interface ITv {
  id: number;
  backdrop_path: string;
  poster_path: string;
  name: string;
  overview: string;
  vote_average: number;
  first_air_date: string;
}

interface IGenres {
  id: number;
  name: string;
}

export interface IGetMovieResult {
    //https://api.themoviedb.org/3/movie/now_playing?api_key=6fbfc1dfc0405991245b339bc24910d4&language=en-US&page=1
    //여기 보면은 아래 정보들 나오기 때문에 인터페이스로 만들어줌
    dates: {
        maximum: string;
        minimum: string;
    };
    page: number;
    results: IMovie[];
    //result는 IMovie의 배열이 됨

    total_pages: number;
    total_results: number;
}

export interface IGetMovieDetail {
  id: number;
  genres: IGenres[];
  overview: string;
  vote_average: number;
}

export interface IGetShowResult {
  page: number;
  results: ITv[];
  total_pages: number;
  total_results: number;
}

export function getLatestMovies() {
  return fetch(`${BASE_PATH}/movie/now_playing?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
}

export function getTopRatedMovies() {
  return fetch(`${BASE_PATH}/movie/top_rated?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
}

export function getUpcomingMovies() {
  return fetch(`${BASE_PATH}/movie/upcoming?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
}

export function getOnTheAirShows() {
  return fetch(
      `${BASE_PATH}/tv/on_the_air?api_key=${API_KEY}`
  ).then((response) => response.json());
}

export function getAiringTodayShows() {
  return fetch(
      `${BASE_PATH}/tv/airing_today?api_key=${API_KEY}`
  ).then((response) => response.json());
}

export function getPopularShows() {
  return fetch(
      `${BASE_PATH}/tv/popular?api_key=${API_KEY}`
  ).then((response) => response.json());
}

export function getTopRatedShows() {
  return fetch(
      `${BASE_PATH}/tv/top_rated?api_key=${API_KEY}`
  ).then((response) => response.json());
}

export function getSearchMovies(keyword: string) {
  return fetch(
      `${BASE_PATH}/search/movie?query=${keyword}&api_key=${API_KEY}`
  ).then((response) => response.json());
}

export function getSearchShows(keyword: string) {
  return fetch(
      `${BASE_PATH}/search/tv?query=${keyword}&api_key=${API_KEY}`
  ).then((response) => response.json());
}

export function getDetail(category: "movie" | "tv", id: string) {
  return fetch(
      `${BASE_PATH}${category}/${id}?api_key=${API_KEY}`
  ).then((response) => response.json());
}