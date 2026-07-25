import axiosInstance from '@/utils/axios'
import { toast } from 'vue-sonner'

const form = {
  code: '',
  title: '',

  department_id: null,
}

const studyProgram = {
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
      page_size: 5,
      total_items: 0,
      total_pages: 0,
      in_user_department: true,
    },
    reports: [],
    report: {},

    form: { ...form },
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
          url: `/study-program`,
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
    GetReport: async (context, id) => {
      context.commit("SET_IS_LOADING", {
        key: "report",
        value: true,
      })

      try {
        const result = await axiosInstance({
          url: `/study-program/${id}`,
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
          url: `/study-program`,
          method: "POST",
          data: context.state.form,
        })

        toast.success(res.data.message)
        if(payload.department_id) context.dispatch("GetReports", { department_id: payload.department_id })
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
          url: `/study-program/${id}`,
          method: "GET",
        })

        context.state.form = {
          department_id: res.data.data.department_id,
          code: res.data.data.code,
          title: res.data.data.title,
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
          url: `/study-program/${payload.id}`,
          method: "PUT",
          data: context.state.form,
        })
    
        toast.success(res.data.message)
        if(payload.department_id) context.dispatch("GetReports", { department_id: payload.department_id })
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
          url: `/study-program/${payload.id}`,
          method: "DELETE",
        })

        toast.success(res.data.message)
        if(payload.department_id) context.dispatch("GetReports", { department_id: payload.department_id })
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

export default studyProgram
