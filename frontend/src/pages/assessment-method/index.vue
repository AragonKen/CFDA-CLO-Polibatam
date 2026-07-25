<template>
  <div>
    <VCard
      title="Assessment Method"
      subtitle="Manage Assessment Method"
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
          <div>
            <VBtn
              color="primary"
              :loading="is_generate"
              @click="handleFormDrawer(true)"
            >
              <VIcon
                icon="tabler-plus"
                start
              />
              Add Data
            </VBtn>
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
              <IconBtn @click="onUpdate(item.id)">
                <VIcon icon="tabler-edit" />
              </IconBtn>

              <IconBtn @click="onDelete(item.id)">
                <VIcon icon="tabler-trash" />
              </IconBtn>
            </div>
          </template>
        </VDataTableServer>
      </VCardText>
    </VCard>
  </div>

  <FormDrawer
    :open="formDrawer"
    @handle-close="handleFormDrawer"
  />
</template>

<script setup>
import FormDrawer from '@/views/assessment-method/assessment-method-form-drawer.vue'

const store = useVuex()
const formDrawer = ref(false)

const headers = ref([
  { sortable: false, title: "Assessment Method", value: "title" },
  { sortable: false, title: "Action", value: "actions", align: "end", sortable: false },
])

const computedMoreList = computed(() => {
  return item => [
    {
      title: 'Edit',
      prependIcon: 'tabler-pencil',
      onClick: () => onUpdate(item.id),
    },
    {
      title: 'Delete',
      prependIcon: 'tabler-trash',
      onClick: () => onDelete(item.id),
    },
  ].filter(item => {
    if(item.hidden) return !item.hidden
    
    return true
  })
})

const handleFormDrawer = value => formDrawer.value = value

const onUpdate = id => {
  store.dispatch('assessmentMethod/SetFormUpdate', id)
  handleFormDrawer(true)
}

const onDelete = async id => {
  const confirm = await SwalDelete()

  if(confirm){
    store.dispatch('assessmentMethod/Delete', id).then(res => {
      if(res) refetch()
    })
  }
}

const loading = computed(() => store.state.assessmentMethod.loading.reports)
const reports = computed(() => store.state.assessmentMethod.reports)

const table_options = computed({
  get: () => store.state.assessmentMethod.table_options,
  set: value => store.commit('assessmentMethod/SET_OPTIONS_TABLE', value),
})

const refetch = () => store.dispatch('assessmentMethod/GetReports')

onMounted(() => refetch())
</script>
