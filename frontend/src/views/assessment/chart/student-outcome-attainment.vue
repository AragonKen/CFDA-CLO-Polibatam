<template>
  <VCard title="Student Outcomes Attainment">
    <VCardText>
      <GChart
        type="ColumnChart"
        :data="props.data"
        :options="chartColumnOptions"
      />
    </VCardText>
  </VCard>
</template>

<script setup>
import { ref } from 'vue'
import { GChart } from 'vue-google-charts'

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
})

const chartColumnOptions = ref({
  isStacked: "percent",
  height: 350,
  legend: { position: "bottom", maxLines: 5 },
  chartArea: { width: "90%" },
  backgroundColor: "transparent",

  // colors: ["#8dffbd", "#79f4ff", "#ffb379", "#d879ff"],
})
</script>
