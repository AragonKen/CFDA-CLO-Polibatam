<template>
  <VCard
    title="Course Assessment Results"
    subtitle=" Summary of Course Assessment Results"
  >
    <VCardText>
      <VTable class="table-assessment">
        <thead>
          <tr>
            <th style="background-color: #8ee57f !important;">
              Category
            </th>
            <th
              v-for="header in data.headers"
              :key="header.key"
              :rowspan="header?.rowspan"
              :colspan="header?.colspan"
              style="background-color: #8ee57f !important;"
            >
              {{ header?.key }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in data.avg_percentage_by_categories"
            :key="item.title"
          >
            <td>{{ item.title }}</td>
            <td
              v-for="(header, j) in data?.headers"
              :key="`score-${item.title}-${j}`"
            >
              {{ item.avg[header.key] || 0 }}
            </td>
          </tr>
        </tbody>
      </VTable>
      <br>
      <VTable class="table-assessment">
        <thead>
          <tr>
            <th style="background-color: #8ee57f !important;">
              Category
            </th>
            <th
              v-for="header in data.headers"
              :key="header.key"
              :rowspan="header?.rowspan"
              :colspan="header?.colspan"
              style="background-color: #8ee57f !important;"
            >
              {{ header?.key }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in data.target_avg_percentage_by_categories"
            :key="item.title"
          >
            <td>{{ item.title }}</td>
            <td
              v-for="(header, j) in data?.headers"
              :key="`score-${item.title}-${j}`"
            >
              {{ item.avg[header.key] || 0 }}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <th style="background-color: #8ee57f !important;">
            Target Attainment
          </th>
          <th
            v-for="(_, j) in data?.headers"
            :key="`footer-${j}`"
            style="background-color: #8ee57f !important;"
          >
            {{ data.target_attainment }}
          </th>
        </tfoot>
      </VTable>
      <br>
      <VTable class="table-assessment">
        <thead>
          <tr>
            <th style="background-color: #7eb2f2 !important;">
              Proficiency Level
            </th>
            <th
              v-for="header in data.headers"
              :key="header.key"
              :rowspan="header?.rowspan"
              :colspan="header?.colspan"
              style="background-color: #7eb2f2 !important;"
            >
              {{ header?.key }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in data.avg_percentage_by_performance_indicators"
            :key="item.title"
          >
            <td>{{ item.title }}</td>
            <td
              v-for="(header, j) in data?.headers"
              :key="`score-${item.title}-${j}`"
            >
              {{ item.avg[header.key] || 0 }}
            </td>
          </tr>
        </tbody>
      </VTable>

      <br>

      <VRow v-if="data.chart_percentage_by_categories.length > 0">
        <VCol
          cols="12"
          sm="6"
        >
          <AssessmentChartStudentOutcomeAttainment :data="data.chart_percentage_by_categories" />
        </VCol>
        <VCol
          cols="12"
          sm="6"
        >
          <AssessmentChartStudentOutcomeAttainmentTarget
            :data="data.chart_target_avg_percentage_by_categories"
            :target="data.target_attainment"
          />
        </VCol>
        <VCol
          cols="12"
          sm="6"
        >
          <AssessmentChartStudentOutcomePerformanceIndicator :data="data.chart_percentage_by_performance_indicators" />
        </VCol>
        <VCol
          cols="12"
          sm="6"
        >
          <AssessmentChartStudentOutcomePerformanceIndicatorTarget
            :data="data.chart_target_avg_percentage_by_performance_indicators"
            :target="data.target_attainment"
          />
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>

<script setup>
import AssessmentChartStudentOutcomeAttainmentTarget from '@/views/assessment/chart/student-outcome-attainment-target.vue'
import AssessmentChartStudentOutcomeAttainment from '@/views/assessment/chart/student-outcome-attainment.vue'
import AssessmentChartStudentOutcomePerformanceIndicatorTarget from '@/views/assessment/chart/student-outcome-performance-indicator-target.vue'
import AssessmentChartStudentOutcomePerformanceIndicator from '@/views/assessment/chart/student-outcome-performance-indicator.vue'

const props = defineProps({
  assessmentId: {
    type: String,
    required: true,
  },
})

const store = useVuex()

const data = ref({
  headers: [],
  target_attainment: 0,
  
  avg_percentage_by_categories: [],
  avg_percentage_by_performance_indicators: [],
  
  target_avg_percentage_by_categories: [],
  target_avg_percentage_by_performance_indicators: [],

  chart_percentage_by_categories: [],
  chart_percentage_by_performance_indicators: [],

  chart_target_avg_percentage_by_categories: [],
  chart_target_avg_percentage_by_performance_indicators: [],
})

onMounted(async () => {
  await store.dispatch('assessment/GetSummaryAssessmentResults', props.assessmentId).then(response => {
    data.value = response
  })
})
</script>
