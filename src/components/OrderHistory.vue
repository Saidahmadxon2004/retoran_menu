<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white px-4 py-6">
    <!-- Header -->
    <header class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-extrabold tracking-tight flex items-center">
        <span class="mr-2">📦</span> Buyurtma Tarixi
      </h1>
    </header>

    <!-- Foydalanuvchi holati -->
    <div v-if="!cartStore.user" class="text-center py-12 text-gray-400">
      <p class="text-xl mb-4">Buyurtma tarixini ko‘rish uchun Telegram orqali kiring</p>
      <a
        :href="`https://t.me/${botUsername}?start=menu`"
        class="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-xl transition-shadow"
      >
        @{{ botUsername }} orqali kirish
      </a>
    </div>

    <div v-else-if="orders.length === 0" class="text-center py-12 text-gray-400">
      <p class="text-xl">Hech qanday buyurtma mavjud emas</p>
    </div>

    <div v-else class="space-y-6">
      <div
        v-for="order in orders"
        :key="order.id"
        class="bg-gray-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-200"
      >
        <div class="text-sm text-gray-400 mb-2">📅 {{ formatDate(order.created_at) }}</div>
        <div class="space-y-2 divide-y divide-gray-700">
          <div
            v-for="item in order.items"
            :key="item.id"
            class="py-2 flex items-center justify-between"
          >
            <div class="text-sm">{{ item.item_name }} (x{{ item.quantity }})</div>
            <div class="text-orange-400 text-sm">
              {{ (item.discount ? Math.round(item.price * (1 - item.discount / 100)) : item.price) * item.quantity }} UZS
            </div>
          </div>
        </div>
        <div class="text-right font-semibold mt-3 text-lg">
          Umumiy: <span class="text-orange-500">{{ getOrderTotal(order) }} UZS</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { useCartStore } from '../stores/cart';

export default {
  name: 'OrderHistory',
  data() {
    return {
      orders: [],
      authError: '',
      botUsername: import.meta.env.VITE_BOT_USERNAME || '@taom_buyurtma_bot',
      apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    };
  },
  setup() {
    const cartStore = useCartStore();
    return { cartStore };
  },
  watch: {
    'cartStore.user'(newUser) {
      if (newUser) {
        this.fetchOrders();
      }
    },
  },
  methods: {
    async fetchOrders() {
      if (!this.cartStore.user) return;
      try {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
          this.authError = 'Tizimga kirish talab qilinadi.';
          return;
        }
        const response = await axios.get(`${this.apiUrl}/api/orders/${this.cartStore.user.telegram_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.orders = response.data.map(order => ({
          ...order,
          created_at: order.created_at,
          items: order.items || [{
            id: order.id,
            item_name: order.item_name || 'Noma’lum taom',
            quantity: order.quantity || 1,
            price: order.price || 0,
            discount: order.discount || 0,
          }],
        }));
        this.authError = '';
        console.log('✅ Buyurtma tarixi yuklandi:', this.orders);
      } catch (error) {
        console.error('❌ Buyurtma tarixini yuklashda xatolik:', error.response?.data || error.message);
        this.authError = error.response?.status === 401
          ? 'Sessiya muddati tugadi, iltimos qayta kiring.'
          : 'Buyurtma tarixini yuklashda xatolik, qayta urinib ko‘ring.';
        if (error.response?.status === 401) {
          localStorage.removeItem('jwt_token');
          this.cartStore.clearUser();
        }
      }
    },
    getOrderTotal(order) {
      return order.items.reduce(
        (total, item) =>
          total + (item.discount ? Math.round(item.price * (1 - item.discount / 100)) : item.price) * item.quantity,
        0
      );
    },
    formatDate(date) {
      return new Date(date).toLocaleString('uz-UZ', { dateStyle: 'medium', timeStyle: 'short' });
    },
  },
  mounted() {
    this.fetchOrders();
  },
};
</script>

<style scoped>
/* Stiller hozircha minimal, Tailwind bilan boshqariladi */
</style>