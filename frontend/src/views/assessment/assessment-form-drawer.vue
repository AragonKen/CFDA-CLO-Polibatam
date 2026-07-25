<template>
  <VNavigationDrawer
    temporary
    location="end"
    class="scrollable-content w-100"
    style="max-width: 500px;"
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
                {{ is_update ? 'Update' : 'Add' }} Assessment
              </VCardTitle>
              <p class="mb-0">
                Please fill in the form below to  {{ is_update ? 'update' : 'Add' }} a Assessment
              </p>
            </VCardItem>

            <VRow>
              <VCol cols="12">
                <AppAutocompleteUser
                  v-model="teacher_nip"
                  label="Teacher*"
                  :rules="[requiredValidator]"
                  :params="is_admin ? {} : { in_user_department: true }"
                />
              </VCol>
              <VCol cols="12">
                <AppAutocompleteCourse
                  v-model="course_id"
                  label="Course*"
                  :rules="[requiredValidator]"
                  :params="is_admin ? {} : { in_user_department: true }"
                />
              </VCol> 
              <VCol cols="12">
                <AppTextField
                  v-model="semester"
                  label="Semester*"
                  :rules="[requiredValidator]"
                  type="number"
                />
              </VCol> 
              <VCol cols="12">
                <AppTextField
                  v-model="academic_year"
                  label="Academic Year*"
                  :rules="[requiredValidator]"
                />
              </VCol> 
              <VCol cols="12">
                <AppTextField
                  v-model="assessment_class"
                  label="Class*"
                  :rules="[requiredValidator]"
                />
              </VCol> 
              <VCol cols="12">
                <AppTextField
                  v-model="target_attainment"
                  label="Target Attainment*"
                  :rules="[requiredValidator]"
                  type="number"
                />
              </VCol> 
              <VCol cols="12">
                <AppAutocompleteProficiencyLevel
                  v-model="proficiency_level_id"
                  label="Target Proficiency Level*"
                  :rules="[requiredValidator]"
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
})

const emit = defineEmits(['handleClose'])
const store = useVuex()

const handleClose = () => {
  store.commit('assessment/SET_IS_UPDATE', false)
  store.commit('assessment/RESET_FORM')

  emit('handleClose', false)
}

const handleSubmit = async e => {
  const { valid } = await e

  if(valid){
    if(is_update.value){
      store.dispatch('assessment/Update', is_update.value).then(res => {
        if(res) handleClose()
      })
    }else{
      store.dispatch('assessment/Create').then(res => {
        if(res) handleClose()
      })
    }
  }
}

const loading = computed(() => store.state.assessment.loading.form)
const is_update = computed(() => store.state.assessment.is_update)
const role = computed(() => store.state.app.role)
const is_admin = computed(() => role.value?.toLowerCase() === 'admin')

const semester = computed({
  get: () => store.state.assessment.form.semester,
  set: value => store.commit('assessment/SET_FORM', {
    key: 'semester',
    value,
  }),
})

const academic_year = computed({
  get: () => store.state.assessment.form.academic_year,
  set: value => store.commit('assessment/SET_FORM', {
    key: 'academic_year',
    value,
  }),
})

const assessment_class = computed({
  get: () => store.state.assessment.form.class,
  set: value => store.commit('assessment/SET_FORM', {
    key: 'class',
    value,
  }),
})

const target_attainment = computed({
  get: () => store.state.assessment.form.target_attainment,
  set: value => store.commit('assessment/SET_FORM', {
    key: 'target_attainment',
    value,
  }),
})

const teacher_nip = computed({
  get: () => store.state.assessment.form.teacher_nip,
  set: value => store.commit('assessment/SET_FORM', {
    key: 'teacher_nip',
    value,
  }),
})

const course_id = computed({
  get: () => store.state.assessment.form.course_id,
  set: value => store.commit('assessment/SET_FORM', {
    key: 'course_id',
    value,
  }),
})

const proficiency_level_id = computed({
  get: () => store.state.assessment.form.proficiency_level_id,
  set: value => store.commit('assessment/SET_FORM', {
    key: 'proficiency_level_id',
    value,
  }),
})
</script>
