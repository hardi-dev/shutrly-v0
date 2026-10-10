export interface StepperProps {
  /** The accessible name of the spinbutton, e.g. *Jumlah IMG_003.jpg*. */
  readonly label: string;
  readonly value: number;
  readonly onChange: (value: number) => void;
  /** Whole numbers from `min`; the − button disables at it. */
  readonly min?: number;
  /** The + button disables at it (e.g. the places left, A-9). */
  readonly max: number;
  readonly isDisabled?: boolean;
  readonly className?: string;
}
