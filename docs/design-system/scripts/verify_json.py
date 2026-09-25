import json
import os; D=os.path.join(os.path.dirname(os.path.abspath(__file__)),"..")+"/"
doc=json.load(open(D+"tokens.json")); mp=json.load(open(D+"pencil-mapping.json")); pv=json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),"pencil-vars.json")))
flat={}
def walk(n,p,t):
    t=n.get("$type",t)
    if "$value" in n: flat[".".join(p)]=(n,t); return
    for k,v in n.items():
        if not k.startswith("$"): walk(v,p+[k],t)
walk(doc,[],None)
ref=lambda v:"$"+v[1:-1].replace(".","/") if isinstance(v,str) and v.startswith("{") else v
issues=[]
for name,(n,t) in flat.items():
    pn=name.replace(".","/"); dark=n.get("$extensions",{}).get("dev.pen.modes",{}).get("dark")
    v=ref(n["$value"])
    if name.startswith("opacity."): v=round(v*100,4)
    exp=v if dark is None else [{"value":v,"theme":{"mode":"light"}},{"value":ref(dark),"theme":{"mode":"dark"}}]
    if pn not in pv: issues.append("missing in pencil: "+pn)
    elif pv[pn]["value"]!=exp and not (isinstance(exp,(int,float)) and float(pv[pn]["value"])==float(exp)): issues.append(f"mismatch {pn}: {pv[pn]['value']} vs {exp}")
    if mp["variables"].get(pn)!=name: issues.append("mapping missing/wrong: "+pn)
extra=set(pv)-{k.replace(".","/") for k in flat}; issues+=["extra in pencil: "+e for e in extra]
extra_m=set(mp["variables"])-set(pv); issues+=["extra in mapping: "+e for e in extra_m]
# semantic must alias primitives; component must alias semantic/scale tokens
for name,(n,t) in flat.items():
    for v in [n["$value"], n.get("$extensions",{}).get("dev.pen.modes",{}).get("dark")]:
        if v is None: continue
        if name.startswith("color.semantic") and not (isinstance(v,str) and v.startswith("{color.primitive")): issues.append("semantic not aliasing primitive: "+name)
        if name.startswith("component.") and isinstance(v,str) and v.startswith("{color.primitive"): issues.append("component uses primitive: "+name)
        if name.startswith("component.") and not (isinstance(v,str) and v.startswith("{")): issues.append("component hardcoded: "+name)
# theme coverage
themed=[k for k,(n,t) in flat.items() if k.startswith("color.semantic")]
print("tokens",len(flat),"semantic",len(themed),"mapping vars",len(mp["variables"]))
print("ISSUES",len(issues)); print("\n".join(issues[:40]))
