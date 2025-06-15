import { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "../store/authUser";
import Navbar from "../components/Navbar";
import { Trash } from "lucide-react";
import { Link } from "react-router-dom";

const SearchHistoryPage = () => {
  const { user } = useAuthStore();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setLoading(true);
      axios.get('/api/v1/search-history', {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      .then(res => setHistory(res.data))
      .finally(() => setLoading(false));
    }
  }, [user]);

  const deleteHistoryItem = (id) => {
    axios.delete(`/api/v1/search-history/${id}`)
      .then(() => setHistory(prev => prev.filter(item => item.id !== id)));
  };

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Search History</h1>
        
        {loading ? (
          <p>Loading...</p>
        ) : history.length === 0 ? (
          <p>No search history found</p>
        ) : (
          <div className="space-y-2">
            {history.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-gray-800 p-3 rounded">
                <Link 
                  to={`/search?query=${item.query}&type=${item.type}`}
                  className="hover:text-blue-400"
                >
                  {item.query} ({item.type})
                </Link>
                <button onClick={() => deleteHistoryItem(item.id)}>
                  <Trash size={18} className="text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchHistoryPage;