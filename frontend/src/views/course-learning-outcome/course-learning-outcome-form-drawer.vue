<template>
  <VNavigationDrawer
    temporary
    location="end"
    class="scrollable-content w-100"
    style="max-inline-size: 500px;"
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
                {{ is_update ? 'Update' : 'Add' }} Course Learning Outcome (CLO)
              </VCardTitle>
              <p class="mb-0">
                Please fill in the form below to  {{ is_update ? 'update' : 'Add' }} a Course Learning Outcome (CLO)
              </p>
            </VCardItem>

            <VRow>
              <VCol cols="12">
                <AppTextField
                  v-model="code"
                  label="CLO Code*"
                  :rules="[requiredValidator]"
                  autofocus
                />
              </VCol> 
              <VCol cols="12">
                <AppTextarea
                  v-model="title"
                  label="Course Learning Outcome (CLOs)*"
                  :rules="[requiredValidator]"
                  rows="3"
                />
              </VCol> 
              <VCol cols="12">
                <AppAutocompleteAssessmentMethod
                  v-model="assessment_method_id"
                  label="Assessment Method*"
                  :rules="[requiredValidator]"
                  :course-id="props.courseId"
                />
              </VCol> 
              <VCol cols="12">
                <AppAutocompleteRubric
                  v-model="rubrics"
                  rows="3"
                  label="Related SO-PI*"
                  :rules="[requiredValidator]"
                  chips
                  multiple
                  closable-chips
                  :course-id="props.courseId"
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
  store.commit('courseLearningOutcome/SET_IS_UPDATE', false)
  store.commit('courseLearningOutcome/RESET_FORM')

  emit('handleClose', false)
}

console.log("Course ID in course-learning-outcome-form-drawer:", props.courseId)

const handleSubmit = async e => {
  const { valid } = await e

  if(valid){
    if(is_update.value){
      store.dispatch('courseLearningOutcome/Update', {
        id: is_update.value,
        course_id: props.courseId,
      }).then(res => {
        if(res) handleClose()
      })
    }else{
      store.dispatch('courseLearningOutcome/Create', {
        course_id: props.courseId,
      }).then(res => {
        if(res) handleClose()
      })
    }
  }
}

const loading = computed(() => store.state.courseLearningOutcome.loading.form)
const is_update = computed(() => store.state.courseLearningOutcome.is_update)

const code = computed({
  get: () => store.state.courseLearningOutcome.form.code,
  set: value => store.commit('courseLearningOutcome/SET_FORM', {
    key: 'code',
    value,
  }),
})

const title = computed({
  get: () => store.state.courseLearningOutcome.form.title,
  set: value => store.commit('courseLearningOutcome/SET_FORM', {
    key: 'title',
    value,
  }),
})

const description = computed({
  get: () => store.state.courseLearningOutcome.form.description,
  set: value => store.commit('courseLearningOutcome/SET_FORM', {
    key: 'description',
    value,
  }),
})

const course_id = computed({
  get: () => store.state.courseLearningOutcome.form.course_id,
  set: value => store.commit('courseLearningOutcome/SET_FORM', {
    key: 'course_id',
    value,
  }),
})

const assessment_method_id = computed({
  get: () => store.state.courseLearningOutcome.form.assessment_method_id,
  set: value => store.commit('courseLearningOutcome/SET_FORM', {
    key: 'assessment_method_id',
    value,
  }),
})

const rubrics = computed({
  get: () => store.state.courseLearningOutcome.form.rubrics,
  set: value => store.commit('courseLearningOutcome/SET_FORM', {
    key: 'rubrics',
    value,
  }),
})
</script>
