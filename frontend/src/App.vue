<script setup>
import ScrollToTop from '@core/components/ScrollToTop.vue'
import initCore from '@core/initCore'
import {
  initConfigStore,
  useConfigStore,
} from '@core/stores/config'
import { hexToRgb } from '@layouts/utils'
import { Toaster } from 'vue-sonner'
import { useTheme } from 'vuetify'

const { global } = useTheme()

// ℹ️ Sync current theme with initial loader theme
initCore()
initConfigStore()

const configStore = useConfigStore()

const store = useVuex()

onMounted(() => {
  const token = localStorage.getItem('App-Token')
  const user = localStorage.getItem('App-User')

  
  if (token) {    
    store.commit("SET_TOKEN_APP", token)
    store.commit("SET_USER_APP", JSON.parse(user))
    store.dispatch("FetchRoleAndPermissions")
  }
})
</script>

<template>
  <VLocaleProvider :rtl="configStore.isAppRTL">
    <!-- ℹ️ This is required to set the background color of active nav link based on currently active global theme's primary -->
    <VApp :style="`--v-global-theme-primary: ${hexToRgb(global.current.value.colors.primary)}`">
      <RouterView />

      <ScrollToTop />
      <Toaster rich-colors />
    </VApp>
  </VLocaleProvider>
</template>


<style lang="scss">
.container {
  margin-block: 0 !important;
  margin-inline: auto !important;
  max-inline-size: 1400px;
}

.table-assessment {
  border: 1px solid #c6c6c6;
  border-collapse: collapse;
  inline-size: 100%;
  
  th {
    background-color: #d4d4d4 !important;
    text-transform: capitalize !important;
  }
  
  th, td {
    padding: 0.5rem !important;
    border: 0.5px solid #5d5d5d;
    font-size: .75rem!important;
  }
} 

.align-items-start {
  align-items: flex-start;
}

.align-items-center {
  align-items: center;
}

.align-items-end {
  align-items: flex-end;
}

.justify-content-center {
  justify-content: center;
}

.justify-content-between {
  justify-content: space-between;
}

.justify-end {
  justify-content: flex-end;
}

.gap-1 {
  gap: 0.25rem;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-3 {
  gap: 1rem;
}

.gap-4 {
  gap: 1.5rem;
}

.gap-5 {
  gap: 2rem;
}

.flex-wrap {
  flex-wrap: wrap;
}

.text-nowrap {
  white-space: nowrap;
}

.mix-blend-difference	{
  mix-blend-mode: difference;
}

.w-fit {
  inline-size: fit-content;
}

.fw-500 {
  font-weight: 500;
}

.fw-600 {
  font-weight: 600;
}

.status-stepper-container {
  display: flex;
  overflow: auto hidden;

  .active {
    background: var(--stepper-color) !important;

    &::after{
      border-inline-start-color: var(--stepper-color) !important;
    }
  }
  
  .stepper-item {
    position: relative;
    background: #EBDBCF;
    color: white;
    cursor: pointer;
    padding-block: 0.5rem;
    padding-inline: 2rem;
    text-align: center;
    text-wrap: nowrap;
  }

  .stepper-item::after {
    position: absolute;
    z-index: 10;
    block-size: 0;
    border-block-end: 25px solid transparent;
    border-block-start: 25px solid transparent;
    border-inline-start: 15px solid #EBDBCF;
    content: '';
    inline-size: 0;
    inset-block-start: 0;
    inset-inline-end: -15px;
  }

  .stepper-item::before {
    position: absolute;
    z-index: 10;
    block-size: 0;
    border-block-end: 25px solid transparent;
    border-block-start: 25px solid transparent;
    border-inline-start: 15px solid #EBDBCF;
    content: '';
    inline-size: 0;
    inset-block-start: 0;
    inset-inline-end: -16px;
  }
}

// Loading

/* loader.css */
#loading-bg {
  position: fixed;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--initial-loader-bg, #fff);
  block-size: 100vh;
  inline-size: 100%;
}

.loading-logo {
  position: relative;
  text-align: center;
}

.loading-logo::after {
  position: absolute;
  border: 4px solid var(--initial-loader-color, #4F594E);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  block-size: 40px;
  border-block-start-color: transparent;
  content: '';
  inline-size: 40px;
  inset-block-start: 100%;
  inset-inline-start: 50%;
  margin-block-start: 20px;
  margin-inline-start: -20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
