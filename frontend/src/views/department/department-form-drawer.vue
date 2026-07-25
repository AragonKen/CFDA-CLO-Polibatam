<template>
  <VNavigationDrawer
    temporary
    location="end"
    class="scrollable-content w-100"
    style="max-width: 450px;"
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
                {{ is_update ? 'Update' : 'Add' }} Department
              </VCardTitle>
              <p class="mb-0">
                Please fill in the form below to  {{ is_update ? 'update' : 'Add' }} a Department
              </p>
            </VCardItem>

            <VRow>
              <VCol cols="12">
                <AppTextField
                  v-model="code"
                  label="Code*"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="12">
                <AppTextField
                  v-model="title"
                  label="Department*"
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
  store.commit('department/SET_IS_UPDATE', false)
  store.commit('department/RESET_FORM')

  emit('handleClose', false)
}

const handleSubmit = async e => {
  const { valid } = await e

  if(valid){
    if(is_update.value){
      store.dispatch('department/Update', is_update.value).then(res => {
        if(res) handleClose()
      })
    }else{
      store.dispatch('department/Create').then(res => {
        if(res) handleClose()
      })
    }
  }
}

const loading = computed(() => store.state.department.loading.form)
const is_update = computed(() => store.state.department.is_update)

const code = computed({
  get: () => store.state.department.form.code,
  set: value => store.commit('department/SET_FORM', {
    key: 'code',
    value,
  }),
})

const title = computed({
  get: () => store.state.department.form.title,
  set: value => store.commit('department/SET_FORM', {
    key: 'title',
    value,
  }),
})
</script>
