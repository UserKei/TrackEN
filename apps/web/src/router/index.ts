import { createRouter, createWebHistory } from "vue-router";
import home from "./home/index";
import wordBook from "./word-book/index";
import setting from "./setting/index";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...home, // 主页
    ...wordBook, // 词库
    ...setting, // 设置
  ],
});

export default router;
