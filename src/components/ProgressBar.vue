<script setup>
import { storeToRefs } from 'pinia';
import { usePlayerStore } from '@/stores/playerStore';

const playerStore = usePlayerStore();
const { currentTime, progress, duration } = storeToRefs(playerStore);

const handleSeek = (event) => {
  const seekTime = event.target.value * duration.value;
  playerStore.seek(seekTime);
}
</script>

<template>
  <div class="progress-container">
    <span class="progress-time">{{ playerStore.formatTime(currentTime) }}</span>
    <div class="slider-container">
      <input 
        type="range" 
        min="0" 
        max="1" 
        step="0.001"
        v-model="progress" 
        @input="handleSeek"
        class="progress-slider"
      />
      <div class="progress-bar">
        <div 
          class="progress-bar-fill"
          :style="{ width: `${progress * 100}%` }"
        ></div>
      </div>
    </div>
    <span class="progress-time">{{ playerStore.formatTime(duration) }}</span>
  </div>
</template>

<style lang="scss" scoped>
.progress-container {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.progress-time {
  font-size: 0.8rem;
  color: #999;
  min-width: 45px;
  text-align: center;
  font-variant-numeric: tabular-nums;
  font-family: monospace;
}

.slider-container {
  position: relative;
  flex: 1;
  height: 20px;
  display: flex;
  align-items: center;
}

.progress-slider {
  position: absolute;
  width: 100%;
  height: 20px;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
  margin: 0;

  &:hover + .progress-bar .progress-bar-fill {
    background: #3498db;
  }

  &:active + .progress-bar .progress-bar-fill {
    background: #2980b9;
  }
}

.progress-bar {
  position: absolute;
  width: 100%;
  height: 6px;
  background: #454545;
  border-radius: 3px;
  overflow: hidden;

  .progress-bar-fill {
    height: 100%;
    background: #aaa;
    transition: background-color 0.2s ease;
  }
}

.slider-container:hover {
  .progress-bar .progress-bar-fill {
    background: #3498db;
  }
}
</style>