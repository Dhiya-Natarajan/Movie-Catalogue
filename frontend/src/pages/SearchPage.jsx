import { useState, useEffect, useRef, useCallback } from "react";
import { useContentStore } from "../store/content";
import Navbar from "../components/Navbar";
import { Search, X } from "lucide-react";
import toast from "react-hot-toast";
import { ORIGINAL_IMG_BASE_URL } from "../utils/constants";
import { Heart, Bookmark, Star } from "lucide-react";  
import { useAuthStore } from "../store/authUser";

const SearchPage = () => {
  const [activeTab, setActiveTab] = useState("movie");
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { setContentType } = useContentStore();
  const observer = useRef();
  const [likedMovies, setLikedMovies] = useState([]);
  const [watchLaterMovies, setWatchLaterMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [castDetails, setCastDetails] = useState([]);
  const [personWorks, setPersonWorks] = useState([]);
  const {user} = useAuthStore();

  const API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkYmE4ODA0YjA4NjAxYjExOGExZjFhZjZhMzgzNGI3NCIsInN1YiI6IjY0OWVmZmM0YzlkYmY5MDEwN2UxZTU0MiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.EV_B46kJXwRaqfcfXunUdvSCCDyyRzkS13QBLwEgXK4";
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${API_KEY}`
    }
  };

  // Infinite scroll observer
  const lastResultRef = useCallback(node => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  // Fetch genres when tab changes
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        // Fetch liked items
        const likesResponse = await fetch('/api/user/likes', {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        if (likesResponse.ok) {
          const likesData = await likesResponse.json();
          setLikedMovies(likesData.map(item => item.tmdb_id));
        }

        // Fetch watchlist items
        const watchlistResponse = await fetch('/api/user/watchlist', {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        if (watchlistResponse.ok) {
          const watchlistData = await watchlistResponse.json();
          setWatchLaterMovies(watchlistData.map(item => item.tmdb_id));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const fetchGenres = async () => {
      if (activeTab === "person") {
        setGenres([]);
        return;
      }
      
      try {
        const url = `https://api.themoviedb.org/3/genre/${activeTab}/list?language=en-US`;
        const response = await fetch(url, options);
        const data = await response.json();

        if (response.ok) {
          setGenres(data.genres || []);
        } else {
          throw new Error(data.message || "Failed to fetch genres");
        }
      } catch (error) {
        console.error("Error fetching genres:", error);
        toast.error("Failed to load categories");
      }
    };

    fetchGenres();
    setSelectedGenre(null);
  }, [activeTab,user]);
  // add user to depencencies

  const fetchResults = async (term, pageNum = 1, reset = true, genreId = null) => {
    if (!term.trim() && !genreId) {
      if (reset) setResults([]);
      return;
    }

    setIsLoading(true);
    
    try {
      let url;
      if (activeTab === "person") {
        url = `https://api.themoviedb.org/3/search/person?query=${term}&include_adult=false&language=en-US&page=${pageNum}`;
      } else {
        url = `https://api.themoviedb.org/3/search/${activeTab}?query=${term}&include_adult=false&language=en-US&page=${pageNum}`;
        
        // Add genre filtering if selected
        if (genreId) {
          url += `&with_genres=${genreId}`;
        }
      }

      // If no search term but genre is selected, use discover API instead
      if (!term.trim() && genreId && activeTab !== "person") {
        url = `https://api.themoviedb.org/3/discover/${activeTab}?with_genres=${genreId}&language=en-US&page=${pageNum}&sort_by=popularity.desc`;
      }

      const response = await fetch(url, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch results");
      }

      if (reset) {
        setResults(data.results || []);
      } else {
        setResults(prev => [...prev, ...(data.results || [])]);
      }

      setHasMore(data.page < data.total_pages);
      
      if (data.results.length === 0 && pageNum === 1) {
        toast.error("No results found");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error(error.message || "An error occurred during search");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch cast details for a movie or TV show
  const fetchCastDetails = async (id) => {
    setIsLoading(true);
    try {
      const url = `https://api.themoviedb.org/3/${activeTab}/${id}/credits?language=en-US`;
      const response = await fetch(url, options);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch cast details");
      }
      
      // Get top cast members (main roles)
      setCastDetails(data.cast?.slice(0, 10) || []);
    } catch (error) {
      console.error("Error fetching cast:", error);
      toast.error("Failed to load cast details");
      setCastDetails([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch person's famous works
  const fetchPersonWorks = async (id) => {
    setIsLoading(true);
    try {
      const url = `https://api.themoviedb.org/3/person/${id}/combined_credits?language=en-US`;
      const response = await fetch(url, options);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch person's works");
      }
      
      // Sort by popularity and get top works
      const sortedWorks = [...(data.cast || [])].sort((a, b) => b.popularity - a.popularity).slice(0, 10);
      setPersonWorks(sortedWorks);
    } catch (error) {
      console.error("Error fetching person's works:", error);
      toast.error("Failed to load person's works");
      setPersonWorks([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger search when searchTerm or activeTab or selectedGenre changes
  useEffect(() => {
    setPage(1);
    fetchResults(searchTerm, 1, true, selectedGenre);
  }, [searchTerm, activeTab, selectedGenre]);

  // Load more results when page changes
  useEffect(() => {
    if (page > 1) {
      fetchResults(searchTerm, page, false, selectedGenre);
    }
  }, [page]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setContentType(tab);
    setPage(1);
    setSelectedGenre(null);
    setShowDetails(false);
    setSelectedItem(null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchResults(searchTerm, 1, true, selectedGenre);
  };

  const handleGenreClick = (genreId) => {
    setSelectedGenre(genreId === selectedGenre ? null : genreId);
    setPage(1);
  };

  const handleCardClick = (item) => {
    setSelectedItem(item);
    setShowDetails(true);
    
    if (activeTab === "person") {
      fetchPersonWorks(item.id);
    } else {
      fetchCastDetails(item.id);
    }
  };

  const handleLike = async (movieId, e) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please login to like items");
      return;
    }

    try {
      const isLiked = likedMovies.includes(movieId);
      const endpoint = `/api/user/likes/${movieId}`;
      const method = isLiked ? 'DELETE' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          media_type: activeTab === 'tv' ? 'tv' : 'movie'
        })
      });
      if (response.ok) {
        setLikedMovies(prev => 
          isLiked ? prev.filter(id => id !== movieId) : [...prev, movieId]
        );
        toast.success(isLiked ? "Removed from favorites" : "❤️ Added to favorites");
      } else {
        throw new Error(await response.text());
      }
    } catch (error) {
      console.error("Like error:", error);
      toast.error(error.message || "Failed to update favorites");
    }
  };

  const handleWatchLater = async (movieId, e) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please login to save items");
      return;
    }

    try {
      const isSaved = watchLaterMovies.includes(movieId);
      const endpoint = `/api/user/watchlist/${movieId}`;
      const method = isSaved ? 'DELETE' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          media_type: activeTab === 'tv' ? 'tv' : 'movie'
        })
      });
      if (response.ok) {
        setWatchLaterMovies(prev => 
          isSaved ? prev.filter(id => id !== movieId) : [...prev, movieId]
        );
        toast.success(isSaved ? "Removed from watchlist" : "🔖 Saved to watch later");
      } else {
        throw new Error(await response.text());
      }
    } catch (error) {
      console.error("Watchlist error:", error);
      toast.error(error.message || "Failed to update watchlist");
    }
  };

  return (
    <div className='bg-black min-h-screen text-white'>
      <Navbar />
      <div className='container mx-auto px-4 py-8'>
        <div className='flex justify-center gap-3 mb-4'>
          <button
            className={`py-2 px-4 rounded ${
              activeTab === "movie" ? "bg-indigo-600" : "bg-gray-800"
            } hover:bg-indigo-700`}
            onClick={() => handleTabClick("movie")}
          >
            Movies
          </button>
          <button
            className={`py-2 px-4 rounded ${
              activeTab === "tv" ? "bg-indigo-600" : "bg-gray-800"
            } hover:bg-indigo-700`}
            onClick={() => handleTabClick("tv")}
          >
            TV Shows
          </button>
          <button
            className={`py-2 px-4 rounded ${
              activeTab === "person" ? "bg-indigo-600" : "bg-gray-800"
            } hover:bg-indigo-700`}
            onClick={() => handleTabClick("person")}
          >
            People
          </button>
        </div>

        <form 
          className='flex gap-2 items-stretch mb-4 max-w-2xl mx-auto'
          onSubmit={handleSearch}
        >
          <input
            type='text'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search ${activeTab === "movie" ? "movies" : activeTab === "tv" ? "TV shows" : "people"}`}
            className='w-full p-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500'
          />
          <button
            type="submit"
            className='bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded flex items-center justify-center'
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="animate-spin">↻</span>
            ) : (
              <Search className='size-6' />
            )}
          </button>
        </form>

        {/* Categories/Genres */}
        {activeTab !== "person" && genres.length > 0 && (
          <div className="mb-6 mt-4">
            <h3 className="text-lg font-semibold mb-2">Categories:</h3>
            <div className="flex flex-wrap gap-2">
              {genres.map(genre => (
                <button
                  key={genre.id}
                  onClick={() => handleGenreClick(genre.id)}
                  className={`py-1 px-3 rounded-full text-sm ${
                    selectedGenre === genre.id 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {genre.name}
                </button>
              ))}
              {selectedGenre && (
                <button
                  onClick={() => setSelectedGenre(null)}
                  className="py-1 px-3 rounded-full text-sm bg-red-600 text-white flex items-center gap-1"
                >
                  Clear <X className="size-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {isLoading && page === 1 && !showDetails && (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {/* Detail View Modal */}
        {showDetails && selectedItem && (
          <div className="fixed inset-0 bg-black/80 z-50 overflow-y-auto">
            <div className="container mx-auto p-4 max-w-4xl">
              <button 
                onClick={() => {
                  setShowDetails(false);
                  setSelectedItem(null);
                  setCastDetails([]);
                  setPersonWorks([]);
                }}
                className="bg-gray-800 hover:bg-gray-700 rounded-full p-2 absolute right-6 top-6"
              >
                <X className="size-6" />
              </button>
              
              <div className="bg-gray-900 rounded-lg p-6 mt-10">
                {activeTab === "person" ? (
                  <>
                    <div className="flex flex-col md:flex-row gap-6 mb-6">
                      <img 
                        src={selectedItem.profile_path ? `${ORIGINAL_IMG_BASE_URL}${selectedItem.profile_path}` : '/person-placeholder.jpg'} 
                        alt={selectedItem.name}
                        className="w-full md:w-64 h-auto rounded-lg object-cover"
                      />
                      <div>
                        <h2 className="text-3xl font-bold mb-2">{selectedItem.name}</h2>
                        <p className="text-gray-400 mb-4">{selectedItem.known_for_department}</p>
                        <p className="text-sm text-gray-300 mb-4">
                          Popularity: {selectedItem.popularity.toFixed(1)}
                        </p>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-3 border-b border-gray-700 pb-2">Famous Works</h3>
                    
                    {isLoading ? (
                      <div className="flex justify-center my-8">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {personWorks.map(work => (
                          <div key={`${work.id}-${work.credit_id}`} className="bg-gray-800 rounded overflow-hidden">
                            <img 
                              src={work.poster_path ? `${ORIGINAL_IMG_BASE_URL}${work.poster_path}` : '/movie-placeholder.jpg'} 
                              alt={work.title || work.name}
                              className="w-full h-40 object-cover"
                            />
                            <div className="p-2">
                              <h4 className="font-medium text-sm truncate">{work.title || work.name}</h4>
                              <p className="text-gray-400 text-xs">
                                {work.character && `as ${work.character}`}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex flex-col md:flex-row gap-6 mb-6">
                      <img 
                        src={selectedItem.poster_path ? `${ORIGINAL_IMG_BASE_URL}${selectedItem.poster_path}` : '/movie-placeholder.jpg'} 
                        alt={selectedItem.title || selectedItem.name}
                        className="w-full md:w-64 h-auto rounded-lg object-cover"
                      />
                      <div>
                        <h2 className="text-3xl font-bold mb-2">{selectedItem.title || selectedItem.name}</h2>
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="size-5 text-yellow-400 fill-yellow-400" />
                          <span>{selectedItem.vote_average?.toFixed(1)} ({selectedItem.vote_count} votes)</span>
                        </div>
                        <p className="text-gray-300 mb-4">
                          {activeTab === "movie" ? selectedItem.release_date : selectedItem.first_air_date}
                        </p>
                        <p className="text-sm text-gray-300 mb-4">{selectedItem.overview}</p>
                        
                        <div className="flex flex-wrap gap-2">
                          {selectedItem.genre_ids?.map(genreId => {
                            const genre = genres.find(g => g.id === genreId);
                            return genre ? (
                              <span key={genre.id} className="px-2 py-1 bg-gray-800 rounded-full text-xs">
                                {genre.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-3 border-b border-gray-700 pb-2">Cast</h3>
                    
                    {isLoading ? (
                      <div className="flex justify-center my-8">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {castDetails.map(actor => (
                          <div key={actor.id} className="bg-gray-800 rounded overflow-hidden">
                            <img 
                              src={actor.profile_path ? `${ORIGINAL_IMG_BASE_URL}${actor.profile_path}` : '/person-placeholder.jpg'} 
                              alt={actor.name}
                              className="w-full h-40 object-cover"
                            />
                            <div className="p-2">
                              <h4 className="font-medium text-sm">{actor.name}</h4>
                              <p className="text-gray-400 text-xs truncate">
                                {actor.character}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Results Grid */}
        {!showDetails && (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
            {results.map((result, index) => {
              if ((!result.poster_path && !result.profile_path) || 
                  (activeTab === "movie" && !result.poster_path) ||
                  (activeTab === "tv" && !result.poster_path)) {
                return null;
              }

              const imagePath = activeTab === "person" ? result.profile_path : result.poster_path;
              const title = activeTab === "person" ? result.name : result.title || result.name;

              // Attach ref to last element for infinite scroll
              const isLastResult = index === results.length - 1;
              
              return (
                <div 
                  key={`${result.id}-${index}`} 
                  ref={isLastResult ? lastResultRef : null}
                  className='bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-300 cursor-pointer'
                  onClick={() => handleCardClick(result)}
                >
                  {activeTab === "person" ? (
                    <div className='flex flex-col items-center p-4'>
                      <img
                        src={imagePath ? `${ORIGINAL_IMG_BASE_URL}${imagePath}` : '/person-placeholder.jpg'}
                        alt={title}
                        className='w-full h-64 object-cover rounded-lg mb-4'
                      />
                      <h2 className='text-xl font-bold text-center'>{title}</h2>
                      {result.known_for && (
                        <p className='text-gray-400 text-sm mt-2 text-center'>
                          Known for: {result.known_for.map(item => item.title || item.name).join(", ")}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="relative group">
                      <img
                        src={imagePath ? `${ORIGINAL_IMG_BASE_URL}${imagePath}` : '/movie-placeholder.jpg'}
                        alt={title}
                        className='w-full h-96 object-cover group-hover:opacity-80 transition-opacity'
                      />
                      <div className='p-4'>
                        <h2 className='text-xl font-bold'>{title}</h2>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="size-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-gray-400 text-sm">
                            {result.vote_average?.toFixed(1)}
                          </span>
                        </div>
                        <p className='text-gray-400 text-sm mt-1'>
                          {activeTab === "movie" ? result.release_date : result.first_air_date}
                        </p>
                      </div>
                      
                      {/* Action Buttons - Only show on hover */}
                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => handleLike(result.id, e)}
                          className={`p-2 rounded-full ${likedMovies.includes(result.id) ? 'bg-red-500' : 'bg-gray-800/90 hover:bg-red-500/80'}`}
                        >
                          <Heart className="size-5" fill={likedMovies.includes(result.id) ? 'white' : 'none'} />
                        </button>
                        <button
                          onClick={(e) => handleWatchLater(result.id, e)}
                          className={`p-2 rounded-full ${watchLaterMovies.includes(result.id) ? 'bg-blue-500' : 'bg-gray-800/90 hover:bg-blue-500/80'}`}
                        >
                          <Bookmark className="size-5" fill={watchLaterMovies.includes(result.id) ? 'white' : 'none'} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {isLoading && page > 1 && !showDetails && (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {!isLoading && results.length === 0 && searchTerm && !showDetails && (
          <div className="text-center py-12">
            <p className="text-xl">No results found for "{searchTerm}"</p>
            <p className="text-gray-400 mt-2">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;