<template>
  <div class="ai-assistant-page">
    <!-- 左侧：会话列表 -->
    <div class="session-panel">
      <div class="panel-header">
        <span class="panel-title">
          <el-icon><ChatLineRound /></el-icon>
          AI 健康助手
        </span>
        <el-button :icon="Plus" size="small" circle @click="newSession" />
      </div>

      <!-- 今日数据卡片 -->
      <div class="context-card" v-if="hasContext">
        <div class="context-title">今日健康摘要</div>
        <div class="context-row">
          <span class="ctx-label">已摄入</span>
          <span class="ctx-val">{{ nutritionStore.todayCalories }} kcal</span>
        </div>
        <div class="context-row">
          <span class="ctx-label">已消耗</span>
          <span class="ctx-val">{{ activityStore.todayBurnedCalories }} kcal</span>
        </div>
        <div class="context-row">
          <span class="ctx-label">剩余</span>
          <span class="ctx-val" :class="{ negative: remainingCalories < 0 }">
            {{ remainingCalories }} kcal
          </span>
        </div>
      </div>

      <!-- 会话列表 -->
      <div class="session-list">
        <div
          v-if="chatStore.sessions.length === 0"
          class="empty-sessions"
        >
          <el-icon size="32" color="#dcdfe6"><ChatDotSquare /></el-icon>
          <span>暂无会话记录</span>
        </div>
        <div
          v-for="session in chatStore.sessions"
          :key="session.id"
          class="session-item"
          :class="{ active: chatStore.currentSessionId === session.id }"
          @click="chatStore.switchSession(session.id)"
        >
          <div class="session-info">
            <span class="session-title">{{ session.title }}</span>
            <span class="session-time">{{ formatTime(session.updatedAt) }}</span>
          </div>
          <el-button
            :icon="Delete"
            text
            size="small"
            class="delete-btn"
            @click.stop="removeSession(session.id)"
          />
        </div>
      </div>
    </div>

    <!-- 右侧：聊天主面板 -->
    <div class="chat-panel">
      <!-- 无会话状态 -->
      <div v-if="!chatStore.currentSessionId" class="empty-chat">
        <div class="empty-icon">
          <el-icon :size="64" color="#409EFF"><ChatDotRound /></el-icon>
        </div>
        <div class="empty-title">您好，我是智能营养管理助手</div>
        <div class="empty-sub">我可以帮您分析饮食、推荐运动、制定食谱</div>

        <!-- 快捷问题 -->
        <div class="quick-questions">
          <div class="quick-title">试试这样问我：</div>
          <div class="quick-tags">
            <el-tag
              v-for="q in quickQuestions"
              :key="q.id"
              class="quick-tag"
              @click="quickAsk(q.label)"
            >
              <el-icon><component :is="q.icon" /></el-icon>
              {{ q.label }}
            </el-tag>
          </div>
        </div>

        <!-- 今日摘要 -->
        <div v-if="hasContext" class="today-summary">
          <div class="summary-title">今日健康数据</div>
          <el-descriptions :column="3" border size="small">
            <el-descriptions-item label="已摄入">{{ nutritionStore.todayCalories }} kcal</el-descriptions-item>
            <el-descriptions-item label="已消耗">{{ activityStore.todayBurnedCalories }} kcal</el-descriptions-item>
            <el-descriptions-item label="剩余热量">{{ remainingCalories }} kcal</el-descriptions-item>
            <el-descriptions-item label="蛋白质">{{ nutritionStore.todayProtein }}g</el-descriptions-item>
            <el-descriptions-item label="碳水">{{ nutritionStore.todayCarbs }}g</el-descriptions-item>
            <el-descriptions-item label="脂肪">{{ nutritionStore.todayFat }}g</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>

      <!-- 聊天界面 -->
      <template v-else>
        <div class="chat-header">
          <span>{{ chatStore.currentSession?.title }}</span>
          <el-button text size="small" @click="clearChat">清空记录</el-button>
        </div>

        <el-scrollbar class="message-scroll" ref="scrollRef">
          <div class="message-list">
            <div
              v-for="msg in chatStore.messages"
              :key="msg.id"
              class="message-wrapper"
              :class="msg.role"
            >
              <div class="message-avatar">
                <el-icon v-if="msg.role === 'user'" color="#fff" size="18"><User /></el-icon>
                <el-icon v-else color="#fff" size="18"><MagicStick /></el-icon>
              </div>
              <div class="message-bubble" :class="msg.role">
                <div v-if="msg.role === 'assistant'" class="ai-content" v-html="renderContent(msg.content)" />
                <div v-else class="user-content">{{ msg.content }}</div>
                <div class="message-time">{{ formatTime(msg.createdAt) }}</div>
              </div>
            </div>

            <!-- 加载中骨架屏 -->
            <div v-if="chatStore.streaming" class="message-wrapper assistant">
              <div class="message-avatar">
                <el-icon color="#fff" size="18"><MagicStick /></el-icon>
              </div>
              <div class="message-bubble assistant">
                <div class="skeleton-lines">
                  <div class="skeleton-line" />
                  <div class="skeleton-line short" />
                  <div class="skeleton-line medium" />
                </div>
              </div>
            </div>
          </div>
        </el-scrollbar>

        <!-- 输入区 -->
        <div class="input-area">
          <div class="input-row">
            <el-input
              v-model="inputText"
              type="textarea"
              :rows="2"
              placeholder="输入您的问题，按 Enter 发送..."
              resize="none"
              :disabled="chatStore.streaming"
              @keydown.enter.exact.prevent="onSend"
              @keydown.enter.shift.exact="inputText += '\n'"
            />
          </div>
          <div class="input-actions">
            <span class="input-hint">Enter 发送 · Shift+Enter 换行</span>
            <el-button
              type="primary"
              :icon="Promotion"
              :loading="chatStore.streaming"
              :disabled="!inputText.trim()"
              @click="onSend"
            >
              发送
            </el-button>
          </div>

          <!-- 快捷问题 -->
          <div class="quick-row">
            <el-tag
              v-for="q in quickQuestions"
              :key="q.id"
              size="small"
              class="quick-tag-inline"
              @click="quickAsk(q.label)"
            >
              {{ q.label }}
            </el-tag>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue';
