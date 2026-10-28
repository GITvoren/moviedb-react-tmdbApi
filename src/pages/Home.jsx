import React from "react";
import Hero from '../components/Hero.jsx';
import MovieBrowser from '../components/MovieBrowser.jsx';

export default function Home({ searchQuery }) {
  return (
    <section id="home">
      <Hero />
      <MovieBrowser searchQuery={searchQuery} />
    </section>
  );
}