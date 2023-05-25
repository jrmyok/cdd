import { signOut } from "next-auth/react";
import PrimaryButton from "@/components/primary-button";

export default function SignOut() {
  return <PrimaryButton onClick={() => signOut()}>Sign out</PrimaryButton>;
}
