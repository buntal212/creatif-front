<template>
  <q-page class="social-page">
    <header class="social-topbar">
      <RouterLink class="brand-lockup" to="/">
        <img class="brand-logo" src="/images/logo-creative.png" alt="Logo Creative" />
        <span>CREATIVE</span>
      </RouterLink>
      <nav class="social-nav" aria-label="Navigasi utama">
        <RouterLink to="/">Dashboard</RouterLink>
        <RouterLink to="/categories">Kategori</RouterLink>
        <RouterLink to="/products">Produk</RouterLink>
        <RouterLink to="/contact">Kontak</RouterLink>
        <RouterLink class="is-active" to="/social-media">Media Sosial</RouterLink>
        <RouterLink to="/gallery">Galeri Produksi</RouterLink>
        <RouterLink to="/users">Pengguna</RouterLink>
      </nav>
      <q-btn flat no-caps color="grey-4" icon="arrow_back" label="Dashboard" to="/" />
    </header>

    <main class="social-content">
      <div class="page-heading">
        <div>
          <p class="eyebrow">PENGATURAN WEBSITE</p>
          <h1>Media Sosial</h1>
          <p>Kelola tautan media sosial yang ditampilkan pada halaman website.</p>
        </div>
        <q-btn
          unelevated
          no-caps
          class="primary-action"
          icon="add_link"
          label="Tambah Media Sosial"
          @click="openCreate"
        />
      </div>

      <q-banner v-if="error" rounded class="error-banner">
        <template #avatar><q-icon name="error_outline" /></template>
        {{ error }}
      </q-banner>

      <section class="social-card" aria-label="Daftar media sosial">
        <q-list v-if="rows.length" separator>
          <q-item v-for="item in rows" :key="item.id" class="social-item">
            <q-item-section avatar
              ><q-avatar icon="share" color="amber-1" text-color="amber-10"
            /></q-item-section>
            <q-item-section>
              <q-item-label class="social-name">{{ item.name }}</q-item-label>
              <q-item-label caption class="social-url">{{ item.url }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="row no-wrap">
                <q-btn
                  flat
                  round
                  dense
                  icon="edit"
                  color="amber-9"
                  aria-label="Ubah media sosial"
                  @click="openEdit(item)"
                />
                <q-btn
                  flat
                  round
                  dense
                  icon="delete_outline"
                  color="negative"
                  aria-label="Hapus media sosial"
                  @click="removeItem(item)"
                />
              </div>
            </q-item-section>
          </q-item>
        </q-list>
        <div v-else-if="!loading" class="empty-state">
          <q-icon name="share" size="42px" />
          <p>Belum ada media sosial.</p>
          <span>Tambahkan tautan pertama untuk ditampilkan di website.</span>
        </div>
        <q-inner-loading :showing="loading" color="amber-8" />
      </section>
    </main>

    <q-dialog v-model="dialogOpen" persistent :maximized="$q.screen.lt.sm">
      <q-card class="form-dialog">
        <q-card-section class="dialog-heading">
          <div>
            <h2>{{ editing ? 'Ubah Media Sosial' : 'Tambah Media Sosial' }}</h2>
            <p>Masukkan nama media sosial dan tautan halaman atau profilnya.</p>
          </div>
          <q-btn flat round dense icon="close" v-close-popup aria-label="Tutup" />
        </q-card-section>
        <q-card-section>
          <q-form @submit="saveItem">
            <label for="social-name">Nama Medsos</label>
            <q-input
              id="social-name"
              v-model.trim="form.name"
              outlined
              autofocus
              placeholder="Contoh: Instagram"
              :rules="[(value) => !!value || 'Nama medsos wajib diisi']"
            >
              <template #prepend><q-icon name="share" /></template>
            </q-input>
            <label for="social-url">URL Medsos</label>
            <q-input
              id="social-url"
              v-model.trim="form.url"
              outlined
              type="url"
              placeholder="Contoh: https://instagram.com/creative"
              :rules="[(value) => !!value || 'URL medsos wajib diisi']"
            >
              <template #prepend><q-icon name="link" /></template>
            </q-input>
            <div class="dialog-actions">
              <q-btn flat no-caps label="Batal" v-close-popup />
              <q-btn
                unelevated
                no-caps
                class="primary-action"
                type="submit"
                :loading="saving"
                :label="editing ? 'Simpan Perubahan' : 'Simpan Medsos'"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { api } from '@/boot/axios'

const emptyForm = () => ({ name: '', url: '' })
const rows = ref([])
const form = ref(emptyForm())
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const dialogOpen = ref(false)
const editing = ref(null)

async function request(path, { body, ...config } = {}) {
  const response = await api.request({ url: path, data: body, ...config })
  return response.data
}

async function loadSocialMedia() {
  loading.value = true
  error.value = ''
  try {
    rows.value = await request('/social-media')
  } catch (exception) {
    error.value = exception.message
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = null
  form.value = emptyForm()
  dialogOpen.value = true
}

function openEdit(item) {
  editing.value = item
  form.value = { name: item.name, url: item.url }
  dialogOpen.value = true
}

async function saveItem() {
  saving.value = true
  error.value = ''
  try {
    const path = editing.value ? `/social-media/${editing.value.id}` : '/social-media'
    await request(path, { method: editing.value ? 'PUT' : 'POST', body: form.value })
    dialogOpen.value = false
    await loadSocialMedia()
  } catch (exception) {
    error.value = exception.message
  } finally {
    saving.value = false
  }
}

async function removeItem(item) {
  if (!window.confirm(`Hapus tautan ${item.name}? Tindakan ini tidak dapat dibatalkan.`)) return
  error.value = ''
  try {
    await request(`/social-media/${item.id}`, { method: 'DELETE' })
    await loadSocialMedia()
  } catch (exception) {
    error.value = exception.message
  }
}

onMounted(loadSocialMedia)
</script>

<style scoped lang="scss">
.social-page {
  min-height: 100dvh;
  background: #f6f6f3;
  color: #202124;
}
.social-topbar {
  display: flex;
  height: 72px;
  align-items: center;
  gap: 28px;
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
.social-nav {
  display: flex;
  gap: 16px;
  margin-right: auto;
}
.social-nav a {
  color: #bcbfc2;
  font-size: 0.84rem;
  text-decoration: none;
  white-space: nowrap;
}
.social-nav a:hover,
.social-nav a.is-active {
  color: #f6c644;
}
.social-content {
  width: min(100% - 48px, 960px);
  margin: auto;
  padding: 48px 0;
}
.page-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 20px;
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
.primary-action {
  min-height: 42px;
  padding: 0 18px;
  border-radius: 8px;
  background: linear-gradient(135deg, #f5ce68, #d89d1e);
  color: #24201a;
  font-weight: 800;
}
.error-banner {
  margin-bottom: 18px;
  background: #ffebee;
  color: #b3261e;
}
.social-card {
  position: relative;
  min-height: 220px;
  overflow: hidden;
  border: 1px solid #e5e3dd;
  border-radius: 16px;
  background: #fff;
}
.social-item {
  min-height: 76px;
  padding: 14px 20px;
}
.social-name {
  font-weight: 800;
}
.social-url {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.empty-state {
  display: grid;
  min-height: 220px;
  place-content: center;
  justify-items: center;
  color: #83858a;
  text-align: center;
}
.empty-state p {
  margin: 9px 0 4px;
  color: #45474c;
  font-weight: 800;
}
.form-dialog {
  width: min(100vw - 32px, 500px);
  border-radius: 16px;
}
.dialog-heading {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 16px;
}
.dialog-heading h2 {
  margin: 0 0 5px;
  font-size: 1.2rem;
}
.dialog-heading p {
  margin: 0;
  color: #73757b;
  font-size: 0.9rem;
}
label {
  display: block;
  margin: 18px 0 8px;
  font-weight: 700;
}
.dialog-actions {
  display: flex;
  justify-content: end;
  gap: 10px;
  margin-top: 26px;
}
@media (max-width: 700px) {
  .social-topbar {
    height: 63px;
    gap: 15px;
    padding: 0 16px;
  }
  .social-nav {
    display: none;
  }
  .social-topbar > .q-btn {
    margin-left: auto;
  }
  .social-content {
    width: min(100% - 30px, 960px);
    padding: 28px 0;
  }
  .page-heading {
    align-items: stretch;
    flex-direction: column;
  }
  .page-heading .primary-action {
    width: 100%;
  }
}
</style>
