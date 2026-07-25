<template>
  <AppAutocomplete
    v-bind="{
      ...$attrs
    }"
    v-model="selected"
    v-model:search="search"
    :items="reports"
    :loading="loading"
    item-title="label"
    item-value="id"
    @update:search="refetch"
  />
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  courseId: {
    type: String,
    default: null,
  },
  params: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue'])

const search = ref('')
const selected = ref(null)

watch(() => props.modelValue, value => {
  selected.value = value
})

watch(() => selected.value, value => {
  emit('update:modelValue', value)
})

console.log("Course ID in AppAutocompleteRubric:", props.courseId)

defineOptions({
  name: 'AppAutocompleteRubric',
  inheritAttrs: false,
})

const store = useVuex()
const reports = computed(() => store.state.rubric.reports)
const loading = computed(() => store.state.rubric.loading.reports)

const refetch = () => store.dispatch('rubric/GetReports', {
  // search: search.value ? search.value : selected.value,
  page_size: 100,
  course_id: props.courseId,
  ...props.params,
})

// Refetch data when courseId changes
watch(() => props.courseId, () => {
  if (props.courseId) refetch()
}, { immediate: true })

// Only refetch on mount if courseId is available
onMounted(() => {
  if (props.courseId) refetch()
})
</script>
