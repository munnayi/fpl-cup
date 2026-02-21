export type Team = {
  name: string
  logo: string
  id: number // FPL entry ID
}

export const teams: Team[] = [
  { name: "Paizão Wade FC", id: 161013, logo: "/logos/paizao-wade-fc.svg" },
  { name: "Mun United", id: 5249, logo: "/logos/mun-united.png" },
  { name: "Mun City", id: 4632, logo: "/logos/mun-city.svg" },
  { name: "Burgenius FC", id: 177183, logo: "/logos/burgenius-fc.svg" },
  { name: "KEFM FC", id: 49923, logo: "/logos/kefm-fc.svg" },
  { name: "Howells Hounds FC", id: 177065, logo: "/logos/howells-hounds.png" },
  { name: "Voodoo Papa FC", id: 177716, logo: "/logos/voodoo-papa.svg" },
  { name: "Masterchefs HR Team", id: 5074, logo: "/logos/masterchefs.png" },
]