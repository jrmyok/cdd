import Header from "@/components/header";
import Section from "@/components/section";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { status, data: session } = useSession();
  const router = useRouter();
  if (status === "loading") {
    return null;
  } else if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  return (
    <MaxWidthWrapper>
      <Section>
        <Header />
        {children}
      </Section>
    </MaxWidthWrapper>
  );
}
