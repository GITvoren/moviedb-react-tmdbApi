import React, { useEffect, useState, useRef } from "react";
import "../assets/css/moviebrowser.css";
import MovieDetailsModal from "./MovieDetailsModal";

// Fallback genre mappings in case TMDB genre fetch is pending
const STATIC_GENRE_MAP = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

const sortOptions = [
  { value: "trending", label: "Trending", apiSort: "popularity.desc" },
  { value: "rating", label: "Highest Rated", apiSort: "vote_average.desc" },
  { value: "newest", label: "Newest First", apiSort: "primary_release_date.desc" },
  { value: "oldest", label: "Oldest First", apiSort: "primary_release_date.asc" },
  { value: "title", label: "Title A–Z", apiSort: "original_title.asc" },
];

function MoreIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
      <circle cx="8" cy="3" r="1.25" />
      <circle cx="8" cy="8" r="1.25" />
      <circle cx="8" cy="13" r="1.25" />
    </svg>
  );
}

function ChevronIcon({ direction = "down" }) {
  const paths = {
    down: "m4 6 4 4 4-4",
    left: "m10 4-4 4 4 4",
    right: "m6 4 4 4-4 4",
  };

  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
      <path d={paths[direction]} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="movie-card__star" viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
      <path fill="currentColor" d="m8 1.4 2 4.05 4.47.65-3.24 3.16.77 4.46L8 11.61l-4 2.11.77-4.46L1.53 6.1 6 5.45 8 1.4Z" />
    </svg>
  );
}

function MovieCard({ movie, onAction, openMenu, setOpenMenu, menuRef }) {
  const isMenuOpen = openMenu === movie.id;

  return (
    <article className="movie-card">
      <div
        className="movie-card__poster"
        role="button"
        tabIndex={0}
        aria-label={`View details for ${movie.title}`}
        data-poster-id={movie.id}
        onClick={() => onAction("details", movie)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onAction("details", movie);
          }
        }}
        style={{ cursor: "pointer" }}
      >
        {movie.poster ? (
          <img
            src={movie.poster}
            alt={movie.title}
            className="movie-card__poster-img"
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }}
          />
        ) : (
          <div className="movie-card__poster-slot" />
        )}

        <div className="movie-card__rating" aria-label={`Rating ${movie.rating} out of 10`}>
          <StarIcon />
          <span>{movie.rating.toFixed(1)}</span>
        </div>
      </div>

      <div className="movie-card__details">
        <div className="movie-card__title-row">
          <h3
            className="movie-card__title"
            title={movie.title}
            onClick={() => onAction("details", movie)}
            style={{ cursor: "pointer" }}
          >
            {movie.title}
          </h3>

          <div className="movie-card__menu-wrap" ref={isMenuOpen ? menuRef : null}>
            <button
              className="movie-card__more"
              type="button"
              aria-label={`More options for ${movie.title}`}
              aria-expanded={isMenuOpen}
              aria-haspopup="menu"
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenu((current) => (current === movie.id ? null : movie.id));
              }}
            >
              <MoreIcon />
            </button>

            {isMenuOpen && (
              <div className="movie-card__menu" role="menu">
                <button
                  type="button"
                  role="menuitem"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAction("details", movie);
                    setOpenMenu(null);
                  }}
                >
                  View details
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAction("watchlist", movie);
                    setOpenMenu(null);
                  }}
                >
                  Add to watchlist
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="movie-card__metadata">
          <span>{movie.year}</span>
          <span className="movie-card__separator" aria-hidden="true">·</span>
          <span>{movie.genres.join(" · ")}</span>
        </p>
      </div>
    </article>
  );
}

