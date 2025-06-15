<template>
  <div class="bg-gray-900 min-h-screen text-white p-4 pb-20">
    <button @click="$router.back()" class="text-orange-400 mb-4">← Ortga</button>
    <div v-if="item" class="space-y-4">
      <img
        :src="item.photo_id ? `https://api.telegram.org/file/bot${botToken}/${item.photo_id}` : 'https://via.placeholder.com/150'"
        class="rounded-lg w-full h-40 object-cover"
      />
      <h2 class="text-2xl font-bold">{{ item.name }}</h2>
      <p class="text-orange-500 text-lg font-semibold">
        {{ item.discount ? Math.round(item.price * (1 - item.discount / 100)) : item.price }} UZS
      </p>
      <button
        @click="cartStore.addToCart(item)"
        class="bg-orange-500 px-4 py-2 rounded-lg text-white"
      >
        Savatga qo‘shish
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { useCartStore } from '../stores/cart';

export default {
  name: 'ItemDetail',
  data() {
    return {
      item: null,
      botToken: import.meta.env.VITE_BOT_TOKEN || 'YOUR_BOT_TOKEN',
    };
  },
  setup() {
    return { cartStore: useCartStore() };
  },
  async mounted() {
    const id = parseInt(this.$route.params.id);
    try {
      const response = await axios.get(`http://localhost:8000/api/menu`);
      this.item = response.data.find(i => i.id === id);
    } catch (error) {
      console.error('Mahsulot yuklashda xatolik:', error);
    }
  },
};
</script>