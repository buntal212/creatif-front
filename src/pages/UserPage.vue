<template>
  <q-page class="user-page">
    <header class="user-topbar">
      <RouterLink class="brand-lockup" to="/" aria-label="Dashboard Creative">
        <img
          class="brand-logo"
          src="/images/logo-creative.png"
          alt="Logo Creative"
        />
        <span>CREATIVE</span>
      </RouterLink>
      <nav class="user-nav" aria-label="Navigasi utama">
        <RouterLink to="/">Dashboard</RouterLink>
        <RouterLink to="/categories">Kategori</RouterLink>
        <RouterLink to="/products">Produk</RouterLink>
        <RouterLink to="/contact">Kontak</RouterLink>
        <RouterLink to="/gallery">Galeri Produksi</RouterLink>
        <RouterLink class="is-active" to="/users">Pengguna</RouterLink>
      </nav>
      <q-btn
        flat
        no-caps
        color="grey-4"
        icon="arrow_back"
        label="Dashboard"
        to="/"
      />
    </header>

    <main class="user-content">
      <div class="page-heading">
        <div>
          <p class="eyebrow">AKSES ADMIN</p>
          <h1>Kelola Pengguna</h1>
          <p
            >Atur akun yang dapat masuk dan mengelola konten website
            Creative.</p
          >
        </div>
        <q-btn
          unelevated
          no-caps
          class="primary-action"
          icon="person_add"
          label="Tambah Pengguna"
          @click="openCreate"
        />
      </div>

      <q-banner v-if="error" rounded class="error-banner">
        <template #avatar><q-icon name="error_outline" /></template>
        {{ error }}
      </q-banner>

      <section class="user-list-card" aria-label="Daftar pengguna">
        <div class="list-top">
          <q-input
            v-model="search"
            dense
            outlined
            placeholder="Cari nama, username, atau email..."
            class="search-input"
          >
            <template #prepend><q-icon name="search" /></template>
          </q-input>
          <span class="record-count">{{ filteredUsers.length }} pengguna</span>
        </div>

        <q-list v-if="filteredUsers.length" separator class="user-list">
          <q-item
            v-for="account in filteredUsers"
            :key="account.id"
            class="user-item"
          >
            <q-item-section avatar top>
              <q-avatar color="amber-2" text-color="amber-10" size="46px">
                {{ initials(account) }}
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="user-name">
                {{ account.name }}
                <q-badge
                  v-if="isCurrentUser(account)"
                  color="blue-1"
                  text-color="blue-9"
                  label="Anda"
                />
              </q-item-label>
              <q-item-label caption class="user-details"
                >@{{ account.username }} · {{ account.email }}</q-item-label
              >
              <q-item-label caption class="created-at"
                >Ditambahkan {{ formatDate(account.created_at) }}</q-item-label
              >
            </q-item-section>
            <q-item-section side class="user-actions">
              <q-btn
                flat
                round
                dense
                icon="edit"
                color="amber-9"
                aria-label="Edit pengguna"
                @click="openEdit(account)"
              />
              <q-btn
                flat
                round
                dense
                icon="delete_outline"
                color="negative"
                :disable="isCurrentUser(account)"
                aria-label="Hapus pengguna"
                @click="confirmDelete(account)"
              />
            </q-item-section>
          </q-item>
        </q-list>

        <div v-else-if="!loading" class="empty-list">
          <q-icon name="manage_accounts" size="40px" />
          <p>{{
            search ? 'Pengguna tidak ditemukan.' : 'Belum ada pengguna.'
          }}</p>
          <span>{{
            search
              ? 'Coba kata kunci lain.'
              : 'Tambahkan akun pertama untuk mulai berkolaborasi.'
          }}</span>
        </div>
        <q-inner-loading :showing="loading" color="amber-8" />
      </section>
    </main>

    <q-dialog v-model="dialogOpen" persistent :maximized="$q.screen.lt.sm">
      <q-card class="form-dialog">
        <q-card-section class="dialog-heading">
          <div>
            <h2>{{ editing ? 'Ubah Pengguna' : 'Tambah Pengguna' }}</h2>
            <p>
              {{
                editing
                  ? 'Kosongkan kata sandi bila tidak ingin mengubahnya.'
                  : 'Akun baru dapat langsung digunakan untuk masuk.'
              }}
            </p>
          </div>
          <q-btn
            flat
            round
            dense
            icon="close"
            v-close-popup
            aria-label="Tutup"
          />
        </q-card-section>
        <q-card-section>
          <q-form @submit="saveUser">
            <div class="form-grid">
              <div>
                <label for="user-name">Nama lengkap</label>
                <q-input
                  id="user-name"
                  v-model.trim="form.name"
                  outlined
                  autofocus
                  placeholder="Contoh: Andi Pratama"
                  :rules="[value => !!value || 'Nama wajib diisi']"
                />
              </div>
              <div>
                <label for="user-username">Username</label>
                <q-input
                  id="user-username"
                  v-model.trim="form.username"
                  outlined
                  placeholder="Contoh: andi.pratama"
                  :rules="[value => !!value || 'Username wajib diisi']"
                />
              </div>
              <div class="field-full">
                <label for="user-email">Email</label>
                <q-input
                  id="user-email"
                  v-model.trim="form.email"
                  outlined
                  type="email"
                  placeholder="Contoh: andi@creative.com"
                  :rules="[
                    value =>
                      /.+@.+\..+/.test(value) || 'Format email tidak valid'
                  ]"
                />
              </div>
              <div>
                <label for="user-password"
                  >Kata sandi <span v-if="editing">opsional</span></label
                >
                <q-input
                  id="user-password"
                  v-model="form.password"
                  outlined
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Minimal 8 karakter"
                  :rules="[
                    value => editing || !!value || 'Kata sandi wajib diisi',
                    value => !value || value.length >= 8 || 'Minimal 8 karakter'
                  ]"
                >
                  <template #append
                    ><q-icon
                      :name="showPassword ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="showPassword = !showPassword"
                  /></template>
                </q-input>
              </div>
              <div>
                <label for="user-password-confirmation"
                  >Konfirmasi kata sandi</label
                >
                <q-input
                  id="user-password-confirmation"
                  v-model="form.password_confirmation"
                  outlined
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Ulangi kata sandi"
                  :rules="[
                    value =>
                      !form.password ||
                      value === form.password ||
                      'Konfirmasi kata sandi belum sama'
                  ]"
                />
              </div>
            </div>
            <div class="dialog-actions">
              <q-btn flat no-caps label="Batal" v-close-popup />
              <q-btn
                unelevated
                no-caps
                class="primary-action"
                type="submit"
                :loading="saving"
                :label="editing ? 'Simpan Perubahan' : 'Simpan Pengguna'"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="deleteDialogOpen">
      <q-card class="delete-dialog">
        <q-card-section class="dialog-heading">
          <div>
            <h2>Hapus pengguna?</h2>
            <p>
              Akun <strong>{{ deletingUser?.name }}</strong> tidak dapat
              dipulihkan setelah dihapus.
            </p>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps label="Batal" v-close-popup />
          <q-btn
            unelevated
            no-caps
            color="negative"
            label="Hapus"
            :loading="deleting"
            @click="removeUser"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { api } from '@/boot/axios'

