import axiosInstance from '@/utils/axios'
import { toast } from 'vue-sonner'

const form = {
  code: '',
  title: '',
  credit: 0,

  study_program_id: null,
}

const form_assessment = {
  assessment_type_id: null,
  weight: 0,
  quantity: 0,
}

const course = {
  namespaced: true,
  state: {
    loading: {
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
      in_user_department: true,
    },
    reports: [],
    report: {},

    performance_indicators: [],

    form: { ...form },
    form_assessment: [{ ...form_assessment }],

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

    SET_PERFORMANCE_INDICATORS(state, payload) {
      state.performance_indicators = payload
    },

    SET_FORM(state, payload) {
      state.form[payload.key] = payload.value
    },
    SET_FORM_ASSESSMENT(state, payload) {
      state.form_assessment = payload
    },
    PUSH_FORM_ASSESSMENT(state) {
      state.form_assessment.push({ ...form_assessment })
    },
    SPLICE_FORM_ASSESSMENT(state, index) {
      state.form_assessment.splice(index, 1)
    },
    RESET_FORM(state) {
      state.form = { ...form }
      state.form_assessment = [{ ...form_assessment }]
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
    GetReports: async (context, params) => {
      context.commit("SET_IS_LOADING", {
        key: "reports",
        value: true,
      })

      try {
        const result = await axiosInstance({
          url: `/course`,
          method: "GET",
          params: {
            page: context.state.table_options.page,
            page_size: context.state.table_options.page_size,
            search: context.state.table_options.search,
            in_user_department: context.state.table_options.in_user_department,
            ...params,
          },
        })

        context.commit("SET_REPORTS", result.data.data)

        context.commit("SET_OPTIONS_TABLE", {
          page: result.data.pagination.page,
          page_size: result.data.pagination.page_size,
          total_items: result.data.pagination.total_items,
          total_pages: result.data.pagination.total_pages,
        })
      } catch (error) {
        toast.error(error.response.data.message)
      } finally {
        context.commit("SET_IS_LOADING", {
          key: "reports",
          value: false,
        })
      }
    },
    GetPerformanceIndicators: async (context, payload) => {
      context.commit("SET_IS_LOADING", {
        key: "reports",
        value: true,
      })

      try {
        const result = await axiosInstance({
          url: `/course/performance-indicator/${payload.course_id}`,
          method: "GET",
        })

        context.commit("SET_PERFORMANCE_INDICATORS", result.data.data)
      } catch (error) {
        toast.error(error.response.data.message)
      } finally {
        context.commit("SET_IS_LOADING", {
          key: "reports",
          value: false,
        })
      }
    },
    GetReport: async (context, id) => {
      context.commit("SET_IS_LOADING", {
        key: "report",
        value: true,
      })

      try {
        const result = await axiosInstance({
          url: `/course/${id}`,
          method: "GET",
        })

        context.commit("SET_REPORT", result.data.data)
      } catch (error) {
        toast.error(error.response.data.message)
      } finally {
        context.commit("SET_IS_LOADING", {
          key: "report",
          value: false,
        })
      }
    },
    Create: async (context, payload) => {
      context.commit("SET_IS_LOADING", {
        key: "form",
        value: true,
      })

      try {
        const res = await axiosInstance({
          url: `/course`,
          method: "POST",
          data: {
            ...context.state.form,
            assessment_types: context.state.form_assessment,
          },
        })

        toast.success(res.data.message)
        if(payload.study_program_id) context.dispatch("GetReports", { study_program_id: payload.study_program_id })
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
    BulkCreate: async (context, payload) => {
      context.commit("SET_IS_LOADING", {
        key: "form",
        value: true,
      })

      try {
        const res = await axiosInstance({
          url: `/course/bulk`,
          method: "POST",
          data: context.state.form_bulk,
        })

        toast.success(res.data.message)
        if(payload.study_program_id) context.dispatch("GetReports", { study_program_id: payload.study_program_id })
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
    SetFormUpdate: async (context, id) => {
      context.commit("SET_IS_LOADING", {
        key: "form",
        value: true,
      })
    
      try {
        const res = await axiosInstance({
          url: `/course/${id}`,
          method: "GET",
        })

        const data = res.data.data

        context.state.form = {
          code: data.code,
          title: data.title,
          credit: data.credit,

          study_program_id: data.study_program_id,
        }

        context.state.form_assessment = data.assessment_types.map(item => ({
          assessment_type_id: item.assessment_type_id,
          weight: item.weight,
          quantity: item.quantity,
        }))

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
          url: `/course/${payload.id}`,
          method: "PUT",
          data: {
            ...context.state.form,
            assessment_types: context.state.form_assessment,
          },
        })
    
        toast.success(res.data.message)
        if(payload.study_program_id) context.dispatch("GetReports", { study_program_id: payload.study_program_id })
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
    Delete: async (context, payload) => {
      context.commit("SET_IS_LOADING", {
        key: "reports",
        value: true,
      })

      try {
        const res = await axiosInstance({
          url: `/course/${payload.id}`,
          method: "DELETE",
        })

        toast.success(res.data.message)
        if(payload.study_program_id) context.dispatch("GetReports", { study_program_id: payload.study_program_id })
        else context.dispatch("GetReports")

        return true
      } catch (error) {
        toast.error(error.response.data.message)
      } finally {
        context.commit("SET_IS_LOADING", {
          key: "reports",
          value: false,
        })
      }
    },
  },
}

export default course
