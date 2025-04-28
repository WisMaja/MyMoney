import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Avatar,
  IconButton,
  InputAdornment,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ChatIcon from '@mui/icons-material/Chat';
import ShareIcon from '@mui/icons-material/Share';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import '../styles/Social.css';

const Social = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [friends] = useState([
    { id: 1, name: 'Jan Kowalski', status: 'online', avatar: null },
    { id: 2, name: 'Anna Nowak', status: 'offline', avatar: null },
    { id: 3, name: 'Tomasz Wiśniewski', status: 'online', avatar: null },
    { id: 4, name: 'Małgorzata Dąbrowska', status: 'offline', avatar: null },
    { id: 5, name: 'Piotr Lewandowski', status: 'online', avatar: null },
  ]);

  const [activities] = useState([
    {
      id: 1,
      user: 'Jan Kowalski',
      action: 'reached a savings goal',
      content: 'I finally saved 10,000 zł for my emergency fund! So happy to achieve this milestone.',
      time: '2 hours ago',
      likes: 12,
      comments: 3
    },
    {
      id: 2,
      user: 'Anna Nowak',
      action: 'reduced expenses by 15%',
      content: 'By cutting unnecessary subscriptions and cooking more at home, I managed to reduce my monthly expenses by 15%!',
      time: '5 hours ago',
      likes: 8,
      comments: 2
    },
    {
      id: 3,
      user: 'Tomasz Wiśniewski',
      action: 'started a new investment',
      content: 'Just started investing in index funds. If anyone has some tips for a beginner investor, I would appreciate it!',
      time: '1 day ago',
      likes: 15,
      comments: 7
    }
  ]);

  const navigateToDashboard = () => {
    navigate('/dashboard');
  };

  const navigateToStatistics = () => {
    navigate('/statistics');
  };

  const navigateToAccounts = () => {
    navigate('/accounts');
  };

  const navigateToSettings = () => {
    navigate('/settings');
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box className="social-container">
      {/* Sidebar */}
      <Box className="sidebar">
        <HomeIcon className="sidebar-icon" onClick={navigateToDashboard} />
        <ShowChartIcon className="sidebar-icon" onClick={navigateToStatistics} />
        <AccountBalanceWalletIcon className="sidebar-icon" onClick={navigateToAccounts} />
        <PeopleIcon className="sidebar-icon" sx={{ backgroundColor: '#d1c4e9' }} />
        <SettingsIcon className="sidebar-icon" onClick={navigateToSettings} />
      </Box>

      {/* Main Content */}
      <Box className="social-main-content">
        {/* Header */}
        <Box className="social-header">
          <Typography variant="h4" component="h1" className="social-title">
            Financial Social Network
          </Typography>
          <Box className="social-actions">
            <Button
              variant="contained"
              color="primary"
              startIcon={<PersonAddIcon />}
            >
              Add Friends
            </Button>
          </Box>
        </Box>

        {/* Social Grid */}
        <Box className="social-grid">
          {/* Friends List */}
          <Paper className="friends-list-container">
            <Box className="friends-list-header">
              <Typography className="friends-list-title">
                Friends
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {friends.length} friends
              </Typography>
            </Box>

            <TextField
              className="friends-search"
              placeholder="Search friends"
              variant="outlined"
              size="small"
              fullWidth
              value={searchQuery}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <Box className="friends-list">
              {filteredFriends.map(friend => (
                <Box key={friend.id} className="friend-item">
                  <Avatar className="friend-avatar" src={friend.avatar}>
                    {friend.name.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography className="friend-name">
                      {friend.name}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: friend.status === 'online' ? 'success.main' : 'text.disabled' 
                  }} />
                </Box>
              ))}
            </Box>

            <Button
              variant="outlined"
              color="primary"
              startIcon={<PersonAddIcon />}
              className="invite-button"
              fullWidth
            >
              Invite Friends
            </Button>
          </Paper>

          {/* Activity Feed */}
          <Paper className="activity-feed-container">
            <Box className="activity-feed-header">
              <Typography className="activity-feed-title">
                Financial Activity Feed
              </Typography>
            </Box>

            <TextField
              placeholder="Share your financial achievement..."
              variant="outlined"
              multiline
              rows={3}
              fullWidth
              sx={{ mb: 3 }}
            />

            <Button
              variant="contained"
              color="primary"
              sx={{ mb: 3, alignSelf: 'flex-end' }}
            >
              Post
            </Button>

            <Divider sx={{ mb: 3 }} />

            <Box className="activity-feed">
              {activities.map(activity => (
                <Paper key={activity.id} className="activity-item">
                  <Box className="activity-header">
                    <Avatar sx={{ mr: 1 }}>
                      {activity.user.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                    <Typography className="activity-user">
                      {activity.user}
                    </Typography>
                    <Typography className="activity-action">
                      {activity.action}
                    </Typography>
                    <Typography className="activity-time">
                      {activity.time}
                    </Typography>
                    <IconButton size="small">
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Typography className="activity-content">
                    {activity.content}
                  </Typography>

                  <Divider sx={{ my: 1 }} />

                  <Box className="activity-reactions">
                    <Box className="reaction-buttons">
                      <Button
                        className="reaction-button"
                        startIcon={<ThumbUpIcon />}
                        size="small"
                      >
                        <Typography variant="body2">Like ({activity.likes})</Typography>
                      </Button>
                      
                      <Button
                        className="reaction-button"
                        startIcon={<ChatIcon />}
                        size="small"
                      >
                        <Typography variant="body2">Comment ({activity.comments})</Typography>
                      </Button>
                      
                      <Button
                        className="reaction-button"
                        startIcon={<ShareIcon />}
                        size="small"
                      >
                        <Typography variant="body2">Share</Typography>
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Social; 