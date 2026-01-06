import api from "@/services/axios";


export const signup = (email,password, confirmPassword) => {
    return api.post("/auth/signup", { email, password, confirmPassword });
};

export const login = (email, password) => {
    return api.post("/auth/login", { email, password });
};

export const updateHandle = (handle) => {
    return api.put("/auth/handle", { handle });
}