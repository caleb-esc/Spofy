import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { SPOTIFY_CLIENT_ID, REDIRECT_URI, SPOTIFY_SCOPES } from '../config/spotify';

const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

const STORE_KEY = {
  accessToken: '@spotify_access_token_v1',
  refreshToken: '@spotify_refresh_token_v1',
  tokenExpiry: '@spotify_token_expiry_v1',
  profile: '@spotify_profile_v1',
};

// Helper: save token data to secure store
async function saveTokenData({ access_token, refresh_token, expires_in }) {
  if (access_token) await SecureStore.setItemAsync(STORE_KEY.accessToken, access_token);
  if (refresh_token) await SecureStore.setItemAsync(STORE_KEY.refreshToken, refresh_token);
  if (expires_in) {
    const expiry = Date.now() + expires_in * 1000;
    await SecureStore.setItemAsync(STORE_KEY.tokenExpiry, String(expiry));
  }
}

// Helper: clear stored tokens/profile
async function clearAll() {
  await SecureStore.deleteItemAsync(STORE_KEY.accessToken);
  await SecureStore.deleteItemAsync(STORE_KEY.refreshToken);
  await SecureStore.deleteItemAsync(STORE_KEY.tokenExpiry);
  await SecureStore.deleteItemAsync(STORE_KEY.profile);
}

// A small hook providing PKCE-based Spotify auth, token storage, refresh, and a simple profile fetch.
export function useSpotifyAuth({ scopes = SPOTIFY_SCOPES } = {}) {
  const clientId = SPOTIFY_CLIENT_ID;
  // build redirect URI dynamically so it works with Expo dev client / published app
  const redirectUri = REDIRECT_URI || AuthSession.makeRedirectUri({ useProxy: true });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId,
      scopes,
      redirectUri,
      responseType: 'code',
      usePKCE: true,
      // showDialog: true, // optionally force accounts dialog
    },
    discovery
  );

  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // try to load stored tokens/profile on mount
  useEffect(() => {
    (async () => {
      try {
        const at = await SecureStore.getItemAsync(STORE_KEY.accessToken);
        const rt = await SecureStore.getItemAsync(STORE_KEY.refreshToken);
        const p = await SecureStore.getItemAsync(STORE_KEY.profile);
        if (at) setAccessToken(at);
        if (rt) setRefreshToken(rt);
        if (p) setProfile(JSON.parse(p));
      } catch (e) {
        console.warn('Failed to load stored Spotify tokens', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // handle the response from the /authorize redirect
  useEffect(() => {
    if (response?.type === 'success' && request) {
      const { code } = response.params;
      // exchange code for tokens
      (async () => {
        try {
          const tokenResult = await exchangeCodeForToken(code, request.codeVerifier, redirectUri, clientId);
          if (tokenResult.access_token) {
            await saveTokenData(tokenResult);
            setAccessToken(tokenResult.access_token);
            if (tokenResult.refresh_token) setRefreshToken(tokenResult.refresh_token);
            // fetch profile and store
            const me = await fetchProfile(tokenResult.access_token);
            if (me) {
              setProfile(me);
              await SecureStore.setItemAsync(STORE_KEY.profile, JSON.stringify(me));
            }
          } else {
            console.warn('Token exchange did not return access_token', tokenResult);
          }
        } catch (e) {
          console.warn('Error exchanging code for token', e);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response, request]);

  // Exchange authorization code (PKCE) for tokens
  async function exchangeCodeForToken(code, codeVerifier, redirect_uri, client_id) {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri,
      client_id,
      code_verifier: codeVerifier,
    }).toString();

    const r = await fetch(discovery.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    return r.json();
  }

  // Refresh an access token using refresh_token (PKCE allowed)
  async function refreshAccessToken() {
    const storedRefresh = refreshToken || (await SecureStore.getItemAsync(STORE_KEY.refreshToken));
    if (!storedRefresh) return null;
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: storedRefresh,
      client_id,
    }).toString();
    const r = await fetch(discovery.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const json = await r.json();
    if (json.access_token) {
      await saveTokenData(json);
      setAccessToken(json.access_token);
      if (json.refresh_token) {
        setRefreshToken(json.refresh_token);
      }
    } else {
      // clearing on failure may be prudent
      console.warn('Failed to refresh token', json);
    }
    return json;
  }

  // fetch current user's /me profile
  async function fetchProfile(token) {
    try {
      const t = token || accessToken;
      if (!t) return null;
      const r = await fetch('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (!r.ok) {
        // try a refresh if 401
        if (r.status === 401) {
          await refreshAccessToken();
          return fetchProfile(); // reattempt
        }
        return null;
      }
      return await r.json();
    } catch (e) {
      console.warn('fetchProfile error', e);
      return null;
    }
  }

  // sign out / clear tokens
  async function signOut() {
    await clearAll();
    setAccessToken(null);
    setRefreshToken(null);
    setProfile(null);
  }

  // helper to get Authorization header (refresh if needed)
  async function getAuthHeader() {
    // check expiry
    try {
      const expiry = await SecureStore.getItemAsync(STORE_KEY.tokenExpiry);
      if (expiry && Date.now() > Number(expiry) - 5000) {
        // token expired or about to expire
        await refreshAccessToken();
      }
    } catch (e) {
      // ignore
    }
    const t = (await SecureStore.getItemAsync(STORE_KEY.accessToken)) || accessToken;
    return t ? { Authorization: `Bearer ${t}` } : {};
  }

  return {
    request,
    promptAsync, // call to start the auth flow
    accessToken,
    refreshToken,
    profile,
    loading,
    fetchProfile,
    signOut,
    getAuthHeader,
  };
}