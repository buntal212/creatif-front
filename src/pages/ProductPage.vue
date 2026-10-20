<template>
  <q-page class="catalog-page">
    <header class="catalog-topbar">
      <RouterLink class="brand-lockup" to="/">
        <div class="brand-mark" aria-hidden="true"><span></span><span></span></div>
        <span>CREATIVE</span>
      </RouterLink>
      <nav class="catalog-nav" aria-label="Navigasi utama">
        <RouterLink to="/">Dashboard</RouterLink>
        <RouterLink to="/categories">Kategori</RouterLink>
        <RouterLink class="is-active" to="/products">Produk</RouterLink>
      </nav>
      <q-btn flat no-caps color="grey-4" icon="arrow_back" label="Dashboard" to="/" />
    </header>

    <main class="catalog-content">
      <div class="page-heading">
        <div>
          <p class="eyebrow">KATALOG</p>
          <h1>Produk</h1>
          <p>Kelola informasi, foto, stok, dan status semua produk Anda.</p>
        </div>
        <q-btn
          unelevated
          no-caps
          class="primary-action"
          icon="add"
          label="Tambah Produk"
          @click="openCreate"
        />
      </div>

      <q-banner v-if="error" rounded class="error-banner">
        <template #avatar><q-icon name="error_outline" /></template>
        {{ error }}
      </q-banner>

      <section class="product-list-card" aria-label="Daftar produk">
        <div class="list-top">
          <q-input
            v-model="search"
            dense
            outlined
            placeholder="Cari nama atau kode produk..."
            class="search-input"
            @keyup.enter="loadProducts"
          >
            <template #prepend><q-icon name="search" /></template>
            <template #append
              ><q-btn flat round dense icon="search" aria-label="Cari" @click="loadProducts"
            /></template>
          </q-input>
          <q-select
            v-model="categoryFilter"
            dense
            outlined
            clearable
            emit-value
            map-options
            :options="categories"
            option-label="name"
            option-value="id"
            label="Semua kategori"
            class="category-filter"
            @update:model-value="loadProducts"
          />
        </div>

        <q-list v-if="rows.length" separator class="product-list">
          <q-item v-for="product in rows" :key="product.id" class="product-item">
            <q-item-section avatar top>
              <div class="product-picture">
                <img
                  v-if="product.thumbnail?.url"
                  :src="product.thumbnail.url"
                  :alt="product.thumbnail.alt_text || product.name"
                />
                <q-icon v-else name="image" size="25px" />
              </div>
            </q-item-section>

            <q-item-section>
              <q-item-label class="product-name">{{ product.name }}</q-item-label>
              <q-item-label caption class="product-description">{{
                product.description || 'Belum ada deskripsi produk.'
              }}</q-item-label>
              <div class="product-details">
                <span>{{ product.category?.name || 'Tanpa kategori' }}</span>
                <span>{{ product.sku }}</span>
                <span>{{ formatPrice(product.price) }}</span>
              </div>
            </q-item-section>

            <q-item-section side class="product-meta">
              <q-badge
                :color="product.status === 'active' ? 'green-1' : 'grey-3'"
                :text-color="product.status === 'active' ? 'green-9' : 'grey-8'"
              >
                {{ product.status === 'active' ? 'Aktif' : 'Draf' }}
              </q-badge>
              <span :class="product.stock > 0 ? 'stock-ok' : 'stock-empty'"
                >{{ product.stock }} stok</span
              >
              <div class="product-actions">
                <q-btn
                  flat
                  round
                  dense
                  icon="edit"
                  color="amber-9"
                  aria-label="Edit produk"
                  @click="openEdit(product)"
                />
                <q-btn
                  flat
                  round
                  dense
                  icon="delete_outline"
                  color="negative"
                  aria-label="Hapus produk"
                  @click="removeProduct(product)"
                />
              </div>
            </q-item-section>
          </q-item>
        </q-list>

        <div v-else-if="!loading" class="empty-list">
          <q-icon name="inventory_2" size="36px" />
          <p>Belum ada produk.</p>
          <span>Tambahkan produk pertama Anda untuk mulai mengisi katalog.</span>
        </div>
        <q-inner-loading :showing="loading" color="amber-8" />
      </section>
    </main>

    <q-dialog v-model="dialogOpen" persistent :maximized="$q.screen.lt.sm">
      <q-card class="form-dialog">
        <q-card-section class="dialog-heading">
          <div>
            <h2>{{ editing ? 'Ubah Produk' : 'Tambah Produk' }}</h2>
            <p>Kode produk, slug, dan nama file foto dibuat otomatis agar rapi untuk SEO.</p>
          </div>
          <q-btn flat round dense icon="close" v-close-popup aria-label="Tutup" />
        </q-card-section>
        <q-card-section>
          <q-form @submit="saveProduct">
            <div class="form-grid">
              <div class="field-full">
                <label for="product-name">Nama Produk</label>
                <q-input
                  id="product-name"
                  v-model.trim="form.name"
                  outlined
                  autofocus
                  placeholder="Contoh: Kaos Premium"
                  :rules="[(value) => !!value || 'Nama produk wajib diisi']"
                />
                <p class="field-help">
                  Nama ini otomatis menjadi slug URL yang mudah dibaca, misalnya
                  <b>/produk/kaos-premium</b>.
                </p>
              </div>
              <div>
                <label for="product-category">Kategori</label>
                <q-select
                  id="product-category"
                  v-model="form.category_id"
                  outlined
                  clearable
                  emit-value
                  map-options
                  :options="categories"
                  option-label="name"
                  option-value="id"
                  placeholder="Pilih kategori"
                />
              </div>
              <div>
                <label for="product-price">Harga</label>
                <q-input
                  id="product-price"
                  :model-value="priceInput"
                  outlined
                  prefix="Rp"
                  inputmode="numeric"
                  placeholder="0"
                  :rules="[(value) => value !== '' || 'Harga wajib diisi']"
                  @update:model-value="updatePrice"
                />
              </div>
              <div>
                <label for="product-stock">Stok</label>
                <q-input
                  id="product-stock"
                  v-model.number="form.stock"
                  outlined
                  type="number"
                  min="0"
                  :rules="[
                    (value) =>
                      (Number.isInteger(Number(value)) && Number(value) >= 0) || 'Stok tidak valid',
                  ]"
                />
              </div>
              <div>
                <label for="product-status">Status</label>
                <q-select
                  id="product-status"
                  v-model="form.status"
                  outlined
                  emit-value
                  map-options
                  :options="statusOptions"
                  option-label="label"
                  option-value="value"
                />
              </div>
              <div class="field-full">
                <label for="product-description">Deskripsi <span>opsional</span></label>
                <q-input
                  id="product-description"
                  v-model.trim="form.description"
                  outlined
                  type="textarea"
                  autogrow
                  placeholder="Deskripsi singkat produk..."
                />
              </div>
              <div class="field-full">
                <label for="product-images"
                  >Foto Produk <span>maks. 8 foto, JPG/PNG/WebP, masing-masing 5 MB</span></label
                >
                <q-file
                  id="product-images"
                  v-model="newImages"
                  outlined
                  multiple
                  append
                  use-chips
                  accept="image/jpeg,image/png,image/webp"
                  max-files="8"
                  label="Pilih foto produk, lalu pilih lagi untuk menambahkan"
                  @rejected="showImageRejected"
                />
                <p class="field-help">
                  Foto pertama otomatis menjadi thumbnail. Nama file dibuat dari nama produk agar
                  ramah SEO.
                </p>
              </div>
            </div>

            <section v-if="editing?.images?.length" class="image-manager">
              <div class="image-manager-heading">
                <div>
                  <h3>Foto tersimpan</h3>
                  <p>Pilih satu foto untuk thumbnail yang tampil di halaman depan.</p>
                </div>
              </div>
              <div class="image-grid">
                <article
                  v-for="image in editing.images"
                  :key="image.id"
                  class="stored-image"
                  :class="{ 'is-thumbnail': image.is_thumbnail }"
                >
                  <img :src="image.url" :alt="image.alt_text || editing.name" />
                  <div class="image-caption">
                    <q-btn
                      v-if="!image.is_thumbnail"
                      flat
                      dense
                      no-caps
                      color="amber-10"
                      icon="star_outline"
                      label="Jadikan thumbnail"
                      @click="setThumbnail(image)"
                    />
                    <span v-else><q-icon name="star" /> Thumbnail</span>
                    <q-btn
                      flat
                      round
                      dense
                      icon="delete_outline"
                      color="negative"
                      aria-label="Hapus foto"
                      @click="removeImage(image)"
                    />
                  </div>
                </article>
              </div>
            </section>

            <div class="dialog-actions">
              <q-btn flat no-caps label="Batal" v-close-popup />
              <q-btn
                unelevated
                no-caps
                class="primary-action"
                type="submit"
                :loading="saving"
                :label="editing ? 'Simpan Perubahan' : 'Simpan Produk'"
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

