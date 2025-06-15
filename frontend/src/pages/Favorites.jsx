import { useEffect } from "react";
import { useAuthStore } from "../store/authUser";
import { useNavigate } from "react-router-dom";
import { Loader, AlertCircle, Heart } from "lucide-react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useUserContentStore } from "../store/userContent";

const FavoritesPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { 
    favorites, 
    isLoading, 
    error, 
    fetchFavorites, 
    removeFromFavorites 
  } = useUserContentStore();

  useEffect(() => {
    if (!user) {
      toast.error("Please log in to view your favorites");
      navigate("/login");
      return;
    }
    fetchFavorites();
  }, [user, navigate, fetchFavorites]);

  const handleRemoveFromFavorites = async (movieId) => {
    try {
      await removeFromFavorites(movieId);
      toast.success("Removed from favorites");
    } catch (err) {
      toast.error(err.message || 'Failed to remove item');
    }
  };

  if (!user) return null; // Prevent rendering if user is not logged in

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin text-red-600 size-10" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Favorites</h1>
        
        {error ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <AlertCircle className="text-red-500 size-16 mb-4" />
            <p className="text-lg text-gray-400">{error}</p>
            <button 
              onClick={() => fetchFavorites()}
              className="mt-4 bg-red-600 hover:bg-red-700 px-6 py-2 rounded font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Heart className="text-red-500 size-16 mb-4" />
            <p className="text-xl mb-4">Your favorites list is empty</p>
            <p className="text-gray-400 mb-6">Add movies and TV shows you love to your favorites.</p>
            <Link to="/" className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded font-medium transition-colors">
              Discover Content
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {favorites.map((item) => (
              <div key={`${item.id}-${item.media_type}`} className="relative group">
                <div className="aspect-[2/3] rounded overflow-hidden relative">
                  <Link to={`/watch/${item.id}?type=${item.media_type}`}>
                    <img
                      src={item.poster_path?.startsWith('http') 
                           ? item.poster_path 
                           : item.poster_path === '/placeholder-poster.png'
                             ? '/placeholder-poster.png'  
                             : `https://image.tmdb.org/t/p/w500${item.poster_path}`}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/placeholder-poster.png";
                      }}
                    />
                  </Link>
                  
                  <div className="absolute top-2 right-2">
                    <Heart className="text-red-500 fill-red-500 size-6" />
                  </div>
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                    <button
                      onClick={() => handleRemoveFromFavorites(item.id)}
                      className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                
                <div className="mt-2">
                  <h3 className="font-medium truncate">{item.title}</h3>
                  <p className="text-sm text-gray-400 capitalize">
                    {item.media_type} • {item.release_date?.substring(0,4) || 'N/A'}
                  </p>
                  <div className="text-xs text-gray-500 mt-1">
                    {item.created_at && (
                      <p>Added: {new Date(item.created_at).toLocaleDateString()}</p>
                    )}
                    {item.rating && <p>Your Rating: {item.rating}/10</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;