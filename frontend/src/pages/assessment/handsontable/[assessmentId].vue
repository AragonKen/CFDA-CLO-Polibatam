<template>
  <div class="page-container">
    <!-- Enhanced Sticky Action Bar -->
    <div id="table-actions" class="table-actions sticky-top">
      <div class="actions-content">
        <div class="course-info">
          <div class="d-flex align-items-center gap-2 mb-1">
            <span class="course-code">[{{ assessment?.course?.code }}]</span>
            <h1 class="course-title">{{ assessment?.course?.title }}</h1>
          </div>
          <div class="meta-info">
            <span class="meta-item">
              <span class="meta-label">Semester:</span>
              <span class="meta-value">{{ assessment?.semester }}</span>
            </span>
            <span class="meta-divider">•</span>
            <span class="meta-item">
              <span class="meta-label">Academic Year:</span>
              <span class="meta-value">{{ assessment?.academic_year }}</span>
            </span>
            <span class="meta-divider">•</span>
            <span class="meta-item">
              <span class="meta-label">Class:</span>
              <span class="meta-value">{{ assessment?.class }}</span>
            </span>
            <span class="meta-divider">•</span>
            <span class="meta-item">
              <span class="meta-label">Level:</span>
              <span class="meta-value"
                >{{ assessment?.proficiency_level?.level }} ({{
                  assessment?.proficiency_level?.description
                }})</span
              >
            </span>
          </div>
        </div>
        <div class="d-flex align-items-center gap-3">
          <!-- Status Badge -->
          <VChip
            :color="syncStatusColor"
            size="small"
            variant="tonal"
            class="status-chip"
          >
            <VIcon
              :icon="syncStatusIcon"
              start
              size="14"
              :spin="syncStatus.status === 'saving'"
            />
            {{ syncStatusText }}
            <span v-if="syncStatus.pending_changes > 0" class="pending-count">
              ({{ syncStatus.pending_changes }})
            </span>
          </VChip>

          <VBtn
            color="primary"
            size="small"
            variant="flat"
            @click="addRow"
            class="add-row-btn"
          >
            <VIcon icon="tabler-plus" start size="16" /> Add Student
          </VBtn>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <transition name="fade">
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-content">
          <VProgressCircular
            color="primary"
            indeterminate
            size="40"
            width="3"
          />
          <p class="loading-title">Loading Assessment Data</p>
          <p class="loading-subtitle">Preparing your spreadsheet...</p>
        </div>
      </div>
    </transition>

    <!-- Table Wrapper with transition -->
    <transition name="slide-fade">
      <div v-show="!isLoading" class="table-wrapper">
        <div ref="hotTable" class="handsontable-container" />
      </div>
    </transition>
  </div>
</template>

<script setup>
definePage({ meta: { layout: "blank" } });

import Handsontable from "handsontable";
import "handsontable/dist/handsontable.full.min.css";
import { HyperFormula } from "hyperformula";
import { debounce } from "lodash-es";
import { toast } from "vue-sonner";

const store = useVuex();
const route = useRoute();
const router = useRouter();
const hotTable = ref(null);
const hotInstance = ref(null);
const isLoading = ref(true);

// Navigation guard to prevent leaving when saving
onBeforeRouteLeave((to, from, next) => {
  if (syncStatus.value.status === "saving" || pendingChanges.value.size > 0) {
    const confirmed = confirm(
      "You have unsaved changes. Are you sure you want to leave this page?"
    );
    if (confirmed) {
      next();
    } else {
      next(false);
    }
  } else {
    next();
  }
});

const assessmentId = ref(route.params.assessmentId);
const assessment = computed(() => store.state.assessment.report);
const reports = computed(() => store.state.assessment.handsontable);
const syncStatus = computed(() => store.state.assessment.sync_status);

// Track pending changes more efficiently
const pendingChanges = ref(new Set());
const changeTimeout = ref(null);

// Handle page close prevention
const handleBeforeUnload = (event) => {
  if (syncStatus.value.status === "saving" || pendingChanges.value.size > 0) {
    const message = "You have unsaved changes. Are you sure you want to leave?";
    event.preventDefault();
    event.returnValue = message; // Chrome requires returnValue to be set
    return message; // For other browsers
  }
};

// Status computed properties
const syncStatusColor = computed(() => {
  switch (syncStatus.value.status) {
    case "saving":
      return "warning";
    case "saved":
      return "success";
    case "error":
      return "error";
    default:
      return "info";
  }
});

