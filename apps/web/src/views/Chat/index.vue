<template>
  <div class="w-[1200px] mx-auto flex mt-10">
    <Conversations @onGetRole="getRole" />
    <Bubble :list="list" @onSendMessage="sendMessage" />
  </div>
</template>
<script setup lang="ts">
import Conversations from './components/Conversations.vue';
import Bubble from './components/Bubble.vue';
import { useUserStore } from '@/stores/user';
import { ref } from 'vue';
import { getChatHistory } from '@/apis/chat';
import type { ChatDto, ChatMessage, ChatMessageList, ChatRoleType } from '@en/common/chat';
import { sse, CHAT_URL } from '@/apis/sse';

const userStore = useUserStore()
const userId = userStore.getUser?.id
const role = ref<ChatRoleType>('normal') // 当前消息模式对应的角色
const list = ref<ChatMessageList>([]) // 存储历史记录

const getRole = async (params: ChatRoleType) => {
  role.value = params
  const res = await getChatHistory(userId!, params)
  list.value = res.data
}

const sendMessage = (message: string, deepThink: boolean, webSearch: boolean) => {
  // console.log("message", message)
  list.value.push({
    role: 'human',
    content: message,
    type: 'chat',
  }) // 添加用户消息到列表
  list.value.push({
    role: 'ai',
    content: '',
    reasoning: '',
    type: 'chat',
  }) // 预先添加AI消息占位，后续通过SSE更新内容
  sse<ChatMessage, ChatDto>(CHAT_URL, "POST", {
    role: role.value,
    content: message,
    userId: userId!,
    deepThink: deepThink,
    webSearch: webSearch,
  }, (data) => {
    console.log("sendMessage data", data)
    const lastMessage = list.value[list.value.length - 1]
    if (lastMessage && lastMessage.role === 'ai') {
      if (data.type === 'reasoning')
        lastMessage.reasoning += data.content
      if (data.type === 'chat')
        lastMessage.content += data.content // 实时更新AI消息内容
    }
  })
}
</script>