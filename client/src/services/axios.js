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
    return api.get(`/rooms?lat=${lat}&lng=${lng}`);
};

export const createRoom = (data) => {
    return api.post("/rooms", data);
};

export const getMyActiveRoom = () => {
    return api.get("/rooms/my-active");
};

export const deleteRoom = (roomId) => {
    return api.delete(`/rooms/${roomId}`);
};

export const updateUserLocation = (coords) => {
    return api.patch("/users/location", coords);
};


export const getRoomMessages = (roomId) => {
    return api.get(`/chat/${roomId}`);
};
  
  

export default api;