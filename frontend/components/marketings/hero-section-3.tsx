import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroHeader } from "../shared/header";
import { AudioLines, ChevronRight, Shield, Mic2, Plus } from "lucide-react";
import Image from "next/image";

export default function HeroSection() {
  return (
    <main className="overflow-hidden">
      <section className="bg-background">
        <div className="relative py-40">
          <div className="mask-radial-from-45% mask-radial-to-75% mask-radial-at-top mask-radial-[75%_100%] aspect-2/3 absolute inset-0 opacity-75 blur-xl md:aspect-square lg:aspect-video dark:opacity-5">
            <Image
              src="https://images.unsplash.com/photo-1685013640715-8701bbaa2207?q=80&w=2198&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="hero background"
              width={2198}
              height={1685}
              className="h-full w-full object-cover object-top"
            />
          </div>
          <div className="relative z-10 mx-auto w-full sm:pl-6">
            <div className="flex items-center justify-between max-md:flex-col">
              <div className="max-w-md max-sm:px-6">
                <h1 className="text-balance font-serif text-4xl font-medium sm:text-5xl">
                  Stop Scams Before They Start.
                </h1>
                <p className="text-muted-foreground mt-4 text-balance">
                  ScamShield is your intelligent guardian against digital fraud,
                  phishing, and online scams.
                </p>

                <Button asChild className="mt-6 pr-1.5">
                  <Link href="#link">
                    <span className="text-nowrap">Get Protected</span>
                    <ChevronRight className="opacity-50" />
                  </Link>
                </Button>
              </div>
              <div aria-hidden>
                {[
                  "Phishing URL detected in email",
                  "Suspicious crypto investment alert",
                  "Fake tech support number identification",
                  "Identity theft protection active",
                  "Malicious website blocked",
                  "Fraudulent marketplace listing flagged",
                  "verify-account-security.com flagged",
                  "Romance scam pattern detected",
                  "AI voice cloning attempt blocked",
                  "Fake charity donation prevention",
                  "Lottery winner scam intercepted",
                  "Bank impersonation SMS detected",
                ].map((prompt, index) => (
                  <div
                    key={index}
                    className="text-muted-foreground flex items-center gap-2 px-14 py-2 text-sm"
                  >
                    <Shield className="size-3.5 opacity-50" />
                    <span className="text-nowrap">{prompt}</span>
                  </div>
                ))}
                <div className="bg-card min-w-sm ring-border shadow-foreground/6.5 dark:shadow-black/6.5 absolute inset-0 m-auto mt-auto flex h-fit justify-between gap-3 rounded-full p-2 shadow-xl ring-1 sm:inset-2">
                  <div className="flex items-center gap-2">
                    <div className="hover:bg-muted flex size-9 cursor-pointer rounded-full *:m-auto *:size-4">
                      <Plus />
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Report a scam...
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <div className="hover:bg-muted flex size-9 cursor-pointer rounded-full *:m-auto *:size-4">
                      <Mic2 />
                    </div>
                    <div className="bg-foreground text-background flex size-9 cursor-pointer rounded-full *:m-auto *:size-4 hover:brightness-110">
                      <AudioLines />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