const syncStatusIcon = computed(() => {
  switch (syncStatus.value.status) {
    case "saving":
      return "tabler-loader-2";
    case "saved":
      return "tabler-check";
    case "error":
      return "tabler-alert-circle";
    default:
      return "tabler-circle-dot";
  }
});

const syncStatusText = computed(() => {
  switch (syncStatus.value.status) {
    case "saving":
      return "Saving...";
    case "saved":
      return "Saved";
    case "error":
      return "Error";
    default:
      return "Ready";
  }
});

const scoreValidator = (value, callback) => {
  const num = parseFloat(value);
  const valid = value === "" || (!isNaN(num) && num >= 0 && num <= 100);
  callback(valid);
};

function transformRowToStudentObjectStructured(row) {
  const [headerRow1, headerRow2] = reports.value.headers;
  const [nim, name, ...rest] = row;
  if (!nim || !name) return null;

  const scores = headerRow2
    .map((col, i) =>
      col.is_score ? { key: col.label, value: rest[i - 2] } : null
    )
    .filter(Boolean);

  const finalScore = row[row.length - 3];
  const grading = row[row.length - 2];
  const proficiencyLevel = row[row.length - 1];

  return {
    nim,
    name,
    scores,
    final_score: finalScore,
    grading,
    proficiency_level: proficiencyLevel,
  };
}

function setupTable() {
  const data = reports.value.columns;
  const headers = reports.value.headers;

  const columns = [
    {
      data: "nim",
      width: 120,
    },
    {
      data: "name",
      width: 200,
    },
    ...headers[1]
      .filter((h) => h?.is_score)
      .map((h) => ({
        data: `scores.${h.label}`,
        type: "numeric",
        allowInvalid: false,
        validator: scoreValidator,
        width: 100,
      })),
    {
      data: "final_score_formula",
      readOnly: true,
      width: 100,
      className: "final-score-cell",
    },
    {
      data: "grading_formula",
      readOnly: true,
      width: 80,
      className: "grading-cell",
    },
    {
      data: "proficiency_formula",
      readOnly: true,
      width: 120,
      className: "proficiency-cell",
    },
  ];

  const actionBar = document.getElementById("table-actions");
  const actionBarHeight = actionBar?.offsetHeight || 0;
  const tableHeight = window.innerHeight - actionBarHeight;

  hotInstance.value = new Handsontable(hotTable.value, {
    data,
    nestedHeaders: headers,
    columns,
    rowHeaders: true,
    colHeaders: true,
    height: tableHeight,
    width: "100%",
    fixedColumnsStart: 2,
    autoWrapRow: true,
    autoWrapCol: true,
    manualRowMove: true,
    persistentState: true,
    formulas: { engine: HyperFormula },
    licenseKey: "non-commercial-and-evaluation",
    stretchH: "none",
    autoScrollToSelection: false,
    selectionMode: "multiple",
    outsideClickDeselects: false,
    contextMenu: {
      items: {
        row_above: { name: "Insert row above" },
        row_below: { name: "Insert row below" },
        separator: Handsontable.plugins.ContextMenu.SEPARATOR,
        remove_row: {
          name: "Delete row (Del)",
          callback: function (key, selection, clickEvent) {
            deleteSelectedRows(selection);
          },
        },
      },
    },

    // Add keyboard shortcuts
    beforeKeyDown: (event) => {
      // Delete key for deleting rows
      if (event.keyCode === 46) {
        // Delete key
        const selection = hotInstance.value.getSelected();
        if (selection && selection.length > 0) {
          event.preventDefault();
          deleteSelectedRows(selection);
        }
      }
    },

    // Add this to ensure proper initial view
    viewportRowRenderingOffset: 5,
    viewportColumnRenderingOffset: 5,

    cells: function (row, col) {
      const cellProperties = {};
      return cellProperties;
    },

    beforeChange: (changes, source) => {
      if (source === "edit" && changes) {
        // Clear any existing timeout
        if (changeTimeout.value) {
          clearTimeout(changeTimeout.value);
        }

        // Add changed rows to set (automatically deduplicates)
        changes.forEach((change) => {
          pendingChanges.value.add(change[0]); // row index
        });

        // Update store with current pending count
        store.commit("assessment/SET_SYNC_STATUS", {
          status: "saving",
          message: "Typing...",
          pending_changes: pendingChanges.value.size,
        });
      }
    },

    afterChange: (changes, source) => {
      if (source === "loadData" || !changes) return;

      // Clear existing timeout
      if (changeTimeout.value) {
        clearTimeout(changeTimeout.value);
      }

      // Add changed rows to pending set
      changes.forEach((change) => {
        pendingChanges.value.add(change[0]);
      });

      // Update status
      store.commit("assessment/SET_SYNC_STATUS", {
        status: "saving",
        message: "Saving changes...",
        pending_changes: pendingChanges.value.size,
      });

      // Debounced save after user stops typing
      changeTimeout.value = setTimeout(async () => {
        const rowsToSave = Array.from(pendingChanges.value);

        try {
          // Process each changed row
          for (const rowIndex of rowsToSave) {
            const rowData = hotInstance.value.getDataAtRow(rowIndex);
            const studentData = transformRowToStudentObjectStructured(rowData);

            if (studentData) {
              const result = await store.dispatch(
                "assessment/StoreSingleHandsontable",
                {
                  assessment_id: assessmentId.value,
                  data: studentData,
                }
              );

              if (result.success) {
                // Remove this row from pending changes
                pendingChanges.value.delete(rowIndex);

                // Update pending count
                store.commit("assessment/SET_SYNC_STATUS", {
                  status: pendingChanges.value.size > 0 ? "saving" : "saved",
                  message:
                    pendingChanges.value.size > 0
                      ? "Saving remaining changes..."
                      : "All changes saved",
                  pending_changes: pendingChanges.value.size,
                  last_updated: new Date().toISOString(),
                });
              } else {
                throw new Error(`Failed to save row ${rowIndex}`);
              }
            } else {
              // Invalid data, remove from pending
              pendingChanges.value.delete(rowIndex);
            }
          }

          // All changes saved successfully
          if (pendingChanges.value.size === 0) {
            store.commit("assessment/SET_SYNC_STATUS", {
              status: "saved",
              message: "All changes saved",
              pending_changes: 0,
              last_updated: new Date().toISOString(),
            });

            // Reset to ready after 2 seconds
            setTimeout(() => {
              store.commit("assessment/SET_SYNC_STATUS", {
                status: "ready",
                message: "",
                pending_changes: 0,
              });
            }, 2000);
          }
        } catch (error) {
          console.error("Failed to save changes:", error);
          store.commit("assessment/SET_SYNC_STATUS", {
            status: "error",
            message: "Failed to save some changes",
            pending_changes: pendingChanges.value.size,
          });
        }
      }, 1000); // Wait 1 second after user stops typing
    },
  });

  // Add this after creating the instance to ensure it shows from row 0
  nextTick(() => {
    hotInstance.value.scrollViewportTo(0, 0);
    hotInstance.value.render();
  });
}

