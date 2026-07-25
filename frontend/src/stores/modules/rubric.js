import axiosInstance from '@/utils/axios'
import { toast } from 'vue-sonner'

const form = {
  code: '',
  title: '',
  
  description_level_1: '',
  description_level_2: '',
  description_level_3: '',
  description_level_4: '',
  description_level_5: '',

  study_program_id: null,
  student_outcome_id: null,
  cdio_syllabus_id: null,
}

const rubric = {
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
    GetReports: async (context, params) => {
      context.commit("SET_IS_LOADING", {
        key: "reports",
        value: true,
      })

      try {
        const result = await axiosInstance({
          url: `/rubric`,
          method: "GET",
          params: {
            page: context.state.table_options.page,
            page_size: context.state.table_options.page_size,
            search: context.state.table_options.search,
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
    GetReport: async (context, id) => {
      context.commit("SET_IS_LOADING", {
        key: "report",
        value: true,
      })

      try {
        const result = await axiosInstance({
          url: `/rubric/${id}`,
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
          url: `/rubric`,
          method: "POST",
          data: context.state.form,
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
          url: `/rubric/bulk`,
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
          url: `/rubric/${id}`,
          method: "GET",
        })

        const data = res.data.data

        context.state.form = {
          code: data.code,
          title: data.title,
          
          description_level_1: data.description_level_1,
          description_level_2: data.description_level_2,
          description_level_3: data.description_level_3,
          description_level_4: data.description_level_4,
          description_level_5: data.description_level_5,

          study_program_id: data.study_program_id,
          student_outcome_id: data.student_outcome_id,
          cdio_syllabus_id: data.cdio_syllabus_id,
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
          url: `/rubric/${payload.id}`,
          method: "PUT",
          data: context.state.form,
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
          url: `/rubric/${payload.id}`,
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

export default rubric
