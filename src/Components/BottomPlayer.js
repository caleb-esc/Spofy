import React, { useContext, useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { PlayerContext } from "../context/PlayerContext";

export default function BottomPlayer() {
  const {
    queue,
    currentIndex,
    currentTrack,
    playbackStatus,
    togglePlayPause,
    skipToNext,
    skipToPrevious,
    seekTo
  } = useContext(PlayerContext);

  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(30);
  const widthAnim = new Animated.Value(0);

  useEffect(() => {
    if (!playbackStatus) return;
    const { positionMillis = 0, durationMillis = 30000 } = playbackStatus;
    setPosition(positionMillis / 1000);
    setDuration(durationMillis / 1000);
  }, [playbackStatus]);

  const artwork = currentTrack?.artworkUrl100?.replace("100x100", "200x200") || null;
  const title = currentTrack?.trackName || currentTrack?.collectionName || currentTrack?.artistName || "—";
  const artist = currentTrack?.artistName || "";

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.inner}>
        <Image
          source={artwork ? { uri: artwork } : require("../../assets/placeholder.png")}
          style={styles.art}
        />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {artist}
          </Text>
          <View style={styles.progressRow}>
            <View style={[styles.progressBar, { width: `${(duration ? (position / duration) * 100 : 0)}%` }]} />
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity onPress={skipToPrevious} style={styles.ctrlBtn}>
            <Text style={styles.ctrlText}>⏮️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={togglePlayPause} style={styles.playBtn}>
            <Text style={styles.playText}>{playbackStatus?.isPlaying ? "⏸" : "▶️"}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={skipToNext} style={styles.ctrlBtn}>
            <Text style={styles.ctrlText}>⏭️</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000",
    borderTopColor: "#222",
    borderTopWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  inner: { flexDirection: "row", alignItems: "center" },
  art: { width: 56, height: 56, borderRadius: 4 },
  title: { color: "#fff", fontWeight: "700" },
  artist: { color: "#b3b3b3", marginTop: 2 },
  controls: { flexDirection: "row", alignItems: "center", marginLeft: 8 },
  ctrlBtn: { padding: 8 },
  playBtn: {
    padding: 8,
    backgroundColor: "#1DB954",
    marginHorizontal: 6,
    borderRadius: 20,
  },
  playText: { color: "#000", fontWeight: "700" },
  ctrlText: { color: "#fff" },
  progressRow: {
    height: 4,
    backgroundColor: "#303030",
    borderRadius: 2,
    marginTop: 8,
    overflow: "hidden",
  },
  progressBar: { height: 4, backgroundColor: "#1DB954" },
});