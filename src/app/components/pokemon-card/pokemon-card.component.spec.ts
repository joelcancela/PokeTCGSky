import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PokemonCardComponent } from './pokemon-card.component';
import { ActiveCardService } from 'src/app/services/active-card.service';
import { OrientationService } from 'src/app/services/orientation.service';

describe('PokemonCardComponent', () => {
  let component: PokemonCardComponent;
  let fixture: ComponentFixture<PokemonCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PokemonCardComponent],
      providers: [ActiveCardService, OrientationService]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PokemonCardComponent);
    component = fixture.componentInstance;
    component.pokemon = {
      id: 'test-001',
      number: '001',
      name: 'Pikachu',
      qty: 1,
      rarity: 'Common',
      location: 'N/A',
      supertype: 'Pokémon',
      subtypes: ['Basic'],
      types: ['Lightning'],
      set: { id: 'base1' },
      images: { large: 'https://example.com/pikachu.png' }
    } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
