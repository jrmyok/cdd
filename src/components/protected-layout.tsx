import Header from "@/components/header";
import Section from "@/components/section";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status, data: session } = useSession();

  if (status === "unauthenticated") {
    void router.push("/");
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
