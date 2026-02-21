// lib/data.ts
// Scores/fixtures now come from the API.
// This file only defines league teams + logos (and optional helpers for lookups).

export type Team = {
  id: number;            // FPL entry/team id (used by API calls)
  name: string;
  logo: string;          // path under /public (e.g. /logos/team.svg or .png)
};

export const teams: Team[] = [
  { name: "Paizão Wade FC",        logo: "/logos/paizao-wade-fc.svg", id: 161013 },
  { name: "Mun United",            logo: "/logos/mun-united.png",     id: 5249 },
  { name: "Mun City",              logo: "/logos/mun-city.svg",       id: 4632 },
  { name: "Burgenius FC",          logo: "/logos/burgenius-fc.svg",   id: 177183 },
  { name: "KEFM FC",               logo: "/logos/kefm-fc.svg",        id: 49923 },
  { name: "Howells Hounds FC",     logo: "/logos/howells-hounds.png", id: 177065 },
  { name: "Voodoo Papa FC",        logo: "/logos/voodoo-papa.svg",    id: 177716 },
  { name: "Masterchefs HR Team",   logo: "/logos/masterchefs.png",    id: 5074 },
];

// Handy lookups for UI components
export const teamByName: Record<string, Team> = Object.fromEntries(
  teams.map((t) => [t.name, t])
);

export const teamById: Record<number, Team> = Object.fromEntries(
  teams.map((t) => [t.id, t])
);

/**
 * Optional helper for UI:
 * - Use when API returns an unknown/new team name.
 * - Prevents runtime crashes in components expecting a logo.
 */
export function getTeamLogo(teamName: string): string | undefined {
  return teamByName[teamName]?.logo;
}