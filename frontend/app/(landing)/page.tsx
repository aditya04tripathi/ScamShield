import CallToAction from "@/components/marketings/call-to-action-1";
import FAQs from "@/components/marketings/faqs-2";
import Features from "@/components/marketings/features-3";
import HeroSection from "@/components/marketings/hero-section-4";
import { constructMetadata } from "@/lib/generate-metadata";
import { Metadata } from "next";

export const metadata: Metadata = constructMetadata();

const IndexPage = () => {
  return (
    <>
      <HeroSection />
      <div id="features">
        <Features />
      </div>
      <CallToAction />
      <div id="faq">
        <FAQs />
      </div>
    </>
  );
};

export default IndexPage;
