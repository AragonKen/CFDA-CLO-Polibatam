import axiosInstance from '@/utils/axios'
import { toast } from 'vue-sonner'

const grading = {
  namespaced: true,
  state: {
    loading: {
      reports: false,
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
  },
  actions: {
    GetReports: async context => {
      context.commit("SET_IS_LOADING", {
        key: "reports",
        value: true,
      })

      try {
        const result = await axiosInstance({
          url: `/grading`,
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
  },
}

export default grading
