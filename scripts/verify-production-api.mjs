import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const productionEnv = await readFile('.env.production', 'utf8')
const match = productionEnv.match(/^QCLI_API_BASE_URL=(.+)$/m)

assert.ok(match, 'QCLI_API_BASE_URL harus didefinisikan di .env.production')
assert.equal(
  match[1].trim().replace(/\/$/, ''),
  'https://api.creative-prob.my.id/api',
  'URL API production harus menuju host API dan prefiks /api',
)

for (const page of ['IndexPage.vue', 'DashboardPage.vue', 'CategoryPage.vue', 'ProductPage.vue']) {
  const source = await readFile(`src/pages/${page}`, 'utf8')
  assert.match(source, /from '@\/boot\/axios'/, `${page} harus memakai instance Axios terpusat`)
  assert.doesNotMatch(source, /services\/api|VITE_API_URL|fetch\(/, `${page} tidak boleh bypass Axios`)
}

console.log('Konfigurasi URL API production dan penggunaan Axios terpusat valid.')
