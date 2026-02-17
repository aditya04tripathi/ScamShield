"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";

const MODALITIES = [
  { value: "all", label: "All Types" },
  { value: "email", label: "Email" },
  { value: "url", label: "URL" },
  { value: "file", label: "File" },
  { value: "audio", label: "Audio" },
  { value: "prompt", label: "Prompt" },
];

const RISK_TIERS = [
  { value: "all", label: "All Risk Levels" },
  { value: "safe", label: "Safe" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

export function HistoryFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const modality = searchParams.get("modality") ?? "all";
  const riskTier = searchParams.get("riskTier") ?? "all";
  const search = searchParams.get("search") ?? "";

  const createQueryString = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value && value !== "all" && value !== "") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      params.delete("page");
      return params.toString();
    },
    [searchParams],
  );

  const handleModalityChange = (value: string) => {
    router.push(`${pathname}?${createQueryString({ modality: value })}`);
  };

  const handleRiskTierChange = (value: string) => {
    router.push(`${pathname}?${createQueryString({ riskTier: value })}`);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchValue = formData.get("search") as string;
    router.push(`${pathname}?${createQueryString({ search: searchValue })}`);
  };

  const hasActiveFilters =
    modality !== "all" || riskTier !== "all" || search !== "";

  const clearFilters = () => {
    router.push(pathname);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
      <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          name="search"
          placeholder="Search scans..."
          defaultValue={search}
          className="pl-9"
        />
      </form>

      <Select value={modality} onValueChange={handleModalityChange}>
        <SelectTrigger className="w-37.5">
          <SelectValue placeholder="Scan Type" />
        </SelectTrigger>
        <SelectContent>
          {MODALITIES.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={riskTier} onValueChange={handleRiskTierChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Risk Level" />
        </SelectTrigger>
        <SelectContent>
          {RISK_TIERS.map((r) => (
            <SelectItem key={r.value} value={r.value}>
              {r.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="gap-1"
        >
          <X className="h-3 w-3" />
          Clear
        </Button>
      )}
    </div>
  );
}
