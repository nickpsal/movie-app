import { Component, signal, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MovieService } from '../../core/services/movie.service';
import { Movie } from '../../core/models/movie.model';
import { FormsModule } from '@angular/forms';
import { toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TMDB_API_CONFIG } from '../../core/constants/api.config';
import { MovieDialogComponent } from '../movie-dialog/movie-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatCardModule
  ],
  templateUrl: './movie-list.component.html',
  styleUrl: './movie-list.component.css'
})

export class MovieListComponent implements AfterViewInit {
  @ViewChild('infiniteScrollTarget', { static: true }) scrollTarget!: ElementRef;

  searchQuery = signal<string>('');
  currentPageNumber = signal<number>(1);
  isLoading = signal<boolean>(false);
  hasMore = signal<boolean>(true);
  lastQuery = signal<string>('');
  movieLang = signal<string>('en');
  movies = signal<Movie[]>([]);
  favorites = signal<number[]>([]);

  constructor(private movieService: MovieService, private dialog: MatDialog) {
    const search$ = toObservable(this.searchQuery);
    search$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap(query => {
          const clean = query.trim();
          //detect language
          const detectedLang = this.detectLanguage(clean);
          this.movieLang.set(detectedLang);

          this.lastQuery.set(clean);
          this.currentPageNumber.set(1);
          this.hasMore.set(true);
          return clean.length > 3
            ? this.movieService.searchMovies(clean, this.movieLang(), 1)  // 🔥 hardcode page 1 here!
            : this.movieService.getLatestMovies(1);
        })
      )
      .subscribe(results => {
        this.movies.set(results);
      });
  }

  showMovieDetails(movie: Movie): void {
    this.dialog.open(MovieDialogComponent, {
      data: movie,
      width: '1200px',
      maxWidth: 'unset' // ← this disables the default 80vw limit
    });
  }

  ngOnInit(): void {
    const stored = this.movieService.getFavourites();
    if (stored) {
      this.favorites.set(JSON.parse(stored));
    }
  }

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(entries => {
      const entry = entries[0];
      if (entry.isIntersecting && !this.isLoading() && this.hasMore()) {
        this.loadNextPage();
      }
    }, {
      root: null, // viewport
      rootMargin: '0px',
      threshold: 1.0
    });
    observer.observe(this.scrollTarget.nativeElement);
  }

  detectLanguage(query: string): 'el' | 'en' {
    const greekRegex = /[\u0370-\u03FF]/;
    return greekRegex.test(query) ? 'el' : 'en';
  }

  loadNextPage(): void {
    this.isLoading.set(true);
    const nextPage = this.currentPageNumber() + 1;
    this.currentPageNumber.set(nextPage);

    const query = this.lastQuery();

    const load$ = query.length > 3
      ? this.movieService.searchMovies(query, this.movieLang(), nextPage)
      : this.movieService.getLatestMovies(nextPage);

    load$.subscribe(results => {
      if (results.length === 0) {
        this.hasMore.set(false);
      }
      this.movies.set([...this.movies(), ...results]);
      this.isLoading.set(false);
    });
  }

  getImageUrl(image_id: string | null): string {
    return image_id
      ? `${TMDB_API_CONFIG.imageBaseUrl}${image_id}`
      : 'assets/images/no-poster.png';
  }

  toggleFavorite(movie: Movie): void {
    const current = this.favorites();
    const updated = current.includes(movie.id)
      ? current.filter(id => id !== movie.id) //if it is favourite it remove it
      : [...current, movie.id]; // if it not it add the new one

    this.favorites.set(updated);
    this.movieService.showMessage("Favourite Movie List Updated");
    this.movieService.setFavourites(updated);
  }

  isFavorite(id: number): boolean {
    return this.favorites().includes(id);
  }
}
