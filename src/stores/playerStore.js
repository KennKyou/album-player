import { defineStore, storeToRefs } from 'pinia';
import { ref, computed } from 'vue';
import { usePlaylistStore } from '@/stores/playlistStore'
import { parseBuffer } from 'music-metadata';

export const usePlayerStore = defineStore('player', () => {
  const playlistStore = usePlaylistStore()
  const { getCurrentSongs, currentSongIndex } = storeToRefs(playlistStore)

  const isPlaying = ref(false)
  const isSingleLooping = ref(false)
  const isPlaylistLooping = ref(false)
  const isLoading = ref(false)
  const progress = ref(0)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(1)
  
  const audioContext = ref(null)
  const sourceNode = ref(null)
  const gainNode = ref(null)
  const analyserNode = ref(null)
  const audioBuffer = ref(null)
  const startTime = ref(0)
  const pausedAt = ref(0)
  const intervalId = ref(null)

  // music metadata
  const sampleTitle = ref('')
  const sampleArtist = ref('')
  const sampleAlbum = ref('')
  const albumCover = ref('')
  const bitrate = ref(0)
  const bitsPerSample = ref(0)
  const sampleRate = ref(0)
  const sampleFormat = ref('')

  const loadingLock = ref(false)

  const initAudioContext = () => {
    audioContext.value = new (window.AudioContext || window.webkitAudioContext)();
    gainNode.value = audioContext.value.createGain();
    analyserNode.value = audioContext.value.createAnalyser();
    gainNode.value.connect(analyserNode.value);
    analyserNode.value.connect(audioContext.value.destination);
  }

  const resetPlaybackState = () => {
    if (sourceNode.value) {
      sourceNode.value.stop();
      sourceNode.value.disconnect();
      sourceNode.value = null;
    }
    if (intervalId.value) {
      clearInterval(intervalId.value);
      intervalId.value = null;
    }
    currentTime.value = 0;
    progress.value = 0;
    pausedAt.value = 0;
    audioBuffer.value = null;
  }

  const loadAudio = async (url) => {
    isLoading.value = true;
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
  
      // 解析音樂元數據
      const metadata = await parseBuffer(new Uint8Array(arrayBuffer));
      
      // 更新本地狀態
      duration.value = metadata.format.duration || 0;
      sampleTitle.value = metadata.common.title || '未知標題';
      sampleArtist.value = metadata.common.artist || '未知藝術家';
      sampleAlbum.value = metadata.common.album || '未知專輯';
      bitrate.value = metadata.format.bitrate || 0;
      bitsPerSample.value = metadata.format.bitsPerSample || 0;
      sampleRate.value = metadata.format.sampleRate || 0;
      sampleFormat.value = metadata.format.container || '未知格式';
  
      // 解碼音頻數據
      audioBuffer.value = await audioContext.value.decodeAudioData(arrayBuffer);
      
      // 更新 playlistStore 中的歌曲信息
      playlistStore.updateSongMetadata(url, {
        title: sampleTitle.value,
        artist: sampleArtist.value,
        album: sampleAlbum.value,
        duration: duration.value
      });
  
      isLoading.value = false;
      return metadata;
    } catch (error) {
      console.error('加載音頻時發生錯誤:', error);
      isLoading.value = false;
      throw error;
    }
  };

  const loadMusic = async (song) => {
    if (loadingLock.value) {
      console.log('正在載入其他歌曲，請稍候...');
      return;
    }

    if (!song || typeof song !== 'object') {
      console.error('無效的歌曲對象:', song);
      throw new Error('無效的歌曲對象');
    }

    try {
      loadingLock.value = true;
      isLoading.value = true;
      
      // 保存當前要載入的歌曲信息
      const currentLoadingSong = {
        title: song.title,
        artist: song.artist,
        album: song.album,
        duration: song.duration,
        albumArtUrl: song.albumArtUrl
      };

      await loadAudio(song.path);
      
      // 確認歌曲信息沒有被其他請求覆蓋
      sampleTitle.value = currentLoadingSong.title || '未知標題';
      sampleArtist.value = currentLoadingSong.artist || '未知藝術家';
      sampleAlbum.value = currentLoadingSong.album || '未知專輯';
      duration.value = currentLoadingSong.duration || 0;

      if (currentLoadingSong.albumArtUrl) {
        console.log('使用歌曲提供的專輯封面:', currentLoadingSong.albumArtUrl);
        albumCover.value = currentLoadingSong.albumArtUrl;
      } else {
        console.log('使用預設專輯封面');
        albumCover.value = '/images/default-album-cover.jpg';
      }

    } catch (error) {
      console.error('加載音樂失敗:', error);
      sampleTitle.value = '加載失敗';
      sampleArtist.value = '';
      sampleAlbum.value = '';
      duration.value = 0;
      albumCover.value = '/images/default-album-cover.jpg';
      throw error;
    } finally {
      isLoading.value = false;
      loadingLock.value = false;
    }
  };

  const play = async () => {
    if (!audioContext.value) initAudioContext();
    
    if (!audioBuffer.value) {
      const currentSongs = playlistStore.getCurrentPlaylist;
      await loadAudio(currentSongs[currentSongIndex.value].path);
    }
    
    if (sourceNode.value) {
      sourceNode.value.stop();
      sourceNode.value.disconnect();
      sourceNode.value = null;
    }

    sourceNode.value = audioContext.value.createBufferSource();
    sourceNode.value.buffer = audioBuffer.value;
    sourceNode.value.connect(gainNode.value);
    sourceNode.value.loop = isSingleLooping.value;

    const offset = pausedAt.value;
    startTime.value = audioContext.value.currentTime - offset;
    sourceNode.value.start(0, offset);

    isPlaying.value = true;
    startProgressUpdate();
  }

  const pause = () => {
    if (sourceNode.value) {
      sourceNode.value.stop();
      pausedAt.value = audioContext.value.currentTime - startTime.value;
      isPlaying.value = false;
      clearInterval(intervalId.value);
    }
  }

  const togglePlay = async () => {
    if (isPlaying.value) {
      pause();
    } else {
      if (!audioBuffer.value) {
        await loadAudio(getCurrentSongs.value[currentSongIndex.value].path);
      }
      play();
    }
  }

  const startProgressUpdate = () => {
    clearInterval(intervalId.value);
    intervalId.value = setInterval(async () => {
      if (isPlaying.value) {
        currentTime.value = audioContext.value.currentTime - startTime.value;
        progress.value = currentTime.value / duration.value;
        if (currentTime.value >= duration.value) {
          clearInterval(intervalId.value);
          if (isSingleLooping.value) {
            // 如果單曲循環，重置播放狀態並重新開始
            resetPlaybackState();
            await play();
          } else {
            // 如果不單曲循環，播放下一首
            await next();
          }
        }
      }
    }, 100);
  }

  const setVolume = (value) => {
    volume.value = value;
    if (gainNode.value) {
      gainNode.value.gain.setValueAtTime(value, audioContext.value.currentTime);
    }
  }

  const seek = (time) => {
    if (sourceNode.value) {
      sourceNode.value.stop();
    }
    pausedAt.value = time;
    if (isPlaying.value) {
      play();
    }
  }

  const stop = () => {
    if (sourceNode.value) {
      sourceNode.value.stop();
      sourceNode.value.disconnect();
    }
    isPlaying.value = false;
    clearInterval(intervalId.value);
    resetPlaybackState();
  }

  const next = async () => {
    if (loadingLock.value) {
      console.log('正在載入其他歌曲，請稍候...');
      return;
    }

    try {
      loadingLock.value = true;
      const currentSongs = playlistStore.getCurrentPlaylist;
      if (currentSongIndex.value < currentSongs.length - 1 || isPlaylistLooping.value) {
        resetPlaybackState();
        
        currentSongIndex.value = (currentSongIndex.value + 1) % currentSongs.length;
        const nextSong = currentSongs[currentSongIndex.value];
        
        sampleTitle.value = nextSong.title || '未知標題';
        sampleArtist.value = nextSong.artist || '未知藝術家';
        sampleAlbum.value = nextSong.album || '未知專輯';
        albumCover.value = nextSong.albumArtUrl || '/images/default-album-cover.jpg';
        
        await loadMusic(nextSong);
        if (isPlaying.value) {
          await play();
        }
      } else {
        stop();
      }
    } catch (error) {
      console.error('播放下一首時發生錯誤:', error);
    } finally {
      loadingLock.value = false;
    }
  };
  
  const previous = async () => {
    if (loadingLock.value) {
      console.log('正在載入其他歌曲，請稍候...');
      return;
    }

    try {
      loadingLock.value = true;
      const currentSongs = playlistStore.getCurrentPlaylist;
      if (currentSongIndex.value > 0 || isPlaylistLooping.value) {
        resetPlaybackState();
        
        currentSongIndex.value = (currentSongIndex.value - 1 + currentSongs.length) % currentSongs.length;
        const prevSong = currentSongs[currentSongIndex.value];
        
        sampleTitle.value = prevSong.title || '未知標題';
        sampleArtist.value = prevSong.artist || '未知藝術家';
        sampleAlbum.value = prevSong.album || '未知專輯';
        albumCover.value = prevSong.albumArtUrl || '/images/default-album-cover.jpg';
        
        await loadMusic(prevSong);
        if (isPlaying.value) {
          await play();
        }
      } else {
        resetPlaybackState();
        if (isPlaying.value) {
          await play();
        }
      }
    } catch (error) {
      console.error('播放上一首時發生錯誤:', error);
    } finally {
      loadingLock.value = false;
    }
  };

  const selectSong = async (song) => {
    if (loadingLock.value) {
      console.log('正在載入其他歌曲，請稍候...');
      return;
    }

    if (!song || typeof song !== 'object') {
      console.error('無效的歌曲對象:', song);
      return;
    }

    try {
      loadingLock.value = true;
      playlistStore.selectSong(song);
      resetPlaybackState();
      audioBuffer.value = null;

      // 先設定專輯封面，避免閃爍
      if (song.albumArtUrl) {
        console.log('使用歌曲提供的專輯封面:', song.albumArtUrl);
        albumCover.value = song.albumArtUrl;
      } else {
        console.log('使用預設專輯封面');
        albumCover.value = '/images/default-album-cover.jpg';
      }

      await loadAudio(song.path);
      await play();
    } catch (error) {
      console.error('選擇歌曲時發生錯誤:', error);
      albumCover.value = '/images/default-album-cover.jpg';
    } finally {
      loadingLock.value = false;
    }
  };

  const toggleSingleLoop = () => {
    isSingleLooping.value = !isSingleLooping.value;
  }

  const togglePlaylistLoop = () => {
    isPlaylistLooping.value = !isPlaylistLooping.value;
  }

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  return {
    isPlaying,
    isSingleLooping,
    isPlaylistLooping,
    isLoading,
    progress,
    currentTime,
    duration,
    volume,
    sampleTitle,
    sampleArtist,
    sampleAlbum,
    albumCover,
    bitrate,
    bitsPerSample,
    sampleRate,
    sampleFormat,
    initAudioContext,
    resetPlaybackState,
    loadAudio,
    loadMusic,
    play,
    pause,
    togglePlay,
    setVolume,
    seek,
    next,
    previous,
    selectSong,
    toggleSingleLoop,
    togglePlaylistLoop,
    formatTime,
    loadingLock
  }
})