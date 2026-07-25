<script setup>
  import { computed, ref, onMounted, watch } from 'vue';
  import { GChart } from 'vue-google-charts';
  import axiosInstance from '@/utils/axios';
  import { isAuthorized } from "@/helper/index";

  const store = useVuex();

  // API Data
  const plo_attainment = computed(() => store.state.plo_attainment.plo_attainment);
  const study_programs = computed(() => store.state.plo_attainment.study_programs);

  const is_loading = computed(() => store.state.plo_attainment.loading);

  const filter_study_program_id_input = computed({
    get: () => store.state.plo_attainment.filters_query_param.study_program_id,
    set: (value) => store.commit('plo_attainment/SET_FILTERS_QUERY_PARAM', { key: "study_program_id", value})
  });

  const filter_academic_year_input = computed({
    get: () => store.state.plo_attainment.filters_query_param.academic_year,
    set: (value) => store.commit('plo_attainment/SET_FILTERS_QUERY_PARAM', { key: "academic_year", value})
  });

  const filter_semester_input = computed({
    get: () => store.state.plo_attainment.filters_query_param.semester,
    set: (value) => store.commit('plo_attainment/SET_FILTERS_QUERY_PARAM', { key: "semester", value})
  });

  const is_all_input_filled = computed(() => {
    return filter_study_program_id_input.value && filter_academic_year_input.value && filter_semester_input.value
  });

  const overall_graph_data = computed(() => {
    const temp = [];

    temp.push(['Student Outcome', 'Excellent', 'Very Good', 'Good', 'Fair', 'Bad']);
    for (const so of plo_attainment.value) {
      if (!so.is_assessed) {
        temp.push([so.code, 0, 0, 0, 0, 0]);
        continue;
      }
      temp.push([
        so.code,
        so.grade.excellent,
        so.grade.very_good,
        so.grade.good,
        so.grade.fair,
        so.grade.bad,
      ]);
    }

    return temp;
  });

  const overall_table_data = computed(() => {
    const rows = [];

    rows.push(["Student Outcome Code", "Description", "Excellent", "Very Good", "Good", "Fair", "Bad"]);

    for (const so of plo_attainment.value) {
      const cols = [];
      const grade = so.grade;
      cols.push(so.code);
      cols.push(so.description);
      cols.push(format_grade_value_to_string(grade.excellent));
      cols.push(format_grade_value_to_string(grade.very_good));
      cols.push(format_grade_value_to_string(grade.good));
      cols.push(format_grade_value_to_string(grade.fair));
      cols.push(format_grade_value_to_string(grade.bad));
      rows.push(cols);
    }
    return rows;
  })

  // Vuetify list selection will set ref value to array of selected list values instead of a singular list value, even though we aren't using the multiple selection list
  // so_selection_model is to store the selected list value
  // selected_so will get the first element of the model value since model value is always guaranteed to have at most one element
  const so_selection_model = ref([]);
  const selected_so = computed(() => {
    return so_selection_model.value[0] || ""
  });
  const selected_so_data = computed(() => {
    return plo_attainment.value.find(att => att.code === selected_so.value) || null;
  });

  const so_graph_data = computed(() => {
    const so_code = selected_so.value;
    const temp = [];
    temp.push(['Student Outcome', 'Excellent', 'Very Good', 'Good', 'Fair', 'Bad']);

    const reference_data  = selected_so_data.value;
    if (!reference_data) return temp;

    if (!reference_data.is_assessed) {
      temp.push([so_code, 0, 0, 0, 0, 0]);
      return temp
    }

    temp.push([
      reference_data.code,
      reference_data.grade["excellent"],
      reference_data.grade["very_good"],
      reference_data.grade["good"],
      reference_data.grade["fair"],
      reference_data.grade["bad"],
    ]);

    return temp;
  });

  const has_plo_attainment = computed(() => {
    return plo_attainment.value.length > 0
  });

  // Autoselect items
  const study_program_items = computed(() => {
    return study_programs.value.map(program => ({
      title: `${program.code} ${program.title}`,
      value: program.id,
    }));
  });

  const academic_year_option_items = [
    { title: "-",        value: 0 },
    { title: "2023 - 2024", value: 2023 },
    { title: "2024 - 2025", value: 2024 },
    { title: "2025 - 2026", value: 2025 },
    { title: "2026 - 2027", value: 2026 },
  ];

  const semester_option_items = [
    { title: "-",        value: "" },
    { title: "Ganjil", value: "ganjil" },
    { title: "Genap",  value: "genap"  },
  ];

  onMounted(async () => {
    store.dispatch("plo_attainment/FetchStudyPrograms");
  });

  async function filters_on_change() {
    store.dispatch("plo_attainment/FetchPLOAttainment");
    so_selection_model.value = [];
  }

  function format_grade_value_to_string(grade_value) {
    if (grade_value === null || isNaN(grade_value)) return "-";
    return (grade_value * 100).toFixed(2).concat(' %')
  }

  const graph_colors = [
    '#8EE57F',
    '#C5E0B3',
    '#EAFF8D',
    '#F7C9AC',
    '#FF949F',
  ];

