import "server-only";

import type { MessageFormatElement } from "@formatjs/icu-messageformat-parser";
import { parse, TYPE } from "@formatjs/icu-messageformat-parser";

import type { CopyModule, ParityProblem } from "./message-catalog.types";

/**
 * Collect the argument names and kinds of a parsed ICU message, so both languages can be
 * compared without caring about plural option wording.
 * @param elements - the parsed message elements
 * @returns a sorted list of `kind:name` signatures
 */
function argumentSignature(elements: readonly MessageFormatElement[]): string[] {
  const signature: string[] = [];
  for (const element of elements) {
    if (element.type === TYPE.literal || element.type === TYPE.pound) continue;
    if (element.type === TYPE.tag) {
      signature.push(...argumentSignature(element.children));
      continue;
    }
    signature.push(`${String(element.type)}:${element.value}`);
    if (element.type === TYPE.select || element.type === TYPE.plural) {
      for (const option of Object.values(element.options)) {
        signature.push(...argumentSignature(option.value));
      }
    }
  }
  return signature.sort((a, b) => a.localeCompare(b));
}

/**
 * Parse an ICU message and return its argument signature, or null when it does not parse.
 * @param message - the ICU string
 * @returns the signature, or null for invalid syntax
 */
function signatureOf(message: string): string[] | null {
  try {
    return argumentSignature(parse(message));
  } catch {
    return null;
  }
}

/**
 * Check one key of a copy module in both languages.
 * @param namespace - the module namespace
 * @param key - the message key
 * @param en - the English string
 * @param id - the Indonesian string
 * @returns the problem found, or null when the pair is sound
 */
function pairProblem(
  namespace: string,
  key: string,
  en: string | undefined,
  id: string | undefined,
): ParityProblem | null {
  if (id === undefined) return { namespace, key, problem: "MISSING" };
  if (en === undefined) return { namespace, key, problem: "MISSING" };
  if (en.trim() === "" || id.trim() === "") return { namespace, key, problem: "EMPTY" };
  const enSignature = signatureOf(en);
  const idSignature = signatureOf(id);
  if (enSignature === null || idSignature === null) return { namespace, key, problem: "INVALID" };
  if (enSignature.join("|") !== idSignature.join("|")) {
    return { namespace, key, problem: "ARGUMENTS_DIFFER" };
  }
  return null;
}

/**
 * Compare every copy module's English and Indonesian strings: same keys, no empty strings, the
 * same ICU arguments (§9.4). Pure, so the registry test can run it on the real registry.
 * @param registry - the copy modules to check
 * @returns every problem found, empty when the registry is sound
 */
export function findParityProblems(registry: readonly CopyModule[]): readonly ParityProblem[] {
  const problems: ParityProblem[] = [];
  for (const copyModule of registry) {
    const keys = new Set([
      ...Object.keys(copyModule.messages.en),
      ...Object.keys(copyModule.messages.id),
    ]);
    for (const key of keys) {
      const problem = pairProblem(
        copyModule.namespace,
        key,
        copyModule.messages.en[key],
        copyModule.messages.id[key],
      );
      if (problem) problems.push(problem);
    }
  }
  return problems;
}
