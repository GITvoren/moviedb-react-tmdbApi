import React, { useEffect, useState, useRef } from "react";
import "../assets/css/moviedetailsmodal.css";

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7 4.8c0-.8.9-1.3 1.6-.8l11 7.2a1 1 0 0 1 0 1.6l-11 7.2c-.7.5-1.6 0-1.6-.8V4.8Z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="m8 1.4 2 4.05 4.47.65-3.24 3.16.77 4.46L8 11.61l-4 2.11.77-4.46L1.53 6.1 6 5.45 8 1.4Z" />
    </svg>
  );
}

export default function MovieDetailsModal({
  movie,
  isOpen,
  onClose,
  onAddToWatchlist,
}) {
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  const [detailedData, setDetailedData] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Fetch full details, credits, and videos from TMDB when modal opens
  useEffect(() => {
    if (!isOpen || !movie?.id) {
      setDetailedData(null);
      return;
    }

    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    setLoadingDetails(true);

    Promise.all([
      fetch(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}`).then((res) => res.json()),
      fetch(`https://api.themoviedb.org/3/movie/${movie.id}/credits?api_key=${apiKey}`).then((res) => res.json()),
      fetch(`https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${apiKey}`).then((res) => res.json()),
    ])
      .then(([detailsData, creditsData, videosData]) => {
        const directorObj = creditsData.crew?.find((person) => person.job === "Director");
        const topCast = creditsData.cast?.slice(0, 4).map((actor) => actor.name) || [];

        // Find official YouTube trailer or teaser video
        const trailer = videosData.results?.find(
          (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
        );
        const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;

        setDetailedData({
          runtime: detailsData.runtime ? `${detailsData.runtime} min` : null,
          tagline: detailsData.tagline || null,
          overview: detailsData.overview || movie.overview,
          director: directorObj ? directorObj.name : null,
          cast: topCast,
          genres: detailsData.genres ? detailsData.genres.map((g) => g.name) : movie.genres,
          trailerUrl: trailerUrl,
        });
        setLoadingDetails(false);
      })
      .catch((err) => {
        console.error("Failed to fetch extended movie details:", err);
        setLoadingDetails(false);
      });
  }, [isOpen, movie]);

  // Accessibility & Focus Trap
  useEffect(() => {
    if (!isOpen || !movie) return undefined;

    previousFocusRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 0);

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus?.();
    };
  }, [isOpen, movie, onClose]);

  if (!isOpen || !movie) {
    return null;
  }

  const title = movie.title || "Untitled Movie";
  const year = movie.year;
  const rating = movie.rating;
  const posterSrc = movie.poster || "";

  const runtime = detailedData?.runtime;
  const tagline = detailedData?.tagline;
  const overview = detailedData?.overview;
  const director = detailedData?.director;
  const castList = detailedData?.cast || [];
  const genreList = detailedData?.genres || movie.genres || [];
  const trailerUrl = detailedData?.trailerUrl;

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  }

  function handleWatchClick() {
    if (trailerUrl) {
      window.open(trailerUrl, "_blank", "noopener,noreferrer");
    } else {
      alert(`Sorry, no trailer video found for "${title}".`);
    }
  }

  return (
    <div className="movie-details-modal" onMouseDown={handleBackdropClick}>
      <section
        className="movie-details-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="movie-details-title"
        aria-describedby="movie-details-overview"
      >
        <button
          ref={closeButtonRef}
          className="movie-details-modal__close"
          type="button"
          aria-label="Close movie details"
          onClick={onClose}
        >
          <CloseIcon />
        </button>

        <div className="movie-details-modal__content">
          <div className="movie-details-modal__poster-column">
            <div className="movie-details-modal__poster">
              {posterSrc ? (
                <img src={posterSrc} alt={`${title} poster`} className="movie-details-modal__poster-image" />
              ) : (
                <div className="movie-details-modal__poster-placeholder">
                  <span>{title}</span>
                </div>
              )}
            </div>

            {rating != null && (
              <div className="movie-details-modal__rating">
                <StarIcon />
                <span>{Number(rating).toFixed(1)}</span>
                <span className="movie-details-modal__rating-out-of"> / 10</span>
              </div>
            )}
          </div>

          <div className="movie-details-modal__info">
            <div className="movie-details-modal__eyebrow">MOVIE DETAILS</div>

            <h2 className="movie-details-modal__title" id="movie-details-title">
              {title}
            </h2>

            {tagline && <p className="movie-details-modal__tagline">{tagline}</p>}

            <div className="movie-details-modal__metadata">
              {year && <span className="movie-details-modal__metadata-item">{year}</span>}
              {runtime && (
                <>
                  <span className="movie-details-modal__separator" aria-hidden="true">·</span>
                  <span className="movie-details-modal__metadata-item">{runtime}</span>
                </>
              )}
            </div>

            {genreList.length > 0 && (
              <div className="movie-details-modal__genres" aria-label="Genres">
                {genreList.map((genre) => (
                  <span className="movie-details-modal__genre" key={genre}>
                    {genre}
                  </span>
                ))}
              </div>
            )}

            <div className="movie-details-modal__divider" />

            <section className="movie-details-modal__section">
              <h3 className="movie-details-modal__section-title">Overview</h3>
              <p className="movie-details-modal__overview" id="movie-details-overview">
                {loadingDetails && !overview ? "Loading overview..." : overview || "No overview available."}
              </p>
            </section>

            {(director || castList.length > 0 || loadingDetails) && (
              <section className="movie-details-modal__credits">
                {director && (
                  <div className="movie-details-modal__credit">
                    <span className="movie-details-modal__credit-label">Director</span>
                    <span className="movie-details-modal__credit-value">{director}</span>
                  </div>
                )}

                {castList.length > 0 && (
                  <div className="movie-details-modal__credit">
                    <span className="movie-details-modal__credit-label">Cast</span>
                    <span className="movie-details-modal__credit-value">{castList.join(", ")}</span>
                  </div>
                )}
              </section>
            )}

            <div className="movie-details-modal__actions">
              <button
                className="movie-details-modal__button movie-details-modal__button--primary"
                type="button"
                onClick={handleWatchClick}
                disabled={loadingDetails}
              >
                <PlayIcon />
                <span>{loadingDetails ? "Loading..." : "Watch trailer"}</span>
              </button>

              {onAddToWatchlist && (
                <button
                  className="movie-details-modal__button movie-details-modal__button--secondary"
                  type="button"
                  onClick={() => onAddToWatchlist(movie)}
                >
                  Add to watchlist
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}