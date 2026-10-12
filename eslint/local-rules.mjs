// Project-specific lint rules (docs/coding-rules.md). Tested by tests/lint/coding-rules.test.ts.

const COPY_PROPS = new Set([
  "alt",
  "aria-label",
  "description",
  "errorMessage",
  "label",
  "message",
  "placeholder",
  "title",
]);

function isNonEmptyString(node) {
  return node?.type === "Literal" && typeof node.value === "string" && node.value.trim() !== "";
}

/** Server modules must start with `import "server-only"` so a client import fails the build. */
const requireServerOnly = {
  meta: {
    type: "problem",
    schema: [],
    messages: {
      missing: 'Start this server module with `import "server-only";` (coding-rules.md).',
    },
  },
  create(context) {
    return {
      Program(program) {
        const first = program.body.find(
          (node) => !(node.type === "ExpressionStatement" && node.directive),
        );
        const ok = first?.type === "ImportDeclaration" && first.source.value === "server-only";
        if (!ok) context.report({ node: program, messageId: "missing" });
      },
    };
  },
};

const TRANSLATION_HOOKS = new Set(["useTranslations", "getTranslations"]);
const SIBLING_COPY_IMPORT = /^\.\/[^/]+\.copy$/;

function calleeName(callee) {
  if (callee.type === "Identifier") return callee.name;
  if (callee.type === "MemberExpression" && callee.property.type === "Identifier") {
    return callee.property.name;
  }
  return null;
}

/** User-facing copy comes from a sibling *.copy.ts constant, never inline JSX or a literal namespace. */
const uiCopy = {
  meta: {
    type: "suggestion",
    schema: [],
    messages: {
      inline: "Move user-facing copy to a sibling *.copy.ts constant (coding-rules.md › Copy).",
      namespace:
        "Pass a namespace imported from a sibling *.copy.ts module, not a string literal (coding-rules.md › Copy).",
    },
  },
  create(context) {
    const siblingCopyNames = new Set();
    return {
      Program(program) {
        for (const node of program.body) {
          if (node.type !== "ImportDeclaration" || !SIBLING_COPY_IMPORT.test(node.source.value)) {
            continue;
          }
          for (const specifier of node.specifiers) siblingCopyNames.add(specifier.local.name);
        }
      },
      CallExpression(node) {
        if (!TRANSLATION_HOOKS.has(calleeName(node.callee))) return;
        const [namespace] = node.arguments;
        if (namespace?.type === "Identifier" && siblingCopyNames.has(namespace.name)) return;
        if (namespace) context.report({ node, messageId: "namespace" });
      },
      JSXText(node) {
        if (node.value.trim() !== "") context.report({ node, messageId: "inline" });
      },
      JSXAttribute(node) {
        if (node.name.type !== "JSXIdentifier" || !COPY_PROPS.has(node.name.name)) return;
        const value =
          node.value?.type === "JSXExpressionContainer" ? node.value.expression : node.value;
        if (isNonEmptyString(value) || value?.type === "TemplateLiteral") {
          context.report({ node, messageId: "inline" });
        }
      },
    };
  },
};

export const localRules = {
  rules: { "require-server-only": requireServerOnly, "ui-copy": uiCopy },
};
