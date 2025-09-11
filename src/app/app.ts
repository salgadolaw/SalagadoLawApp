import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IdleService } from './core/services/idle.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('LawSalgadoApp');
  private idle=inject(IdleService);
  ngOnInit(){

    this.idle.start();
  }
}
