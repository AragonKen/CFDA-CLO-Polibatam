export const isAuthorized = (permission, unit = null) => {
  const store = useVuex();
  const permissions = store.state.app.permissions;
  const department = store.state.app.user.unit;

  if (unit) return permissions.includes(permission) && department.includes(unit);
  return permissions.includes(permission);
}
