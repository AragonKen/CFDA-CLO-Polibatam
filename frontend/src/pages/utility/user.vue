<template>
  <div>
    <VCard
      title="User Management"
      subtitle="Manage user roles and permissions"
    >
      <VDivider />

      <VCardText>
        <div class="d-flex align-center justify-end flex-wrap gap-4">
          <div style="inline-size: 20rem;">
            <AppTextField
              v-model="table_options.search"
              density="compact"
              placeholder="Search ..."
              append-inner-icon="tabler-search"
              clearable
              @update:model-value="() => refetch()"
            />
          </div>
          <div>
            <VBtn
              color="primary"
              :loading="is_generate"
              @click="onGenerate"
              v-if="isAuthorized('create_user')"
            >
              <VIcon
                icon="tabler-user-plus"
                start
              />
              Generate Pegawai
            </VBtn>
          </div>
        </div>
      </VCardText>

      <VDivider />

      <VCardText class="px-0 pt-0">
        <VDataTableServer
          v-model:options="table_options"
          v-model:items-per-page="table_options.page_size"
          v-model:page="table_options.page"
          :items-length="table_options.total_items"
          :headers="headers"
          :items="reports"
          :loading="loading"
          :search="table_options.search"
          @update:options="refetch"
        >
          <template #[`item.name`]="{ item }">
            <!-- <span> {{ item.GELAR_DPN }} </span> -->
            <span> {{ item.name }}</span>
            <span> {{ item.gelar_blk }}</span>
          </template>
          <template #[`item.department`]="{ item }">
            <span>{{ item.department?.title || '-' }}</span>
          </template>
          <template #[`item.role`]="{ item }">
            <VChip
              :color="
                item.role?.label === 'Admin'
                ? 'error'
                : item.role?.label === 'Lecturer'
                ? 'info'
                : item.role?.label === 'Head Of Department'
                ? 'warning'
                : 'success'
              "
              size="small"
              variant="tonal"
            >
              {{ item.role?.label }}
            </VChip>
          </template>
          <template #[`item.is_admin`]="{ item }">
            <VChip
              :color="item.is_admin ? 'success' : 'error'"
              :text-color="item.is_admin ? 'white' : 'white'"
              small
            >
              <span v-if="item.is_admin">Admin</span>
              <span v-else>Pegawai</span>
            </VChip>
          </template>

          <!-- Actions -->
          <template #item.actions="{ item }">
            <div class="d-flex justify-end align-center">
              <IconBtn @click="handleModalDetail(item.nip)">
                <VIcon icon="tabler-eye" />
              </IconBtn>
              
              <MoreBtn
                :menu-list="computedMoreList(item)"
                item-props
                color="undefined"
              />
            </div>
          </template>
        </VDataTableServer>
      </VCardText>
    </VCard>

    <UserDetailModal
      :is-open="modalDetail"
      @handle-close="handleModalDetail"
    />
    <!-- Modal Ubah Role -->
    <VDialog
      v-model="modalRole"
      max-width="500"
    >
      <VCard
        class="pa-6"
        style="border-radius:20px"
      >
        <div class="text-center">

          <h2 class="text-h4 font-weight-bold mb-6">
            Ubah Role
          </h2>

          <VAvatar
            size="90"
            color="grey-lighten-3"
            class="mb-4"
          >
            <VIcon
              icon="tabler-user"
              size="48"
            />
          </VAvatar>

          <h3 class="text-h6 font-weight-bold mb-1">
            {{ selectedUser?.name }}
          </h3>

          <p class="text-medium-emphasis mb-6">
            {{ selectedUser?.nip }}
          </p>

          <VSelect
            v-model="selectedRole"
            :items="roles"
            item-title="label"
            item-value="id"
            label="Role"
            variant="outlined"
            density="comfortable"
            class="mb-8"
          />

          <div class="d-flex justify-end gap-3">
            <VBtn
              color="secondary"
              variant="outlined"
              @click="modalRole = false"
            >
              Batal
            </VBtn>

            <VBtn
              color="#163E73"
              @click="saveRole"
            >
              Simpan
            </VBtn>
          </div>

        </div>
      </VCard>
    </VDialog>
    <!-- Modal Edit Unit Pegawai -->
    <VDialog
      v-model="modalEdit"
      max-width="500"
    >
      <VCard
        class="pa-6"
        style="border-radius:20px"
      >
        <div class="text-center">

          <h2 class="text-h4 font-weight-bold mb-6">
            Change Department
          </h2>

          <VAvatar
            size="90"
            color="grey-lighten-3"
            class="mb-4"
          >
            <VIcon
              icon="tabler-user"
              size="48"
            />
          </VAvatar>

          <!-- Nama -->
          <h3 class="text-h6 font-weight-bold mb-1">
            {{ editForm.name }}
          </h3>

          <!-- NIP -->
          <p class="text-medium-emphasis mb-6">
            {{ editForm.nip }}
          </p>

          <!-- Department -->
          <VSelect
            v-model="editForm.department_id"
            :items="departments"
            item-title="title"
            item-value="id"
            label="Department"
            variant="outlined"
            density="comfortable"
            class="mb-8"
          />

          <div class="d-flex justify-end gap-3">
            <VBtn
              color="secondary"
              variant="outlined"
              @click="modalEdit = false"
            >
              Batal
            </VBtn>

            <VBtn
              color="#163E73"
              @click="saveEdit"
            >
              Simpan
            </VBtn>
          </div>

        </div>
      </VCard>
    </VDialog>
  </div>
