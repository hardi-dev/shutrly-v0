import json,sys
import os
V=json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),"pencil-vars.json")))
def num(n):
    n=float(n); return str(int(n)) if n==int(n) else repr(n)
def cv(v):
    if isinstance(v,list): return ",".join(sorted(x["theme"]["mode"]+":"+cv(x["value"]) for x in v))
    if isinstance(v,(int,float)) and not isinstance(v,bool): return num(v)
    return str(v)
def fnv(s):
    h=0x811c9dc5
    for ch in s:
        h^=ord(ch); h=(h*0x01000193)&0xffffffff
    return format(h,"x")
keys=sorted(V)
print("count",len(keys),"all",fnv("\n".join(f"{k}|{V[k]['type']}|{cv(V[k]['value'])}" for k in keys)))
g={}
for k in keys: g.setdefault("/".join(k.split("/")[:2]),[]).append(f"{k}|{V[k]['type']}|{cv(V[k]['value'])}")
for k in g: print(k,len(g[k]),fnv("\n".join(g[k])))
