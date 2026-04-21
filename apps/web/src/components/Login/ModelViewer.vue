<template>
  <div class="relative w-[800px] h-full bg-linear-to-br from-gray-800 to-gray-900">
    <canvas class="w-full h-full" ref="canvasRef"></canvas>
    <div class="absolute top-6 left-6">
      <div class="flex items-center gap-2">
        <div
          class="w-10 h-10 bg-linear-to-br from-indigo-500 to-purple-600 rounded-[10px] flex items-center justify-center">
          <span class="text-white font-bold text-xl">E</span>
        </div>
        <span class="text-white text-xl font-bold">English App</span>
      </div>
    </div>
    <!-- 登录/注册切换按钮 -->
    <div class="absolute top-6 right-6">
      <div class="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-1">
        <button :class="loginClass">
          登录
        </button>
        <button :class="registerClass">
          注册
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
const type = ref<'login' | 'register'>('login')
const loginClass = computed(() => {
  return type.value === 'login' ? 'bg-indigo-500 text-white shadow-lg px-4 py-2 rounded-md text-sm font-medium transition-all' : 'text-white/70 hover:text-white hover:bg-white/10 px-4 py-2 rounded-md text-sm font-medium transition-all'
})
const registerClass = computed(() => {
  return type.value === 'register' ? 'bg-indigo-500 text-white shadow-lg px-4 py-2 rounded-md text-sm font-medium transition-all' : 'text-white/70 hover:text-white hover:bg-white/10 px-4 py-2 rounded-md text-sm font-medium transition-all'
})
</script>