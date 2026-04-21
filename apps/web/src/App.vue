<template>
  <RouterView />
  <Search />
  <Login />
</template>

<script>
import { RouterView } from 'vue-router'
import Search from '@/components/Search/index.vue'
import Login from '@/components/Login/index.vue'
</script>