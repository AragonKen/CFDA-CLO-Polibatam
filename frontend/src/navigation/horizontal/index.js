export default [
  {
    title: 'Home',
    icon: { icon: 'tabler-smart-home' },
    to: { name: 'root' },
  },
  {
    title: 'Property',
    icon: { icon: 'tabler-home' },
    to: { name: 'property' },
  },
  {
    title: 'Lead',
    icon: { icon: 'tabler-users' },
    to: { name: 'lead' },
  },
  {
    title: 'Others',
    icon: { icon: 'tabler-feather' },
    children: [
      {
        title: 'Content',
        icon: { icon: 'tabler-photo' },
        children: [
          { title: 'Files', to: { name: 'content-file' } },
        ],
      },
      {
        title: 'Facility',
        icon: { icon: 'tabler-feather' },
        children: [
          { title: 'Parent', to: { name: 'setup-facility-parent' } },
          { title: 'Facilities', to: { name: 'setup-facility' } },
        ],
      },
      {
        title: 'User Management',
        icon: { icon: 'tabler-users' },
        to: { name: 'user' },
      },
    ],
  },
  {
    title: 'Settings',
    icon: { icon: 'tabler-settings' },
    to: { name: 'settings' },
  },
]
