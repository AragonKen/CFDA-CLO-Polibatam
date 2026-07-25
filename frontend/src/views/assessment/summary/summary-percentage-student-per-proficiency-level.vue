<template>
  <VCard
    title="Percentage of Students within Each Proficiency Level"
    subtitle="Percentage of Students within Each Proficiency Level of Assessment"
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
            <td>{{ item?.level }}. {{ item?.description }}</td>
            <td
              v-for="(header, j) in data?.headers[1]"
              :key="`score-${i}-${j}`"
              align="center"
            >
              {{ item.scores[header.key] || 0 }}
            </td>
            <!--
              <td
              align="center"
              :style="{
              'background-color': item?.background_color?.proficiency_level + ' !important',
              }"
              >
              {{ item.avg_proficiency_level }}
              </td> 
            -->
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <th align="center">
              Total
            </th>
            <th
              v-for="(header, j) in data?.headers[1]"
              :key="`footer-avg-${i}-${j}`"
              align="center"
              class="text-center"
            >
              {{ data.footer?.avg?.[header.key] }}
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
    avg: {},
  },
})


onMounted(async () => {
  await store.dispatch('assessment/GetPercentageStudentPerProficiencyLevel', props.assessmentId).then(response => {
    data.value = response

    console.log(data.value)
    
  })
})
</script>
