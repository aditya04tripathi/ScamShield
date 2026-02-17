import { constructMetadata } from "@/lib/generate-metadata";

export const metadata = constructMetadata({
  title: "Terms of Service - ScamShield",
  description:
    "Read the Terms of Service for ScamShield, outlining your rights and responsibilities when using our advanced scam detection platform.",
});

export default function TermsOfService() {
  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-3xl px-6">
        <h1 className="text-4xl font-serif font-medium mb-6">
          Terms of Service
        </h1>
        <p className="text-muted-foreground mb-8 text-lg">
          Please read these Terms of Service ("Terms") carefully before using
          the ScamShield scam detection platform and services.
        </p>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-3">
              1. Acceptance of Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using our services, you agree to be bound by these
              Terms and our Privacy Policy. If you do not agree to these Terms,
              you may not use our services.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">2. Use of Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to use our services only for lawful purposes and in
              accordance with these Terms. You are responsible for maintaining
              the confidentiality of your account credentials and for all
              activities that occur under your account.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">
              3. Intellectual Property
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              The content, features, and functionality of our services are owned
              by ScamShield and are protected by international copyright,
              trademark, and other intellectual property laws.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">
              4. Limitation of Liability
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              ScamShield shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages resulting from your
              access to or use of, or inability to access or use, the services.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">5. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms at any time. We will
              notify you of any material changes by posting the new Terms on
              this page. Your continued use of the services after such changes
              constitutes your acceptance of the new Terms.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms, please contact us at
              legal@ScamShield.com.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
