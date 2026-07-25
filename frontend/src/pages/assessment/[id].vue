<template>
  <VCard class="logistics-card-statistics cursor-pointer">
    <VCardText>
      <div class="d-flex align-items-center gap-x-4 mb-2">
        <VAvatar
          variant="tonal"
          size="60"
          color="primary"
          rounded
        >
          <VIcon
            icon="tabler-school"
            size="38"
          />
        </VAvatar>
        <div class="">
          <h5 class="text-h5 font-weight-medium mb-2">
            [<b>{{ report?.course?.code }}</b>]    {{ report?.course?.title }}
          </h5>
        </div>
      </div>
      <VDivider class="my-5" />
      <VRow>
        <VCol
          cols="12"
          sm="6"
        >
          <table>
            <tr
              v-for="(item, index) in [
                {key: 'Semester', value: report?.semester },
                {key: 'Academic Year', value: report?.academic_year },
                {key: 'Class', value: report?.class },
                {key: 'Proficiency Level', value: report?.proficiency_level?.level + ' (' + report?.proficiency_level?.description + ')' },
              ]"
              :key="index"
            >
              <td class="fw-500 text-primary">
                {{ item.key }}
              </td>
              <td style="padding-block: 0;padding-inline: 10px;">
                :
              </td>
              <td>{{ item.value }}</td>
            </tr>
          </table>
        </VCol>
        <VCol
          cols="12"
          sm="6"
        >
          <table>
            <tr
              v-for="(item, index) in [
                {key: 'Teacher NIP', value: report?.teacher?.id },
                {key: 'Teacher Name', value: report?.teacher?.name },
              ]"
              :key="index"
            >
              <td class="fw-500 text-primary">
                {{ item.key }}
              </td>
              <td style="padding-block: 0;padding-inline: 10px;">
                :
              </td>
              <td>{{ item.value }}</td>
            </tr>
          </table>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>

  <AssessmentDetailNavigation />

  <br>

  <section v-if="activeTab == 'overview'">
    <div v-if="report && report?._count?.students > 0">
      <AssessmentSummaryResult :assessment-id="id" />
    </div>

    <div v-else>
      <VCard flat>
        <VCardText class="text-center py-10">
          <img
            src="/blank.png"
            alt="No data available"
            width="200"
            class="mb-5"
          >
          <h3 class="text-h3 mb-3">
            Let’s Get Started!
          </h3>

          <p class="text-body-1">
            It looks like no assessments have been recorded yet. <br> Begin an assessment now or check with your teacher to ensure all data is entered.
          </p>

          <VBtn
            variant="flat"
            @click="onClick"
          >
            Begin Assessment 🚀
          </VBtn>
        </VCardText>
      </VCard>
    </div>
  </section>

  <section v-if="activeTab == 'assessment'">
    <AssessmentStudentDataTable :assessment-id="id" />
    
    <br>
    <section v-if="report && report?._count?.students > 0">
      <AssessmentSummaryPercentageStudentPerCategory :assessment-id="id" />
      <br>
      <AssessmentSummaryProficiencyPerAssessmentTool :assessment-id="id" />
      <br>
      <AssessmentSummaryPercentageStudentPerProficiencyLevel :assessment-id="id" />
      <br>
      <AssessmentSummaryPerformanceIndicatorAttainment :assessment-id="id" />
    </section>
  </section>
</template>

<script setup>
import AssessmentDetailNavigation from '@/views/assessment/assessment-detail-navigation.vue'
import AssessmentStudentDataTable from '@/views/assessment/assessment-student-data-table.vue'

import AssessmentSummaryResult from '@/views/assessment/summary/summary-assessment-result.vue'

import AssessmentSummaryPercentageStudentPerCategory from '@/views/assessment/summary/summary-percentage-student-per-category.vue'
import AssessmentSummaryPercentageStudentPerProficiencyLevel from '@/views/assessment/summary/summary-percentage-student-per-proficiency-level.vue'
import AssessmentSummaryPerformanceIndicatorAttainment from '@/views/assessment/summary/summary-performance-indicator-attainment.vue'
import AssessmentSummaryProficiencyPerAssessmentTool from '@/views/assessment/summary/summary-proficiency-per-assessment-tool.vue'

const store = useVuex()
const route = useRoute()
const router = useRouter()

const id = ref(route.params.id)
const activeTab = computed(() => route.query.tab || 'overview')

const report = computed(() => store.state.assessment.report)
const loading = computed(() => store.state.assessment.loading.report)

const onClick = () => {
  router.push({ query: { tab: 'assessment' } })
}

onMounted(() => {
  store.dispatch('assessment/GetReport', id.value).then(res => {
    if(!res) router.push('/404')
  })
})
</script>
