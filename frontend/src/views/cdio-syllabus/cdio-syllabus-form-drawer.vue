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
              <VCardTitle class="text-h3 mb-3">
                {{ is_update ? 'Update' : 'Add' }} CDIO Syllabus
              </VCardTitle>
              <p class="mb-0">
                Please fill in the form below to  {{ is_update ? 'update' : 'Add' }} a CDIO Syllabus
              </p>
            </VCardItem>

            <VRow>
              <VCol cols="12">
                <AppTextarea
                  v-model="title"
                  label="CDIO Syllabus*"
                  :rules="[requiredValidator]"
                  autofocus
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
  store.commit('CDIOSyllabus/SET_IS_UPDATE', false)
  store.commit('CDIOSyllabus/RESET_FORM')

  emit('handleClose', false)
}

const handleSubmit = async e => {
  const { valid } = await e

  if(valid){
    if(is_update.value){
      store.dispatch('CDIOSyllabus/Update', {
        id: is_update.value,
        study_program_id: props.studyProgramId,
      }).then(res => {
        if(res) handleClose()
      })
    }else{
      store.dispatch('CDIOSyllabus/Create', {
        study_program_id: props.studyProgramId,
      }).then(res => {
        if(res) handleClose()
      })
    }
  }
}

const loading = computed(() => store.state.CDIOSyllabus.loading.form)
const is_update = computed(() => store.state.CDIOSyllabus.is_update)

const title = computed({
  get: () => store.state.CDIOSyllabus.form.title,
  set: value => store.commit('CDIOSyllabus/SET_FORM', {
    key: 'title',
    value,
  }),
})
</script>
