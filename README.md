# Rick and Morty — Prueba Frontend Aeroméxico

## Stack

- Next.js 16 (App Router) + React 19
- TypeScript estricto
- CSS Modules
- Redux Toolkit + RTK Query
- `rickmortyapi` (SDK oficial, integrado vía `queryFn`)
- `json-server` (persistencia de favoritos)
- Vitest + Testing Library + MSW
- ESLint con `import/order`, `no-restricted-imports` y `eslint-plugin-testing-library`

## Levantar el proyecto

```bash
npm install
npm run start:all
```

- `json-server` en `http://localhost:3001`
- Next.js en `http://localhost:3000`

`db.json` en la raíz contiene el estado inicial (lista de favoritos vacía).
`json-server` lee y escribe ese archivo, por lo que los favoritos persisten
entre reinicios.

## Tests

```bash
npm test           # corrida única
npm run test:watch # modo watch
```

## Arquitectura

Implementé **Screaming Architecture**: la estructura grita el dominio
(`characters`, `favorites`), no el framework. `app/` solo contiene routing, toda la lógica vive en `features/`, framework-agnostic.

```
src/
├── app/         Next.js routing (page.tsx de pocas líneas)
├── features/
│   ├── characters/    Self-contained. Ver features/characters/README.md
│   └── favorites/     Self-contained. Ver features/favorites/README.md
├── shared/{ui, styles, lib, test}
└── store/
```

### Reglas que la sostienen

1. Cada feature expone su API pública vía `index.ts` (barrel).
2. Dependencia: `app → features → shared`. Nunca al revés.
3. Componentes nunca tocan Redux directo: consumen su capa de integración EJ. `useFavorites`.
4. **Boundaries entre features ejecutables** (no documentados): la regla
   ESLint `import/no-restricted-paths` define zonas que bloquean importar
   internals de un feature desde otro feature, desde `app/`, desde
   `store/` o desde `shared/`. Solo se permite el `index.ts`. Los
   internals de un feature siguen siendo libres de importarse entre sí.
   Si alguien intenta `import { X } from '@/features/favorites/hooks/X'`
   desde afuera, el lint falla — la arquitectura se mantiene sola.

## Decisiones de arquitectura

### Estrategia única de fetching: RTK Query

Toda la data — pública (Rick and Morty vía SDK) y propia (favoritos en
`json-server`) — se consume vía RTK Query. Evalué tres alternativas:

1. **RTK Query para todo** (elegida).
2. Server components con `fetch` para datos read-only + RTK Query para
   interactivos. Aprovecha mejor SSR pero introduce dos modelos mentales para
   el mismo dominio y complica la hidratación.
3. API routes de Next como BFF. Aislaría al frontend de las APIs externas,
   pero no aporta beneficio claro: la API pública no requiere secrets ni
   reformateo, y `json-server` es lo que el examen pide consumir directamente.

Elegí (1) por consistencia. Cache, deduplicación y `setupListeners` cubren
todos los casos.

### SDK `rickmortyapi` integrado vía `queryFn`

Las funciones del SDK (`getCharacter`, `getCharacters`) se envuelven en
`queryFn` con `fakeBaseQuery()`. Combina lo mejor de ambos: las funciones
tipadas y mantenidas del SDK con el cache, dedupe e hooks generados de
RTK Query.

Re-exporto los tipos del SDK (`Character`, `Info`, `CharacterFilter`) en
lugar de duplicarlos. Si la API agrega un campo o un nuevo `status`, el
código se actualiza al actualizar el paquete.

### `json-server`: ¿qué guarda?

Estado del usuario (favoritos), no mirror del catálogo. Una fuente de verdad
por dominio.

### Aislamiento de favoritos por browser (`ownerId`)

`json-server` no tiene auth, así que sin scoping todos los browsers
comparten la misma colección de favoritos. Para evitarlo, cada browser
genera un UUID (`crypto.randomUUID()`) en `localStorage` la primera vez
y lo incluye:

- en `GET /favorites?ownerId=...` para filtrar (json-server soporta
  filtros por query param de forma nativa).
- en el body de `POST /favorites` para etiquetar el record.

El hook `useOwnerId` encapsula la lectura/generación y es SSR-safe
(devuelve `null` en el primer render y se hidrata al montar). Mientras
no esté disponible, `useGetFavoritesQuery` se pausa con `skip`.

### Forma del record `Favorite`

El `id` del record en json-server (string autogenerado) **no es** el id
del personaje. El record guarda ambos por separado:

