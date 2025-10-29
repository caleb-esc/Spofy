// Spotify client configuration for the app (PKCE flow).
// Client secret must never be stored in the client app.
export const SPOTIFY_CLIENT_ID = '<YOUR_SPOTIFY_CLIENT_ID>';

// For Expo managed workflow we build the redirect URI dynamically.
// Leave REDIRECT_URI null to let the auth hook call AuthSession.makeRedirectUri() with useProxy: true.
export const REDIRECT_URI = null;

export const SPOTIFY_SCOPES = [
  'user-read-private',
  'user-read-email',
  // add more scopes if your app needs them, e.g. 'user-modify-playback-state'
];
