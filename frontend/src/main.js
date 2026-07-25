import App from '@/App.vue'
import { registerPlugins } from '@core/utils/plugins'
import VueGoogleMaps from '@fawmi/vue-google-maps'
import { createApp } from 'vue'

// Styles
import '@core/scss/template/index.scss'
import '@styles/styles.scss'

// Create vue app
const app = createApp(App)



// Register plugins
registerPlugins(app)

// Mount vue app
app.use(VueGoogleMaps, {
  load: {
    key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: "places",
  },
}).mount('#app')
