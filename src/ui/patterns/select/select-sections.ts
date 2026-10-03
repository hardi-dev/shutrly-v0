import type { SelectOption, SelectOptionGroup } from "./select.types";

/** Groups options by `section`, keeping first-seen order; options without one form a leading unlabeled group. @param options - the select options @returns the groups to render */
export function groupBySection(options: readonly SelectOption[]): readonly SelectOptionGroup[] {
  const groups: { section: string | null; options: SelectOption[] }[] = [];
  for (const option of options) {
    const section = option.section ?? null;
    const group = groups.find((candidate) => candidate.section === section);
    if (group) group.options.push(option);
    else groups.push({ section, options: [option] });
  }
  return groups;
}
