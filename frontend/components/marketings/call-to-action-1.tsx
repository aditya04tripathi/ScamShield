import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

export default function CallToAction() {
  return (
    <section className="bg-background @container py-24">
      <div className="mx-auto px-6">
        <div className="text-center">
          <h2 className="text-balance font-serif text-4xl font-medium">
            Stay Safe Online Today
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 text-balance">
            Join thousands of users who trust ScamShield to protect them from
            scams and digital fraud.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild className="pr-1.5">
              <Link href="#link">
                <span>Start Free Check</span>
                <ChevronRight className="opacity-50" />
              </Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="#link">Report a Scam</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
