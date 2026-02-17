import { constructMetadata } from "@/lib/generate-metadata";
import Image from "next/image";

export const metadata = constructMetadata({
  title: "Our Team - ScamShield",
  description:
    "Meet the passionate team behind ScamShield, dedicated to making the internet a safer place for everyone.",
});

const members = [
  {
    avatar: "https://avatars.githubusercontent.com/u/47919550?v=4",
    name: "Meschac Irung",
    role: "Frontend Engineer at ScamShield",
  },
  {
    avatar: "https://avatars.githubusercontent.com/u/68236786?v=4",
    name: "Theo Balick",
    role: "Founder, CEO - ScamShield",
  },
  {
    avatar: "https://avatars.githubusercontent.com/u/12345678?v=4",
    name: "Sarah Johnson",
    role: "DevOps Engineer",
  },
  {
    avatar: "https://avatars.githubusercontent.com/u/98765432?v=4",
    name: "Alex Kim",
    role: "Product Manager",
  },
];

export default function Team() {
  return (
    <section className="bg-background @container py-24">
      <div className="mx-auto px-6">
        <div className="space-y-4">
          <h2 className="text-balance font-serif text-4xl font-medium">
            Meet Our Team
          </h2>
          <p className="text-muted-foreground text-balance">
            The security experts and engineers dedicated to keeping the internet
            safe for everyone.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-4 gap-6 text-sm">
          {members.map((member, index) => (
            <div key={index} className="w-full flex flex-col gap-4">
              <div className="relative w-full aspect-square rounded-xl shadow-md before:absolute before:inset-0 before:rounded-xl before:border before:border-foreground/10">
                <Image
                  src={member.avatar}
                  alt={member.name}
                  className="rounded-xl object-cover w-full h-full"
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
              </div>

              <div className="space-y-1">
                <p className="text-foreground text-sm font-medium">
                  {member.name}
                </p>
                <p className="text-muted-foreground text-sm">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
