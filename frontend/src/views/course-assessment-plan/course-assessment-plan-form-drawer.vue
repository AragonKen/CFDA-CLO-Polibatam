<template>
  <VNavigationDrawer
    temporary
    location="end"
    class="scrollable-content w-100"
    style="max-width: 800px;"
    :model-value="props.open"
    @update:model-value="handleClose"
    @click:outside="handleClose"
  >
    <AppDrawerHeaderSection @click="handleClose" />
  
    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VCardText>
          <VForm
            validate-on="submit lazy"
            @submit.prevent="handleSubmit"
          >
            <VCardItem class="text-center">
              <VCardTitle class="text-h4 mb-3">
                {{ is_update ? 'Update' : 'Add' }} Course Assessment Plan
              </VCardTitle>
              <p class="mb-0">
                Please fill in the form below to  {{ is_update ? 'update' : 'Add' }} a Course Assessment Plan
              </p>
            </VCardItem>

            <VRow>
              <VCol
                cols="12"
                sm="6"
              >
                <AppAutocomplete
                  v-model="week1"
                  clearable
                  :items="formatted_assessment_types"
                  label="Week 1"
                />
              </VCol> 
              <VCol
                cols="12"
                sm="6"
              >
                <AppAutocomplete
                  v-model="week2"
                  clearable
                  :items="formatted_assessment_types"
                  label="Week 2"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppAutocomplete
                  v-model="week3"
                  clearable
                  :items="formatted_assessment_types"
                  label="Week 3"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppAutocomplete
                  v-model="week4"
                  clearable
                  :items="formatted_assessment_types"
                  label="Week 4"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppAutocomplete
                  v-model="week5"
                  clearable
                  :items="formatted_assessment_types"
                  label="Week 5"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppAutocomplete
                  v-model="week6"
                  clearable
                  :items="formatted_assessment_types"
                  label="Week 6"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppAutocomplete
                  v-model="week7"
                  clearable
                  :items="formatted_assessment_types"
                  label="Week 7"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppAutocomplete
                  v-model="mid_semester"
                  clearable
                  :items="formatted_assessment_types"
                  label="Mid Semester"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppAutocomplete
                  v-model="week8"
                  clearable
                  :items="formatted_assessment_types"
                  label="Week 8"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppAutocomplete
                  v-model="week9"
                  clearable
                  :items="formatted_assessment_types"
                  label="Week 9"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppAutocomplete
                  v-model="week10"
                  clearable
                  :items="formatted_assessment_types"
                  label="Week 10"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppAutocomplete
                  v-model="week11"
                  clearable
                  :items="formatted_assessment_types"
                  label="Week 11"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppAutocomplete
                  v-model="week12"
                  clearable
                  :items="formatted_assessment_types"
                  label="Week 12"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppAutocomplete
                  v-model="week13"
                  clearable
                  :items="formatted_assessment_types"
                  label="Week 13"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppAutocomplete
                  v-model="week14"
                  clearable
                  :items="formatted_assessment_types"
                  label="Week 14"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppAutocomplete
                  v-model="final_semester"
                  clearable
                  :items="formatted_assessment_types"
                  label="Final Semester"
                />
              </VCol>
            </VRow>

            <br>
            <div class="d-flex flex-row-reverse gap-3">
              <VBtn
                type="submit"
                :loading="loading"
              >
                Submit
              </VBtn>
              <VBtn
                variant="tonal"
                @click="handleClose"
              >
                Cancel
              </VBtn>
            </div>
          </VForm>
        </VCardText>
      </VCard>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>

<script setup>
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

