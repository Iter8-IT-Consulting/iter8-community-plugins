import { signOut } from "@/app/sign-in/actions";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button className="text-sm text-brand underline underline-offset-4">Sign out</button>
    </form>
  );
}
