// providers/auth/AuthProvider.jsx
import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext({
    token: null,
    setToken: (token) => { },
});

export const AuthProvider = ({ children }) => {
    // ✅ Load token from localStorage on first render
    const [token, setTokenState] = useState(() => localStorage.getItem("jwt"));

    // ✅ Keep localStorage in sync with context
    const setToken = (newToken) => {
        setTokenState(newToken);
        if (newToken) {
            localStorage.setItem("jwt", newToken);
        } else {
            localStorage.removeItem("jwt");
        }
    };

    return (
        <AuthContext.Provider value={{ token, setToken }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