</template>



<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useStore } from 'vuex'
  import Swal from 'sweetalert2'
  import UserDetailModal from '@/views/user/user-detail-modal.vue'

  import { isAuthorized } from '@/helper/index';

  const store = useStore()

  // ====================
  // STATE
  // ====================
  const modalDetail = ref(false)
  const modalRole = ref(false)
  const modalEdit = ref(false)

  const selectedUser = ref(null)

  const selectedRole = ref(null)

  const editForm = ref({
    name: '',
    nip: '',
    department_id: null,
  })

  // ====================
  // TABLE HEADER
  // ====================
  const headers = ref([
    {
      sortable: false,
      title: 'NIP',
      value: 'nip',
    },
    {
      sortable: false,
      title: 'Name',
      value: 'name',
    },
    {
      sortable: false,
      title: 'Staff',
      value: 'staff_role',
    },
    {
      sortable: false,
      title: 'Department',
      value: 'department',
    },
    {
      sortable: false,
      title: 'Role',
      value: 'role',
    },
    {
      sortable: false,
      title: 'Action',
      value: 'actions',
      align: 'end',
    },
  ])

  // ====================
  // ACTION MENU
  // ====================
  const computedMoreList = item => [
    {
      title: 'Detail',
      prependIcon: 'tabler-eye',
      onClick: () => handleModalDetail(item.nip),
    },
    {
      title: 'Change Department',
      prependIcon: 'tabler-building',
      onClick: () => handleEdit(item),
      hidden: !isAuthorized("modify_user_department")
    },
    {
      title: 'Change Role',
      prependIcon: 'tabler-user-cog',
      onClick: () => handleRole(item),
      hidden: !isAuthorized("modify_user_role")
    },
  ]

  // ====================
  // DETAIL
  // ====================
  const handleModalDetail = value => {
    if (value) {
      store.dispatch('user/GetReport', value)
    }

    modalDetail.value = !!value
  }

  // ====================
  // EDIT UNIT
  // ====================
  const handleEdit = item => {
    editForm.value = {
      name: item.name || '',
      nip: item.nip || '',
      department_id: item.department?.id || null,
    }

    modalEdit.value = true
  }

  const saveEdit = async () => {
    try {
      await store.dispatch('user/ChangeDepartment', {
        nip: editForm.value.nip,
        department_id: editForm.value.department_id,
      })

      modalEdit.value = false
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Department gagal diperbarui',
      })
    }
  }

  // ====================
  // ROLE
  // ====================
  const handleRole = item => {
    selectedUser.value = item;

    selectedRole.value = item.role?.id ?? null;

    modalRole.value = true;
  }

  const saveRole = async () => {
    try {
      await store.dispatch('user/ChangeRole', {
        nip: selectedUser.value.nip,
        role_id: selectedRole.value,
      })

      modalRole.value = false
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Role gagal diperbarui',
      })
    }
  }

  // ====================
  // GENERATE USER
  // ====================
  const onGenerate = () => {
    store.dispatch('user/Generate')
  }

  // ====================
  // STORE DATA
  // ====================
  const loading = computed(() => {
    return store.state.user.loading.reports
  })

  const is_generate = computed(() => {
    return store.state.user.loading.generate
  })

  const reports = computed(() => {
    return store.state.user.reports
  })

  const roles = computed(() => {
    return store.state.user.roles
  })

  const departments = computed(() => {
    return store.state.user.departments
  })

  const table_options = computed({
    get: () => store.state.user.table_options,
    set: value => store.commit('user/SET_OPTIONS_TABLE', value),
  })

  // ====================
  // REFETCH
  // ====================
  const refetch = () => {
    store.dispatch('user/GetReports')
  }

  // ====================
  // MOUNTED
  // ====================
  onMounted(() => {
    refetch()
    store.dispatch('user/GetRoles')
    store.dispatch('user/GetDepartments')
  })
</script>
