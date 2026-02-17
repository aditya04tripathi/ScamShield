import type { Metadata } from "next";

export function constructMetadata({
  title = "ScamShield - Your AI Shield Against Digital Deception",
  description = "Detect deepfakes, phishing, and malware instantly with our advanced AI-powered forensic tools.",
  image = "/opengraph-image.png",
  icons = "/favicon.ico",
  noIndex = false,
}: {
  title?: string;
  description?: string;
  image?: string;
  icons?: string;
  noIndex?: boolean;
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@scamshield",
    },
    icons,
    metadataBase: new URL("https://scamshield.up.railway.app"),
    ...(noIndex
      ? {
          robots: {
            index: false,
            follow: false,
          },
        }
      : {
          robots: {
            index: true,
            follow: true,
          },
        }),
  };
}