const apiBaseUrl = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')
const rows = ref([])
const categories = ref([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const search = ref('')
const categoryFilter = ref(null)
const dialogOpen = ref(false)
const editing = ref(null)
const newImages = ref([])
const form = ref(defaultForm())
const priceInput = ref('0')
const statusOptions = [
  { label: 'Aktif - tampil di katalog', value: 'active' },
  { label: 'Draf - belum ditampilkan', value: 'draft' },
]

function defaultForm() {
  return { category_id: null, name: '', description: '', price: 0, stock: 0, status: 'draft' }
}

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
  categories.value = await request('/categories')
}

async function loadProducts() {
  loading.value = true
  error.value = ''
  try {
    const params = new URLSearchParams({ per_page: '100' })
    if (search.value) params.set('search', search.value)
    if (categoryFilter.value) params.set('category_id', categoryFilter.value)
    rows.value = (await request(`/products?${params}`)).data
  } catch (exception) {
    error.value = exception.message
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = null
  newImages.value = []
  form.value = defaultForm()
  priceInput.value = formatPriceInput(form.value.price)
  dialogOpen.value = true
}

function openEdit(product) {
  editing.value = { ...product, images: product.images || [] }
  newImages.value = []
  form.value = {
    category_id: product.category_id,
    name: product.name,
    description: product.description || '',
    price: Number(product.price),
    stock: product.stock,
    status: product.status,
  }
  priceInput.value = formatPriceInput(product.price)
  dialogOpen.value = true
  loadProductImages(product.id)
}

function updatePrice(value) {
  const digits = String(value || '').replace(/\D/g, '')
  form.value.price = digits ? Number(digits) : 0
  priceInput.value = digits ? formatPriceInput(digits) : ''
}

function formatPriceInput(value) {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(Number(value || 0))
}

async function loadProductImages(productId) {
  try {
    const product = await request(`/products/${productId}`)
    applyProduct(product)
    editing.value = product
  } catch (exception) {
    error.value = exception.message
  }
}

async function saveProduct() {
  saving.value = true
  try {
    const productData = new FormData()
    Object.entries(form.value).forEach(([key, value]) => productData.append(key, value ?? ''))
    const selectedImages = Array.isArray(newImages.value)
      ? newImages.value
      : newImages.value
        ? [newImages.value]
        : []
    for (const image of selectedImages) productData.append('images[]', image)

    const path = editing.value ? `/products/${editing.value.id}` : '/products'
    if (editing.value) productData.append('_method', 'PUT')
    await request(path, { method: 'POST', body: productData })
    dialogOpen.value = false
    await loadProducts()
  } catch (exception) {
    error.value = exception.message
  } finally {
    saving.value = false
  }
}

function applyProduct(product) {
  const index = rows.value.findIndex((row) => row.id === product.id)
  if (index !== -1) rows.value[index] = product
}

async function setThumbnail(image) {
  try {
    const product = await request(`/products/${editing.value.id}/images/${image.id}/thumbnail`, {
      method: 'PATCH',
    })
    editing.value = product
    applyProduct(product)
  } catch (exception) {
    error.value = exception.message
  }
}

async function removeImage(image) {
  if (!window.confirm('Hapus foto ini?')) return
  try {
    const product = await request(`/products/${editing.value.id}/images/${image.id}`, {
      method: 'DELETE',
    })
    editing.value = product
    applyProduct(product)
  } catch (exception) {
    error.value = exception.message
  }
}

async function removeProduct(product) {
  if (!window.confirm(`Hapus produk ${product.name}? Tindakan ini tidak dapat dibatalkan.`)) return
  try {
    await request(`/products/${product.id}`, { method: 'DELETE' })
    await loadProducts()
  } catch (exception) {
    error.value = exception.message
  }
}

function showImageRejected(rejectedEntries) {
  error.value =
    rejectedEntries[0]?.failedPropValidation === 'max-files'
      ? 'Maksimal 8 foto untuk satu produk.'
      : 'Gunakan foto JPG, PNG, atau WebP dengan ukuran maksimal 5 MB.'
}

function formatPrice(price) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price)
}

