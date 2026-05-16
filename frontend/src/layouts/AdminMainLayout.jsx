import { Outlet } from 'react-router-dom';
import AdminLayout from '../components/Layout/AdminLayout.jsx';

const AdminMainLayout = () => {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
};

export default AdminMainLayout;
