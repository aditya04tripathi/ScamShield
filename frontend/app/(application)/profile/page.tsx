import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GeneralTab from "@/components/profile/general-tab";
import SecurityTab from "@/components/profile/security-tab";
import ReportTab from "@/components/profile/report-tab";
import { constructMetadata } from "@/lib/generate-metadata";
import { getUserProfile } from "@/lib/actions/user.action";

export const metadata = constructMetadata({
  title: "Profile - ScamShield",
  description:
    "Manage your account settings, security preferences, and support requests in one convenient place. Keep your profile up to date and stay connected with ScamShield.",
});

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const sp = await searchParams;
  const tab = sp?.tab || "general";

  const user = await getUserProfile();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-medium">Account Settings</h3>
        <p className="text-muted-foreground">
          Manage your account profile and support requests.
        </p>
      </div>

      <Tabs defaultValue={tab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-100">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="report">Report Scam</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 pt-4">
          <GeneralTab user={user!} />
        </TabsContent>

        <TabsContent value="security" className="space-y-4 pt-4">
          <SecurityTab />
        </TabsContent>

        <TabsContent value="report" className="space-y-4 pt-4">
          <ReportTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
