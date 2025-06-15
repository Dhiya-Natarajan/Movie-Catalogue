// store/userContent.js
import axios from "axios";
import toast from "react-hot-toast";
import { create } from "zustand";

export const useUserContentStore = create((set) => ({
  watchlist: [],
  favorites: [],
  isLoading: false,
  error: null,

  fetchWatchlist: async () => {
    console.log("Fetching watchlist...");
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      const { data } = await axios.get(`/api/user/watchlist`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log("Watchlist data:", data);
      set({ watchlist: data.watchlist || [], isLoading: false });
    } catch (error) {
      console.error("Watchlist error:", error);
      set({ 
        error: error.response?.data?.message || 'Failed to fetch watchlist', 
        isLoading: false 
      });
      toast.error('Failed to fetch watchlist');
    }
  },

  fetchFavorites: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      const { data } = await axios.get(`/api/user/likes`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      set({ favorites: data.likes || [], isLoading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch favorites', 
        isLoading: false 
      });
      toast.error('Failed to fetch favorites');
    }
  },

  addToWatchlist: async (movieId, mediaType) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      await axios.post(`/api/user/watchlist/${movieId}`, 
        { media_type: mediaType }, // Match the expected backend format
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      toast.success('Added to watchlist');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to watchlist');
    }
  },

  addToFavorites: async (movieId, mediaType) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      await axios.post(`/api/user/likes/${movieId}`, 
        { media_type: mediaType }, // Match the expected backend format
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      toast.success('Added to favorites');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to favorites');
    }
  },

  removeFromWatchlist: async (movieId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      await axios.delete(`/api/user/watchlist/${movieId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('Removed from watchlist');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove from watchlist');
    }
  },

  removeFromFavorites: async (movieId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      await axios.delete(`/api/user/likes/${movieId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('Removed from favorites');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove from favorites');
    }
  },
}));