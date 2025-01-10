import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const usePlaylistStore = defineStore('playlist', () => {
  const songs = ref([]);
  const currentSongIndex = ref(0);

  const getCurrentPlaylist = computed(() => songs.value);

  const addSongs = (newSongs) => {
    console.log('添加歌曲到播放列表，歌曲數據:', newSongs);
    songs.value = [...songs.value, ...newSongs];
    console.log('更新後的播放列表:', songs.value);
  };

  const clearSongs = () => {
    songs.value = [];
    currentSongIndex.value = 0;
    console.log('播放列表已清除');
  };

  const selectSong = (song) => {
    console.log('選擇歌曲:', song);
    const index = songs.value.findIndex(s => s.path === song.path);
    if (index !== -1) {
      currentSongIndex.value = index;
      console.log('設置當前歌曲索引:', currentSongIndex.value);
    }
  };

  const updateSongMetadata = (path, metadata) => {
    console.log('更新歌曲元數據:', path, metadata);
    const index = songs.value.findIndex(song => song.path === path);
    if (index !== -1) {
      const updatedSong = {
        ...songs.value[index],
        ...metadata,
        // 保留原有的專輯封面 URL
        albumArtUrl: songs.value[index].albumArtUrl
      };
      songs.value[index] = updatedSong;
      console.log('更新後的歌曲:', updatedSong);
    }
  };

  return {
    songs,
    currentSongIndex,
    getCurrentPlaylist,
    addSongs,
    clearSongs,
    selectSong,
    updateSongMetadata
  };
});