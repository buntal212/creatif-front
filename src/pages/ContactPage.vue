<template>
  <q-page class="content-page">
    <header class="content-topbar">
      <RouterLink class="brand-lockup" to="/">
        <img class="brand-logo" src="/images/logo-creative.png" alt="Logo Creative" />
        <span>CREATIVE</span>
      </RouterLink>
      <nav class="content-nav" aria-label="Navigasi utama">
        <RouterLink to="/">Dashboard</RouterLink>
        <RouterLink to="/categories">Kategori</RouterLink>
        <RouterLink to="/products">Produk</RouterLink>
        <RouterLink class="is-active" to="/contact">Kontak</RouterLink>
        <RouterLink to="/gallery">Galeri Produksi</RouterLink>
        <RouterLink to="/users">Pengguna</RouterLink>
      </nav>
      <q-btn flat no-caps color="grey-4" icon="arrow_back" label="Dashboard" to="/" />
    </header>

    <main class="content-wrap">
      <div class="page-heading">
        <div>
          <p class="eyebrow">PENGATURAN WEBSITE</p>
          <h1>Kontak</h1>
          <p>Isi informasi yang ditampilkan pelanggan pada bagian kontak website.</p>
        </div>
      </div>

      <q-banner v-if="error" rounded class="error-banner">
        <template #avatar><q-icon name="error_outline" /></template>
        {{ error }}
      </q-banner>

      <q-card flat bordered class="contact-card">
        <q-card-section class="card-heading">
          <div class="heading-icon"><q-icon name="contact_phone" size="22px" /></div>
          <div>
            <h2>Informasi kontak</h2>
            <p>
              Gunakan nomor WhatsApp dengan awalan 62 agar tombol pesan dapat langsung berfungsi.
            </p>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-form class="contact-form" @submit="saveContact">
            <div class="form-grid">
              <div>
                <label for="whatsapp">WhatsApp</label>
                <q-input
                  id="whatsapp"
                  v-model.trim="form.whatsapp"
                  outlined
                  placeholder="Contoh: 6281234567890"
                  hint="Tanpa tanda +, spasi, atau strip"
                >
                  <template #prepend><q-icon name="chat" /></template>
                </q-input>
              </div>
              <div>
                <label for="phone">Nomor telepon</label>
                <q-input
                  id="phone"
                  v-model.trim="form.phone"
                  outlined
                  placeholder="Contoh: 0823-3414-8314"
                >
                  <template #prepend><q-icon name="phone" /></template>
                </q-input>
              </div>
              <div>
                <label for="email">Email</label>
                <q-input
                  id="email"
                  v-model.trim="form.email"
                  outlined
                  type="email"
                  placeholder="Contoh: halo@creative.com"
                  :rules="[
                    (value) => !value || /.+@.+\..+/.test(value) || 'Format email tidak valid',
                  ]"
                >
                  <template #prepend><q-icon name="mail" /></template>
                </q-input>
              </div>
              <div>
                <label for="instagram">URL Instagram</label>
                <q-input
                  id="instagram"
                  v-model.trim="form.instagram_url"
                  outlined
                  type="url"
                  placeholder="https://instagram.com/namabisnis"
                >
                  <template #prepend><q-icon name="photo_camera" /></template>
                </q-input>
              </div>
              <div class="field-full">
                <label for="address">Alamat</label>
                <q-input
                  id="address"
                  v-model.trim="form.address"
                  outlined
                  type="textarea"
                  autogrow
                  placeholder="Alamat toko, workshop, atau kantor"
                >
                  <template #prepend><q-icon name="location_on" /></template>
                </q-input>
              </div>
              <div class="field-full">
                <label for="business-hours">Jam operasional</label>
                <q-input
                  id="business-hours"
                  v-model.trim="form.business_hours"
                  outlined
                  placeholder="Contoh: Senin - Sabtu, 08.00 - 17.00 WIB"
                >
                  <template #prepend><q-icon name="schedule" /></template>
                </q-input>
              </div>
            </div>

            <div class="form-actions">
              <q-btn
                unelevated
                no-caps
                class="primary-action"
                icon="save"
                label="Simpan Kontak"
                type="submit"
                :loading="saving"
              />
            </div>
          </q-form>
        </q-card-section>
        <q-inner-loading :showing="loading" color="amber-8" />
      </q-card>
    </main>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { api } from '@/boot/axios'

