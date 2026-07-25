<template>
  <div>
    <VCard class="logistics-card-statistics cursor-pointer">
      <VCardText>
        <div class="d-flex align-center gap-x-4 mb-2">
          <VAvatar
            variant="tonal"
            size="60"
            color="primary"
            rounded
          >
            <VIcon
              icon="tabler-school"
              size="38"
            />
          </VAvatar>
          <div>
            <h5 class="text-h5 font-weight-medium">
              <b>[{{ report?.code }}]</b> {{ report?.title }}
            </h5>
            <div class="text-disabled">
              {{ report?.department?.code }}: {{ report?.department?.title }}
            </div>
          </div>
        </div>
      </VCardText>
    </VCard>

    <VAlert
      v-if="report?._count?.student_outcomes == 0"
      type="warning"
      closable
      class="mt-4"
    >
      <strong>Student Outcomes (SOs)</strong> haven't been set up yet. Please set up your Student Outcomes to track learning objectives and assessment criteria.
    </VAlert>
    <VAlert
      v-if="report?._count?.cdio_syllabuses == 0"
      type="warning"
      closable
      class="mt-4"
    >
      <strong>CDIO Syllabus</strong> components are missing. Please define the CDIO Syllabus elements to align with engineering education standards.
    </VAlert>
    <VAlert
      v-if="report?._count?.rubrics == 0"
      type="warning"
      closable
      class="mt-4"
    >
      No assessment <strong>Rubrics</strong> found. Please create evaluation rubrics to ensure consistent and fair assessment of student work.
    </VAlert>

    <Navigation />

    <div class="mt-5">
      <Course
        v-if="activeTab === 'courses'"
        :disable-add-button="report?._count?.student_outcomes === 0 || report?._count?.cdio_syllabuses === 0 || report?._count?.rubrics === 0"
        :study-program-id="studyProgramId"
      />

      <StudentOutcome
        v-if="activeTab === 'student-outcomes'"
        :study-program-id="studyProgramId"
      />
      
      <CDIOSyllabus
        v-if="activeTab === 'cdio-syllabus'"
        :study-program-id="studyProgramId"
      />

      <Rubric
        v-if="activeTab === 'rubrics'"
        :study-program-id="studyProgramId"
      />
    </div>
  </div>
</template>

<script setup>
import Navigation from '@/views/study-program/detail/study-program-detail-navigation.vue'

import CDIOSyllabus from '@/views/cdio-syllabus/cdio-syllabus-data-table.vue'
import Course from '@/views/course/course-data-table.vue'
import Rubric from '@/views/rubric/rubric-data-table.vue'
import StudentOutcome from '@/views/student-outcome/student-outcome-data-table.vue'

const store = useVuex()
const route = useRoute()
const studyProgramId = ref(route.params.id)

const activeTab = computed(() => route.query.tab || 'courses')

const loading = computed(() => store.state.studyProgram.loading.report)
const report = computed(() => store.state.studyProgram.report)

const refetch = () => store.dispatch('studyProgram/GetReport', studyProgramId.value)

onMounted(() => refetch())
</script>
