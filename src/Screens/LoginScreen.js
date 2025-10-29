import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSpotifyAuth } from '../auth/spotifyAuth';
import { SPOTIFY_CLIENT_ID } from '../config/spotify';

export default function LoginScreen() {
  const { request, promptAsync, profile, accessToken, loading, signOut, fetchProfile } = useSpotifyAuth();

  useEffect(() => {
    // optionally fetch profile if we have a token but no profile in state
    if (accessToken && !profile) {
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  return (
    <View style={styles.safe}>
      <Text style={styles.header}>Account</Text>

      {!accessToken ? (
        <View style={styles.card}>
          <Text style={styles.p}>Sign in to Spotify (Authorization Code + PKCE)</Text>
          <TouchableOpacity
            style={[styles.button, { opacity: request ? 1 : 0.6 }]}
            disabled={!request}
            onPress={() => promptAsync({ useProxy: true })}
          >
            <Text style={styles.buttonText}>Log in with Spotify</Text>
          </TouchableOpacity>
          <Text style={styles.hint}>Client ID in config: {SPOTIFY_CLIENT_ID === '<YOUR_SPOTIFY_CLIENT_ID>' ? 'not set' : 'set'}</Text>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.p}>Signed in as</Text>
          <Text style={styles.user}>{profile?.display_name || profile?.id || 'Unknown'}</Text>
          <Text style={styles.small}>{profile?.email}</Text>

          <TouchableOpacity style={[styles.button, { backgroundColor: '#ff4d4d' }]} onPress={signOut}>
            <Text style={styles.buttonText}>Sign out</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading && <ActivityIndicator size="small" color="#1DB954" style={{ marginTop: 12 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#121212', padding: 16 },
  header: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 18 },
  card: { backgroundColor: '#181818', padding: 16, borderRadius: 8 },
  p: { color: '#b3b3b3', marginBottom: 12 },
  button: {
    backgroundColor: '#1DB954',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#000', fontWeight: '700' },
  hint: { color: '#999', marginTop: 12, fontSize: 12 },
  user: { color: '#fff', fontWeight: '700', fontSize: 18, marginTop: 8 },
  small: { color: '#b3b3b3', fontSize: 12, marginTop: 4 },
});