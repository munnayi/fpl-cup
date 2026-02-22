export type Team = {
  name: string
  logo: string
  id: number // FPL entry ID
}

export const teams: Team[] = [
  { name: "Paizão Wade FC",        logo: "/logos/paizao-wade-fc.svg", id: 163530 },
  { name: "Mun United",            logo: "/logos/mun-united.png",     id: 5247 },
  { name: "Mun City",              logo: "/logos/mun-city.svg",       id: 4631 },
  { name: "Burgenius FC",          logo: "/logos/burgenius-fc.svg",   id: 179582 },
  { name: "KEFM FC",               logo: "/logos/kefm-fc.svg",        id: 51540 },
  { name: "Howells Hounds FC",     logo: "/logos/howells-hounds.png", id: 179465 },
  { name: "Voodoo Papa FC",        logo: "/logos/voodoo-papa.svg",    id: 180112 },
  { name: "Masterchefs HR Team",   logo: "/logos/masterchefs.png",    id: 5072 },
];