import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ChatSession, ChatMessage, AiContext } from '@/types/ai';
import { getSessions, createSession, deleteSession, getSession, sendMessage as apiSendMessage } from '@/api/ai';
import { useUserStore } from './user';
import { useNutritionStore } from './nutrition';
import { useActivityStore } from './activity';

export const useChatStore = defineStore('chat', () => {
  const sessions = ref<ChatSession[]>([]);
  const currentSessionId = ref<string | null>(null);
  const messages = ref<ChatMessage[]>([]);
  const loading = ref(false);
  const streaming = ref(false);

  const currentSession = computed(() =>
    sessions.value.find((s) => s.id === currentSessionId.value) ?? null
  );

  async function loadSessions() {
    sessions.value = await getSessions();
  }

  async function newSession() {
    const session = await createSession();
    sessions.value.unshift(session);
    currentSessionId.value = session.id;
    messages.value = [];
    return session;
  }

  async function switchSession(sessionId: string) {
    currentSessionId.value = sessionId;
    const session = await getSession(sessionId);
    messages.value = session?.messages ?? [];
  }

  async function removeSession(sessionId: string) {
    await deleteSession(sessionId);
    sessions.value = sessions.value.filter((s) => s.id !== sessionId);
    if (currentSessionId.value === sessionId) {
      if (sessions.value.length > 0) {
        await switchSession(sessions.value[0].id);
      } else {
        currentSessionId.value = null;
        messages.value = [];
      }
    }
  }

  function buildAiContext(): AiContext {
    const userStore = useUserStore();
    const nutritionStore = useNutritionStore();
    const activityStore = useActivityStore();

    return {
      userProfile: {
        gender: userStore.profile.gender,
        age: userStore.profile.age,
        height: userStore.profile.height,
        weight: userStore.profile.weight,
        bmi: userStore.bmi,
        bmr: userStore.bmr,
        targetCalories: userStore.targetCalories,
        goal: userStore.profile.goal,
      },
      todayNutrition: {
        consumedCalories: nutritionStore.todayCalories,
        consumedProtein: nutritionStore.todayProtein,
        consumedCarbs: nutritionStore.todayCarbs,
        consumedFat: nutritionStore.todayFat,
      },
      todayActivity: {
        burnedCalories: activityStore.todayBurnedCalories,
        exerciseMinutes: activityStore.todayDuration,
      },
      remainingCalories: userStore.targetCalories - nutritionStore.todayCalories + activityStore.todayBurnedCalories,
    };
  }

  async function sendMessage(content: string): Promise<ChatMessage> {
    if (!currentSessionId.value) {
      await newSession();
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };
    messages.value.push(userMsg);

    // 加载上下文
    const context = buildAiContext();

    // 临时 AI 消息占位
    const aiMsgId = (Date.now() + 1).toString();
    const aiMsg: ChatMessage = {
      id: aiMsgId,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
    };
    messages.value.push(aiMsg);

    try {
      streaming.value = true;
      const reply = await apiSendMessage(currentSessionId.value!, content, context);
      const idx = messages.value.findIndex((m) => m.id === aiMsgId);
      if (idx !== -1) {
        messages.value[idx] = reply;
      }
      // 同步 sessions 中的消息
      const sessionIdx = sessions.value.findIndex((s) => s.id === currentSessionId.value);
      if (sessionIdx !== -1) {
        sessions.value[sessionIdx].messages = [...messages.value];
      }
      return reply;
    } finally {
      streaming.value = false;
    }
  }

  return {
    sessions,
    currentSessionId,
    messages,
    loading,
    streaming,
    currentSession,
    loadSessions,
    newSession,
    switchSession,
    removeSession,
    sendMessage,
  };
});
