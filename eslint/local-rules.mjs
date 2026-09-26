// Project-specific lint rules (docs/coding-rules.md). Tested by tests/lint/local-rules.test.ts.

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

/** User-facing copy comes from a sibling *.copy.ts constant, never inline JSX. */
const uiCopy = {
  meta: {
    type: "suggestion",
    schema: [],
    messages: {
      inline: "Move user-facing copy to a sibling *.copy.ts constant (coding-rules.md › Copy).",
    },
  },
  create(context) {
    return {
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
