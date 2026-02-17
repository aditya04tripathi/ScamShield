"use client";

import {
  Card,
  CardTitle,
  CardHeader,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { CheckCircle } from "lucide-react";
import { useActionState } from "react";
import { updateProfile } from "@/lib/actions/auth.actions";
import { IUser } from "@/lib/db/models/user.model";

const GeneralTab = ({ user }: { user: IUser }) => {
  const [state, action, isPending] = useActionState(updateProfile, undefined);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Update your account's profile information and email address.
        </CardDescription>
      </CardHeader>
      <form action={action}>
        <CardContent className="space-y-6 pb-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.imageUrl} alt="Profile" />
              <AvatarFallback className="text-lg">
                {user.email?.[0]}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm">
              Change Avatar
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                name="firstName"
                placeholder="John"
                id="firstName"
                defaultValue={user.firstName || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                name="lastName"
                placeholder="Doe"
                id="lastName"
                defaultValue={user.lastName || ""}
              />
            </div>
          </div>

          <div className="space-y-2 cursor-not-allowed">
            <Label htmlFor="email">Email</Label>
            <Input
              disabled
              name="email"
              placeholder="john@doe.com"
              id="email"
              defaultValue={user.email}
              type="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              name="bio"
              id="bio"
              placeholder="Tell us a little bit about yourself"
              className="resize-none"
              defaultValue={user.bio || ""}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-4">
          {state?.success && (
            <Alert className="bg-green-50 text-green-900 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900/50">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                Your profile has been updated successfully.
              </AlertDescription>
            </Alert>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default GeneralTab;