function emptyForm() {
  return {
    name: '',
    username: '',
    email: '',
    password: '',
    password_confirmation: ''
  }
}

function currentUserId() {
  try {
    return JSON.parse(localStorage.getItem('creative_auth_user'))?.id
  } catch {
    return null
  }
}

const users = ref([])
const search = ref('')
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const error = ref('')
const dialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const editing = ref(false)
const showPassword = ref(false)
const form = ref(emptyForm())
const selectedUserId = ref(null)
const deletingUser = ref(null)
const signedInUserId = currentUserId()

const filteredUsers = computed(() => {
  const query = search.value.trim().toLowerCase()

  if (!query) return users.value

  return users.value.filter(account =>
    [account.name, account.username, account.email].some(value =>
      String(value || '')
        .toLowerCase()
        .includes(query)
    )
  )
})

function initials(account) {
  return String(account.name || account.username || 'A')
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function isCurrentUser(account) {
  return Number(account.id) === Number(signedInUserId)
}

function formatDate(value) {
  if (!value) return 'tanggal tidak diketahui'

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(value))
}

async function loadUsers() {
  loading.value = true
  error.value = ''

  try {
    const response = await api.get('/users')
    users.value = response.data
  } catch (exception) {
    error.value = exception.message
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = false
  form.value = emptyForm()
  showPassword.value = false
  dialogOpen.value = true
}

function openEdit(account) {
  editing.value = true
  selectedUserId.value = account.id
  form.value = {
    name: account.name,
    username: account.username,
    email: account.email,
    password: '',
    password_confirmation: ''
  }
  showPassword.value = false
  dialogOpen.value = true
}

async function saveUser() {
  saving.value = true
  error.value = ''

  try {
    const response = editing.value
      ? await api.put(`/users/${selectedUserId.value}`, form.value)
      : await api.post('/users', form.value)

    const user = response.data
    users.value = editing.value
      ? users.value.map(account => (account.id === user.id ? user : account))
      : [user, ...users.value]
    dialogOpen.value = false
  } catch (exception) {
    error.value = exception.message
  } finally {
    saving.value = false
  }
}

function confirmDelete(account) {
  deletingUser.value = account
  deleteDialogOpen.value = true
}

async function removeUser() {
  if (!deletingUser.value) return

  deleting.value = true
  error.value = ''

  try {
    await api.delete(`/users/${deletingUser.value.id}`)
    users.value = users.value.filter(
      account => account.id !== deletingUser.value.id
    )
    deleteDialogOpen.value = false
    deletingUser.value = null
  } catch (exception) {
    error.value = exception.message
  } finally {
    deleting.value = false
  }
}

onMounted(loadUsers)
</script>

<style scoped lang="scss">
.user-page {
  min-height: 100dvh;
  background: #f6f6f3;
  color: #202124;
}
.user-topbar {
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
  gap: 9px;
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
.user-nav {
  display: flex;
  gap: 20px;
  margin-right: auto;
}
.user-nav a {
  color: #bcbfc2;
  font-size: 0.88rem;
  text-decoration: none;
}
.user-nav a:hover,
.user-nav a.is-active {
  color: #f6c644;
}
.user-content {
  width: min(100% - 48px, 1080px);
  margin: auto;
  padding: 48px 0;
}
.page-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
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
.user-list-card {
  position: relative;
  overflow: hidden;
  border: 1px solid #e5e3dd;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 7px 21px rgba(46, 39, 19, 0.04);
}
.list-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 18px 22px;
  border-bottom: 1px solid #eeeae3;
}
.search-input {
  width: min(100%, 370px);
}
.record-count {
  color: #74767b;
  font-size: 0.84rem;
  white-space: nowrap;
}
.user-item {
  min-height: 86px;
  padding: 17px 22px;
}
.user-name {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
  color: #26282c;
  font-size: 0.96rem;
  font-weight: 750;
}
.user-details {
  color: #666a70;
  font-size: 0.84rem;
}
.created-at {
  margin-top: 3px;
  color: #9a9ca0;
  font-size: 0.75rem;
}
.user-actions {
  flex-direction: row;
  gap: 2px;
}
.empty-list {
  display: grid;
  min-height: 300px;
  place-content: center;
  justify-items: center;
  padding: 30px;
  color: #9a8b68;
  text-align: center;
}
.empty-list p {
  margin: 12px 0 5px;
  color: #484a4e;
  font-weight: 700;
}
.empty-list span {
  color: #808287;
  font-size: 0.86rem;
}
.form-dialog {
  width: min(100vw - 32px, 650px);
  border-radius: 16px;
}
.dialog-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 24px 24px 4px;
}
.dialog-heading h2 {
  margin: 0 0 5px;
  font-size: 1.2rem;
}
.dialog-heading p {
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
label span {
  color: #87898e;
  font-weight: 500;
}
.dialog-actions {
  display: flex;
  justify-content: end;
  gap: 8px;
  margin-top: 24px;
}
.delete-dialog {
  width: min(100vw - 32px, 440px);
  border-radius: 14px;
}
@media (max-width: 800px) {
  .user-nav {
    display: none;
  }
  .user-topbar > .q-btn {
    margin-left: auto;
  }
}
@media (max-width: 600px) {
  .user-topbar {
    height: 63px;
    gap: 15px;
    padding: 0 16px;
  }
  .brand-lockup {
    font-size: 0.92rem;
  }
  .brand-logo {
    width: 34px;
    height: 34px;
  }
  .user-content {
    width: min(100% - 30px, 1080px);
    padding: 28px 0;
  }
  .page-heading {
    align-items: stretch;
    flex-direction: column;
  }
  .page-heading .primary-action {
    width: 100%;
  }
  .list-top {
    align-items: stretch;
    flex-direction: column;
    padding: 15px;
  }
  .search-input {
    width: 100%;
  }
  .record-count {
    text-align: right;
  }
  .user-item {
    padding: 15px;
  }
  .user-actions {
    flex-direction: row;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
  .field-full {
    grid-column: auto;
  }
  .dialog-actions .primary-action {
    flex: 1;
  }
}
</style>
