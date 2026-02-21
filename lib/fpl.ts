const BASE_URL = "https://fantasy.premierleague.com/api"

export async function getManagerGwPoints(entryId: number, gw: number) {
  const res = await fetch(
    `${BASE_URL}/entry/${entryId}/event/${gw}/picks/`,
    { cache: "no-store" }
  )

  if (!res.ok) return null

  const data = await res.json()
  return data.entry_history?.points ?? null
}