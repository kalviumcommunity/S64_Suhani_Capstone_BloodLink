import { Navigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const isValid = () => {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  };

  return token && isValid() ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;