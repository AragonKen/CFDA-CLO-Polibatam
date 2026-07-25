<template>
  <VNavigationDrawer
    temporary
    location="end"
    class="scrollable-content w-100"
    style="max-width: 600px;"
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
                {{ is_update ? 'Update' : 'Add' }} Proficiency <b>Level {{ level }}</b>
              </VCardTitle>
              <p class="mb-0">
                Please fill in the form below to  {{ is_update ? 'update' : 'Add' }} a Proficiency Level
              </p>
            </VCardItem>

            <VRow>
              <VCol cols="12">
                <AppTextField
                  v-model="level"
                  label="Level*"
                  :rules="[requiredValidator]"
                  disabled
                />
              </VCol>
              <VCol cols="12">
                <AppTextarea
                  v-model="description"
                  label="Description*"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppTextField
                  v-model="lower_limit"
                  label="Lower Limit*"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppTextField
                  v-model="upper_limit"
                  label="Upper Limit*"
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
  proficiencyLevelId: { type: String, required: false },
})

const emit = defineEmits(['handleClose'])
const store = useVuex()

const handleClose = () => {
  store.commit('proficiencyLevel/SET_IS_UPDATE', false)
  store.commit('proficiencyLevel/RESET_FORM_DETAIL')

  emit('handleClose', false)
}

const handleSubmit = async e => {
  const { valid } = await e

  if(valid && is_update.value){
    store.dispatch('proficiencyLevel/UpdateDetail', {
      id: is_update.value,
      proficiencyLevelId: props.proficiencyLevelId,
    }).then(res => {
      if(res) handleClose()
    })
  }
}

const loading = computed(() => store.state.proficiencyLevel.loading.form_detail)
const is_update = computed(() => store.state.proficiencyLevel.is_update_detail)

const level = computed({
  get: () => store.state.proficiencyLevel.form_detail.level,
  set: value => store.commit('proficiencyLevel/SET_FORM_DETAIL', {
    key: 'level',
    value,
  }),
})

const description = computed({
  get: () => store.state.proficiencyLevel.form_detail.description,
  set: value => store.commit('proficiencyLevel/SET_FORM_DETAIL', {
    key: 'description',
    value,
  }),
})

const lower_limit = computed({
  get: () => store.state.proficiencyLevel.form_detail.lower_limit,
  set: value => store.commit('proficiencyLevel/SET_FORM_DETAIL', {
    key: 'lower_limit',
    value,
  }),
})

const upper_limit = computed({
  get: () => store.state.proficiencyLevel.form_detail.upper_limit,
  set: value => store.commit('proficiencyLevel/SET_FORM_DETAIL', {
    key: 'upper_limit',
    value,
  }),
})
</script>
