<template>
  <AppAutocomplete
    v-bind="{
      ...$attrs
    }"
    v-model="selected"
    v-model:search="search"
    :items="reports"
    :loading="loading"
    item-title="title"
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

// Refetch data when courseId changes
watch(() => props.courseId, () => {
  if (props.courseId) refetch()
}, { immediate: false })

defineOptions({
  name: 'AppAutocompleteAssessmentMethod',
  inheritAttrs: false,
})

const store = useVuex()
const reports = computed(() => store.state.assessmentMethod.reports)
const loading = computed(() => store.state.assessmentMethod.loading.reports)

const refetch = () => store.dispatch('assessmentMethod/GetReports', {
  search: search.value ? search.value : selected.value,
  course_id: props.courseId,
  ...props.params,
})

onMounted(() => refetch())
</script>
