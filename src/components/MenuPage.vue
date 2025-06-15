<template>
  <div class="bg-gray-900 min-h-screen text-white p-4 pb-20">
    <h1 class="text-2xl font-bold mb-4">🍽 Menyu</h1>

    <!-- Foydalanuvchi holati -->
    <div v-if="cartStore.user" class="mb-4">
      <p>Xush kelibsiz, {{ cartStore.user.name }}!</p>
      <p v-if="cartStore.orderSuccess" class="text-green-500">
        ✅ Buyurtma qabul qilindi!
        <a :href="`https://t.me/${botUsername}?start=order_success`" class="text-orange-500 underline">Botga qaytish</a>
      </p>
      <button @click="logout" class="text-orange-500">Chiqish</button>
    </div>

    <!-- Telegram login -->
    <div v-else>
      <p>Telegram orqali tizimga kiring:</p>
      <div id="telegram-login-widget"></div>
    </div>

    <!-- Qidiruv -->
    <div v-if="cartStore.user" class="flex items-center gap-2 mb-4">
      <input
        v-model="search"
        type="text"
        placeholder="Qidiruv..."
        class="flex-1 p-2 rounded-lg bg-gray-800 text-white placeholder-gray-400"
      />
      <button @click="fetchMenu" class="bg-orange-500 px-4 py-2 rounded-lg">🔍</button>
    </div>

    <!-- Kategoriyalar -->
    <div v-if="cartStore.user" class="flex gap-2 mb-4 overflow-x-auto pb-1">
      <button
        v-for="category in categories"
        :key="category"
        @click="activeCategory = category"
        :class="[
          'px-4 py-2 rounded-full text-sm font-medium transition-all',
          activeCategory === category
            ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white'
            : 'bg-gray-800 text-gray-300',
        ]"
      >
        {{ categoryNames[category] || category }}
      </button>
      <button
        @click="activeCategory = 'Barchasi'"
        :class="[
          'px-4 py-2 rounded-full text-sm font-medium transition-all',
          activeCategory === 'Barchasi'
            ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white'
            : 'bg-gray-800 text-gray-300',
        ]"
      >
        Barchasi
      </button>
    </div>

    <!-- Menyu kartalari -->
    <div v-if="cartStore.user" class="grid grid-cols-2 gap-4">
      <div
        v-for="item in filteredMenu"
        :key="item.id"
        class="bg-gray-800 rounded-xl p-2 relative hover:scale-[1.02] transition-transform"
        @click="goToDetail(item)"
      >
        <div
          v-if="item.discount"
          class="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full z-10"
        >
          -{{ item.discount }}%
        </div>
        <img
          :src="item.photo_id ? `https://api.telegram.org/file/bot${botToken}/${item.photo_id}` : 'https://via.placeholder.com/150'"
          :alt="item.name"
          class="w-full h-24 object-cover rounded-lg mb-2"
        />
        <div class="text-sm font-medium line-clamp-1">{{ item.name }}</div>
        <div class="flex items-center justify-between mt-1">
          <div>
            <p v-if="item.discount" class="text-xs text-gray-400 line-through">{{ item.price }} UZS</p>
            <p class="text-orange-500 font-medium">
              {{ item.discount ? Math.round(item.price * (1 - item.discount / 100)) : item.price }} UZS
            </p>
          </div>
          <button
            class="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
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
      botToken: import.meta.env.VITE_BOT_TOKEN,
      botUsername: import.meta.env.VITE_BOT_USERNAME,
      apiUrl: 'https://restoran-backend.onrender.com',
      categoryNames: {
        food: 'Taomlar',
        drink: 'Ichimliklar',
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
  mounted() {
    this.fetchMenu()

    const urlParams = new URLSearchParams(window.location.search)
    const telegramId = urlParams.get('telegram_id')

    if (telegramId && !this.cartStore.user) {
      this.checkTelegramAuth(telegramId)
    }

    if (window.location.search.includes('order_success')) {
      this.cartStore.orderSuccess = true
    }

    this.setupTelegramLogin()
  },
  methods: {
    async fetchMenu() {
      try {
        const res = await axios.get(`$https://restoran-backend.onrender.com/api/menu`, { withCredentials: true })
        this.menu = res.data
        this.categories = [...new Set(this.menu.map(i => i.category))]
      } catch (err) {
        console.error('❌ Menyu yuklanmadi:', err)
      }
    },
    async checkTelegramAuth(telegramId) {
      try {
        const res = await axios.get(`https://restoran-backend.onrender.com/api/auth/check?telegram_id=${telegramId}`, {
          withCredentials: true,
        })
        this.cartStore.setUser(res.data.user)
        this.fetchMenu()
      } catch (err) {
        console.error('❌ Telegram ID tekshirishda xatolik:', err)
        this.setupTelegramLogin()
      }
    },
    setupTelegramLogin() {
      if (!window.Telegram) return
      const script = document.createElement('script')
      script.src = 'https://telegram.org/js/telegram-widget.js?22'
      script.setAttribute('data-telegram-login', this.botUsername.replace('@', ''))
      script.setAttribute('data-size', 'large')
      script.setAttribute('data-onauth', 'onTelegramAuth(user)')
      script.setAttribute('data-request-access', 'write')
      document.getElementById('telegram-login-widget').appendChild(script)

      window.onTelegramAuth = async (user) => {
        try {
          const res = await axios.post(`https://restoran-backend.onrender.com/api/auth`, { user }, { withCredentials: true })
          this.cartStore.setUser(res.data.user)
          this.fetchMenu()
        } catch (err) {
          console.error('❌ Telegram login xatosi:', err)
        }
      }
    },
    goToDetail(item) {
      this.$router.push({ name: 'ItemDetail', params: { id: item.id } })
    },
    logout() {
      this.cartStore.clearUser()
      axios.post(`https://restoran-backend.onrender.com/api/logout`, {}, { withCredentials: true })
    },
  },
}
</script>
