<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { usePlaylistStore } from '@/stores/playlistStore';
import { usePlayerStore } from '@/stores/playerStore';

const playlistStore = usePlaylistStore();
const playerStore = usePlayerStore();

const { isLoading } = storeToRefs(playerStore);

const formattedBitRate = computed(() => {
  if (!isLoading.value && playerStore.bitrate >= 1000) {
    return (playerStore.bitrate / 1000).toFixed(0) + 'kbps';
  }
  return playerStore.bitrate.toString() + 'bps';
})

const formattedSampleRate = computed(() => {
  if (!isLoading.value && playerStore.sampleRate >= 1000) {
    return (playerStore.sampleRate / 1000).toFixed(1) + 'kHz';
  }
  return playerStore.sampleRate.toString() + 'Hz';
})

const formattedBitsPerSample = computed(() => {
  if (!isLoading.value && playerStore.bitsPerSample) {
    return playerStore.bitsPerSample + 'bit'
  }
})

const { currentSongIndex } = storeToRefs(playlistStore);

const currentSong = computed(() => {
  if (isLoading.value) return null;
  const songs = playlistStore.songs;
  if (!songs || !Array.isArray(songs) || songs.length === 0) {
    return null;
  }
  return songs[currentSongIndex.value] || null;
});

const displayInfo = computed(() => {
  if (!playlistStore.songs || playlistStore.songs.length === 0) {
    return {
      title: '',
      artist: '',
      album: '',
      format: ''
    };
  }

  if (isLoading.value) {
    return {
      title: currentSong.value?.title || '',
      artist: currentSong.value?.artist || '',
      album: currentSong.value?.album || '',
      format: ''
    };
  }

  return {
    title: playerStore.sampleTitle || '',
    artist: playerStore.sampleArtist || '',
    album: playerStore.sampleAlbum || '',
    format: playerStore.sampleFormat || ''
  };
});

const albumCoverUrl = computed(() => {
  if (currentSong.value && currentSong.value.albumArtUrl) {
    return currentSong.value.albumArtUrl;
  }
  return null;
});
</script>

<template>
  <div class="music-info">
    <div class="img-wrap" :class="{ 'no-image': !albumCoverUrl }">
      <img v-if="albumCoverUrl" :src="albumCoverUrl" :alt="displayInfo.title">
      <div v-else class="album-placeholder">
        <div class="placeholder-icon"></div>
      </div>
    </div>
    <div class="info-wrap">
      <h2 :class="{ loading: isLoading }" class="title-container">
        <div class="marquee-wrapper">
          <span class="loading-content" :class="{ 'marquee': displayInfo.title.length > 25 }">
            {{ displayInfo.title || '\u00A0' }}
          </span>
        </div>
      </h2>
      <p class="artist" :class="{ loading: isLoading }">
        <span class="loading-content">{{ displayInfo.artist || '\u00A0' }}</span>
      </p>
      <p class="metadata" :class="{ loading: isLoading }">
        <span class="loading-content">
          {{ displayInfo.format ? `${displayInfo.format} · ${formattedSampleRate} ${formattedBitsPerSample} · ${formattedBitRate}` : '\u00A0' }}
        </span>
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.music-info {
  display: flex;
  gap: 16px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

.img-wrap {
  width: 100px;
  height: 100px;
  border-radius: 6px;
  overflow: hidden;
  background-color: #2a2a2a;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}

.album-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #2a2a2a 0%, #353535 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  width: 32px;
  height: 32px;
  border: 2px solid #444;
  border-radius: 50%;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 10px;
    height: 10px;
    background: #444;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }
}

img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info-wrap {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  justify-content: center;
}

.title-container {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.marquee-wrapper {
  width: 100%;
  overflow: hidden;
}

.marquee {
  display: inline-block;
  padding-right: 50px;
  white-space: nowrap;
  animation: marquee 18s linear infinite;

  &:hover {
    animation-play-state: paused;
  }
}

@keyframes marquee {
  0%, 25% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
}

h2 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
}

.artist {
  font-size: 0.95rem;
  color: #999;
  margin: 0;
}

.metadata {
  font-size: 0.8rem;
  color: #666;
  margin: 0;
  font-family: monospace;
}

.loading {
  position: relative;
  overflow: hidden;
  background: #2a2a2a;
  border-radius: 4px;
  
  .loading-content {
    visibility: hidden;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, 
      transparent 0%,
      #353535 20%,
      #353535 80%,
      transparent 100%
    );
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 50%;
    height: 100%;
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.08) 50%,
      transparent 100%
    );
    animation: shimmer 1.5s infinite;
  }
}

@keyframes shimmer {
  100% {
    transform: translateX(400%);
  }
}
</style>