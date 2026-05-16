import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

const AdminRoute = () => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  console.log('🔴 AdminRoute Check:', {
    isAuthenticated,
    user: user ? { name: user.name, email: user.email, role: user.role } : null,
    isLoading
  });
  
  // Detailed role check
  if (isAuthenticated && user) {
    console.log('User role from store:', user.role);
    console.log('Is admin?', user.role === 'admin');
  }

  if (isLoading) {
    console.log('⏳ Still loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.warn('❌ Access denied - Not authenticated');
    return <Navigate to="/" replace />;
  }

  if (user?.role !== 'admin') {
    console.warn('❌ Access denied - Not an admin. User role:', user?.role);
    return (
      <div style={{ padding: '40px', fontFamily: 'sans-serif', textAlign: 'center' }}>
        <h1 style={{ color: 'red' }}>❌ Access Denied</h1>
        <p>Your role is: <strong>{user?.role}</strong></p>
        <p>You need admin privileges to access this page.</p>
        <button 
          onClick={() => window.history.back()}
          style={{ marginTop: '20px', padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Go Back
        </button>
      </div>
    );
  }

  console.log('✅ Admin access granted! Rendering outlet...');

  return <Outlet />;
};

export default AdminRoute;
