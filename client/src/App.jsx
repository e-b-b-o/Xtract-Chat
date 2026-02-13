import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import Admin from './pages/Admin';
import authService from './services/authService';

const PrivateRoute = ({ children, adminOnly = false }) => {
    const user = authService.getCurrentUser();
    
    if (!user) {
        return <Navigate to="/login" />;
    }
    
    if (adminOnly && !user.isAdmin) {
        return <Navigate to="/" />;
    }
    
    return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <Landing />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <PrivateRoute adminOnly={true}>
              <Admin />
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
