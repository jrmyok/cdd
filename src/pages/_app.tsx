import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import "@/styles/globals.css";
import AuthStatus from "@/components/auth-status";
import { Toaster } from "react-hot-toast";
import React, { Suspense } from "react";
import { trpc } from "@/lib/trpc";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Toaster />
      <Suspense fallback="Loading...">
        <AuthStatus />
      </Suspense>
      <Component {...pageProps} />
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
