import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import en from 'element-plus/dist/locale/en.mjs'
import App from './App.vue'
import router from './router'
import './styles/main.scss'
import { useUserStore } from './stores/user'
import { AUTH_CONFIG } from './config/auth'

const app = createApp(App)

// Register Element Plus icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(ElementPlus, { locale: en })

// Initialize user state (set default user if auth is disabled)
if (!AUTH_CONFIG.ENABLE_AUTH) {
  const userStore = useUserStore()
  // Ensure default user is set
  if (!userStore.user) {
    userStore.fetchCurrentUser()
  }
}

app.mount('#app')
