<template>
  <div class="bg-gray-900 min-h-screen text-white p-4 pb-20">
    <!-- Ortga tugmasi -->
    <button @click="$router.back()" class="text-orange-400 mb-4">← Ortga</button>

    <!-- Mahsulot tafsilotlari -->
    <div v-if="item" class="space-y-4">
      <img
        :src="item.photo_id ? `https://api.telegram.org/file/bot${botToken}/${item.photo_id}` : 'https://via.placeholder.com/150'"
        class="rounded-lg w-full h-48 object-cover"
        :alt="item.name"
      />
      <h2 class="text-2xl font-bold">{{ item.name }}</h2>
      <p v-if="item.description" class="text-sm text-gray-400">{{ item.description }}</p>

      <div class="text-lg font-semibold">
        <p v-if="item.discount" class="text-sm text-gray-400 line-through">{{ item.price }} UZS</p>
        <p class="text-orange-500">
          {{ item.discount ? Math.round(item.price * (1 - item.discount / 100)) : item.price }} UZS
        </p>
      </div>

      <button
        @click="cartStore.addToCart(item)"
        class="bg-orange-500 px-4 py-2 rounded-lg text-white hover:bg-orange-600 transition"
      >
        🛒 Savatga qo‘shish
      </button>
    </div>

    <!-- Yuklanmoqda -->
    <div v-else class="text-center text-gray-400 mt-10">
      ⏳ Mahsulot yuklanmoqda...
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { useCartStore } from '../stores/cart'

export default {
  name: 'ItemDetail',
  setup() {
    const cartStore = useCartStore()
    return { cartStore }
  },
  data() {
    return {
      item: null,
      botToken: '8193733999:AAG4OP79grKc9XbJ8j0mwXl7H4oe9Z2PYl0' ,
      apiUrl:' https://restoran-backend.onrender.com',
    }
  },
  async mounted() {
    const id = parseInt(this.$route.params.id)
    try {
      const response = await axios.get(`${this.apiUrl}/api/menu`, {
        withCredentials: true,
      })
      this.item = response.data.find((i) => i.id === id)
    } catch (error) {
      console.error('❌ Mahsulot yuklashda xatolik:', error)
    }
  },
}
</script>
