// Preloaded into the server Playwright starts (NODE_OPTIONS=--require). On a machine without a
// working IPv6 route, Node sometimes connects to Neon over IPv6 and the database websocket times
// out (ETIMEDOUT), so pages fail at random. Resolving IPv4 only avoids that. Local tooling only:
// it never runs on a deployed host (F-22, 2026-10-11).
const dns = require("node:dns");

const lookup = dns.lookup;
dns.lookup = function lookupIpv4(hostname, options, callback) {
  if (typeof options === "function") return lookup.call(dns, hostname, { family: 4 }, options);
  const base = typeof options === "number" ? { family: options } : { ...options };
  return lookup.call(dns, hostname, { ...base, family: 4, all: base.all }, callback);
};
if (process.env.SHUTRLY_IPV4_DEBUG === "1") console.error("ipv4-only preload active", process.pid);
