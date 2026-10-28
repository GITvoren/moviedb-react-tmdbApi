import React, { useState } from "react";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="app">
      <Navbar onSearch={(query) => setSearchQuery(query)} />
      <Home searchQuery={searchQuery} />
      <Footer />
    </div>
  );
}