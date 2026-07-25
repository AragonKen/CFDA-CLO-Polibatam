<template>
  <div>
    <VCard
      title="Grading Categories"
      subtitle="List of Grading Categories"
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
  { sortable: false, title: "Grading Category", value: "category.title" },
  { sortable: false, title: "Lower Limit", value: "lower_limit" },
  { sortable: false, title: "Upper Limit", value: "upper_limit" },
  { sortable: false, title: "Grade", value: "grade" },
])

const loading = computed(() => store.state.grading.loading.reports)
const reports = computed(() => store.state.grading.reports)

const table_options = computed({
  get: () => store.state.grading.table_options,
  set: value => store.commit('grading/SET_OPTIONS_TABLE', value),
})

const refetch = () => store.dispatch('grading/GetReports')

onMounted(() => refetch())
</script>