function emptyForm() {
  return {
    whatsapp: '',
    phone: '',
    email: '',
    address: '',
    instagram_url: '',
    business_hours: '',
  }
}

const form = ref(emptyForm())
const loading = ref(false)
const saving = ref(false)
const error = ref('')

async function request(path, { body, ...config } = {}) {
  const response = await api.request({ url: path, data: body, ...config })
  return response.data
}

async function loadContact() {
  loading.value = true
  error.value = ''

  try {
    const contact = await request('/site-contact')
    form.value = { ...emptyForm(), ...contact }
  } catch (exception) {
    error.value = exception.message
  } finally {
    loading.value = false
  }
}

async function saveContact() {
  saving.value = true
  error.value = ''

  try {
    const contact = await request('/site-contact', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value),
    })
    form.value = { ...emptyForm(), ...contact }
  } catch (exception) {
    error.value = exception.message
  } finally {
    saving.value = false
  }
}

onMounted(loadContact)
</script>

<style scoped lang="scss">
.content-page {
  min-height: 100dvh;
  background: #f6f6f3;
  color: #202124;
}
.content-topbar {
  display: flex;
  height: 72px;
  align-items: center;
  gap: 34px;
  padding: 0 clamp(20px, 5vw, 76px);
  background: #17191c;
  color: #f8f8f5;
}
.brand-lockup {
  display: flex;
  align-items: center;
  gap: 10px;
  color: inherit;
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-decoration: none;
}
.brand-logo {
  width: 38px;
  height: 38px;
  object-fit: contain;
}
.brand-mark {
  position: relative;
  width: 26px;
  height: 26px;
  transform: rotate(45deg);
}
.brand-mark span {
  position: absolute;
  top: 3px;
  width: 16px;
  height: 16px;
  border: 3px solid #f4c442;
}
.brand-mark span:first-child {
  left: 1px;
  border-right: 0;
  border-bottom: 0;
}
.brand-mark span:last-child {
  right: 1px;
  border-top: 0;
  border-left: 0;
}
.content-nav {
  display: flex;
  gap: 20px;
  margin-right: auto;
}
.content-nav a {
  color: #bcbfc2;
  font-size: 0.88rem;
  text-decoration: none;
}
.content-nav a:hover,
.content-nav a.is-active {
  color: #f6c644;
}
.content-wrap {
  width: min(100% - 48px, 960px);
  margin: auto;
  padding: 48px 0;
}
.page-heading {
  margin-bottom: 28px;
}
.eyebrow {
  margin: 0 0 7px;
  color: #ba850e;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.14em;
}
.page-heading h1 {
  margin: 0 0 7px;
  font-size: clamp(1.8rem, 3vw, 2.35rem);
}
.page-heading p {
  margin: 0;
  color: #73757b;
}
.error-banner {
  margin-bottom: 18px;
  background: #ffebee;
  color: #b3261e;
}
.contact-card {
  position: relative;
  overflow: hidden;
  border-color: #e5e3dd;
  border-radius: 16px;
  background: #fff;
}
.card-heading {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 24px;
}
.heading-icon {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: 12px;
  background: #fff2cb;
  color: #a87708;
}
.card-heading h2 {
  margin: 0 0 4px;
  font-size: 1.1rem;
}
.card-heading p {
  margin: 0;
  color: #75777d;
  font-size: 0.86rem;
  line-height: 1.5;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px 16px;
}
.field-full {
  grid-column: 1 / -1;
}
label {
  display: block;
  margin: 14px 0 8px;
  font-weight: 700;
}
.form-actions {
  display: flex;
  justify-content: end;
  margin-top: 24px;
}
.primary-action {
  min-height: 42px;
  padding: 0 18px;
  border-radius: 8px;
  background: linear-gradient(135deg, #f5ce68, #d89d1e);
  color: #24201a;
  font-weight: 800;
}
@media (max-width: 700px) {
  .content-topbar {
    height: 63px;
    gap: 15px;
    padding: 0 16px;
  }
  .content-nav {
    display: none;
  }
  .content-topbar > .q-btn {
    margin-left: auto;
  }
  .content-wrap {
    width: min(100% - 30px, 960px);
    padding: 28px 0;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
  .field-full {
    grid-column: auto;
  }
  .form-actions .primary-action {
    width: 100%;
  }
}
</style>
