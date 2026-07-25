<template>
  <div>
    <VCard
      title="Assessment Types"
      subtitle="List of Assessment Types"
    >
      <VDivider />

      <VCardText class="px-0 pt-0">
        <VDataTableServer
          v-model:options="table_options"
          v-model:items-per-page="table_options.page_size"
          v-model:page="table_options.page"
          :items-length="table_options.total_items"
          :headers="headers"
          :items="reports"
          :loading="loading"
          :search="table_options.search"
          @update:options="refetch"
        >
          <template #bottom />
        </VDataTableServer>
      </VCardText>
    </VCard>
  </div>
</template>

<script setup>
const store = useVuex()

const headers = ref([
  { title: "Code", value: "code" },
  { title: "Title", value: "title" },
])

const loading = computed(() => store.state.assessmentType.loading.reports)
const reports = computed(() => store.state.assessmentType.reports)

const table_options = computed({
  get: () => store.state.assessmentType.table_options,
  set: value => store.commit('assessmentType/SET_OPTIONS_TABLE', value),
})

const refetch = () => store.dispatch('assessmentType/GetReports')

onMounted(() => refetch())
</script>
