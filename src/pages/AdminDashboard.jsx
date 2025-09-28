import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip,
} from '@mui/material';

function AdminDashboard() {
  const navigate = useNavigate();
  
  // State
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Check if user is admin when component loads
  useEffect(() => {
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('tokens');
    
    // Check if user is logged in
    if (!token) {
      alert('Please login first');
      navigate('/login');
      return;
    }
    
    
    if (role !== 'superuser') {
      alert('Access denied. Admin only.');
      navigate('/');
      return;
    }
    
  
    loadPendingRequests();
  }, [navigate]);
  
  
  const loadPendingRequests = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('tokens');
      
      
      const response = await api.get('api/admin-dashboard/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
        
    
      setPendingRequests(response.data || []);
      
    } catch (err) {
      console.error('Error loading requests:', err);
      setError('Failed to load pending requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  
  const handleApprove = async (userId, username) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const token = localStorage.getItem('tokens');
      
      await api.post('/admin-dashboard/', 
        {
          user_id: userId,
          action: 'approve'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setSuccess(`User ${username} approved successfully!`);
      
      // Reload the list
      loadPendingRequests();
      
    } catch (err) {
      console.error('Error approving user:', err);
      setError('Failed to approve user. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle reject
  const handleReject = async (userId, username) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const token = localStorage.getItem('token');
      
      await api.post('/admin-dashboard/', 
        {
          user_id: userId,
          action: 'reject'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setSuccess(`User ${username} rejected.`);
      
      // Reload the list
      loadPendingRequests();
      
    } catch (err) {
      console.error('Error rejecting user:', err);
      setError('Failed to reject user. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard - Pending Approvals
      </Typography>
      
      {/* Show messages */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }} 
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 2 }} 
          onClose={() => setSuccess('')}
        >
          {success}
        </Alert>
      )}
      
      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Loading...</Typography>
            </Box>
          ) : pendingRequests.length === 0 ? (
            <Alert severity="info">
              No pending approval requests at this time.
            </Alert>
          ) : (
            <>
              <Typography variant="h6" gutterBottom>
                {pendingRequests.length} Pending Request(s)
              </Typography>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Username</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>User Type</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>{request.username}</TableCell>
                        <TableCell>{request.email}</TableCell>
                        <TableCell>
                          <Chip 
                            label={request.user_type} 
                            color={request.user_type === 'vendor' ? 'primary' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            sx={{ mr: 1 }}
                            onClick={() => handleApprove(request.id, request.username)}
                            disabled={loading}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleReject(request.id, request.username)}
                            disabled={loading}
                          >
                            Reject
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Refresh button */}
      <Box sx={{ mt: 2 }}>
        <Button 
          variant="outlined" 
          onClick={loadPendingRequests}
          disabled={loading}
        >
          Refresh List
        </Button>
      </Box>
    </Container>
  );
}

export default AdminDashboard;
