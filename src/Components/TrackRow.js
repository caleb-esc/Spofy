import React, { useContext } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { PlayerContext } from "../context/PlayerContext";

export default function TrackRow({ track, showArtistOnly = false, showAlbumOnly = false }) {
  const { playNow, addToQueue } = useContext(PlayerContext);

  const artwork = track.artworkUrl100 || track.artworkUrl60 || null;
  const title = track.trackName || track.collectionName || track.artistName;
  const subtitle = showArtistOnly ? "" : track.artistName || track.collectionCensoredName || "";

  function handlePlay() {
    // If item has a previewUrl, play it; otherwise do a search by track name fallback (PlayerContext expects a track object)
    playNow(track);
  }

  return (
    <TouchableOpacity style={styles.container} onPress={handlePlay}>
      <Image
        source={
          artwork
            ? { uri: artwork.replace("100x100", "200x200") }
            : require("../../assets/placeholder.png")
        }
        style={styles.art}
      />
      <View style={styles.meta}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <TouchableOpacity style={styles.addBtn} onPress={() => addToQueue(track)}>
        <Text style={styles.addText}>＋</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#181818",
    marginBottom: 12,
    padding: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  art: { width: 64, height: 64, borderRadius: 4 },
  meta: { marginLeft: 12, flex: 1 },
  title: { color: "#fff", fontWeight: "700" },
  subtitle: { color: "#b3b3b3", marginTop: 4 },
  addBtn: {
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  addText: { color: "#1DB954", fontSize: 20 },
});