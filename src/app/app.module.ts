import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PokemonListComponent } from './components/pokemon-list/pokemon-list.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PokemonLocationFilterPipe } from './pipes/pokemon-location-filter.pipe';
import { FormsModule } from '@angular/forms';
import { PokemonCardComponent } from './components/pokemon-card/pokemon-card.component';
import { PokemonCardModule } from './components/pokemon-card/pokemon-card.module';

@NgModule({
  declarations: [
    AppComponent,
    PokemonListComponent,
    PokemonLocationFilterPipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    FormsModule,
    PokemonCardModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
