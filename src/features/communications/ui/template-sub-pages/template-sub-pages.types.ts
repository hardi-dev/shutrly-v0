export interface TemplateSubPage {
  readonly path: string;
  readonly title: string;
  readonly subtitle: string;
  readonly parent: { readonly label: string; readonly href: string };
}
