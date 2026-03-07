import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * AuthContext - Contexto de autenticación global (Mock for Frontend only)
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Verificar sesión al cargar
    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setIsLoading(false);
    }, []);

    /**
     * Iniciar sesión (Mock)
     */
    const login = async (email, password) => {
        setError(null);
        setIsLoading(true);

        try {
            // Fake delay
            await new Promise((resolve) => setTimeout(resolve, 800));

            // Basic mock validation
            if (!email || !password) {
                throw new Error('Credenciales inválidas');
            }

            const mockToken = 'mock-jwt-token-12345';
            localStorage.setItem('token', mockToken);

            const userData = {
                email: email,
                full_name: 'Admin HMR'
            };
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);

            return { success: true };
        } catch (err) {
            const message = err.message || 'Error al iniciar sesión';
            setError(message);
            return { success: false, error: message };
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Registrar nuevo usuario (Mock)
     */
    const register = async (fullName, email, password) => {
        setError(null);
        setIsLoading(true);

        try {
            await new Promise((resolve) => setTimeout(resolve, 800));
            // Después de registrar, hacer login automático
            return await login(email, password);
        } catch (err) {
            const message = err.message || 'Error al registrar usuario';
            setError(message);
            return { success: false, error: message };
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Cerrar sesión
     */
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const value = {
        user,
        isLoading,
        isAuthenticated: !!user,
        error,
        login,
        register,
        logout,
        clearError: () => setError(null),
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Hook para usar el contexto de autenticación
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
}

export default AuthContext;
