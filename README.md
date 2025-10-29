```markdown
## Spotify PKCE Auth (Expo + React Native)

What I added
- A PKCE-based Spotify client-side auth implementation using expo-auth-session.
- A Login / Account screen that lets users sign in with their Spotify account and stores tokens in SecureStore.
- The flow does NOT require or use your Spotify client secret — this is the recommended pattern for native apps.

Setup steps
1. Install new deps:
   npm install expo-auth-session expo-secure-store

2. Add the config file:
   - Open `src/config/spotify.js` and replace `<YOUR_SPOTIFY_CLIENT_ID>` with your Spotify application's Client ID.
   - Leave client secret out of your app. Do not commit any secret to source control.

3. Register redirect URIs in your Spotify app settings:
   - For development/testing with Expo, using the Expo proxy redirect usually works (AuthSession.makeRedirectUri({ useProxy: true }))
   - If you publish the app or use a custom scheme, add that redirect URI in the Spotify dashboard.

4. Run the app:
   npm start
   - Open on device/simulator. Use the "Account" tab to log in.

How the auth works
- The app starts the Authorization Code flow with PKCE (code challenge/verifier).
- Spotify returns an authorization code to the redirect URI.
- The client exchanges the code for access + refresh tokens (PKCE lets the client do this without a secret).
- Tokens and the user's profile are stored in SecureStore for reuse and the access token is refreshed automatically when needed.

Notes and next steps
- Scope: We requested only basic read scopes by default. Add scopes for playback control if you plan to call endpoints that require them (e.g., user-modify-playback-state).
- Playback: To actually control Spotify playback (start/stop/seek on the user's Spotify app or a Spotify Connect device) you must request appropriate scopes and the user's account must have an active Spotify client (or use the Spotify SDK).
- Secure server: If you prefer server-side token handling (keeping refresh tokens server-side), I can add an Express server for refresh token management; I will NOT embed secrets into committed files — the server will expect secrets in environment variables.

If you want, I can:
- Add a small API wrapper that uses getAuthHeader() to call Spotify Web API endpoints from the app (profile, search, tracks, etc.).
- Add playback examples using the Spotify Web API (requires additional scopes and knowledge of the user's playback devices).
- Wire authentication state into the existing PlayerContext so you can use Spotify search & preview logic when logged in.
```