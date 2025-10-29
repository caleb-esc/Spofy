import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Text,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import api from "../utils/api";
import TrackRow from "../components/TrackRow";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState([]);
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);

  async function onSearch(text) {
    setQuery(text);
    if (text.length < 2) {
      setTracks([]);
      setArtists([]);
      setAlbums([]);
      return;
    }
    setLoading(true);
    try {
      const results = await api.search(text, 30);
      // dedupe artists and albums
      const artistMap = {};
      const albumMap = {};
      results.forEach((r) => {
        if (r.artistName) artistMap[r.artistName] = r;
        if (r.collectionName) albumMap[r.collectionName] = r;
      });
      setTracks(results);
      setArtists(Object.values(artistMap).slice(0, 10));
      setAlbums(Object.values(albumMap).slice(0, 10));
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TextInput
          placeholder="Search for songs, artists or albums"
          placeholderTextColor="#666"
          value={query}
          onChangeText={onSearch}
          style={styles.input}
        />
        {loading && <ActivityIndicator size="small" color="#1DB954" style={{ margin: 12 }} />}
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          {tracks.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Tracks</Text>
              {tracks.map((t) => (
                <TrackRow key={t.trackId || t.trackName} track={t} />
              ))}
            </>
          )}
          {artists.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Artists</Text>
              {artists.map((a) => (
                <TrackRow key={"artist-" + a.artistId || a.artistName} track={a} showArtistOnly />
              ))}
            </>
          )}
          {albums.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Albums</Text>
              {albums.map((a) => (
                <TrackRow key={"album-" + (a.collectionId || a.collectionName)} track={a} showAlbumOnly />
              ))}
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#121212" },
  container: { padding: 12, flex: 1 },
  input: {
    backgroundColor: "#202020",
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  sectionTitle: { color: "#fff", marginTop: 18, marginBottom: 8, fontWeight: "700" },
});