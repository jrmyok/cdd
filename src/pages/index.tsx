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
        <div className="relative my-auto flex w-full justify-center text-center">
          <div
            className="absolute right-0 top-0 -z-10  origin-top-left -translate-y-60 -rotate-90 transform-gpu overflow-hidden opacity-20 blur-3xl  sm:-ml-96 sm:rotate-0 sm:transform-gpu sm:opacity-50"
            aria-hidden="true"
          >
            <div
              className="aspect-[1154/678] w-[20.125rem] bg-gradient-to-br from-[#FF80B5] to-[#9089FC]"
              style={{
                clipPath: "circle(50% at 50% 50%)",
              }}
            />
          </div>
          <div className={"max-w-screen-sm"}>
            <h1 className="relative text-6xl font-bold text-stone-200">
              <span
                className={
                  "animate-text bg-gradient-to-r from-teal-500 via-purple-500 to-orange-500 bg-clip-text font-extrabold italic text-transparent  "
                }
              >
                Illuminate
              </span>
              <span className={"absolute -top-6"}>✨</span>
            </h1>
            <h2 className="text-lg font-bold italic text-stone-300">
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
