import { http } from './httpClient';

export const chatAPI = {
  getMessages: async (limit = 200) => {
    return await http.get(`/chat?limit=${limit}`);
  },
  postMessage: async ({ content, parentMessageId = null }) => {
    return await http.post('/chat', {
      content,
      parent_message_id: parentMessageId,
    });
  },
};

export default chatAPI;
