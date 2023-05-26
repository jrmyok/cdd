import { useState } from "react";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import Link from "next/link";
import LoadingDots from "./loading-dots";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";

export default function Form({ type }: { type: "login" | "register" }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const registerUser = trpc.user.registerUser.useMutation();

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        if (type === "login") {
          try {
            const response = await signIn("credentials", {
              email: e.currentTarget.email.value,
              password: e.currentTarget.password.value,
              redirect: false,
            });

            if (response?.error) {
              // toast
              setLoading(false);
              toast.error("Invalid Credentials");
              return;
            }
            toast.success("Login Successful");
            router.push("/protected");
          } catch (error) {
            setLoading(false);
            toast.error("Login Failed");
          }
        } else {
          const email = e.currentTarget.email.value;
          const password = e.currentTarget.password.value;
          try {
            const res = await registerUser.mutateAsync({
              email,
              password,
            });
            setLoading(false);
            if (res) {
              toast.success("Account created! Redirecting to dashboard...");
              await signIn("credentials", {
                email,
                password,
                callbackUrl: "/protected",
              });
            } else {
              toast.error("Something went wrong.");
            }
          } catch (error: any) {
            setLoading(false);
            // if user already exists
            if (error.message) {
              toast.error(error.message);
              return;
            }
            toast.error("Something went wrong.");
          }
        }
      }}
      className="flex flex-col space-y-4 bg-gray-50 px-4 py-8 sm:px-16"
    >
      <div>
        <label
          htmlFor="email"
          className="block text-xs uppercase text-gray-600"
        >
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="panic@thedis.co"
          autoComplete="email"
          required
          className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-xs uppercase text-gray-600"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
        />
      </div>
      <button
        disabled={loading}
        className={`${
          loading
            ? "cursor-not-allowed border-gray-200 bg-gray-100"
            : "border-black bg-black text-white hover:bg-white hover:text-black"
        } flex h-10 w-full items-center justify-center rounded-md border text-sm transition-all focus:outline-none`}
      >
        {loading ? (
          <LoadingDots color="#808080" />
        ) : (
          <p>{type === "login" ? "Sign In" : "Sign Up"}</p>
        )}
      </button>
      {type === "login" ? (
        <p className="text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-gray-800">
            Sign up
          </Link>{" "}
          for free.
        </p>
      ) : (
        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-gray-800">
            Sign in
          </Link>{" "}
          instead.
        </p>
      )}
    </form>
  );
}
