import { defineStore } from 'pinia';
import axios from 'axios';

export const useCartStore = defineStore('cart', {
  state: () => ({
    cart: [],
    user: null,
    orderSuccess: false,
  }),
  actions: {
    async addToCart(item) {
      if (!this.user) {
        alert('Iltimos, avval Telegram orqali kiring!');
        return;
      }
      const existing = this.cart.find(i => i.id === item.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        this.cart.push({ ...item, quantity: 1 });
      }
    },
    increase(item) {
      const cartItem = this.cart.find(i => i.id === item.id);
      if (cartItem) cartItem.quantity += 1;
    },
    decrease(item) {
      const cartItem = this.cart.find(i => i.id === item.id);
      if (cartItem.quantity > 1) {
        cartItem.quantity -= 1;
      } else {
        this.cart = this.cart.filter(i => i.id !== item.id);
      }
    },
    async placeOrder() {
      if (!this.user) {
        alert('Iltimos, avval Telegram orqali kiring!');
        return;
      }
      try {
        for (const item of this.cart) {
          await axios.post('https://restoran-backend.onrender.com/api/orders', {
            user_id: this.user.telegram_id,
            item_id: item.id,
            quantity: item.quantity,
          });
        }
        this.orderSuccess = true;
        this.cart = [];
      } catch (error) {
        console.error('Buyurtma berishda xatolik:', error);
        alert('Buyurtma berishda xatolik yuz berdi!');
      }
    },
    setUser(user) {
      this.user = user;
    },
    clearUser() {
      this.user = null;
      this.cart = [];
      this.orderSuccess = false;
    },
  },
  getters: {
    totalPrice: state => {
      return state.cart.reduce((total, item) => {
        const price = item.discount
          ? Math.round(item.price * (1 - item.discount / 100))
          : item.price;
        return total + price * item.quantity;
      }, 0);
    },
    uniqueItemCount: state => state.cart.length,
  },
});