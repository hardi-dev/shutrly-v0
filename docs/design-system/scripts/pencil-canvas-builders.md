# Pencil token-canvas builders (reference)

The `execute` snippets that generated boards 00–08 in `design-system.lib.pen`, with later fixes folded in.
Run each through Pencil MCP `execute` against the library file **after** `SetVariables` has loaded the token payload (`scripts/pencil-vars.json`).
Board x positions: 0 · 1540 · 3080 · 4620 · 6160 · 7700 · 9240 · 10780 · 12320 (1440 wide, 100 gap).

Conventions:
- Every visual binds to a variable (`$color/semantic/...`, `$space/...`, `$radius/...`, `$component/...`); the only raw colours are documentation backdrops/annotations (`#FFFFFF`, `#18181B`, `#E4E4E7`, redline `#E5487F`/`#E5487F2E`).
- Boards carry `theme:{mode:"light"}`; dark previews are frames with `theme:{mode:"dark"}`.
- Known Pencil limits handled here: width/height can't bind to variables (use padding/gap), opacity variables are percent (40 = 0.4) while literal `opacity` is 0–1.
- Project-specific copy (Shutrly, Indonesian samples, stage names) must be replaced when reused as a template.

## Shared helpers (paste at top of each snippet)
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
// finish every board with: Update(b,{placeholder:false}); then a problems scan + TakeScreenshot
```

## 00 — Cover
```js
const {b,h}=board("00 — Cover",0,"<SYSTEM NAME> DESIGN SYSTEM  ·  LIBRARY","<Direction name>","Foundations and components for <product>. Every swatch, scale and preview on these boards is bound to a live Pencil variable.");
const meta=Insert(h,{type:"frame",name:"Meta",gap:8,padding:[8,0,0,0]});
for(const [t,ok] of [["PERSISTED <date>",1],[Object.keys(V).length+" tokens",0],["mode: light · dark",0],["<font family>",0]]){
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

## 01 — Color · primitives
```js
const {b}=board("01 — Color · primitives",1540,"FOUNDATIONS  ·  01","Color · primitives","Raw colour values. Not themed and never used directly by components.");
const hues=[...new Set(Object.keys(V).filter(k=>k.startsWith("color/primitive/")&&!k.includes("/alpha/")).map(k=>k.split("/")[2]))];
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
// alpha: 7 per row, each swatch split white | #18181B with the tint over both halves
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

## 02 — Color · semantic (table with light/dark previews + contrast badges)
```js
const hx=h=>{h=h.replace("#","");return {r:parseInt(h.slice(0,2),16),g:parseInt(h.slice(2,4),16),b:parseInt(h.slice(4,6),16),a:h.length>6?parseInt(h.slice(6,8),16)/255:1};};
const over=(fg,bg)=>{const f=hx(fg),b=hx(bg);return {r:f.r*f.a+b.r*(1-f.a),g:f.g*f.a+b.g*(1-f.a),b:f.b*f.a+b.b*(1-f.a)};};
const lum=c=>{const t=x=>{x/=255;return x<=0.03928?x/12.92:Math.pow((x+0.055)/1.055,2.4)};return 0.2126*t(c.r)+0.7152*t(c.g)+0.0722*t(c.b);};
const cr=(fg,bg,base)=>{const B=over(bg,base);const bh="#"+[B.r,B.g,B.b].map(x=>Math.round(x).toString(16).padStart(2,"0")).join("");const Fc=over(fg,bh);const a=lum(Fc),b=lum(B);return (Math.max(a,b)+0.05)/(Math.min(a,b)+0.05);};
// groups: [title, kind(fill|stroke|text|shadow), [[token, usage, bgToken?, kindOverride?], ...]]
// kinds: surfaces → fill; borders → stroke; text/on-*/fg → text (on bgToken); elevation colours → shadow
// Row: Token(300: mono name + usage) | light preview (260, theme light) | dark preview (260, theme dark) | Alias (light → / dark →)
// Preview cell: frame fill surface/panel + border; fill → 96px rect; stroke → 96px outline 2px; text → "Aa Rp 4,5 jt" on bgToken; shadow → card with effect bound to elevation vars
// Text rows add a contrast badge: ≥4.5 AA (success) · ≥3 AA-lg (warning) · else FAIL (danger), computed with cr(res(token,mode), res(bg,mode), res(surface/panel,mode))
```
(Boards 02–05, 07 and 08 are summarised as specs; the rendered boards in `design-system.lib.pen` are the exact reference — inspect them with `Get(boardId,{depth:…})` when porting.)

## 03 — Typography · 04 — Spacing/radius/opacity · 05 — Elevation
```js
// 03: family specimen ("Aa" 120px + family name + var), weights row bound to $font/weight/*,
//     style rows: name/use | specimen with fontSize "$font/size/<style>", fontWeight "$font/weight/<w>", letterSpacing/lineHeight vars | token list
// 04 spacing row: token | value | LIVE block | scaled bar (value×8, data/muted)
//     LIVE block (width/height can't bind): frame fill action/primary, padding ["$space/k","$space/k",0,0] + a 0×0 rectangle child → k×k square
// 04 radius: 96px squares cornerRadius "$radius/<k>", stroke text/primary 2
// 04 opacity: 8-strip checkerboard (#FFFFFF/#E4E4E7) + absolute tint rect, opacity "$opacity/<k>" (Pencil opacity vars are PERCENT)
// 05: two rows (theme light / theme dark) on surface/canvas; cards: elevation 0 = border only;
//     1/2 = effect {type:"shadow",offset:{x:0,y:"$elevation/N/offset-y"},blur:"$elevation/N/blur",color:"$color/semantic/elevation/N/color"}
```

## 06 — Component tokens
```js
const {b}=board("06 — Component tokens",9240,"COMPONENTS  ·  06","Component tokens","Component-scoped aliases: colours → semantic, padding/gap/radius → scales. Never a primitive or raw value.");
const comps={};for(const k of Object.keys(V).filter(k=>k.startsWith("component/"))){const g=k.split("/")[1];(comps[g]??=[]).push(k);}
const cols=Insert(b,{type:"frame",name:"Columns",width:"fill_container",gap:48,alignItems:"start"});
const L=Insert(cols,{type:"frame",name:"Left",width:"fill_container",layout:"vertical",gap:32});
const R=Insert(cols,{type:"frame",name:"Right",width:"fill_container",layout:"vertical",gap:32});
// balance groups by token count between L and R
for(const [g,col] of Object.keys(comps).map((g,i)=>[g,i%2?R:L])){
 const keys=comps[g].sort((a,b)=>(V[a].type===V[b].type?0:V[a].type==="color"?-1:1));
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

## 07 — Usage rules (pattern)
```js
// Header + "Which token do I need?" strip (5 numbered step cards on surface/subtle)
// Rule cards in rows of 3: card = Id tag (mono) + title + one-line rule + [Do | Don't] columns
//   each column: 3px verdict bar (status/success/fg | status/danger/solid), check/x icon label,
//   Visual frame (h104, surface/subtle, centered; theme dark when the rule is about dark mode), mono caption
// Visual examples are built ONLY from tokens, except the deliberate "hard-coded" Don't example.
// Literal opacity is 0–1 (e.g. 0.5), unlike opacity variables (percent).
```

## 08 — Spacing rules (pattern)
```js
const RED="#E5487F",TINT="#E5487F2E";   // documentation-only redline colour
// Inset specimen: Redline frame {fill:TINT,stroke:RED,padding:<padding token(s)>} › Content frame {fill:surface/panel}
// Stack/inline ladder row: value | token | relationship | Gap frame {layout:vertical|horizontal, gap:"$space/k", fill:TINT, stroke:RED} with two panel blocks
// Layout map: Screen {fill:TINT,padding:["$space/3","$space/3","$space/3",0]} › Sidebar {gap:"$space/3",padding:["$space/2","$space/3"]}
//             Panel › Header {height:72,padding:[0,"$component/panel/app/header/padding-x"],fill:TINT}
//                   › Content {fill:TINT,padding:["$component/panel/app/content/padding-y","$component/panel/app/content/padding-x"],gap:"$component/panel/app/content/gap"}
//                       › Metrics {gap:"$space/4"} · Today {gap:"$space/6"}
// Do/Don't cards: proximity (label↔field 6 vs field↔field 16), same-relation-same-space, half-steps only in components, nesting inner ≤ outer.
// Card heads: width fill_container and title textGrowth fixed-width (long titles clip otherwise).
```
