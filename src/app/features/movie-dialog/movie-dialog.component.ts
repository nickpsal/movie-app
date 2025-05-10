import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Movie } from '../../core/models/movie.model';
import { TMDB_API_CONFIG } from '../../core/constants/api.config';

@Component({
  selector: 'app-movie-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: 'movie-dialog.component.html'
})

export class MovieDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<MovieDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: Movie
  ) { }

  close(): void {
    this.dialogRef.close();
  }

  getImageUrl(image_id: string) {
    return `${TMDB_API_CONFIG.imageBaseUrl}${image_id}`;
  }
}