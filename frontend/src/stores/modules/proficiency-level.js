import axiosInstance from '@/utils/axios'
import { toast } from 'vue-sonner'

const form_detail = {
  level: 0,
  description: "",
  lower_limit: 0,
  upper_limit: 0,
}

const proficiencyLevel = {
  namespaced: true,
  state: {
    loading: {
      reports: false,
      report: false,
      form_detail: false,
    },
    table_options: {
      search: "",
      page: 1,
      page_size: 5,
      total_items: 0,
      total_pages: 0,
    },
    reports: [],
    report: {},

    form_detail: { ...form_detail },
    is_update_detail: false,
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

    SET_FORM_DETAIL(state, payload) {
      state.form_detail[payload.key] = payload.value
    },
    RESET_FORM_DETAIL(state) {
      state.form_detail = { ...form_detail }
    },
  },
  actions: {
    GetReports: async context => {
      context.commit("SET_IS_LOADING", {
        key: "reports",
        value: true,
      })

      try {
        const result = await axiosInstance({
          url: `/proficiency-level`,
          method: "GET",
          params: {
            page: context.state.table_options.page,
            page_size: context.state.table_options.page_size,
            search: context.state.table_options.search,
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
        const res = await axiosInstance({
          url: `/proficiency-level/${id}`,
          method: "GET",
        })

        context.commit("SET_REPORT", res.data.data)
      } catch (error) {
        toast.error(error.response.data.message)
      } finally {
        context.commit("SET_IS_LOADING", {
          key: "report",
          value: false,
        })
      }
    },
    SetFormUpdateDetail: async (context, id) => {
      context.commit("SET_IS_LOADING", {
        key: "form_detail",
        value: true,
      })
    
      try {
        const res = await axiosInstance({
          url: `/proficiency-level/detail/${id}`,
          method: "GET",
        })

        const data = res.data.data

        context.state.form_detail = {
          level: data.level,
          description: data.description,
          lower_limit: data.lower_limit,
          upper_limit: data.upper_limit,
        }

        context.state.is_update_detail = id

      } catch (error) {
        toast.error(error.response.data.message)
      } finally {
        context.commit("SET_IS_LOADING", {
          key: "form_detail",
          value: false,
        })
      }
    },
    UpdateDetail: async (context, payload) => {
      context.commit("SET_IS_LOADING", {
        key: "form",
        value: true,
      })
    
      try {
        const res = await axiosInstance({
          url: `/proficiency-level/detail/${payload.id}`,
          method: "PUT",
          data: context.state.form_detail,
        })
    
        toast.success(res.data.message)
        context.dispatch("GetReport", payload.proficiencyLevelId)
    
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

export default proficiencyLevel
