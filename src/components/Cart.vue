<template>
  <div class="bg-gray-900 min-h-screen text-white p-4 pb-20">
    <h1 class="text-2xl font-bold mb-4">🛒 Savat</h1>

    <!-- Bo‘sh savat holati -->
    <div v-if="cartStore.cart.length === 0" class="text-center text-gray-400 mt-10">
      Savat bo‘sh.
    </div>

    <!-- Savatdagi mahsulotlar -->
    <div v-else class="space-y-4">
      <div
        v-for="item in cartStore.cart"
        :key="item.id"
        class="bg-gray-800 p-3 rounded-lg flex items-center gap-4"
      >
        <img
          :src="item.photo_id ? `https://api.telegram.org/file/bot${botToken}/${item.photo_id}` : 'https://via.placeholder.com/150'"
          :alt="item.name"
          class="w-16 h-16 object-cover rounded"
        />
        <div class="flex-1">
          <h2 class="font-semibold text-sm">{{ item.name }}</h2>
          <p v-if="item.discount" class="text-xs text-gray-400 line-through">
            {{ item.price }} UZS
          </p>
          <p class="text-orange-400 text-sm font-semibold">
            {{ item.discount ? Math.round(item.price * (1 - item.discount / 100)) : item.price }} UZS
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button @click="cartStore.decrease(item)" class="qty-btn">−</button>
          <span>{{ item.quantity }}</span>
          <button @click="cartStore.increase(item)" class="qty-btn">+</button>
        </div>
      </div>

      <!-- Umumiy narx -->
      <div class="mt-6 text-right font-bold text-lg">
        Umumiy: <span class="text-orange-400">{{ cartStore.totalPrice }} UZS</span>
      </div>

      <!-- Buyurtma tugmasi -->
      <button
        @click="handleOrder"
        class="mt-4 w-full bg-gradient-to-r from-orange-400 to-pink-500 py-3 rounded-lg font-bold hover:opacity-90 transition"
      >
        Buyurtma berish
      </button>
    </div>
  </div>
</template>

<script>
import { useCartStore } from '../stores/cart';

export default {
  name: 'Cart',
  data() {
    return {
      botToken: import.meta.env.VITE_BOT_TOKEN || 'YOUR_BOT_TOKEN',
    };
  },
  setup() {
    return {
      cartStore: useCartStore(),
    };
  },
  methods: {
    handleOrder() {
      if (!this.cartStore.user) {
        alert("Iltimos, buyurtma berish uchun avval Telegram orqali tizimga kiring.");
        return;
      }
      this.cartStore.placeOrder();
    },
  },
};
</script>

<style scoped>
.qty-btn {
  background-color: #374151;
  padding: 0.3rem 0.7rem;
  border-radius: 0.375rem;
  font-size: 1.2rem;
  transition: 0.2s;
}
.qty-btn:hover {
  background-color: #4b5563;
}
</style>
