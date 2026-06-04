/**
 * AI 聊天 API（真实后端接口）
 *
 * TODO 后端实现以下接口后，删除 src/api/ai.ts 中的 mock 实现，
 * 并将 src/stores/chat.ts 中的 apiSendMessage 替换为本文件中的 sendMessageToAi。
 *
 * 接口统一响应格式：{ code: 200, data: ... }
 * 所有接口需要在请求头中携带 Authorization: Bearer <token>
 */

import type { AiContext } from '@/types/ai';
import request from './request';

/**
 * 发送聊天消息
 * POST /v1/ai/chat
 * 请求体：{ sessionId, content, context }
 * 响应：ChatMessage
 *
 * TODO: context 参数为可选，用于携带用户档案和今日数据，使 AI 回复更个性化
 */
export const sendMessageToAi = (data: {
  sessionId: string;
  content: string;
  context?: AiContext;
}) => {
  return request<any>({
    url: '/v1/ai/chat',
    method: 'post',
    data,
  });
};

/**
 * 获取会话列表
 * GET /v1/ai/sessions
 * 响应：ChatSession[]
 * TODO: 如果需要将聊天记录同步到后端，实现此接口
 */
export const getAiSessions = () => {
  return request<any[]>({
    url: '/v1/ai/sessions',
    method: 'get',
  });
};

/**
 * 创建新会话
 * POST /v1/ai/sessions
 * 响应：ChatSession
 * TODO: 如果需要将聊天记录同步到后端，实现此接口
 */
export const createAiSession = () => {
  return request<any>({
    url: '/v1/ai/sessions',
    method: 'post',
  });
};

/**
 * 删除会话
 * DELETE /v1/ai/sessions/:sessionId
 * 响应：{ code: 200 }
 * TODO: 如果需要将聊天记录同步到后端，实现此接口
 */
export const deleteAiSession = (sessionId: string) => {
  return request({
    url: `/v1/ai/sessions/${sessionId}`,
    method: 'delete',
  });
};
