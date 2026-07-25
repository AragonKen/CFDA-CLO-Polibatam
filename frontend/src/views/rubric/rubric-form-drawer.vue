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
                {{ is_update ? 'Update' : 'Add' }} Rubric
              </VCardTitle>
              <p class="mb-0">
                Please fill in the form below to  {{ is_update ? 'update' : 'Add' }} a Rubric
              </p>
            </VCardItem>

            <VRow>
              <VCol
                cols="12"
                sm="6"
              >
                <AppAutocompleteStudentOutcome
                  v-model="student_outcome_id"
                  :study-program-id="props.studyProgramId"
                  label="Student Outcome*"
                  :rules="[requiredValidator]"
                  autofocus
                />
              </VCol> 
              <VCol
                cols="12"
                sm="6"
              >
                <AppAutocompleteCDIOSyllabus
                  v-model="cdio_syllabus_id"
                  :study-program-id="props.studyProgramId"
                  label="CDIO Syllabus*"
                  :rules="[requiredValidator]"
                  autofocus
                />
              </VCol> 
              <VCol cols="12">
                <AppTextField
                  v-model="code"
                  label="Code*"
                  :rules="[requiredValidator]"
                  autofocus
                />
              </VCol> 
              <VCol cols="12">
                <AppTextarea
                  v-model="title"
                  rows="3"
                  label="Performance Indicator*"
                  :rules="[requiredValidator]"
                  autofocus
                />
              </VCol>
              <VCol cols="12">
                <VDivider />
              </VCol>
              <VCol cols="12">
                <AppTextarea
                  v-model="description_level_1"
                  rows="3"
                  label="Proficiency Level 1"
                />
              </VCol>
              <VCol cols="12">
                <AppTextarea
                  v-model="description_level_2"
                  rows="3"
                  label="Proficiency Level 2"
                />
              </VCol>
              <VCol cols="12">
                <AppTextarea
                  v-model="description_level_3"
                  rows="3"
                  label="Proficiency Level 3"
                />
              </VCol>
              <VCol cols="12">
                <AppTextarea
                  v-model="description_level_4"
                  rows="3"
                  label="Proficiency Level 4"
                />
              </VCol>
              <VCol cols="12">
                <AppTextarea
                  v-model="description_level_5"
                  rows="3"
                  label="Proficiency Level 5"
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
  studyProgramId: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['handleClose'])
const store = useVuex()

const handleClose = () => {
  store.commit('rubric/SET_IS_UPDATE', false)
  store.commit('rubric/RESET_FORM')

  emit('handleClose', false)
}

const handleSubmit = async e => {
  const { valid } = await e

  if(valid){
    if(is_update.value){
      store.dispatch('rubric/Update', {
        id: is_update.value,
        study_program_id: props.studyProgramId,
      }).then(res => {
        if(res) handleClose()
      })
    }else{
      store.dispatch('rubric/Create', {
        study_program_id: props.studyProgramId,
      }).then(res => {
        if(res) handleClose()
      })
    }
  }
}

const loading = computed(() => store.state.rubric.loading.form)
const is_update = computed(() => store.state.rubric.is_update)

const code = computed({
  get: () => store.state.rubric.form.code,
  set: value => store.commit('rubric/SET_FORM', {
    key: 'code',
    value,
  }),
})

const title = computed({
  get: () => store.state.rubric.form.title,
  set: value => store.commit('rubric/SET_FORM', {
    key: 'title',
    value,
  }),
})

const description_level_1 = computed({
  get: () => store.state.rubric.form.description_level_1,
  set: value => store.commit('rubric/SET_FORM', {
    key: 'description_level_1',
    value,
  }),
})

const description_level_2 = computed({
  get: () => store.state.rubric.form.description_level_2,
  set: value => store.commit('rubric/SET_FORM', {
    key: 'description_level_2',
    value,
  }),
})

const description_level_3 = computed({
  get: () => store.state.rubric.form.description_level_3,
  set: value => store.commit('rubric/SET_FORM', {
    key: 'description_level_3',
    value,
  }),
})

const description_level_4 = computed({
  get: () => store.state.rubric.form.description_level_4,
  set: value => store.commit('rubric/SET_FORM', {
    key: 'description_level_4',
    value,
  }),
})

const description_level_5 = computed({
  get: () => store.state.rubric.form.description_level_5,
  set: value => store.commit('rubric/SET_FORM', {
    key: 'description_level_5',
    value,
  }),
})

const student_outcome_id = computed({
  get: () => store.state.rubric.form.student_outcome_id,
  set: value => store.commit('rubric/SET_FORM', {
    key: 'student_outcome_id',
    value,
  }),
})

const cdio_syllabus_id = computed({
  get: () => store.state.rubric.form.cdio_syllabus_id,
  set: value => store.commit('rubric/SET_FORM', {
    key: 'cdio_syllabus_id',
    value,
  }),
})
</script>
