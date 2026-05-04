import { Navigate, Outlet } from 'react-router-dom';

export default function PublicRoute() {
  const token = localStorage.getItem('token');
  
  let user = null;
  try {
    const userString = localStorage.getItem('user');
    if (userString) {
      user = JSON.parse(userString);
    }
  } 
  catch (error) {
    console.error("Failed to parse user data from localStorage", error);
  }
  if (token && user) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'employee') return <Navigate to="/employee/kyc" replace />;
    if (user.role === 'customer') return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}