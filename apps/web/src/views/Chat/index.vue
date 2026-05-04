<template>
  <div class="w-[1200px] mx-auto flex mt-10">
    <Conversations />
    <Bubble />
  </div>
</template>
<script setup lang="ts">
import Conversations from './components/Conversations.vue';
import Bubble from './components/Bubble.vue';
</script>