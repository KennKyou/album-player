<script setup>
import { ref } from 'vue';
import { usePlaylistStore } from '@/stores/playlistStore';
import { useLyricsStore } from '@/stores/lyricsStore';
import { usePlayerStore } from '@/stores/playerStore';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const selectedFiles = ref([]);
const playlistStore = usePlaylistStore();
const lyricsStore = useLyricsStore();
const playerStore = usePlayerStore();

const isLoading = ref(false);
const loadingProgress = ref(0);
const loadingMessage = ref('');

const handleFolderSelect = (event) => {
  selectedFiles.value = Array.from(event.target.files);
};

const loadMusic = async () => {
  if (!selectedFiles.value) {
    console.error('沒有選擇文件');
    return;
  }

  const musicFiles = selectedFiles.value.filter(file => 
    file.type.startsWith('audio/') || file.name.endsWith('.flac')
  );

  console.log(`找到 ${musicFiles.length} 個音樂文件`);
  
  isLoading.value = true;
  loadingProgress.value = 0;
  const newSongs = [];

  for (const [index, file] of musicFiles.entries()) {
    loadingMessage.value = `正在載入 ${file.name}`;
    loadingProgress.value = Math.round((index / musicFiles.length) * 100);
    
    console.log(`處理文件: ${file.name}`);
    try {
      const metadata = await playerStore.loadAudio(URL.createObjectURL(file));
      
      const song = {
        title: metadata.common.title || file.name,
        artist: metadata.common.artist || '未知',
        album: metadata.common.album || '未知',
        path: URL.createObjectURL(file),
        duration: metadata.format.duration || 0,
        trackNumber: metadata.common.track.no || 0
      };

      const albumArtFile = findAlbumArtFile(selectedFiles.value, song.album);
      if (albumArtFile) {
        console.log('找到專輯封面:', albumArtFile.name);
        const imageUrl = URL.createObjectURL(albumArtFile);
        console.log('生成的圖片URL:', imageUrl);
        song.albumArtUrl = imageUrl;
      }

      newSongs.push(song);
    } catch (error) {
      console.error('處理音樂文件時發生錯誤:', error);
    }
  }

  // 排序歌曲
  newSongs.sort((a, b) => {
    if (a.album !== b.album) {
      return a.album.localeCompare(b.album);
    }
    if (a.trackNumber !== b.trackNumber) {
      return a.trackNumber - b.trackNumber;
    }
    return a.title.localeCompare(b.title);
  });

  if (newSongs.length > 0) {
    loadingMessage.value = '正在添加歌曲到播放列表...';
    await playlistStore.addSongs(newSongs);
    
    // 選擇第一首歌並載入，但不自動播放
    try {
      console.log('選擇並載入第一首歌:', newSongs[0]);
      playlistStore.selectSong(newSongs[0]);
      await playerStore.loadAudio(newSongs[0].path);
      playerStore.pause(); // 確保是暫停狀態
    } catch (error) {
      console.error('載入第一首歌時發生錯誤:', error);
    }
  }

  isLoading.value = false;
  loadingMessage.value = '';
  loadingProgress.value = 0;
};

const findAlbumArtFile = (files, albumName) => {
  if (!files || !albumName) {
    console.log('沒有文件或專輯名稱');
    return null;
  }

  console.log('搜尋專輯封面，專輯名稱:', albumName);
  
  const imageFiles = Array.from(files).filter(file => {
    const isImage = file.type.startsWith('image/') || 
      ['.jpg', '.jpeg', '.png', '.gif'].some(ext => file.name.toLowerCase().endsWith(ext));
    if (isImage) {
      console.log('找到圖片檔案:', file.name);
    }
    return isImage;
  });

  console.log('找到的圖片檔案數量:', imageFiles.length);

  if (imageFiles.length > 0) {
    console.log('使用第一個找到的圖片:', imageFiles[0].name);
    return imageFiles[0];
  }

  console.log('沒有找到任何圖片檔案');
  return null;
};
</script>

<template>
  <div class="folder-selector">
    <div class="controls">
      <div class="file-input-wrapper">
        <input
          type="file"
          @change="handleFolderSelect"
          webkitdirectory
          directory
          multiple
          class="file-input"
          id="folder-input"
        >
        <label for="folder-input" class="file-input-label">
          <font-awesome-icon :icon="['fas', 'folder']" />
          選擇資料夾
        </label>
      </div>
      <button 
        @click="loadMusic"
        class="load-button"
        :disabled="!selectedFiles.length"
      >
        <font-awesome-icon :icon="['fas', 'music']" />
        載入音樂
      </button>
    </div>

    <div class="loading-overlay" v-if="isLoading">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <div class="loading-text">{{ loadingMessage }}</div>
        <div class="loading-progress">
          <div class="progress-bar">
            <div 
              class="progress-bar-fill" 
              :style="{ width: `${loadingProgress}%` }"
            ></div>
          </div>
          <div class="progress-text">{{ loadingProgress }}%</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.folder-selector {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  background: rgba(255, 255, 255, 0.03);
  padding: 20px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.file-input-wrapper {
  position: relative;
}

.file-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
}

.file-input-label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.95rem;
}

.file-input-label:hover {
  background: rgba(255, 255, 255, 0.1);
}

.load-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;
}

.load-button:hover:not(:disabled) {
  background: #2980b9;
}

.load-button:disabled {
  background: rgba(255, 255, 255, 0.05);
  color: #666;
  cursor: not-allowed;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.loading-content {
  text-align: center;
  width: 300px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top: 4px solid #3498db;
  border-radius: 50%;
  margin: 0 auto 1.5rem;
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-bottom: 1.5rem;
  color: #fff;
  font-size: 1.1rem;
}

.loading-progress {
  width: 100%;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.8rem;
}

.progress-bar-fill {
  height: 100%;
  background: #3498db;
  transition: width 0.3s ease;
}

.progress-text {
  color: #999;
  font-size: 0.9rem;
  font-variant-numeric: tabular-nums;
  font-family: monospace;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>