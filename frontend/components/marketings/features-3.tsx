"use client";
import { useState } from "react";

import { Cloud, Cpu, Shield, ChevronRight } from "lucide-react";
import { Vercel } from "@/components/ui/svgs/vercel";
import { Supabase } from "@/components/ui/svgs/supabase";
import { Linear } from "@/components/ui/svgs/linear";
import { Slack } from "@/components/ui/svgs/slack";
import { Firebase } from "@/components/ui/svgs/firebase";
import { ClerkIconDark as Clerk } from "@/components/ui/svgs/clerk";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Feature =
  | "real-time-detection"
  | "community-reports"
  | "ai-analysis"
  | "expert-verification";

export default function Features() {
  const [feature, setFeature] = useState<Feature>("real-time-detection");
  return (
    <section className="bg-background @container py-24 max-w-5xl w-full">
      <div className="@2xl:grid-cols-2 mx-auto grid gap-6 px-6">
        <div>
          <div>
            <h2 className="text-balance font-serif text-4xl font-medium">
              Advanced Protection Against Fraud
            </h2>
            <p className="text-muted-foreground mb-6 mt-4 text-balance">
              Everything you need to stay safe online and detect scams before
              they happen.
            </p>
            <Button
              variant="secondary"
              size="sm"
              asChild
              className="gap-1 pr-1.5"
            >
              <Link href="#">
                Get Protected
                <ChevronRight />
              </Link>
            </Button>
          </div>
          <div className="mt-16 *:w-full *:cursor-pointer">
            <button
              onClick={() => setFeature("real-time-detection")}
              data-selected={feature === "real-time-detection"}
              className="not-data-[selected=true]:hover:text-foreground not-data-[selected=true]:text-muted-foreground flex items-center gap-3 py-2 text-sm"
            >
              <div className="flex size-4 items-center -space-x-2">
                <div className="size-3 shrink-0 rounded-full border border-current"></div>
                <div className="size-3 shrink-0 rounded-full border border-current"></div>
              </div>
              <span className="in-data-[selected=true]:text-shadow-[0.2px_0_0_currentColor]">
                Real-time Detection
              </span>
            </button>
            <button
              onClick={() => setFeature("community-reports")}
              data-selected={feature === "community-reports"}
              className="not-data-[selected=true]:hover:text-foreground not-data-[selected=true]:text-muted-foreground flex items-center gap-3 py-2 text-sm"
            >
              <Cloud className="size-4" />
              <span className="in-data-[selected=true]:text-shadow-[0.2px_0_0_currentColor]">
                Community Reports
              </span>
            </button>
            <button
              onClick={() => setFeature("ai-analysis")}
              data-selected={feature === "ai-analysis"}
              className="not-data-[selected=true]:hover:text-foreground not-data-[selected=true]:text-muted-foreground flex items-center gap-3 py-2 text-sm"
            >
              <Cpu className="size-4" />
              <span className="in-data-[selected=true]:text-shadow-[0.2px_0_0_currentColor]">
                AI Analysis
              </span>
            </button>
            <button
              onClick={() => setFeature("expert-verification")}
              data-selected={feature === "expert-verification"}
              className="not-data-[selected=true]:hover:text-foreground not-data-[selected=true]:text-muted-foreground flex items-center gap-3 py-2 text-sm"
            >
              <Shield className="size-4" />
              <span className="in-data-[selected=true]:text-shadow-[0.2px_0_0_currentColor]">
                Expert Verification
              </span>
            </button>
          </div>
        </div>
        <div className="@max-xl:-mx-6 not-dark:bg-linear-to-b not-dark:via-muted relative flex items-center overflow-hidden rounded-3xl *:w-full">
          <div
            aria-hidden
            className={cn(
              "*:bg-linear-to-r not-dark:opacity-50 mask-y-from-65% *:to-muted dark:*:to-foreground/2 absolute inset-0 grid grid-cols-4 duration-300",
              feature === "real-time-detection" &&
                "*:bg-linear-to-t grid-cols-1 grid-rows-12",
              feature === "expert-verification" &&
                "*:bg-linear-to-l grid-cols-2 dark:opacity-50",
              feature === "ai-analysis" && "*:opacity-35",
            )}
          >
            <div />
            <div />
            <div />
            <div />
          </div>
          {feature === "real-time-detection" && <IntegrationsIllustration />}
          {feature === "community-reports" && <RealTimeIllustration />}
          {feature === "ai-analysis" && <DeveloperIllustration />}
          {feature === "expert-verification" && <EnterpriseIllustration />}
        </div>
      </div>
    </section>
  );
}

