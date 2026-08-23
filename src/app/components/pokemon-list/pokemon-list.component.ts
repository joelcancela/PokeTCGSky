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

  pokemonFilter = PokemonFilter;

  pokemonFilters = Object.values(PokemonFilter);

  currentFilter = PokemonFilter.WHATEVER;

  page = 1;

  pageSize = 20;

  filterMetadata = { currentCount: 0 };

  constructor() {
  }

  ngOnInit(): void {
    pokemonList.map((element: any) => {
      this.pokemons.push(element); this.total += element.qty;
      if (element.location === "Deck EauAcier") {
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
      if (element.location === "Deck FeuElek") {
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
    this.filterMetadata.currentCount = pokemonList.length;
  }
}
