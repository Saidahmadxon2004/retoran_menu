<template>
  <div class="bg-gray-900 min-h-screen text-white p-4 pb-20">
    <h1 class="text-2xl font-bold mb-4">📦 Buyurtma Tarixi</h1>

    <div v-if="!cartStore.user" class="text-center text-gray-400 mt-10">
      Buyurtma tarixini ko‘rish uchun Telegram orqali kiring.
    </div>
    <div v-else-if="orders.length === 0" class="text-center text-gray-400 mt-10">
      Hech qanday buyurtma mavjud emas.
    </div>

    <div v-else class="space-y-6">
      <div
        v-for="order in orders"
        :key="order.id"
        class="bg-gray-800 p-4 rounded-lg"
      >
        <div class="text-sm text-gray-400 mb-2">📅 {{ formatDate(order.created_at) }}</div>
        <div class="space-y-2">
          <div
            v-for="item in order.items"
            :key="item.id"
            class="flex items-center justify-between border-b border-gray-700 pb-1"
          >
            <div class="text-sm">{{ item.item_name }} (x{{ item.quantity }})</div>
            <div class="text-orange-400 text-sm">
              {{ (item.discount ? Math.round(item.price * (1 - item.discount / 100)) : item.price) * item.quantity }} UZS
            </div>
          </div>
        </div>
        <div class="text-right font-semibold mt-2">
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
    };
  },
  setup() {
    return { cartStore: useCartStore() };
  },
  methods: {
    async fetchOrders() {
      if (!this.cartStore.user) return;
      try {
        const response = await axios.get(`http://localhost:8000/api/orders/${this.cartStore.user.telegram_id}`);
        this.orders = response.data.map(order => ({
          ...order,
          items: [{
            id: order.id,
            item_name: order.item_name,
            quantity: order.quantity,
            price: order.price,
            discount: order.discount,
          }],
          created_at: order.created_at,
        }));
      } catch (error) {
        console.error('Buyurtma tarixini yuklashda xatolik:', error);
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
      return new Date(date).toLocaleString('uz-UZ');
    },
  },
  mounted() {
    this.fetchOrders();
  },
};
</script>