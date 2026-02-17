import { Button } from "@/components/ui/button";
import { constructMetadata } from "@/lib/generate-metadata";
import { getPendingReviews, getAdminStats } from "@/lib/actions/admin.actions";
import AdminReviewCard from "@/components/admin/review-card";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = constructMetadata({
  title: "Admin - ScamShield",
  description:
    "Access the admin review panel to evaluate flagged scans and user reports. Make informed decisions to maintain the integrity of our scam detection platform.",
});

export default async function AdminReviewPage() {
  const session = await getSession();

  if (!session || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const reviews = await getPendingReviews();
  const stats = await getAdminStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-medium">Admin Review Panel</h3>
          <p className="text-muted-foreground">
            Review flagged scans and user feedback. {stats?.pendingReviews ?? 0}{" "}
            pending reviews.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export Logs</Button>
          <Button>Settings</Button>
        </div>
      </div>

      <div className="grid gap-4">
        {reviews.length === 0 ? (
          <div className="text-center text-muted-foreground py-12 border rounded-lg">
            No pending reviews. All caught up!
          </div>
        ) : (
          reviews.map((scan: any) => (
            <AdminReviewCard key={scan._id} scan={scan} />
          ))
        )}
      </div>
    </div>
  );
}
