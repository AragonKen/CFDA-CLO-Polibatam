<template>
  <VExpansionPanel class="border-0">
    <VExpansionPanelTitle
      class="bg-app-expansion-panel"
      :class="[{ 'border-error text-error': error }]"
      :collapse-icon="error ? 'tabler-alert-triangle' : 'tabler-chevron-up'"
      :expand-icon="error ? 'tabler-alert-triangle' : 'tabler-chevron-down'"
      disable-icon-rotate
    >
      {{ title }}
    </VExpansionPanelTitle>
    <VExpansionPanelText
      class="pt-5 mb-8 "
      eager
    >
      <VForm
        ref="refInitialForm"
        class="v-expansion-panel-form pa-5"
      >
        <slot />
      </VForm>
    </VExpansionPanelText>
  </VExpansionPanel>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  error: {
    type: Boolean,
    required: true,
  },
  onValidate: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['update:error'])
const refInitialForm = ref(null)

watch(() => props.onValidate, async () => {
  const { valid } = await refInitialForm.value.validate()

  emit('update:error', !valid)
})
</script>

<style lang="scss">
.bg-app-expansion-panel {
  background-color: #EBDBCF;
}

.border-error {
  border-color: #FF5252 !important;
}

.text-error {
  color: #FF5252 !important;
}

// remove padding on mobile .v-expansion-panel-text__wrapper

@media (max-width: 600px) {
  .v-expansion-panel-form, .v-expansion-panel-text__wrapper {
    padding: 0 !important;
  }
}
</style>
