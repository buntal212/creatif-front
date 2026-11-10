<template>
  <q-page class="gallery-page">
    <header class="gallery-topbar">
      <RouterLink class="brand-lockup" to="/">
        <img
          class="brand-logo"
          src="/images/logo-creative.png"
          alt="Logo Creative"
        />
        <span>CREATIVE</span>
      </RouterLink>
      <nav class="gallery-nav" aria-label="Navigasi utama">
        <RouterLink to="/">Dashboard</RouterLink>
        <RouterLink to="/categories">Kategori</RouterLink>
        <RouterLink to="/products">Produk</RouterLink>
        <RouterLink to="/contact">Kontak</RouterLink>
        <RouterLink class="is-active" to="/gallery">Galeri Produksi</RouterLink>
        <RouterLink to="/users">Pengguna</RouterLink>
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

    <main class="gallery-content">
      <div class="page-heading">
        <div>
          <p class="eyebrow">KONTEN WEBSITE</p>
          <h1>Galeri Produksi</h1>
          <p
            >Unggah foto hasil produksi yang akan tampil di halaman utama
            website.</p
          >
        </div>
        <q-btn
          unelevated
          no-caps
          class="primary-action"
          icon="add_photo_alternate"
          label="Tambah Foto"
          @click="openCreate"
        />
      </div>

      <q-banner v-if="error" rounded class="error-banner">
        <template #avatar><q-icon name="error_outline" /></template>
        {{ error }}
      </q-banner>

      <section class="gallery-card" aria-label="Daftar galeri produksi">
        <div v-if="rows.length" class="gallery-grid">
          <article v-for="item in rows" :key="item.id" class="gallery-item">
            <img :src="item.url" :alt="item.alt_text || item.title" />
            <div class="gallery-item__body">
              <div class="gallery-item__topline">
                <h2>{{ item.title }}</h2>
                <q-badge
                  :color="item.is_published ? 'green-1' : 'grey-3'"
                  :text-color="item.is_published ? 'green-9' : 'grey-8'"
                >
                  {{ item.is_published ? 'Tayang' : 'Disembunyikan' }}
                </q-badge>
              </div>
              <p>{{ item.description || 'Tanpa deskripsi.' }}</p>
              <div class="gallery-item__footer">
                <span>Urutan {{ item.sort_order }}</span>
                <div>
                  <q-btn
                    flat
                    round
                    dense
                    icon="edit"
                    color="amber-9"
                    aria-label="Edit foto"
                    @click="openEdit(item)"
                  />
                  <q-btn
                    flat
                    round
                    dense
                    icon="delete_outline"
                    color="negative"
                    aria-label="Hapus foto"
                    @click="removeItem(item)"
                  />
                </div>
              </div>
            </div>
          </article>
        </div>
        <div v-else-if="!loading" class="empty-gallery">
          <q-icon name="photo_library" size="42px" />
          <p>Belum ada foto produksi.</p>
          <span>Tambahkan foto pertama untuk mengisi galeri website.</span>
        </div>
        <q-inner-loading :showing="loading" color="amber-8" />
      </section>
    </main>

    <q-dialog v-model="dialogOpen" persistent :maximized="$q.screen.lt.sm">
      <q-card class="form-dialog">
        <q-card-section class="dialog-heading">
          <div>
            <h2>{{
              editing ? 'Ubah Foto Produksi' : 'Tambah Foto Produksi'
            }}</h2>
            <p>Gunakan foto JPG, PNG, atau WebP dengan ukuran maksimal 5 MB.</p>
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
          <q-form @submit="saveItem">
            <label for="gallery-title">Judul foto</label>
            <q-input
              id="gallery-title"
              v-model.trim="form.title"
              outlined
              autofocus
              placeholder="Contoh: Jersey Tim Futsal"
              :rules="[value => !!value || 'Judul wajib diisi']"
            />

            <label for="gallery-image"
              >Foto
              <span v-if="editing">opsional, pilih untuk mengganti</span></label
            >
            <q-file
              id="gallery-image"
              v-model="newImage"
              outlined
              accept="image/jpeg,image/png,image/webp"
              label="Pilih foto produksi"
              :rules="[() => !!editing || !!newImage || 'Foto wajib dipilih']"
              @rejected="showImageRejected"
            >
              <template #prepend
                ><q-icon name="add_photo_alternate"
              /></template>
            </q-file>

            <label for="gallery-description"
              >Deskripsi <span>opsional</span></label
            >
            <q-input
              id="gallery-description"
              v-model.trim="form.description"
              outlined
              type="textarea"
              autogrow
              placeholder="Ceritakan singkat hasil produksi ini..."
            />

            <label for="gallery-alt"
              >Teks alternatif <span>opsional</span></label
            >
            <q-input
              id="gallery-alt"
              v-model.trim="form.alt_text"
              outlined
              placeholder="Deskripsi singkat isi foto untuk aksesibilitas"
            />

            <div class="form-row">
              <div>
                <label for="gallery-order">Urutan tampil</label>
                <q-input
                  id="gallery-order"
                  v-model.number="form.sort_order"
                  outlined
                  type="number"
                  min="0"
                />
              </div>
              <div class="publish-field">
                <label for="gallery-published">Status publikasi</label>
                <q-toggle
                  id="gallery-published"
                  v-model="form.is_published"
                  color="amber-9"
                  :label="
                    form.is_published
                      ? 'Tayang di website'
                      : 'Sembunyikan dari website'
                  "
                />
              </div>
            </div>

            <div v-if="editing?.url" class="current-image">
              <p>Foto saat ini</p>
              <img
                :src="editing.url"
                :alt="editing.alt_text || editing.title"
              />
            </div>

            <div class="dialog-actions">
              <q-btn flat no-caps label="Batal" v-close-popup />
              <q-btn
                unelevated
                no-caps
                class="primary-action"
                type="submit"
                :loading="saving"
                :label="editing ? 'Simpan Perubahan' : 'Simpan Foto'"
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

