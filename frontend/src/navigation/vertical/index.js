export default [
  {
    heading: "Main",
  },
  {
    title: "Home",
    icon: { icon: "tabler-smart-home" },
    to: { name: "root" },
  },
  {
    title: "Assessment",
    icon: { icon: "tabler-file-text" },
    to: { name: "assessment" },
  },
  {
    title: "PLO Attainment",
    icon: { icon: "tabler-graph" },
    to: { name: "plo-attainment" },
  },
  {
    heading: "Setup",
  },
  {
    title: "Course",
    icon: { icon: "tabler-book" },
    to: { name: 'course' },
  },
  {
    title: "Study Program",
    icon: { icon: "tabler-school" },
    to: { name: "study-program" },
  },
  {
    title: "Department",
    icon: { icon: "tabler-school" },
    to: { name: 'department' },
  },
  {
    title: "Assessment Method",
    icon: { icon: "tabler-file-text" },
    to: { name: "assessment-method" },
  },
  {
    title: "Proficiency Level",
    icon: { icon: "tabler-chart-bar" },
    to: { name: "proficiency-level" },
  },
  {
    heading: "Utility",
  },
  {
    title: "Assessment Type",
    icon: { icon: "tabler-file-text" },
    to: { name: "utility-assessment-type" },
  },
  {
    title: "Grading",
    icon: { icon: "tabler-number" },
    to: { name: "utility-grading" },
  },
  {
    title: "User Management",
    icon: { icon: "tabler-users" },
    to: { name: "utility-user" },
  },
]
  .map(item => {
    if (item.children) {
      item.children = item.children.filter(child => !child.hidden)
    }

    if (item.children && item.children.length === 0) {
      item.hidden = true
    }

    return item
  })
  .filter(item => !item.hidden)
