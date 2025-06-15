import { createRouter, createWebHistory } from 'vue-router';
import MenuPage from '../components/MenuPage.vue';
import ItemDetail from '../components/ItemDetail.vue';
import Cart from '../components/Cart.vue'

import OrderHistory from '../components/OrderHistory.vue';
const routes = [
  { path: '/', component: MenuPage },
  { path: '/item/:id', component: ItemDetail },
  {path:'/cart', component:Cart},
  {path:'/ordersHistory', component:OrderHistory},
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
