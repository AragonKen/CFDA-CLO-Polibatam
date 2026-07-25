<script setup>
definePage({ meta: { layout: 'blank', unauthenticatedOnly: true } })

const store = useVuex()

const loading = computed(() => store.state.app.loading)

const form = ref({
  username: '',
  password: '',
  remember: false,
})

const isPasswordVisible = ref(false)

const handleSubmit = async e => {
  const { valid } = await e

  if(valid){
    store.dispatch('Login', form.value)
  }
}
</script>

<template>
  <VRow
    no-gutters
    class="auth-wrapper"
    style="background-image: url('/bg-login.jpeg');"
  >
    <VCol class="auth-card-v2 d-flex align-center justify-center">
      <VCard
        :max-width="500"
        class="mt-12 mt-sm-0 pa-4"
      >
        <!--
          <VNodeRenderer
          :nodes="themeConfig.app.logo"
          class="mt-6 d-flex justify-center"
          /> 
        -->

        <div class="mt-6 mb-8 d-flex justify-center">
          <img
            src="/logo.svg"
            alt="Logo"
            width="200"
            class="mx-auto"
          >
        </div>


        <VCardText>
          <p class="mb-0">
            Please sign-in to your account and start the adventure
          </p>
        </VCardText>
        <VCardText>
          <VForm @submit.prevent="handleSubmit">
            <VRow>
              <!-- email -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.username"
                  autofocus
                  label="Username"
                  placeholder="...."
                  :rules="[requiredValidator]"
                />
              </VCol>

              <!-- password -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.password"
                  label="Password"
                  placeholder="············"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  :rules="[requiredValidator]"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />

                <div class="d-flex align-center flex-wrap justify-space-between mt-2 mb-4">
                  <VCheckbox
                    v-model="form.remember"
                    label="Remember me"
                  />
                </div>

                <VBtn
                  block
                  type="submit"
                  :loading="loading"
                >
                  Login
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>



<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";

.auth-wrapper {
  background-position: center;
  background-size: cover;
}
</style>
