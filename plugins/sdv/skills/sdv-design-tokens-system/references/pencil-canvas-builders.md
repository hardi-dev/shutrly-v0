# Pencil token-canvas builders

The token canvas is the nine documentation boards of `design-system.lib.pen`. This file holds the Pencil MCP `execute` snippets that build and refresh it. The snippets are generalized from a real project run: they read the live variables, so they work for any token set that follows the layer and naming rules in [pen-dev-mapping.md](pen-dev-mapping.md).

| Board | Content | Built from |
|---|---|---|
| `00 — Cover` | System name, status chips, token counts, board index, how-to-read | counts from `GetVariables()` |
| `01 — Color · primitives` | One ramp per hue, plus alpha swatches over light and dark halves | `color/primitive/*` |
| `02 — Color · semantic` | Token · light preview · dark preview · alias, with contrast badges on text rows | `color/semantic/*` |
| `03 — Typography` | Family specimen, weights, style rows bound to size/weight/tracking/line-height | `font/*` |
| `04 — Spacing · radius · opacity` | Live spacing blocks, radius squares, opacity strips | `space/*`, `radius/*`, `opacity/*` |
| `05 — Elevation` | Flat, then shadow levels, in a light row and a dark row | `elevation/*` + `color/semantic/elevation/*` |
| `06 — Component tokens` | Per-component token table: light/dark swatch or px value, plus alias | `component/*` |
| `07 — Usage rules` | Decision path + Do/Don't rule cards | `token-usage.md` §1–3, §5–8 |
| `08 — Spacing rules` | Principles, inset specimens, stack/inline ladders, layout map, Do/Don't | `token-usage.md` §4 |

Board x positions: 0 · 1540 · 3080 · 4620 · 6160 · 7700 · 9240 · 10780 · 12320 (each board is 1440 wide, with a 100 gap).

## Two ways to get a token canvas

1. **Refresh the template canvas (default).** `assets/templates/design-system-library.lib.pen` already contains boards 00–08 built with the Forma demo tokens. After copying it into a project and loading the project's variables, *refresh* it: rebuild 01 and 06, prune or add rows on 02–05, rebind anything that pointed at a removed variable, and regenerate the static labels. This keeps the tested layout.
2. **Build from scratch.** Use the `board()` helper and the builders below for any board you cannot refresh, such as a project that deleted a board.

Either way, start only after `SetVariables` has loaded the project payload from `tokens_to_pencil.py`.

## Conventions

- Every visual binds to a variable (`$color/semantic/...`, `$space/...`, `$radius/...`, `$component/...`).
- Raw colours are allowed only as documentation backdrops and annotations. The allowlist is `#FFFFFF` and `#18181B` (alpha swatch halves), `#FFFFFF` and `#E4E4E7` (opacity checkerboard), and the redline `#E5487F` / `#E5487F2E`. Deliberate "hard-coded" Don't examples on boards 07/08 are also allowed; name their Don't column so the verify scan can recognize them.
- Boards carry `theme: {mode: "light"}`. A dark preview is a frame with `theme: {mode: "dark"}`, so the same variable resolves to its dark value inside it.
- Pencil limits:
  - `width`/`height` cannot bind to number variables. A live spacing block uses padding on an empty frame instead.
  - Opacity variables are percent (40 = 0.4), while literal node `opacity` is 0–1.
  - Composite type and shadow are bound per scalar.
- **Order comes from `tokens.json`, not `GetVariables()`.** Pencil does not keep insertion order after a replace, so pass an explicit hue, group or component order (below) or `Move` sections afterwards.
- Mark a board `placeholder: true` while editing it, then `false` when it is done.
- **Every number or hex written into a text node is static.** This covers hex labels, contrast ratios, token counts, `px` values, `y 4 · blur 16`, radius labels and group counts. Pencil does not update them when variables change. Run the refresh passes below after *every* `SetVariables`.
- **Replacing variables inlines removed ones.** `SetVariables(payload, true)` silently writes the last resolved value into every node that was bound to a removed variable, so those nodes become hard-coded, with no error. Before replacing, list every `$` reference whose name is missing from the new payload, then rebind those nodes to the new names afterwards. The post-refresh raw-colour scan catches any you missed.

