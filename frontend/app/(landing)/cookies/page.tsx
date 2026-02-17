import { constructMetadata } from "@/lib/generate-metadata";

export const metadata = constructMetadata({
  title: "Cookies Policy - ScamShield",
  description:
    "Learn about ScamShield's use of cookies and how we protect your privacy while enhancing your experience on our platform.",
});

export default function CookiesPolicy() {
  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-3xl px-6">
        <h1 className="text-4xl font-serif font-medium mb-6">Cookies Policy</h1>
        <p className="text-muted-foreground mb-8 text-lg">
          This Cookies Policy explains how ScamShield uses cookies and similar
          technologies to recognize you when you visit our website.
        </p>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-3">What Are Cookies?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Cookies are small data files that are placed on your computer or
              mobile device when you visit a website. They are widely used to
              make websites work more efficiently and to provide reporting
              information.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">Why We Use Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies for several reasons. Some cookies are required for
              technical reasons for our website to operate, which we refer to as
              "essential" or "strictly necessary" cookies. Other cookies allow
              us to track and target the interests of our users to enhance our
              services.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">
              Types of Cookies We Use
            </h2>
            <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 mt-2">
              <li>
                <strong>Essential Cookies:</strong> Necessary for the website to
                function properly.
              </li>
              <li>
                <strong>Analytics Cookies:</strong> Help us understand how
                visitors interact with our website.
              </li>
              <li>
                <strong>Functionality Cookies:</strong> Allow the website to
                remember choices you make.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">Your Choices</h2>
            <p className="text-muted-foreground leading-relaxed">
              You have the right to decide whether to accept or reject cookies.
              You can set or amend your web browser controls to accept or refuse
              cookies. If you choose to reject cookies, you may still use our
              website, though your access to some functionality and areas may be
              restricted.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">
              Updates to This Policy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Cookies Policy from time to time in order to
              reflect, for example, changes to the cookies we use or for other
              operational, legal, or regulatory reasons.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