import { ChatLineRound, ChatDotSquare, Plus, Delete, Promotion, User, MagicStick } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useChatStore } from '@/stores/chat';
import { useUserStore } from '@/stores/user';
import { useNutritionStore } from '@/stores/nutrition';
import { marked } from 'marked';
import { useActivityStore } from '@/stores/activity';
import { QUICK_QUESTIONS } from '@/types/ai';

dayjs.extend(relativeTime);

const chatStore = useChatStore();
const userStore = useUserStore();
const nutritionStore = useNutritionStore();
const activityStore = useActivityStore();

const inputText = ref('');
const scrollRef = ref();

const quickQuestions = QUICK_QUESTIONS;

const remainingCalories = computed(() =>
  userStore.targetCalories - nutritionStore.todayCalories + activityStore.todayBurnedCalories
);

const hasContext = computed(() =>
  nutritionStore.todayCalories > 0 || activityStore.todayBurnedCalories > 0
);

function formatTime(iso: string): string {
  const d = dayjs(iso);
  const now = dayjs();
  if (d.isSame(now, 'day')) return d.format('HH:mm');
  if (d.isAfter(now.subtract(1, 'day'))) return '昨天 ' + d.format('HH:mm');
  return d.format('MM/DD HH:mm');
}

function renderContent(content: string): string {
  if (!content) return '';
  // marked 解析 GFM，支持表格、代码块、列表等
  return marked.parse(content, { async: false }) as string;
}

async function scrollToBottom() {
  await nextTick();
  if (scrollRef.value) {
    scrollRef.value.setScrollTop(999999);
  }
}

async function newSession() {
  await chatStore.newSession();
}

async function removeSession(sessionId: string) {
  await ElMessageBox.confirm('确定删除该会话吗？', '提示', { type: 'warning' });
  await chatStore.removeSession(sessionId);
  ElMessage.success('会话已删除');
}

async function clearChat() {
  await ElMessageBox.confirm('确定清空当前会话记录吗？', '提示', { type: 'warning' });
  if (chatStore.currentSessionId) {
    await chatStore.removeSession(chatStore.currentSessionId);
    await chatStore.newSession();
  }
}

async function onSend() {
  const text = inputText.value.trim();
  if (!text || chatStore.streaming) return;
  inputText.value = '';
  await chatStore.sendMessage(text);
  await scrollToBottom();
}

async function quickAsk(label: string) {
  inputText.value = label;
  await onSend();
}

onMounted(async () => {
  await userStore.loadProfile();
  await nutritionStore.loadTodayLogs();
  await activityStore.loadTodayActivity();
  await chatStore.loadSessions();
  if (chatStore.sessions.length > 0 && !chatStore.currentSessionId) {
    await chatStore.switchSession(chatStore.sessions[0].id);
  }
});
</script>

<style scoped lang="scss">
.ai-assistant-page {
  display: grid;
  grid-template-columns: 280px 1fr;
  height: 100%;
  gap: 16px;
}

// 左侧会话面板
.session-panel {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid #ebeef5;

    .panel-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 15px;
      font-weight: 600;
      color: #303133;
    }
  }
}

.context-card {
  margin: 12px 16px;
  background: linear-gradient(135deg, #ecf5ff, #f0f9eb);
  border: 1px solid #d9ecff;
  border-radius: 10px;
  padding: 12px 14px;

  .context-title {
    font-size: 12px;
    font-weight: 600;
    color: #606266;
    margin-bottom: 8px;
  }
  .context-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    padding: 3px 0;
    .ctx-label { color: #909399; }
    .ctx-val {
      font-weight: 600;
      color: #303133;
      &.negative { color: #f56c6c; }
    }
  }
}

.session-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.empty-sessions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 16px;
  color: #909399;
  font-size: 13px;
}

.session-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
  margin-bottom: 2px;
  &:hover {
    background: #f5f7fa;
    .delete-btn { opacity: 1; }
  }
  &.active {
    background: #ecf5ff;
    border: 1px solid #d9ecff;
  }
  .session-info {
    flex: 1;
    overflow: hidden;
    .session-title {
      display: block;
      font-size: 13px;
      color: #303133;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .session-time {
      font-size: 11px;
      color: #c0c4cc;
    }
  }
  .delete-btn {
    opacity: 0;
    transition: opacity 0.15s;
    flex-shrink: 0;
  }
}

