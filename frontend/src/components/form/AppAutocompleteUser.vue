<template>
  <AppAutocomplete
    v-bind="{
      ...$attrs
    }"
    v-model="selected"
    v-model:search="search"
    :items="reports"
    :loading="loading"
    item-title="name"
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
  selected.value = value
  refetch();
})

watch(() => selected.value, value => {
  emit('update:modelValue', value)
})

defineOptions({
  name: 'AppAutocompleteUser',
  inheritAttrs: false,
})

const store = useVuex()
const reports = computed(() => store.state.user.reports)
const loading = computed(() => store.state.user.loading.reports)

const refetch = () => store.dispatch('user/GetReports', {
  search: search.value ? search.value : selected.value,
  ...props.params,
})

onMounted(() => refetch())
</script>
