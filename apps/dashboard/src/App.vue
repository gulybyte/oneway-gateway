<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'

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
const submittingProduct = ref(false)
const submittingPlan = ref(false)
const toasts = ref<{ id: number; message: string; type: string }[]>([])
const products = ref<Product[]>([])

let toastId = 0
function addToast(message: string, type: 'info' | 'success' | 'error' = 'info') {
  const id = toastId++
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }, 4000)
}

const productForm = reactive({
  id: null as number | null,
  name: '',
  description: '',
  imageLink: '',
})
const planForm = reactive({
  id: null as number | null,
  productId: 0,
  name: '',
  description: '',
  price: '',
})

const productModalRef = ref<HTMLDialogElement | null>(null)
const planModalRef = ref<HTMLDialogElement | null>(null)

function openProductModal(product?: Product) {
  productForm.id = product?.id ?? null
  productForm.name = product?.name ?? ''
  productForm.description = product?.description ?? ''
  productForm.imageLink = product?.imageLink ?? ''
  productModalRef.value?.showModal()
}

function closeProductModal() {
  productModalRef.value?.close()
}

function openPlanModal(productId: number = 0, plan?: Plan) {
  planForm.id = plan?.id ?? null
  planForm.name = plan?.name ?? ''
  planForm.description = plan?.description ?? ''
  planForm.price = plan?.price?.toString() ?? ''
  if (productId) planForm.productId = productId
  else if (products.value.length > 0) planForm.productId = products.value[0].id

  planModalRef.value?.showModal()
}

function closePlanModal() {
  planModalRef.value?.close()
}

async function loadData() {
  loadingProducts.value = true
  try {
    const [productsData, plansData] = await Promise.all([
      backend.product.findMany(),
      backend.plan.findMany(),
    ])

    products.value = (productsData as Omit<Product, 'plans'>[]).map((product) => ({
      ...product,
      plans: (plansData as Plan[]).filter((plan) => plan.productId === product.id),
    }))
  } catch (error) {
    addToast(`Erro ao carregar dados: ${String(error)}`, 'error')
  } finally {
    loadingProducts.value = false
  }
}

async function submitProduct() {
  if (!productForm.name.trim()) {
    addToast('Nome do produto é obrigatório.', 'error')
    return
  }
  submittingProduct.value = true
  try {
    const payload: any = {
      name: productForm.name,
      description: productForm.description || null,
      imageLink: productForm.imageLink || null,
    }
    if (productForm.id) payload.id = productForm.id

    await backend.product.upsert(payload)
    addToast(
      productForm.id ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!',
      'success'
    )
    closeProductModal()
    await loadData()
  } catch (error) {
    addToast(`Erro ao salvar produto: ${String(error)}`, 'error')
  } finally {
    submittingProduct.value = false
  }
}

async function submitPlan() {
  const parsedPrice = Number(planForm.price)
  if (
    planForm.productId <= 0 ||
    !planForm.name.trim() ||
    Number.isNaN(parsedPrice) ||
    parsedPrice <= 0
  ) {
    addToast('Preencha os campos obrigatórios corretamente.', 'error')
    return
  }
  submittingPlan.value = true
  try {
    const payload: any = {
      productId: planForm.productId,
      name: planForm.name,
      description: planForm.description || null,
      price: parsedPrice,
    }
    if (planForm.id) payload.id = planForm.id

    await backend.plan.upsert(payload)
    addToast(planForm.id ? 'Plano atualizado com sucesso!' : 'Plano criado com sucesso!', 'success')
    closePlanModal()
    await loadData()
  } catch (error) {
    const errorMessage = String(error)
    if (errorMessage.includes('Nome do plano já existe para este produto'))
      addToast('Nome do plano já existe para este produto', 'error')
    else addToast(`Erro ao salvar plano: ${errorMessage}`, 'error')
  } finally {
    submittingPlan.value = false
  }
}

onMounted(() => {
  void loadData()
})
</script>

