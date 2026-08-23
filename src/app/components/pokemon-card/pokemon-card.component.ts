import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { Subject, BehaviorSubject, takeUntil, filter } from 'rxjs';
import { MathHelper } from 'src/app/helpers/math.helper';
import { Pokemon } from 'src/app/model/pokemon';
import { ActiveCardService } from 'src/app/services/active-card.service';
import { OrientationService } from 'src/app/services/orientation.service';
import altArts from "./alternate-arts.json";
import promos from "./promos.json";

interface SpringValue {
  x: number;
  y: number;
  o?: number;
}

@Component({
  selector: 'app-pokemon-card',
  templateUrl: './pokemon-card.component.html',
  styleUrls: ['./pokemon-card.component.scss']
})
export class PokemonCardComponent implements OnInit {

  @ViewChild('cardElement') cardElement!: ElementRef;

  @Input() pokemon: Pokemon;

  // Data / Pokemon props
  id: string = '';
  name: string = '';
  number: string = '';
  set: string = '';
  types: string[] | string = '';
  subtypes: string[] | string = 'basic';
  supertype: string = 'pokémon';
  rarity: string = 'common';

  // Image props
  img: string = '';
  @Input() back: string = 'https://tcg.pokemon.com/assets/img/global/tcg-card-back-2x.jpg';
  @Input() foil: string = '';
  @Input() mask: string = '';

  // Context/environment props
  @Input() showcase: boolean = false;

  // Computed properties
  typesClass: string = '';
  rarityLower: string = '';
  supertypeLower: string = '';
  numberLower: string = '';
  subtypesClass: string = '';
  isTrainerGallery: boolean = false;
  isActive: boolean = false;
  isInteracting: boolean = false;
  loading: boolean = true;
  foilStyles: string = '';
  staticStyles: string = '';
  dynamicStyles: string = '';
  isShiny: boolean = false;
  isGallery: boolean = false;
  isAlternate: boolean = false;
  isPromo: boolean = false;

  // Image sources
  backImg: string = '';
  frontImg: string = '';
  imgBase: string = '';

  // State management
  private destroy$ = new Subject<void>();
  private active$ = new BehaviorSubject<boolean>(false);
  private interacting$ = new BehaviorSubject<boolean>(false);
  private firstPop$ = new BehaviorSubject<boolean>(true);
  private isVisible$ = new BehaviorSubject<boolean>(document.visibilityState === 'visible');

  // Random seed for cosmos effect
  private randomSeed = {
    x: Math.random(),
    y: Math.random()
  };

  private cosmosPosition = {
    x: Math.floor(this.randomSeed.x * 734),
    y: Math.floor(this.randomSeed.y * 1280)
  };

  // Spring values
  springRotate$ = new BehaviorSubject<SpringValue>({ x: 0, y: 0 });
  springGlare$ = new BehaviorSubject<SpringValue>({ x: 50, y: 50, o: 0 });
  springBackground$ = new BehaviorSubject<SpringValue>({ x: 50, y: 50 });
  springRotateDelta$ = new BehaviorSubject<SpringValue>({ x: 0, y: 0 });
  springTranslate$ = new BehaviorSubject<SpringValue>({ x: 0, y: 0 });
  springScale$ = new BehaviorSubject<number>(1);

  // Showcase animation
  private showcaseInterval: any;
  private showcaseTimerStart: any;
  private showcaseTimerEnd: any;
  private showcaseRunning: boolean = false;

  // Other
  private repositionTimer: any;
  private rafId: any = null;
  private pendingSpringUpdate: any = null;

  constructor(
    private activeCardService: ActiveCardService,
    private orientationService: OrientationService
  ) { }