const IntegrationsIllustration = () => {
  return (
    <div
      aria-hidden
      className="**:fill-foreground flex h-44 flex-col justify-between pt-8"
    >
      <div className="relative flex h-10 items-center gap-12 px-6">
        <div className="bg-border absolute inset-0 my-auto h-px"></div>

        <div className="bg-card shadow-black/6.5 ring-border relative flex h-8 items-center rounded-full px-3 shadow-sm ring">
          <Vercel className="size-3.5" />
        </div>
        <div className="bg-card shadow-black/6.5 ring-border relative flex h-8 items-center rounded-full px-3 shadow-sm ring">
          <Slack className="size-3.5" />
        </div>
      </div>
      <div className="pl-17 relative flex h-10 items-center justify-between gap-12 pr-6">
        <div className="bg-border absolute inset-0 my-auto h-px"></div>

        <div className="bg-card shadow-black/6.5 ring-border relative flex h-8 items-center rounded-full px-3 shadow-sm ring">
          <Clerk className="size-3.5" />
        </div>
        <div className="bg-card shadow-black/6.5 ring-border relative flex h-8 items-center rounded-full px-3 shadow-sm ring">
          <Linear className="size-3.5" />
        </div>
      </div>
      <div className="relative flex h-10 items-center gap-20 px-8">
        <div className="bg-border absolute inset-0 my-auto h-px"></div>

        <div className="bg-card shadow-black/6.5 ring-border relative flex h-8 items-center rounded-full px-3 shadow-sm ring">
          <Supabase className="size-3.5" />
        </div>
        <div className="bg-card shadow-black/6.5 ring-border relative flex h-8 items-center rounded-full px-3 shadow-sm ring">
          <Firebase className="size-3.5" />
        </div>
      </div>
    </div>
  );
};

const RealTimeIllustration = () => {
  return (
    <div aria-hidden className="relative h-44 translate-y-6">
      <div className="bg-foreground/15 absolute inset-0 mx-auto w-px"></div>
      <div className="absolute -inset-x-16 top-6 aspect-square rounded-full border"></div>
      <div className="border-primary mask-l-from-50% mask-l-to-90% mask-r-from-50% mask-r-to-50% absolute -inset-x-16 top-6 aspect-square rounded-full border"></div>
      <div className="absolute -inset-x-8 top-24 aspect-square rounded-full border"></div>
      <div className="mask-r-from-50% mask-r-to-90% mask-l-from-50% mask-l-to-50% absolute -inset-x-8 top-24 aspect-square rounded-full border border-lime-500"></div>
    </div>
  );
};

const EnterpriseIllustration = () => {
  return (
    <div
      aria-hidden
      className="relative flex size-44 items-center justify-center"
    >
      <Shield className="absolute inset-0 size-full stroke-[0.1px] opacity-15" />
      <Shield className="fill-card dark:fill-foreground/10 drop-shadow-black/3 stroke-border size-32 stroke-[0.2px] drop-shadow-xl" />
    </div>
  );
};

const DeveloperIllustration = () => {
  return (
    <div
      aria-hidden
      className="*:bg-foreground/15 flex h-44 justify-between pb-6 pt-12 *:h-full *:w-px"
    >
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div className="bg-primary!"></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div className="bg-primary!"></div>
      <div></div>
      <div></div>
      <div></div>
      <div className="bg-primary!"></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div className="bg-primary!"></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div className="bg-primary!"></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div className="bg-primary!"></div>
    </div>
  );
};
