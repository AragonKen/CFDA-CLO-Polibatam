import user_role_migration_func from "./user-role.migration";
import user_department_migration_func from "./user-department.migration";

// REGISTER MIGRATION FUNCTION HERE
const migration_funcs: (() => Promise<void>)[] = [
  // user_role_migration_func,
  // user_department_migration_func
];

async function main() {
  try {
    console.log("Running Migrations");
    console.log("-------------------------------------------------------------------");
    for (const func of migration_funcs) await func();
    console.log("-------------------------------------------------------------------");
    console.log("Migration Done Successfully!");
  }
  catch (error: any) {
    console.error(`Error occured: ${error.message}`);
  }
}

main();
