<template>
  <div>
    <VCard
      title="Course Learning Outcomes"
      subtitle="List of course learning outcomes"
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
              @click="handleFormDrawer(true)"
            >
              <VIcon
                icon="tabler-plus"
                start
              />
              Add CLO
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
          class="text-no-wrap"
          @update:options="refetch"
        >
          <template #item.rubrics="{ item }">
            <div class="d-flex gap-2 align-center">
              <VChip
                v-for="(rubric, index) in item.rubrics"
                :key="index"
                color="primary"
                label
              >
                {{ rubric?.rubric?.cdio_syllabus?.level }}/{{ rubric?.rubric?.student_outcome?.code }}-{{ rubric?.rubric?.code }}
              </VChip>
            </div>
          </template>
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
    :course-id="props.courseId"
    @handle-close="handleFormDrawer"
  />
</template>

<script setup>
import FormDrawer from './course-learning-outcome-form-drawer.vue'

const props = defineProps({
  courseId: {
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
  { sortable: false, title: "Course Learning Outcome (CLO)", key: "title" },
  { sortable: false, title: "Assessment Method", key: "assessment_method.title" },
  { sortable: false, title: "Support Level of each SO and CDIO Syllabus", key: "rubrics" },
  { sortable: false, title: "Action", key: "actions", align: "end", sortable: false },
])

const handleFormImportModal = value => {
  formImportModal.value = value
}

const handleFormDrawer = value => {
  if(value) {
    store.commit('courseLearningOutcome/SET_FORM', {
      key: 'course_id',
      value: props.courseId,
    })
  } else refetch()

  formDrawer.value = value
}

const onUpdate = id => {
  store.dispatch('courseLearningOutcome/SetFormUpdate', id)
  handleFormDrawer(true)
}

const onDelete = async id => {
  const confirm = await SwalDelete()

  if(confirm){
    store.dispatch('courseLearningOutcome/Delete', {
      id,
      course_id: props.courseId,
    }).then(res => {
      if(res) refetch()
    })
  }
}

const loading = computed(() => store.state.courseLearningOutcome.loading.reports)
const reports = computed(() => store.state.courseLearningOutcome.reports)

const table_options = computed({
  get: () => store.state.courseLearningOutcome.table_options,
  set: value => store.commit('courseLearningOutcome/SET_OPTIONS_TABLE', value),
})

const refetch = () => store.dispatch('courseLearningOutcome/GetReports', {
  course_id: props.courseId,
})

onMounted(() => refetch())
</script>