<template>
  <div
    data-theme="dark"
    class="min-h-screen bg-base-100 text-base-content antialiased flex flex-col font-sans"
  >
    <!-- Main Workspace -->
    <main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <!-- Header -->
      <section class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div class="max-w-3xl">
          <h2 class="text-4xl md:text-5xl font-black tracking-tight mb-3 text-base-content">
            Visão Geral
          </h2>
          <p class="text-lg text-base-content/70">
            Consulte seus produtos e gerencie os planos de assinatura visíveis para os clientes.
          </p>
        </div>
        <div class="flex gap-3">
          <button @click="() => openProductModal()" class="btn btn-neutral rounded-sm">
            Adicionar Produto
          </button>
        </div>
      </section>

      <!-- Loading State -->
      <div v-if="loadingProducts" class="flex flex-col gap-8">
        <div
          v-for="i in 2"
          :key="i"
          class="border border-base-300 bg-base-100 flex flex-col md:flex-row rounded-sm"
        >
          <div class="w-full md:w-1/3 skeleton rounded-none h-64 md:h-auto"></div>
          <div class="w-full md:w-2/3 p-8 flex flex-col gap-4">
            <div class="skeleton h-8 w-1/2 rounded-sm"></div>
            <div class="skeleton h-4 w-1/3 rounded-sm mb-6"></div>
            <div class="grid grid-cols-2 gap-4">
              <div class="skeleton h-24 rounded-sm"></div>
              <div class="skeleton h-24 rounded-sm"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="products.length === 0"
        class="flex flex-col items-center justify-center py-24 px-4 text-center border-2 border-dashed border-base-300 bg-base-200/30 rounded-sm"
      >
        <div class="bg-neutral text-neutral-content p-4 mb-6 rounded-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-10 h-10"
          >
            <path
              stroke-linecap="square"
              stroke-linejoin="miter"
              d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.983 2.983 0 002.25 1.015c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75z"
            />
          </svg>
        </div>
        <h3 class="text-2xl font-bold text-base-content mb-3 uppercase tracking-tight">
          Sem Produtos
        </h3>
        <p class="text-base-content/60 max-w-md mx-auto mb-8 text-lg">
          Inicie cadastrando o seu primeiro produto para em seguida definir os planos.
        </p>
        <button
          @click="() => openProductModal()"
          class="btn btn-neutral btn-wide rounded-sm font-bold"
        >
          Cadastrar Produto
        </button>
      </div>

      <!-- Main Layout -->
      <div v-else class="flex flex-col gap-12">
        <article
          v-for="product in products"
          :key="product.id"
          class="flex flex-col xl:flex-row border border-base-300 bg-base-100 shadow-sm rounded-sm group overflow-hidden"
        >
          <!-- Product Left Column -->
          <div
            class="w-full xl:w-1/3 xl:border-r border-b xl:border-b-0 border-base-300 bg-base-200/30 flex flex-col"
          >
            <div
              v-if="product.imageLink"
              class="aspect-video w-full bg-base-300 border-b border-base-300 overflow-hidden relative"
            >
              <img
                :src="product.imageLink"
                :alt="product.name"
                class="object-cover w-full h-full grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
              />
            </div>
            <div
              v-else
              class="aspect-video w-full border-b border-base-300 bg-base-300/50 flex flex-col items-center justify-center text-base-content/40 relative"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1"
                stroke="currentColor"
                class="w-12 h-12 mb-2"
              >
                <path
                  stroke-linecap="square"
                  stroke-linejoin="miter"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
              <span class="text-sm font-medium uppercase tracking-widest">Sem Imagem</span>
            </div>

            <div class="p-6 md:p-8 flex-1 flex flex-col">
              <div class="flex justify-between items-start mb-3 gap-2">
                <h3 class="text-2xl font-black text-base-content uppercase tracking-tight">
                  {{ product.name }}
                </h3>
                <button
                  @click="() => openProductModal(product)"
                  class="btn btn-sm btn-ghost btn-square mt-1 hover:bg-neutral hover:text-neutral-content text-base-content/50"
                  title="Editar Produto"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    class="w-5 h-5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                    />
                  </svg>
                </button>
              </div>
              <p v-if="product.description" class="text-base-content/80 text-base flex-1">
                {{ product.description }}
              </p>
              <p v-else class="text-base-content/40 text-base italic flex-1">
                Nenhuma descrição fornecida.
              </p>
            </div>
          </div>

          <!-- Product Plans Right Column -->
          <div class="w-full xl:w-2/3 flex flex-col bg-base-100">
            <!-- Header Plans -->
            <div
              class="p-6 md:px-8 md:pt-8 md:pb-4 flex items-center justify-between border-b border-base-200"
            >
              <h4 class="text-xl font-bold uppercase tracking-tight text-base-content">
                Planos da Oferta
              </h4>
              <button
                @click="() => openPlanModal(product.id)"
                class="btn btn-sm btn-ghost hover:bg-neutral hover:text-neutral-content rounded-sm font-bold uppercase tracking-wide"
              >
                + Novo Plano
              </button>
            </div>

            <!-- List Plans -->
            <div class="p-6 md:p-8 flex-1 flex flex-col bg-base-100">
              <div
                v-if="product.plans.length === 0"
                class="flex-1 flex flex-col items-center justify-center py-12 text-base-content/50 border-2 border-dashed border-base-200 bg-base-200/20 rounded-sm"
              >
                <p class="mb-4 text-lg">Este produto possui nenhum plano.</p>
                <button
                  @click="() => openPlanModal(product.id)"
                  class="btn btn-outline btn-sm rounded-sm font-bold uppercase"
                >
                  Começar
                </button>
              </div>

              <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-5 auto-rows-max">
                <div
                  v-for="plan in product.plans"
                  :key="plan.id"
                  class="border border-base-300 hover:border-neutral p-5 flex flex-col justify-between group/plan transition-colors duration-200 rounded-sm relative overflow-hidden bg-base-100 shadow-sm hover:shadow-md"
                >
                  <!-- Highlight Bar Minimalist -->
                  <div
                    class="absolute top-0 left-0 w-1 h-full bg-base-300 group-hover/plan:bg-primary transition-colors"
                  ></div>

                  <div class="pl-3 mb-6">
                    <div class="flex justify-between items-start gap-2 mb-2">
                      <h5
                        class="text-lg font-bold text-base-content leading-tight truncate"
                        :title="plan.name"
                      >
                        {{ plan.name }}
                      </h5>
                      <button
                        @click="() => openPlanModal(product.id, plan)"
                        class="btn btn-xs btn-ghost btn-square mt-0.5 opacity-0 group-hover/plan:opacity-100 hover:bg-neutral hover:text-neutral-content text-base-content/50 transition-opacity"
                        title="Editar Plano"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="2"
                          stroke="currentColor"
                          class="w-4 h-4"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                          />
                        </svg>
                      </button>
                    </div>
                    <p
                      v-if="plan.description"
                      class="text-sm text-base-content/70 line-clamp-2 h-10"
                    >
                      {{ plan.description }}
                    </p>
                    <p v-else class="text-sm text-base-content/40 italic h-10">
                      Sem condições exatas.
                    </p>
                  </div>

                  <div
                    class="pl-3 mt-auto flex items-end justify-between border-t border-base-100 group-hover/plan:border-base-200 pt-3 transition-colors"
                  >
                    <span class="text-xs font-bold text-base-content/50 uppercase tracking-widest"
                      >Valor</span
                    >
                    <span class="text-2xl font-black text-base-content">
                      <span class="text-sm mr-0.5 text-base-content/60">R$</span
                      ><!--
                        -->{{ plan.price.toFixed(2).replace('.', ',') }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </main>
  </div>

  <!-- PRODUCT MODAL -->
  <dialog ref="productModalRef" class="modal modal-bottom sm:modal-middle backdrop-blur-sm">
    <div
      class="modal-box rounded-sm p-0 overflow-hidden shadow-2xl border border-neutral sm:max-w-md"
    >
      <div class="bg-neutral text-neutral-content p-5 flex justify-between items-center">
        <h3 class="font-extrabold text-xl uppercase tracking-tight">
          {{ productForm.id ? 'Editar Produto' : 'Cadastrar Produto' }}
        </h3>
        <form method="dialog">
          <button
            class="btn btn-sm btn-square btn-ghost text-neutral-content hover:bg-transparent hover:text-neutral-content"
          >
            ✕
          </button>
        </form>
      </div>

      <form @submit.prevent="submitProduct" class="p-6 flex flex-col gap-6 bg-base-100">
        <fieldset class="fieldset">
          <legend class="fieldset-legend font-bold text-base-content uppercase tracking-wider mb-2">
            Nome do Produto <span class="text-error">*</span>
          </legend>
          <input
            v-model="productForm.name"
            type="text"
            class="input border border-base-300 border-base-300 focus:border-neutral rounded-sm w-full"
            placeholder="Ex: Acesso Premium"
            required
          />
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend font-bold text-base-content uppercase tracking-wider mb-2">
            Detalhes
          </legend>
          <textarea
            v-model="productForm.description"
            class="textarea border border-base-300 border-base-300 focus:border-neutral rounded-sm w-full h-24"
            placeholder="Descrição dos benefícios..."
          ></textarea>
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend font-bold text-base-content uppercase tracking-wider mb-2">
            Imagem URL
          </legend>
          <input
            v-model="productForm.imageLink"
            type="url"
            class="input border border-base-300 border-base-300 focus:border-neutral rounded-sm w-full"
            placeholder="https://..."
          />
        </fieldset>

        <div class="mt-2 flex gap-3">
          <button
            type="button"
            @click="closeProductModal"
            class="btn btn-outline border-base-300 hover:border-neutral grow rounded-sm uppercase font-bold tracking-wider"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="btn btn-neutral border-neutral grow rounded-sm uppercase font-bold tracking-wider"
            :disabled="submittingProduct"
          >
            <span v-if="submittingProduct" class="loading loading-spinner loading-sm"></span>
            Salvar
          </button>
        </div>
      </form>
    </div>
    <form method="dialog" class="modal-backdrop bg-base-300/60"><button>Fechar</button></form>
  </dialog>

  <!-- PLAN MODAL -->
  <dialog ref="planModalRef" class="modal modal-bottom sm:modal-middle backdrop-blur-sm">
    <div
      class="modal-box rounded-sm p-0 overflow-hidden shadow-2xl border border-primary sm:max-w-md"
    >
      <div class="bg-primary text-primary-content p-5 flex justify-between items-center">
        <h3 class="font-extrabold text-xl uppercase tracking-tight">
          {{ planForm.id ? 'Editar Oferta' : 'Nova Oferta' }}
        </h3>
        <form method="dialog">
          <button
            class="btn btn-sm btn-square btn-ghost text-primary-content hover:bg-transparent hover:text-primary-content"
          >
            ✕
          </button>
        </form>
      </div>

      <form @submit.prevent="submitPlan" class="p-6 flex flex-col gap-6 bg-base-100">
        <fieldset class="fieldset">
          <legend class="fieldset-legend font-bold text-base-content uppercase tracking-wider mb-2">
            Produto <span class="text-error">*</span>
          </legend>
          <select
            v-model.number="planForm.productId"
            class="select border border-base-300 border-base-300 focus:border-primary rounded-sm w-full"
            required
          >
            <option :value="0" disabled>Selecione um produto</option>
            <option v-for="product in products" :key="product.id" :value="product.id">
              {{ product.name }}
            </option>
          </select>
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend font-bold text-base-content uppercase tracking-wider mb-2">
            Nome <span class="text-error">*</span>
          </legend>
          <input
            v-model="planForm.name"
            type="text"
            class="input border border-base-300 border-base-300 focus:border-primary rounded-sm w-full"
            placeholder="Ex: Mensal Básico"
            required
          />
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend font-bold text-base-content uppercase tracking-wider mb-2">
            Condições
          </legend>
          <textarea
            v-model="planForm.description"
            class="textarea border border-base-300 border-base-300 focus:border-primary rounded-sm w-full h-20"
            placeholder="Benefícios específicos deste plano..."
          ></textarea>
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend font-bold text-base-content uppercase tracking-wider mb-2">
            Preço (R$) <span class="text-error">*</span>
          </legend>
          <input
            v-model="planForm.price"
            type="number"
            min="0.01"
            step="0.01"
            class="input border border-base-300 border-base-300 focus:border-primary rounded-sm w-full font-bold text-lg"
            placeholder="0.00"
            required
          />
        </fieldset>

        <div class="mt-2 flex gap-3">
          <button
            type="button"
            @click="closePlanModal"
            class="btn btn-outline border-base-300 hover:border-primary hover:bg-transparent hover:text-primary grow rounded-sm uppercase font-bold tracking-wider"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="btn btn-primary border-primary grow rounded-sm uppercase font-bold tracking-wider"
            :disabled="submittingPlan"
          >
            <span v-if="submittingPlan" class="loading loading-spinner loading-sm"></span>
            Salvar
          </button>
        </div>
      </form>
    </div>
    <form method="dialog" class="modal-backdrop bg-base-300/60"><button>Fechar</button></form>
  </dialog>

  <!-- TOASTS -->
  <div class="toast toast-bottom toast-center sm:toast-end sm:toast-bottom z-50 p-4">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="alert shadow-xl min-w-[300px] border-l-8 rounded-sm flex flex-row p-4"
      :class="{
        'alert-info border-info bg-base-100 text-base-content': toast.type === 'info',
        'alert-success border-success bg-base-100 text-base-content': toast.type === 'success',
        'alert-error border-error bg-base-100 text-base-content': toast.type === 'error',
      }"
    >
      <div class="flex items-center gap-3 w-full">
        <svg
          v-if="toast.type === 'success'"
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6 shrink-0 text-success"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="square"
            stroke-linejoin="miter"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <svg
          v-else-if="toast.type === 'error'"
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6 shrink-0 text-error"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="square"
            stroke-linejoin="miter"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6 shrink-0 text-info"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="square"
            stroke-linejoin="miter"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span class="font-bold text-sm tracking-wide uppercase">{{ toast.message }}</span>
      </div>
    </div>
  </div>
</template>