## Shared helpers (paste at the top of each snippet)

```js
const F="$font/family/base",MONO="IBM Plex Mono",S="$color/semantic/",C="$component/";
const T=(p,o)=>Insert(p,{type:"text",fontFamily:F,fill:S+"text/primary",lineHeight:1.35,...o});
const M=(p,c,o={})=>T(p,{content:c,fontFamily:MONO,fontSize:11,fill:S+"text/muted",...o});
const V=GetVariables().variables;
const raw=(n,mode)=>{let v=V[n].value;if(Array.isArray(v))v=(v.find(x=>x.theme.mode===mode)||v[0]).value;return v;};
const res=(n,mode)=>{let v=raw(n,mode);while(typeof v==="string"&&v.startsWith("$"))v=raw(v.slice(1),mode);return v;};
const board=(name,x,over,title,desc)=>{
 const b=Insert(document,{type:"frame",name,x,y:0,width:1440,layout:"vertical",gap:40,padding:64,fill:S+"surface/panel",theme:{mode:"light"},placeholder:true});
 const h=Insert(b,{type:"frame",name:"Header",width:"fill_container",layout:"vertical",gap:12,padding:[0,0,32,0],stroke:S+"border/default",strokeWidth:{bottom:1}});
 M(h,over,{fontSize:12,letterSpacing:0.6});
 T(h,{name:"Title",content:title,fontSize:44,fontWeight:"700",letterSpacing:-1.2});
 T(h,{name:"Description",content:desc,fontSize:16,fill:S+"text/secondary",textGrowth:"fixed-width",width:880,lineHeight:1.5});
 return {b,h};
};
// contrast (WCAG 2.x), compositing alpha foregrounds/backgrounds over the panel
const hx=h=>{h=h.replace("#","");return {r:parseInt(h.slice(0,2),16),g:parseInt(h.slice(2,4),16),b:parseInt(h.slice(4,6),16),a:h.length>6?parseInt(h.slice(6,8),16)/255:1};};
const over=(fg,bg)=>{const f=hx(fg),b=hx(bg);return {r:f.r*f.a+b.r*(1-f.a),g:f.g*f.a+b.g*(1-f.a),b:f.b*f.a+b.b*(1-f.a)};};
const toh=c=>"#"+[c.r,c.g,c.b].map(x=>Math.round(x).toString(16).padStart(2,"0")).join("");
const lum=c=>{const t=x=>{x/=255;return x<=0.03928?x/12.92:Math.pow((x+0.055)/1.055,2.4)};return 0.2126*t(c.r)+0.7152*t(c.g)+0.0722*t(c.b);};
const cr=(fg,bg,base)=>{const B=over(bg,base);const Fc=over(fg,toh(B));const a=lum(Fc),b=lum(B);return (Math.max(a,b)+0.05)/(Math.min(a,b)+0.05);};
```

`execute` snippets must not contain comments. Strip the `//` lines before running.

## Refresh passes (after every `SetVariables`)

### R0 — Find references that the new payload removes (run *before* `SetVariables(..., true)`)

```js
const NEW=new Set([/* Object.keys(payload) */]);const out={};
Get(n=>{for(const [k,v] of Object.entries(n)){if(k==="children")continue;for(const m of JSON.stringify(v).matchAll(/"\$([^"]+)"/g))if(!NEW.has(m[1]))(out[m[1]]??=[]).push(n.id+"."+k)}return undefined});
for(const [r,l] of Object.entries(out))Print(r,"=>",l.join(" "));
```

Decide a replacement for each removed name (for example `chip/stage/*` → `chip/status/*`, `status/*/border` → `status/*/fg`). After `SetVariables`, `Update` those node properties with the new `$` references. Node IDs survive a file copy, so this list can also be read from the source file the template was copied from.

