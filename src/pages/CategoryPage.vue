<template>
  <q-page class="catalog-page">
    <header class="catalog-topbar">
      <RouterLink class="brand-lockup" to="/">
        <div class="brand-mark" aria-hidden="true"><span></span><span></span></div>
        <span>CREATIVE</span>
      </RouterLink>
      <nav class="catalog-nav" aria-label="Navigasi utama">
        <RouterLink to="/">Dashboard</RouterLink>
        <RouterLink class="is-active" to="/categories">Kategori</RouterLink>
        <RouterLink to="/products">Produk</RouterLink>
      </nav>
      <q-btn flat no-caps color="grey-4" icon="arrow_back" label="Dashboard" to="/" />
    </header>

    <main class="catalog-content">
      <div class="page-heading">
        <div>
          <p class="eyebrow">KATALOG</p>
          <h1>Kategori Produk</h1>
          <p>Kelompokkan produk agar katalog lebih rapi dan mudah ditemukan.</p>
        </div>
        <q-btn
          unelevated
          no-caps
          class="primary-action"
          icon="add"
          label="Tambah Kategori"
          @click="openCreate"
        />
      </div>

      <q-banner v-if="error" rounded class="error-banner">
        <template #avatar><q-icon name="error_outline" /></template>
        {{ error }}
      </q-banner>

      <section class="category-list-card" aria-label="Daftar kategori">
        <div class="list-top">
          <q-input
            v-model="search"
            dense
            outlined
            placeholder="Cari kategori..."
            class="search-input"
          >
            <template #prepend><q-icon name="search" /></template>
          </q-input>
          <span class="record-count">{{ filteredCategories.length }} kategori</span>
        </div>

        <q-list v-if="filteredCategories.length" separator class="category-list">
          <q-item v-for="category in filteredCategories" :key="category.id" class="category-item">
            <q-item-section avatar top>
              <div class="category-icon"><q-icon name="category" size="20px" /></div>
            </q-item-section>
            <q-item-section>
              <q-item-label class="category-name">{{ category.name }}</q-item-label>
              <q-item-label caption class="category-description">
                {{ category.description || 'Belum ada deskripsi kategori.' }}
              </q-item-label>
              <q-item-label caption class="slug-text">/{{ category.slug }}</q-item-label>
            </q-item-section>
            <q-item-section side class="category-meta">
              <q-badge rounded color="amber-2" text-color="amber-10"
                >{{ category.products_count }} produk</q-badge
              >
              <div class="category-actions">
                <q-btn
                  flat
                  round
                  dense
                  icon="edit"
                  color="amber-9"
                  aria-label="Edit kategori"
                  @click="openEdit(category)"
                />
                <q-btn
                  flat
                  round
                  dense
                  icon="delete_outline"
                  color="negative"
                  aria-label="Hapus kategori"
                  @click="removeCategory(category)"
                />
              </div>
            </q-item-section>
          </q-item>
        </q-list>

        <div v-else-if="!loading" class="empty-list">
          <q-icon name="category" size="36px" />
          <p>{{ search ? 'Kategori tidak ditemukan.' : 'Belum ada kategori.' }}</p>
          <span>{{ search ? 'Coba kata kunci lain.' : 'Tambahkan kategori pertama Anda.' }}</span>
        </div>
        <q-inner-loading :showing="loading" color="amber-8" />
      </section>
    </main>

    <q-dialog v-model="dialogOpen" persistent>
      <q-card class="form-dialog">
        <q-card-section class="dialog-heading">
          <div>
            <h2>{{ editing ? 'Ubah Kategori' : 'Tambah Kategori' }}</h2>
            <p>Nama kategori akan digunakan untuk mengelompokkan produk.</p>
          </div>
          <q-btn flat round dense icon="close" v-close-popup aria-label="Tutup" />
        </q-card-section>
        <q-card-section>
          <q-form @submit="saveCategory">
            <label for="category-name">Nama Kategori</label>
            <q-input
              id="category-name"
              v-model.trim="form.name"
              outlined
              autofocus
              placeholder="Contoh: Pakaian Pria"
              :rules="[(value) => !!value || 'Nama kategori wajib diisi']"
            />
            <label for="category-description">Deskripsi <span>opsional</span></label>
            <q-input
              id="category-description"
              v-model.trim="form.description"
              outlined
              type="textarea"
              autogrow
              placeholder="Deskripsi singkat kategori..."
            />
            <div class="dialog-actions">
              <q-btn flat no-caps label="Batal" v-close-popup />
              <q-btn
                unelevated
                no-caps
                class="primary-action"
                type="submit"
                :loading="saving"
                :label="editing ? 'Simpan Perubahan' : 'Simpan Kategori'"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

const apiBaseUrl = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')
const rows = ref([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const search = ref('')
const dialogOpen = ref(false)
const editing = ref(null)
const form = ref({ name: '', description: '' })

const filteredCategories = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  if (!keyword) return rows.value
  return rows.value.filter((category) =>
    [category.name, category.description, category.slug].some((value) =>
      String(value || '')
        .toLowerCase()
        .includes(keyword),
    ),
  )
})

function authHeaders() {
  return {
    Accept: 'application/json',
    Authorization: `Bearer ${localStorage.getItem('creative_auth_token')}`,
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...options.headers },
  })
  const data = response.status === 204 ? null : await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || 'Permintaan tidak dapat diproses.')
  return data
}

