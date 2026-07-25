<template>
  <div>
    <VCard
      title="Rubrics"
      subtitle="Manage Rubrics"
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
              v-if="isAuthorized('create_rubric')"
              color="primary"
              @click="handleFormImportModal(true)"
            >
              <VIcon
                icon="tabler-file-excel"
                start
              />
              Import Rubric
            </VBtn>
          </div>
          <div>
            <VBtn
              v-if="isAuthorized('create_rubric')"
              color="primary"
              @click="handleFormDrawer(true)"
            >
              <VIcon
                icon="tabler-plus"
                start
              />
              Add Rubric
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
              <IconBtn
                v-if="isAuthorized('update_rubric')"
                @click="onUpdate(item.id)"
              >
                <VIcon icon="tabler-edit" />
              </IconBtn>

              <IconBtn
                v-if="isAuthorized('delete_rubric')"
                @click="onDelete(item.id)"
              >
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
    :study-program-id="props.studyProgramId"
    @handle-close="handleFormDrawer"
  />

  <FormImportModal
    :open="formImportModal"
    :study-program-id="props.studyProgramId"
    @handle-close="handleFormImportModal"
  />
</template>

<script setup>
import FormDrawer from './rubric-form-drawer.vue'
import FormImportModal from './rubric-form-import-modal.vue'
import { isAuthorized } from '@/helper/index'

const props = defineProps({
  studyProgramId: {
    type: String,
    required: true,
  },
})

const store = useVuex()
const router = useRouter()
const formDrawer = ref(false)
const formImportModal = ref(false)

const headers = ref([
  { sortable: false, title: "Student Outcome", key: "student_outcome.code" },
  { sortable: false, title: "CDIO Syllabus", key: "cdio_syllabus.level" },
  { sortable: false, title: "Rubric", key: "code" },
  { sortable: false, title: "Performance Indicator", key: "title" },
  { sortable: false, title: "Action", key: "actions", align: "end", sortable: false },
])

const handleFormImportModal = value => {
  formImportModal.value = value
}

const handleFormDrawer = value => {
  if(value) {
    store.commit('rubric/SET_FORM', {
      key: 'study_program_id',
      value: props.studyProgramId,
    })
  }

  formDrawer.value = value
}

const onUpdate = id => {
  store.dispatch('rubric/SetFormUpdate', id)
  handleFormDrawer(true)
}

const onDelete = async id => {
  const confirm = await SwalDelete()

  if(confirm){
    store.dispatch('rubric/Delete', {
      id,
      study_program_id: props.studyProgramId,
    }).then(res => {
      if(res) refetch()
    })
  }
}

const loading = computed(() => store.state.rubric.loading.reports)
const reports = computed(() => store.state.rubric.reports)

const table_options = computed({
  get: () => store.state.rubric.table_options,
  set: value => store.commit('rubric/SET_OPTIONS_TABLE', value),
})

const refetch = () => store.dispatch('rubric/GetReports', {
  study_program_id: props.studyProgramId,
})

onMounted(() => refetch())
</script>
