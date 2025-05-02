import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  IconButton,
  Avatar,
  Card,
  CardContent,
  Divider,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Facebook as FacebookIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  PersonOff as PersonOffIcon,
} from '@mui/icons-material';
import Sidebar from '../components/Sidebar';
import '../styles/Social.css';

function Social() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [facebookConnected, setFacebookConnected] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  // Example friend data
  const [friends, setFriends] = useState([
    { id: 1, name: 'Anna Smith', status: 'Online', avatar: null },
    { id: 2, name: 'John Davis', status: 'Last active 2 hours ago', avatar: null },
    { id: 3, name: 'Martha Wilson', status: 'Offline', avatar: null },
  ]);

  // Example friend requests
  const [friendRequests, setFriendRequests] = useState([
    { id: 4, name: 'Thomas Lewis', status: 'Wants to add you as a friend', avatar: null },
    { id: 5, name: 'Agnes Brown', status: 'Wants to add you as a friend', avatar: null },
  ]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleAcceptFriend = (id) => {
    const acceptedFriend = friendRequests.find(request => request.id === id);
    setFriends([...friends, acceptedFriend]);
    setFriendRequests(friendRequests.filter(request => request.id !== id));
  };

  const handleRejectFriend = (id) => {
    setFriendRequests(friendRequests.filter(request => request.id !== id));
  };

  const handleConnectFacebook = () => {
    // In a real app, this would connect to the Facebook API
    setFacebookConnected(true);
    alert('Connected to Facebook');
  };

  const handleInviteByEmail = () => {
    // In a real app, this would send an email to this person
    if (inviteEmail && /\S+@\S+\.\S+/.test(inviteEmail)) {
      alert(`Invitation has been sent to: ${inviteEmail}`);
      setInviteEmail('');
    } else {
      alert('Please enter a valid email address');
    }
  };

  const handleRemoveFriend = (id) => {
    if (window.confirm('Are you sure you want to remove this friend?')) {
      setFriends(friends.filter(friend => friend.id !== id));
    }
  };

  // Filter friends based on search
  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-container">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="page-content">
        <div className="social-header">
          <Typography variant="h4" className="social-title">
            Community
          </Typography>
        </div>

        <Box sx={{ width: '100%' }}>
          <Tabs 
            value={selectedTab} 
            onChange={handleTabChange} 
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <Tab label="Friends" />
            <Tab label="Invitations" />
            <Tab label="Find Friends" />
          </Tabs>

          {/* Tab 1: Friends */}
          {selectedTab === 0 && (
            <div className="friends-container">
              <Typography variant="h6" className="friends-section-title">
                My Friends
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search friends..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="friends-search"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <div className="friends-list">
                {filteredFriends.length > 0 ? (
                  filteredFriends.map(friend => (
                    <div key={friend.id} className="friend-item">
                      <Avatar className="friend-avatar">
                        {friend.name.charAt(0)}
                      </Avatar>
                      <div className="friend-info">
                        <Typography variant="subtitle1" className="friend-name">
                          {friend.name}
                        </Typography>
                        <Typography variant="body2" className="friend-status">
                          {friend.status}
                        </Typography>
                      </div>
                      <Box sx={{ marginLeft: 'auto' }}>
                        <IconButton 
                          color="error" 
                          onClick={() => handleRemoveFriend(friend.id)}
                        >
                          <PersonOffIcon />
                        </IconButton>
                      </Box>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <PersonIcon className="empty-state-icon" />
                    <Typography variant="body1">
                      No friends found.
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Change your search criteria or add new friends.
                    </Typography>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Friend Requests */}
          {selectedTab === 1 && (
            <div className="friends-container friend-requests-section">
              <Typography variant="h6" className="friends-section-title">
                Friend Requests
              </Typography>
              <div className="friends-list">
                {friendRequests.length > 0 ? (
                  friendRequests.map(request => (
                    <div key={request.id} className="friend-request-item">
                      <Avatar className="friend-avatar">
                        {request.name.charAt(0)}
                      </Avatar>
                      <div className="friend-info">
                        <Typography variant="subtitle1" className="friend-name">
                          {request.name}
                        </Typography>
                        <Typography variant="body2" className="friend-status">
                          {request.status}
                        </Typography>
                      </div>
                      <Box sx={{ marginLeft: 'auto', display: 'flex' }}>
                        <IconButton 
                          color="primary" 
                          onClick={() => handleAcceptFriend(request.id)}
                        >
                          <CheckIcon />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={() => handleRejectFriend(request.id)}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Box>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <PersonAddIcon className="empty-state-icon" />
                    <Typography variant="body1">
                      You don't have any friend requests.
                    </Typography>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Find Friends */}
          {selectedTab === 2 && (
            <div className="friends-container find-friends-section">
              <Typography variant="h6" className="friends-section-title">
                Find Friends
              </Typography>
              
              <Card className="facebook-connect-card">
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <FacebookIcon fontSize="large" color="primary" />
                    <Box ml={2}>
                      <Typography variant="h6">Connect with Facebook</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Find friends who also use the MyMoney app
                      </Typography>
                    </Box>
                  </Box>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<FacebookIcon />}
                    onClick={handleConnectFacebook}
                    disabled={facebookConnected}
                  >
                    {facebookConnected ? 'Connected to Facebook' : 'Connect with Facebook'}
                  </Button>
                </CardContent>
              </Card>

              <Divider sx={{ my: 3 }} />

              <Box mb={3}>
                <Typography variant="h6" gutterBottom>
                  Invite by email
                </Typography>
                <Box display="flex" gap={1}>
                  <TextField 
                    fullWidth 
                    variant="outlined" 
                    placeholder="Friend's email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={handleInviteByEmail}
                    startIcon={<EmailIcon />}
                  >
                    Invite
                  </Button>
                </Box>
              </Box>
            </div>
          )}
        </Box>
      </div>
    </div>
  );
}

export default Social; 