import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('user_id');
      const email = localStorage.getItem('email');
      const role = localStorage.getItem('role');
      const refreshToken = localStorage.getItem('refresh_token');

      if (token && userId && email && role) {
        setUser({
          userId,
          email,
          role,
          token,
          refreshToken,
        });
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password, role) => {
    try {
      const formBody = new URLSearchParams();
      formBody.append('username', email);
      formBody.append('password', password);

      const response = await fetch('http://127.0.0.1:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();

      // Store in localStorage
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user_id', data.user_id);
      localStorage.setItem('email', data.email);
      localStorage.setItem('role', role);

      // Update context state
      setUser({
        userId: data.user_id,
        email: data.email,
        role,
        token: data.access_token,
        refreshToken: data.refresh_token,
      });

      // Fetch user profile
      try {
        const profileResponse = await fetch('http://127.0.0.1:8000/user/profile', {
          headers: {
            Authorization: `Bearer ${data.access_token}`,
          },
        });

        if (profileResponse.ok) {
          const profile = await profileResponse.json();
          localStorage.setItem('user_profile', JSON.stringify(profile));
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }

      return { success: true, role };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Optional: Call backend logout endpoint to invalidate refresh token
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken && user?.token) {
        await fetch('http://127.0.0.1:8000/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        }).catch(err => console.error('Logout backend error:', err));
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear all auth data
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('email');
      localStorage.removeItem('role');
      localStorage.removeItem('user_profile');
      localStorage.removeItem('pending_application_id');
      localStorage.removeItem('applicationsSentDelta');

      // Reset context state
      setUser(null);

      // Navigate to login
      navigate('/login');
    }
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch('http://127.0.0.1:8000/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Refresh token expired');
      }

      const data = await response.json();

      // Update tokens
      localStorage.setItem('token', data.access_token);
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }

      // Update context
      setUser(prev => ({
        ...prev,
        token: data.access_token,
        refreshToken: data.refresh_token || prev.refreshToken,
      }));

      return data.access_token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, logout user
      await logout();
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    refreshAccessToken,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
