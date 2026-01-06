import api from "@/services/axios";


export const signup = (email,password, confirmPassword) => {
    return api.post("/api/auth/signup", { email, password, confirmPassword });
};

export const login = (email, password) => {
    return api.post("/api/auth/login", { email, password });
};

export const updateHandle = (handle) => {
    return api.put("/api/auth/handle", { handle });
}