import { defineStore } from 'pinia';
import { ref, onMounted } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  const isDarkMode = ref(true);

  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    isDarkMode.value = savedTheme ? savedTheme === 'dark' : true;
    document.documentElement.setAttribute('data-theme', isDarkMode.value ? 'dark' : 'light');
  };

  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value;
    const newTheme = isDarkMode.value ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // initTheme();

  return {
    isDarkMode,
    toggleTheme
  };
});