"use server";

import connectToDatabase from "@/lib/db/connect";
import User from "@/lib/db/models/user.model";
import bcrypt from "bcryptjs";
import { createSession, deleteSession, getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function signUp(prevState: any, formData: FormData) {
  try {
    const email = String(formData.get("email") || "")
      .trim()
      .toLowerCase();
    const password = formData.get("password") as string;
    const firstName = String(formData.get("firstName") || "").trim();
    const lastName = String(formData.get("lastName") || "").trim();

    if (!email || !password) {
      return { error: "Please enter both email and password." };
    }

    if (password.length < 8) {
      return { error: "Password must be at least 8 characters." };
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { error: "User already exists with this email." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email,
      password: hashedPassword,
      role: "user",
      firstName,
      lastName,
    });

    await createSession({
      id: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
    });
  } catch (error: any) {
    return { error: error.message || "Something went wrong during sign up." };
  }

  redirect("/dashboard");
}

export async function signIn(prevState: any, formData: FormData) {
  try {
    const email = String(formData.get("email") || "")
      .trim()
      .toLowerCase();
    const password = formData.get("password") as string;

    if (!email || !password) {
      return { error: "Please enter both email and password." };
    }

    await connectToDatabase();

    const user = await User.findOne({ email }).select("+password");

    if (!user || !user.password) {
      return { error: "Invalid credentials." };
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return { error: "Invalid credentials." };
    }

    await createSession({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });
  } catch (error: any) {
    return { error: error.message || "Something went wrong during sign in." };
  }

  redirect("/dashboard");
}

export async function signOut() {
  await deleteSession();
  redirect("/auth/sign-in");
}

export async function updateProfile(prevState: any, formData: FormData) {
  try {
    const session = await getSession();
    if (!session) {
      return { error: "Unauthorized" };
    }

    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const bio = formData.get("bio") as string;

    await connectToDatabase();

    await User.findByIdAndUpdate(session.user.id, {
      firstName,
      lastName,
      bio,
    });

    revalidatePath("/profile");
    return { success: true };
  } catch (error: any) {
    return {
      error: error.message || "Something went wrong while updating profile.",
    };
  }
}

export async function changePassword(prevState: any, formData: FormData) {
  try {
    const session = await getSession();
    if (!session) {
      return { error: "Unauthorized" };
    }

    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;

    if (!currentPassword || !newPassword) {
      return { error: "Please fill in all fields." };
    }

    if (newPassword.length < 8) {
      return { error: "New password must be at least 8 characters." };
    }

    await connectToDatabase();

    const user = await User.findById(session.user.id).select("+password");

    if (!user || !user.password) {
      return { error: "User not found." };
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return { error: "Current password is incorrect." };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(session.user.id, {
      password: hashedPassword,
    });

    // Delete session to force re-login
    await deleteSession();
  } catch (error: any) {
    return {
      error: error.message || "Something went wrong while changing password.",
    };
  }

  redirect("/auth/sign-in");
}
