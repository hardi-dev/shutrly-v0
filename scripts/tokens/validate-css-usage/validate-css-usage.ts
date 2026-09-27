export interface CssUsageFile {
  path: string;
  contents: string;
}

export interface CssVariableIssue {
  line: number;
  path: string;
  variable: string;
}

const CSS_VARIABLE_REFERENCE_PATTERNS = [
  /var\([ \t]*(--[a-z0-9-]+)/gi,
  /\((--[a-z0-9-]+)(?=[):\s])/gi,
];
const CSS_VARIABLE_DECLARATION_PATTERN = /(\-\-[a-z0-9]+(?:-[a-z0-9]+)*):/g;

function lineNumber(contents: string, index: number): number {
  return contents.slice(0, index).split("\n").length;
}

function collectMatches(contents: string, pattern: RegExp): Map<string, number> {
  const matches = new Map<string, number>();
  for (const match of contents.matchAll(pattern)) {
    const variable = match[1];
    if (!matches.has(variable)) {
      matches.set(variable, lineNumber(contents, match.index));
    }
  }
  return matches;
}

function collectDeclaredVariables(contents: string): Set<string> {
  const variables = new Set<string>();
  for (const match of contents.matchAll(CSS_VARIABLE_DECLARATION_PATTERN)) {
    variables.add(match[1]);
  }
  return variables;
}

export function findUnknownCssVariables(
  files: readonly CssUsageFile[],
  knownVariables: ReadonlySet<string>,
): CssVariableIssue[] {
  const declaredVariables = new Set<string>();
  for (const file of files) {
    for (const variable of collectDeclaredVariables(file.contents)) {
      declaredVariables.add(variable);
    }
  }

  const issues: CssVariableIssue[] = [];
  for (const file of files) {
    const references = new Map<string, number>();
    for (const pattern of CSS_VARIABLE_REFERENCE_PATTERNS) {
      for (const [variable, line] of collectMatches(file.contents, pattern)) {
        references.set(variable, Math.min(references.get(variable) ?? line, line));
      }
    }
    for (const [variable, line] of references) {
      if (!knownVariables.has(variable) && !declaredVariables.has(variable)) {
        issues.push({ line, path: file.path, variable });
      }
    }
  }
  return issues.sort((a, b) => a.path.localeCompare(b.path) || a.line - b.line);
}
