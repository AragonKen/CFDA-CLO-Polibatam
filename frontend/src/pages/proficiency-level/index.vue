<template>
  <div>
    <VCard
      title="Proficiency Level"
      subtitle="Manage Proficiency Level"
    >
      <VDivider />

      <VCardText>
        <div class="d-flex align-center justify-end flex-wrap gap-4">
          <div style="inline-size: 20rem;">
            <AppTextField
              v-model="table_options.search"
              density="compact"
              placeholder="Search ..."
              append-inner-icon="tabler-search"
              clearable
              @update:model-value="() => refetch()"
            />
          </div>
        </div>
      </VCardText>

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
          <template #item.actions="{ item }">
            <div class="d-flex justify-end align-center">
              <IconBtn :to="`/proficiency-level/${item.id}`">
                <VIcon icon="tabler-eye" />
              </IconBtn>
            </div>
          </template>
        </VDataTableServer>
      </VCardText>
    </VCard>
  </div>
</template>

<script setup>
const store = useVuex()

const headers = ref([
  { sortable: false, title: "Level", value: "level" },
  { sortable: false, title: "Description", value: "description" },
  { sortable: false, title: "Action", value: "actions", align: "end", sortable: false },
])

const loading = computed(() => store.state.proficiencyLevel.loading.reports)
const reports = computed(() => store.state.proficiencyLevel.reports)

const table_options = computed({
  get: () => store.state.proficiencyLevel.table_options,
  set: value => store.commit('proficiencyLevel/SET_OPTIONS_TABLE', value),
})

const refetch = () => store.dispatch('proficiencyLevel/GetReports')

onMounted(() => refetch())
</script>
