<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white px-4 py-6">
    <!-- Header -->
    <header class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-extrabold tracking-tight flex items-center">
        <span class="mr-2">🍽</span> Menyu
      </h1>
      <button v-if="cartStore.user" @click="logout" class="text-orange-400 hover:text-orange-500 font-medium transition">
        Chiqish
      </button>
    </header>

    <!-- Foydalanuvchi holati -->
    <div v-if="cartStore.user" class="mb-6 bg-gray-800 rounded-xl p-4 shadow-lg">
      <p class="text-lg font-semibold">Xush kelibsiz, {{ cartStore.user.name }}!</p>
      <p v-if="cartStore.orderSuccess" class="text-green-400 mt-2 flex items-center">
        <span class="mr-2">✅</span> Buyurtma qabul qilindi!
        <a :href="`https://t.me/${botUsername}?start=order_success`" class="text-orange-400 underline ml-2 hover:text-orange-500">
          Botga qaytish
        </a>
      </p>
    </div>

    <!-- Telegram login -->
    <div v-else class="text-center py-12">
      <p class="text-xl mb-4 font-medium">Telegram orqali tizimga kiring</p>
      <div id="telegram-login-widget" class="inline-block mb-4"></div>
      <p v-if="authError" class="text-red-400 mb-4">{{ authError }}</p>
      <a
        :href="`https://t.me/${botUsername}?start=menu`"
        class="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-xl transition-shadow"
      >
        @{{ botUsername }} orqali kirish
      </a>
    </div>

    <!-- Qidiruv va kategoriyalar -->
    <div v-if="cartStore.user" class="space-y-4">
      <!-- Qidiruv -->
      <div class="flex items-center gap-3">
        <input
          v-model="search"
          type="text"
          placeholder="Taom qidirish..."
          class="flex-1 p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
        />
        <button @click="fetchMenu" class="bg-orange-400 text-white px-4 py-3 rounded-lg hover:bg-orange-500 transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>

      <!-- Kategoriyalar -->
      <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-hidden">
        <button
          v-for="category in categories"
          :key="category"
          @click="activeCategory = category"
          :class="[
            'px-4 py-2 rounded-full text-sm font-semibold transition-all flex-shrink-0',
            activeCategory === category
              ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
          ]"
        >
          {{ categoryNames[category] || category }}
        </button>
        <button
          @click="activeCategory = 'Barchasi'"
          :class="[
            'px-4 py-2 rounded-full text-sm font-semibold transition-all flex-shrink-0',
            activeCategory === 'Barchasi'
              ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
          ]"
        >
          Barchasi
        </button>
      </div>
    </div>

    <!-- Menyu kartalari -->
    <div v-if="cartStore.user" class="grid grid-cols-2 gap-4 mt-6 sm:grid-cols-3 md:grid-cols-4">
      <div
        v-for="item in filteredMenu"
        :key="item.id"
        class="bg-gray-800 rounded-xl p-3 shadow-md hover:shadow-xl transition-all cursor-pointer"
        @click="goToDetail(item)"
      >
        <div
          v-if="item.discount"
          class="absolute top-2 left-2 bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-1 rounded-full"
        >
          -{{ item.discount }}%
        </div>
        <img
          :src="item.photo_id ? `${apiUrl}/static/${item.photo_id}` : 'https://via.placeholder.com/150'"
          :alt="item.name"
          class="w-full h-32 object-cover rounded-lg mb-3"
        />
        <h3 class="text-sm font-semibold line-clamp-1">{{ item.name }}</h3>
        <div class="flex items-center justify-between mt-2">
          <div>
            <p v-if="item.discount" class="text-xs text-gray-400 line-through">{{ item.price }} so‘m</p>
            <p class="text-orange-400 font-bold">
              {{ item.discount ? Math.round(item.price * (1 - item.discount / 100)) : item.price }} so‘m
            </p>
          </div>
          <button
            class="bg-orange-400 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-orange-500 transition"
            @click.stop="cartStore.addToCart(item)"
          >
            +
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { useCartStore } from '../stores/cart'