### R1 — Rebuild 01 (primitives) and 06 (component tokens)

Delete the board's children except `Header`, then run the 01 or 06 builder with the board id as the parent instead of calling `board()`. Pass an explicit order:

```js
const HUES=["neutral","brand","accent","info","warning","danger"];
const ORDER=["button","nav","chip","metric","calendar","toast","input","checkbox","switch","segmented","table","panel"];
```

In both lists, replace the names with the project's hues and components, in `tokens.json` order.

### R2 — Prune and refresh 02 (semantic)

Rows are frames named after the token path without the `color/semantic/` prefix (for example `text/primary`), grouped under `Group <Name>` frames whose `Group title` ends in a count. Delete the rows whose token no longer exists. Add rows for new tokens by cloning a sibling of the same kind (R4). Then refresh every row:

```js
const D={/* "text/primary":"Headings, body, values", ... from tokens.json $description */};
const b="<board-02-id>";const counts={};
Get(b,(n,c)=>{if(c.depth!==2||n.type!=="frame"||!V["color/semantic/"+n.name])return undefined;
 const tok=n.name,full="color/semantic/"+tok,row=Get(n.id);const g=c.parentCtx.node.id;counts[g]=(counts[g]||0)+1;
 const find=(x,nm)=>{if(x.name===nm)return x;for(const ch of x.children||[]){const r=find(ch,nm);if(r)return r}};
 Update(find(row,"Name").id,{content:tok.replaceAll("/",".")});Update(find(row,"Usage").id,{content:D[tok]||""});
 for(const ch of row.children){const m=ch.name==="light preview"?"light":ch.name==="dark preview"?"dark":null;if(!m)continue;
  Update(find(ch,"Hex").id,{content:res(full,m)});
  const cb=find(ch,"Contrast");if(cb){const sm=find(ch,"Sample");
   const bg=typeof sm.fill==="string"&&sm.fill.startsWith("$")?sm.fill.slice(1):"color/semantic/surface/panel";
   const r=cr(res(full,m),res(bg,m),res("color/semantic/surface/panel",m));
   const k=r>=4.5?["success","AA"]:r>=3?["warning","AA-lg"]:["danger","FAIL"];
   Update(cb.id,{fill:S+"status/"+k[0]+"/bg"});Update(find(cb,"Ratio").id,{content:r.toFixed(2)+" "+k[1],fill:S+"status/"+k[0]+"/fg"});}}
 const la=raw(full,"light"),da=raw(full,"dark");
 Update(find(row,"Light alias").id,{content:"light → "+String(la).replace("$color/primitive/","")});
 Update(find(row,"Dark alias").id,{content:"dark  → "+String(da).replace("$color/primitive/","")+(la===da?"  (same)":"")});
 return undefined});
Get(b,(n,c)=>{if(c.depth===1&&counts[n.id]){const t=(n.children||[]).find(x=>x.name==="Group title");if(t)Update(t.id,{content:t.content.replace(/\d+$/,String(counts[n.id]))})}return undefined});
```

Print the ratios and copy failures other than `text.disabled` into the verification report.

### R3 — Regenerate static labels on 00, 03, 04, 05, 08

- 00: token count (`Object.keys(V).length + " tokens"`), per-board index lines (primitive, semantic and component counts; radius and opacity counts), the family name, and the status chip (`PERSISTED <date>`, or `DEMO ONLY — replace on persistence` in the template).
- 04: every value text that follows a `space/*`, `radius/*` or `opacity/*` label. Opacity labels show `V[...].value / 100`, because the variable is percent.
- 05: `y <offset-y> · blur <blur>` for each level.
- 03 and 07/08: sample copy is project content. Replace it with product-appropriate text in the project's language.
- 08: redline captions that print values (`chip.padding · 2/8`, `metric.tile.padding · 16`, ...).

