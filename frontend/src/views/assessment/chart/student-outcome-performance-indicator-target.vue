<template>
  <VCard title="Proficiency Level Attainment Target">
    <VCardText>
      <GChart
        type="ComboChart"
        :data="chartData"
        :options="chartColumnOptions"
      />
    </VCardText>
  </VCard>
</template>

<script setup>
import { computed, ref } from "vue"
import { GChart } from "vue-google-charts"

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
  target: {
    type: Number,
    required: true,
  },
})

// Append target line to each row
const chartData = computed(() => {
  if (props.data.length === 0) return []

  // Clone original data to avoid mutating props
  return props.data.map((row, index) => {
    if (index === 0) {
      // Add "Target Line" column in the header row
      return [...row, "Target"]
    } else {
      // Append target value to each row
      return [...row, props.target]
    }
  })
})

const chartColumnOptions = ref({
  isStacked: true,
  height: 350,
  legend: { position: "bottom", maxLines: 5 },
  chartArea: { width: "85%" },
  seriesType: "bars", // Default type is bars
  series: {
    [props.data[0].length - 1]: { type: "line" }, // Last column (Target) as line
  },
  backgroundColor: "transparent",
})
</script>