async function loadCategories() {
  loading.value = true
  error.value = ''
  try {
    rows.value = await request('/categories')
  } catch (exception) {
    error.value = exception.message
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = null
  form.value = { name: '', description: '' }
  dialogOpen.value = true
}

function openEdit(category) {
  editing.value = category
  form.value = { name: category.name, description: category.description || '' }
  dialogOpen.value = true
}

async function saveCategory() {
  saving.value = true
  try {
    const path = editing.value ? `/categories/${editing.value.id}` : '/categories'
    await request(path, {
      method: editing.value ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value),
    })
    dialogOpen.value = false
    await loadCategories()
  } catch (exception) {
    error.value = exception.message
  } finally {
    saving.value = false
  }
}

async function removeCategory(category) {
  if (!window.confirm(`Hapus kategori ${category.name}? Produk di dalamnya tidak akan dihapus.`))
    return
  try {
    await request(`/categories/${category.id}`, { method: 'DELETE' })
    await loadCategories()
  } catch (exception) {
    error.value = exception.message
  }
}

onMounted(loadCategories)
</script>

<style scoped lang="scss">
.catalog-page {
  min-height: 100dvh;
  background: #f6f6f3;
  color: #202124;
}
.catalog-topbar {
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
  border-left: 0;
  border-top: 0;
}
.catalog-nav {
  display: flex;
  gap: 21px;
  margin-right: auto;
}
.catalog-nav a {
  color: #bcbfc2;
  font-size: 0.88rem;
  text-decoration: none;
}
.catalog-nav a:hover,
.catalog-nav a.is-active {
  color: #f6c644;
}
.catalog-content {
  width: min(100% - 40px, 1180px);
  margin: 0 auto;
  padding: 44px 0;
}
.page-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 29px;
}
.eyebrow {
  margin: 0 0 8px;
  color: #a87708;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.12em;
}
.page-heading h1 {
  margin: 0 0 7px;
  font-size: clamp(1.65rem, 3vw, 2.2rem);
}
.page-heading p:not(.eyebrow) {
  margin: 0;
  color: #72747a;
}
.primary-action {
  height: 44px;
  border-radius: 10px;
  background: #e6af27;
  color: #201806;
  font-weight: 700;
}
.error-banner {
  margin-bottom: 18px;
  border: 1px solid #f3c1c1;
  background: #fff0f0;
  color: #a12d2d;
}
.category-list-card {
  position: relative;
  overflow: hidden;
  min-height: 156px;
  border: 1px solid #ebe9e4;
  border-radius: 15px;
  background: #fff;
  box-shadow: 0 7px 21px rgba(46, 39, 19, 0.04);
}
.list-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 18px 19px;
  border-bottom: 1px solid #ebe9e4;
}
.search-input {
  width: min(100%, 310px);
}
.record-count {
  color: #81838a;
  font-size: 0.82rem;
}
.category-item {
  min-height: 92px;
  padding: 15px 19px;
}
.category-icon {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 11px;
  background: #fff4d4;
  color: #a87708;
}
.category-name {
  color: #292a2d;
  font-size: 0.98rem;
  font-weight: 750;
}
.category-description {
  max-width: 600px;
  margin-top: 3px;
  color: #73757b;
}
.slug-text {
  display: block;
  margin-top: 3px;
  color: #9b9da2;
  font-size: 0.76rem;
}
.category-meta {
  min-width: 128px;
  align-items: flex-end;
  gap: 7px;
}
.category-actions {
  display: flex;
  gap: 2px;
}
.empty-list {
  display: grid;
  min-height: 220px;
  place-content: center;
  justify-items: center;
  padding: 28px;
  color: #a8aaae;
  text-align: center;
}
.empty-list p {
  margin: 11px 0 3px;
  color: #55575c;
  font-weight: 700;
}
.empty-list span {
  font-size: 0.88rem;
}
.form-dialog {
  width: min(94vw, 520px);
  border-radius: 16px;
}
.dialog-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
}
.dialog-heading h2 {
  margin: 0 0 5px;
  font-size: 1.22rem;
}
.dialog-heading p {
  margin: 0;
  color: #75777d;
  font-size: 0.88rem;
}
.form-dialog label {
  display: block;
  margin: 15px 0 8px;
  font-weight: 700;
}
.form-dialog label span {
  color: #8c8e93;
  font-weight: 400;
}
.dialog-actions {
  display: flex;
  justify-content: end;
  gap: 10px;
  margin-top: 23px;
}
@media (max-width: 700px) {
  .catalog-topbar {
    height: 63px;
    gap: 15px;
    padding: 0 16px;
  }
  .catalog-nav {
    display: none;
  }
  .catalog-topbar > .q-btn {
    margin-left: auto;
  }
  .catalog-content {
    width: min(100% - 30px, 1180px);
    padding: 28px 0;
  }
  .page-heading,
  .list-top {
    align-items: stretch;
    flex-direction: column;
  }
  .primary-action,
  .search-input {
    width: 100%;
  }
  .category-item {
    padding: 14px;
  }
  .category-item .q-item__section--avatar {
    min-width: 48px;
  }
  .category-meta {
    min-width: auto;
  }
  .category-description {
    max-width: 160px;
  }
}
</style>
