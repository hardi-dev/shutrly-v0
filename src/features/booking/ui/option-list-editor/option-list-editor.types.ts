export interface OptionListEditorProps {
  readonly options: readonly string[];
  readonly errors?: Readonly<Record<number, string>>;
  readonly onChange: (options: readonly string[]) => void;
}
