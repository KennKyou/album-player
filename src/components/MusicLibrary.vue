<template>
  <div class="music-library">
    <div class="header">
      <button 
        v-if="songs.length > 0"
        @click="clearPlaylist" 
        class="clear-button"
      >
        換張專輯
      </button>
    </div>
    <div class="song-list">
      <div
        v-for="(song, index) in songs"
        :key="index"
        class="song-item"
        :class="{ 'active': currentSongIndex === index }"
        @click="handleSongClick(song)"
      >
        <div class="song-info">
          <div class="song-left">
            <div class="song-number">{{ index + 1 }}</div>
            <div class="song-details">
              <div class="song-title">{{ song.title || '未知標題' }}</div>
              <div class="song-artist">{{ song.artist || '未知演出者' }}</div>
            </div>
          </div>
          <div class="song-right">
            <div class="song-duration">{{ playerStore.formatTime(song.duration) || '--:--' }}</div>
            <div class="song-play-icon">
              <font-awesome-icon :icon="currentSongIndex === index ? ['fas', 'volume-high'] : ['fas', 'play']" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { usePlaylistStore } from '@/stores/playlistStore'
import { usePlayerStore } from '@/stores/playerStore'

const playlistStore = usePlaylistStore()
const playerStore = usePlayerStore()
const { currentSongIndex } = storeToRefs(playlistStore)

const songs = ref([])

watch(() => playlistStore.songs, (newSongs) => {
  if (!newSongs) {
    songs.value = []
    return
  }
  
  try {
    songs.value = Array.isArray(newSongs) ? [...newSongs] : []
  } catch (error) {
    console.error('處理播放列表時發生錯誤:', error)
    songs.value = []
  }
}, { deep: true })

const handleSongClick = async (song) => {
  try {
    await playerStore.selectSong(song)
  } catch (error) {
    console.error('播放歌曲時發生錯誤:', error)
  }
}

const clearPlaylist = () => {
  try {
    playerStore.resetPlaybackState()
    playlistStore.clearSongs()
    console.log('已清除播放列表')
  } catch (error) {
    console.error('清除播放列表時發生錯誤:', error)
  }
}
</script>

<style lang="scss" scoped>
.music-library {
  padding: 10px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.header {
  display: flex;
  justify-content: flex-end;
}

.clear-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border: 1px solid rgba(220, 53, 69, 0.5);
  border-radius: 4px;
  background-color: transparent;
  color: #dc3545;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.85rem;

  &:hover {
    background-color: rgba(220, 53, 69, 0.1);
  }
}

.song-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
}

.song-item {
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 4px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);

    .song-play-icon {
      opacity: 1;
    }
  }

  &.active {
    background-color: rgba(52, 152, 219, 0.1);

    .song-number {
      color: #3498db;
    }

    .song-title {
      color: #3498db;
    }
  }
}

.song-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.song-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.song-number {
  min-width: 28px;
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
}

.song-details {
  flex: 1;
  min-width: 0;
}

.song-title {
  font-size: 0.95rem;
  color: #fff;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 0.8rem;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.song-duration {
  font-size: 0.85rem;
  color: #666;
  font-variant-numeric: tabular-nums;
  font-family: monospace;
}

.song-play-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3498db;
  font-size: 0.8rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.active .song-play-icon {
  opacity: 1;
}
</style>