export default {
  name: 'MenuPage',
  setup() {
    const cartStore = useCartStore()
    return { cartStore }
  },
  data() {
    return {
      menu: [],
      search: '',
      activeCategory: 'Barchasi',
      categories: [],
      botUsername: import.meta.env.VITE_BOT_USERNAME || '@taom_buyurtma_bot',
      apiUrl: import.meta.env.VITE_API_URL || 'https://restoran-backend.onrender.com',
      authError: '',
      categoryNames: {
        food: '🍲 Taomlar',
        drink: '🥤 Ichimliklar',
      },
    }
  },
  computed: {
    filteredMenu() {
      let filtered = this.menu
      if (this.search) {
        filtered = filtered.filter(item =>
          item.name.toLowerCase().includes(this.search.toLowerCase())
        )
      }
      if (this.activeCategory !== 'Barchasi') {
        filtered = filtered.filter(item => item.category === this.activeCategory)
      }
      return filtered
    },
  },
  async mounted() {
    await this.checkAuth()
    this.setupTelegramLogin()

    const urlParams = new URLSearchParams(window.location.search)
    const telegramId = urlParams.get('telegram_id')
    if (telegramId && !this.cartStore.user) {
      await this.handleTelegramRedirect(telegramId)
    }

    if (window.location.search.includes('order_success')) {
      this.cartStore.orderSuccess = true
      setTimeout(() => {
        this.cartStore.orderSuccess = false
      }, 5000)
    }
  },
  methods: {
    async fetchMenu() {
      try {
        const token = localStorage.getItem('jwt_token')
        if (!token) {
          this.authError = 'Tizimga kirish talab qilinadi.'
          return
        }
        const res = await axios.get(`${this.apiUrl}/api/menu`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.menu = res.data
        this.categories = [...new Set(this.menu.map(i => i.category))]
        this.authError = ''
        console.log('✅ Menyu yuklandi:', res.data)
      } catch (err) {
        console.error('❌ Menyu yuklanmadi:', err.response?.data || err.message)
        this.authError = 'Menyu yuklanmadi, iltimos qayta kiring.'
        if (err.response?.status === 401) {
          localStorage.removeItem('jwt_token')
          this.cartStore.clearUser()
        }
      }
    },
    async checkAuth() {
      try {
        const token = localStorage.getItem('jwt_token')
        if (!token) {
          console.log('ℹ️ Token topilmadi, autentifikatsiya talab qilinadi')
          return
        }
        const res = await axios.get(`${this.apiUrl}/api/auth/check`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.cartStore.setUser(res.data.user)
        await this.fetchMenu()
        console.log('✅ Auth tekshirildi:', res.data.user)
      } catch (err) {
        console.error('❌ Auth tekshirishda xatolik:', err.response?.data || err.message)
        localStorage.removeItem('jwt_token')
        this.cartStore.clearUser()
        this.authError = 'Sessiya muddati tugadi, iltimos qayta kiring.'
      }
    },
    async handleTelegramRedirect(telegramId) {
      try {
        const res = await axios.post(`${this.apiUrl}/telegram-auth`, {
          id: telegramId,
          first_name: 'Unknown'
        })
        if (res.data.success) {
          localStorage.setItem('jwt_token', res.data.token)
          this.cartStore.setUser(res.data.user)
          await this.fetchMenu()
          this.authError = ''
          console.log('✅ Telegram redirect autentifikatsiyasi muvaffaqiyatli:', res.data.user)
        } else {
          this.authError = res.data.message || 'Telegram autentifikatsiyasi muvaffaqiyatsiz.'
        }
      } catch (err) {
        console.error('❌ Telegram redirect xatosi:', err.response?.data || err.message)
        this.authError = 'Telegram orqali kirishda xatolik, botdan foydalaning.'
      }
    },
    setupTelegramLogin() {
      if (!window.Telegram) {
        console.error('❌ Telegram SDK yuklanmadi')
        this.authError = 'Telegram SDK yuklanmadi, bot orqali kiring.'
        return
      }
      const script = document.createElement('script')
      script.src = 'https://telegram.org/js/telegram-widget.js?22'
      script.async = true
      script.setAttribute('data-telegram-login', this.botUsername.replace('@', ''))
      script.setAttribute('data-size', 'large')
      script.setAttribute('data-onauth', 'onTelegramAuth(user)')
      script.setAttribute('data-request-access', 'write')
      document.getElementById('telegram-login-widget').appendChild(script)

      window.onTelegramAuth = async (user) => {
        try {
          console.log('Telegram user data:', user)
          const res = await axios.post(`${this.apiUrl}/telegram-auth`, user)
          if (res.data.success) {
            localStorage.setItem('jwt_token', res.data.token)
            this.cartStore.setUser(res.data.user)
            await this.fetchMenu()
            this.authError = ''
            console.log('✅ Telegram login muvaffaqiyatli:', res.data.user)
          } else {
            this.authError = res.data.message || 'Telegram autentifikatsiyasi muvaffaqiyatsiz.'
          }
        } catch (err) {
          console.error('❌ Telegram login xatosi:', err.response?.data || err.message)
          this.authError = 'Telegram orqali kirishda xatolik, botdan foydalaning.'
        }
      }
    },
    goToDetail(item) {
      this.$router.push({ name: 'ItemDetail', params: { id: item.id } })
    },
    async logout() {
      try {
        await axios.post(`${this.apiUrl}/logout`)
        localStorage.removeItem('jwt_token')
        this.cartStore.clearUser()
        this.menu = []
        this.categories = []
        this.authError = ''
        console.log('✅ Sessiya yopildi')
      } catch (err) {
        console.error('❌ Chiqishda xatolik:', err.response?.data || err.message)
        this.authError = 'Chiqishda xatolik yuz berdi.'
      }
    },
  },
}
</script>

<style scoped>
/* Scrollbar-ni yashirish */
.scrollbar-hidden::-webkit-scrollbar {
  display: none;
}
.scrollbar-hidden {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>