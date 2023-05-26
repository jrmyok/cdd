import MaxWidthWrapper from "@/components/wrapper";
import Section from "@/components/section";
import GetStarted from "@/components/get-started";
import PrimaryButton from "@/components/primary-button";
import { useSession } from "next-auth/react";
import Header from "@/components/header";

export default function Home() {
  const { data: session, status } = useSession();
  const isLoggedIn = !!session?.user?.email;
  return (
    <MaxWidthWrapper>
      <Header />
      <Section>
        <div className="mb-10 flex w-full justify-center text-center">
          <div className={"max-w-screen-sm"}>
            <h1 className="text-5xl font-bold text-stone-200">
              <span
                className={
                  "animate-text bg-gradient-to-r from-teal-500 via-purple-500 to-orange-500 bg-clip-text italic text-transparent  "
                }
              >
                Illuminate
              </span>
            </h1>
            <h2 className="text-xl font-bold text-stone-300">
              {" "}
              Your beacon in the Digital Currency Fog
            </h2>
            <p className="mt-5 text-stone-400">
              Navigating Cryptocurrency Terrain with Ease – Unveiling Hidden
              Risks, Scams, and Evaluating Investment Potential for Digital
              Coins in Real-Time.
            </p>
            <div className="mt-12 flex justify-center">
              {isLoggedIn ? (
                <PrimaryButton isLink={true} href={"/protected"}>
                  Go to Dashboard
                </PrimaryButton>
              ) : (
                <GetStarted />
              )}
            </div>
          </div>
        </div>
      </Section>
    </MaxWidthWrapper>
  );
}
