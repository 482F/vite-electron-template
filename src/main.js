import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'
import './assets/sass/Cica-Regular.scss'

import Utls from './plugins/utls'

loadFonts()

const app = createApp(App)
app.use(Utls)
app.use(vuetify)
app.mount('#app')
