import { create } from "zustand";

export const useChatStore = create((set) => ({
  messagesByRoom: {},
  activeUsers: 0,

  setRoomMessages: (roomId, messages) =>
    set((state) => ({
      messagesByRoom: {
        ...state.messagesByRoom,
        [roomId]: messages,
      },
    })),

    addMessage: (roomId, message) =>
        set((state) => {
          const prev = state.messagesByRoom[roomId] || [];
      
          // prevent duplicate messages
          if (prev.some((m) => m._id === message._id)) {
            return state;
          }
      
          return {
            messagesByRoom: {
              ...state.messagesByRoom,
              [roomId]: [...prev, message],
            },
          };
        }),
      

  clearRoomMessages: (roomId) =>
    set((state) => {
      const copy = { ...state.messagesByRoom };
      delete copy[roomId];
      return { messagesByRoom: copy };
    }),
  clearAllMessages: () => set({ messagesByRoom: {} }),
  setActiveUsers: (count) => set({ activeUsers: count }),

  clearChat: () =>
    set({
      messagesByRoom: {},
      activeUsers: 0,
    }),
  
}));
