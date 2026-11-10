<template>
  <q-page class="dashboard-page">
    <header class="dashboard-topbar">
      <div class="brand-lockup">
        <img class="brand-logo" src="/images/logo-creative.png" alt="Logo Creative" />
        <span>CREATIVE</span>
      </div>

      <nav class="dashboard-nav" aria-label="Navigasi utama">
        <RouterLink to="/categories">Kategori</RouterLink>
        <RouterLink to="/products">Produk</RouterLink>
        <RouterLink to="/contact">Kontak</RouterLink>
        <RouterLink to="/gallery">Galeri Produksi</RouterLink>
        <RouterLink to="/users">Pengguna</RouterLink>
      </nav>

      <q-btn flat no-caps class="profile-button">
        <q-avatar color="amber-8" text-color="dark" size="34px">{{ initials }}</q-avatar>
        <span>{{ user.name }}</span>
        <q-icon name="expand_more" />
        <q-menu class="profile-menu">
          <q-list style="min-width: 170px">
            <q-item clickable :disable="isLoggingOut" @click="logout">
              <q-item-section avatar>
                <q-spinner v-if="isLoggingOut" color="amber-8" size="20px" />
                <q-icon v-else name="logout" />
              </q-item-section>
              <q-item-section>{{ isLoggingOut ? 'Sedang keluar...' : 'Keluar' }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </header>

    <main class="dashboard-content">
      <section class="welcome-row">
        <div>
          <p class="eyebrow">DASHBOARD</p>
          <h1>Selamat datang, {{ user.name }}!</h1>
          <p>Berikut ringkasan aktivitas Creative hari ini.</p>
        </div>
        <q-btn unelevated no-caps class="primary-action" icon="add" label="Tambah Produk" />
      </section>

      <q-banner v-if="statsError" rounded class="stats-error">
        <template #avatar><q-icon name="error_outline" /></template>
        {{ statsError }}
      </q-banner>

      <section class="stats-grid" aria-label="Ringkasan bisnis">
        <article v-for="stat in stats" :key="stat.label" class="stat-card">
          <div class="stat-icon" :class="'stat-icon--' + stat.color">
            <q-icon :name="stat.icon" size="23px" />
          </div>
          <div>
            <p>{{ stat.label }}</p>
            <strong>{{ stat.value }}</strong>
            <small :class="{ 'is-positive': stat.positive }">{{ stat.detail }}</small>
          </div>
        </article>
      </section>

      <section class="dashboard-grid">
        <article class="panel sales-panel">
          <div class="panel-heading">
            <div>
              <h2>Aktivitas Katalog</h2>
              <p>Produk yang ditambahkan dalam 7 hari terakhir</p>
            </div>
            <span class="panel-period">7 hari terakhir</span>
          </div>
          <div v-if="isActivityLoading" class="chart-status">Memuat aktivitas katalog...</div>
          <div v-else-if="!hasProductActivity" class="chart-status">
            Belum ada produk yang ditambahkan dalam 7 hari terakhir.
          </div>
          <div
            v-else
            class="chart"
            aria-label="Grafik produk yang ditambahkan dalam 7 hari terakhir"
          >
            <div v-for="day in productActivity" :key="day.date" class="bar-column">
              <div
                class="bar"
                :class="{ 'bar--empty': day.count === 0 }"
                :style="{ height: chartBarHeight(day.count) + '%' }"
              ></div>
              <span>{{ day.label }}</span>
            </div>
          </div>
        </article>

        <article class="panel">
          <div class="panel-heading">
            <div>
              <h2>Akses Cepat</h2>
              <p>Kelola bagian penting website</p>
            </div>
          </div>
          <div class="quick-links">
            <RouterLink
              v-for="item in quickLinks"
              :key="item.label"
              :to="item.to"
              class="quick-link"
            >
              <q-icon :name="item.icon" />
              <span>{{ item.label }}</span>
              <q-icon name="chevron_right" class="quick-link__arrow" />
            </RouterLink>
          </div>
        </article>
      </section>

      <section class="panel activity-panel">
        <div class="panel-heading">
          <div>
            <h2>Aktivitas Terbaru</h2>
            <p>Pembaruan terbaru di sistem</p>
          </div>
          <span class="panel-period">3 terbaru</span>
        </div>
        <div v-if="isActivitiesLoading" class="activity-status">Memuat aktivitas terbaru...</div>
        <div v-else-if="recentActivities.length === 0" class="activity-status">
          Belum ada aktivitas yang tercatat.
        </div>
        <div v-else class="activity-list">
          <div
            v-for="activity in recentActivities"
            :key="`${activity.type}-${activity.id}-${activity.occurredAt}`"
            class="activity-item"
          >
            <q-icon :name="activity.icon" :class="'activity-icon--' + activity.color" />
            <div>
              <strong>{{ activity.title }}</strong>
              <p>{{ activity.detail }}</p>
            </div>
            <time>{{ activity.time }}</time>
          </div>
        </div>
      </section>
    </main>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/boot/axios'

const router = useRouter()
function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('creative_auth_user')) || {}
  } catch {
    return {}
  }
}

