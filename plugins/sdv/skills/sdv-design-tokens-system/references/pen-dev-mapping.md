# pen.dev Mapping

## Exploration before persistence

Explore on the canvas first. While the user compares alternatives, provisional values may be applied directly to a direction board or to representative components. Label the direction clearly as `Exploration` or `Provisional`. Do not write canonical token JSON or replace shared variables during this phase.

After the user explicitly approves a direction, map the approved values into variables, aliases, themes and components. Persistence is a separate operation from exploration.

## Source of truth and pipeline

`tokens.json` is canonical. The Pencil variables, `pencil-mapping.json` and the Pencil payload are derived from it and are never edited by hand:

```text
tokens.json ──scripts/tokens_to_pencil.py──▶ pencil-variables.json (SetVariables payload)
                                         ├─▶ pencil-mapping.json   (variables, counts, themes, transforms, unsupported, library_canvas)
                                         └─▶ FNV-1a checksum per group + total
payload ──Pencil MCP SetVariables──▶ design-system.lib.pen variables ──▶ token canvas boards 00–08
```

Validate `tokens.json` with `scripts/validate_tokens.py` before generating. After `SetVariables`, prove the live document equals the payload with the checksum below.

## Type mapping

| Canonical token type | pen.dev variable type | Typical properties |
|---|---|---|
| `color` | `color` | fills, strokes, text colour, effect colours |
| `number` | `number` | padding, gap, cornerRadius, fontSize, letterSpacing, lineHeight, opacity, shadow offset/blur |
| `string` | `string` | font family, font weight, content |
| `boolean` | `boolean` | visibility and feature toggles |
| composite (`typography`, `shadow`, `border`, `gradient`, …) | none | split into scalar tokens and record under `unsupported` |

## Pencil representation rules

Apply these in `tokens_to_pencil.py`, and when binding variables on the canvas.

1. **Names.** A Pencil variable name is the token path with `/` (`color.semantic.text.primary` → `color/semantic/text/primary`). A reference in a property is `"$color/semantic/text/primary"`. An alias token becomes a `$a/b/c` reference to the target variable, so the alias chain is kept inside Pencil.
2. **Modes.** The default mode (the first value on the axis in the root `$extensions["dev.pen.themes"]`) lives in `$value`. Other modes live in the token's `$extensions["dev.pen.modes"].<mode>`. In Pencil, a token with any mode value becomes `[{value, theme:{mode:"light"}}, {value, theme:{mode:"dark"}}]`. Mode-invariant tokens stay scalar. One theme axis is supported; add another axis (such as density) only with an explicit mapping decision.
3. **Opacity is percent in Pencil.** An opacity variable stores `40` for token `0.4`. Literal node `opacity` stays 0–1. Record this under `transforms` in the mapping (`opacity/*`).
4. **Size cannot bind.** `width`/`height` bound to a number variable resolve to 0. Apply spacing tokens through `padding` and `gap` only, and draw live spacing specimens as an empty frame with padding. Record this under `unsupported.size-binding`. Component heights (such as a 40 px input) are documented, not tokenized.
5. **Composite typography.** Split into `font.size.<style>`, `font.weight.<w>`, `font.letter-spacing.<style>` and `font.line-height.<name>`, and bind each property separately. Record under `unsupported.typography`.
6. **Composite shadow.** Split into `elevation.N.offset-y` and `elevation.N.blur` (number), plus a themed `color.semantic.elevation.N.color`. Bind as `effect: {type:"shadow", offset:{x:0, y:"$elevation/N/offset-y"}, blur:"$elevation/N/blur", color:"$color/semantic/elevation/N/color"}`. Record under `unsupported.shadow`.
7. **Dark tints use alpha primitives.** Dark status fills, focus glows and shadows use `#RRGGBBAA` primitives (`color.primitive.alpha.<hue>-<step>-a<pct>`), never node opacity. Opacity changes with whatever is underneath, and it cannot be themed per token.
8. **`SetVariables` merges.** A removed token stays in Pencil until the full set is replaced. Compare the previous mapping (the generator prints `REMOVED`) and the live variables against the new payload. Then:
   - Run the reference scan R0 in [pencil-canvas-builders.md](pencil-canvas-builders.md) to find nodes bound to removed variables.
   - Call `SetVariables(payload, true)`. **Replacing inlines removed variables:** every node bound to a removed variable silently receives the resolved raw value. Rebind those nodes to the new names immediately, then run the raw-colour scan.
   - Live variables that are not in `tokens.json` are drift. Report them before replacing; never promote them silently.
