import { AppHeader } from "@/components/shared/app-header";
import Footer from "@/components/shared/footer-3";

export default function ApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1 min-h-[calc(100vh-5rem)] space-y-4 p-8 pt-6">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
