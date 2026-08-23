import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

interface OrientationData {
  absolute: {
    alpha: number;
    beta: number;
    gamma: number;
  };
  relative: {
    alpha: number;
    beta: number;
    gamma: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class OrientationService {
  private orientationSubject = new Subject<OrientationData>();
  public orientation$: Observable<OrientationData> = this.orientationSubject.asObservable();

  private firstReading = true;
  private baseOrientation = this.getRawOrientation(null);

  constructor() {
    this.initializeDeviceOrientation();
  }

  resetBaseOrientation(): void {
    this.firstReading = true;
    this.baseOrientation = this.getRawOrientation(null);
  }

  private getRawOrientation(e: DeviceOrientationEvent | null) {
    if (!e) {
      return { alpha: 0, beta: 0, gamma: 0 };
    } else {
      return {
        alpha: e.alpha || 0,
        beta: e.beta || 0,
        gamma: e.gamma || 0
      };
    }
  }

  private getOrientationObject(e: DeviceOrientationEvent | null): OrientationData {
    const orientation = this.getRawOrientation(e);
    return {
      absolute: orientation,
      relative: {
        alpha: orientation.alpha - this.baseOrientation.alpha,
        beta: orientation.beta - this.baseOrientation.beta,
        gamma: orientation.gamma - this.baseOrientation.gamma
      }
    };
  }

  private initializeDeviceOrientation(): void {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (this.firstReading) {
        this.firstReading = false;
        this.baseOrientation = this.getRawOrientation(e);
      }

      const orientationData = this.getOrientationObject(e);
      this.orientationSubject.next(orientationData);
    };

    if (window) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }
  }
}