onMounted(async () => {
  try {
    await loadCategories()
    await loadProducts()
  } catch (exception) {
    error.value = exception.message
  }
})
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
.product-list-card {
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
  gap: 12px;
  padding: 18px 19px;
  border-bottom: 1px solid #ebe9e4;
}
.search-input {
  width: min(100%, 330px);
}
.category-filter {
  width: 220px;
}
.product-item {
  min-height: 106px;
  padding: 15px 19px;
}
.product-picture {
  display: grid;
  width: 72px;
  height: 72px;
  place-items: center;
  overflow: hidden;
  border-radius: 12px;
  background: #f2f0ea;
  color: #a7a39a;
}
.product-picture img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.product-name {
  color: #292a2d;
  font-size: 1rem;
  font-weight: 750;
}
.product-description {
  max-width: 570px;
  margin-top: 3px;
  color: #73757b;
}
.product-details {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  margin-top: 7px;
  color: #8a8c91;
  font-size: 0.76rem;
}
.product-details span + span::before {
  margin-right: 14px;
  color: #d0d1d3;
  content: '•';
}
.product-meta {
  min-width: 105px;
  align-items: flex-end;
  gap: 7px;
}
.stock-ok {
  color: #27834d;
  font-size: 0.78rem;
}
.stock-empty {
  color: #b33e3e;
  font-size: 0.78rem;
}
.product-actions {
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
  width: min(94vw, 760px);
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
.dialog-heading p,
.field-help {
  margin: 0;
  color: #75777d;
  font-size: 0.82rem;
  line-height: 1.5;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 15px;
}
.field-full {
  grid-column: 1 / -1;
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
.field-help {
  margin-top: 6px;
}
.image-manager {
  margin-top: 26px;
  padding-top: 20px;
  border-top: 1px solid #eceae5;
}
.image-manager h3 {
  margin: 0 0 3px;
  font-size: 1rem;
}
.image-manager-heading p {
  margin: 0;
  color: #75777d;
  font-size: 0.82rem;
}
.image-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}
.stored-image {
  overflow: hidden;
  border: 1px solid #e5e3dd;
  border-radius: 10px;
}
.stored-image.is-thumbnail {
  border: 2px solid #e6af27;
}
.stored-image img {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}
.image-caption {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 35px;
  padding: 2px 4px 2px 8px;
  font-size: 0.7rem;
}
.image-caption span {
  color: #a87708;
  font-weight: 700;
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
  .search-input,
  .category-filter {
    width: 100%;
  }
  .form-grid {
    display: grid;
    grid-template-columns: 1fr;
  }
  .field-full {
    grid-column: auto;
  }
  .product-item {
    padding: 14px;
  }
  .product-item .q-item__section--avatar {
    min-width: 84px;
  }
  .product-meta {
    min-width: auto;
  }
  .product-description {
    max-width: 150px;
  }
  .product-details {
    gap: 4px 8px;
  }
  .product-details span + span::before {
    margin-right: 8px;
  }
  .image-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
