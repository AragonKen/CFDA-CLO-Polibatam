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
  params: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue'])

const search = ref('')
const selected = ref(null)

watch(() => props.modelValue, value => {
  if (value) {
    selected.value = value
  }
}, { immediate: true }) // Ensure the watcher runs on component mount


watch(() => selected.value, value => {
  emit('update:modelValue', value)
})

defineOptions({
  name: 'AppAutocompleteAssessmentType',
  inheritAttrs: false,
})

const store = useVuex()
const reports = computed(() => store.state.assessmentType.reports)
const loading = computed(() => store.state.assessmentType.loading.reports)

const refetch = () => store.dispatch('assessmentType/GetReports', {
  // search: search.value ? search.value : selected.value,
  page_size: 100, 
  ...props.params,
})

onMounted(() => refetch())
</script>
