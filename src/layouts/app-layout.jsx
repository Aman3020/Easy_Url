import { Outlet } from 'react-router-dom'
import Header from '../components/header'

const AppLayout = () => {
  return (
    <div>
      <main className="min-h-screen container mx-auto px-20">

        <Header />
        <Outlet />   {/* ✅ This will render your child routes */}
      </main>

      <div className="p-10 text-center bg-gray-800 mt-10">
        Made with 💖 by codaHolic
      </div>
    </div>
  );
};

export default AppLayout