9. **Order.** `GetVariables()` does not preserve `tokens.json` order. Canvas builders take an explicit order.

## Themes

Map Figma-style modes to pen.dev theme axes:

```json
{ "$extensions": { "dev.pen.themes": { "mode": ["light", "dark"] } } }
```

The first value on an axis is the default. Every used combination needs a meaningful value or a deliberate inherited value. Apply a theme to the smallest frame that owns the context: on the token canvas, boards carry `theme: {mode: "light"}` and every dark preview is a frame with `theme: {mode: "dark"}`.

## Checksum: live Pencil variables ⇄ repository payload

`tokens_to_pencil.py` prints an FNV-1a checksum per group and in total. Compute the same checksum in the open document with this `execute` snippet and compare the numbers. Equal totals prove that the live variables match the payload value for value, including per-mode aliases.

```js
const V=GetVariables().variables;
const num=n=>{n=Number(n);return Number.isInteger(n)?String(n):String(n)};
const cv=v=>Array.isArray(v)?v.map(x=>Object.keys(x.theme).sort().map(k=>x.theme[k]).join(":")+":"+cv(x.value)).sort().join(","):typeof v==="boolean"?String(v):typeof v==="number"?num(v):String(v);
const fnv=s=>{let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0}return h.toString(16).padStart(8,"0")};
const grp=k=>{const p=k.split("/");return ["color","component"].includes(p[0])?p.slice(0,2).join("/"):p[0]};
const keys=Object.keys(V).sort();const G={};
const lines=keys.map(k=>{const l=`${k}|${V[k].type}|${cv(V[k].value)}`;(G[grp(k)]??=[]).push(l);return l});
Print("count",keys.length,"total",fnv(lines.join("\n")));for(const g of Object.keys(G).sort())Print(g,G[g].length,fnv(G[g].join("\n")));
```

Notes:

- Python sorts keys by code point and JS `sort()` by UTF-16 unit. These agree for ASCII token names; keep token names ASCII.
- `tokens_to_pencil.py` rounds percent-transformed values to 4 decimals, so `0.06 × 100` is stored as `6`.
- If only a group differs, compare that group's variables with the payload to find the drift.

## Library canvas scan

Run each part in its own `execute`, after inserts have settled. `problems` read right after a large insert can be stale, so re-run the scan in a separate call before fixing anything.

```js
const V=GetVariables().variables;
const ALLOW=new Set(["#FFFFFF","#18181B","#E4E4E7","#E5487F","#E5487F2E"]);
let nodes=0,refs=0;const broken={},rawc={},themes={};let reusable=0,inst=0;
Get((n,c)=>{nodes++;if(n.reusable)reusable++;if(n.type==="ref")inst++;if(n.theme?.mode)themes[n.theme.mode]=(themes[n.theme.mode]||0)+1;
 let a=c,dont=false;while(a){if(/^Don't/.test(a.node.name||""))dont=true;a=a.parentCtx}
 for(const [k,v] of Object.entries(n)){if(["children","content","name"].includes(k))continue;const s=JSON.stringify(v);
  for(const m of s.matchAll(/"\$([^"]+)"/g)){refs++;if(!V[m[1]])(broken[m[1]]??=[]).push(n.id)}
  for(const m of s.matchAll(/"(#[0-9A-Fa-f]{3,8})"/g)){const h=m[1].toUpperCase();if(!ALLOW.has(h)&&!dont)(rawc[h]??=[]).push(n.id)}}
 return undefined});
Print("nodes",nodes,"refs",refs,"broken",JSON.stringify(broken));Print("raw",JSON.stringify(rawc));Print("themes",JSON.stringify(themes),"reusable",reusable,"instances",inst);
```

