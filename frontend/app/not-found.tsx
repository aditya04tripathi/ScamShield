"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="space-y-4">
        <h1 className="font-serif text-9xl font-medium tracking-tighter text-foreground">
          404
        </h1>
        <div className="space-y-2">
          <h2 className="text-2xl font-medium text-foreground">
            Page not found
          </h2>
          <p className="text-muted-foreground text-balance max-w-125 mx-auto">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It
            might have been removed, renamed, or doesn&apos;t exist.
          </p>
        </div>
        <div className="pt-4">
          <Button asChild size="lg">
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