</script>

<template>
  <!-- FILTER SECTION -->
  <VCard class="mb-4">
    <VCardText>
      <VRow dense>
        <VCol cols="12" md="4">
          <AppAutocomplete
            v-model="filter_study_program_id_input"
            label="Study Program"
            :items="study_program_items"
            item-title="title"
            item-value="value"
            clearable
            density="comfortable"
            variant="outlined"
            @update:modelValue="filters_on_change"
          />
        </VCol>

        <VCol cols="12" md="4">
          <AppAutocomplete
            v-model="filter_academic_year_input"
            label="Academic Year"
            :items="academic_year_option_items"
            item-title="title"
            item-value="value"
            clearable
            density="comfortable"
            variant="outlined"
            @update:modelValue="filters_on_change"
          />
        </VCol>

        <VCol cols="12" md="4">
          <AppAutocomplete
            v-model="filter_semester_input"
            label="Semester"
            item-title="title"
            item-value="value"
            :items="semester_option_items"
            clearable
            density="comfortable"
            variant="outlined"
            @update:modelValue="filters_on_change"
          />
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
  <!-- FILTER SECTION END -->

  <!-- LOADING SECTION -->
  <VCard v-if="is_loading" class="d-flex justify-center align-center" height="200">
    <VProgressCircular indeterminate color="primary"></VProgressCircular>
  </VCard>
  <!-- LOADING SECTION END -->

  <!-- NO DATA SECTION -->
  <VCard v-if="!has_plo_attainment && !is_loading">
    <div class="no-data">
      <div v-if="!is_all_input_filled">
        <div class="no-data__icon">📝</div>
        <div class="no-data__title">Please Select All Input</div>
        <div class="no-data__subtitle">There’s nothing to display</div>
      </div>
      <div v-else>
        <div class="no-data__icon">📭</div>
        <div class="no-data__title">No Attainment</div>
        <div class="no-data__subtitle">Please Setup All Student Outcomes and Rubrics first</div>
      </div>
    </div>
  </VCard>
  <!-- NO DATA SECTION END -->

  <!-- OVERALL SECTION -->
  <VCard
    v-if="has_plo_attainment && !is_loading"
    title="Overall"
    class="mb-4"
  >
    <VCardText>
      <div>
        <div class="chart-wrapper">
          <GChart
            type="ColumnChart"
            :data="overall_graph_data"
            :options="{
              isStacked: 'percent',
              height: 350,
              backgroundColor: 'transparent',
              colors: graph_colors
              }"
          />
        </div>
        <!-- table -->
        <div class="table-wrapper">
          <VTable density="comfortable" class="overall-table">
            <thead>
              <tr>
                <th v-for="header in overall_table_data[0]" :key="header">{{ header }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in overall_table_data.slice(1)">
                <td v-for="col in row">{{ col }}</td>
              </tr>
            </tbody>
          </VTable>
        </div>
      </div>
    </VCardText>
  </VCard>

  <!-- PER STUDENT OUTCOME SECTION -->
  <VRow v-if="has_plo_attainment && !is_loading">
    <VCol cols="12" md="3">
      <VCard
        title="Student Outcomes"
      >
        <VCardText>
          <VList
            v-model:selected="so_selection_model"
          >
            <VListItem
              v-for="outcome in plo_attainment"
              :key="outcome.code"
              :title="outcome.code"
              :subtitle="outcome.description"
              :value="outcome.code"
              rounded="sm"
            ></VListItem>
          </VList>
        </VCardText>
      </VCard>
    </VCol>
    <VCol cols="12" md="9">
      <VCard
        v-if="selected_so !== ''"
        :title="selected_so_data.code"
        :subtitle="selected_so_data.description"
      >
        <VCardText>
          <div class="mb-4">
            <GChart
              :options="{
                chartArea: { width: '75%' },
                backgroundColor: 'transparent',
                isStacked: 'percent',
                bar: {
                  groupWidth: '20%'
                },
                colors: graph_colors
                }"
              :data="so_graph_data"
              type="BarChart"
            />
          </div>
          <div
            v-if="selected_so_data.is_assessed"
            class="d-flex flex-wrap gap-2 align-center justify-start justify-md-end mb-4"
          >
            <VChip variant="flat" color="#8EE57F">Excellent : {{ format_grade_value_to_string(selected_so_data.grade?.excellent) }}</VChip>
            <VChip variant="flat" color="#C5E0B3">Very Good : {{ format_grade_value_to_string(selected_so_data.grade?.very_good) }}</VChip>
            <VChip variant="flat" color="#EAFF8D">Good      : {{ format_grade_value_to_string(selected_so_data.grade?.good) }}</VChip>
            <VChip variant="flat" color="#F7C9AC">Fair      : {{ format_grade_value_to_string(selected_so_data.grade?.fair) }}</VChip>
            <VChip variant="flat" color="#FF949F">Bad       : {{ format_grade_value_to_string(selected_so_data.grade?.bad) }}</VChip>
          </div>
          <h3>Per Rubrics</h3>
          <div>
            <VExpansionPanels>
              <VExpansionPanel v-for="rubric in selected_so_data.per_rubrics" :key="rubric.code">
                <VExpansionPanelTitle>
                  <VRow class="d-flex align-center">
                    <VCol md="3">
                      <h3>{{ selected_so + "-" + rubric.code }}</h3>
                      <!-- <span>{{ rubric.title }}</span> -->
                    </VCol>
                    <VCol class="d-flex flex-wrap gap-2 justify-start justify-md-end" md="9" v-if="rubric.is_assessed">
                      <VChip variant="flat" color="#8EE57F">Excellent : {{ format_grade_value_to_string(rubric.grade?.excellent) }}</VChip>
                      <VChip variant="flat" color="#C5E0B3">Very Good : {{ format_grade_value_to_string(rubric.grade?.very_good) }}</VChip>
                      <VChip variant="flat" color="#EAFF8D">Good      : {{ format_grade_value_to_string(rubric.grade?.good) }}</VChip>
                      <VChip variant="flat" color="#F7C9AC">Fair      : {{ format_grade_value_to_string(rubric.grade?.fair) }}</VChip>
                      <VChip variant="flat" color="#FF949F">Bad       : {{ format_grade_value_to_string(rubric.grade?.bad) }}</VChip>
                    </VCol>
                    <VCol class="d-flex justify-end" md="9" v-else>
                      No Course Bounded to This Rubric
                    </VCol>
                  </VRow>
                </VExpansionPanelTitle>
                <VExpansionPanelText>
                  <div class="mb-4">
                    <h4>Description :</h4>
                    <span>{{ rubric.title }}</span>
                  </div>

                  <VList>
                    <VListItem v-for="course in rubric.per_course" :key="course.id" border>
                      <VListItemTitle>
                        <VRow class="align-center" density="comfortable">
                          <VCol md="4">
                            <RouterLink
                              :to="'/assessment/' + course.id"
                            >
                              <h3>{{ course.code }}</h3>
                            </RouterLink>
                            <table>
                              <tbody>
                                <tr>
                                  <td>Title</td>
                                  <td>:</td>
                                  <td>{{ course.title }}</td>
                                </tr>
                                <tr>
                                  <td>ID</td>
                                  <td>:</td>
                                  <td>{{ course.id }}</td>
                                </tr>
                                <tr>
                                  <td>Lecturer</td>
                                  <td>:</td>
                                  <td>{{ course.lecturer }}</td>
                                </tr>
                              </tbody>
                            </table>

                          </VCol>
                          <VCol md="8" class="d-flex flex-wrap gap-2 justify-start justify-md-end">
                            <VChip variant="flat" color="#8EE57F">Excellent : {{ format_grade_value_to_string(course.grade?.excellent) }}</VChip>
                            <VChip variant="flat" color="#C5E0B3">Very Good : {{ format_grade_value_to_string(course.grade?.very_good) }}</VChip>
                            <VChip variant="flat" color="#EAFF8D">Good      : {{ format_grade_value_to_string(course.grade?.good) }}</VChip>
                            <VChip variant="flat" color="#F7C9AC">Fair      : {{ format_grade_value_to_string(course.grade?.fair) }}</VChip>
                            <VChip variant="flat" color="#FF949F">Bad       : {{ format_grade_value_to_string(course.grade?.bad) }}</VChip>
                          </VCol>
                        </VRow>
                      </VListItemTitle>
                    </VListItem>
                  </VList>
                </VExpansionPanelText>
              </VExpansionPanel>
            </VExpansionPanels>
          </div>
        </VCardText>
      </VCard>
      <VCard v-else>
        <VCardText>
          <h2>No Student Outcome Selected</h2>
          <p>
            Please select a student outcome you want to review using the left selection
          </p>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
  <!-- PER STUDENT OUTCOME SECTION END -->



