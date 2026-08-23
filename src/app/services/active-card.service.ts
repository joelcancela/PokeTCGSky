import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActiveCardService {
  private activeCardSubject = new BehaviorSubject<HTMLElement | null>(null);
  public activeCard$: Observable<HTMLElement | null> = this.activeCardSubject.asObservable();

  constructor() {}

  setActiveCard(card: HTMLElement | null): void {
    this.activeCardSubject.next(card);
  }

  getActiveCard(): HTMLElement | null {
    return this.activeCardSubject.value;
  }
}
