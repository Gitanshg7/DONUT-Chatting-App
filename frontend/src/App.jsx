import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';

function App() {
  const { token } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={token ? <Navigate to="/chat" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={token ? <Navigate to="/chat" replace /> : <Register />}
      />
      <Route
        path="/chat"
        element={token ? <Chat /> : <Navigate to="/login" replace />}
      />
      <Route path="*" element={<Navigate to={token ? '/chat' : '/login'} replace />} />
    </Routes>
  );
}

export default App;
