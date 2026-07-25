<template>
  <VCard
    title="Course Assessment"
    subtitle="Manage Course Assessment by Inputting the Assessment Aspects"
  >
    <VDivider />
    <VCardText>
      <div class="mb-5 gap-3 d-flex">
        <a
          :href="`/assessment/handsontable/${props.assessmentId}`"
          target="_blank"
          rel="noopener noreferrer"
        >
          <VBtn
            variant="flat"
            size="small"
          >
            <VIcon
              icon="tabler-file-plus"
              start
            />
            Bulk Assessment
          </VBtn>
        </a>
        <!--
          <VBtn
          variant="flat"
          size="small"
          @click="handleFormImportModal(true)"
          >
          <VIcon
          icon="tabler-file-excel"
          start
          />
          Import Student Form
          </VBtn> 
        -->
      </div>
  
      <VTable
        class="table-assessment"
        :height="generated_form?.items.length > 10 ?800 : null"
        fixed-header
      >
        <thead>
          <tr
            v-for="(row, i) in generated_form?.headers"
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
            v-for="(item, i) in generated_form?.items"
            :key="`row-${i}`"
          >
            <td align="center">
              {{ item.no }}
            </td>
            <td>{{ item.nim }}</td>
            <td>{{ item.name }}</td>
            <td
              v-for="(header, j) in generated_form?.headers[1]"
              :key="`score-${i}-${j}`"
              :class="{
                'bg-score-zero': item.scores[header.key] == 0,
                'bg-score-perfect': item.scores[header.key] == 100
              }"
              :style="(item.scores[header.key] !== 0 && item.scores[header.key] !== 100 && header?.background_color) 
                ? { backgroundColor: header.background_color } 
                : {}"
              align="center"
            >
              {{ item.scores[header.key] }}
            </td>
            <td
              align="center"
              :style="{
                'background-color': item.grading == 'E' ? '#ff949f' : item?.background_color?.final_score + ' !important',
              }"
            >
              {{ item.final_score }}
            </td>
            <td
              align="center"
              :style="{
                'background-color': item.grading == 'E' ? '#ff949f' : item?.background_color?.grading + ' !important',
              }"
            >
              {{ item.grading }}
            </td>
            <td
              align="center"
              :style="{
                'background-color': item?.background_color?.proficiency_level + ' !important',
              }"
            >
              {{ item.proficiency_level }}
            </td>
          </tr>
        </tbody>
      </VTable>
    </VCardText>
  </VCard>

  <StudentFormImportModal
    :open="formImportModal"
    :assessment-id="props.assessmentId"
    @handle-close="handleFormImportModal"
  />
</template>

<script setup>
import StudentFormImportModal from '@/views/assessment/assessment-student-form-import-modal.vue'

const props = defineProps({
  assessmentId: {
    type: String,
    required: true,
  },
})

const store = useVuex()
const router = useRouter()

const formImportModal = ref(false)

const handleFormImportModal = value => {
  formImportModal.value = value
}

const report = computed(() => store.state.assessment.report)
const generated_form = computed(() => store.state.assessment.generated_form)
const loading = computed(() => store.state.assessment.loading.report)

onMounted(() => {
  store.dispatch('assessment/GetReport', props.assessmentId).then(res => {
    if(!res) router.push('/404')
  })
})
</script>


<style lang="scss">
.bg-score-zero {
  background-color: #ff949f !important;
  color: white;
}

.bg-score-perfect {
  background-color: #6eb372be !important;
  color: white;
}
</style>