function addRow() {
  if (hotInstance.value) {
    const newRowIndex = hotInstance.value.countRows();
    hotInstance.value.alter("insert_row_above", newRowIndex);
    hotInstance.value.setDataAtCell(newRowIndex, 0, "");
    hotInstance.value.setDataAtCell(newRowIndex, 1, "");

    // Scroll to new row and select first cell
    hotInstance.value.scrollViewportTo(newRowIndex, 0);
    hotInstance.value.selectCell(newRowIndex, 0);
  }
}

async function deleteSelectedRows(selection) {
  if (!hotInstance.value || !selection || selection.length === 0) return;

  const rowsToDelete = [];
  const studentsToDelete = [];

  // Collect all selected rows and their data
  selection.forEach((sel) => {
    for (let row = sel.start.row; row <= sel.end.row; row++) {
      const rowData = hotInstance.value.getDataAtRow(row);
      if (rowData && rowData[0]) {
        // Check if row has NIM
        rowsToDelete.push(row);
        studentsToDelete.push({
          row: row,
          nim: rowData[0],
          name: rowData[1],
        });
      }
    }
  });

  if (studentsToDelete.length === 0) {
    toast.warning("No valid students selected for deletion");
    return;
  }

  // Confirm deletion
  const confirmed = confirm(
    `Are you sure you want to delete ${studentsToDelete.length} student(s)?\n\n` +
      studentsToDelete.map((s) => `${s.nim} - ${s.name}`).join("\n")
  );

  if (!confirmed) return;

  try {
    store.commit("assessment/SET_SYNC_STATUS", {
      status: "saving",
      message: "Deleting students...",
    });

    // Delete students from backend
    for (const student of studentsToDelete) {
      const result = await store.dispatch(
        "assessment/DeleteHandsontableStudent",
        {
          assessment_id: assessmentId.value,
          nim: student.nim,
        }
      );

      if (!result.success) {
        throw new Error(`Failed to delete student ${student.nim}`);
      }
    }

    // Remove rows from table (sort in descending order to avoid index issues)
    const sortedRows = [...new Set(rowsToDelete)].sort((a, b) => b - a);
    sortedRows.forEach((row) => {
      hotInstance.value.alter("remove_row", row);
    });

    store.commit("assessment/SET_SYNC_STATUS", {
      status: "saved",
      message: `${studentsToDelete.length} student(s) deleted successfully`,
    });

    // Reset status after 2 seconds
    setTimeout(() => {
      store.commit("assessment/SET_SYNC_STATUS", {
        status: "ready",
        message: "",
      });
    }, 2000);
  } catch (error) {
    console.error("Failed to delete students:", error);
    store.commit("assessment/SET_SYNC_STATUS", {
      status: "error",
      message: "Failed to delete students",
    });
  }
}

