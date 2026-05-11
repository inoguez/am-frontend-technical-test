# Rick and Morty — Prueba Frontend Aeroméxico

App de exploración de personajes de Rick and Morty con búsqueda, slider con paginación virtual, panel destacado y favoritos persistidos por usuario.

- Diseño: Figma de la prueba (compartido por correo).
- API pública: [`rickmortyapi`](https://github.com/afuh/rick-and-morty-api-node).
- API local: `json-server` sobre [el repo del enunciado](https://github.com/heatxel/amTesting).

## Levantar el proyecto

```bash
npm install
npm run dev:all
```

Next.js en `http://localhost:3000` y `json-server` en `http://localhost:3001`, leyendo y escribiendo `db.json` de la raíz.

Para correr en modo producción local:

```bash
npm run start:all   # build + start + json-server
```

## Correr tests

```bash
npm test           # corrida única
npm run test:watch # modo watch
```

Son 16 tests sobre las piezas con lógica no trivial: `useFavorites`, `useCharactersWindow`, `CharacterCard` y `FavoritesMenu`. No fui por porcentaje sino por riesgo de regresión.

## ¿Qué fue lo que más me gustó de mi desarrollo?

La separación de capas y que la arquitectura se mantiene sola. La estructura sigue Screaming Architecture: `features/characters` y `features/favorites` son self-contained, cada feature expone su API pública vía `index.ts` y `app/` es un wrapper delgado del framework.

Lo no convencional es que las reglas no son convenciones documentadas, son código. ESLint con `import/no-restricted-paths` define zonas que bloquean importar internals de un feature desde otro feature, desde `app/`, desde `store/` o desde `shared/`. Si alguien intenta `import { useFavorites } from '@/features/favorites/hooks/useFavorites'` desde afuera, el build falla. Solo el barrel es público.

Resultado: `CharacterCard` no sabe que existe Redux, ni `json-server`, ni la API pública. Solo consume `useFavorites` y tipos del dominio. Si mañana migramos a TanStack Query o cambiamos el SDK, los componentes no se enteran.

## Si hubiera tenido más tiempo

- Server Components + Suspense para el panel destacado (mejora TTFB y SEO).
- E2E con Playwright para los dos flujos críticos: agregar/quitar favorito y navegar el slider cruzando páginas.
- Pulir la transición de selección con `view-transition-name`.
- i18n.
- Modo offline-first con sync, que es donde Redux Saga sí brillaría (cancelación, reintentos, conflicto online/offline).

## Pain points

### 1. Integrar `rickmortyapi` con RTK Query + un bug upstream que rompía todo

`fetchBaseQuery` espera URLs, no funciones. Como la consigna sugiere usar el SDK, lo envolví con `fakeBaseQuery()` + `queryFn` por endpoint, mapeando el shape del SDK (`{ data, status, statusMessage }`) al formato de RTK Query (`{ data } | { error }`). Una vez encontrado el patrón, escala a cualquier SDK no-REST.

Lo costoso fue que la lib literalmente no funciona en `2.3.0`: en `dist/index.js`, `getResource` concatena el endpoint con un `/` extra (`` `${endpoint}/${qs}` ``) cuando `qs` ya empieza con `/`. El resultado:

- `getCharacters({ page: 1 })` → `…/api/character//?page=1` → 404.
- `getCharacter(1)` → `…/api/character//1` → 404.

Detectarlo me llevó a leer `node_modules` y el repo upstream ([`src/utils/getResource.ts`](https://github.com/afuh/rick-and-morty-api-node/blob/master/src/utils/getResource.ts)). Como la consigna pide usar esa dependencia, no la cambié: apliqué un parche mínimo vía [`patch-package`](https://www.npmjs.com/package/patch-package), versionado en `patches/rickmortyapi+2.3.0.patch`. Es una línea: `` `${e}/${n}` `` → `` `${e}${n}` ``. Se aplica solo con `npm install` gracias al hook `postinstall`.

### 2. El Figma sin un design system definido

Gaps, paddings, sizes, border-radius y colores no siguen una escala consistente, y el layout de mobile y desktop reordena los bloques en vez de compartir estructura. Traducir eso a CSS Modules me obligó a fijar tokens propios (`--accent` en `variables.css`, un único breakpoint en `DESKTOP_QUERY` que leen tanto `useMediaQuery` como los media queries CSS), sostener dos shells (`HomeMobile` y `HomeDesktop`) compartiendo hooks vía Context, y documentar la convención `px` vs `rem`: `px` para medidas que vienen del Figma (imágenes 100/145, shell 1023, popover 300, borders 1/2px), `rem` para spacing, padding, gap y radius. Resultado: unidades predecibles aunque la fuente de verdad sea una captura.

### 3. CSS Modules vs. Tailwind

Personalmente soy más rápido con Tailwind, o incluso Bootstrap para prototipos. CSS Modules sigue siendo la elección correcta para un equipo grande con un design system maduro: scoped, colocalizado, sin runtime. Y por eso lo respeté como pide la prueba. En un proyecto con tokens bien definidos, la fricción de mantener `.module.css` se diluye; sin tokens, el overhead es alto.

## Stack

- Next.js 16 (App Router) + React 19.
- TypeScript estricto.
- CSS Modules (+ `clsx`).
- Redux Toolkit + RTK Query (Toolkit explícitamente permitido por la consigna).
- `rickmortyapi` (SDK oficial, integrado vía `queryFn`).
- `json-server` para persistencia de favoritos.
- Vitest + Testing Library + MSW para tests.
- ESLint con `import/order`, `import/no-restricted-paths` y `eslint-plugin-testing-library`.
- React Compiler activado (`reactCompiler: true` en `next.config.ts`).

## Arquitectura

```
src/
├── app/         Routing de Next (page.tsx delgado)
├── features/
│   ├── characters/   api/ · components/ · hooks/ · types/ · index.ts
│   └── favorites/    api/ · components/ · hooks/ · types/ · index.ts
├── shared/      ui/ · hooks/ · styles/ · test/ · utils/
└── store/       configureStore + hooks tipados
```

### Reglas que la sostienen

1. Cada feature expone su API pública vía `index.ts`.
2. Dependencia: `app → features → shared`. Nunca al revés.
3. Componentes nunca tocan Redux directo; consumen su capa de integración (ej. `useFavorites`).
4. Boundaries ejecutables (no documentadas): `import/no-restricted-paths` bloquea importar internals de un feature desde afuera. Solo el `index.ts` es público.

## Decisiones técnicas

### Estrategia única de fetching: RTK Query

Toda la data, pública (Rick and Morty vía SDK) y propia (favoritos en `json-server`), se consume vía RTK Query. Cache, dedupe, `setupListeners` y prefetch de fábrica. Para el SDK uso `fakeBaseQuery()` + `queryFn`; para `json-server`, `fetchBaseQuery` estándar.

Re-exporto los tipos del SDK (`Character`, `Info`, `CharacterFilter`) en lugar de duplicarlos. Si la API agrega un campo o un nuevo `status`, el código se actualiza al actualizar el paquete.

### `useOptimistic` (React 19) sobre `updateQueryData`

El optimismo de favoritos lo maneja `useOptimistic`, no `onQueryStarted` + `updateQueryData` con rollback manual. El estado optimista vive en render concurrente y RTK Query se ocupa solo del round-trip y de invalidar cache. Una sola fuente de verdad para el optimismo y coherencia automática ante toggles consecutivos rápidos.

### Aislamiento de favoritos por browser (`ownerId`)

`json-server` no tiene auth, así que sin scoping todos los browsers ven los mismos favoritos. Cada browser genera un UUID (`crypto.randomUUID()`) en `localStorage` la primera vez y lo incluye en `GET /favorites?ownerId=…` y en el body del `POST`. El hook `useOwnerId` usa `useSyncExternalStore` para ser SSR-safe sin disparar re-renders innecesarios.

### Forma del record `Favorite`

El `id` del record (json-server) no es el id del personaje:

```ts
type Favorite = {
  id: string; // primary key autogenerada
  ownerId: string; // UUID por browser
  characterId: number; // id en la API pública
  character: Character; // snapshot, evita refetch
};
```

Mezclar ambos `id` (primera versión) rompía el toggle: `isFavorite` comparaba contra el id de json-server y nunca matcheaba, así cada click reagregaba el personaje.

### Slider con paginación virtual y prefetch

`useCharactersWindow` mantiene una ventana local de 2 (mobile) o 4 (desktop) items sobre los 20 que devuelve la API por página. Las flechas mueven la ventana; al llegar al final, bumpea `page`. Cuando quedan ≤2 items por mostrar, `usePrefetch` de RTK Query trae la página siguiente, así la transición no muestra loading.

### `useDeferredValue` en search

El input se actualiza al toque y el query se difiere al valor estable en función de la carga del render. Equivale a un debounce inteligente, sin timeouts ni cleanup.

### Visibilidad de flechas del slider

El Figma sugiere ocultar las flechas al buscar, pero un filtro puede seguir devolviendo más resultados que los visibles. La regla aplicada: ocultar solo cuando el resultado es exactamente uno (`info.count === 1`). Con un único item las flechas estarían disabled en ambos extremos; con dos o más, se conservan.

### Tests con valor, no por porcentaje

| Archivo                        | Qué cubre                                              |
| ------------------------------ | ------------------------------------------------------ |
| `useFavorites.test.tsx`        | toggle optimista, límite de 4, remove por characterId  |
| `useCharactersWindow.test.tsx` | navegación de ventana, cruce de página, prefetch       |
| `CharacterCard.test.tsx`       | render, click → `onSelect`, `aria-pressed`             |
| `FavoritesMenu.test.tsx`       | open/close, listar, eliminar, seleccionar              |

Skipped a propósito: API slices (código generado por RTK Query), skeletons y primitives UI, `useSelectedCharacter` (wrapper fino sobre Next router), `useOwnerId` y `useMediaQuery` (wrappers sobre APIs del browser).

## Notas técnicas

### Parche a `rickmortyapi@2.3.0`

Ver pain point 1. El parche está versionado en `patches/rickmortyapi+2.3.0.patch` y se aplica con `npm install`.

### React Compiler

Activado en `next.config.ts`. Permite escribir `useMemo`/`useCallback` solo cuando hay justificación real, no como defensa preventiva.

## Cumplimiento de la consigna

| Requisito                                     | Estado                                              |
| --------------------------------------------- | --------------------------------------------------- |
| React 19 + Next.js                            | ✅ Next 16 (App Router) + React 19                  |
| TypeScript                                    | ✅ Estricto                                         |
| CSS Modules                                   | ✅ Todos los estilos como `*.module.css`            |
| `json-server` para favoritos                  | ✅ `db.json` + scripts `npm run api` y `dev:all`    |
| Redux Saga / Toolkit / similar para favoritos | ✅ Redux Toolkit + RTK Query                        |
| Mobile mode                                   | ✅ Shell mobile dedicado (`HomeMobile`)             |
| Estados de botones                            | ✅ Hover, active, disabled (incluye límite de favs) |
| Estado Alive / Dead / unknown                 | ✅ `Badge` con variantes de color por status        |
| Pruebas unitarias                             | ✅ 16 tests con Vitest + MSW                        |
| README con instrucciones + reflexiones        | ✅ Este archivo                                     |
