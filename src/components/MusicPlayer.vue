<script setup>
import { ref, watch, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { usePlayerStore } from '@/stores/playerStore';
import { usePlaylistStore } from '@/stores/playlistStore';
import MusicPlayerInitializer from '@/components/MusicPlayerInitializer.vue';
import MusicInfo from '@/components/MusicInfo.vue';
import Lyrics from '@/components/Lyrics.vue';
import MusicControls from '@/components/MusicControls.vue';
import ProgressBar from '@/components/ProgressBar.vue';
import Playlist from '@/components/Playlist.vue';
import FolderSelector from '@/components/FolderSelector.vue';
import MusicLibrary from '@/components/MusicLibrary.vue';

const playerStore = usePlayerStore()
const playlistStore = usePlaylistStore()

const { currentSongIndex } = storeToRefs(playlistStore)
const { isPlaying, currentTime, duration } = storeToRefs(playerStore)

const showFolderSelector = computed(() => {
  return !playlistStore.songs || playlistStore.songs.length === 0
})

watch(currentSongIndex, async (newIndex) => {
  try {
    if (typeof newIndex !== 'number' || !playlistStore.songs || !playlistStore.songs[newIndex]) {
      console.log('無效的歌曲索引或播放列表為空');
      return;
    }
    
    playerStore.resetPlaybackState();
    await playerStore.loadAudio(playlistStore.songs[newIndex].path);
    if (playerStore.isPlaying) {
      await playerStore.play();
    }
  } catch (error) {
    console.error('切換歌曲時發生錯誤:', error);
  }
});

watch([currentTime, duration], () => {
  try {
    if (currentTime.value >= duration.value && isPlaying.value) {
      playerStore.next();
    }
  } catch (error) {
    console.error('檢查歌曲結束時發生錯誤:', error);
  }
});
</script>

<template>
  <div class="player-container">
    <div class="music-library">
      <MusicPlayerInitializer/>
      <FolderSelector v-if="showFolderSelector"/>
      <MusicLibrary v-else/>
    </div>
    <div class="music-info">
      <div class="info-container">
        <MusicInfo/>
        <MusicControls/>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.player-container {
  height: 100vh;
  background: linear-gradient(to bottom, #1a1a1a, #121212);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.music-library {
  flex: 1;
  overflow: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
}

.music-info {
  height: 215px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 10;
}

.info-container {
  margin: 0 auto;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>