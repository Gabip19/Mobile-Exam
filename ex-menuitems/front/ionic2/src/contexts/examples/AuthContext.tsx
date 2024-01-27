import React, {createContext, useContext, useState, ReactNode, useEffect} from 'react';
import {authService} from "../../services/AuthService";

export interface UserDto {
    name?: string;
    token?: string;
}

interface AuthContextProps {
    isAuthenticated: boolean;
    user: UserDto | null
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<UserDto | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser: UserDto = JSON.parse(storedUser);
            setUser(parsedUser);
            setIsAuthenticated(true);
        }
    }, []);

    const login = async (email: string, password: string): Promise<void> => {
        try {
            const response = await authService.login(email, password);
            console.log('Authenticated successfully.');

            const userData: UserDto = {
                token: response.token,
            }

            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(userData));

        } catch (error: any) {
            throw error;
        }
    };

    const logout = () => {
        console.log("Logging out...");

        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
