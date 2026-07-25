<script setup>
import { getLineChartSimpleConfig } from '@core/libs/apex-chart/apexCharConfig'
import { useTheme } from 'vuetify'

const vuetifyTheme = useTheme()
const balanceChartConfig = computed(() => getLineChartSimpleConfig(vuetifyTheme.current.value))

const series = [{
  data: [
    280,
    200,
    220,
    180,
    270,
    250,
    70,
    90,
    200,
    150,
    160,
    100,
    150,
    100,
    50,
  ],
}]
</script>

<template>
  <VCard>
    <VCardItem class="d-flex flex-wrap justify-space-between gap-4">
      <VCardTitle>Balance</VCardTitle>
      <VCardSubtitle>Commercial networks &amp; enterprises</VCardSubtitle>

      <template #append>
        <div class="d-flex align-center">
          <h6 class="text-h6 me-3">
            $221,267
          </h6>
          <VChip
            label
            color="success"
          >
            <VIcon
              start
              icon="tabler-arrow-up"
              size="15"
            />
            <span>22%</span>
          </VChip>
        </div>
      </template>
    </VCardItem>

    <VCardText>
      <VueApexCharts
        type="line"
        height="400"
        :options="balanceChartConfig"
        :series="series"
      />
    </VCardText>
  </VCard>
</template>
