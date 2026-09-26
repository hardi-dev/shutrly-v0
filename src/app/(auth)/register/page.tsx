import { startGoogleAction } from "@/app/actions/auth/google";
import { registerAction } from "@/app/actions/auth/register";
import { redirectIfSignedIn } from "@/composition/auth/owner-guard/owner-guard";
import { RegisterScreen } from "@/features/auth/ui/register-screen/register-screen";

export default async function RegisterPage() {
  await redirectIfSignedIn();
  return <RegisterScreen action={registerAction} googleAction={startGoogleAction} />;
}
