import { PrismaClient } from "@prisma/client";

const COURSE_PERMISSIONS       = ["create_course", "update_course", "delete_course"];
const STUDENT_OUTCOME_PERMS    = ["create_student_outcome", "update_student_outcome", "delete_student_outcome"];
const RUBRIC_PERMISSIONS       = ["create_rubric", "update_rubric", "delete_rubric"];
const CLO_PERMISSIONS          = ["create_course_learning_outcome", "update_course_learning_outcome", "delete_course_learning_outcome"];
const PROFICIENCY_PERMISSIONS  = ["create_proficiency_level", "update_proficiency_level", "delete_proficiency_level"];
const GRADING_PERMISSIONS      = ["create_grading", "update_grading", "delete_grading"];
const CAP_PERMISSIONS          = ["create_course_assessment_plan", "update_course_assessment_plan", "delete_course_assessment_plan"];
const CDIO_PERMISSIONS         = ["create_cdio_syllabus", "update_cdio_syllabus", "delete_cdio_syllabus"];
const ASSESSMENT_TYPE_PERMS    = ["create_assessment_type", "update_assessment_type", "delete_assessment_type"];
const ASSESSMENT_PERMISSIONS   = ["create_assessment", "update_assessment", "delete_assessment"];
const DEPT_PERMISSIONS         = ["create_department", "update_department", "delete_department", "create_study_program", "update_study_program", "delete_study_program"];
const USER_PERMISSIONS         = ["create_user", "update_user", "delete_user", "modify_user_role", "modify_user_department"];

const LECTURER_PERMISSIONS = [
  ...COURSE_PERMISSIONS, ...STUDENT_OUTCOME_PERMS, ...RUBRIC_PERMISSIONS,
  ...CLO_PERMISSIONS, ...PROFICIENCY_PERMISSIONS, ...GRADING_PERMISSIONS,
  ...CAP_PERMISSIONS, ...CDIO_PERMISSIONS, ...ASSESSMENT_TYPE_PERMS, ...ASSESSMENT_PERMISSIONS,
];

const HOD_PERMISSIONS = [
  ...LECTURER_PERMISSIONS, ...DEPT_PERMISSIONS
]


const ADMIN_PERMISSIONS = [
  ...HOD_PERMISSIONS, ...USER_PERMISSIONS
]

const DATA = [
  { name: "head_of_department", label: "Head Of Department", permissions: HOD_PERMISSIONS },
  { name: "lecturer",           label: "Lecturer", permissions: LECTURER_PERMISSIONS },
  { name: "admin",              label: "Admin", permissions: ADMIN_PERMISSIONS },
  { name: "staff",              label: "Staff", permissions: [] }
];

export async function RoleAndPermissionSeeder(prisma: PrismaClient) {
  for (const item of DATA) {
    const role = await prisma.tbm_role.upsert({
      where: { name: item.name },
      create: { name: item.name, label: item.label },
      update: {}
    });

    for (const perm of item.permissions) {
      let permission = await prisma.tbm_permission.upsert({
        where: { name: perm },
        create: { name: perm },
        update: {}
      });

      // TODO: check if role_permission exist
      const exist = await prisma.tbm_role_permission.findFirst({ where: { AND: [{ role_id: role.id }, { permission_id: permission.id }] } });
      if (!exist) await prisma.tbm_role_permission.create({ data: { role_id: role.id, permission_id: permission.id }});
    }
  }

  console.log("Role and Permission seeder done.", {
    tbm_role: await prisma.tbm_role.count(),
    tbm_role_permission: await prisma.tbm_role_permission.count(),
    tbm_permission: await prisma.tbm_permission.count(),
  });
}
