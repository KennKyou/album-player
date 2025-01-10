import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usePlaylistStore } from './playlistStore'
import { usePlayerStore } from './playerStore'

export const useLyricsStore = defineStore('lyrics', () => {
  const playlistStore = usePlaylistStore()
  const playerStore = usePlayerStore()

  const lyrics = ref([])
  const currentLyricIndex = ref(-1)
  const hasLyrics = ref(false)

  const getLyricMetadata = computed(() => {
    const currentSong = playlistStore.songs[playlistStore.currentSongIndex]
    if (!currentSong) {
      return {
        title: '未知標題',
        artist: '未知藝術家',
        album: '未知專輯'
      }
    }

    return {
      title: currentSong.title || '未知標題',
      artist: currentSong.artist || '未知藝術家',
      album: currentSong.album || '未知專輯'
    }
  })

  const getCurrentLyric = computed(() => {
    if (!hasLyrics.value || currentLyricIndex.value === -1) {
      return '暫無歌詞'
    }
    return lyrics.value[currentLyricIndex.value]?.text || '暫無歌詞'
  })

  const updateCurrentLyric = (currentTime) => {
    if (!hasLyrics.value || lyrics.value.length === 0) {
      currentLyricIndex.value = -1
      return
    }

    // 找到當前時間對應的歌詞
    const index = lyrics.value.findIndex(lyric => lyric.time > currentTime)
    currentLyricIndex.value = index === -1 ? lyrics.value.length - 1 : index - 1
  }

  const parseLyrics = (lrcContent) => {
    if (!lrcContent) {
      console.log('沒有歌詞內容')
      hasLyrics.value = false
      lyrics.value = []
      return
    }

    try {
      // 解析歌詞
      const lines = lrcContent.split('\n')
      const parsedLyrics = []

      const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g

      lines.forEach(line => {
        const matches = [...line.matchAll(timeRegex)]
        const text = line.replace(timeRegex, '').trim()

        matches.forEach(match => {
          const minutes = parseInt(match[1])
          const seconds = parseInt(match[2])
          const milliseconds = parseInt(match[3].padEnd(3, '0'))
          const time = minutes * 60 + seconds + milliseconds / 1000

          if (text) {
            parsedLyrics.push({ time, text })
          }
        })
      })

      // 按時間排序
      lyrics.value = parsedLyrics.sort((a, b) => a.time - b.time)
      hasLyrics.value = lyrics.value.length > 0
      console.log('解析到的歌詞:', lyrics.value)
    } catch (error) {
      console.error('解析歌詞時發生錯誤:', error)
      hasLyrics.value = false
      lyrics.value = []
    }
  }

  return {
    lyrics,
    currentLyricIndex,
    hasLyrics,
    getLyricMetadata,
    getCurrentLyric,
    updateCurrentLyric,
    parseLyrics
  }
})