export default function MovieBrowser({ searchQuery, onMovieAction }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tmdbGenres, setTmdbGenres] = useState([]);
  const [selectedGenreId, setSelectedGenreId] = useState(null);
  const [selectedGenreName, setSelectedGenreName] = useState("All");
  const [sortBy, setSortBy] = useState("trending");
  const [showMoreGenres, setShowMoreGenres] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [watchlist, setWatchlist] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const genreDropdownRef = useRef(null);
  const movieMenuRef = useRef(null);

  // 1. Fetch available TMDB genres on initial mount
  useEffect(() => {
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.genres) {
          setTmdbGenres(data.genres);
        }
      })
      .catch((err) => console.error("Failed to fetch genres:", err));
  }, []);

  // 2. Unified Fetch Hook (Handles Search OR Discover based on searchQuery)
  useEffect(() => {
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    setLoading(true);

    let url = "";

    if (searchQuery && searchQuery.trim() !== "") {
      // TMDB Search Endpoint
      url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(
        searchQuery.trim()
      )}&page=${currentPage}`;
    } else {
      // TMDB Discover Endpoint (Sorting & Filtering)
      const currentSort = sortOptions.find((o) => o.value === sortBy)?.apiSort || "popularity.desc";
      url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=${currentSort}&page=${currentPage}&vote_count.gte=100`;

      if (selectedGenreId) {
        url += `&with_genres=${selectedGenreId}`;
      }
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.results) {
          const formatted = data.results.map((m) => {
            const year = m.release_date ? m.release_date.split("-")[0] : "N/A";
            const mappedGenres = m.genre_ids
              ? m.genre_ids.slice(0, 2).map((id) => {
                  const found = tmdbGenres.find((g) => g.id === id);
                  return found ? found.name : STATIC_GENRE_MAP[id] || "Film";
                })
              : ["Movie"];

            return {
              id: m.id,
              title: m.title,
              year: year,
              genres: mappedGenres,
              rating: m.vote_average || 0,
              poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
            };
          });

          setMovies(formatted);
          setTotalPages(Math.min(data.total_pages || 1, 500));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch movies:", err);
        setLoading(false);
      });
  }, [searchQuery, selectedGenreId, sortBy, currentPage, tmdbGenres]);

  // Outside click / Escape listeners
  useEffect(() => {
    function handleOutsideClick(event) {
      const target = event.target;
      if (genreDropdownRef.current && !genreDropdownRef.current.contains(target)) {
        setShowMoreGenres(false);
      }
      if (movieMenuRef.current && !movieMenuRef.current.contains(target)) {
        setOpenMenu(null);
      }
    }

    document.addEventListener("pointerdown", handleOutsideClick);
    return () => document.removeEventListener("pointerdown", handleOutsideClick);
  }, []);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        setShowMoreGenres(false);
        setOpenMenu(null);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const primaryGenres = tmdbGenres.slice(0, 4);
  const extraGenres = tmdbGenres.slice(4);

  function selectGenre(genreId, genreName) {
    setSelectedGenreId(genreId);
    setSelectedGenreName(genreName);
    setCurrentPage(1);
    setShowMoreGenres(false);
    setOpenMenu(null);
  }

  function handleMovieAction(action, movie) {
    if (action === "details") {
      setSelectedMovie(movie);
      return;
    }

    if (action === "watchlist") {
      setWatchlist((current) => (current.includes(movie.id) ? current : [...current, movie.id]));
    }

    onMovieAction?.(action, movie);
  }

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <section className="movie-browser" aria-label="Movie discovery">
      <header className="movie-browser__toolbar">
        <div className="movie-browser__filters">
          <span className="movie-browser__filter-label">Genres</span>

          <nav className="movie-browser__genre-list" aria-label="Filter movies by genre">
            <button
              className={`movie-browser__chip ${selectedGenreName === "All" ? "movie-browser__chip--active" : ""}`}
              type="button"
              aria-pressed={selectedGenreName === "All"}
              onClick={() => selectGenre(null, "All")}
            >
              All
            </button>

            {primaryGenres.map((g) => (
              <button
                key={g.id}
                className={`movie-browser__chip ${selectedGenreId === g.id ? "movie-browser__chip--active" : ""}`}
                type="button"
                aria-pressed={selectedGenreId === g.id}
                onClick={() => selectGenre(g.id, g.name)}
              >
                {g.name}
              </button>
            ))}

            <div className="movie-browser__extra-wrap" ref={genreDropdownRef}>
              <button
                className={`movie-browser__chip movie-browser__chip--more ${
                  extraGenres.some((g) => g.id === selectedGenreId) ? "movie-browser__chip--active" : ""
                }`}
                type="button"
                aria-label="More genres"
                aria-expanded={showMoreGenres}
                aria-haspopup="menu"
                onClick={() => {
                  setShowMoreGenres((current) => !current);
                  setOpenMenu(null);
                }}
              >
                <span aria-hidden="true">•••</span>
              </button>

              {showMoreGenres && (
                <div className="movie-browser__genre-menu" role="menu" aria-label="Additional genres">
                  {extraGenres.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      role="menuitemradio"
                      aria-checked={selectedGenreId === g.id}
                      className={selectedGenreId === g.id ? "is-selected" : ""}
                      onClick={() => selectGenre(g.id, g.name)}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>

        <div className="movie-browser__sort">
          <label htmlFor="movie-sort">Sort by</label>

          <div className="movie-browser__select-wrap">
            <span className="movie-browser__sort-icon" aria-hidden="true">
              <svg viewBox="0 0 20 20" width="15" height="15">
                <path
                  fill="currentColor"
                  d="M10.5 1.5c.4 2.2-.9 3.3-2 4.7-1 1.2-1.5 2.1-1.5 3.4a3 3 0 0 0 3 3c-.4-1.3.1-2.2 1-3.1 2.1 2 2.7 3.4 2.1 5.1a4.4 4.4 0 0 1-8.6-1.5c0-3.3 2.3-5.1 4-7.1 1-1.2 1.5-2.5 2-4.5Z"
                />
              </svg>
            </span>

            <select
              id="movie-sort"
              value={sortBy}
              onChange={(event) => {
                setSortBy(event.target.value);
                setCurrentPage(1);
              }}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <span className="movie-browser__select-chevron">
              <ChevronIcon />
            </span>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="movie-browser__loading" style={{ textAlign: "center", padding: "4rem 0", color: "#aaa" }}>
          <p>Loading movies...</p>
        </div>
      ) : (
        <div className="movie-browser__grid">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onAction={handleMovieAction}
              openMenu={openMenu}
              setOpenMenu={setOpenMenu}
              menuRef={movieMenuRef}
            />
          ))}
        </div>
      )}

      {!loading && movies.length === 0 && (
        <div className="movie-browser__empty">
          <p>No movies found.</p>
          <button type="button" onClick={() => selectGenre(null, "All")}>
            Clear filters
          </button>
        </div>
      )}

      {!loading && totalPages > 1 && (
        <nav className="movie-browser__pagination" aria-label="Movie pages">
          <button
            className="movie-browser__page movie-browser__page--arrow"
            type="button"
            aria-label="Previous page"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          >
            <ChevronIcon direction="left" />
          </button>

          {getPageNumbers().map((page) => (
            <button
              key={page}
              className={`movie-browser__page ${currentPage === page ? "movie-browser__page--active" : ""}`}
              type="button"
              aria-label={`Page ${page}`}
              aria-current={currentPage === page ? "page" : undefined}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}

          <button
            className="movie-browser__page movie-browser__page--arrow"
            type="button"
            aria-label="Next page"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
          >
            <ChevronIcon direction="right" />
          </button>
        </nav>
      )}

      <MovieDetailsModal
        movie={selectedMovie}
        isOpen={Boolean(selectedMovie)}
        onClose={() => setSelectedMovie(null)}
        onAddToWatchlist={(movie) => {
          setWatchlist((current) => (current.includes(movie.id) ? current : [...current, movie.id]));
          setSelectedMovie(null);
        }}
      />
    </section>
  );
}