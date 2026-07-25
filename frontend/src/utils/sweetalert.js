import Swal from "sweetalert2"

export const showSwal = async (title, text, confirmButtonText) => {
  const { isConfirmed } = await Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText,
    confirmButtonColor: "#173963",
    customClass: { confirmButton: "text-white", cancelButton: "" },
    cancelButtonText: "No, cancel!",
    cancelButtonColor: "#CDCDCD",
  })

  return isConfirmed
}

export const SwalDelete = async () =>
  await showSwal("Are you sure?", "You will not be able to recover this data!", "Yes, delete it!")

export const SwalUpdateStatus = async status =>
  await showSwal("Are you sure?", `You want to change the status to ${status}!`, "Yes, change it!")

export const SwalGenerateCourseAssessmentPlan = async () =>
  await showSwal("Are you sure?", "You want to generate course assessment plan!", "Yes, generate it!")
