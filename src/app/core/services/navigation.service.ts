import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  constructor() { }

  title: string

  setTitle(title: string) {
    this.title = title
  }
}