</template>

<style scoped>
  .filter-container {
    display: flex;
    gap: 4px;
    margin-bottom: 16px;
  }

  .segment-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 20px;
  }

  .chart-wrapper {
    padding: 16px;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    margin-bottom: 20px;
    background: #fafafa;
  }

  .table-wrapper {
    overflow-x: auto;
    border: 1px solid #e0e0e0;
  }

  table {
    width: 100%;
  }

  thead th {
    font-weight: bold;
    border-bottom: 2px solid #ccc;
    text-transform: none;
  }

  tbody td {
    border-bottom: 1px solid #fff;
    text-transform: none;
  }

  .overall-table td:nth-child(7),
  .overall-table th:nth-child(7)
  {
    background: #FF949F;
    text-align: center !important;
    white-space: nowrap;
  }

  .overall-table td:nth-child(6),
  .overall-table th:nth-child(6)
  {
    background: #F7C9AC;
    text-align: center !important;
    white-space: nowrap;
  }

  .overall-table td:nth-child(5),
  .overall-table th:nth-child(5)
  {
    background: #EAFF8D;
    text-align: center !important;
    white-space: nowrap;
  }

  .overall-table td:nth-child(4),
  .overall-table th:nth-child(4)
  {
    background: #C5E0B3;
    text-align: center !important;
    white-space: nowrap;
  }

  .overall-table td:nth-child(3),
  thead th:nth-child(3)
  {
    background: #8EE57F;
    text-align: center !important;
    white-space: nowrap;
  }

  .label {
    text-align: left;
    font-weight: 500;
  }


  .no-data {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    color: #6b7280; /* soft gray */
    text-align: center;
  }

  .no-data__icon {
    font-size: 40px;
    margin-bottom: 10px;
    opacity: 0.7;
  }

  .no-data__title {
    font-size: 16px;
    font-weight: 600;
    color: #374151; /* darker */
  }

  .no-data__subtitle {
    font-size: 13px;
    margin-top: 4px;
    color: #9ca3af;
  }
</style>