const props = defineProps({
  open: { type: Boolean, required: false },
  courseId: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['handleClose'])
const store = useVuex()

const handleClose = () => {
  store.commit('courseAssessmentPlan/SET_IS_UPDATE', false)
  store.commit('courseAssessmentPlan/RESET_FORM')

  emit('handleClose', false)
}

const handleSubmit = async e => {
  const { valid } = await e

  if(valid && is_update.value){
    store.dispatch('courseAssessmentPlan/Update', {
      id: is_update.value,
      course_id: props.courseId,
    }).then(res => {
      if(res) handleClose()
    })
  }
}

const loading = computed(() => store.state.courseAssessmentPlan.loading.form)
const is_update = computed(() => store.state.courseAssessmentPlan.is_update)

const formatted_assessment_types = computed(() => store.state.course.report.formatted_assessment_types)

const week1 = computed({
  get: () => store.state.courseAssessmentPlan.form.week1,
  set: value => store.commit('courseAssessmentPlan/SET_FORM', {
    key: 'week1',
    value,
  }),
})

const week2 = computed({
  get: () => store.state.courseAssessmentPlan.form.week2,
  set: value => store.commit('courseAssessmentPlan/SET_FORM', {
    key: 'week2',
    value,
  }),
})

const week3 = computed({
  get: () => store.state.courseAssessmentPlan.form.week3,
  set: value => store.commit('courseAssessmentPlan/SET_FORM', {
    key: 'week3',
    value,
  }),
})

const week4 = computed({
  get: () => store.state.courseAssessmentPlan.form.week4,
  set: value => store.commit('courseAssessmentPlan/SET_FORM', {
    key: 'week4',
    value,
  }),
})

const week5 = computed({
  get: () => store.state.courseAssessmentPlan.form.week5,
  set: value => store.commit('courseAssessmentPlan/SET_FORM', {
    key: 'week5',
    value,
  }),
})

const week6 = computed({
  get: () => store.state.courseAssessmentPlan.form.week6,
  set: value => store.commit('courseAssessmentPlan/SET_FORM', {
    key: 'week6',
    value,
  }),
})

const week7 = computed({
  get: () => store.state.courseAssessmentPlan.form.week7,
  set: value => store.commit('courseAssessmentPlan/SET_FORM', {
    key: 'week7',
    value,
  }),
})

const week8 = computed({
  get: () => store.state.courseAssessmentPlan.form.week8,
  set: value => store.commit('courseAssessmentPlan/SET_FORM', {
    key: 'week8',
    value,
  }),
})

const week9 = computed({
  get: () => store.state.courseAssessmentPlan.form.week9,
  set: value => store.commit('courseAssessmentPlan/SET_FORM', {
    key: 'week9',
    value,
  }),
})

const week10 = computed({
  get: () => store.state.courseAssessmentPlan.form.week10,
  set: value => store.commit('courseAssessmentPlan/SET_FORM', {
    key: 'week10',
    value,
  }),
})

const week11 = computed({
  get: () => store.state.courseAssessmentPlan.form.week11,
  set: value => store.commit('courseAssessmentPlan/SET_FORM', {
    key: 'week11',
    value,
  }),
})

const week12 = computed({
  get: () => store.state.courseAssessmentPlan.form.week12,
  set: value => store.commit('courseAssessmentPlan/SET_FORM', {
    key: 'week12',
    value,
  }),
})

const week13 = computed({
  get: () => store.state.courseAssessmentPlan.form.week13,
  set: value => store.commit('courseAssessmentPlan/SET_FORM', {
    key: 'week13',
    value,
  }),
})

const week14 = computed({
  get: () => store.state.courseAssessmentPlan.form.week14,
  set: value => store.commit('courseAssessmentPlan/SET_FORM', {
    key: 'week14',
    value,
  }),
})

const mid_semester = computed({
  get: () => store.state.courseAssessmentPlan.form.mid_semester,
  set: value => store.commit('courseAssessmentPlan/SET_FORM', {
    key: 'mid_semester',
    value,
  }),
})

const final_semester = computed({
  get: () => store.state.courseAssessmentPlan.form.final_semester,
  set: value => store.commit('courseAssessmentPlan/SET_FORM', {
    key: 'final_semester',
    value,
  }),
})
</script>
