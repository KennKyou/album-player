import '@/assets/css/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'


import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTimes, faPlay, faPause, faForwardStep, faBackwardStep, faVolumeHigh, faRepeat, fa1, faFolder, faMusic, faSun, faMoon } from '@fortawesome/free-solid-svg-icons'

const app = createApp(App)

library.add(faTimes, faPlay, faPause, faForwardStep, faBackwardStep, faVolumeHigh, faRepeat, fa1, faFolder, faMusic, faSun, faMoon)

app.component('font-awesome-icon', FontAwesomeIcon)
app.use(createPinia())
app.use(router)

app.mount('#app')
