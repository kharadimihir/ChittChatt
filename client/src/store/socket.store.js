import { create } from "zustand";
import { socket } from "@/features/chat/chatSocket";
import { useRoomStore } from "./room.store";
import { useChatStore } from "./chat.store";
import { getRoomMessages } from "@/services/axios";

export const useSocketStore = create((set) => ({
  connected: false,
  reconnecting: false,

  connect: () => {
    if (socket.connected) return;

    socket.connect();
    set({ connected: true });

    /* ---------- BASIC EVENTS ---------- */
    socket.on("connect", () => {
      set({ connected: true, reconnecting: false });

      // RESYNC ACTIVE ROOM
      const activeRoom = useRoomStore.getState().activeRoom;
      if (activeRoom?._id) {
        socket.emit("join-room", activeRoom._id);

        const messages =
          useChatStore.getState().getMessages(activeRoom._id);

        if (messages.length === 0) {
          getRoomMessages(activeRoom._id).then((res) => {
            useChatStore
              .getState()
              .setRoomMessages(activeRoom._id, res.data.messages);
          });
        }
      }
    });

    socket.on("disconnect", () => {
      set({ connected: false, reconnecting: true });
    });

    /* ---------- ROOM EVENTS ---------- */
    socket.on("room-created", ({ room }) => {
      useRoomStore.getState().addRoom(room);
    });

    socket.on("room-deleted", ({ roomId, createdBy }) => {
      useRoomStore.getState().removeRoom(roomId);
      useChatStore.getState().clearRoomMessages(roomId);

      const user = JSON.parse(localStorage.getItem("user"));
      if (createdBy === user?.id) {
        useRoomStore.getState().clearActiveRoom();
      }
    });

    /* ---------- CHAT EVENTS ---------- */
    socket.on("receive-message", (message) => {
      useChatStore
        .getState()
        .addMessage(message.roomId, message);
    });

    socket.on("active-users", (count) => {
      useChatStore.getState().setActiveUsers(count);
    });
  },

  disconnect: () => {
    socket.removeAllListeners();
    socket.disconnect();
    set({ connected: false, reconnecting: false });
  },
}));
