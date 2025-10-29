import React, { useEffect, useState, useContext } from "react";
import { View, Text, SafeAreaView, ScrollView, StyleSheet, RefreshControl } from "react-native";
import TrackRow from "../components/TrackRow";
import api from "../utils/api";
import { PlayerContext } from "../context/PlayerContext";

export default function HomeScreen() {
  const [suggested, setSuggested] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [because, setBecause] = useState([]);
  const { lastPlayed } = useContext(PlayerContext);

  async function loadSuggested() {
    setRefreshing(true);
    try {
      // Simple "general" suggestions by searching broad terms
      const res = await api.search("top hits", 12);
      setSuggested(res);
    } catch (e) {
      console.warn(e);
    } finally {
      setRefreshing(false);
    }
  }

  async function loadBecause() {
    if (!lastPlayed) {
      setBecause([]);
      return;
    }
    try {
      // Recommend by artist: fetch more songs by same artist
      const artist = lastPlayed.artistName || lastPlayed.artist;
      const res = await api.search(artist, 8);
      // remove the exact same track if present
      const filtered = res.filter((t) => t.trackId !== lastPlayed.trackId).slice(0, 6);
      setBecause(filtered);
    } catch (e) {
      console.warn(e);
    }
  }

  useEffect(() => {
    loadSuggested();
  }, []);

  useEffect(() => {
    loadBecause();
  }, [lastPlayed]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadSuggested} />}
      >
        <Text style={styles.sectionTitle}>Suggested for you</Text>
        <View style={styles.row}>
          {suggested.map((t) => (
            <TrackRow key={t.trackId || t.trackName} track={t} />
          ))}
        </View>

        {because.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Because you played {lastPlayed.trackName}</Text>
            <View style={styles.row}>
              {because.map((t) => (
                <TrackRow key={t.trackId || t.trackName} track={t} />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#121212" },
  container: { padding: 16 },
  sectionTitle: { color: "#ffffff", fontSize: 20, marginVertical: 12, fontWeight: "700" },
  row: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
});