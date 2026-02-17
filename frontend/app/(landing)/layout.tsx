import Footer from "@/components/shared/footer-3";
import { HeroHeader } from "@/components/shared/header";

const LandingPage = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <HeroHeader />
      <main className="min-h-[calc(100vh-5rem)]">
        <div className="mx-auto max-w-5xl px-4 md:px-6">{children}</div>
      </main>
      <Footer />
    </>
  );
};

export default LandingPage;
