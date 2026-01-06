import { io } from "socket.io-client";


const token = localStorage.getItem("token");

export const socket = io(import.meta.env.VITE_SOCKET_URL, {
    auth: {
        token,
    },
    autoConnect: false,
});