<script setup>
const props = defineProps({
  selectedRadio: {
    type: String,
    required: true,
  },
  radioContent: {
    type: Array,
    required: true,
  },
  gridColumn: {
    type: null,
    required: false,
  },
})

const emit = defineEmits(['update:selectedRadio'])

const updateSelectedOption = value => {
  emit('update:selectedRadio', value)
}
</script>

<template>
  <VRadioGroup
    v-if="props.radioContent"
    :model-value="props.selectedRadio"
    @update:model-value="updateSelectedOption"
  >
    <VRow>
      <VCol
        v-for="item in props.radioContent"
        :key="item.bgImage"
        v-bind="gridColumn"
      >
        <VLabel
          class="custom-input custom-radio rounded cursor-pointer w-100"
          :class="props.selectedRadio === item.value ? 'active' : ''"
        >
          <slot
            name="content"
            :item="item"
          >
            <video
              v-if="item.type == 'VIDEO'"
              icon="tabler-video"
              class="custom-radio-image w-100"
            >
              <source
                :src="item.bgImage"
                type="video/mp4"
              >
            </video>

            <img
              v-else
              :src="item.bgImage"
              alt="bg-img"
              class="custom-radio-image"
            >
          </slot>

          <VRadio
            :id="`custom-radio-with-img-${item.value}`"
            :value="item.value"
          />

          <VTooltip
            v-if="item.label"
            activator="parent"
            location="bottom"
          >
            {{ item.label }}
          </VTooltip>
        </VLabel>

        <!--
          <VLabel
          v-if="item.label || $slots.label"
          :for="`custom-radio-with-img-${item.value}`"
          class="label cursor-pointer"
          >
          <slot
          name="label"
          :label="item.label"
          >
          {{ item.label }}
          </slot>
          </VLabel> 
        -->
      </VCol>
    </VRow>
  </VRadioGroup>
</template>

<style lang="scss" scoped>
.custom-radio {
  padding: 0;

  &.active {
    border-width: 2px;
  }

  .custom-radio-image {
    block-size: 100%;
    inline-size: 100%;
    min-inline-size: 100%;
  }

  .v-radio {
    visibility: hidden;
  }

  .label {
    display: block;
    margin-top: 0.5rem;
    text-overflow: ellipsis;
  }
}
</style>
