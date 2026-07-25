import axiosInstance from "@/utils/axios";
import { toast } from "vue-sonner";

const form = {
  semester: "",
  academic_year: "",
  class: "",
  target_attainment: "",

  teacher_nip: "",
  course_id: "",
  proficiency_level_id: "",
};

const assessment = {
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

    handsontable: {
      headers: [],
      items: [],
    },

    generated_form: {
      headers: [],
      items: [],
    },

    form_bulk: [],

    // New status tracking
    sync_status: {
      status: "ready", // 'ready', 'saving', 'error', 'saved'
      message: "",
      last_updated: null,
      pending_changes: 0,
    },

    is_update: false,
  },
  mutations: {
    SET_IS_LOADING(state, payload) {
      state.loading[payload.key] = payload.value;
    },
    SET_OPTIONS_TABLE(state, payload) {
      Object.assign(state.table_options, payload);
    },
    SET_REPORTS(state, payload) {
      state.reports = payload;
    },
    SET_REPORT(state, payload) {
      state.report = payload;
    },

    SET_FORM(state, payload) {
      state.form[payload.key] = payload.value;
    },
    RESET_FORM(state) {
      state.form = { ...form };
    },

    SET_HANDSONTABLE(state, payload) {
      state.handsontable = payload;
    },
    SET_GENERATED_FORM(state, payload) {
      state.generated_form = payload;
    },

    SET_FORM_BULK(state, payload) {
      state.form_bulk = payload;
    },

    SET_SYNC_STATUS(state, payload) {
      state.sync_status = { ...state.sync_status, ...payload };
    },

    INCREMENT_PENDING_CHANGES(state) {
      state.sync_status.pending_changes += 1;
    },

    DECREMENT_PENDING_CHANGES(state) {
      state.sync_status.pending_changes = Math.max(
        0,
        state.sync_status.pending_changes - 1
      );
    },
  },
  actions: {
    GetReports: async (context, params) => {
      context.commit("SET_IS_LOADING", {
        key: "reports",
        value: true,
      });

      try {
        const result = await axiosInstance({
          url: `/assessment`,
          method: "GET",
          params: {
            page: context.state.table_options.page,
            page_size: context.state.table_options.page_size,
            search: context.state.table_options.search,
            in_user_department: context.state.table_options.in_user_department,
            ...params,
          },
        });

        context.commit("SET_REPORTS", result.data.data);

        context.commit("SET_OPTIONS_TABLE", {
          page: result.data.pagination.page,
          page_size: result.data.pagination.page_size,
          total_items: result.data.pagination.total_items,
          total_pages: result.data.pagination.total_pages,
        });
      } catch (error) {
        toast.error(error.response.data.message);
      } finally {
        context.commit("SET_IS_LOADING", {
          key: "reports",
          value: false,
        });
      }
    },
    GetReport: async (context, id) => {
      context.commit("SET_IS_LOADING", {
        key: "report",
        value: true,
      });

      try {
        const assessment = await axiosInstance({
          url: `/assessment/${id}`,
          method: "GET",
        });

        context.commit("SET_REPORT", assessment.data.data);

        const generatedForm = await axiosInstance({
          url: `/assessment/form/${id}`,
          method: "GET",
        });

        context.commit("SET_GENERATED_FORM", generatedForm.data.data);

        return true;
      } catch (error) {
        toast.error(error.response.data.message);
      } finally {
        context.commit("SET_IS_LOADING", {
          key: "report",
          value: false,
        });
      }
    },
    Create: async (context) => {
      context.commit("SET_IS_LOADING", {
        key: "form",
        value: true,
      });

      try {
        const res = await axiosInstance({
          url: `/assessment`,
          method: "POST",
          data: context.state.form,
        });

        toast.success(res.data.message);
        context.dispatch("GetReports");

        return true;
      } catch (error) {
        toast.error(error.response.data.message);
      } finally {
        context.commit("SET_IS_LOADING", {
          key: "form",
          value: false,
        });
      }
    },
    SetFormUpdate: async (context, id) => {
      context.commit("SET_IS_LOADING", {
        key: "form",
        value: true,
      });

      try {
        const res = await axiosInstance({
          url: `/assessment/${id}`,
          method: "GET",
        });

        const data = res.data.data;

        context.state.form = {
          semester: data.semester,
          academic_year: data.academic_year,
          class: data.class,
          target_attainment: data.target_attainment,

          teacher_nip: data.teacher_nip,
          course_id: data.course_id,
          proficiency_level_id: data.proficiency_level_id,
        };

        context.state.is_update = id;
      } catch (error) {
        toast.error(error.response.data.message);
      } finally {
        context.commit("SET_IS_LOADING", {
          key: "form",
          value: false,
        });
      }
    },
    Update: async (context, id) => {
      context.commit("SET_IS_LOADING", {
        key: "form",
        value: true,
      });

      try {
        const res = await axiosInstance({
          url: `/assessment/${id}`,
          method: "PUT",
          data: context.state.form,
        });

        toast.success(res.data.message);
        context.dispatch("GetReports");

        return true;
      } catch (error) {
        toast.error(error.response.data.message);
      } finally {
        context.commit("SET_IS_LOADING", {
          key: "form",
          value: false,
        });
      }
    },
    Delete: async (context, id) => {
      context.commit("SET_IS_LOADING", {
        key: "reports",
        value: true,
      });

      try {
        const res = await axiosInstance({
          url: `/assessment/${id}`,
          method: "DELETE",
        });

        toast.success(res.data.message);
        context.dispatch("GetReports");

        return true;
      } catch (error) {
        toast.error(error.response.data.message);
      } finally {
        context.commit("SET_IS_LOADING", {
          key: "reports",
          value: false,
        });
      }
    },

    GetTemplateStudentImport: async (context, id) => {
      context.commit("SET_IS_LOADING", {
        key: "report",
        value: true,
      });

      try {
        const assessment = await axiosInstance({
          url: `/assessment/${id}`,
          method: "GET",
        });

        context.commit("SET_REPORT", assessment.data.data);

        const data = assessment.data.data;

        const columns = [{ label: "NIM" }, { label: "Student Name" }];

        if (data.course && data.course.assessment_types.length) {
          for (const type of data.course.assessment_types) {
            for (let i = 0; i < type.quantity; i++) {
              columns.push({ label: type.assessment_type?.code + (i + 1) });
            }
          }
        }

        return [
          {
            columns: columns,
            content: [],
          },
        ];
      } catch (error) {
        toast.error(error.response.data.message);
      } finally {
        context.commit("SET_IS_LOADING", {
          key: "report",
          value: false,
        });
      }
    },
    BulkCreateStudent: async (context, payload) => {
      context.commit("SET_IS_LOADING", {
        key: "form",
        value: true,
      });

      try {
        const res = await axiosInstance({
          url: `/assessment/form/bulk/${payload.assessment_id}`,
          method: "POST",
          data: context.state.form_bulk,
        });

        toast.success(res.data.message);
        context.dispatch("GetReport", payload.assessment_id);

        return true;
      } catch (error) {
        toast.error(error.response.data.message);
      } finally {
        context.commit("SET_IS_LOADING", {
          key: "form",
          value: false,
        });
      }
    },

    GetHandsontable: async (context, id) => {
      context.commit("SET_IS_LOADING", {
        key: "form",
        value: true,
      });

      try {
        const generatedForm = await axiosInstance({
          url: `/assessment/handsontable/${id}`,
          method: "GET",
        });

        context.commit("SET_HANDSONTABLE", generatedForm.data.data);

        return true;
      } catch (error) {
        toast.error(error.response.data.message);
      } finally {
        context.commit("SET_IS_LOADING", {
          key: "form",
          value: false,
        });
      }
    },
    StoreHandsontable: async (context, payload) => {
      context.commit("SET_IS_LOADING", {
        key: "form",
        value: true,
      });

      try {
        const res = await axiosInstance({
          url: `/assessment/form/bulk/${payload.assessment_id}`,
          method: "POST",
          data: payload.data,
        });

        // toast.success(res.data.message)

        return true;
      } catch (error) {
        toast.error(error.response.data.message);
      } finally {
        context.commit("SET_IS_LOADING", {
          key: "form",
          value: false,
        });
      }
    },

    StoreSingleHandsontable: async (context, payload) => {
      try {
        const res = await axiosInstance({
          url: `/assessment/form/single/${payload.assessment_id}`,
          method: "POST",
          data: payload.data,
        });

        return { success: true, data: res.data };
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to save student data"
        );
        return { success: false, error: error.response?.data };
      }
    },

    DeleteHandsontableStudent: async (context, payload) => {
      try {
        const res = await axiosInstance({
          url: `/assessment/form/student/${payload.assessment_id}`,
          method: "DELETE",
          data: { nim: payload.nim },
        });

        toast.success(res.data.message);
        return { success: true, data: res.data };
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to delete student"
        );
        return { success: false, error: error.response?.data };
      }
    },

    // =======================================================================================================================================================
    // Step 5. Percentage of Students within Each Category
    // =======================================================================================================================================================

    GetPercentageStudentPerCategory: async (context, id) => {
      context.commit("SET_IS_LOADING", {
        key: "report",
        value: true,
      });

      try {
        const assessment = await axiosInstance({
          url: `/assessment/summary/percentage-student-per-category/${id}`,
          method: "GET",
        });

        return assessment.data.data;
      } catch (error) {
        toast.error(error.response.data.message);
      } finally {
        context.commit("SET_IS_LOADING", {
          key: "report",
          value: false,
        });
      }
    },

    // =======================================================================================================================================================
    // Step 6. Student Proficiency Level Attainment for Each Assessment Tool
    // =======================================================================================================================================================

    GetProficiencyPerAssessmentTool: async (context, id) => {
      context.commit("SET_IS_LOADING", {
        key: "report",
        value: true,
      });

      try {
        const assessment = await axiosInstance({
          url: `/assessment/summary/proficiency-per-assessment-tool/${id}`,
          method: "GET",
        });

        return assessment.data.data;
      } catch (error) {
        toast.error(error.response.data.message);
      } finally {
        context.commit("SET_IS_LOADING", {
          key: "report",
          value: false,
        });
      }
    },

    // =======================================================================================================================================================
    // Step 7. Percentage of Students within Each Proficiency Level
    // =======================================================================================================================================================

    GetPercentageStudentPerProficiencyLevel: async (context, id) => {
      context.commit("SET_IS_LOADING", {
        key: "report",
        value: true,
      });

      try {
        const assessment = await axiosInstance({
          url: `/assessment/summary/proficiency-student-per-proficiency-level/${id}`,
          method: "GET",
        });

        return assessment.data.data;
      } catch (error) {
        toast.error(error.response.data.message);
      } finally {
        context.commit("SET_IS_LOADING", {
          key: "report",
          value: false,
        });
      }
    },

    // =======================================================================================================================================================
    // Step 8. Performance Indicator Attainment
    // =======================================================================================================================================================

    GetPerformanceIndicatorAttainment: async (context, id) => {
      context.commit("SET_IS_LOADING", {
        key: "report",
        value: true,
      });

      try {
        const assessment = await axiosInstance({
          url: `/assessment/summary/performance-indicator-attainment/${id}`,
          method: "GET",
        });

        return assessment.data.data;
      } catch (error) {
        toast.error(error.response.data.message);
      } finally {
        context.commit("SET_IS_LOADING", {
          key: "report",
          value: false,
        });
      }
    },

    // =======================================================================================================================================================
    // Step 9. Summary of Course Assessment Results
    // =======================================================================================================================================================

    GetSummaryAssessmentResults: async (context, id) => {
      context.commit("SET_IS_LOADING", {
        key: "report",
        value: true,
      });

      try {
        const assessment = await axiosInstance({
          url: `/assessment/summary/assessment-results/${id}`,
          method: "GET",
        });

        return assessment.data.data;
      } catch (error) {
        toast.error(error.response.data.message);
      } finally {
        context.commit("SET_IS_LOADING", {
          key: "report",
          value: false,
        });
      }
    },
  },
};

export default assessment;
