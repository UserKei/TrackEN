import { createRouter, createWebHistory } from "vue-router";
import home from "./home/index";
import wordBook from "./word-book/index";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...home, // 主页
    ...wordBook, // 词库
  ],
});

export default router;
