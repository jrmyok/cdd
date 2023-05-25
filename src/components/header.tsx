import { InnerWrapper } from "@/components/InnerWrapper";
import Link from "next/link";
import Logo from "@/components/logo";
import SignOut from "@/components/sign-out";
import GetStarted from "@/components/get-started";
import { useSession } from "next-auth/react";

export default function Header() {
  // get started button if not logged in otherwise logout
  const { data: session, status } = useSession();
  const isLoggedIn = !!session?.user?.email;

  return (
    <header>
      <InnerWrapper>
        <Link href="/">
          <Logo />
        </Link>
        <nav className={"flex items-center gap-6"}>
          <>{isLoggedIn ? <SignOut /> : <GetStarted />}</>
        </nav>
      </InnerWrapper>
    </header>
  );
}
