<template>
  <div>
    <VCard
      title="Course Assessment Plan"
      subtitle="List of course Assessment Plan"
    >
      <VDivider />

      <VCardText>
        <div class="d-flex justify-end">
          <VBtn
            size="small"
            variant="flat"
            :loading="loading"
            @click="onGenerate"
          >
            <VIcon
              icon="tabler-file-import"
              start
            />

            Generate Assessment Plan
          </VBtn>
        </div>
      </VCardText>

      <VCardText class="px-0">
        <VTable class="text-no-wrap border-t">
          <thead>
            <tr>
              <th>SO-PI</th>
              <th>W1</th>
              <th>W2</th>
              <th>W3</th>
              <th>W4</th>
              <th>W5</th>
              <th>W6</th>
              <th>W7</th>
              <th>Mid-Sem</th>
              <th>W8</th>
              <th>W9</th>
              <th>W10</th>
              <th>W11</th>
              <th>W12</th>
              <th>W13</th>
              <th>W14</th>
              <th>Final-Sem</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item) in reports"
              :key="item.id"
            >
              <td>{{ item?.rubric?.student_outcome?.code }}-{{ item?.rubric?.code }}</td>
              <td>{{ item?.week1 || "-" }}</td>
              <td>{{ item?.week2 || "-" }}</td>
              <td>{{ item?.week3 || "-" }}</td>
              <td>{{ item?.week4 || "-" }}</td>
              <td>{{ item?.week5 || "-" }}</td>
              <td>{{ item?.week6 || "-" }}</td>
              <td>{{ item?.week7 || "-" }}</td>
              <td>{{ item?.mid_semester || "-" }}</td>
              <td>{{ item?.week8 || "-" }}</td>
              <td>{{ item?.week9 || "-" }}</td>
              <td>{{ item?.week10 || "-" }}</td>
              <td>{{ item?.week11 || "-" }}</td>
              <td>{{ item?.week12 || "-" }}</td>
              <td>{{ item?.week13 || "-" }}</td>
              <td>{{ item?.week14 || "-" }}</td>
              <td>{{ item?.final_semester || "-" }}</td>
              <td>
                <IconBtn @click="onUpdate(item.id)">
                  <VIcon icon="tabler-edit" />
                </IconBtn>
              </td>
            </tr>
          </tbody>
        </VTable>
      </VCardText>
    </VCard>
  </div>

  
  <FormDrawer
    :open="formDrawer"
    :course-id="props.courseId"
    @handle-close="handleFormDrawer"
  />
</template>

<script setup>
import FormDrawer from './course-assessment-plan-form-drawer.vue'

const props = defineProps({
  courseId: {
    type: String,
    required: true,
  },
})

const store = useVuex()
const formDrawer = ref(false)

const onGenerate = async () => {
  const confirm = await SwalGenerateCourseAssessmentPlan()

  if(confirm){
    store.dispatch('courseAssessmentPlan/Generate', {
      course_id: props.courseId,
    })
  }
}

const handleFormDrawer = value => {
  if(value) {
    store.commit('courseAssessmentPlan/SET_FORM', {
      key: 'course_id',
      value: props.courseId,
    })
  }

  formDrawer.value = value
}

const onUpdate = id => {
  store.dispatch('courseAssessmentPlan/SetFormUpdate', id)
  handleFormDrawer(true)
}

const loading = computed(() => store.state.courseAssessmentPlan.loading.reports)
const reports = computed(() => store.state.courseAssessmentPlan.reports)

const refetch = () => store.dispatch('courseAssessmentPlan/GetReports', {
  course_id: props.courseId,
})

onMounted(() => refetch())
</script>
