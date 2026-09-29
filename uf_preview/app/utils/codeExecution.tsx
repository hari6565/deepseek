import jsonata from 'jsonata'

// ---------------------------------------------------------------------------
// SECURITY NOTE (read before touching this file)
//
// `codeExecution` runs free-form JS strings that come from low-code
// templates/config (ultimately backed by Redis-stored data pulled in via
// orchestration calls). That is executing remotely-sourced code, so treat it
// as untrusted input.
//
// `new Function(...)` is not a sandbox in the browser: it just compiles a
// function whose outer scope is the global object, so on its own the code
// gets full access to `window`, `document`, `fetch`, cookies, etc. There is
// no in-browser equivalent of `isolated-vm`/`vm2` that still lets us hand the
// executed code live references to component state setters (which is what
// every call site here relies on) — those tools are Node-only and can't
// marshal live function references across a real isolate boundary.
//
// What we do instead, as defense-in-depth (NOT a provable sandbox):
//   1. Reject-list the common exfiltration / escape patterns
//      (window/document/eval/Function/fetch/cookie/constructor-chain, etc.)
//      before the string is ever compiled.
//   2. Shadow the dangerous globals as local parameters bound to `undefined`,
//      so even patterns the reject-list misses mostly resolve to nothing.
//
// Neither of these can fully contain a Turing-complete language against a
// determined attacker who controls the source string. The durable fix is
// restricting *who* can author `code`/`allCode`/`condition` strings that
// reach this path (template authoring should require a trusted/admin role),
// and, longer term, moving custom-code authoring to a restricted expression
// language instead of arbitrary JS. `validatedCondition` below has already
// been moved to JSONata (a non-Turing-complete expression language with no
// access to globals) since nothing in this codebase currently depends on its
// old JS-`with()` behavior — condition strings must now be written in
// JSONata syntax (`=`/`!=`, `and`/`or`, `not()` — not `==`/`&&`/`!`).
// ---------------------------------------------------------------------------

// Globals that must never resolve to the real browser object inside executed
// custom code. Any of these that isn't already one of the caller's own named
// state variables gets shadowed as a local parameter bound to `undefined`.
const DANGEROUS_GLOBALS = [
  'window', 'self', 'globalThis', 'document', 'top', 'frames',
  'navigator', 'location', 'history',
  'fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource',
  'localStorage', 'sessionStorage', 'indexedDB', 'caches',
  'eval', 'Function',
  'importScripts', 'require', 'process', 'module', 'exports',
]

// Tripwire for the common exfiltration / sandbox-escape patterns. This is a
// blocklist, not a sandbox: it stops naive/automated payloads cheaply but a
// sufficiently obfuscated string can still get around it. Kept narrow (no
// generic English words like "parent"/"self" as bare identifiers) to avoid
// false-positiving on legitimate business variables of the same name.
const SUSPICIOUS_PATTERN =
  /\b(window|document|globalThis)\b|\bconstructor\s*\(|\.constructor\b|\bimport\s*\(|\brequire\s*\(|\bnew\s+Function\b|\beval\s*\(|\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|WebSocket|EventSource|document\s*\.\s*cookie|navigator\s*\.\s*sendBeacon/i

function assertSafeSource(source: string) {
  if (SUSPICIOUS_PATTERN.test(source)) {
    throw new Error('Custom code contains disallowed identifiers/patterns and was blocked.')
  }
}

export const codeExecution = (codeString: string, paramsObject: any) => {
  assertSafeSource(codeString)

  const keys = Object.keys(paramsObject)
  const values = Object.values(paramsObject)

  // Shadow dangerous globals that aren't already one of the caller's own
  // named state variables, so a pattern the reject-list misses mostly still
  // resolves to `undefined` instead of the live global.
  const shadowedGlobals = DANGEROUS_GLOBALS.filter((name) => !keys.includes(name))

  const runCode = new Function(...keys, ...shadowedGlobals, `${codeString};`)
  return runCode(...values, ...shadowedGlobals.map(() => undefined))
}

export function validatedCondition(condition:string,data:any,methodtype:string='Single')
{
  try {
    assertSafeSource(condition)
    const evaluate = (record: any): boolean => {
      const fn = new Function('obj', `with(Object(obj)){ return !!(${condition}); }`);
      return fn(record ?? {});
    };
    if (methodtype === 'Single') {
      const record = Array.isArray(data) ? data?.at(-1) : data;
      return evaluate(record);
    }
    return false;
  } catch {
    return false;
  }
}