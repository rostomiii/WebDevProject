const TOKEN_URL = "https://accounts.spotify.com/api/token";
const API_URL = "https://api.spotify.com/v1";

// Token cache: reuse the same token until it's about to expire,
// instead of asking Spotify for a new one on every search.
let cachedToken = null;
let tokenExpiresAt = 0;

const getAccessToken = async () => {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;

  // Spotify wants "clientId:clientSecret" encoded in base64
  const credentials = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });

  if (!response.ok) {
    throw new Error(`Spotify token request failed: ${response.status}`);
  }

  const data = await response.json();
  cachedToken = data.access_token;
  // expires_in is in seconds (usually 3600). Refresh 60s early to be safe.
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken;
};

// Turn Spotify's huge track object into the shape of our Song model
const formatTrack = (track) => ({
  spotifyId: track.id,
  title: track.name,
  artists: track.artists.map((artist) => artist.name),
  album: track.album.name,
  imageUrl: track.album.images[0]?.url,
  durationMs: track.duration_ms,
  spotifyUrl: track.external_urls.spotify,
});

export const searchTracks = async (query) => {
  const token = await getAccessToken();

  // Spotify's max is 10 per request for dev-mode apps
  const params = new URLSearchParams({ q: query, type: "track", limit: "10" });

  const response = await fetch(`${API_URL}/search?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Spotify search failed: ${response.status}`);
  }

  const data = await response.json();
  return data.tracks.items.map(formatTrack);
};