const handleResize = debounce(() => {
  if (hotInstance.value) {
    const actionBar = document.getElementById("table-actions");
    const actionBarHeight = actionBar?.offsetHeight || 0;
    const tableHeight = window.innerHeight - actionBarHeight;
    hotInstance.value.updateSettings({ height: tableHeight });
  }
}, 200);

onMounted(async () => {
  try {
    isLoading.value = true;

    // Initialize sync status and pending changes
    pendingChanges.value = new Set();
    store.commit("assessment/SET_SYNC_STATUS", {
      status: "ready",
      message: "",
      pending_changes: 0,
      last_updated: null,
    });

    await store.dispatch("assessment/GetReport", assessmentId.value);

    const result = await store.dispatch(
      "assessment/GetHandsontable",
      assessmentId.value
    );

    // if (!result) {
    //   return router.push("/404");
    // }

    setupTable();
    window.addEventListener("resize", handleResize);
    window.addEventListener("beforeunload", handleBeforeUnload);

    setTimeout(() => {
      isLoading.value = false;
    }, 300);
  } catch (error) {
    console.error("Error loading assessment data:", error);
    // router.push("/404");
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("beforeunload", handleBeforeUnload);

  // Clear any pending timeouts
  if (changeTimeout.value) {
    clearTimeout(changeTimeout.value);
  }

  if (hotInstance.value) {
    hotInstance.value.destroy();
  }
});
</script>

<style lang="scss" scoped>
.page-container {
  display: flex;
  flex-direction: column;
  block-size: 100vh;
  background-color: #f9fafb;
  overflow: hidden;
}

.table-actions {
  position: sticky;
  z-index: 100;
  inset-block-start: 0;
  background: linear-gradient(
    to bottom,
    #ffffff 0%,
    #ffffff 95%,
    rgba(255, 255, 255, 0.8) 100%
  );
  border-block-end: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.actions-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
  padding: 1rem 2rem;
  max-width: 100%;
}

.course-info {
  flex: 1;
  min-width: 0;
}

.course-code {
  font-weight: 700;
  font-size: 0.8125rem;
  color: #2563eb;
  background-color: #eff6ff;
  padding: 0.1875rem 0.5rem;
  border-radius: 0.375rem;
  letter-spacing: 0.025em;
}

.course-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  line-height: 1.4;
}

.meta-info {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  margin-block-start: 0.375rem;
  font-size: 0.8125rem;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}

.meta-label {
  font-weight: 500;
  color: #9ca3af;
}

.meta-value {
  font-weight: 600;
  color: #374151;
}

.meta-divider {
  color: #d1d5db;
}

.add-row-btn {
  white-space: nowrap;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  text-transform: none;
  letter-spacing: normal;
  font-weight: 500;
  font-size: 0.8125rem;
}

.status-chip {
  font-size: 0.75rem;
  font-weight: 500;

  .pending-count {
    margin-left: 0.25rem;
    font-weight: 600;
  }
}

.table-wrapper {
  flex: 1;
  overflow: hidden;
  background-color: #ffffff;
  border-radius: 0;
  position: relative;
}

