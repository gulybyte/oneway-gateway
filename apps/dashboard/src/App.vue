<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue'
import { backend } from './lib/orpc.client'

type Product = {
  id: number
  name: string
  description: string | null
  imageLink: string | null
  plans: Plan[]
}

type Plan = {
  id: number
  productId: number
  name: string
  description: string | null
  price: number
}

const loadingProducts = ref(false)
const loadingPlans = ref(false)
const toasts = ref<{ id: number; message: string; type: string }[]>([])
const products = ref<Product[]>([])
const plans = ref<Plan[]>([])

// Generate unique ID for toasts
let toastId = 0
function addToast(message: string, type: 'info' | 'success' | 'error' = 'info') {
  const id = toastId++
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }, 4000)
}

const productForm = reactive({
  name: '',
  description: '',
  imageLink: '',
})

const planForm = reactive({
  productId: 0,
  name: '',
  description: '',
  price: '',
})

const productModalRef = ref<HTMLDialogElement | null>(null)
const planModalRef = ref<HTMLDialogElement | null>(null)

function openProductModal() {
  productModalRef.value?.showModal()
}

function closeProductModal() {
  productModalRef.value?.close()
}

function openPlanModal(productId: number = 0) {
  if (productId) {
    planForm.productId = productId
  } else if (products.value.length > 0) {
    planForm.productId = products.value[0].id
  }
  planModalRef.value?.showModal()
}

function closePlanModal() {
  planModalRef.value?.close()
}

async function loadProducts() {
  loadingProducts.value = true
  try {
    const data = (await backend.product.findMany()) as Omit<Product, 'plans'>[]
    const allPlans = (await backend.plan.findMany()) as Plan[]
    
    // Associate plans with products
    products.value = data.map(product => ({
      ...product,
      plans: allPlans.filter(plan => plan.productId === product.id)
    }))
  } catch (error) {
    addToast(`Erro ao carregar produtos: ${String(error)}`, 'error')
  } finally {
    loadingProducts.value = false
  }
}

async function loadPlans() {
  loadingPlans.value = true
  try {
    const data = (await backend.plan.findMany()) as Plan[]
    plans.value = data
  } catch (error) {
    addToast(`Erro ao carregar planos: ${String(error)}`, 'error')
  } finally {
    loadingPlans.value = false
  }
}

async function submitProduct() {
  if (!productForm.name.trim()) {
    addToast('Nome do produto é obrigatório.', 'error')
    return
  }

  try {
    await backend.product.upsert({
      name: productForm.name,
      description: productForm.description || null,
      imageLink: productForm.imageLink || null,
    })

    addToast('Produto criado com sucesso!', 'success')
    productForm.name = ''
    productForm.description = ''
    productForm.imageLink = ''
    closeProductModal()

    await Promise.all([loadProducts(), loadPlans()])
  } catch (error) {
    addToast(`Erro ao criar produto: ${String(error)}`, 'error')
  }
}

async function submitPlan() {
  const parsedPrice = Number(planForm.price)

  if (planForm.productId <= 0 || !planForm.name.trim() || Number.isNaN(parsedPrice) || parsedPrice <= 0) {
    addToast('Preencha produto, nome e preço válido para o plano.', 'error')
    return
  }

  try {
    await backend.plan.upsert({
      productId: planForm.productId,
      name: planForm.name,
      description: planForm.description || null,
      price: parsedPrice,
    })

    addToast('Plano criado com sucesso!', 'success')
    planForm.name = ''
    planForm.description = ''
    planForm.price = ''
    closePlanModal()

    await Promise.all([loadProducts(), loadPlans()])
  } catch (error) {
    addToast(`Erro ao criar plano: ${String(error)}`, 'error')
  }
}

onMounted(async () => {
  await Promise.all([loadProducts(), loadPlans()])
})

const totalPlansCount = computed(() => {
  return products.value.reduce((acc, p) => acc + (p.plans?.length || 0), 0)
})

</script>

