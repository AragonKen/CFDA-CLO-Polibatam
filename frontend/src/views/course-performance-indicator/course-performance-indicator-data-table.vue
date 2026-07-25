<template>
  <div>
    <VCard
      :title="props.title"
      :subtitle="props.subtitle"
    >
      <VDivider />

      <VCardText class="px-0 pt-0">
        <VDataTableServer
          :headers="headers"
          :items="reports"
          :loading="loading"
          hover
          class="text-no-wrap"
        >
          <template #item.performance_indicator="{ item }">
            <span>
              {{ item?.code }}. {{ item?.title }}
            </span>
          </template>
        </VDataTableServer>
      </VCardText>
    </VCard>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: 'Performance Indicators',
  },
  subtitle: {
    type: String,
    default: 'List of course performance indicators',
  },
  courseId: {
    type: String,
    default: null,
  },
})

const store = useVuex()

const headers = ref([
  { sortable: false, title: "Student Outcome", key: "student_outcome.code" },
  { sortable: false, title: "Performance Indicator", key: "performance_indicator" },
  { sortable: false, title: "CDIO Syllabus", key: "cdio_syllabus.level" },
])

const loading = computed(() => store.state.course.loading.reports)
const reports = computed(() => store.state.course.performance_indicators)

const refetch = () => store.dispatch('course/GetPerformanceIndicators', {
  course_id: props.courseId ? props.courseId : null,
})

onMounted(() => refetch())
</script>
