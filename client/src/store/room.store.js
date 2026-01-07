import { create } from "zustand";

const savedRoom = localStorage.getItem("activeRoom");

export const useRoomStore = create((set) => ({
  rooms: [],
  activeRoom: savedRoom ? JSON.parse(savedRoom) : null,
  hasActiveRoom: false,

  /* ---------- Rooms list ---------- */
  setRooms: (rooms) =>
    set({
      rooms: rooms.map((room) => ({
        ...room,
        userCount: room.userCount ?? 0,
      })),
    }),

  addRoom: (room) =>
    set((state) => ({
      rooms: state.rooms.some((r) => r._id === room._id)
        ? state.rooms
        : [{ ...room, userCount: 0 }, ...state.rooms],
    })),

  removeRoom: (roomId) =>
    set((state) => ({
      rooms: state.rooms.filter((r) => r._id !== roomId),
    })),

  updateRoomUserCount: (roomId, count) =>
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room._id === roomId ? { ...room, userCount: count } : room
      ),
    })),

  /* ---------- Active room ---------- */
  setActiveRoom: (room) => {
    localStorage.setItem("activeRoom", JSON.stringify(room));
    set({
      activeRoom: room,
      hasActiveRoom: true,
    });
  },

  clearActiveRoom: () => {
    localStorage.removeItem("activeRoom");
    set({
      activeRoom: null,
      hasActiveRoom: false,
    });
  },
  setHasActiveRoom: (value) =>
    set({ hasActiveRoom: value }),
}));
