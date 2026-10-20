<template>
  <q-page class="login-page">
    <div class="login-page__scene" aria-hidden="true">
      <div class="scene-glow scene-glow--left"></div>
      <div class="scene-glow scene-glow--right"></div>
      <div class="scene-window"></div>
      <div class="scene-shelf"><span></span><span></span><span></span></div>
      <div class="scene-desk"></div>
      <div class="scene-plant scene-plant--left"><i></i><i></i><i></i><i></i></div>
      <div class="scene-plant scene-plant--right"><i></i><i></i><i></i><i></i></div>
    </div>

    <main class="login-content">
      <section class="brand-intro" aria-labelledby="brand-name">
        <div class="brand-mark" aria-hidden="true"><span></span><span></span></div>
        <p id="brand-name" class="brand-name">CREATIVE</p>
        <p class="brand-subtitle">Admin Panel</p>
      </section>

      <q-card flat class="login-card">
        <q-card-section class="login-card__heading">
          <h1>Masuk ke Creative</h1>
          <p>Silakan masuk menggunakan akun Anda untuk mengakses dashboard.</p>
          <p v-if="loginError" class="login-feedback login-feedback--error" role="alert">
            {{ loginError }}
          </p>
        </q-card-section>

        <q-card-section class="login-card__form">
          <q-form greedy @submit="submitLogin">
            <label class="field-label" for="login-username">Username</label>
            <q-input
              id="login-username"
              v-model="username"
              dark
              outlined
              class="login-input"
              placeholder="Masukkan username"
              autocomplete="username"
              :rules="[(value) => !!value || 'Username wajib diisi']"
            >
              <template #prepend><q-icon name="mail_outline" /></template>
            </q-input>

            <div class="password-heading">
              <label class="field-label" for="login-password">Password</label>
              <button class="forgot-link" type="button" @click="showForgotInfo = true">
                Lupa password?
              </button>
            </div>
            <q-input
              id="login-password"
              v-model="password"
              dark
              outlined
              class="login-input"
              placeholder="Masukkan password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              :rules="[(value) => !!value || 'Password wajib diisi']"
            >
              <template #prepend><q-icon name="lock_outline" /></template>
              <template #append>
                <q-btn
                  flat
                  round
                  dense
                  :icon="showPassword ? 'visibility_off' : 'visibility'"
                  :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>

            <q-btn
              type="submit"
              unelevated
              no-caps
              :loading="isSubmitting"
              class="login-button full-width"
              label="Masuk"
              icon="login"
            />
          </q-form>
        </q-card-section>
      </q-card>
    </main>

    <footer class="login-footer">CV. UDUMBARA INFROMATIKA</footer>

    <q-dialog v-model="showForgotInfo">
      <q-card class="info-dialog">
        <q-card-section><div class="text-h6">Lupa password?</div></q-card-section>
        <q-card-section class="q-pt-none">
          Hubungi administrator untuk membantu mengatur ulang password Anda.
        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-close-popup flat no-caps color="amber-8" label="Mengerti" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const password = ref('')
const showPassword = ref(false)
const isSubmitting = ref(false)
const showForgotInfo = ref(false)
const loginError = ref('')

const apiBaseUrl = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