.handsontable-container {
  block-size: 100%;
  inline-size: 100%;
}

.loading-overlay {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(249, 250, 251, 0.98);
  backdrop-filter: blur(8px);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.loading-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-block-start: 1.5rem;
  margin-block-end: 0.5rem;
}

.loading-subtitle {
  color: #6b7280;
  margin: 0;
}

// Transitions
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  transform: translateY(10px);
  opacity: 0;
}

// Responsive
@media (max-width: 768px) {
  .actions-content {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .meta-info {
    font-size: 0.8125rem;
  }

  .course-title {
    font-size: 1.125rem;
  }
}
</style>

<style lang="scss">
// Global Handsontable styling
.handsontable-container {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;

  .handsontable {
    color: #111827;
  }

  // Header styling
  .ht_clone_top,
  .ht_clone_top_inline_start_corner {
    th {
      font-weight: 600;
      font-size: 0.8125rem;
      text-transform: uppercase;
      letter-spacing: 0.025em;
      // padding: 0.2rem;

      &:hover {
        background: linear-gradient(to bottom, #f3f4f6 0%, #e5e7eb 100%);
      }
    }
  }

  // Row headers
  .ht_clone_inline_start th,
  .ht_clone_top_inline_start_corner th {
    font-weight: 500;
    font-size: 0.8125rem;
  }

  // Cell styling
  td {
    // border-right: 1px solid #f3f4f6 !important;
    // border-bottom: 1px solid #f3f4f6 !important;
    // background-color: #ffffff;
    padding: 0.5rem;
    vertical-align: middle !important;
    line-height: 1.5;

    &.even-row {
      background-color: #fafafa;
    }

    &.current,
    &.area {
      background-color: #eff6ff !important;
    }

    &:hover {
      background-color: #f9fafb !important;
    }
  }

  // NIM column - left aligned
  tbody tr td:nth-child(1) {
    text-align: left;
    font-weight: 500;
  }

  // Name column - left aligned
  tbody tr td:nth-child(2) {
    text-align: left;
    font-weight: 500;
  }

  // All score columns - center aligned
  tbody tr td:not(:nth-child(1)):not(:nth-child(2)) {
    text-align: left;
    font-weight: 500;
    color: #111827;
  }

  // Special column styling - more subtle
  .final-score-cell {
    font-weight: 600;
    color: #854d0e;
    background-color: #fef9c3 !important;

    &.even-row {
      background-color: #fef08a !important;
    }

    &.current,
    &.area {
      background-color: #fde047 !important;
    }
  }

  // Override for even rows with specific order
  td.final-score-cell.even-row {
    background-color: #fef08a !important;
  }

  .grading-cell {
    font-weight: 600;
    color: #065f46;
    background-color: #d1fae5 !important;

    &.even-row {
      background-color: #a7f3d0 !important;
    }

    &.current,
    &.area {
      background-color: #6ee7b7 !important;
    }
  }

  // Override for even rows with specific order
  td.grading-cell.even-row {
    background-color: #a7f3d0 !important;
  }

  .proficiency-cell {
    font-weight: 600;
    color: #1e40af;
    background-color: #dbeafe !important;

    &.even-row {
      background-color: #bfdbfe !important;
    }

    &.current,
    &.area {
      background-color: #93c5fd !important;
    }
  }

  // Override for even rows with specific order
  td.proficiency-cell.even-row {
    background-color: #bfdbfe !important;
  }

  .area {
    background-color: #eff6ff !important;
  }

  // Input styling
  .handsontableInput {
    padding: 0.5rem;
    border: 2px solid #2563eb;
    border-radius: 0.25rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  // Hide scrollbars
  ::-webkit-scrollbar {
    width: 0;
    height: 0;
    display: none;
  }

  // For Firefox
  scrollbar-width: none;

  // For IE and Edge
  -ms-overflow-style: none;

  // Additional hiding for Handsontable specific elements
  .wtHolder,
  .ht_master .wtHolder,
  .ht_clone_top .wtHolder,
  .ht_clone_bottom .wtHolder,
  .ht_clone_inline_start .wtHolder {
    &::-webkit-scrollbar {
      display: none;
    }
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  // Context menu
  .htContextMenu {
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;

    table {
      tbody td {
        padding: 0.5rem 1rem;

        &:hover {
          background-color: #f3f4f6;
        }
      }
    }
  }
}
</style>
