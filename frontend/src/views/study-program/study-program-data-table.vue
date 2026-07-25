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
              @click="handleFormDrawer(true)"
              v-if="isAuthorized('create_study_program')"
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
    :department-id="props.departmentId"
    @handle-close="handleFormDrawer"
  />
</template>

<script setup>
  import FormDrawer from '@/views/study-program/study-program-form-drawer.vue'
  import { isAuthorized } from '@/helper/index';

  const props = defineProps({
    title: {
      type: String,
      default: 'Program Studi',
    },
    subtitle: {
      type: String,
      default: 'Manage Program Studi',
    },
    departmentId: {
      type: String,
      default: null,
    },
  })

  const store = useVuex()
  const router = useRouter()
  const formDrawer = ref(false)

  const headers = ref([
    { sortable: false, title: "Code", key: "code", value: row => row.code ? row.code : '-' },
    { sortable: false, title: "Program Studi", key: "title" },
    { sortable: false, title: "Department", key: "department.title" },
    { sortable: false, title: "Rubrics", key: "_count.rubrics", align: 'end' },
    { sortable: false, title: "Student Outcomes", key: "_count.student_outcomes", align: 'end' },
    { sortable: false, title: "CDIO Syllabuses", key: "_count.cdio_syllabuses", align: 'end' },
    { sortable: false, title: "Action", key: "actions", align: "end", sortable: false },
  ])

  const computedMoreList = computed(() => {
    return item => [
      {
        title: 'Edit',
        prependIcon: 'tabler-pencil',
        onClick: () => onUpdate(item.id),
        hidden: !(isAuthorized('update_study_program'))
      },
      {
        title: 'Delete',
        prependIcon: 'tabler-trash',
        onClick: () => onDelete(item.id),
        hidden: !(isAuthorized('delete_study_program'))
      },
    ].filter(item => {
      if(item.hidden) return !item.hidden
      
      return true
    })
  })

  const handleFormDrawer = value => formDrawer.value = value

  const onUpdate = id => {
    store.dispatch('studyProgram/SetFormUpdate', id)
    handleFormDrawer(true)
  }

  const onDelete = async id => {
    const confirm = await SwalDelete()

    if(confirm){
      store.dispatch('studyProgram/Delete', {
        id,
        department_id: props.departmentId,
      }).then(res => {
        if(res) refetch()
      })
    }
  }

  const onRowClick = (event, { item }) => {
    router.push(`/study-program/${item.id}`)
  }

  const loading = computed(() => store.state.studyProgram.loading.reports)
  const reports = computed(() => store.state.studyProgram.reports)

  const table_options = computed({
    get: () => store.state.studyProgram.table_options,
    set: value => store.commit('studyProgram/SET_OPTIONS_TABLE', value),
  })

  const refetch = () => store.dispatch('studyProgram/GetReports', {
    department_id: props.departmentId ? props.departmentId : null,
  })

  onMounted(() => refetch())
</script>
