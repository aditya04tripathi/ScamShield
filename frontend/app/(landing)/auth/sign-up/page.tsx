import Link from "next/link";
import { constructMetadata } from "@/lib/generate-metadata";
import RegisterForm from "@/components/auth/register-form";

export const metadata = constructMetadata({
  title: "Sign Up - ScamShield",
  description:
    "Join ScamShield today to start protecting yourself from online scams. Create your account to access powerful scam detection tools, manage your scans, and stay one step ahead of cyber threats.",
});

export default function SignUp() {
  return (
    <section className="bg-background flex min-h-[calc(100vh-5rem)] px-4">
      <div className="m-auto w-full max-w-xs">
        <div className="text-center">
          <h1 className="mt-3 font-serif text-4xl font-medium">Sign up</h1>
        </div>

        <RegisterForm />

        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link
            href="/auth/sign-in"
            className="text-primary font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}
