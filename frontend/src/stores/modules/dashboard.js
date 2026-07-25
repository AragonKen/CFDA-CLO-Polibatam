import axiosInstance from '@/utils/axios'
import { toast } from 'vue-sonner'

const dashboard = {
  namespaced: true,
  state: {
    loading: {
      report: false,
    },
    report: {
      total_brochure_download: 0,
      total_lead: 0,
      total_lead_newsletter: 0,
      total_media_size: 0,
    },
  },
  mutations: {
    SET_LOADING(state, payload) {
      state.loading[payload.key] = payload.value
    },
    SET_REPORT(state, payload) {
      state.report = payload
    },
  },
  actions: {
    async GetReport(context, params) {
      context.commit("SET_LOADING", { key: "report", value: true })

      try {
        const result = await axiosInstance({
          url: `/dashboard`,
          method: "GET",
        })

        context.commit("SET_REPORT", result.data.data)
      } catch (error) {
        toast.error(error.response.data.message)
      } finally {
        context.commit("SET_LOADING", { key: "report", value: false })
      }
    },
  },
}

export default dashboard
