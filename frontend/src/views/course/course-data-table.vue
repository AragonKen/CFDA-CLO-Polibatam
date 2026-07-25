<template>
  <div>
    <VCard
      :title="props.title"
      :subtitle="props.subtitle"
    >
      <VDivider />

      <VCardText>
        <div class="d-flex align-center justify-end flex-wrap gap-4">
          <VCheckbox
            v-model="table_options.in_user_department"
            label="My Department Only"
            density="compact"
            hide-details
            @update:model-value="() => refetch()"
          />
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
              :disabled="props.disableAddButton"
              @click="handleFormDrawer(true)"
              v-if="isAuthorized('create_course')"
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
          hover
          class="text-no-wrap"
          @click:row="onRowClick"
          @update:options="refetch"
        >
          <template #item._count.rubrics="{ item }">
            <span :class="`${item._count.rubrics === 0 ? 'text-error' : 'text-primary'} font-weight-bold`">
              {{ item._count.rubrics ? item._count.rubrics : '-' }}
            </span>
          </template>
         
          <template #item._count.student_outcomes="{ item }">
            <span :class="`${item._count.student_outcomes === 0 ? 'text-error' : 'text-primary'} font-weight-bold`">
              {{ item._count.student_outcomes ? item._count.student_outcomes : '-' }}
            </span>
          </template>
         
          <template #item._count.cdio_syllabuses="{ item }">
            <span :class="`${item._count.cdio_syllabuses === 0 ? 'text-error' : 'text-primary'} font-weight-bold`">
              {{ item._count.cdio_syllabuses ? item._count.cdio_syllabuses : '-' }}
            </span>
          </template>
          
          <template #item.actions="{ item }">
            <div class="d-flex justify-end align-center">
              <MoreBtn
                :menu-list="computedMoreList(item)"
                item-props
                color="undefined"
              />
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
</template>

<script setup>
import FormDrawer from './course-form-drawer.vue';
import { isAuthorized } from '@/helper/index';
  

const props = defineProps({
  title: {
    type: String,
    default: 'Courses',
  },
  subtitle: {
    type: String,
    default: 'Manage Courses',
  },
  studyProgramId: {
    type: String,
    default: null,
  },
  disableAddButton: {
    type: Boolean,
    default: false,
  },
})

const store = useVuex()
const router = useRouter()
const formDrawer = ref(false)

const headers = ref([
  { sortable: false, title: "Code", key: "code", value: row => row.code ? row.code : '-' },
  { sortable: false, title: "Course", key: "title" },
  { sortable: false, title: "Course Credit", key: "credit" },
  { sortable: false, title: "Action", key: "actions", align: "end", sortable: false },
])

const computedMoreList = computed(() => {
  return item => [
    {
      title: 'Edit',
      prependIcon: 'tabler-pencil',
      onClick: () => onUpdate(item.id),
      hidden: !(isAuthorized('update_course'))
    },
    {
      title: 'Delete',
      prependIcon: 'tabler-trash',
      onClick: () => onDelete(item.id),
      hidden: !(isAuthorized('delete_course'))
    },
  ].filter(item => {
    if(item.hidden) return !item.hidden
    
    return true
  })
})

const handleFormDrawer = value => {
  if(value){
    store.commit('course/SET_FORM', {
      key: 'study_program_id',
      value: props.studyProgramId,
    })
  }
  
  formDrawer.value = value
}

const onUpdate = id => {
  store.dispatch('course/SetFormUpdate', id)
  handleFormDrawer(true)
}

const onDelete = async id => {
  const confirm = await SwalDelete()

  if(confirm){
    store.dispatch('course/Delete', {
      id,
      study_program_id: props.studyProgramId,
    }).then(res => {
      if(res) refetch()
    })
  }
}

const onRowClick = (event, { item }) => {
  router.push(`/course/${item.id}`)
}

const loading = computed(() => store.state.course.loading.reports)
const reports = computed(() => store.state.course.reports)

const table_options = computed({
  get: () => store.state.course.table_options,
  set: value => store.commit('course/SET_OPTIONS_TABLE', value),
})

const refetch = () => store.dispatch('course/GetReports', {
  study_program_id: props.studyProgramId ? props.studyProgramId : null,
})

onMounted(() => refetch())
</script>
