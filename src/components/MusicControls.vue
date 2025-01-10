<script setup>
import { onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { usePlayerStore } from '@/stores/playerStore';
import ProgressBar from '@/components/ProgressBar.vue';

const playerStore = usePlayerStore()
const { isPlaying, isSingleLooping, isPlaylistLooping, volume } = storeToRefs(playerStore)

const handleSingleLoopChange = (event) => {
  playerStore.isSingleLooping = event.target.checked;
  console.log('單曲循環狀態已更改:', playerStore.isSingleLooping);
}

const handlePlaylistLoopChange = (event) => {
  playerStore.isPlaylistLooping = event.target.checked;
  console.log('歌單循環狀態已更改:', playerStore.isPlaylistLooping);
}

onUnmounted(() => {
  playerStore.pause();
});
</script>

<template>
  <div class="music-controls">
    <div class="control-wrap">
      <div class="button-wrap">
        <button @click="playerStore.previous" class="control-button">
          <font-awesome-icon :icon="['fas', 'backward-step']" />
        </button>
        <button @click="playerStore.togglePlay" class="control-button play-button">
          <font-awesome-icon :icon="isPlaying ? ['fas', 'pause'] : ['fas', 'play']" />
        </button>
        <button @click="playerStore.next" class="control-button">
          <font-awesome-icon :icon="['fas', 'forward-step']" />
        </button>
        <div class="repeat-wrap single-repeat">
          <input id="single-repeat" type="checkbox" v-model="isSingleLooping" @change="handleSingleLoopChange" />
          <label for="single-repeat" class="repeat-label">
            <font-awesome-icon :icon="['fas', '1']" />
          </label>
        </div>
        <div class="repeat-wrap all-repeat">
          <input id="all-repeat" type="checkbox" v-model="isPlaylistLooping" @change="handlePlaylistLoopChange" /> 
          <label for="all-repeat" class="repeat-label">
            <font-awesome-icon :icon="['fas', 'repeat']" />
          </label>
        </div>
      </div>
      <div class="volume-wrap">
        <span class="volume-icon">
          <font-awesome-icon :icon="['fas', 'volume-high']" />
        </span>
        <div class="volume-slider-container">
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.1" 
            v-model="volume" 
            @input="playerStore.setVolume(volume)"
            class="volume-slider" 
          />
          <div class="volume-bar">
            <div 
              class="volume-bar-fill"
              :style="{ width: `${volume * 100}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>
    <ProgressBar/>
  </div>
</template>

<style lang="scss" scoped>
.music-controls {
  padding: 0 10px 10px 10px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.control-wrap {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.button-wrap {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.control-button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  outline: none;
  cursor: pointer;
  background: #454545;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 0.9rem;

  &:hover {
    background: #505050;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
}

.play-button {
  width: 42px;
  height: 42px;
  background: #3498db;
  font-size: 1rem;

  &:hover {
    background: #2980b9;
  }
}

.repeat-wrap {
  position: relative;

  input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;

    &:checked + .repeat-label {
      color: #3498db;
      background: rgba(52, 152, 219, 0.1);
    }
  }
}

.repeat-label {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
  font-size: 0.8rem;
  transition: all 0.2s ease;

  &:hover {
    color: #3498db;
    background: rgba(52, 152, 219, 0.1);
  }
}

.volume-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  background: rgba(0, 0, 0, 0.2);
}

.volume-icon {
  color: #666;
  font-size: 0.9rem;
  width: 20px;
  text-align: center;
}

.volume-slider-container {
  position: relative;
  width: 80px;
  height: 20px;
  display: flex;
  align-items: center;
}

.volume-slider {
  position: absolute;
  width: 100%;
  height: 20px;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
  margin: 0;

  &:hover + .volume-bar .volume-bar-fill {
    background: #3498db;
  }

  &:active + .volume-bar .volume-bar-fill {
    background: #2980b9;
  }
}

.volume-bar {
  position: absolute;
  width: 100%;
  height: 4px;
  background: #454545;
  border-radius: 2px;
  overflow: hidden;

  .volume-bar-fill {
    height: 100%;
    background: #aaa;
    transition: background-color 0.2s ease;
  }
}

.volume-slider-container:hover {
  .volume-bar .volume-bar-fill {
    background: #3498db;
  }
}
</style>