// 右侧聊天面板
.chat-panel {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.empty-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px;

  .empty-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ecf5ff, #e8f4e8);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .empty-title {
    font-size: 20px;
    font-weight: 700;
    color: #303133;
  }
  .empty-sub {
    font-size: 14px;
    color: #909399;
  }
}

.quick-questions {
  margin-top: 24px;
  text-align: center;
  .quick-title {
    font-size: 13px;
    color: #909399;
    margin-bottom: 12px;
  }
  .quick-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
    .quick-tag {
      cursor: pointer;
      padding: 8px 14px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
      font-size: 13px;
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
      }
    }
  }
}

.today-summary {
  margin-top: 32px;
  width: 100%;
  max-width: 600px;
  .summary-title {
    font-size: 14px;
    font-weight: 600;
    color: #606266;
    margin-bottom: 10px;
    text-align: center;
  }
}

// 聊天头部
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid #ebeef5;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

// 消息列表
.message-scroll {
  flex: 1;
  overflow: hidden;
}

.message-list {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-wrapper {
  display: flex;
  gap: 10px;
  align-items: flex-start;

  &.user {
    flex-direction: row-reverse;
    .message-bubble { background: #409EFF; color: #fff; }
    .message-time { color: rgba(255, 255, 255, 0.7); }
  }

  &.assistant {
    .message-bubble { background: #f4f4f5; color: #303133; }
    .message-avatar { background: linear-gradient(135deg, #67C23A, #85ce61); }
  }

  .message-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #409EFF, #66b1ff);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .message-bubble {
    max-width: 72%;
    border-radius: 12px;
    padding: 12px 16px;
    position: relative;
    line-height: 1.6;
    font-size: 14px;

    .user-content {
      word-break: break-word;
      white-space: pre-wrap;
    }
    .message-time {
      font-size: 11px;
      color: #909399;
      margin-top: 4px;
      text-align: right;
    }
  }
}

// 骨架屏
.skeleton-lines {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px;
}
.skeleton-line {
  height: 14px;
  background: linear-gradient(90deg, #e4e7ed 25%, #f2f3f5 50%, #e4e7ed 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  animation: shimmer 1.5s infinite;
  width: 200px;
  &.short { width: 120px; }
  &.medium { width: 160px; }
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

// 输入区
.input-area {
  padding: 14px 20px;
  border-top: 1px solid #ebeef5;
  background: #fafafa;

  .input-row {
    margin-bottom: 8px;
  }
  .input-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .input-hint {
      font-size: 12px;
      color: #c0c4cc;
    }
  }
  .quick-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 8px;
    .quick-tag-inline {
      cursor: pointer;
      &:hover { color: #409EFF; border-color: #409EFF; }
    }
  }
}
</style>

<style lang="scss">
// Markdown 样式（全局注入，因为 v-html 不受 scoped 影响）
.md-h1 { font-size: 20px; font-weight: 700; color: #303133; margin: 16px 0 8px; }
.md-h2 { font-size: 17px; font-weight: 700; color: #303133; margin: 14px 0 7px; }
.md-h3 { font-size: 15px; font-weight: 600; color: #303133; margin: 12px 0 6px; }
.md-h4, .md-h5, .md-h6 { font-size: 14px; font-weight: 600; margin: 10px 0 5px; }
.md-p { margin: 8px 0; line-height: 1.7; }
.md-ul, .md-ol { padding-left: 20px; margin: 8px 0; li { margin: 4px 0; line-height: 1.7; } }
.md-pre {
  background: #1d1f21;
  border-radius: 8px;
  padding: 14px 16px;
  margin: 10px 0;
  overflow-x: auto;
  .md-code {
    color: #a9b7c6;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.5;
  }
}
.inline-code {
  background: #f0f0f0;
  border-radius: 4px;
  padding: 2px 5px;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  color: #c7254e;
}
.md-quote {
  border-left: 4px solid #409EFF;
  background: #ecf5ff;
  padding: 10px 14px;
  border-radius: 0 8px 8px 0;
  margin: 8px 0;
  color: #606266;
  font-size: 13px;
}
.md-table-wrapper {
  overflow-x: auto;
  margin: 10px 0;
}
.md-table {
  border-collapse: collapse;
  width: 100%;
  font-size: 13px;
  th, td {
    border: 1px solid #ebeef5;
    padding: 8px 12px;
    text-align: left;
  }
  th {
    background: #f5f7fa;
    font-weight: 600;
    color: #303133;
  }
  tr:nth-child(even) td {
    background: #fafafa;
  }
}
</style>
