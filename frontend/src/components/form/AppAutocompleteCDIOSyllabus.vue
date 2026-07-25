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
    menu-props="auto"
    class="custom-autocomplete"
    @update:search="refetch"
  />
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  studyProgramId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const search = ref('')
const selected = ref(null)

watch(() => props.modelValue, value => {
    selected.value = value
    refetch();
})

watch(() => selected.value, value => {
  emit('update:modelValue', value)
})

defineOptions({
  name: 'AppAutocompleteCDIOSyllabus',
  inheritAttrs: false,
})

const store = useVuex()
const reports = computed(() => store.state.CDIOSyllabus.reports)
const loading = computed(() => store.state.CDIOSyllabus.loading.reports)

const refetch = () => store.dispatch('CDIOSyllabus/GetAutocompleteReports', {
  search: search.value ? search.value : selected.value,
  study_program_id: props?.studyProgramId,
})

onMounted(() => refetch())
</script>