<template>
  <div class="drawer bg-base-200 lg:drawer-open font-sans text-base-content min-h-screen">
    <input id="main-drawer" type="checkbox" class="drawer-toggle" />
    
    <div class="drawer-content flex flex-col">
      <!-- Navbar -->
      <div class="navbar bg-base-100 shadow-sm sticky top-0 z-30">
        <div class="flex-none lg:hidden">
          <label for="main-drawer" aria-label="open sidebar" class="btn btn-square btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-6 h-6 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </label>
        </div>
        <div class="flex-1">
          <a class="btn btn-ghost text-xl">Oneway Gateway</a>
        </div>
        <div class="flex-none gap-2">
          <div class="avatar placeholder">
            <div class="bg-neutral text-neutral-content rounded-full w-10">
              <span class="text-xs">GW</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <main class="flex-1 p-6 lg:p-10">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 class="text-3xl font-bold">Dashboard</h1>
            <p class="text-base-content/70 mt-1">Gerencie seu catálogo de produtos e planos</p>
          </div>
          
          <div class="flex gap-2">
            <button class="btn btn-primary" @click="openProductModal">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
              Novo Produto
            </button>
            <button class="btn btn-secondary" @click="openPlanModal(0)">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
              Novo Plano
            </button>
          </div>
        </div>

        <!-- Stats -->
        <div class="stats stats-vertical lg:stats-horizontal shadow w-full mb-8 bg-base-100">
          <div class="stat">
            <div class="stat-figure text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
            </div>
            <div class="stat-title">Total de Produtos</div>
            <div class="stat-value text-primary">{{ products.length }}</div>
            <div class="stat-desc">Produtos cadastrados</div>
          </div>
          
          <div class="stat">
            <div class="stat-figure text-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
            </div>
            <div class="stat-title">Total de Planos</div>
            <div class="stat-value text-secondary">{{ totalPlansCount }}</div>
            <div class="stat-desc">Planos ativos no sistema</div>
          </div>
        </div>

        <!-- Products Grid -->
        <div v-if="loadingProducts" class="flex justify-center items-center py-20">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
        
        <div v-else-if="products.length === 0" class="hero bg-base-100 rounded-box shadow-sm min-h-[300px]">
          <div class="hero-content text-center">
            <div class="max-w-md">
              <div class="mb-4 flex justify-center">
                <div class="avatar placeholder">
                  <div class="bg-neutral text-neutral-content rounded-full w-24">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
                  </div>
                </div>
              </div>
              <h2 class="text-2xl font-bold">Nenhum produto ainda</h2>
              <p class="py-4 text-base-content/70">Comece criando o seu primeiro produto para oferecer planos aos seus clientes.</p>
              <button class="btn btn-primary" @click="openProductModal">Criar Meu Primeiro Produto</button>
            </div>
          </div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <div v-for="product in products" :key="product.id" class="card bg-base-100 shadow-sm border border-base-200">
            <figure v-if="product.imageLink" class="px-4 pt-4 pb-0 h-48 bg-base-200">
              <img :src="product.imageLink" alt="Imagem do produto" class="rounded-xl object-cover h-full w-full" />
            </figure>
            <div class="card-body p-6">
              <h2 class="card-title text-xl">{{ product.name }}</h2>
              <p v-if="product.description" class="text-sm opacity-70 mb-4">{{ product.description }}</p>
              <p v-else class="text-sm opacity-50 italic mb-4">Sem descrição</p>
              
              <div class="divider my-0">Planos associados</div>
              
              <div class="flex flex-col gap-3 mt-4">
                <div v-if="!product.plans || product.plans.length === 0" class="text-center py-4 bg-base-200/50 rounded-box border border-base-200 border-dashed">
                  <p class="text-sm text-base-content/60">Nenhum plano para este produto</p>
                </div>
                
                <div v-else v-for="plan in product.plans" :key="plan.id" class="p-3 bg-base-200 rounded-box flex flex-col gap-1">
                  <div class="flex justify-between items-center">
                    <span class="font-semibold">{{ plan.name }}</span>
                    <span class="badge badge-primary font-bold text-xs py-2 shadow-sm">R$ {{ plan.price.toFixed(2) }}</span>
                  </div>
                  <p v-if="plan.description" class="text-xs text-base-content/70">{{ plan.description }}</p>
                </div>
              </div>
              
              <div class="card-actions justify-end mt-4 pt-2 border-t border-base-200">
                <button class="btn btn-sm btn-outline btn-secondary" @click="openPlanModal(product.id)">+ Adicionar Plano</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Sidebar Drawer -->
    <div class="drawer-side z-40">
      <label for="main-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
      <ul class="menu p-4 w-72 min-h-full bg-base-100 border-r border-base-200 text-base-content">
        <li class="mb-4">
          <a class="text-xl font-bold flex gap-2 items-center px-4 py-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-primary">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.983 2.983 0 002.25 1.015c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75z" />
            </svg>
            Oneway
          </a>
        </li>
        <li>
          <a class="active">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            Dashboard
          </a>
        </li>
      </ul>
    </div>
  </div>

  <!-- Product Form Modal -->
  <dialog ref="productModalRef" class="modal modal-bottom sm:modal-middle">
    <div class="modal-box">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </form>
      <h3 class="font-bold text-xl mb-6">Criar Novo Produto</h3>
      
      <form @submit.prevent="submitProduct" class="flex flex-col gap-4">
        <fieldset class="fieldset w-full">
          <legend class="fieldset-legend text-sm font-semibold">Nome *</legend>
          <input
            v-model="productForm.name"
            type="text"
            placeholder="Ex: Plano de Assinatura Streaming"
            class="input w-full"
            required
          />
        </fieldset>

        <fieldset class="fieldset w-full">
          <legend class="fieldset-legend text-sm font-semibold">Descrição</legend>
          <textarea
            v-model="productForm.description"
            class="textarea h-24 w-full"
            placeholder="Descreva os detalhes e benefícios deste produto"
          ></textarea>
        </fieldset>

        <fieldset class="fieldset w-full">
          <legend class="fieldset-legend text-sm font-semibold">Link da Imagem</legend>
          <input
            v-model="productForm.imageLink"
            type="url"
            placeholder="https://exemplo.com/imagem.png"
            class="input w-full"
          />
          <div class="label" v-if="productForm.imageLink">
            <span class="label-text-alt">A imagem será exibida no card do produto</span>
          </div>
        </fieldset>

        <div class="modal-action mt-6">
          <button type="button" class="btn" @click="closeProductModal">Cancelar</button>
          <button type="submit" class="btn btn-primary">Salvar Produto</button>
        </div>
      </form>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>Fechar</button>
    </form>
  </dialog>

  <!-- Plan Form Modal -->
  <dialog ref="planModalRef" class="modal modal-bottom sm:modal-middle">
    <div class="modal-box">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </form>
      <h3 class="font-bold text-xl mb-6">Criar Novo Plano</h3>
      
      <form @submit.prevent="submitPlan" class="flex flex-col gap-4">
        <fieldset class="fieldset w-full">
          <legend class="fieldset-legend text-sm font-semibold">Produto Vinculado *</legend>
          <select v-model.number="planForm.productId" class="select w-full" required>
            <option :value="0" disabled>Selecione um produto</option>
            <option v-for="product in products" :key="product.id" :value="product.id">
              {{ product.name }}
            </option>
          </select>
        </fieldset>

        <fieldset class="fieldset w-full">
          <legend class="fieldset-legend text-sm font-semibold">Nome do Plano *</legend>
          <input
            v-model="planForm.name"
            type="text"
            placeholder="Ex: Mensal Básico"
            class="input w-full"
            required
          />
        </fieldset>

        <fieldset class="fieldset w-full">
          <legend class="fieldset-legend text-sm font-semibold">Descrição</legend>
          <textarea
            v-model="planForm.description"
            class="textarea h-24 w-full"
            placeholder="Detalhes específicos deste plano"
          ></textarea>
        </fieldset>

        <fieldset class="fieldset w-full">
          <legend class="fieldset-legend text-sm font-semibold">Preço (R$) *</legend>
          <label class="input w-full flex items-center gap-2">
            <span class="text-base-content/50 font-bold">R$</span>
            <input
              v-model="planForm.price"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              class="grow"
              required
            />
          </label>
        </fieldset>

        <div class="modal-action mt-6">
          <button type="button" class="btn" @click="closePlanModal">Cancelar</button>
          <button type="submit" class="btn btn-secondary">Salvar Plano</button>
        </div>
      </form>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>Fechar</button>
    </form>
  </dialog>

  <!-- Toast Notifications -->
  <div class="toast toast-end z-50">
    <div 
      v-for="toast in toasts" 
      :key="toast.id" 
      class="alert shadow-lg"
      :class="{
        'alert-info text-info-content': toast.type === 'info',
        'alert-success text-success-content': toast.type === 'success',
        'alert-error text-error-content': toast.type === 'error'
      }"
    >
      <span v-if="toast.type === 'success'">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      </span>
      <span v-else-if="toast.type === 'error'">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      </span>
      <span v-else>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      </span>
      <span class="font-medium">{{ toast.message }}</span>
    </div>
  </div>
</template>

