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

defineOptions({
  name: 'AppAutocompleteDepartment',
  inheritAttrs: false,
})

const store = useVuex()
const reports = computed(() => store.state.department.reports)
const loading = computed(() => store.state.department.loading.reports)

const refetch = () => store.dispatch('department/GetReports', {
  search: search.value ? search.value : selected.value,
})

onMounted(() => refetch())
</script>
