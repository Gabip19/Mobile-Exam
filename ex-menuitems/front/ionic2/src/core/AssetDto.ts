/*

- `id`: intreg pozitiv, ex. `1`
  - `name`: sir de caractere, ex. `a1`
  - `takenBy`: sir de caractere reprezentand numele utilizatorului care a imprumutat asset-ul, ex. `'u1'`
  - `desiredBy`: o lista de utilizatori care doresc sa imprumute asset-ul, ex. `['u2', 'u3']`
 */

export interface AssetDto {
    id: number;
    name: string;
    takenBy: string | null;
    desiredBy: string[];
}