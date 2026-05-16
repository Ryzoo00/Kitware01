import { Outlet } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar.jsx';
import Footer from '../components/Layout/Footer.jsx';
import MobileNav from '../components/Layout/MobileNav.jsx';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
};

export default MainLayout;
