<script setup>
import { useLyricsStore } from '@/stores/lyricsStore'
import { storeToRefs } from 'pinia'

const lyricsStore = useLyricsStore()
const { getCurrentLyric, getLyricMetadata } = storeToRefs(lyricsStore)
</script>

<template>
  <div class="lyrics-container">
    <div class="lyrics">
      {{ getCurrentLyric }}
    </div>
  </div>
</template>