```ts
type Favorite = {
  id: string; // primary key de json-server
  ownerId: string; // UUID por browser
  characterId: number; // id del personaje en la API pública
  character: Character; // snapshot completo (evita refetch al renderizar)
};
```

### `useOptimistic` (React 19) sobre `updateQueryData`

El hook nativo maneja el optimismo en render concurrente, con coherencia
automática ante toggles consecutivos rápidos. RTK Query solo se ocupa del
round-trip y de invalidar cache al confirmar la mutación.

### Visibilidad de las flechas del slider

Se solicita en el documento de Figma ocultar las flechas del slider al buscar, pero hay
casos en los que la búsqueda todavía devuelve más resultados que los
que entran en la ventana visible (2 mobile / 4 desktop), y ahí las
flechas siguen siendo necesarias para recorrer.

La regla que apliqué es más estricta y se sostiene sola: **las flechas
solo se ocultan cuando el resultado es exactamente uno** (`info.count
=== 1`). Con un único item no hay nada que paginar y las flechas
quedarían `disabled` en ambos extremos, ocupando espacio sin función;
con dos o más, se mantienen porque la ventana sí necesita avanzar
(aunque haya una sola página de 20).

Tomo el total de la respuesta de la API (`info.count`), no
`results.length`, porque el primero refleja el total global del filtro
y no depende de la página actual.

### `useDeferredValue` en search

El input responde instantáneamente; el query se difiere al valor estable.
Mejor UX que un debounce manual, sin timeouts ni cleanup.

### `app/` separado de `features/`

`app/` es del framework. Mantener features afuera permite migrar de framework
sin tocar dominio. Cada `page.tsx` es de 3 líneas.

## Notas técnicas

### Parche a `rickmortyapi@2.3.0`

La librería `rickmortyapi` tiene un bug en su
build publicado: en `dist/index.js`, `getResource` concatena el endpoint y el
query con un `/` extra (`` `${endpoint}/${qs}` ``), pero `qs` ya empieza con
`/`. Esto genera URLs malformadas con doble slash:

- `getCharacters({ page: 1 })` → `https://rickandmortyapi.com/api/character//?page=1`
- `getCharacter(1)` → `https://rickandmortyapi.com/api/character//1`

Con la lib sin parchear, **todas las requests devuelven `404`** (la API no
normaliza el doble slash). Origen del bug en el repo upstream:
[`src/utils/getResource.ts`](https://github.com/afuh/rick-and-morty-api-node/blob/master/src/utils/getResource.ts).

Como se solicita usar esta dependencia, apliqué un parche mínimo vía
[`patch-package`](https://www.npmjs.com/package/patch-package), versionado en
`patches/rickmortyapi+2.3.0.patch`. El cambio es de una sola línea:
`` `${e}/${n}` `` → `` `${e}${n}` ``. Se aplica automáticamente con
`npm install` gracias al hook `postinstall`.

## ¿Qué fue lo que más me gustó de mi desarrollo?

La separación de capas. `CharacterCard` no sabe que existe Redux, ni
`json-server`, ni la API pública. Solo consume `useFavorites` y tipos del
dominio. Las reglas arquitectónicas no son convenciones documentadas sino
ESLint rules ejecutables — si alguien intenta importar internals de un
feature, el build falla. La arquitectura se mantiene sola.

## Si hubiera tenido más tiempo

- Server components + Suspense para el detalle, eliminando JS extra en la
  primera carga (mejor TTFB y SEO).
- E2E con Playwright para flujos críticos.
- Storybook para componentes base.
- Modo offline-first con sync (caso real para Saga: cancelación, reintentos).
- `createEntityAdapter` si la lista de favoritos creciera.
- Internacionalización (es/en).
- Animaciones con View Transitions API entre lista y detalle.

## Pain point

Integrar el SDK `rickmortyapi` con RTK Query no es directo: `fetchBaseQuery`
espera URLs, no funciones. La solución fue usar `fakeBaseQuery()` + `queryFn`
por endpoint, mapeando el shape del SDK
(`{ data, status, statusMessage }`) al formato de RTK Query
(`{ data } | { error }`). Adicionalmente, los tipos `Info<T>` del SDK tienen
`info` y `results` opcionales (porque la API puede devolver error sin esos
campos), lo que obliga a guardas defensivas en componentes. Una vez encontrado
el patrón, escala a cualquier SDK no-REST.

A esto se sumó el bug del doble slash en la lib publicada (ver
[Notas técnicas](#notas-técnicas)): la lib literalmente no funciona en
v2.3.0 contra la API real. Detectarlo requirió leer `node_modules` y el
repo upstream, y resolverlo sin abandonar la dependencia (consigna) llevó
a `patch-package`.
