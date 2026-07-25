<template>
  <div>
    <VCard
      title="Department"
      subtitle="Manage Department"
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
              v-if="isAuthorized('create_department')"
            >
              <VIcon
                icon="tabler-plus"
                start
              />
              Add Department
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
              <IconBtn :to="`/department/${item.id}`">
                <VIcon icon="tabler-eye" />
              </IconBtn>
              
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
  import FormDrawer from '@/views/department/department-form-drawer.vue'
  import { isAuthorized } from '@/helper/index';

  const store = useVuex()
  const router = useRouter()
  const formDrawer = ref(false)

  const headers = ref([
    { sortable: false, title: "Code", value: "code" },
    { sortable: false, title: "department", value: "title" },
    { sortable: false, title: "Program Studi", value: "_count.studi_programs" },
    { sortable: false, title: "Action", value: "actions", align: "end", sortable: false },
  ])

  const computedMoreList = computed(() => {
    return item => [
      {
        title: 'Edit',
        prependIcon: 'tabler-pencil',
        onClick: () => onUpdate(item.id),
        hidden: !isAuthorized('update_department')
      },
      {
        title: 'Delete',
        prependIcon: 'tabler-trash',
        onClick: () => onDelete(item.id),
        hidden: !isAuthorized('delete_department')
      },
    ].filter(item => {
      if(item.hidden) return !item.hidden
      
      return true
    })
  })

  const handleFormDrawer = value => formDrawer.value = value

  const onUpdate = id => {
    store.dispatch('department/SetFormUpdate', id)
    handleFormDrawer(true)
  }

  const onDelete = async id => {
    const confirm = await SwalDelete()

    if(confirm){
      store.dispatch('department/Delete', id).then(res => {
        if(res) refetch()
      })
    }
  }

  const onRowClick = (event, { item }) => {
    router.push(`/department/${item.id}`)
  }

  const loading = computed(() => store.state.department.loading.reports)
  const reports = computed(() => store.state.department.reports)

  const table_options = computed({
    get: () => store.state.department.table_options,
    set: value => store.commit('department/SET_OPTIONS_TABLE', value),
  })

  const refetch = () => store.dispatch('department/GetReports')

  onMounted(() => refetch())
</script>
