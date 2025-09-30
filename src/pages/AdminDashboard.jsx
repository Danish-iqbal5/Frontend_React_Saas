import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI, handleAPIError } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
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
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
} from '@mui/icons-material';

function AdminDashboard() {
  const navigate = useNavigate();
  const { logout, getUserRole } = useAuth();
  
  // State
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processingId, setProcessingId] = useState(null);
  
  // Load pending requests on mount
  useEffect(() => {
    loadPendingRequests();
  }, []);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);
  
  /**
   * Load pending approval requests
   */
  const loadPendingRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await adminAPI.getDashboardData();
      setPendingRequests(response.data || []);
      
    } catch (err) {
      console.error('Error loading requests:', err);
      const errorMsg = handleAPIError(err);
      setError(errorMsg.message);
      
      // If unauthorized, logout
      if (err.response?.status === 401) {
        setTimeout(() => logout(), 2000);
      }
    } finally {
      setLoading(false);
    }
  }, [logout]);
  
  /**
   * Handle user approval
   */
  const handleApprove = useCallback(async (userId, username) => {
    if (!window.confirm(`Are you sure you want to approve ${username}?`)) {
      return;
    }

    try {
      setProcessingId(userId);
      setError('');
      setSuccess('');
      
      await adminAPI.updateUserStatus(userId, 'approve');
      
      setSuccess(`User ${username} approved successfully!`);
      
      // Reload the list
      await loadPendingRequests();
      
    } catch (err) {
      console.error('Error approving user:', err);
      const errorMsg = handleAPIError(err);
      setError(errorMsg.message);
    } finally {
      setProcessingId(null);
    }
  }, [loadPendingRequests]);
  
  /**
   * Handle user rejection
   */
  const handleReject = useCallback(async (userId, username) => {
    if (!window.confirm(`Are you sure you want to reject ${username}?`)) {
      return;
    }

    try {
      setProcessingId(userId);
      setError('');
      setSuccess('');
      
      await adminAPI.updateUserStatus(userId, 'reject');
      
      setSuccess(`User ${username} rejected.`);
      
      // Reload the list
      await loadPendingRequests();
      
    } catch (err) {
      console.error('Error rejecting user:', err);
      const errorMsg = handleAPIError(err);
      setError(errorMsg.message);
    } finally {
      setProcessingId(null);
    }
  }, [loadPendingRequests]);

  /**
   * Handle logout
   */
  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);
  
  return (
    <Container sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>

      <Typography variant="h6" gutterBottom color="text.secondary">
        Pending Approvals
      </Typography>
      
      {/* Messages */}
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
      
      {/* Main Content */}
      <Card>
        <CardContent>
          {loading && !pendingRequests.length ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
              <CircularProgress size={40} />
              <Typography sx={{ ml: 2 }}>Loading pending requests...</Typography>
            </Box>
          ) : pendingRequests.length === 0 ? (
            <Alert severity="info">
              No pending approval requests at this time.
            </Alert>
          ) : (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" color="text.secondary">
                  {pendingRequests.length} Pending Request{pendingRequests.length !== 1 ? 's' : ''}
                </Typography>
                <Tooltip title="Refresh list">
                  <IconButton 
                    onClick={loadPendingRequests}
                    disabled={loading}
                    color="primary"
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Username</strong></TableCell>
                      <TableCell><strong>Email</strong></TableCell>
                      <TableCell><strong>User Type</strong></TableCell>
                      <TableCell align="center"><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingRequests.map((request) => (
                      <TableRow 
                        key={request.id}
                        sx={{ 
                          '&:hover': { bgcolor: 'action.hover' },
                          opacity: processingId === request.id ? 0.6 : 1
                        }}
                      >
                        <TableCell>{request.username}</TableCell>
                        <TableCell>{request.email}</TableCell>
                        <TableCell>
                          <Chip 
                            label={request.user_type} 
                            color={request.user_type === 'vendor' ? 'primary' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Tooltip title="Approve">
                              <span>
                                <Button
                                  variant="contained"
                                  color="success"
                                  size="small"
                                  startIcon={<ApproveIcon />}
                                  onClick={() => handleApprove(request.id, request.username)}
                                  disabled={loading || processingId === request.id}
                                >
                                  Approve
                                </Button>
                              </span>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <span>
                                <Button
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  startIcon={<RejectIcon />}
                                  onClick={() => handleReject(request.id, request.username)}
                                  disabled={loading || processingId === request.id}
                                >
                                  Reject
                                </Button>
                              </span>
                            </Tooltip>
                          </Box>
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
      
      {/* Refresh button at bottom */}
      {pendingRequests.length > 0 && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={loadPendingRequests}
            disabled={loading}
          >
            Refresh List
          </Button>
        </Box>
      )}
    </Container>
  );
}

export default AdminDashboard;
