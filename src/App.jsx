import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import Signatures from './pages/Signatures';
import SignaturesHistory from './pages/SignaturesHistory';
import MaintenanceHistory from './pages/Maintenance/MaintenanceHistory';
import MaintenanceDashboard from './pages/Maintenance/MaintenanceDashboard';
import RoomTimeline from './pages/Maintenance/RoomTimeline';

/**
 * App - Componente raíz de la aplicación
 * Enrutamiento con React Router v7
 * AuthProvider envuelve toda la aplicación para gestión de autenticación
 */
function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* Rutas públicas */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Rutas protegidas */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Layout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Dashboard />} />
                        <Route path="signatures" element={<SignaturesHistory />} />
                        <Route path="signatures/new" element={<Signatures />} />
                        <Route path="maintenance" element={<MaintenanceHistory />} />
                        <Route path="maintenance/dashboard" element={<MaintenanceDashboard />} />
                        <Route path="maintenance/room/:id" element={<RoomTimeline />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>

                    {/* Redirect para rutas no encontradas */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
