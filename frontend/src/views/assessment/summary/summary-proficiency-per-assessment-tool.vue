<template>
  <VCard
    title="Student Proficiency Level Attainment"
    subtitle="Student Proficiency Level Attainment for Each Assessment Tool"
  >
    <VCardText>
      <VTable
        class="table-assessment"
        :height="data?.items.length > 10 ?800 : null"
        fixed-header
      >
        <thead>
          <tr
            v-for="(row, i) in data?.headers"
            :key="`header-${i}`"
          >
            <th
              v-for="(header, j) in row"
              :key="`header-${i}-${j}`"
              :rowspan="header?.rowspan"
              :colspan="header?.colspan"
              :style="{
                'background-color': header?.background_color + ' !important',
              }"
            >
              {{ header?.key }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, i) in data?.items"
            :key="`row-${i}`"
          >
            <td align="center">
              {{ item.no }}
            </td>
            <td>{{ item.nim }}</td>
            <td>{{ item.name }}</td>
            <td
              v-for="(header, j) in data?.headers[1]"
              :key="`score-${i}-${j}`"
              :class="{
                'bg-score-zero': item.proficiency_levels[header.key] == 0,
                'bg-score-perfect': item.proficiency_levels[header.key] == 100
              }"
              :style="(item.proficiency_levels[header.key] !== 0 && item.proficiency_levels[header.key] !== 100 && header?.background_color) 
                ? { backgroundColor: header.background_color } 
                : {}"
              align="center"
            >
              {{ item.proficiency_levels[header.key] }}
            </td>
            <td
              align="center"
              :style="{
                'background-color': item?.background_color?.proficiency_level + ' !important',
              }"
            >
              {{ item.avg_proficiency_level }}
            </td>
          </tr>
        </tbody>
        <tfoot v-if="data?.footer.avg_proficiency_levels">
          <tr>
            <th
              colspan="3"
              align="center"
              class="text-center"
            >
              Proficiency Level Average		
            </th>
            <th
              v-for="(header, j) in data?.headers[1]"
              :key="`footer-avg-${i}-${j}`"
              align="center"
            >
              {{ data.footer?.avg_proficiency_levels?.[header.key] }}
            </th>
            <th>
              {{ data.footer?.avg_proficiency_level }}
            </th>
          </tr>
        </tfoot>
      </VTable>
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

const data = ref({
  headers: [],
  items: [],
  footer: {
    avg_proficiency_levels: {},
  },
})


onMounted(async () => {
  await store.dispatch('assessment/GetProficiencyPerAssessmentTool', props.assessmentId).then(response => {
    data.value = response

    console.log(data.value)
    
  })
})
</script>
