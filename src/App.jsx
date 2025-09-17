import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import AppLayout from './layouts/app-layout';
import Dashboard from './pages/dashboard';
import Auth from './pages/auth';
import Link from './pages/link';
import RedirectLink from './pages/redirect-link';
import LandingPage from './pages/landing';
import UrlProvider from './context';
import RequireAuth from './components/require-auth';
import { ToastContainer, toast, Bounce } from "react-toastify";

const router = createBrowserRouter([
  {
    element:<AppLayout/>,
    children:[
      {
        path:'/',
        element:<LandingPage/>,
      },
      {
        path:'/dashboard',
        element: (
          <RequireAuth>
            <Dashboard/>
          </RequireAuth>

        )
      },
      {
        path:'/auth',
        element:<Auth/>,
      },
      {
        path:'/link/:id',
        element:(
          <RequireAuth>
            <Link/>
          </RequireAuth>
        ),
      },
      {
        path:'/:id',
        element:<RedirectLink/>,
      },
    ],
  }
]);
function App() {

  return (
        <UrlProvider>
          <RouterProvider router={router}/>
          <ToastContainer
            position="top-right"
            autoClose={1500}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={false}
            rtl={false}
            draggable
            pauseOnHover
            theme="dark"
            transition={Bounce}
          />
        </UrlProvider>
  )
}

export default App
