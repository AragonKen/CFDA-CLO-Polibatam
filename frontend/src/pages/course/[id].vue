<template>
  <div>
    <VCard class="logistics-card-statistics cursor-pointer">
      <VCardText>
        <div class="d-flex gap-x-4 mb-2">
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
          <div>
            <h5 class="text-h5 font-weight-medium mb-2">
              <b>[{{ report?.code }}]</b> {{ report?.title }}
            </h5>

            <VDivider class="mb-3" />
            
            <div class="">
              <table>
                <tr
                  v-for="(item, index) in [
                    {key: 'Department', value: report?.study_program?.department?.title },
                    {key: 'Study Program', value: report?.study_program?.title},
                    {key: 'Credit', value: report?.credit },
                  ]"
                  :key="index"
                >
                  <td>
                    {{ item.key }}
                  </td>
                  <td style="padding: 0 10px;">
                    :
                  </td>
                  <td>{{ item.value }}</td>
                </tr>
                <tr>
                  <td>Assessment Aspects</td>
                  <td style="padding: 0 10px;">
                    :
                  </td>
                  <td>
                    <span
                      v-for="item in report?.assessment_types "
                      :key="item?.id"
                    >
                      {{ item?.assessment_type?.title }} <strong>({{ item?.weight }} %)</strong>, 
                    </span>
                  </td>
                </tr>
              </table>
            </div>
          </div>
        </div>
      </VCardText>
    </VCard>

    <CourseDetailNavigation />

    <div class="mt-5">
      <CoursePerformanceIndicator
        v-if="activeTab === 'performance-indicator'"
        :course-id="courseId"
      />

      <CourseAssessmentPlan
        v-if="activeTab === 'assessment-plan'"
        :course-id="courseId"
      />

      <CourseLearningOutcome
        v-if="activeTab === 'clo'"
        :course-id="courseId"
      />
    </div>
  </div>
</template>

<script setup>
import CourseDetailNavigation from '@/views/course/detail/course-detail-navigation.vue'

import CourseAssessmentPlan from '@/views/course-assessment-plan/course-assessment-plan-data-table.vue'
import CourseLearningOutcome from '@/views/course-learning-outcome/course-learning-outcome-data-table.vue'
import CoursePerformanceIndicator from '@/views/course-performance-indicator/course-performance-indicator-data-table.vue'

const store = useVuex()
const route = useRoute()
const courseId = ref(route.params.id)

const activeTab = computed(() => route.query.tab || 'performance-indicator')

const loading = computed(() => store.state.course.loading.report)
const report = computed(() => store.state.course.report)

const refetch = () => store.dispatch('course/GetReport', courseId.value)

onMounted(() => refetch())
</script>
