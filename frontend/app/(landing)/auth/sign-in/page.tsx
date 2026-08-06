import Link from "next/link";
import LoginForm from "@/components/auth/login-form";
import { constructMetadata } from "@/lib/generate-metadata";

export const metadata = constructMetadata({
  title: "Sign In - ScamShield",
  description:
    "Access your ScamShield account to manage your scans, view history, and stay protected against scams. Sign in to continue safeguarding yourself from online threats.",
});

export default function Login() {
  return (
    <section className="bg-background flex min-h-[calc(100vh-5rem)] px-4">
      <div className="m-auto w-full max-w-sm">
        <div className="text-center">
          <h1 className="mt-3 font-serif text-4xl font-medium">Sign in</h1>
        </div>

        <LoginForm />

        <p className="mt-4 text-center text-sm">
          New here?{" "}
          <Link
            href="/auth/sign-up"
            className="text-primary font-medium hover:underline"
          >
            Create account
          </Link>
        </p>
      </div>
    </section>
  );
}
