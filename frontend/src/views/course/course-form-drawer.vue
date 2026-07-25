<template>
  <VNavigationDrawer
    temporary
    location="end"
    class="scrollable-content w-100"
    style="max-inline-size: 800px;"
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
              <VCardTitle class="text-h3 mb-3">
                {{ is_update ? 'Update' : 'Add' }} Course
              </VCardTitle>
              <p class="mb-0">
                Please fill in the form below to  {{ is_update ? 'update' : 'Add' }} a Course
              </p>
            </VCardItem>

            <VRow>
              <VCol
                v-if="!props.studyProgramId"
                cols="12"
                sm="6"
              >
                <AppAutocompleteStudyProgram
                  v-model="study_program_id"
                  label="Study Program*"
                  :rules="[requiredValidator]"
                  :params="is_admin ? { read_for_course: true } : { read_for_course: true, in_user_department: true }"
                />
              </VCol> 
              <VCol
                cols="12"
                sm="6"
              >
                <AppTextField
                  v-model="code"
                  label="Course Code*"
                  :rules="[requiredValidator]"
                />
              </VCol> 
              <VCol
                cols="12"
                sm="6"
              >
                <AppTextField
                  v-model="title"
                  label="Course Name*"
                  :rules="[requiredValidator]"
                />
              </VCol> 
              <VCol
                cols="12"
                sm="6"
              >
                <AppTextField
                  v-model="credit"
                  label="Credit*"
                  :rules="[requiredValidator]"
                  type="number"
                />
              </VCol> 
            </VRow>

            <br>

            <p class="mb-2">
              Assessment
            </p>
            <VDivider class="mb-5" />

            <VRow
              v-for="(assessment, index) in assessments"
              :key="index"
              class="align-items-end"
            >
              <VCol
                cols="12"
                sm="4"
              >
                <AppAutocompleteAssessmentType
                  v-model="assessment.assessment_type_id"
                  label="Assessment Type*"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol
                cols="5"
                sm="4"
              >
                <AppTextField
                  v-model="assessment.weight"
                  label="Assessment Weight (%)*"
                  type="number"
                />
              </VCol>
              <VCol
                cols="4"
                sm="3"
              >
                <AppTextField
                  v-model="assessment.quantity"
                  label="Quantity*"
                  type="number"
                />
              </VCol>
              <VCol
                v-if="assessments && assessments.length > 1"
                cols="2"
                sm="1"
              >
                <IconBtn @click="onSpliceAssessment(index)">
                  <VIcon icon="tabler-trash" />
                </IconBtn>
              </VCol>
            </VRow>

            <br>

            <VAlert
              variant="tonal"
              :color="assessmentPercentages() === 100 ? 'success' : 'error'"
            >
              Assessment weight : <strong>{{ assessmentPercentages() }}%</strong>
            </VAlert>

            <VBtn
              class="mt-5"
              variant="tonal"
              size="small"
              @click="onAddAssessment"
            >
              Add Assessment
            </VBtn>

            <VDivider class="mt-5" />

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
  studyProgramId: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['handleClose'])
const store = useVuex()

const onAddAssessment = () => store.commit('course/PUSH_FORM_ASSESSMENT')
const onSpliceAssessment = index => store.commit('course/SPLICE_FORM_ASSESSMENT', index)

const assessmentPercentages = () => {
  return assessments.value.reduce((acc, curr) => acc + Number(curr.weight), 0)
}

const handleClose = () => {
  store.commit('course/SET_IS_UPDATE', false)
  store.commit('course/RESET_FORM')

  emit('handleClose', false)
}

watch(() => props.studyProgramId, value => {
  store.commit('course/SET_FORM', {
    key: 'study_program_id',
    value,
  })
})

const handleSubmit = async e => {
  const { valid } = await e

  console.log(valid)
  

  if(valid){
    if(is_update.value){
      store.dispatch('course/Update', {
        id: is_update.value,
        study_program_id: props.studyProgramId,
      }).then(res => {
        if(res) handleClose()
      })
    }else{
      store.dispatch('course/Create', {
        study_program_id: props.studyProgramId,
      }).then(res => {
        if(res) handleClose()
      })
    }
  }
}

const loading = computed(() => store.state.course.loading.form)
const is_update = computed(() => store.state.course.is_update)
const role = computed(() => store.state.app.role)
const is_admin = computed(() => role.value?.toLowerCase() === 'admin')

const title = computed({
  get: () => store.state.course.form.title,
  set: value => store.commit('course/SET_FORM', {
    key: 'title',
    value,
  }),
})

const study_program_id = computed({
  get: () => store.state.course.form.study_program_id,
  set: value => store.commit('course/SET_FORM', {
    key: 'study_program_id',
    value,
  }),
})

const code = computed({
  get: () => store.state.course.form.code,
  set: value => store.commit('course/SET_FORM', {
    key: 'code',
    value,
  }),
})

const credit = computed({
  get: () => store.state.course.form.credit,
  set: value => store.commit('course/SET_FORM', {
    key: 'credit',
    value,
  }),
})

const assessments = computed({
  get: () => store.state.course.form_assessment,
  set: value => store.commit('course/SET_FORM_ASSESSMENT', value),
})
</script>
