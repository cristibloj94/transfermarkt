import { lazy } from 'react';
import { Routes, Route, Navigate, useLocation, NavLink } from 'react-router-dom';
import { AppBar, Box, Button, Toolbar } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import { logout } from './utils/logout';

const AuthPage = lazy(() => import('./pages/Login'));
const HomePage = lazy(() => import('./pages/Home'));
const MapPage = lazy(() => import('./pages/map/Map'));

import "react-toastify/dist/ReactToastify.css";
import './App.scss';

function App() {
  const location = useLocation();
  return (
    <>
      {location?.pathname !== '/login' && <AppBar position="static" className='app-wrapper'>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <NavLink to={`${localStorage.getItem("role") !== undefined ? '/home' : '/'}`} className={'nav-link logo'}>
            <img className='app-logo' src='/logo.svg' alt='Logo' />
          </NavLink>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <NavLink to="/home" className={'nav-link'}>
              <Button variant={'text'} disableRipple>
                <img src={`${location?.pathname === '/home' ? '/settings-active.svg' : '/settings.svg'}`} alt="Account details icon" />
                Account Details
              </Button>
            </NavLink>
            {localStorage.getItem("role") === 'logistic_manager' && <NavLink to="/map" className={'nav-link'}>
              <Button variant={'text'} disableRipple>
                <img src={`${location?.pathname === '/map' ? '/search-map-active.svg' : '/search-map.svg'}`} alt="Search map icon" />
                Search on map
              </Button>
            </NavLink>}
          </Box>
          <NavLink to="#" className={'nav-link logout'}>
            <img src="/logout.svg" onClick={async () => await logout()} alt="Logout icon" />
          </NavLink>
        </Toolbar>
      </AppBar>}
      <ToastContainer position="bottom-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/map" element={<MapPage />} />
      </Routes>
    </>
  )
}

export default App
