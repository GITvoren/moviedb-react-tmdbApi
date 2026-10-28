import React, { useEffect, useRef, useState } from "react";
import "../assets/css/navbar.css";

const BRAND_LOGO = "/images/brand-logo.png";

const CATEGORIES = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Science Fiction",
  "Thriller",
];

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="8.8" cy="8.8" r="5.7" stroke="currentColor" strokeWidth="1.7" />
      <path d="m13 13 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function MenuIcon({ open }) {
  return open ? (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ) : (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg
      className={`flix-header__chevron ${open ? "flix-header__chevron--open" : ""}`}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function FlixDBHeader({ onSearch, onCategorySelect, onNavigate }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchHovered, setIsSearchHovered] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isTabletOrMobile, setIsTabletOrMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const searchInputRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 900px)");
    const updateScreenSize = () => setIsTabletOrMobile(mediaQuery.matches);
    updateScreenSize();
    mediaQuery.addEventListener("change", updateScreenSize);
    return () => mediaQuery.removeEventListener("change", updateScreenSize);
  }, []);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setCategoriesOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        setCategoriesOpen(false);
        setIsSearchHovered(false);
        searchInputRef.current?.blur();
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const isSearchExpanded = isSearchHovered || isSearchFocused || isTabletOrMobile;

  function handleSearchSubmit(event) {
    event.preventDefault();
    const query = searchQuery.trim();
    onSearch?.(query);
    setMobileMenuOpen(false);
  }

  function handleClearSearch() {
    setSearchQuery("");
    onSearch?.("");
    searchInputRef.current?.focus();
  }

  function navigateTo(page) {
    onNavigate?.(page);
    setMobileMenuOpen(false);
    setCategoriesOpen(false);
  }

  function handleCategoryClick(category) {
    onCategorySelect?.(category);
    setCategoriesOpen(false);
    setMobileMenuOpen(false);
  }

  return (
    <header className="flix-header" ref={headerRef}>
      <div className="flix-header__inner">
        <div>
          <a
            className="flix-header__brand"
            href="/"
            aria-label="FLIXDB home"
            onClick={(event) => {
              event.preventDefault();
              navigateTo("home");
            }}
          >
            <img className="flix-header__logo" src={BRAND_LOGO} alt="FLIXDB" />
          </a>

          <nav className="flix-header__desktop-nav" aria-label="Main navigation">
            <button type="button" className="flix-header__nav-link" onClick={() => navigateTo("movies")}>
              Movies
            </button>

            <button type="button" className="flix-header__nav-link" onClick={() => navigateTo("tv-shows")}>
              TV Shows
            </button>

            <div className="flix-header__categories">
              <button
                type="button"
                className={`flix-header__nav-link ${categoriesOpen ? "is-active" : ""}`}
                aria-expanded={categoriesOpen}
                onClick={() => setCategoriesOpen((open) => !open)}
              >
                Categories
                <ChevronIcon open={categoriesOpen} />
              </button>

              {categoriesOpen && (
                <div className="flix-header__category-menu">
                  <p className="flix-header__dropdown-title">Browse by genre</p>
                  <div className="flix-header__category-grid">
                    {CATEGORIES.map((category) => (
                      <button
                        type="button"
                        key={category}
                        className="flix-header__category-item"
                        onClick={() => handleCategoryClick(category)}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>

        <div className="flix-header__actions">
          <form
            className={`flix-header__search ${
              isSearchExpanded ? "flix-header__search--expanded" : "flix-header__search--collapsed"
            }`}
            role="search"
            onSubmit={handleSearchSubmit}
            onMouseEnter={() => setIsSearchHovered(true)}
            onMouseLeave={() => setIsSearchHovered(false)}
          >
            <button className="flix-header__search-submit" type="submit" aria-label="Search">
              <SearchIcon />
            </button>

            <input
              ref={searchInputRef}
              className="flix-header__search-input"
              type="search"
              placeholder={isSearchExpanded ? "Search movies, TV shows, actors..." : ""}
              aria-label="Search movies, TV shows, and actors"
              value={searchQuery}
              onChange={(event) => {
                const value = event.target.value;
                setSearchQuery(value);
                onSearch?.(value);
              }}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              autoComplete="off"
            />

            <button
              className={`flix-header__clear ${
                searchQuery ? "flix-header__clear--visible" : ""
              }`}
              type="button"
              aria-label="Clear search"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleClearSearch}
            >
              &times;
            </button>
          </form>

          <span className="flix-header__divider" aria-hidden="true" />

          <button
            type="button"
            className="flix-header__profile"
            aria-label="Open profile"
            onClick={() => console.log("Open profile")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
              <path d="M5 20c.7-3.5 3.2-5.3 7-5.3s6.3 1.8 7 5.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>

          <button type="button" className="flix-header__login" onClick={() => console.log("Open login")}>
            Login / Register
          </button>

          <button
            type="button"
            className="flix-header__menu-toggle"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="flix-mobile-navigation"
            onClick={() => {
              setMobileMenuOpen((open) => !open);
              setCategoriesOpen(false);
            }}
          >
            <MenuIcon open={mobileMenuOpen} />
          </button>
        </div>
      </div>

      <div
        id="flix-mobile-navigation"
        className={`flix-header__mobile-panel ${mobileMenuOpen ? "is-open" : ""}`}
        aria-hidden={!mobileMenuOpen}
      >
        <nav className="flix-header__mobile-nav" aria-label="Mobile navigation">
          <button
            type="button"
            className="flix-header__mobile-link"
            tabIndex={mobileMenuOpen ? 0 : -1}
            onClick={() => navigateTo("movies")}
          >
            Movies
          </button>

          <button
            type="button"
            className="flix-header__mobile-link"
            tabIndex={mobileMenuOpen ? 0 : -1}
            onClick={() => navigateTo("tv-shows")}
          >
            TV Shows
          </button>

          <button
            type="button"
            className="flix-header__mobile-link"
            aria-expanded={categoriesOpen}
            tabIndex={mobileMenuOpen ? 0 : -1}
            onClick={() => setCategoriesOpen((open) => !open)}
          >
            Categories
            <ChevronIcon open={categoriesOpen} />
          </button>

          {categoriesOpen && (
            <div className="flix-header__mobile-categories">
              {CATEGORIES.map((category) => (
                <button
                  type="button"
                  key={category}
                  className="flix-header__mobile-category"
                  tabIndex={mobileMenuOpen ? 0 : -1}
                  onClick={() => handleCategoryClick(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          <div className="flix-header__mobile-account">
            <button
              type="button"
              className="flix-header__mobile-login"
              tabIndex={mobileMenuOpen ? 0 : -1}
              onClick={() => console.log("Open login")}
            >
              Log in
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}