"use server";

import connectToDatabase from "@/lib/db/connect";
import User, { IUser } from "@/lib/db/models/user.model";
import { getSession } from "@/lib/auth";

export async function getUserProfile(): Promise<IUser | null> {
  try {
    const session = await getSession();
    if (!session) return null;

    await connectToDatabase();
    const user = (await User.findById(session.user.id)) as IUser;
    if (!user) return null;

    return JSON.parse(JSON.stringify(user)) as IUser;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}
