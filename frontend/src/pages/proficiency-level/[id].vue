<template>
  <div>
    <VCard
      :title="`Proficiency Level ${report?.level}`"
      :subtitle="report?.description"
    >
      <VDivider />

      <VCardText class="px-0 pt-0">
        <VDataTableServer
          :headers="headers"
          :items="report?.details"
          :loading="loading"
        >
          <template #item.actions="{ item }">
            <div class="d-flex justify-end align-center">
              <IconBtn @click="onUpdate(item.id)">
                <VIcon icon="tabler-edit" />
              </IconBtn>
            </div>
          </template>
          <template #bottom />
        </VDataTableServer>
      </VCardText>
    </VCard>
  </div>

  <FormDrawer
    :open="formDrawer"
    :proficiency-level-id="proficiencyLevelId"
    @handle-close="handleFormDrawer"
  />
</template>

<script setup>
import FormDrawer from '@/views/proficiency-level/proficiency-level-detail-form-drawer.vue'

const store = useVuex()
const route = useRoute()
const formDrawer = ref(false)
const proficiencyLevelId = ref(route.params.id)

const headers = ref([
  { sortable: false, title: "Level", value: "level" },
  { sortable: false, title: "Description", value: "description" },
  { sortable: false, title: "Lower Limit", value: "lower_limit" },
  { sortable: false, title: "Upper Limit", value: "upper_limit" },
  { sortable: false, title: "Action", value: "actions", align: "end", sortable: false },
])

const handleFormDrawer = value => formDrawer.value = value

const onUpdate = id => {
  store.dispatch('proficiencyLevel/SetFormUpdateDetail', id)
  handleFormDrawer(true)
}

const loading = computed(() => store.state.proficiencyLevel.loading.report)
const report = computed(() => store.state.proficiencyLevel.report)

const refetch = () => store.dispatch('proficiencyLevel/GetReport', proficiencyLevelId.value)

onMounted(() => refetch())
</script>
