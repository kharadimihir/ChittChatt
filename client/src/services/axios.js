import axios from "axios"

const api =  axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}`,
    headers: {
        "Content-Type": "application/json"
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    console.log(token);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export const getNearbyRooms = (lat, lng) => {
    return api.get(`/api/rooms?lat=${lat}&lng=${lng}`);
};

export const createRoom = (data) => {
    return api.post("/api/rooms", data);
};

export const getMyActiveRoom = () => {
    return api.get("/api/rooms/my-active");
};

export const deleteRoom = (roomId) => {
    return api.delete(`/api/rooms/${roomId}`);
};

export const updateUserLocation = (coords) => {
    return api.patch("/api/users/location", coords);
};


export const getRoomMessages = (roomId) => {
    return api.get(`/api/chat/${roomId}`);
};
  
  

export default api;