  ngOnInit(): void {
    this.id = this.pokemon.id || '';
    this.name = this.pokemon.name || '';
    this.number = this.pokemon.number || '';
    const setVal: any = (this.pokemon as any).set;
    if (setVal && typeof setVal === 'object') {
      this.set = setVal.id || '';
    } else if (typeof setVal === 'string') {
      this.set = setVal;
    } else {
      this.set = '';
    }
    this.types = this.pokemon.types || '';
    this.subtypes = this.pokemon.subtypes || 'basic';
    this.supertype = this.pokemon.supertype || 'pokémon';
    this.rarity = this.pokemon.rarity || 'common';
    // Set the front image on mount
    this.img = this.pokemon.images?.large || this.pokemon.images?.small || '';
    this.frontImg = this.img;
    this.backImg = this.back;

    // Process input properties
    this.processProperties();
    this.initializeCardProperties();

    // Setup static styles
    this.staticStyles = `
      --seedx: ${this.randomSeed.x};
      --seedy: ${this.randomSeed.y};
      --cosmosbg: ${this.cosmosPosition.x}px ${this.cosmosPosition.y}px;
    `;

    // Subscribe to active card changes
    this.activeCardService.activeCard$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateActiveState();
      });

    // Subscribe to orientation changes
    this.orientationService.orientation$
      .pipe(
        filter(() => this.isInteracting),
        takeUntil(this.destroy$)
      )
      .subscribe((orientation) => {
        this.orientate(orientation);
      });

    // Subscribe to visibility changes
    this.isVisible$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isVisible) => {
        if (!isVisible) {
          this.endShowcase();
          this.reset();
        }
      });

    // Showcase animation setup
    if (this.showcase && document.visibilityState === 'visible') {
      this.startShowcaseAnimation();
    }

    // Subscribe to spring updates for dynamic styles
    this.springRotate$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateDynamicStyles();
    });
    this.springGlare$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateDynamicStyles();
    });
    this.springBackground$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateDynamicStyles();
    });
    this.springRotateDelta$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateDynamicStyles();
    });
    this.springTranslate$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateDynamicStyles();
    });
    this.springScale$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateDynamicStyles();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.endShowcase();
  }

  @HostListener('window:visibilitychange')
  onVisibilityChange(): void {
    this.isVisible$.next(document.visibilityState === 'visible');
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.reposition();
  }

  private processProperties(): void {
    if (!this.pokemon.holo) {
      this.rarity = '';
    }
    this.rarityLower = this.rarity.toLowerCase();
    this.supertypeLower = this.supertype.toLowerCase();
    this.numberLower = this.number.toLowerCase();

    if (Array.isArray(this.types)) {
      this.typesClass = this.types.join(' ').toLowerCase();
    } else {
      this.typesClass = this.types.toLowerCase();
    }

    if (Array.isArray(this.subtypes)) {
      this.subtypesClass = this.subtypes.join(' ').toLowerCase();
    } else {
      this.subtypesClass = this.subtypes.toLowerCase();
    }

    this.isTrainerGallery = !!this.numberLower.match(/^[tg]g/i) ||
      this.id === 'swshp-SWSH076' ||
      this.id === 'swshp-SWSH077';
  }

  private updateDynamicStyles(): void {
    const rotate = this.springRotate$.value;
    const glare = this.springGlare$.value;
    const background = this.springBackground$.value;
    const rotateDelta = this.springRotateDelta$.value;
    const translate = this.springTranslate$.value;
    const scale = this.springScale$.value;

    const pointerFromCenter = MathHelper.clamp(
      Math.sqrt(
        (glare.y - 50) * (glare.y - 50) +
        (glare.x - 50) * (glare.x - 50)
      ) / 50,
      0,
      1
    );

    this.dynamicStyles = `
      --pointer-x: ${glare.x}%;
      --pointer-y: ${glare.y}%;
      --pointer-from-center: ${pointerFromCenter};
      --pointer-from-top: ${glare.y / 100};
      --pointer-from-left: ${glare.x / 100};
      --card-opacity: ${glare.o};
      --rotate-x: ${rotate.x + rotateDelta.x}deg;
      --rotate-y: ${rotate.y + rotateDelta.y}deg;
      --background-x: ${background.x}%;
      --background-y: ${background.y}%;
      --card-scale: ${scale};
      --translate-x: ${translate.x}px;
      --translate-y: ${translate.y}px;
    `;
  }

  onCardClick(): void {
    this.activate();
  }

  onPointerMove(e: PointerEvent): void {
    this.interact(e);
  }

  onMouseOut(): void {
    this.interactEnd();
  }

  onBlur(): void {
    this.deactivate();
  }

  onImageLoad(): void {
    this.loading = false;
    if (this.mask || this.foil) {
      this.foilStyles = `
        --mask: url(${this.mask});
        --foil: url(${this.foil});
      `;
    }
  }

  private interact(e: PointerEvent): void {
    this.endShowcase();

    if (!this.isVisible$.value) {
      this.interacting$.next(false);
      return;
    }

    const activeCard = this.activeCardService.getActiveCard();
    if (activeCard && activeCard !== this.cardElement.nativeElement) {
      this.interacting$.next(false);
      return;
    }

    this.interacting$.next(true);

    const el = e.target as HTMLElement;
    const rect = el.getBoundingClientRect();
    const absolute = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    const percent = {
      x: MathHelper.clamp(MathHelper.round((100 / rect.width) * absolute.x)),
      y: MathHelper.clamp(MathHelper.round((100 / rect.height) * absolute.y))
    };
    const center = {
      x: percent.x - 50,
      y: percent.y - 50
    };

    this.pendingSpringUpdate = {
      background: {
        x: MathHelper.adjust(percent.x, 0, 100, 37, 63),
        y: MathHelper.adjust(percent.y, 0, 100, 33, 67)
      },
      rotate: {
        x: MathHelper.round(-(center.x / 3.5)),
        y: MathHelper.round(center.y / 3.5)
      },
      glare: {
        x: MathHelper.round(percent.x),
        y: MathHelper.round(percent.y),
        o: 1
      }
    };

    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(() => {
        if (this.pendingSpringUpdate) {
          this.updateSprings(
            this.pendingSpringUpdate.background,
            this.pendingSpringUpdate.rotate,
            this.pendingSpringUpdate.glare
          );
          this.pendingSpringUpdate = null;
        }
        this.rafId = null;
      });
    }
  }

  private interactEnd(delay: number = 500): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.pendingSpringUpdate = null;

    setTimeout(() => {
      const snapStiff = 0.01;
      const snapDamp = 0.06;
      this.interacting$.next(false);

      this.springRotate$.next({ x: 0, y: 0 });
      this.springGlare$.next({ x: 50, y: 50, o: 0 });
      this.springBackground$.next({ x: 50, y: 50 });
    }, delay);
  }

  private activate(): void {
    const currentActive = this.activeCardService.getActiveCard();
    if (currentActive === this.cardElement.nativeElement) {
      this.activeCardService.setActiveCard(null);
    } else {
      this.activeCardService.setActiveCard(this.cardElement.nativeElement);
      this.orientationService.resetBaseOrientation();
    }
  }

  private deactivate(): void {
    this.interactEnd();
    this.activeCardService.setActiveCard(null);
  }

  private updateActiveState(): void {
    const activeCard = this.activeCardService.getActiveCard();
    const isActive = activeCard === this.cardElement?.nativeElement;
    this.isActive = isActive;

    if (isActive) {
      this.popover();
    } else {
      this.retreat();
    }
  }

  private reposition(): void {
    clearTimeout(this.repositionTimer);
    this.repositionTimer = setTimeout(() => {
      const activeCard = this.activeCardService.getActiveCard();
      if (activeCard && activeCard === this.cardElement.nativeElement) {
        this.setCenter();
      }
    }, 300);
  }

  private setCenter(): void {
    const rect = this.cardElement.nativeElement.getBoundingClientRect();
    const view = document.documentElement;

    const delta = {
      x: MathHelper.round(view.clientWidth / 2 - rect.x - rect.width / 2),
      y: MathHelper.round(view.clientHeight / 2 - rect.y - rect.height / 2)
    };

    this.springTranslate$.next(delta);
  }

  private popover(): void {
    const rect = this.cardElement.nativeElement.getBoundingClientRect();
    let delay = 100;
    const scaleW = (window.innerWidth / rect.width) * 0.9;
    const scaleH = (window.innerHeight / rect.height) * 0.9;
    const scaleF = 1.75;

    this.setCenter();

    if (this.firstPop$.value) {
      delay = 1000;
      this.springRotateDelta$.next({ x: 360, y: 0 });
    }

    this.firstPop$.next(false);
    this.springScale$.next(Math.min(scaleW, scaleH, scaleF));
    this.interactEnd(delay);
  }

  private retreat(): void {
    this.springScale$.next(1);
    this.springTranslate$.next({ x: 0, y: 0 });
    this.springRotateDelta$.next({ x: 0, y: 0 });
    this.interactEnd(100);
  }

  private reset(): void {
    this.interactEnd(0);
    this.springScale$.next(1);
    this.springTranslate$.next({ x: 0, y: 0 });
    this.springRotateDelta$.next({ x: 0, y: 0 });
    this.springRotate$.next({ x: 0, y: 0 });
  }

  private orientate(orientation: any): void {
    const x = orientation.relative.gamma;
    const y = orientation.relative.beta;
    const limit = { x: 16, y: 18 };

    const degrees = {
      x: MathHelper.clamp(x, -limit.x, limit.x),
      y: MathHelper.clamp(y, -limit.y, limit.y)
    };

    this.updateSprings(
      {
        x: MathHelper.adjust(degrees.x, -limit.x, limit.x, 37, 63),
        y: MathHelper.adjust(degrees.y, -limit.y, limit.y, 33, 67)
      },
      {
        x: MathHelper.round(degrees.x * -1),
        y: MathHelper.round(degrees.y)
      },
      {
        x: MathHelper.adjust(degrees.x, -limit.x, limit.x, 0, 100),
        y: MathHelper.adjust(degrees.y, -limit.y, limit.y, 0, 100),
        o: 1
      }
    );
  }

  private updateSprings(background: SpringValue, rotate: SpringValue, glare: SpringValue): void {
    this.springBackground$.next(background);
    this.springRotate$.next(rotate);
    this.springGlare$.next(glare);
  }

  private endShowcase(): void {
    if (this.showcaseRunning) {
      clearTimeout(this.showcaseTimerEnd);
      clearTimeout(this.showcaseTimerStart);
      clearInterval(this.showcaseInterval);
      this.showcaseRunning = false;
    }
  }

  private startShowcaseAnimation(): void {
    const s = 0.02;
    const d = 0.5;
    let r = 0;

    this.showcaseTimerStart = setTimeout(() => {
      this.interacting$.next(true);
      this.isActive = true;

      if (this.isVisible$.value) {
        this.showcaseRunning = true;
        this.showcaseInterval = setInterval(() => {
          r += 0.05;
          this.springRotate$.next({
            x: Math.sin(r) * 25,
            y: Math.cos(r) * 25
          });
          this.springGlare$.next({
            x: 55 + Math.sin(r) * 55,
            y: 55 + Math.cos(r) * 55,
            o: 0.8
          });
          this.springBackground$.next({
            x: 20 + Math.sin(r) * 20,
            y: 20 + Math.cos(r) * 20
          });
        }, 20);

        this.showcaseTimerEnd = setTimeout(() => {
          clearInterval(this.showcaseInterval);
          this.interactEnd(0);
        }, 4000);
      } else {
        this.interacting$.next(false);
        this.isActive = false;
      }
    }, 2000);
  }

  // Rarity


  private initializeCardProperties(): void {
    this.isShiny = this.isDefined(this.number) && this.number!.toLowerCase().startsWith('sv');
    this.isGallery = this.isDefined(this.number) && !!this.number!.match(/^[tg]g/i);
    this.isAlternate = this.isDefined(this.id) && altArts.includes(this.id!) && !this.isShiny && !this.isGallery;
    this.isPromo = this.isDefined(this.set) && this.set === 'swshp';

    this.applyGalleryRarity();
    this.applyPromoRarity();
  }

  private applyGalleryRarity(): void {
    if (this.isGallery) {
      if (this.isDefined(this.rarity) && this.rarity!.startsWith('Trainer Gallery')) {
        this.rarity = this.rarity!.replace(/Trainer Gallery\s*/, '');
      }
      if (this.isDefined(this.rarity) && this.rarity!.includes('Rare Holo V') && this.isDefined(this.subtypes) && this.subtypes!.includes('VMAX')) {
        this.rarity = 'Rare Holo VMAX';
      }
      if (this.isDefined(this.rarity) && this.rarity!.includes('Rare Holo V') && this.isDefined(this.subtypes) && this.subtypes!.includes('VSTAR')) {
        this.rarity = 'Rare Holo VSTAR';
      }
    }
  }

  private applyPromoRarity(): void {
    if (this.isPromo) {
      if (this.id === 'swshp-SWSH076' || this.id === 'swshp-SWSH077') {
        this.rarity = 'Rare Secret';
      } else if (this.isDefined(this.subtypes) && this.subtypes!.includes('V')) {
        this.rarity = 'Rare Holo V';
      } else if (this.isDefined(this.subtypes) && this.subtypes!.includes('V-UNION')) {
        this.rarity = 'Rare Holo VUNION';
      } else if (this.isDefined(this.subtypes) && this.subtypes!.includes('VMAX')) {
        this.rarity = 'Rare Holo VMAX';
      } else if (this.isDefined(this.subtypes) && this.subtypes!.includes('VSTAR')) {
        this.rarity = 'Rare Holo VSTAR';
      } else if (this.isDefined(this.subtypes) && this.subtypes!.includes('Radiant')) {
        this.rarity = 'Radiant Rare';
      }
    }
  }

  private isDefined(v: any): boolean {
    return typeof v !== 'undefined' && v !== null;
  }

  private foilMaskImage(prop: string | boolean | undefined, type: string = 'masks'): string {
    let etch = 'holo';
    let style = 'reverse';
    const ext = 'webp';

    if (this.isDefined(prop)) {
      if (prop === false) {
        return '';
      }
      return prop as string;
    }

    if (!this.isDefined(this.rarity) || !this.isDefined(this.subtypes) || !this.isDefined(this.supertype) || !this.isDefined(this.set) || !this.isDefined(this.number)) {
      return '';
    }

    const fRarity = this.rarity!.toLowerCase();
    const fNumber = this.number!.toString().toLowerCase().replace('swsh', '').padStart(3, '0');
    const fSet = this.set!.toString().toLowerCase().replace(/(tg|gg|sv)/, '');

    // Apply rarity-based styles
    if (fRarity === 'rare holo') {
      style = 'swholo';
    } else if (fRarity === 'rare holo cosmos') {
      style = 'cosmos';
    } else if (fRarity === 'radiant rare') {
      etch = 'etched';
      style = 'radiantholo';
    } else if (fRarity === 'rare holo v' || fRarity === 'rare holo vunion' || fRarity === 'basic v') {
      style = 'sunpillar';
    } else if (fRarity === 'rare holo vmax' || fRarity === 'rare ultra' || fRarity === 'rare holo vstar') {
      etch = 'etched';
      style = 'sunpillar';
    } else if (fRarity === 'amazing rare' || fRarity === 'rare rainbow' || fRarity === 'rare secret') {
      etch = 'etched';
      style = 'swsecret';
    }

    // Apply shiny styles
    if (this.isShiny) {
      etch = 'etched';
      style = 'sunpillar';

      if (fRarity === 'rare shiny v' || (fRarity === 'rare holo v' && fNumber.startsWith('sv'))) {
        this.rarity = 'Rare Shiny V';
      }
      if (fRarity === 'rare shiny vmax' || (fRarity === 'rare holo vmax' && fNumber.startsWith('sv'))) {
        style = 'swsecret';
        this.rarity = 'Rare Shiny VMAX';
      }
    }

    // Apply gallery styles
    if (this.isGallery) {
      etch = 'holo';
      style = 'rainbow';

      if (fRarity.includes('rare holo v') || fRarity.includes('rare ultra')) {
        etch = 'etched';
        style = 'sunpillar';
      }
      if (fRarity.includes('rare secret')) {
        etch = 'etched';
        style = 'swsecret';
      }
    }

    // Apply alternate art styles
    if (this.isAlternate) {
      etch = 'etched';

      if (this.subtypes!.includes('VMAX')) {
        style = 'swsecret';
        this.rarity = 'Rare Rainbow Alt';
      } else {
        style = 'sunpillar';
      }
    }

    // Apply promo styles
    if (this.isPromo) {
      const promoStyle = promos[this.id as keyof typeof promos];
      if (promoStyle) {
        style = promoStyle.style.toLowerCase();
        etch = promoStyle.etch.toLowerCase();
        if (style === 'swholo') {
          this.rarity = 'Rare Holo';
        } else if (style === 'cosmos') {
          this.rarity = 'Rare Holo Cosmos';
        }
      }
    }

    return `https://images.pokemontcg.io/foils/${fSet}/${type}/upscaled/${fNumber}_foil_${etch}_${style}_2x.${ext}`;
  }

  private foilImage(): string {
    return this.foilMaskImage(this.foil, 'foils');
  }

  private maskImage(): string {
    return this.foilMaskImage(this.mask, 'masks');
  }
}
