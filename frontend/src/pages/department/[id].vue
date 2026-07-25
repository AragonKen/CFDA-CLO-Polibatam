<template>
  <DataTable
    :title="`${report?.code} : ${report?.title} - Program Studi`"
    :subtitle="`Total Program Studi: ${report?._count?.studi_programs}`"
    :department-id="departmentId"
  />
</template>

<script setup>
import DataTable from '@/views/study-program/study-program-data-table.vue'

const store = useVuex()
const route = useRoute()
const departmentId = ref(route.params.id)

const report = computed(() => store.state.department.report)
const loading = computed(() => store.state.department.loading)

onMounted(() => {
  store.dispatch('department/GetReport', departmentId.value)
})
</script>
