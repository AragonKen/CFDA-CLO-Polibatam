import axiosInstance from '@/utils/axios'
import { toast } from 'vue-sonner'

const form = {
  week1: "",
  week2: "",
  week3: "",
  week4: "",
  week5: "",
  week6: "",
  week7: "",
  week8: "",
  week9: "",
  week10: "",
  week11: "",
  week12: "",
  week13: "",
  week14: "",
  mid_semester: "",
  final_semester: "",

  course_id: "",
  rubric_id: "",
}

const courseAssessmentPlan = {
  namespaced: true,
  state: {
    loading: {
      generate: false,
      reports: false,
      report: false,
      form: false,
    },
    table_options: {
      search: "",
      page: 1,
      page_size: 100,
      total_items: 0,
      total_pages: 0,
    },
    reports: [],
    report: {},

    form: { ...form },
    form_bulk: [],

    is_update: false,
  },
  mutations: {
    SET_IS_LOADING(state, payload) {
      state.loading[payload.key] = payload.value
    },
    SET_OPTIONS_TABLE(state, payload) {
      Object.assign(state.table_options, payload)
    },
    SET_REPORTS(state, payload) {
      state.reports = payload
    },
    SET_REPORT(state, payload) {
      state.report = payload
    },

    SET_FORM(state, payload) {
      state.form[payload.key] = payload.value
    },
    RESET_FORM(state) {
      state.form = { ...form }
      state.form_bulk = []
    },

    SET_FORM_BULK(state, payload) {
      state.form_bulk = payload
    },

    SET_IS_UPDATE(state, payload) {
      state.is_update = payload
    },
  },
  actions: {
    GetReports: async (context, payload) => {
      context.commit("SET_IS_LOADING", {
        key: "reports",
        value: true,
      })

      try {
        const result = await axiosInstance({
          url: `/course-assessment-plan?course_id=${payload.course_id}`,
          method: "GET",
        })

        context.commit("SET_REPORTS", result.data.data)
      } catch (error) {
        toast.error(error.response.data.message)
      } finally {
        context.commit("SET_IS_LOADING", {
          key: "reports",
          value: false,
        })
      }
    },
    Generate: async (context, payload) => {
      context.commit("SET_IS_LOADING", {
        key: "generate",
        value: true,
      })

      try {
        const res = await axiosInstance({
          url: `/course-assessment-plan/generate/${payload.course_id}`,
          method: "POST",
        })

        toast.success(res.data.message)
        if(payload.course_id) context.dispatch("GetReports", { course_id: payload.course_id })
        else context.dispatch("GetReports")

        return true
      } catch (error) {
        toast.error(error.response.data.message)
      } finally {
        context.commit("SET_IS_LOADING", {
          key: "generate",
          value: false,
        })
      }
    },
    SetFormUpdate: async (context, id) => {
      context.commit("SET_IS_LOADING", {
        key: "form",
        value: true,
      })
    
      try {
        const res = await axiosInstance({
          url: `/course-assessment-plan/${id}`,
          method: "GET",
        })

        const data = res.data.data

        context.state.form = {
          week1: data.week1,
          week2: data.week2,
          week3: data.week3,
          week4: data.week4,
          week5: data.week5,
          week6: data.week6,
          week7: data.week7,
          week8: data.week8,
          week9: data.week9,
          week10: data.week10,
          week11: data.week11,
          week12: data.week12,
          week13: data.week13,
          week14: data.week14,
          mid_semester: data.mid_semester,
          final_semester: data.final_semester,
        
          course_id: data.course_id,
          rubric_id: data.rubric_id,
        }

        context.state.is_update = id

      } catch (error) {
        toast.error(error.response.data.message)
      } finally {
        context.commit("SET_IS_LOADING", {
          key: "form",
          value: false,
        })
      }
    },
    Update: async (context, payload) => {
      context.commit("SET_IS_LOADING", {
        key: "form",
        value: true,
      })
    
      try {
        const res = await axiosInstance({
          url: `/course-assessment-plan/${payload.id}`,
          method: "PUT",
          data: context.state.form,
        })
    
        toast.success(res.data.message)
        if(payload.course_id) context.dispatch("GetReports", { course_id: payload.course_id })
        else context.dispatch("GetReports")
    
        return true
      } catch (error) {
        toast.error(error.response.data.message)
      } finally {
        context.commit("SET_IS_LOADING", {
          key: "form",
          value: false,
        })
      }
    },
  },
}

export default courseAssessmentPlan
