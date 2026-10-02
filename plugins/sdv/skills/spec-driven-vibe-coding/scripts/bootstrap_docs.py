#!/usr/bin/env python3
from pathlib import Path
import argparse, shutil

def main():
    parser = argparse.ArgumentParser(description="Bootstrap progressive spec-driven docs.")
    parser.add_argument("project", nargs="?", default=".", help="Project root")
    parser.add_argument("--force", action="store_true", help="Overwrite existing files")
    args = parser.parse_args()

    project = Path(args.project).resolve()
    here = Path(__file__).resolve().parent
    template_dir = here.parent / "assets" / "templates"
    docs = project / "docs"

    mapping = {
        "README.md": "README.md",
        "constitution.md": "constitution.md",
        "coding-rules.md": "coding-rules.md",
        "product-overview.md": "product/overview.md",
        "product-scope.md": "product/scope.md",
        "user-journeys.md": "product/user-journeys.md",
        "business-rules.md": "domain/business-rules.md",
        "domain-model.md": "domain/domain-model.md",
        "tech-stack.md": "architecture/tech-stack.md",
        "architecture-overview.md": "architecture/overview.md",
        "adr.md": "architecture/decisions/ADR-TEMPLATE.md",
    }

    created, skipped = [], []
    for src_name, dest_rel in mapping.items():
        src = template_dir / src_name
        dest = docs / dest_rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        if dest.exists() and not args.force:
            skipped.append(str(dest.relative_to(project)))
            continue
        shutil.copyfile(src, dest)
        created.append(str(dest.relative_to(project)))

    print("Created:")
    for x in created: print(f"  {x}")
    if skipped:
        print("Skipped existing:")
        for x in skipped: print(f"  {x}")

if __name__ == "__main__":
    main()
