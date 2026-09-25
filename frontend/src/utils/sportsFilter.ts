/**
 * sportsFilter.ts
 * Shared utility to exclude sports/fitness/turf venues and content
 * from the Band / Entertainment marketplace pages.
 */

export const SPORTS_KEYWORDS = [
  "turf", "sports", "cricket", "football", "soccer", "badminton",
  "basketball", "volleyball", "tennis", "swimming", "gym", "fitness",
  "ground", "court", "field", "stadium", "club sports", "squash",
  "hockey", "rugby", "athletics", "track", "pitch", "padel", "pickleball",
  "boxing", "wrestling", "martial arts", "table tennis", "kabaddi",
  "skating", "golf", "snooker", "billiards", "chess", "archery",
  "shooting", "rowing", "cycling", "sports club", "sports arena",
];

/**
 * Returns true if the venue is an entertainment venue (not a sports venue).
 * Checks name, type/category, and tags.
 */
export function isEntertainmentVenue(venue: Record<string, unknown>): boolean {
  const name = String(venue.name || venue.venue_name || venue.display_name || "").toLowerCase();
  const type = String(venue.venue_type || venue.type || venue.category || "").toLowerCase();
  const tags = Array.isArray(venue.tags)
    ? (venue.tags as string[]).join(" ").toLowerCase()
    : String(venue.tags || "").toLowerCase();
  const combined = `${name} ${type} ${tags}`;
  return !SPORTS_KEYWORDS.some((kw) => combined.includes(kw));
}

/**
 * Returns true if the artist/band is an entertainment performer (not sports-related).
 */
export function isEntertainmentArtist(artist: Record<string, unknown>): boolean {
  const name = String(artist.name || artist.display_name || "").toLowerCase();
  const genre = Array.isArray(artist.genre)
    ? (artist.genre as string[]).join(" ").toLowerCase()
    : String(artist.genre || "").toLowerCase();
  const type = String(artist.band_type || artist.type || artist.category || "").toLowerCase();
  const combined = `${name} ${genre} ${type}`;
  return !SPORTS_KEYWORDS.some((kw) => combined.includes(kw));
}
