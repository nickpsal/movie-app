import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TMDB_API_CONFIG } from '../constants/api.config';
import { Movie } from '../models/movie.model';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  httpClient: any;

  constructor(private http: HttpClient) {}

  searchMovies(query: string): Observable<Movie[]> {
    return this.http.get<any>(`${TMDB_API_CONFIG.baseUrl}`, {
      params: {
        api_key: TMDB_API_CONFIG.apiKey,
        query,
        language: TMDB_API_CONFIG.language_en
      }
    }).pipe(map(res => res.results));
  }
}