const user = ref(getStoredUser())
const isLoggingOut = ref(false)
const statsError = ref('')
const isActivityLoading = ref(true)
const productActivity = ref([])
const isActivitiesLoading = ref(true)
const recentActivities = ref([])
const initials = computed(() =>
  String(user.value.name || user.value.username || 'A')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase(),
)

const stats = ref([
  {
    label: 'Total Produk',
    value: '—',
    detail: 'Memuat data...',
    icon: 'inventory_2',
    color: 'gold',
  },
  {
    label: 'Total Kategori',
    value: '—',
    detail: 'Memuat data...',
    icon: 'category',
    color: 'blue',
  },
  {
    label: 'Galeri Produksi',
    value: '—',
    detail: 'Memuat data...',
    icon: 'photo_library',
    color: 'green',
  },
  {
    label: 'Pengguna Admin',
    value: '—',
    detail: 'Memuat data...',
    icon: 'manage_accounts',
    color: 'purple',
  },
])

const activityMaximum = computed(() =>
  Math.max(...productActivity.value.map((day) => day.count), 0),
)
const hasProductActivity = computed(() => productActivity.value.some((day) => day.count > 0))
const quickLinks = [
  { label: 'Kelola Kategori', icon: 'category', to: '/categories' },
  { label: 'Kelola Produk', icon: 'inventory_2', to: '/products' },
  { label: 'Kelola Kontak', icon: 'contact_phone', to: '/contact' },
  { label: 'Kelola Media Sosial', icon: 'share', to: '/social-media' },
  { label: 'Kelola Galeri Produksi', icon: 'photo_library', to: '/gallery' },
  { label: 'Kelola Pengguna', icon: 'manage_accounts', to: '/users' },
]

function activityDayLabel(date) {
  return ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][new Date(`${date}T00:00:00`).getDay()]
}

function chartBarHeight(count) {
  if (count === 0 || activityMaximum.value === 0) return 0

  return Math.max(12, Math.round((count / activityMaximum.value) * 100))
}

function activityAppearance(type) {
  return {
    product: { icon: 'inventory_2', color: 'blue' },
    category: { icon: 'category', color: 'gold' },
    gallery: { icon: 'photo_library', color: 'green' },
    user: { icon: 'manage_accounts', color: 'purple' },
  }[type]
}

