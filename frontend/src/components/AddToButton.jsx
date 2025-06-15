// components/AddToButton.js
import { useAuthStore } from "../store/auth";
import { useUserContentStore } from "../store/userContent";
import toast from "react-hot-toast";

const AddToButton = ({ itemId, mediaType }) => {
  const { user } = useAuthStore();
  const { addToWatchlist, addToFavorites } = useUserContentStore();

  const handleAdd = async (type) => {
    if (!user) {
      toast.error('Please login to use this feature');
      return;
    }

    try {
      if (type === 'watchlist') {
        await addToWatchlist(user.id, itemId, mediaType);
      } else {
        await addToFavorites(user.id, itemId, mediaType);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex gap-2 mt-2">
      <button 
        onClick={() => handleAdd('watchlist')}
        className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
      >
        Add to Watchlist
      </button>
      <button 
        onClick={() => handleAdd('favorites')}
        className="px-3 py-1 bg-red-500 text-white rounded text-sm"
      >
        Add to Favorites
      </button>
    </div>
  );
};

export default AddToButton;