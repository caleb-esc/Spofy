import React, { createContext, useEffect, useState, useRef } from "react";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../utils/api";

export const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playbackInstance, setPlaybackInstance] = useState(null);
  const [playbackStatus, setPlaybackStatus] = useState(null);
  const [lastPlayed, setLastPlayed] = useState(null);

  // initialize audio
  useEffect(() => {
    (async () => {
      await Audio.setAudioModeAsync({
        staysActiveInBackground: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playsInSilentModeIOS: true,
      });
    })();
    // load queue from storage
    (async () => {
      try {
        const saved = await AsyncStorage.getItem("@queue_v1");
        if (saved) setQueue(JSON.parse(saved));
      } catch (e) {}
    })();
    return () => {
      if (playbackInstance) {
        playbackInstance.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("@queue_v1", JSON.stringify(queue)).catch(() => {});
  }, [queue]);

  async function loadAndPlay(track, indexInQueue = 0) {
    // track should have previewUrl. If not, try to find preview via search by track name + artist
    const target = { ...track };
    if (!target.previewUrl && target.trackName && target.artistName) {
      try {
        const results = await api.search(`${target.trackName} ${target.artistName}`, 1);
        if (results.length > 0 && results[0].previewUrl) {
          target.previewUrl = results[0].previewUrl;
        }
      } catch (e) {}
    }
    if (!target.previewUrl) {
      // cannot play
      console.warn("No preview available for", target.trackName);
      return;
    }

    try {
      if (playbackInstance) {
        await playbackInstance.unloadAsync();
        setPlaybackInstance(null);
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: target.previewUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      setPlaybackInstance(sound);
      setCurrentTrack(target);
      setCurrentIndex(indexInQueue);
      setLastPlayed(target);
    } catch (e) {
      console.warn("Playback error:", e);
    }
  }

  function onPlaybackStatusUpdate(status) {
    setPlaybackStatus(status);
    // auto-advance when track ends
    if (status.didJustFinish) {
      skipToNext();
    }
  }

  function playNow(track) {
    // play immediately, queue becomes [track, ...existingQueue] with current index 0
    const newQueue = [track, ...queue];
    setQueue(newQueue);
    loadAndPlay(track, 0);
  }

  function addToQueue(track) {
    setQueue((q) => [...q, track]);
  }

  async function togglePlayPause() {
    if (!playbackInstance) {
      // if there's a queued track, play first
      if (queue.length > 0) {
        const idx = currentIndex != null ? currentIndex : 0;
        await loadAndPlay(queue[idx], idx);
      }
      return;
    }
    const status = await playbackInstance.getStatusAsync();
    if (status.isPlaying) {
      await playbackInstance.pauseAsync();
    } else {
      await playbackInstance.playAsync();
    }
  }

  async function skipToNext() {
    if (!queue || queue.length === 0) return;
    const nextIdx = currentIndex != null ? currentIndex + 1 : 0;
    if (nextIdx < queue.length) {
      await loadAndPlay(queue[nextIdx], nextIdx);
    } else {
      // nothing to play (stop)
      if (playbackInstance) {
        await playbackInstance.stopAsync();
        await playbackInstance.unloadAsync();
        setPlaybackInstance(null);
        setCurrentTrack(null);
        setCurrentIndex(null);
      }
    }
  }

  async function skipToPrevious() {
    if (!queue || queue.length === 0) return;
    const prevIdx = currentIndex > 0 ? currentIndex - 1 : 0;
    if (prevIdx < queue.length) {
      await loadAndPlay(queue[prevIdx], prevIdx);
    }
  }

  async function seekTo(progressSeconds) {
    if (playbackInstance) {
      await playbackInstance.setPositionAsync(progressSeconds * 1000);
    }
  }

  return (
    <PlayerContext.Provider
      value={{
        queue,
        addToQueue,
        playNow,
        currentIndex,
        currentTrack,
        playbackStatus,
        togglePlayPause,
        skipToNext,
        skipToPrevious,
        seekTo,
        lastPlayed,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}