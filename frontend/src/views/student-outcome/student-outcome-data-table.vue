<template>
  <div>
    <VCard
      title="Student Outcome"
      subtitle="Manage Student Outcome"
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
              v-if="isAuthorized('create_student_outcome')"
              color="primary"
              @click="handleFormImportModal(true)"
            >
              <VIcon
                icon="tabler-file-excel"
                start
              />
              Import SO
            </VBtn>
          </div>
          <div>
            <VBtn
              v-if="isAuthorized('create_student_outcome')"
              color="primary"
              :loading="is_generate"
              @click="handleFormDrawer(true)"
            >
              <VIcon
                icon="tabler-plus"
                start
              />
              Add SO
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
                v-if="isAuthorized('update_student_outcome')"
                @click="onUpdate(item.id)"
              >
                <VIcon icon="tabler-edit" />
              </IconBtn>

              <IconBtn
                v-if="isAuthorized('delete_student_outcome')"
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

  <ImportModal
    :open="formImportModal"
    :study-program-id="props.studyProgramId"
    @handle-close="handleFormImportModal"
  />
</template>

<script setup>
import FormDrawer from './student-outcome-form-drawer.vue'
import ImportModal from './student-outcome-import-modal.vue'
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
  { sortable: false, title: "Code", key: "code" },

  // { sortable: false, title: "Student Outcome", key: "title" },
  { sortable: false, title: "Student Outcome", key: "description" },
  { sortable: false, title: "Action", key: "actions", align: "end", sortable: false },
])

const handleFormDrawer = value => {
  if(value) {
    store.commit('studentOutcome/SET_FORM', {
      key: 'study_program_id',
      value: props.studyProgramId,
    })
  }

  formDrawer.value = value
}

const handleFormImportModal = value => {
  formImportModal.value = value
}

const onUpdate = id => {
  store.dispatch('studentOutcome/SetFormUpdate', id)
  handleFormDrawer(true)
}

const onDelete = async id => {
  const confirm = await SwalDelete()

  if(confirm){
    store.dispatch('studentOutcome/Delete', {
      id,
      study_program_id: props.studyProgramId,
    }).then(res => {
      if(res) refetch()
    })
  }
}

const loading = computed(() => store.state.studentOutcome.loading.reports)
const reports = computed(() => store.state.studentOutcome.reports)

const table_options = computed({
  get: () => store.state.studentOutcome.table_options,
  set: value => store.commit('studentOutcome/SET_OPTIONS_TABLE', value),
})

const refetch = () => store.dispatch('studentOutcome/GetReports', {
  study_program_id: props.studyProgramId,
})

onMounted(() => refetch())
</script>
