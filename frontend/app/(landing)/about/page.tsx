import { constructMetadata } from "@/lib/generate-metadata";

export const metadata = constructMetadata({
  title: "About Us - ScamShield",
  description:
    "Learn about ScamShield, our mission to combat digital fraud, and the passionate team behind our innovative scam detection platform.",
});

export default function About() {
  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-3xl px-6">
        <h1 className="text-4xl font-serif font-medium mb-6">
          About ScamShield
        </h1>
        <p className="text-xl text-muted-foreground mb-12">
          We are on a mission to build a safer internet by empowering
          individuals and businesses to detect and prevent digital fraud.
        </p>

        <div className="space-y-12">
          <div className="aspect-video relative rounded-xl overflow-hidden bg-muted">
            {/* Placeholder for an about image */}
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              Company Image
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-semibold mb-3">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                To provide cutting-edge technology that identifies scams in
                real-time, protecting our users' financial and personal
                well-being.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-3">Our Vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                A world where digital interactions are trustworthy and safe for
                everyone, free from the fear of deception.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">Who We Are</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              ScamShield is a passion project built by three college students in
              their spare time. Driven by a desire to make the internet a safer
              place, we combined our skills in development and cybersecurity to
              create this platform.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We realized that while threats are evolving, the tools available
              to the average user were often too complex or expensive. Our goal
              is to bridge that gap with a simple, accessible solution.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">A Work in Progress</h2>
            <p className="text-muted-foreground leading-relaxed">
              As a student-led initiative, we are constantly learning and
              improving. We acknowledge that there is always scope for
              improvement in our detection algorithms and user experience. We
              welcome feedback and contributions from the community to help us
              grow and refine ScamShield into a robust defense against digital
              fraud.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