async function submitLogin() {
  loginError.value = ''
  isSubmitting.value = true

  try {
    const response = await fetch(`${apiBaseUrl}/login`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
    })

    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(payload.message || 'Login gagal. Silakan coba lagi.')
    }

    localStorage.setItem('creative_auth_token', payload.token)
    localStorage.setItem('creative_auth_user', JSON.stringify(payload.user))
    password.value = ''
    await router.push('/')
  } catch (error) {
    loginError.value =
      error instanceof Error && error.message !== 'Failed to fetch'
        ? error.message
        : 'Tidak dapat terhubung ke server. Periksa URL API dan koneksi Anda.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped lang="scss">
.login-page {
  isolation: isolate;
  position: relative;
  display: grid;
  height: 100dvh;
  min-height: 100vh;
  overflow: hidden;
  place-items: center;
  padding: 48px 24px 54px;
  background: #080a0c;
  color: #f8f8f6;
}

.login-page__scene,
.login-page__scene::after {
  position: absolute;
  inset: 0;
}

.login-page__scene {
  z-index: -2;
  overflow: hidden;
  background:
    radial-gradient(circle at 84% 19%, rgba(176, 111, 38, 0.43), transparent 19%),
    radial-gradient(circle at 8% 77%, rgba(95, 68, 35, 0.42), transparent 22%),
    linear-gradient(105deg, #10171a 0%, #090b0d 47%, #362213 100%);
}

.login-page__scene::after {
  z-index: 3;
  content: '';
  background: rgba(2, 4, 5, 0.42);
  backdrop-filter: blur(2px);
}

.scene-window {
  position: absolute;
  top: 0;
  left: 13%;
  width: 31%;
  height: 73%;
  opacity: 0.34;
  background: repeating-linear-gradient(90deg, #a5bbc0 0 5px, #1a2428 6px 34px, #070a0b 35px 47px);
  box-shadow: 22px 0 45px #000;
}

.scene-shelf {
  position: absolute;
  top: 12%;
  right: 8%;
  display: flex;
  width: 29%;
  height: 47%;
  align-items: end;
  gap: 11%;
  padding: 4% 8%;
  border-bottom: 10px solid rgba(147, 83, 29, 0.95);
  background: linear-gradient(90deg, rgba(35, 20, 12, 0.5), rgba(118, 69, 25, 0.56));
  box-shadow: inset 0 -20px 22px rgba(248, 177, 72, 0.18);

  span {
    width: 22%;
    height: 33%;
    border-radius: 5px 5px 0 0;
    background: linear-gradient(90deg, #382415, #9f6732, #4c2d16);
    box-shadow: 0 11px 20px rgba(0, 0, 0, 0.3);
  }
}

.scene-desk {
  position: absolute;
  right: -7%;
  bottom: 6%;
  width: 88%;
  height: 25%;
  transform: perspective(400px) rotateX(55deg) rotateZ(-2deg);
  border-top: 7px solid rgba(218, 143, 56, 0.66);
  background: linear-gradient(110deg, #2d1a0d, #8d5726 48%, #25150a);
  box-shadow: 0 -20px 50px rgba(0, 0, 0, 0.7);
}

.scene-glow {
  position: absolute;
  z-index: 2;
  border-radius: 50%;
  filter: blur(45px);
}

.scene-glow--left {
  bottom: 10%;
  left: -4%;
  width: 28vw;
  height: 28vw;
  background: rgba(37, 84, 59, 0.4);
}
.scene-glow--right {
  top: 19%;
  right: 12%;
  width: 16vw;
  height: 16vw;
  background: rgba(255, 173, 59, 0.22);
}

.scene-plant {
  position: absolute;
  z-index: 2;
  display: flex;
  width: 170px;
  height: 180px;
  align-items: flex-end;
  justify-content: center;
  border-radius: 50% 50% 15% 15%;
  background: linear-gradient(90deg, rgba(48, 67, 29, 0.76), rgba(12, 23, 15, 0.88));
  filter: blur(1px);

  i {
    position: absolute;
    bottom: 60px;
    width: 35px;
    height: 110px;
    border-radius: 100% 0;
    background: #486830;
    transform-origin: bottom;
  }
  i:nth-child(1) {
    transform: rotate(-48deg);
  }
  i:nth-child(2) {
    transform: rotate(-20deg);
  }
  i:nth-child(3) {
    transform: rotate(23deg);
  }
  i:nth-child(4) {
    transform: rotate(49deg);
  }
}

.scene-plant--left {
  bottom: 8%;
  left: 5%;
}
.scene-plant--right {
  top: 8%;
  right: 14%;
  transform: scale(0.7);
}
.login-content {
  width: min(100%, 526px);
}
.brand-intro {
  margin-bottom: 34px;
  text-align: center;
}
.brand-mark {
  position: relative;
  width: 67px;
  height: 67px;
  margin: 0 auto 14px;
  transform: rotate(45deg);
}
.brand-mark span {
  position: absolute;
  top: 6px;
  width: 41px;
  height: 41px;
  border: 8px solid #f6c645;
}
.brand-mark span:first-child {
  left: 3px;
  border-right: 0;
  border-bottom: 0;
}
.brand-mark span:last-child {
  right: 3px;
  border-left: 0;
  border-top: 0;
}
.brand-name {
  margin: 0;
  color: #fff;
  font-size: clamp(2rem, 5vw, 2.8rem);
  font-weight: 800;
  letter-spacing: 0.15em;
  line-height: 1.1;
}
.brand-subtitle {
  margin: 5px 0 17px;
  color: #c3c6cc;
  font-size: 1.35rem;
}

.login-card {
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 25px;
  background: linear-gradient(135deg, rgba(28, 31, 34, 0.95), rgba(11, 13, 14, 0.97));
  box-shadow:
    0 24px 70px rgba(0, 0, 0, 0.5),
    inset 0 1px rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(18px);
}

.login-card__heading {
  padding: 34px 40px 11px;
}
.login-card__heading h1 {
  margin: 0 0 7px;
  font-size: 1.72rem;
  font-weight: 700;
  line-height: 1.25;
}
.login-card__heading p {
  max-width: 350px;
  margin: 0;
  color: #b6bac2;
  font-size: 1rem;
  line-height: 1.55;
}
.login-feedback {
  margin-top: 15px !important;
  padding: 9px 12px;
  border-radius: 9px;
  font-size: 0.87rem !important;
  line-height: 1.4 !important;
}
.login-feedback--error {
  border: 1px solid rgba(244, 104, 104, 0.42);
  background: rgba(168, 38, 38, 0.2);
  color: #ffb4b4 !important;
}
.login-card__form {
  padding: 12px 40px 39px;
}
.field-label {
  display: block;
  margin: 0 0 9px;
  color: #f6f6f6;
  font-size: 0.96rem;
  font-weight: 600;
}
.password-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-top: 23px;
}
.password-heading .field-label {
  margin-bottom: 9px;
}
.forgot-link {
  padding: 0;
  border: 0;
  background: transparent;
  color: #f5c442;
  cursor: pointer;
  font: inherit;
  font-size: 0.88rem;
}
.forgot-link:hover {
  color: #ffe08a;
  text-decoration: underline;
}

:deep(.login-input .q-field__control) {
  height: 58px;
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.045);
}
:deep(.login-input.q-field--outlined .q-field__control:before) {
  border-color: rgba(188, 195, 204, 0.28);
}
:deep(.login-input.q-field--outlined.q-field--focused .q-field__control:after) {
  border-color: #f6c645;
}
:deep(.login-input .q-field__native),
:deep(.login-input .q-field__prepend),
:deep(.login-input .q-field__append) {
  color: #d0d5dc;
}
:deep(.login-input .q-field__native::placeholder) {
  color: #969ca5;
  opacity: 1;
}

.login-button {
  height: 58px;
  margin-top: 29px;
  border-radius: 14px;
  background: linear-gradient(105deg, #f5bd35, #ffd866);
  color: #14110a;
  font-size: 1.08rem;
  font-weight: 700;
}
.login-button:hover {
  background: linear-gradient(105deg, #ffd158, #ffe18a);
}
.login-footer {
  position: absolute;
  bottom: 20px;
  color: #bfc2c8;
  font-size: 0.85rem;
  letter-spacing: 0.02em;
}
.info-dialog {
  max-width: 360px;
  border-radius: 18px;
  background: #202326;
  color: #f8f8f8;
}

@media (max-width: 599px) {
  .login-page {
    display: block;
    padding: 42px 16px 66px;
  }
  .login-content {
    margin: 0 auto;
  }
  .brand-intro {
    margin-bottom: 28px;
  }
  .brand-mark {
    transform: scale(0.83) rotate(45deg);
    margin-bottom: 7px;
  }
  .brand-name {
    font-size: 1.85rem;
  }
  .brand-subtitle {
    margin-bottom: 11px;
    font-size: 1.1rem;
  }
  .login-card {
    border-radius: 21px;
  }
  .login-card__heading {
    padding: 28px 25px 10px;
  }
  .login-card__form {
    padding: 12px 25px 29px;
  }
  .login-card__heading h1 {
    font-size: 1.47rem;
  }
  .login-card__heading p {
    font-size: 0.94rem;
  }
  .login-footer {
    left: 0;
    right: 0;
    text-align: center;
  }
  .scene-shelf {
    right: -6%;
    width: 52%;
  }
  .scene-window {
    left: -12%;
    width: 47%;
  }
  .scene-plant--right {
    right: -11%;
  }
}
</style>
