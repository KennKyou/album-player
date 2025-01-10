<script setup>
import { ref, onMounted } from 'vue';
import { usePlayerStore } from '@/stores/playerStore';
import { usePlaylistStore } from '@/stores/playlistStore';

const playerStore = usePlayerStore();
const playlistStore = usePlaylistStore();

const errorMessage = ref('');

onMounted(async () => {
  try {
    playerStore.initAudioContext();
    await playerStore.loadAudio(playlistStore.songs[playlistStore.currentSongIndex].path);
  } catch (error) {
    // console.error('初始化播放器失敗:', error);
    // errorMessage.value = `初始化播放器失敗: ${error.message}`;
  }
});
</script>

<template>
  <!-- <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p> -->
  <p v-if="playerStore.isLoading"></p>
</template>