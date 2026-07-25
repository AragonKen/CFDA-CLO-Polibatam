import axiosInstance from '@/utils/axios'
import { toast } from 'vue-sonner'

const plo_attainment = {
  namespaced: true,
  state: {
    loading: false,
    filters_query_param: {
      study_program_id: "",
      academic_year: 0,
      semester:  "",
    },
    plo_attainment: [],
    study_programs: []
  },
  mutations: {
    SET_LOADING(state, payload) {
      state.loading = payload;
    },
    SET_FILTERS_QUERY_PARAM(state, payload) {
      console.log(payload.value);
      state.filters_query_param[payload.key] = payload.value;
    },
    SET_PLO_ATTAINMENT(state, payload) {
      state.plo_attainment = payload;
    },
    SET_STUDY_PROGRAMS(state, payload) {
      state.study_programs = payload;
    }
  },
  actions: {
    FetchPLOAttainment: async (ctx) => {
      if (
        !ctx.state.filters_query_param.study_program_id ||
        !ctx.state.filters_query_param.academic_year ||
        !ctx.state.filters_query_param.semester)
        return;

      ctx.commit("SET_LOADING", true);

      try {
        const plo_attainment = await axiosInstance({
          url: `/study-program/${ctx.state.filters_query_param.study_program_id}/plo-attainment`,
          method: "GET",
          params: {
            academic_year: ctx.state.filters_query_param.academic_year,
            semester_type: ctx.state.filters_query_param.semester,
          }
        });

        ctx.commit("SET_PLO_ATTAINMENT", plo_attainment.data.data);
      } catch (error) {
        ctx.commit("SET_PLO_ATTAINMENT", []);
      } finally {
        ctx.commit("SET_LOADING", false);
      }
    },
    FetchStudyPrograms: async (ctx) => {
      try {
        const study_program = await axiosInstance({
          url: `/study-program`,
          method: "GET",
          params: {
            page: 1,
            page_size: 999,
            in_user_department: false
          }
        });

        ctx.commit("SET_STUDY_PROGRAMS", study_program.data.data);
      } catch (error) {
        console.log("TODO: HANDLE ERROR" + error);
      }
    }
  }
}

export default plo_attainment;
