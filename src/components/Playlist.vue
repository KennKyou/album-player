<script setup>
import { storeToRefs } from 'pinia';
import { usePlayerStore } from '@/stores/playerStore';
import { usePlaylistStore } from '@/stores/playlistStore';

const playerStore = usePlayerStore();
const playlistStore = usePlaylistStore();

const { isLoading } = storeToRefs(playerStore);
const { currentSongIndex, songs } = storeToRefs(playlistStore);

const selectSong = (index) => {
  playerStore.selectSong(index);
};
</script>

<template>
  <div class="playlist">
    <h3>歌單</h3>
    <ul>
      <li 
        v-for="(song, index) in songs" 
        :key="index" 
        @click="selectSong(index)"
        :class="{ 'current-song': index === currentSongIndex }"
      >
        {{ song.title }}
        <span v-if="song.duration > 0">
          ({{ playerStore.formatTime(song.duration) }})
        </span>
        <span v-else-if="isLoading && index === currentSongIndex"> (加載中...)</span>
      </li>
    </ul>
  </div>
</template>