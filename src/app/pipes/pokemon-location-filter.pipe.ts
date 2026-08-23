import { Pipe, PipeTransform } from '@angular/core';
import { Pokemon } from '../model/pokemon';
import { PokemonFilter } from '../model/pokemon-filter';

@Pipe({
  name: 'pokemonLocationFilter'
})
export class PokemonLocationFilterPipe implements PipeTransform {

  transform(items: Pokemon[], pokemonFilter: string, filterMetadata: any): Pokemon[] {
    let filtered;
    if (pokemonFilter === PokemonFilter.WHATEVER) {
      filterMetadata.currentCount = items.length;
      filtered = items;
    } else if (pokemonFilter === PokemonFilter.HOLO) {
      const filteredItems = items.filter((pokemon) => !!pokemon?.holo);
      filterMetadata.currentCount = filteredItems.length;
      filtered = filteredItems;
    } else {
      const filteredItems = items.filter((pokemon) => pokemon.location === pokemonFilter);
      filterMetadata.currentCount = filteredItems.length;
      filtered = filteredItems;
    }
    return filtered;
  }

}
