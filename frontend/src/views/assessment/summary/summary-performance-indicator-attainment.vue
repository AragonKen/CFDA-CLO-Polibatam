<template>
  <VCard
    title="Attainment of Each Performance Indicator"
    subtitle="Attainment of Each Performance Indicator by Category and Proficiency Level"
  >
    <VCardText>
      <VCard
        v-for="item in data"
        :key="item.id"
        class="mb-5"
      >
        <VCardTitle class="bg-secondary">
          <div class="text-h6 py-2">
            {{ item?.rubric?.student_outcome?.code }}. {{ item?.rubric?.student_outcome?.description }} - {{ item?.rubric?.code }}. {{ item?.rubric?.title }}
          </div>
        </VCardTitle>
        <VDivider />
        <VCardText>
          <VTable class="table-assessment">
            <thead>
              <tr>
                <th style="background-color: #8ee57f !important;">
                  Category
                </th>
                <th
                  v-for="(header, j) in item?.headers"
                  :key="`header-${i}-${j}`"
                  :rowspan="header?.rowspan"
                  :colspan="header?.colspan"
                  style="background-color: #8ee57f !important;"
                >
                  {{ header?.key }}
                </th>
                <th style="background-color: #e5d97f !important;">
                  Avg
                </th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="row in item?.percentage_by_categories"
                :key="row.id"
              >
                <td>{{ row?.title }}</td>
                <td
                  v-for="(header, j) in item?.headers"
                  :key="`score-${i}-${j}`"
                  align="center"
                >
                  {{ row.scores[header.key] || 0 }}
                </td>
                <td
                  align="center"
                  style="background-color: #e5d97f !important;"
                >
                  {{ row.avg }}
                </td>
              </tr>
            </tbody>
          </VTable>
          <br>
          <VTable class="table-assessment">
            <thead>
              <tr>
                <th style="background-color: #7eb2f2 !important;">
                  Proficiency Level
                </th>
                <th
                  v-for="(header, j) in item?.headers"
                  :key="`header-${i}-${j}`"
                  :rowspan="header?.rowspan"
                  :colspan="header?.colspan"
                  style="background-color: #7eb2f2 !important;"
                >
                  {{ header?.key }}
                </th>
                <th style="background-color: #e5d97f !important;">
                  Avg
                </th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="row in item?.percentage_by_proficiency_levels"
                :key="row.id"
              >
                <td>{{ row?.level }}. {{ row?.description }}</td>
                <td
                  v-for="(header, j) in item?.headers"
                  :key="`score-${i}-${j}`"
                  align="center"
                >
                  {{ row.scores[header.key] || 0 }}
                </td>
                <td
                  align="center"
                  style="background-color: #e5d97f !important;"
                >
                  {{ row.avg }}
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCardText>
      </VCard>
    </VCardText>
  </VCard>
</template>

<script setup>
const props = defineProps({
  assessmentId: {
    type: String,
    required: true,
  },
})

const store = useVuex()
const data = ref([])

onMounted(async () => {
  await store.dispatch('assessment/GetPerformanceIndicatorAttainment', props.assessmentId).then(response => {
    data.value = response
  })
})
</script>