function emptyForm() {
  return {
    title: '',
    description: '',
    alt_text: '',
    sort_order: 0,
    is_published: true
  }
}

const rows = ref([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const dialogOpen = ref(false)
const editing = ref(null)
const form = ref(emptyForm())
const newImage = ref(null)

async function request(path, { body, ...config } = {}) {
  const response = await api.request({ url: path, data: body, ...config })
  return response.data
}

async function loadGallery() {
  loading.value = true
  error.value = ''
  try {
    rows.value = await request('/gallery-items')
  } catch (exception) {
    error.value = exception.message
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = null
  newImage.value = null
  form.value = { ...emptyForm(), sort_order: rows.value.length + 1 }
  dialogOpen.value = true
}

function openEdit(item) {
  editing.value = item
  newImage.value = null
  form.value = {
    title: item.title,
    description: item.description || '',
    alt_text: item.alt_text || '',
    sort_order: item.sort_order,
    is_published: item.is_published
  }
  dialogOpen.value = true
}

function showImageRejected() {
  error.value =
    'Gunakan gambar JPG, PNG, atau WebP dengan ukuran maksimal 5 MB.'
}

async function saveItem() {
  saving.value = true
  error.value = ''

  try {
    const payload = new FormData()
    payload.append('title', form.value.title)
    payload.append('description', form.value.description || '')
    payload.append('alt_text', form.value.alt_text || '')
    payload.append('sort_order', String(form.value.sort_order || 0))
    payload.append('is_published', form.value.is_published ? '1' : '0')
    if (newImage.value) payload.append('image', newImage.value)

    const path = editing.value
      ? `/gallery-items/${editing.value.id}`
      : '/gallery-items'
    if (editing.value) payload.append('_method', 'PUT')
    await request(path, { method: 'POST', body: payload })

    dialogOpen.value = false
    await loadGallery()
  } catch (exception) {
    error.value = exception.message
  } finally {
    saving.value = false
  }
}

async function removeItem(item) {
  if (
    !window.confirm(
      `Hapus foto “${item.title}”? Tindakan ini tidak dapat dibatalkan.`
    )
  )
    return

  try {
    await request(`/gallery-items/${item.id}`, { method: 'DELETE' })
    await loadGallery()
  } catch (exception) {
    error.value = exception.message
  }
}

onMounted(loadGallery)
</script>

<style scoped lang="scss">
.gallery-page {
  min-height: 100dvh;
  background: #f6f6f3;
  color: #202124;
}
.gallery-topbar {
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
.gallery-nav {
  display: flex;
  gap: 20px;
  margin-right: auto;
}
.gallery-nav a {
  color: #bcbfc2;
  font-size: 0.88rem;
  text-decoration: none;
}
.gallery-nav a:hover,
.gallery-nav a.is-active {
  color: #f6c644;
}
.gallery-content {
  width: min(100% - 48px, 1180px);
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
.gallery-card {
  position: relative;
  min-height: 260px;
  border: 1px solid #e5e3dd;
  border-radius: 16px;
  background: #fff;
}
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  padding: 18px;
}
.gallery-item {
  overflow: hidden;
  border: 1px solid #e6e4de;
  border-radius: 12px;
  background: #fff;
}
.gallery-item > img {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  background: #edeae3;
}
.gallery-item__body {
  padding: 14px;
}
.gallery-item__topline {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}
.gallery-item h2 {
  margin: 0;
  font-size: 1rem;
  line-height: 1.35;
}
.gallery-item__body > p {
  display: -webkit-box;
  overflow: hidden;
  margin: 7px 0 12px;
  color: #73757b;
  font-size: 0.84rem;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.gallery-item__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #9a9ca0;
  font-size: 0.75rem;
}
.empty-gallery {
  display: grid;
  min-height: 260px;
  place-content: center;
  justify-items: center;
  padding: 28px;
  color: #a8aaae;
  text-align: center;
}
.empty-gallery p {
  margin: 12px 0 3px;
  color: #55575c;
  font-weight: 700;
}
.empty-gallery span {
  font-size: 0.88rem;
}
.form-dialog {
  width: min(94vw, 620px);
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
  font-size: 0.86rem;
}
label {
  display: block;
  margin: 15px 0 8px;
  font-weight: 700;
}
label span {
  color: #8c8e93;
  font-weight: 400;
}
.form-row {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 16px;
}
.publish-field {
  display: flex;
  flex-direction: column;
  justify-content: end;
}
.publish-field label {
  margin-bottom: 12px;
}
.current-image {
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid #eceae5;
}
.current-image p {
  margin: 0 0 9px;
  color: #75777d;
  font-size: 0.85rem;
}
.current-image img {
  display: block;
  width: min(100%, 260px);
  border-radius: 10px;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}
.dialog-actions {
  display: flex;
  justify-content: end;
  gap: 10px;
  margin-top: 24px;
}
@media (max-width: 850px) {
  .gallery-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 700px) {
  .gallery-topbar {
    height: 63px;
    gap: 15px;
    padding: 0 16px;
  }
  .gallery-nav {
    display: none;
  }
  .gallery-topbar > .q-btn {
    margin-left: auto;
  }
  .gallery-content {
    width: min(100% - 30px, 1180px);
    padding: 28px 0;
  }
  .page-heading {
    align-items: stretch;
    flex-direction: column;
  }
  .primary-action {
    width: 100%;
  }
  .gallery-grid {
    grid-template-columns: 1fr;
    padding: 13px;
  }
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
  .dialog-actions .primary-action {
    width: auto;
  }
}
</style>
