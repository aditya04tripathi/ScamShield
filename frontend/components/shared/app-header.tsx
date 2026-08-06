import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/shared/logo";
import {
  ChevronDown,
  History,
  LayoutDashboard,
  LogOut,
  ShieldAlert,
  ShieldCheck,
  User,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { signOut } from "@/lib/actions/auth.actions";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Scan History", href: "/history", icon: History },
  { name: "Report Scam", href: "/profile?tab=report", icon: ShieldAlert },
];

const scanOptions = [
  { name: "Email Analysis", href: "/scan/email" },
  { name: "URL Scanner", href: "/scan/url" },
  { name: "File Scanner", href: "/scan/file" },
  { name: "Audio Deepfake", href: "/scan/audio" },
  { name: "Prompt Injection", href: "/scan/prompt" },
];

export async function AppHeader() {
  const session = await getSession();

  return (
    <header className="h-20 flex items-center sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="max-w-5xl container mx-auto flex h-14 items-center">
        <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
          <Logo variant="logo-text" />
        </Link>
        <nav className="flex items-center space-x-6 text-sm font-medium">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-2"
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 gap-1 pl-2 text-foreground/60 text-sm"
              >
                <ShieldCheck className="h-4 w-4" />
                Scanners
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {scanOptions.map((option) => (
                <DropdownMenuItem key={option.href} asChild>
                  <Link href={option.href} className="cursor-pointer">
                    {option.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"outline"}>
                {session?.user?.email || "Account"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <User />
                  Profile
                </Link>
              </DropdownMenuItem>
              <form action={signOut}>
                <DropdownMenuItem asChild>
                  <button className="w-full flex items-center gap-2 text-destructive cursor-pointer">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </DropdownMenuItem>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
