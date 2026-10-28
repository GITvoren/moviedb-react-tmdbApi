import React, { useState, useEffect } from "react";
import "../assets/css/hero.css";

const GENRE_MAP = {
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
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

function Hero() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [watchlisted, setWatchlisted] = useState(false);
  const [trailerLoading, setTrailerLoading] = useState(false);
  const [activeTrailerKey, setActiveTrailerKey] = useState(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    const url = `https://api.themoviedb.org/3/trending/movie/day?api_key=${apiKey}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.results) {
          const formattedSlides = data.results.slice(0, 5).map((movie, index) => {
            const year = movie.release_date ? movie.release_date.split("-")[0] : "2026";
            const genres = movie.genre_ids
              ? movie.genre_ids.slice(0, 2).map((id) => GENRE_MAP[id] || "Film")
              : ["Featured"];

            return {
              id: movie.id,
              eyebrow: index === 0 ? "TRENDING NOW" : `FEATURED #${index + 1}`,
              title: movie.title || movie.name,
              subtitle: movie.tagline || "FEATURED FILM",
              highlight: String(index + 1).padStart(2, "0"),
              rating: movie.vote_average ? movie.vote_average.toFixed(1) : "N/A",
              year: year,
              genres: genres,
              description: movie.overview || "No description available.",
              artwork: movie.backdrop_path
                ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
                : null,
            };
          });

          setSlides(formattedSlides);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch trending movies for hero:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const handleKeyDownEsc = (e) => {
      if (e.key === "Escape") {
        setActiveTrailerKey(null);
      }
    };
    if (activeTrailerKey) {
      window.addEventListener("keydown", handleKeyDownEsc);
    }
    return () => window.removeEventListener("keydown", handleKeyDownEsc);
  }, [activeTrailerKey]);


  const handleWatchTrailer = async (movieId, movieTitle) => {
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    setTrailerLoading(true);

    try {
      const res = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}`);
      const data = await res.json();
      
      const trailer = data.results?.find(
        (vid) => vid.site === "YouTube" && (vid.type === "Trailer" || vid.type === "Teaser")
      );

      if (trailer) {
        setActiveTrailerKey(trailer.key);
      } else {
        alert(`Sorry, no trailer available for "${movieTitle}"!`);
      }
    } catch (err) {
      console.error("Failed to fetch trailer:", err);
      alert("Something went wrong while fetching the trailer.");
    } finally {
      setTrailerLoading(false);
    }
  };

  const changeSlide = (direction) => {
    if (slides.length === 0) return;
    setActiveIndex(
      (current) => (current + direction + slides.length) % slides.length
    );
    setWatchlisted(false);
  };

  const selectSlide = (index) => {
    setActiveIndex(index);
    setWatchlisted(false);
  };

  const handleKeyDown = (event) => {
    if (
      event.target instanceof HTMLElement &&
      event.target.closest("button")
    ) {
      return;
    }

    if (event.key === "ArrowLeft") {
      changeSlide(-1);
    } else if (event.key === "ArrowRight") {
      changeSlide(1);
    }
  };

  if (loading || slides.length === 0) {
    return (
      <section className="movie-hero" aria-label="Loading featured movies">
        <div className="movie-hero__content" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
          <p style={{ color: "#fff" }}>Loading featured slider...</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section
        className="movie-hero"
        aria-label="Featured movies"
        aria-roledescription="carousel"
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <div
          className="movie-hero__track"
          style={{
            transform: `translate3d(-${activeIndex * 100}%, 0, 0)`,
          }}
        >
          {slides.map((movie, index) => (
            <article
              className="movie-hero__slide"
              key={movie.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${slides.length}: ${movie.title}`}
              aria-hidden={index !== activeIndex}
              inert={index !== activeIndex ? "true" : undefined}
            >
              <div
                className="movie-hero__artwork"
                aria-hidden="true"
                style={
                  movie.artwork
                    ? { backgroundImage: `url("${movie.artwork}")` }
                    : undefined
                }
              >
                {!movie.artwork && (
                  <div className="movie-hero__asset-placeholder" />
                )}
              </div>

              <div className="movie-hero__scrim" aria-hidden="true" />

              <div className="movie-hero__content">
                <div className="movie-hero__eyebrow">
                  <span className="movie-hero__eyebrow-slash" />
                  {movie.eyebrow}
                </div>

                <h2 className="movie-hero__title">
                  {movie.title}
                </h2>

                <div className="movie-hero__metadata">
                  <span className="movie-hero__rating">
                    <svg
                      className="movie-hero__star"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2Z" />
                    </svg>
                    {movie.rating}
                  </span>

                  <span className="movie-hero__separator" />
                  <span>{movie.year}</span>
                  <span className="movie-hero__separator" />

                  {movie.genres.map((genre, genreIndex) => (
                    <React.Fragment key={genre}>
                      {genreIndex > 0 && (
                        <span className="movie-hero__genre-dot">·</span>
                      )}
                      <span>{genre}</span>
                    </React.Fragment>
                  ))}
                </div>

                <p className="movie-hero__description">
                  {movie.description}
                </p>

                <div className="movie-hero__actions">
                  <button
                    className="movie-hero__button movie-hero__button--primary"
                    type="button"
                    disabled={trailerLoading}
                    onClick={() => handleWatchTrailer(movie.id, movie.title)}
                  >
                    <svg
                      className="movie-hero__button-icon"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M8 5v14l11-7L8 5Z" />
                    </svg>
                    {trailerLoading ? "Loading..." : "Watch Trailer"}
                  </button>

                  <button
                    className={`movie-hero__button movie-hero__button--secondary${
                      watchlisted ? " is-selected" : ""
                    }`}
                    type="button"
                    aria-pressed={watchlisted}
                    onClick={() =>
                      setWatchlisted((current) => !current)
                    }
                  >
                    <svg
                      className="movie-hero__button-icon movie-hero__plus-icon"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      {watchlisted ? (
                        <path d="m5 12 4 4L19 6" />
                      ) : (
                        <path d="M12 5v14M5 12h14" />
                      )}
                    </svg>
                    {watchlisted
                      ? "Added to Watchlist"
                      : "Add to Watchlist"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <button
          className="movie-hero__arrow movie-hero__arrow--previous"
          type="button"
          aria-label="Previous featured movie"
          onClick={() => changeSlide(-1)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m15 5-7 7 7 7" />
          </svg>
        </button>

        <div className="movie-hero__pagination" aria-label="Choose slide">
          {slides.map((movie, index) => (
            <button
              key={movie.id}
              className={`movie-hero__dot${
                index === activeIndex ? " is-active" : ""
              }`}
              type="button"
              aria-label={`Go to slide ${index + 1}: ${movie.title}`}
              aria-current={index === activeIndex ? "true" : undefined}
              onClick={() => selectSlide(index)}
            />
          ))}
        </div>

        <button
          className="movie-hero__arrow movie-hero__arrow--next"
          type="button"
          aria-label="Next featured movie"
          onClick={() => changeSlide(1)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m9 5 7 7-7 7" />
          </svg>
        </button>
      </section>

      {activeTrailerKey && (
        <div
          className="trailer-modal"
          onClick={() => setActiveTrailerKey(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(8px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            className="trailer-modal__container"
            onClick={(e) => e.stopPropagation()} // Prevent close on iframe container click
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "900px",
              aspectRatio: "16 / 9",
              backgroundColor: "#000",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTrailerKey(null)}
              aria-label="Close trailer"
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                zIndex: 10,
                background: "rgba(0, 0, 0, 0.7)",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
              }}
            >
              ✕
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${activeTrailerKey}?autoplay=1`}
              title="Movie Trailer"
              style={{
                width: "100%",
                height: "100%",
                border: "none",
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
}

export default Hero;