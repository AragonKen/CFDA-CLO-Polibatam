<template>
  <VTabs
    v-model="activeTab"
    class="v-tabs-pill mt-5"
  >
    <VTab
      v-for="item in tabs"
      :key="item.icon"
      :value="item.tab"
      @click="() => router.push({ query: { tab: item.tab } })"
    >
      <VIcon
        size="20"
        start
        :icon="item.icon"
      />
      {{ item.title }}
    </VTab>
  </VTabs>
</template>

<script setup>
const router = useRouter()
const route = useRoute()

const activeTab = computed({
  get: () => route.query.tab || 'overview',
  set: () => route.query.tab, 
})

const tabs = [
  {
    icon: 'tabler-chart-pie',
    title: 'Overview',
    tab: 'overview',
  },
  {
    icon: 'tabler-file-text',
    title: 'Student Assessment',
    tab: 'assessment',
  },
]
</script>
