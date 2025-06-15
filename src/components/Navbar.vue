<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-gray-800 text-white flex justify-around py-2 shadow-inner z-50">
    <!-- Menu -->
    <RouterLink
      to="/"
      class="flex flex-col items-center text-xs"
      :class="{ 'text-orange-400': $route.path === '/' }"
    >
      <span class="text-2xl">🍔</span>
      <span>Menu</span>
    </RouterLink>

    <!-- Savat -->
    <RouterLink
      to="/cart"
      class="flex flex-col items-center text-xs relative"
      :class="{ 'text-orange-400': $route.path === '/cart' }"
    >
      <span class="text-2xl relative">
        🛒
        <span
          v-if="cartStore.uniqueItemCount > 0"
          class="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full"
        >
          {{ cartStore.uniqueItemCount }}
        </span>
      </span>
      <span>Savat</span>
    </RouterLink>

    <!-- Buyurtmalar -->
    <RouterLink
      to="/ordersHistory"
      class="flex flex-col items-center text-xs"
      :class="{ 'text-orange-400': $route.path === '/ordersHistory' }"
    >
      <span class="text-2xl">📦</span>
      <span>Buyurtmalar</span>
    </RouterLink>
  </nav>
</template>

<script>
import { useCartStore } from '../stores/cart'

export default {
  name: 'Navbar',
  setup() {
    const cartStore = useCartStore()
    return { cartStore }
  },
}
</script>

<style scoped>
nav a {
  transition: 0.2s;
}
nav a:hover {
  transform: scale(1.05);
}
</style>
