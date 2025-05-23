import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TMDB_API_CONFIG } from '../constants/api.config';
import { Movie } from '../models/movie.model';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class MovieService {

  constructor(private http: HttpClient, private snackBar: MatSnackBar) { }

  searchMovies(query: string, lang: string, pageNumber: number): Observable<Movie[]> {
    const url = `${TMDB_API_CONFIG.baseUrl}/search/movie`;
    const params = new HttpParams()
      .set('api_key', TMDB_API_CONFIG.apiKey)
      .set('query', query.trim())
      .set('language', lang === 'en' ? TMDB_API_CONFIG.language_en : TMDB_API_CONFIG.language_el)
      .set('page', pageNumber);

    return this.http.get<any>(url, { params })
      .pipe(map(res => res.results));
  }

  getLatestMovies(pageNumber: number) {
    const url = `${TMDB_API_CONFIG.baseUrl}/movie/now_playing`;
    const params = new HttpParams()
      .set('api_key', TMDB_API_CONFIG.apiKey)
      .set('language', TMDB_API_CONFIG.language_en)
      .set('page', pageNumber);

    return this.http.get<any>(url, { params })
      .pipe(map(res => res.results));
  }

  getFavourites() {
    return localStorage.getItem('favorites');
  }

  setFavourites(updated: number[]) {
    localStorage.setItem('favorites', JSON.stringify(updated));
  }

  showMessage(message: string, options?: {
    action?: string;
    duration?: number;
    panelClass?: string | string[];
    horizontalPosition?: MatSnackBarConfig['horizontalPosition'];
    verticalPosition?: MatSnackBarConfig['verticalPosition'];
  }): void {
    this.snackBar.open(message, options?.action || 'Close', {
      duration: options?.duration || 3000,
      panelClass: options?.panelClass || '',
      horizontalPosition: options?.horizontalPosition || 'right',
      verticalPosition: options?.verticalPosition || 'top',
    });
  }
}