```js
Get("<board-04-id>",(x,c)=>{if(x.type!=="text")return undefined;const m=/^(space|radius|opacity)\/(.+)$/.exec(x.content||"");if(!m)return undefined;
 const sib=c.parentCtx.node.children||[];const nx=sib[sib.findIndex(s=>s.id===x.id)+1];if(!nx||nx.type!=="text")return undefined;
 const v=V[m[1]+"/"+m[2]].value;Update(nx.id,{content:m[1]==="space"?v+" px":m[1]==="radius"?v+" · <use>":(v/100)+" · <use>"});return undefined});
```

### R4 — Add a row for a new token (clone and rebind)

```js
const cloneRow=(rowId,parentId,from,to)=>{const src=Get(rowId,{depth:0});
 const id=Copy(rowId,parentId,{name:src.name.replace(from,to)});
 const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");const re=new RegExp('"\\$([^"]*)'+esc(from)+'"',"g");
 Get(id,n=>{const u={};for(const [k,v] of Object.entries(n)){if(["children","id","type"].includes(k))continue;
  const s=JSON.stringify(v);if(s.includes("$")&&s.includes(from))u[k]=JSON.parse(s.replace(re,(m,p)=>'"$'+p+to+'"'))}
  if(Object.keys(u).length)Update(n.id,u);return undefined});return id;};
```

Clone a row of the same preview kind (fill, stroke, text or shadow), then run R2 or R3 to rewrite its labels.

### R5 — Checks

