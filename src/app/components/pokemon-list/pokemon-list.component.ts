import { Component, OnInit } from '@angular/core';
import { Pokemon } from 'src/app/model/pokemon';
import { PokemonFilter } from 'src/app/model/pokemon-filter';
import pokemonList from '../../../assets/pokemons.json';

@Component({
  selector: 'app-pokemon-list',
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.scss']
})
export class PokemonListComponent implements OnInit {

  total: number = 0;
  pokemons: Pokemon[] = [];
  totalDeckEauAcier: number = 0;
  totalDeckEauAcierPkmn: number = 0;
  totalDeckEauAcierTrainer: number = 0;
  totalDeckEauAcierEnergy: number = 0;
  totalDeckFeuElek: number = 0;
  totalDeckFeuElekPkmn: number = 0;
  totalDeckFeuElekTrainer: number = 0;
  totalDeckFeuElekEnergy: number = 0;
  totalHolos: number = 0;
  filteredPokemons: Pokemon[] = [];

  pokemonFilter = PokemonFilter;

  pokemonFilters = Object.values(PokemonFilter);

  currentFilter = PokemonFilter.WHATEVER;

  page = 1;

  pageSize = 20;

  filterMetadata = { currentCount: 0 };

  get totalPages(): number {
    return Math.ceil(this.filterMetadata.currentCount / this.pageSize);
  }

  constructor() {
  }

  setFilter(filter: PokemonFilter): void {
    this.currentFilter = filter;
    this.page = 1;
    this.updateFilteredPokemons();
  }

  filterLabel(filter: PokemonFilter): string {
    switch (filter) {
      case PokemonFilter.DECK_EAU_ACIER:
        return 'Steel-Water Deck';
      case PokemonFilter.DECK_FEU_ELEK:
        return 'Gengar Deck';
      default:
        return 'All cards';
    }
  }

  private updateFilteredPokemons(): void {
    if (this.currentFilter === PokemonFilter.WHATEVER) {
      this.filteredPokemons = this.pokemons;
    } else {
      this.filteredPokemons = this.pokemons.filter((pokemon) => pokemon.location === this.currentFilter);
    }
    this.filterMetadata.currentCount = this.filteredPokemons.length;
  }

  ngOnInit(): void {
    pokemonList.map((element: any) => {
      this.pokemons.push(element); this.total += element.qty;
      if (element.location === PokemonFilter.DECK_EAU_ACIER) {
        this.totalDeckEauAcier += element.qty;
        if (element.supertype === "Pokémon") {
          this.totalDeckEauAcierPkmn += element.qty;
        }
        if (element.supertype === "Energy") {
          this.totalDeckEauAcierEnergy += element.qty;
        }
        if (element.supertype === "Trainer") {
          this.totalDeckEauAcierTrainer += element.qty;
        }
      }
      if (element.location === PokemonFilter.DECK_FEU_ELEK) {
        this.totalDeckFeuElek += element.qty;
        if (element.supertype === "Pokémon") {
          this.totalDeckFeuElekPkmn += element.qty;
        }
        if (element.supertype === "Energy") {
          this.totalDeckFeuElekEnergy += element.qty;
        }
        if (element.supertype === "Trainer") {
          this.totalDeckFeuElekTrainer += element.qty;
        }
      }
      if (!!element.holo) {
        this.totalHolos += element.qty;
      }
    });
    this.updateFilteredPokemons();
  }
}
