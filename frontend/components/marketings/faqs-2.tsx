"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";

const faqItems = [
  {
    id: "item-1",
    question: "How does the scam detection work?",
    answer:
      "We use a combination of AI analysis, real-time threat databases, and community reporting to identify and flag potential scams instantly.",
  },
  {
    id: "item-2",
    question: "Is my personal data safe?",
    answer:
      "Yes, absolutely. We prioritize your privacy and do not store sensitive personal information. Our analysis is focused on detecting threats, not tracking users.",
  },
  {
    id: "item-3",
    question: "Can I report a scam I found?",
    answer:
      "Yes! Our community-driven model relies on users like you. You can easily report suspicious websites, emails, or messages directly through our platform.",
  },
  {
    id: "item-4",
    question: "Is there a free version?",
    answer:
      "Yes, we offer a robust free version that protects you from common threats. We also have premium plans for advanced features like dedicated support and deeper analysis.",
  },
  {
    id: "item-5",
    question: "What platforms do you support?",
    answer:
      "We currently support major web browsers via extensions, and have mobile apps for iOS and Android to keep you safe on all your devices.",
  },
];

export default function FAQs() {
  return (
    <section className="bg-background @container py-24">
      <div className="mx-auto px-6">
        <div className="@xl:flex-row @xl:items-start @xl:gap-12 flex flex-col gap-8">
          <div className="@xl:sticky @xl:top-24 @xl:w-64 shrink-0">
            <h2 className="font-serif text-3xl font-medium">FAQs</h2>
            <p className="text-muted-foreground mt-3 text-sm">
              Your questions answered
            </p>
            <p className="text-muted-foreground @xl:block mt-6 hidden text-sm">
              Need more help?{" "}
              <Link
                href="#"
                className="text-primary font-medium hover:underline"
              >
                Contact us
              </Link>
            </p>
          </div>
          <div className="flex-1">
            <Accordion type="single" collapsible>
              {faqItems.map((item) => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className="border-dashed"
                >
                  <AccordionTrigger
                    className="cursor-pointer py-4 text-sm font-medium hover:no-underline"
                    style={{
                      fontFamily: "var(--font-dm-serif-display) !important",
                    }}
                  >
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground pb-2 text-sm">
                      {item.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <p className="text-muted-foreground @xl:hidden mt-6 text-sm">
              Need more help?{" "}
              <Link
                href="#"
                className="text-primary font-medium hover:underline"
              >
                Contact us
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