Run the canvas scan from [pen-dev-mapping.md](pen-dev-mapping.md#library-canvas-scan) in a **separate** `execute`, then screenshot each board. `problems` read in the same call as a large insert can be stale.

## Builders

### 00 — Cover

```js
const {b,h}=board("00 — Cover",0,"<SYSTEM NAME> DESIGN SYSTEM  ·  LIBRARY","<Direction name>","Foundations and components for <product>. Every swatch, scale and preview on these boards is bound to a live Pencil variable.");
const meta=Insert(h,{type:"frame",name:"Meta",gap:8,padding:[8,0,0,0]});
for(const [t,ok] of [["PERSISTED <date>",1],[Object.keys(V).length+" tokens",0],["mode: light · dark",0],[res("font/family/base","light"),0]]){
 const c=Insert(meta,{type:"frame",name:"Meta chip",cornerRadius:999,padding:[4,10],fill:ok?S+"status/success/bg":S+"surface/sunken"});
 T(c,{name:"Text",content:t,fontSize:12,fontWeight:"600",fill:ok?S+"status/success/fg":S+"text/secondary"});}
const idx=Insert(b,{type:"frame",name:"Board index",width:"fill_container",gap:16});
for(const [n,t,d] of [["01","Color · primitives","raw values"],["02","Color · semantic","purpose tokens, light + dark"],["03","Typography","family, weights, scale"],["04","Spacing · radius · opacity","scales"],["05","Elevation","flat + shadow levels"],["06","Component tokens","component-scoped aliases"],["07","Usage rules","do / don't"],["08","Spacing rules","padding, gap, layout"]]){
 const c=Insert(idx,{type:"frame",name:"Index "+n,width:"fill_container",layout:"vertical",gap:6,padding:20,cornerRadius:"$radius/md",stroke:S+"border/default",strokeWidth:1});
 T(c,{name:"Num",content:n,fontFamily:MONO,fontSize:12,fill:S+"text/muted"});
 T(c,{name:"Title",content:t,fontSize:16,fontWeight:"700",textGrowth:"fixed-width",width:"fill_container"});
 T(c,{name:"Desc",content:d,fontSize:12,fill:S+"text/secondary",textGrowth:"fixed-width",width:"fill_container"});}
const lg=Insert(b,{type:"frame",name:"How to read",width:"fill_container",layout:"vertical",gap:10,padding:24,cornerRadius:"$radius/md",fill:S+"surface/subtle"});
T(lg,{name:"Title",content:"How to read these boards",fontSize:16,fontWeight:"700"});
for(const l of ["Layers — primitive → semantic (themed) → component. Components never consume primitives.","Naming — Pencil variable = token path with “/” (color.semantic.text.primary ⇄ $color/semantic/text/primary). Canonical source: tokens.json.","Modes — dark columns are frames with theme mode = dark.","Decisions — exploration.pen decision record."]) T(lg,{name:"Line",content:"•  "+l,fontSize:13,fill:S+"text/secondary",textGrowth:"fixed-width",width:"fill_container",lineHeight:1.5});
```

Index titles must use `textGrowth: "fixed-width"`. A long title such as "Spacing · radius · opacity" clipped in the real run.

### 01 — Color · primitives

```js
const b="<board-01-id>";
const hues=HUES.filter(h=>Object.keys(V).some(k=>k.startsWith(`color/primitive/${h}/`)));
const maxSteps=Math.max(...hues.map(h=>Object.keys(V).filter(k=>k.startsWith(`color/primitive/${h}/`)).length));
for(const hue of hues){
 const keys=Object.keys(V).filter(k=>k.startsWith(`color/primitive/${hue}/`));
 const sec=Insert(b,{type:"frame",name:"Ramp "+hue,width:"fill_container",layout:"vertical",gap:14});
 const hd=Insert(sec,{type:"frame",name:"Ramp header",gap:12,alignItems:"end"});
 T(hd,{name:"Hue",content:hue[0].toUpperCase()+hue.slice(1),fontSize:20,fontWeight:"700",letterSpacing:-0.4});
 T(hd,{name:"Hue desc",content:keys.length+" steps",fontSize:13,fill:S+"text/muted"});
 const row=Insert(sec,{type:"frame",name:"Swatches",width:"fill_container",gap:8});
 for(const k of keys){const step=k.split("/").pop();
  const c=Insert(row,{type:"frame",name:`${hue}.${step}`,width:"fill_container",layout:"vertical",gap:8});
  Insert(c,{type:"rectangle",name:"Swatch",width:"fill_container",height:80,cornerRadius:"$radius/sm",fill:"$"+k,stroke:S+"border/default",strokeWidth:1});
  const m=Insert(c,{type:"frame",name:"Meta",width:"fill_container",layout:"vertical",gap:2});
  T(m,{name:"Step",content:step,fontSize:14,fontWeight:"700"});
  T(m,{name:"Hex",content:V[k].value,fontFamily:MONO,fontSize:11,fill:S+"text/secondary"});
  T(m,{name:"Var",content:`${hue}/${step}`,fontFamily:MONO,fontSize:10,fill:S+"text/muted",textGrowth:"fixed-width",width:"fill_container"});}
 for(let i=keys.length;i<maxSteps;i++) Insert(row,{type:"frame",name:"Spacer",width:"fill_container",height:1});
}
const akeys=Object.keys(V).filter(k=>k.startsWith("color/primitive/alpha/"));
const asec=Insert(b,{type:"frame",name:"Ramp alpha",width:"fill_container",layout:"vertical",gap:14});
T(asec,{name:"Hue",content:"Alpha",fontSize:20,fontWeight:"700"});
for(let r=0;r<akeys.length;r+=7){const row=Insert(asec,{type:"frame",name:"Alpha row",width:"fill_container",gap:8});
 for(const k of akeys.slice(r,r+7)){const c=Insert(row,{type:"frame",name:"alpha."+k.split("/").pop(),width:"fill_container",layout:"vertical",gap:8});
  const sw=Insert(c,{type:"frame",name:"Swatch",width:"fill_container",height:64,cornerRadius:"$radius/sm",clip:true,stroke:S+"border/default",strokeWidth:1});
  for(const bg of ["#FFFFFF","#18181B"]){const hf=Insert(sw,{type:"frame",name:"On",width:"fill_container",height:"fill_container",fill:bg});Insert(hf,{type:"rectangle",name:"Tint",width:"fill_container",height:"fill_container",fill:"$"+k});}
  T(c,{name:"Step",content:k.split("/").pop(),fontSize:12,fontWeight:"700",textGrowth:"fixed-width",width:"fill_container"});
  T(c,{name:"Hex",content:V[k].value,fontFamily:MONO,fontSize:11,fill:S+"text/secondary"});}
 for(let i=akeys.slice(r,r+7).length;i<7;i++) Insert(row,{type:"frame",name:"Spacer",width:"fill_container",height:1});}
```

Alpha keys also come back in Pencil order. Sort them by `tokens.json` order, or `Move` cells afterwards.

### 02 — Color · semantic (row spec)

Each row is a frame named after its token, containing:

1. **Token** (300 wide): `Name` in mono, then `Usage` in muted text.
2. **light preview** and **dark preview** (260 × 56, `theme: {mode}`, fill `surface/panel`, `border/default`), each with a preview and an `Info` column (`Hex` and an optional `Contrast` badge). The preview depends on the token kind:
   - fill → a 96 px `Fill` rectangle;
   - stroke → a 96 px outline, 2 px stroke;
   - text, `on-*` and `.fg` → a `Sample` frame filled with its background token, holding `Aa <sample>`;
   - shadow → a card whose effect binds `elevation/N/*`.
3. **Alias**: `Light alias` and `Dark alias`.

Contrast badge: ≥ 4.5 `AA` (success) · ≥ 3 `AA-lg` (warning) · otherwise `FAIL` (danger), computed with `cr()`.

### 03 · 04 · 05

```js
// 03: family specimen ("Aa" 120px + family name + var), weights row bound to $font/weight/*,
//     style rows: name/use | specimen with fontSize "$font/size/<style>", fontWeight "$font/weight/<w>", letterSpacing/lineHeight vars | token list
// 04 spacing row: token | value | LIVE block | scaled bar (value×8, data/muted)
//     LIVE block (width/height can't bind): frame fill action/primary, padding ["$space/k","$space/k",0,0] + a 0×0 rectangle child → k×k square
// 04 radius: 96px squares cornerRadius "$radius/<k>", stroke text/primary 2
// 04 opacity: 8-strip checkerboard (#FFFFFF/#E4E4E7) + absolute tint rect (clip:true swatch), opacity "$opacity/<k>" (percent variables)
// 05: two rows (theme light / theme dark) on surface/canvas; cards: elevation 0 = border only;
//     1/2 = effect {type:"shadow",offset:{x:0,y:"$elevation/N/offset-y"},blur:"$elevation/N/blur",color:"$color/semantic/elevation/N/color"}
```

The opacity tint rectangles are wider than their `clip: true` swatch on purpose. The scan reports them as `partially clipped`; the canvas scan treats clipping inside a `clip: true` ancestor as intentional.

### 06 — Component tokens

```js
const b="<board-06-id>";
const comps={};for(const k of Object.keys(V).filter(k=>k.startsWith("component/"))){const g=k.split("/")[1];(comps[g]??=[]).push(k);}
const groups=[...ORDER.filter(g=>comps[g]),...Object.keys(comps).filter(g=>!ORDER.includes(g))];
const cols=Insert(b,{type:"frame",name:"Columns",width:"fill_container",gap:48,alignItems:"start"});
const L=Insert(cols,{type:"frame",name:"Left",width:"fill_container",layout:"vertical",gap:32});
const R=Insert(cols,{type:"frame",name:"Right",width:"fill_container",layout:"vertical",gap:32});
let lc=0,rc=0;
for(const g of groups){const col=lc<=rc?L:R;if(col===L)lc+=comps[g].length+3;else rc+=comps[g].length+3;
 const keys=comps[g].sort((a,b)=>(V[a].type===V[b].type?a.localeCompare(b):V[a].type==="color"?-1:1));
 const sec=Insert(col,{type:"frame",name:"Component "+g,width:"fill_container",layout:"vertical"});
 const gh=Insert(sec,{type:"frame",name:"Group header",width:"fill_container",gap:10,alignItems:"end",padding:[0,0,8,0],stroke:S+"border/default",strokeWidth:{bottom:1}});
 T(gh,{name:"Name",content:g[0].toUpperCase()+g.slice(1),fontSize:18,fontWeight:"700"});
 M(gh,keys.length+" tokens  ·  L / D");
 for(const k of keys){const r=Insert(sec,{type:"frame",name:k,width:"fill_container",gap:10,alignItems:"center",padding:[7,0],stroke:S+"border/subtle",strokeWidth:{bottom:1}});
  T(r,{name:"Token",content:k.replace("component/"+g+"/",""),fontFamily:MONO,fontSize:12,fontWeight:"600",textGrowth:"fixed-width",width:"fill_container"});
  if(V[k].type==="color"){for(const mode of ["light","dark"]){const c=Insert(r,{type:"frame",name:mode,width:44,height:24,padding:3,cornerRadius:"$radius/xs",fill:S+"surface/panel",stroke:S+"border/default",strokeWidth:1,theme:{mode}});Insert(c,{type:"rectangle",name:"Swatch",width:"fill_container",height:"fill_container",cornerRadius:2,fill:"$"+k});}}
  else{const c=Insert(r,{type:"frame",name:"Value",width:98,height:24,justifyContent:"center",alignItems:"center",cornerRadius:"$radius/xs",fill:S+"surface/sunken"});T(c,{name:"Num",content:String(res(k,"light"))+" px",fontFamily:MONO,fontSize:11,fontWeight:"600"});}
  const la=raw(k,"light"),da=raw(k,"dark");
  T(r,{name:"Alias",content:"→ "+String(la).replace("$color/semantic/","").replace("$","")+(la!==da?"  |  "+String(da).replace("$color/semantic/",""):""),fontFamily:MONO,fontSize:11,fill:S+"text/secondary",textGrowth:"fixed-width",width:230});}}
```

After the library components exist (save-design-system components phase), add a "Components" section to 06, or a new board 09, that lists each reusable component with its node ID and the `component/*` tokens it binds.

### 07 — Usage rules (pattern)

```js
// Header + "Which token do I need?" strip (5 numbered step cards on surface/subtle)
// Rule cards in rows of 3: card = Id tag (mono, G1/T1/S1/…) + title + one-line rule + [Do | Don't] columns
//   each column: 3px verdict bar (status/success/fg | status/danger/solid), check/x label,
//   Visual frame (h104, surface/subtle, centered; theme dark when the rule is about dark mode), mono caption
// Visual examples are built ONLY from tokens, except the deliberate "hard-coded" Don't example.
// Literal opacity is 0–1 (e.g. 0.5), unlike opacity variables (percent).
// Footer: research basis line + "Rules status: PROPOSED — awaiting approval" (switch to APPROVED <date> on approval).
```

### 08 — Spacing rules (pattern)

```js
const RED="#E5487F",TINT="#E5487F2E";
// Inset specimen: Redline frame {fill:TINT,stroke:RED,padding:<padding token(s)>} › Content frame {fill:surface/panel}
// Stack/inline ladder row: value | token | relationship | Gap frame {layout:vertical|horizontal, gap:"$space/k", fill:TINT, stroke:RED} with two panel blocks
// Layout map: Screen {fill:TINT,padding:["$space/3","$space/3","$space/3",0]} › Sidebar {gap:"$space/3",padding:["$space/2","$space/3"]}
//             Panel › Header {height:72,padding:[0,"$component/panel/app/header/padding-x"],fill:TINT}
//                   › Content {fill:TINT,padding:["$component/panel/app/content/padding-y","$component/panel/app/content/padding-x"],gap:"$component/panel/app/content/gap"}
// Do/Don't cards: proximity (label↔field 6 vs field↔field 16), same-relation-same-space, half-steps only in components, nesting inner ≤ outer.
// Card heads: width fill_container and title textGrowth fixed-width (long titles clip otherwise).
```

The redline colour is documentation-only and is on the raw-colour allowlist. Never use it in a component or feature screen.
