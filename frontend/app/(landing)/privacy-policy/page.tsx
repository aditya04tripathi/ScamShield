import { constructMetadata } from "@/lib/generate-metadata";

export const metadata = constructMetadata({
  title: "Privacy Policy - ScamShield",
  description:
    "Learn about ScamShield's privacy practices and how we protect your personal information while providing our advanced scam detection services.",
});

export default function PrivacyPolicy() {
  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-3xl px-6">
        <h1 className="text-4xl font-serif font-medium mb-6">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8 text-lg">
          At ScamShield, we take your privacy seriously. This policy describes
          how we collect, use, and protect your personal information when you
          use our scam detection services.
        </p>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-3">
              Information We Collect
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect information you provide directly to us, such as when
              you create an account, submit a report, or contacting our support
              team. This may include your name, email address, and the details
              of any suspected scams you report.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">
              How We Use Your Information
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We use the information we collect to operate, maintain, and
              improve our services, including to analyze trends, detect
              potential threats, and communicate with you about your account and
              our services.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate technical and organizational measures to
              protect the security of your personal information against
              unauthorized access, disclosure, or misuse.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">
              Sharing of Information
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We do not sell your personal information. We may share your
              information with third-party service providers who perform
              services on our behalf, subject to confidentiality agreements.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy, please
              contact us at privacy@ScamShield.com.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
