import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokemonCardComponent } from './pokemon-card.component';



@NgModule({
  declarations: [PokemonCardComponent],
  exports: [PokemonCardComponent],
  imports: [
    CommonModule
  ]
})
export class PokemonCardModule { }
