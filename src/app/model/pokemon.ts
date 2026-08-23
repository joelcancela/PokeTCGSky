export class Pokemon {
  id: string;
  number: string;
  name: string;
  qty: number;
  holo?: boolean;
  rarity: string;
  location: string;
  supertype: string;
  subtypes: string[];
  types: string[];
  set: object;
  images: { [key: string]: string }
}
