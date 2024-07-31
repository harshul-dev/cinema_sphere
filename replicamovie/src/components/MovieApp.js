import React, { useState, useEffect } from 'react';

const MovieHouse = () => {
  const [movies, setMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [genres, setGenres] = useState([]);
  const [expandedMovieId, setExpandedMovieId] = useState(null);
  const [noResults, setNoResults] = useState(false); // New state for handling no results

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genreResponse = await fetch('https://api.themoviedb.org/3/genre/movie/list?api_key=fce995076a5c678654b30cc97d6b0c20');
        const genreData = await genreResponse.json();
        setGenres(genreData.genres || []);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };

    const fetchDefaultMovies = async () => {
      try {
        const movieResponse = await fetch('https://api.themoviedb.org/3/movie/popular?api_key=fce995076a5c678654b30cc97d6b0c20');
        const movieData = await movieResponse.json();
        setMovies(movieData.results || []);
      } catch (error) {
        console.error('Error fetching default movies:', error);
      }
    };

    fetchGenres();
    fetchDefaultMovies();
  }, []);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = async () => {
    try {
      const queryString = new URLSearchParams({
        api_key: 'fce995076a5c678654b30cc97d6b0c20',
        query: searchQuery,
      }).toString();

      const response = await fetch(`https://api.themoviedb.org/3/search/movie?${queryString}`);
      const data = await response.json();
      setMovies(data.results || []);
      setNoResults(data.results.length === 0 && searchQuery !== ''); // Set noResults state
    } catch (error) {
      console.error('Error searching movies:', error);
    }
  };

  const handleSortChange = async (event) => {
    setSortBy(event.target.value);
    try {
      const queryString = new URLSearchParams({
        api_key: 'fce995076a5c678654b30cc97d6b0c20',
        sort_by: event.target.value,
        with_genres: selectedGenre,
      }).toString();

      const response = await fetch(`https://api.themoviedb.org/3/discover/movie?${queryString}`);
      const data = await response.json();
      setMovies(data.results || []);
    } catch (error) {
      console.error('Error sorting movies:', error);
    }
  };

  const handleGenreChange = async (event) => {
    setSelectedGenre(event.target.value);
    try {
      const queryString = new URLSearchParams({
        api_key: 'fce995076a5c678654b30cc97d6b0c20',
        sort_by: sortBy,
        with_genres: event.target.value,
      }).toString();

      const response = await fetch(`https://api.themoviedb.org/3/discover/movie?${queryString}`);
      const data = await response.json();
      setMovies(data.results || []);
    } catch (error) {
      console.error('Error filtering movies by genre:', error);
    }
  };

  const toggleDescription = (movieId) => {
    setExpandedMovieId(expandedMovieId === movieId ? null : movieId);
  };

  return (
    <div>
      <h1 className="cinema">Cinema Sphere</h1>
      <div className="search-bar">
        <input
          className="search-input"
          value={searchQuery}
          onChange={handleSearchChange}
          type="text"
          placeholder="Search Movies..."
        />
        <button className="search-button" onClick={handleSearchSubmit}>
          Go
        </button>
      </div>
      <div className="filters">
        <label htmlFor="sort-by">Sort By:</label>
        <select id="sort-by" value={sortBy} onChange={handleSortChange}>
          <option value="popularity.desc">Popularity Descending</option>
          <option value="popularity.asc">Popularity Ascending</option>
          <option value="vote_average.desc">Rating Descending</option>
          <option value="vote_average.asc">Rating Ascending</option>
          <option value="release_date.desc">Release Date Descending</option>
          <option value="release_date.asc">Release Date Ascending</option>
        </select>
        <label htmlFor="genre">Genre:</label>
        <select id="genre" value={selectedGenre} onChange={handleGenreChange}>
          <option value="">All Genres</option>
          {genres.length > 0 && genres.map((genre) => (
            <option key={genre.id} value={genre.id}>{genre.name}</option>
          ))}
        </select>
      </div>
      <div className="movie-wrapper">
        {noResults ? (
          <p className="found">Sorry! Unable to found related search...</p>
        ) : (
          movies.length > 0 ? (
            movies.map((movie) => (
              <div key={movie.id} className="movie">
                <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
                <h2>{movie.title}</h2>
                <p className="rating">Rating: {movie.vote_average}</p>
                {expandedMovieId === movie.id ? (
                  <p>{movie.overview}</p>
                ) : (
                  <p>{movie.overview.substring(0, 100)}...</p>
                )}
                <button onClick={() => toggleDescription(movie.id)} className="read-more">
                  {expandedMovieId === movie.id ? 'Show less' : 'Read more'}
                </button>
              </div>
            ))
          ) : (
            <p className="task">No movie found...</p>
          )
        )}
      </div>
    </div>
  );
};

export default MovieHouse;
