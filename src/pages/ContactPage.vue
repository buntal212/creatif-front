<template>
  <q-page class="contact-page">
    <header class="contact-topbar">
      <RouterLink class="brand-lockup" to="/">
        <img class="brand-logo" src="/images/logo-creative.png" alt="Logo Creative" />
        <span>CREATIVE</span>
      </RouterLink>
      <nav class="contact-nav" aria-label="Navigasi utama">
        <RouterLink to="/">Dashboard</RouterLink>
        <RouterLink to="/categories">Kategori</RouterLink>
        <RouterLink to="/products">Produk</RouterLink>
        <RouterLink class="is-active" to="/contact">Kontak</RouterLink>
        <RouterLink to="/social-media">Media Sosial</RouterLink>
        <RouterLink to="/gallery">Galeri Produksi</RouterLink>
        <RouterLink to="/users">Pengguna</RouterLink>
      </nav>
      <q-btn flat no-caps color="grey-4" icon="arrow_back" label="Dashboard" to="/" />
    </header>

    <main class="contact-content">
      <div class="page-heading">
        <div>
          <p class="eyebrow">PENGATURAN WEBSITE</p>
          <h1>Kelola Kontak</h1>
          <p>Tambahkan nama dan nomor HP yang akan ditampilkan di bagian kontak website.</p>
        </div>
        <q-btn
          unelevated
          no-caps
          class="primary-action"
          icon="person_add"
          label="Tambah Kontak"
          @click="openCreate"
        />
      </div>

      <q-banner v-if="error" rounded class="error-banner">
        <template #avatar><q-icon name="error_outline" /></template>
        {{ error }}
      </q-banner>

      <section class="contact-card" aria-label="Daftar kontak">
        <q-list v-if="rows.length" separator>
          <q-item v-for="item in rows" :key="item.id" class="contact-item">
            <q-item-section avatar
              ><q-avatar icon="person" color="amber-1" text-color="amber-10"
            /></q-item-section>
            <q-item-section>
              <q-item-label class="contact-name">{{ item.name }}</q-item-label>
              <q-item-label caption
                ><q-icon name="phone" size="16px" /> {{ item.phone }}</q-item-label
              >
            </q-item-section>
            <q-item-section side>
              <div class="row no-wrap">
                <q-btn
                  flat
                  round
                  dense
                  icon="edit"
                  color="amber-9"
                  aria-label="Ubah kontak"
                  @click="openEdit(item)"
                />
                <q-btn
                  flat
                  round
                  dense
                  icon="delete_outline"
                  color="negative"
                  aria-label="Hapus kontak"
                  @click="removeItem(item)"
                />
              </div>
            </q-item-section>
          </q-item>
        </q-list>
        <div v-else-if="!loading" class="empty-state">
          <q-icon name="contacts" size="42px" />
          <p>Belum ada kontak.</p>
          <span>Tambahkan kontak pertama untuk ditampilkan di website.</span>
        </div>
        <q-inner-loading :showing="loading" color="amber-8" />
      </section>
    </main>

    <q-dialog v-model="dialogOpen" persistent :maximized="$q.screen.lt.sm">
      <q-card class="form-dialog">
        <q-card-section class="dialog-heading">
          <div>
            <h2>{{ editing ? 'Ubah Kontak' : 'Tambah Kontak' }}</h2>
            <p>Isi dua informasi yang diperlukan pelanggan untuk menghubungi Anda.</p>
          </div>
          <q-btn flat round dense icon="close" v-close-popup aria-label="Tutup" />
        </q-card-section>
        <q-card-section>
          <q-form @submit="saveItem">
            <label for="contact-name">Nama</label>
            <q-input
              id="contact-name"
              v-model.trim="form.name"
              outlined
              autofocus
              placeholder="Contoh: Admin Creative"
              :rules="[(value) => !!value || 'Nama wajib diisi']"
            >
              <template #prepend><q-icon name="person" /></template>
            </q-input>
            <label for="contact-phone">Nomor HP</label>
            <q-input
              id="contact-phone"
              v-model.trim="form.phone"
              outlined
              placeholder="Contoh: 0823-3414-8314"
              :rules="[(value) => !!value || 'Nomor HP wajib diisi']"
            >
              <template #prepend><q-icon name="phone" /></template>
            </q-input>
            <div class="dialog-actions">
              <q-btn flat no-caps label="Batal" v-close-popup />
              <q-btn
                unelevated
                no-caps
                class="primary-action"
                type="submit"
                :loading="saving"
                :label="editing ? 'Simpan Perubahan' : 'Simpan Kontak'"
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

const emptyForm = () => ({ name: '', phone: '' })
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

async function loadContacts() {
  loading.value = true
  error.value = ''
  try {
    rows.value = await request('/site-contacts')
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
  form.value = { name: item.name, phone: item.phone }
  dialogOpen.value = true
}

async function saveItem() {
  saving.value = true
  error.value = ''
  try {
    const path = editing.value ? `/site-contacts/${editing.value.id}` : '/site-contacts'
    const method = editing.value ? 'PUT' : 'POST'
    await request(path, { method, body: form.value })
    dialogOpen.value = false
    await loadContacts()
  } catch (exception) {
    error.value = exception.message
  } finally {
    saving.value = false
  }
}

async function removeItem(item) {
  if (!window.confirm(`Hapus kontak “${item.name}”? Tindakan ini tidak dapat dibatalkan.`)) return
  error.value = ''
  try {
    await request(`/site-contacts/${item.id}`, { method: 'DELETE' })
    await loadContacts()
  } catch (exception) {
    error.value = exception.message
  }
}

onMounted(loadContacts)
</script>

<style scoped lang="scss">
.contact-page {
  min-height: 100dvh;
  background: #f6f6f3;
  color: #202124;
}
.contact-topbar {
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
.contact-nav {
  display: flex;
  gap: 20px;
  margin-right: auto;
}
.contact-nav a {
  color: #bcbfc2;
  font-size: 0.88rem;
  text-decoration: none;
}
.contact-nav a:hover,
.contact-nav a.is-active {
  color: #f6c644;
}
.contact-content {
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
.contact-card {
  position: relative;
  min-height: 220px;
  overflow: hidden;
  border: 1px solid #e5e3dd;
  border-radius: 16px;
  background: #fff;
}
.contact-item {
  min-height: 76px;
  padding: 14px 20px;
}
.contact-name {
  font-weight: 800;
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
  .contact-topbar {
    height: 63px;
    gap: 15px;
    padding: 0 16px;
  }
  .contact-nav {
    display: none;
  }
  .contact-topbar > .q-btn {
    margin-left: auto;
  }
  .contact-content {
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
