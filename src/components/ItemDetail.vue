<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white px-4 py-6">
    <!-- Ortga tugmasi -->
    <button
      @click="$router.back()"
      class="text-orange-400 mb-6 flex items-center hover:text-orange-500 transition"
    >
      ← Ortga
    </button>

    <!-- Mahsulot tafsilotlari -->
    <div v-if="item" class="space-y-6 bg-gray-800 rounded-xl p-6 shadow-md">
      <img
        :src="item.photo_id ? `https://api.telegram.org/file/bot${botToken}/${item.photo_id}` : 'https://via.placeholder.com/150'"
        class="rounded-lg w-full h-64 object-cover"
        :alt="item.name"
      />
      <h2 class="text-3xl font-bold tracking-tight">{{ item.name }}</h2>
      <p v-if="item.description" class="text-md text-gray-300">{{ item.description }}</p>

      <div class="text-xl font-semibold">
        <p v-if="item.discount" class="text-sm text-gray-400 line-through">{{ item.price }} UZS</p>
        <p class="text-orange-500">
          {{ item.discount ? Math.round(item.price * (1 - item.discount / 100)) : item.price }} UZS
        </p>
      </div>

      <button
        @click="cartStore.addToCart(item)"
        class="w-full bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3 rounded-lg text-white font-semibold hover:shadow-lg transition-all"
      >
        🛒 Savatga qo‘shish
      </button>
    </div>

    <!-- Yuklanmoqda yoki xatolik -->
    <div v-else class="text-center py-12">
      <p v-if="authError" class="text-red-400 mb-4">{{ authError }}</p>
      <p v-else class="text-gray-400">⏳ Mahsulot yuklanmoqda...</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { useCartStore } from '../stores/cart';

export default {
  name: 'ItemDetail',
  setup() {
    const cartStore = useCartStore();
    return { cartStore };
  },
  data() {
    return {
      item: null,
      authError: '',
      botToken: import.meta.env.VITE_BOT_TOKEN || '8193733999:AAG4OP79grKc9XbJ8j0mwXl7H4oe9Z2PYl0',
      apiUrl: import.meta.env.VITE_API_URL || 'https://restoran-backend.onrender.com',
    };
  },
  async mounted() {
    const id = parseInt(this.$route.params.id);
    await this.fetchItem(id);
  },
  methods: {
    async fetchItem(id) {
      try {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
          this.authError = 'Tizimga kirish talab qilinadi.';
          return;
        }
        const response = await axios.get(`${this.apiUrl}/api/menu/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.item = response.data;
        this.authError = '';
        console.log('✅ Mahsulot yuklandi:', this.item);
      } catch (error) {
        console.error('❌ Mahsulot yuklashda xatolik:', error.response?.data || error.message);
        this.authError = error.response?.status === 401
          ? 'Sessiya muddati tugadi, iltimos qayta kiring.'
          : 'Mahsulot yuklanmadi, qayta urinib ko‘ring.';
        if (error.response?.status === 401) {
          localStorage.removeItem('jwt_token');
          this.cartStore.clearUser();
        }
      }
    },
  },
};
</script>

<style scoped>
/* Stiller hozircha minimal, Tailwind bilan boshqariladi */
</style>