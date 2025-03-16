import React, { useEffect } from 'react'
import Navbar from './components/Navbar'
import { Navigate, Route, Routes } from 'react-router-dom'
import Registration from './pages/Registration'
import SettingsPage from './pages/SettingsPage'
import ProfilePage from './pages/ProfilePage'
import HomePage from './pages/HomePage'
import { useAuthStore } from './store/useAuthStore'
import { Loader } from "lucide-react"
import { Toaster } from "react-hot-toast"
import { useThemeStore } from './store/useThemeStore'


const App = () => {
  const { authUser, isCheckingAuth, checkAuth } = useAuthStore();
  const { theme } = useThemeStore()

  console.log(theme)

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "cupcake");
  }, []);

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  console.log({ authUser })

  if (isCheckingAuth && !authUser) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loader className='size-10 animate-spin' />
      </div>
    )
  }

  return (
    <div data-theme={theme}>


      <Navbar />

      <Routes>
        <Route path='' element={authUser ? <HomePage /> : <Navigate to={"/register"} />} />
        <Route path='/register' element={!authUser ? <Registration /> : <Navigate to={'/'} />} />
        {/* <Route path='/login' element={<LoginPage />} /> */}
        <Route path='/settings' element={authUser ? <SettingsPage /> : <Navigate to={"/register"} />} />
        <Route path='/profile' element={authUser ? <ProfilePage /> : <Navigate to={"/register"} />} />
      </Routes>

      <Toaster />

    </div>
  )
}

export default App