```js
let k=0;Get((n,c)=>{if(!c.problems)return undefined;let a=c.parentCtx,clipped=false;while(a){if(a.node.clip===true){clipped=true;break}a=a.parentCtx}
 if(!clipped){k++;Print(n.id,n.name,"<",c.parentCtx?.node.name,":",c.problems)}return undefined});Print("unexpected problems",k);
```

How to read the results:

- **Broken references** must be 0.
- **Raw colours** outside the allowlist fail, unless they sit inside a deliberate Don't example.
- **Layout problems** fail unless the node is clipped by a `clip: true` ancestor. That covers intentional clipping such as opacity tints and toast accent bars.
- **Light/dark previews:** there must be dark-themed frames on 02, 05 and 06. Screenshot them and check that the dark values resolve.

## Disk-save gate

MCP edits live in the open Pen document until the user saves; Pen does not autosave. After persisting variables or building boards:

1. Record the library's size and mtime before the work (`stat -f '%z %m' <file>`, or `ls -la`).
2. Ask the user to press **⌘S** in Pen for each edited file.
3. Re-check size and mtime. If the file is unchanged, or still the 96-byte template stub, the work is **not persisted**. Do not report `PERSISTED`, do not write `PERSISTED <date>` into repository artifacts, and do not claim the library is importable.

Never read, `cat` or `grep` a `.pen` file to check its content. Size and mtime are the only disk-level evidence; inspect content only through Pencil MCP.

## Library identity (`fileToken`)

A `.pen` file carries a Pen-managed `fileToken`. The bundled blank stubs each had their own token (the library and consumer stubs differ), and a copied file keeps the token of its source. What was observed:

- Two copies with the same token opened side by side stay independent: edits made through MCP with an explicit `filePath` affect only that file.
- Imports are declared per consumer as `imports: {<alias>: "<relative path to .lib.pen>"}`, so a consumer resolves its library by relative path.
- Imports cannot be written through MCP (`document` is not an updatable node). A consumer imports the library through the Pen UI.

Rules:

1. Never hand-edit or regenerate `fileToken`, and never write a `.pen` file with a text editor.
2. Copy the library template into each project unchanged. Its identity comes from its path and the consumers' relative `imports`. Two projects that both come from the template, or a template copied from a project, may share a token. That is safe as long as each consumer imports by relative path within its own project.
3. Before a library is shared between projects, or published through a Pen account or team feature, have the user create it with **Save As…** in Pen, which writes a new document. Re-verify imports afterwards.
4. If Pen ever links a consumer to the wrong library, report `broken-library-link` with both paths and have the user re-import through the Pen UI.

## Interactive MCP workflow

Open a document with `open -a Pen <absolute-path-to-file.pen>` before using MCP. Pass an explicit `filePath` on every `execute` call whenever more than one document is open. The active editor can be another project's file.

While the user is exploring:

1. Read the app and document state before editing.
2. Read existing variables and component structure as context, not as permission to overwrite them.
3. Create or edit a provisional exploration area and representative components.
4. Apply the smallest visual change that answers the user's question.
5. Read the resulting structure again, and capture a screenshot when comparison matters.

When the user approves persistence, follow `/sdv:save-design-system`. Never report success from the requested operation alone: inspect the resulting document, then check the disk-save gate.

## Desktop and MCP workflow

The `pen` CLI is not used for design content or synchronization. Ordinary terminal commands are limited to opening Pen, copying templates, running the token scripts, checking file size/mtime, validation and packaging.

If a token cannot be represented in Pencil, keep the approved repository token and report the mapping gap. Never replace it with an invented or silently simplified value.

## Components

Build shared components as `reusable: true` frames bound to `component/*` variables, covering colour, padding/gap and radius. Document each one with [assets/templates/component-spec.md](../assets/templates/component-spec.md):

- Use variants for meaningful state, size or intent differences.
- Use component properties for controlled content or visibility.
- Use slots for replaceable child content.

Prefer instances over copied geometry. Record each component's name, `.pen` file, node ID, supported properties and token dependencies in `pencil-mapping.json › components` and on board 06 (or a components board).
