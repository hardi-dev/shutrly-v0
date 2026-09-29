import { Alert } from "@/ui/patterns/alert/alert";
import { Button } from "@/ui/primitives/button/button";
import { Input } from "@/ui/primitives/input/input";
import { Textarea } from "@/ui/primitives/textarea/textarea";

import { SETTINGS_COPY } from "./settings-screen.copy";
import type { SettingsFieldProps, SettingsScreenProps } from "./settings-screen.types";

/** Renders workspace branding settings with a read-only IDR currency field. @param props - profile values and bound server action @returns the settings form */
export function SettingsScreen({ action, profile, saved = false }: Readonly<SettingsScreenProps>) {
  return (
    <form
      action={action}
      className="mx-auto flex w-full max-w-(--size-content-narrow) flex-col gap-(--space-4)"
    >
      <h2 className="text-(length:--font-size-display) font-bold">{SETTINGS_COPY.title}</h2>
      {saved ? <Alert tone="success" title={SETTINGS_COPY.saved} live /> : null}
      <Field label={SETTINGS_COPY.name} name="name" value={profile.name} />
      <Field label={SETTINGS_COPY.brandName} name="brandName" value={profile.brandName ?? ""} />
      <Field
        label={SETTINGS_COPY.email}
        name="contactEmail"
        value={profile.contactEmail ?? ""}
        type="email"
      />
      <Field label={SETTINGS_COPY.phone} name="phone" value={profile.phone ?? ""} />
      <Textarea label={SETTINGS_COPY.address} name="address" defaultValue={profile.address ?? ""} />
      <Field label={SETTINGS_COPY.prefix} name="invoicePrefix" value={profile.invoicePrefix} />
      <label className="flex flex-col gap-(--space-2) text-(length:--font-size-label) font-semibold">
        {SETTINGS_COPY.currency}
        <Input value={profile.currency} isReadOnly aria-label={SETTINGS_COPY.currency} />
      </label>
      <Button type="submit">{SETTINGS_COPY.save}</Button>
    </form>
  );
}

function Field({ label, name, value, type = "text" }: Readonly<SettingsFieldProps>) {
  return (
    <label className="flex flex-col gap-(--space-2) text-(length:--font-size-label) font-semibold">
      {label}
      <Input name={name} defaultValue={value} type={type} />
    </label>
  );
}
