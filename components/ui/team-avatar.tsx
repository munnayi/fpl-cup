// components/ui/team-avatar.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { teams } from "@/lib/data";
import { cn } from "@/lib/utils"; // small classnames helper

type Props = {
  teamName: string;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  nameClassName?: string; // 👈 add this
};

const sizes = {
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base",
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "").concat(parts[1]?.[0] ?? "").toUpperCase();
}

const teamByName = Object.fromEntries(teams.map((t) => [t.name, t]));

export default function TeamAvatar({
  teamName,
  size = "md",
  showName = true,
  nameClassName, // 👈 consume it
}: Props) {
  const team = teamByName[teamName];

  return (
    <div className="flex items-center justify-center gap-2 col-span-2">
      <Avatar className={sizes[size]}>
        <AvatarImage src={team?.logo} alt={teamName} />
        <AvatarFallback>{getInitials(teamName)}</AvatarFallback>
      </Avatar>
      {showName && (
        <span className={cn("font-medium leading-none text-sm md:text-md truncate", nameClassName)}>
          {teamName}
        </span>
      )}
    </div>
  );
}
