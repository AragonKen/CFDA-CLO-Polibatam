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
              v-if="isAuthorized('create_assessment')"
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
    @handle-close="handleFormDrawer"
  />
</template>

<script setup>
  import FormDrawer from './assessment-form-drawer.vue'

  import { isAuthorized } from '@/helper/index';

  const props = defineProps({
    title: {
      type: String,
      default: 'Assessments',
    },
    subtitle: {
      type: String,
      default: 'Manage Assessments',
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
    { sortable: false, title: "Course Code", key: "course.code" },
    { sortable: false, title: "Course", key: "course.title" },
    { sortable: false, title: "Teacher", key: "teacher.name" },
    { sortable: false, title: "Academic Year", key: "academic_year" },
    { sortable: false, title: "Semester", key: "semester" },
    { sortable: false, title: "Class", key: "class" },
    { sortable: false, title: "Proficiency Level", key: "proficiency_level.level" },
    { sortable: false, title: "Action", key: "actions", align: "end", sortable: false },
  ])

  const computedMoreList = computed(() => {
    return item => [
      {
        title: 'Edit',
        prependIcon: 'tabler-pencil',
        onClick: () => onUpdate(item.id),
        hidden: !(isAuthorized('update_assessment'))
      },
      {
        title: 'Delete',
        prependIcon: 'tabler-trash',
        onClick: () => onDelete(item.id),
        hidden: !(isAuthorized('delete_assessment'))
      },
    ].filter(item => {
      if(item.hidden) return !item.hidden
      
      return true
    })
  })

  const handleFormDrawer = value => {
    formDrawer.value = value
  }

  const onUpdate = id => {
    store.dispatch('assessment/SetFormUpdate', id)
    handleFormDrawer(true)
  }

  const onDelete = async id => {
    const confirm = await SwalDelete()

    if(confirm){
      store.dispatch('assessment/Delete', id).then(res => {
        if(res) refetch()
      })
    }
  }

  const onRowClick = (event, { item }) => {
    router.push(`/assessment/${item.id}`)
  }

  const loading = computed(() => store.state.assessment.loading.reports)
  const reports = computed(() => store.state.assessment.reports)

  const table_options = computed({
    get: () => store.state.assessment.table_options,
    set: value => store.commit('assessment/SET_OPTIONS_TABLE', value),
  })

  const refetch = () => store.dispatch('assessment/GetReports')

  onMounted(() => refetch())
</script>
