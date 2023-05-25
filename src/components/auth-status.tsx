import { useSession } from "next-auth/react";

export default function AuthStatus() {
  const { data: session, status } = useSession();
  const isLoggedIn = !!session?.user?.email;
  console.log(session);
  return (
    <div className="absolute top-5 flex w-full items-center justify-center">
      {isLoggedIn && (
        <p className="text-sm text-stone-200">
          Signed in as {session.user?.email}
        </p>
      )}
    </div>
  );
}
