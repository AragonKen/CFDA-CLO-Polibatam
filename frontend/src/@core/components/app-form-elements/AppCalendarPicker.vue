<script setup>
import { DatePicker } from 'v-calendar'
import { useScreens } from 'vue-screen-utils'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  disablePast: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])
const { mapCurrent } = useScreens({ xs: '0px', sm: '640px', md: '768px', lg: '1024px' })
const columns = mapCurrent({ lg: 2 }, 1)

defineOptions({
  name: 'AppCalendarPicker',
  inheritAttrs: false,
})

const date = ref(props.modelValue)

// Sync date with modelValue prop
watch(
  () => props.modelValue,
  newValue => {
    if (newValue !== date.value) {
      date.value = newValue
    }
  },
)

// Emit changes when the date is updated
watch(date, newValue => {
  emit('update:modelValue', newValue)
})

const disabledDates = ref([])

watch(
  () => props.disablePast,
  newValue => {
    if (newValue) {
      disabledDates.value.push({
        start: new Date(0),
        end: new Date(),
      })
    }
  },
  { immediate: true },
)
</script>

<template>
  <div
    class="app-calendar-picker flex-grow-1"
    :class="$attrs.class"
  >
    <DatePicker
      v-model="date"
      color="red"
      title-position="left"
      expanded
      transparent
      v-bind="$attrs"
      class="rounded-0 border"
      :disabled-dates="disabledDates"
      :columns="columns"
    />
  </div>
</template>

<style lang="scss">
@use 'v-calendar/style.css';

.vc-pane-container {
  .vc-header {
    margin: 20px 0;
  }
  
  .vc-highlight-bg-solid {
    border-radius: 5px !important;
  }

  .vc-day-content {
    width: 40px !important;
    height: 40px !important;
    border-radius: 5px !important;
  }

  .vc-highlight {
    width: 40px !important;
    height: 40px !important;
  }
}
</style>
