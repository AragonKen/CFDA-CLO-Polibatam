<template>
  <div>
    <VCard
      title="CDIO Syllabus"
      subtitle="Manage CDIO Syllabus"
    >
      <VDivider />

      <VCardText>
        <div class="d-flex align-center justify-end flex-wrap gap-4">
          <VBtn
            v-if="isAuthorized('create_cdio_syllabus')"
            color="primary"
            variant="flat"
            @click="handleFormImportModal(true)"
          >
            <VIcon
              icon="tabler-file-excel"
              start
            />
            Import CDIO
          </VBtn>
        </div>
      </VCardText>

      <VDivider />

      <VCardText>
        <p
          v-if="!reports || reports.length === 0"
          class="text-disabled"
        >
          CDIO Syllabus is not available for this study program.
        </p>

        <div v-else>
          <div
            v-for="cdio in reports"
            :key="cdio.id"
            class="mb-5"
          >
            <VAlert
              density="comfortable"
              color="primary"
              variant="tonal"
              class="mb-5"
            >
              <strong>{{ cdio?.level }}</strong>. {{ cdio?.title }}
            </VAlert>

            <div class="d-flex align-center justify-end flex-wrap gap-4">
              <VBtn
                v-if="isAuthorized('create_cdio_syllabus')"
                variant="tonal"
                color="primary"
                size="small"
                @click="handleFormDetailDrawer(true, cdio)"
              >
                <VIcon
                  icon="tabler-plus"
                  start
                />
                Add Sub CDIO Syllabus
              </VBtn>
              <VBtn
                v-if="isAuthorized('update_cdio_syllabus')"
                variant="tonal"
                color="warning"
                size="small"
                @click="onUpdate(cdio.id)"
              >
                <VIcon
                  icon="tabler-pencil"
                  start
                />
                Edit
              </VBtn>
              <VBtn
                v-if="isAuthorized('delete_cdio_syllabus')"
                variant="tonal"
                color="error"
                size="small"
                @click="onDelete(cdio.id)"
              >
                <VIcon
                  icon="tabler-trash"
                  start
                />
                Delete
              </VBtn>
            </div>

            <VDataTableServer
              :headers="headers"
              :items="cdio?.cdio_syllabuses"
              :loading="loading"
            >
              <template #bottom />

              <template #item.actions="{ item }">
                <div class="d-flex justify-end align-center">
                  <IconBtn
                    v-if="isAuthorized('update_cdio_syllabus')"
                    @click="onUpdateDetail(cdio, item.id)"
                  >
                    <VIcon icon="tabler-edit" />
                  </IconBtn>
                  <IconBtn
                    v-if="isAuthorized('delete_cdio_syllabus')"
                    @click="onDeleteDetail( item.id)"
                  >
                    <VIcon icon="tabler-trash" />
                  </IconBtn>
                </div>
              </template>
            </VDataTableServer>
          </div>
        </div>

        <VBtn
          v-if="isAuthorized('create_cdio_syllabus')"
          variant="tonal"
          @click="handleFormDrawer(true)"
        >
          <VIcon
            icon="tabler-plus"
            start
          />
          Add CDIO Syllabus
        </VBtn>
      </VCardText>
    </VCard>
  </div>

  <FormDrawer
    :open="formDrawer"
    :study-program-id="props.studyProgramId"
    @handle-close="handleFormDrawer"
  />

  <FormDetailDrawer
    :open="formDetailDrawer"
    :study-program-id="props.studyProgramId"
    @handle-close="handleFormDetailDrawer"
  />

  <FormImportModal
    :open="formImportModal"
    :study-program-id="props.studyProgramId"
    @handle-close="handleFormImportModal"
  />
</template>

<script setup>
import FormDetailDrawer from './cdio-syllabus-detail-form-drawer.vue'
import FormDrawer from './cdio-syllabus-form-drawer.vue'
import FormImportModal from './cdio-syllabus-import-modal.vue'
import { isAuthorized } from '@/helper/index'

const props = defineProps({
  studyProgramId: {
    type: String,
    required: true,
  },
})

const store = useVuex()
const formDrawer = ref(false)
const formDetailDrawer = ref(false)
const formImportModal = ref(false)

const headers = ref([
  { sortable: false, title: "Level", key: "level", value: row => `${row.level}. ${row.title}` },
  { sortable: false, title: "Action", key: "actions", align: "end", sortable: false },
])

const handleFormImportModal = value => {
  formImportModal.value = value
}


const handleFormDrawer = value => {
  if(value) {
    store.commit('CDIOSyllabus/SET_FORM', {
      key: 'study_program_id',
      value: props.studyProgramId,
    })
  }

  formDrawer.value = value
}

const handleFormDetailDrawer = (value, cdio) => {
  if(value) {
    store.commit('CDIOSyllabus/SET_FORM_DETAIL', {
      key: 'study_program_id',
      value: props.studyProgramId,
    })
    store.commit('CDIOSyllabus/SET_FORM_DETAIL', {
      key: 'parent',
      value: `${cdio.level}. ${cdio.title}`,
    })
    store.commit('CDIOSyllabus/SET_FORM_DETAIL', {
      key: 'parent_id',
      value: cdio.id,
    })
  }
  
  formDetailDrawer.value = value
}

const onUpdate = id => {
  store.dispatch('CDIOSyllabus/SetFormUpdate', id)
  handleFormDrawer(true)
}

const onUpdateDetail = (cdio, id) => {
  store.dispatch('CDIOSyllabus/SetFormDetailUpdate', id)

  console.log("cdio", cdio, id)
  
  handleFormDetailDrawer(true, cdio)
}

const onDelete = async id => {
  const confirm = await SwalDelete()

  if(confirm){
    store.dispatch('CDIOSyllabus/Delete', {
      id,
      study_program_id: props.studyProgramId,
    }).then(res => {
      if(res) refetch()
    })
  }
}

const onDeleteDetail = async id => {
  const confirm = await SwalDelete()

  if(confirm){
    store.dispatch('CDIOSyllabus/DeleteDetail', {
      id,
      study_program_id: props.studyProgramId,
    }).then(res => {
      if(res) refetch()
    })
  }
}

const loading = computed(() => store.state.CDIOSyllabus.loading.reports)
const reports = computed(() => store.state.CDIOSyllabus.reports)

const refetch = () => store.dispatch('CDIOSyllabus/GetReports', {
  study_program_id: props.studyProgramId,
})

onMounted(() => refetch())
</script>