function relativeTime(occurredAt) {
  const differenceInSeconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(occurredAt).getTime()) / 1000),
  )

  if (differenceInSeconds < 60) return 'Baru saja'
  if (differenceInSeconds < 3600) return `${Math.floor(differenceInSeconds / 60)} menit lalu`
  if (differenceInSeconds < 86400) return `${Math.floor(differenceInSeconds / 3600)} jam lalu`
  if (differenceInSeconds < 604800) return `${Math.floor(differenceInSeconds / 86400)} hari lalu`

  return new Date(occurredAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

async function loadDashboardSummary() {
  statsError.value = ''

  try {
    const { data: summary } = await api.get('/dashboard/summary')
    productActivity.value = Array.isArray(summary.product_activity)
      ? summary.product_activity.map((day) => ({
          date: day.date,
          count: Number(day.count) || 0,
          label: activityDayLabel(day.date),
        }))
      : []
    recentActivities.value = Array.isArray(summary.recent_activities)
      ? summary.recent_activities.map((activity) => ({
          ...activity,
          ...activityAppearance(activity.type),
          occurredAt: activity.occurred_at,
          time: relativeTime(activity.occurred_at),
        }))
      : []
    stats.value = [
      {
        label: 'Total Produk',
        value: summary.products,
        detail: 'Produk terdaftar',
        icon: 'inventory_2',
        color: 'gold',
      },
      {
        label: 'Total Kategori',
        value: summary.categories,
        detail: 'Kategori terdaftar',
        icon: 'category',
        color: 'blue',
      },
      {
        label: 'Galeri Produksi',
        value: summary.gallery_items,
        detail: 'Foto di galeri',
        icon: 'photo_library',
        color: 'green',
      },
      {
        label: 'Pengguna Admin',
        value: summary.users,
        detail: 'Akun terdaftar',
        icon: 'manage_accounts',
        color: 'purple',
      },
    ]
  } catch (exception) {
    statsError.value = exception.message
    productActivity.value = []
    recentActivities.value = []
    stats.value = stats.value.map((stat) => ({
      ...stat,
      detail: 'Data belum tersedia',
    }))
  } finally {
    isActivityLoading.value = false
    isActivitiesLoading.value = false
  }
}

async function logout() {
  if (isLoggingOut.value) return

  isLoggingOut.value = true

  try {
    await api.post('/logout')
  } finally {
    localStorage.removeItem('creative_auth_token')
    localStorage.removeItem('creative_auth_user')
    await router.push('/login')
    isLoggingOut.value = false
  }
}

onMounted(loadDashboardSummary)
</script>

<style scoped lang="scss">
.dashboard-page {
  min-height: 100dvh;
  padding-bottom: 44px;
  background: #f6f6f3;
  color: #202124;
}
.dashboard-topbar {
  display: flex;
  height: 72px;
  align-items: center;
  justify-content: space-between;
  padding: 0 clamp(20px, 5vw, 76px);
  border-bottom: 1px solid #2c2e31;
  background: #17191c;
  color: #f8f8f5;
}
.brand-lockup,
.profile-button {
  display: flex;
  align-items: center;
}
.dashboard-nav {
  display: flex;
  gap: 20px;
  margin-right: auto;
  margin-left: 35px;
}
.dashboard-nav a {
  color: #bcbfc2;
  font-size: 0.88rem;
  text-decoration: none;
}
.dashboard-nav a:hover {
  color: #f6c644;
}
.brand-lockup {
  gap: 10px;
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: 0.12em;
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
  border-left: 0;
  border-top: 0;
}
.profile-button {
  gap: 8px;
  border-radius: 9px;
  color: #f5f5f3;
}
.profile-menu {
  border-radius: 11px;
}
.dashboard-content {
  width: min(100% - 40px, 1180px);
  margin: 0 auto;
  padding-top: 44px;
}
.welcome-row {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 32px;
}
.eyebrow {
  margin: 0 0 8px;
  color: #a87708;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.12em;
}
.welcome-row h1 {
  margin: 0 0 7px;
  font-size: clamp(1.65rem, 3vw, 2.25rem);
  line-height: 1.18;
}
.welcome-row > div > p:not(.eyebrow) {
  margin: 0;
  color: #707278;
}
.primary-action {
  height: 45px;
  padding: 0 19px;
  border-radius: 10px;
  background: #e6af27;
  color: #201806;
  font-weight: 700;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-bottom: 22px;
}
.stats-error {
  margin: 0 0 18px;
  background: #ffebee;
  color: #b3261e;
}
.stat-card {
  display: flex;
  align-items: center;
  gap: 15px;
  min-height: 126px;
  padding: 20px;
  border: 1px solid #ebe9e4;
  border-radius: 15px;
  background: #fff;
  box-shadow: 0 7px 21px rgba(46, 39, 19, 0.04);
}
.stat-icon {
  display: grid;
  width: 46px;
  height: 46px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 13px;
}
.stat-icon--gold {
  background: #fff2cb;
  color: #b77b00;
}
.stat-icon--blue {
  background: #e4efff;
  color: #3a79c5;
}
.stat-icon--green {
  background: #dcf5e3;
  color: #258547;
}
.stat-icon--purple {
  background: #f0e6ff;
  color: #8051b7;
}
.stat-card p {
  margin: 0 0 3px;
  color: #787a7e;
  font-size: 0.83rem;
}
.stat-card strong {
  display: block;
  font-size: 1.34rem;
}
.stat-card small {
  color: #85878b;
  font-size: 0.73rem;
}
.stat-card small.is-positive {
  color: #24904a;
}
.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(270px, 0.9fr);
  gap: 22px;
  margin-bottom: 22px;
}
.panel {
  padding: 24px;
  border: 1px solid #ebe9e4;
  border-radius: 15px;
  background: #fff;
  box-shadow: 0 7px 21px rgba(46, 39, 19, 0.04);
}
.panel-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}
.panel-heading h2 {
  margin: 0 0 5px;
  font-size: 1.05rem;
}
.panel-heading p {
  margin: 0;
  color: #85878b;
  font-size: 0.82rem;
}
.panel-period {
  color: #6c4b08;
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
}
.chart-status {
  display: grid;
  min-height: 205px;
  place-items: center;
  margin-top: 26px;
  border-bottom: 1px solid #e7e4dd;
  color: #85878b;
  font-size: 0.86rem;
  text-align: center;
}
.chart {
  display: flex;
  height: 205px;
  align-items: end;
  justify-content: space-between;
  gap: 12px;
  margin-top: 26px;
  padding: 0 4px;
  border-bottom: 1px solid #e7e4dd;
  background: repeating-linear-gradient(to bottom, transparent 0 50px, #f2f0eb 51px 52px);
}
.bar-column {
  display: flex;
  height: 100%;
  flex: 1;
  align-items: center;
  flex-direction: column;
  justify-content: end;
  gap: 9px;
}
.bar {
  width: min(100%, 35px);
  min-height: 15px;
  border-radius: 8px 8px 2px 2px;
  background: linear-gradient(#f9d568, #d89d1e);
}
.bar--empty {
  min-height: 0;
  background: transparent;
}
.bar-column span {
  padding-bottom: 8px;
  color: #898b90;
  font-size: 0.73rem;
}
.quick-links {
  display: grid;
  gap: 7px;
  margin-top: 18px;
}
.quick-link {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 0;
  border-radius: 10px;
  background: #faf9f6;
  color: #404247;
  cursor: pointer;
  font: inherit;
  font-size: 0.88rem;
  text-align: left;
  text-decoration: none;
}
.quick-link:hover {
  background: #fff2cd;
}
.quick-link__arrow {
  margin-left: auto;
  color: #a8a9ab;
}
.activity-panel {
  padding-bottom: 9px;
}
.activity-list {
  margin-top: 15px;
}
.activity-status {
  display: grid;
  min-height: 112px;
  place-items: center;
  color: #85878b;
  font-size: 0.86rem;
  text-align: center;
}
.activity-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 13px 0;
  border-top: 1px solid #f0eeea;
}
.activity-item > .q-icon {
  display: grid;
  width: 35px;
  height: 35px;
  place-items: center;
  border-radius: 10px;
}
.activity-icon--gold {
  background: #fff2cb;
  color: #b77b00;
}
.activity-icon--blue {
  background: #e4efff;
  color: #3a79c5;
}
.activity-icon--green {
  background: #dcf5e3;
  color: #258547;
}
.activity-icon--purple {
  background: #f0e6ff;
  color: #8051b7;
}
.activity-item strong {
  font-size: 0.88rem;
}
.activity-item p {
  margin: 3px 0 0;
  color: #85878b;
  font-size: 0.78rem;
}
.activity-item time {
  margin-left: auto;
  color: #9a9b9f;
  font-size: 0.75rem;
  white-space: nowrap;
}
@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 599px) {
  .dashboard-topbar {
    height: 63px;
    padding: 0 17px;
  }
  .dashboard-nav {
    display: none;
  }
  .profile-button > span {
    display: none;
  }
  .dashboard-content {
    width: min(100% - 30px, 1180px);
    padding-top: 28px;
  }
  .welcome-row {
    align-items: flex-start;
    flex-direction: column;
    margin-bottom: 25px;
  }
  .primary-action {
    width: 100%;
  }
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 11px;
  }
  .stat-card {
    min-height: 94px;
  }
  .panel {
    padding: 19px;
  }
  .chart {
    gap: 7px;
  }
  .activity-item {
    align-items: flex-start;
  }
}
</style>
