import { Component, signal, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MovieService } from '../../core/services/movie.service';
import { Movie } from '../../core/models/movie.model';
import { FormsModule } from '@angular/forms';
import { toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TMDB_API_CONFIG } from '../../core/constants/api.config';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatCardModule
  ],
  templateUrl: './movie-list.component.html',
  styleUrl: './movie-list.component.scss'
})
export class MovieListComponent implements AfterViewInit {
  @ViewChild('infiniteScrollTarget', { static: true }) scrollTarget!: ElementRef;

  searchQuery = signal<string>('');
  currentPageNumber = signal<number>(1);
  isLoading = signal<boolean>(false);
  hasMore = signal<boolean>(true);
  lastQuery = signal<string>('');
  movieLang = 'en';
  movies = signal<Movie[]>([]);

  constructor(private movieService: MovieService) {
    const search$ = toObservable(this.searchQuery);
    search$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap(query => {
          const clean = query.trim();
          this.lastQuery.set(clean);
          this.currentPageNumber.set(1);       // reset page
          this.hasMore.set(true);              // reset end flag
          return clean.length > 3
            ? this.movieService.searchMovies(clean, this.movieLang, 1)
            : this.movieService.getLatestMovies(1);
        })
      )
      .subscribe(results => {
        this.movies.set(results);
      });
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

  loadNextPage(): void {
    this.isLoading.set(true);
    const nextPage = this.currentPageNumber() + 1;
    this.currentPageNumber.set(nextPage);

    const query = this.lastQuery();
    const load$ = query.length > 3
      ? this.movieService.searchMovies(query, this.movieLang, nextPage)
      : this.movieService.getLatestMovies(nextPage);

    load$.subscribe(results => {
      if (results.length === 0) {
        this.hasMore.set(false);
      }
      this.movies.set([...this.movies(), ...results]);
      this.isLoading.set(false);
    });
  }

  getImageUrl(image_id: string) {
    return `${TMDB_API_CONFIG.imageBaseUrl}${image_id}`;
  }
}
