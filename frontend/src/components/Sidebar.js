import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  BarChart as StatisticsIcon,
  AccountBalance as AccountsIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import '../styles/common.css';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="sidebar">
      <div 
        className={`sidebar-icon-wrapper ${currentPath === '/dashboard' ? 'active' : ''}`}
        onClick={() => handleNavigation('/dashboard')}
      >
        <DashboardIcon className="sidebar-icon" />
      </div>
      <div 
        className={`sidebar-icon-wrapper ${currentPath === '/statistics' ? 'active' : ''}`}
        onClick={() => handleNavigation('/statistics')}
      >
        <StatisticsIcon className="sidebar-icon" />
      </div>
      <div 
        className={`sidebar-icon-wrapper ${currentPath === '/accounts' ? 'active' : ''}`}
        onClick={() => handleNavigation('/accounts')}
      >
        <AccountsIcon className="sidebar-icon" />
      </div>
      <div 
        className={`sidebar-icon-wrapper ${currentPath === '/social' ? 'active' : ''}`}
        onClick={() => handleNavigation('/social')}
      >
        <PersonIcon className="sidebar-icon" />
      </div>
      <div 
        className={`sidebar-icon-wrapper ${currentPath === '/settings' ? 'active' : ''}`}
        onClick={() => handleNavigation('/settings')}
      >
        <SettingsIcon className="sidebar-icon" />
      </div>
    </div>
  );
}

export default Sidebar; 