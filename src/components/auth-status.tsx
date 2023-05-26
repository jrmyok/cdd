import { useSession } from "next-auth/react";

export default function AuthStatus() {
  const { data: session, status } = useSession();
  const isLoggedIn = !!session?.user?.email;
  console.log(session);
  return (
    <div className="absolute top-5 flex w-full items-center justify-center">
      {isLoggedIn && (
        <p className="flex text-sm text-stone-200">
          <span className={"hidden md:block"}>Signed in as:&nbsp; </span>
          {session.user?.email}
        </p>
      )}
    </div>
  );
}
