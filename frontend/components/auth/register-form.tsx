"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/actions/auth.actions";
import { Loader2 } from "lucide-react";

const RegisterForm = () => {
  const [state, action, isPending] = useActionState(signUp, undefined);

  return (
    <form action={action} className="mt-12 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm">
            First name
          </Label>
          <Input id="firstName" name="firstName" autoComplete="given-name" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm">
            Last name
          </Label>
          <Input id="lastName" name="lastName" autoComplete="family-name" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm">
          Email
        </Label>
        <Input
          type="email"
          id="email"
          name="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm">
          Password
        </Label>
        <Input
          type="password"
          id="password"
          name="password"
          minLength={8}
          autoComplete="new-password"
          required
        />
      </div>

      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}

      <Button className="w-full" disabled={isPending}>
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Continue
      </Button>
    </form>
  );
};

export default RegisterForm;
