import React, { useState } from "react";
import "../assets/css/footer.css";

const footerGroups = [
  {
    title: "Browse",
    links: [
      { label: "Movies", href: "#movies" },
      { label: "TV Shows", href: "#tv-shows" },
      { label: "Genres", href: "#genres" },
      { label: "Trending", href: "#trending" },
      { label: "Popular", href: "#popular" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "About Us", href: "#about" },
      { label: "Help Center", href: "#help" },
      { label: "Blog", href: "#blog" },
      { label: "Careers", href: "#careers" },
      { label: "Contact", href: "#contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "#terms" },
      { label: "Privacy Policy", href: "#privacy" },
      { label: "Cookie Policy", href: "#cookies" },
      { label: "Community Guidelines", href: "#guidelines" },
    ],
  },
];

const socialLinks = [
  { name: "Instagram", href: "https://www.instagram.com/" },
  { name: "X", href: "https://x.com/" },
  { name: "Facebook", href: "https://www.facebook.com/" },
  { name: "YouTube", href: "https://www.youtube.com/" },
  { name: "Discord", href: "https://discord.com/" },
];

function Footer() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubscribe(event) {
    event.preventDefault();

    if (!email.trim()) return;

    setMessage("Thanks! Newsletter integration is coming soon.");
    setEmail("");
  }

  return (
    <footer className="site-footer">
      <div className="site-footer__decoration" aria-hidden="true" />

      <div className="site-footer__inner">
        <section className="site-footer__brand" aria-label="About the site">
          <div className="site-footer__brand-logo">
               <img
               src="/images/brand-logo.png"
               alt="FLIXDB"
               className="site-footer__brand-logo-image"
               />
          </div>

          <p className="site-footer__description">
            Your ultimate movie &amp; TV show database.
            <br />
            Discover. Watch. Explore.
          </p>

          <div className="site-footer__socials" aria-label="Social media">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                className="site-footer__social-link"
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.name}
                title={social.name}
              >
                <span
                  className="site-footer__social-slot"
                  aria-hidden="true"
                />
              </a>
            ))}
          </div>

          <p className="site-footer__copyright">
            © 2026 FlixDB. All rights reserved.
          </p>
        </section>

        {footerGroups.map((group) => (
          <nav
            className="site-footer__group"
            key={group.title}
            aria-label={group.title}
          >
            <h2 className="site-footer__heading">{group.title}</h2>

            <ul className="site-footer__list">
              {group.links.map((link) => (
                <li key={link.label}>
                  <a className="site-footer__link" href={link.href}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <section className="site-footer__newsletter">
          <h2 className="site-footer__heading">Stay in the Loop</h2>

          <p className="site-footer__newsletter-description">
            Get the latest updates, new releases
            <br className="site-footer__desktop-break" />
            and more.
          </p>

          <form
            className="site-footer__form"
            onSubmit={handleSubscribe}
          >
            <label className="site-footer__sr-only" htmlFor="footer-email">
              Enter your email
            </label>

            <input
              id="footer-email"
              className="site-footer__input"
              type="email"
              name="email"
              placeholder="Enter your email"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setMessage("");
              }}
              required
            />

            <button
              className="site-footer__subscribe"
              type="submit"
            >
              Subscribe
            </button>
          </form>

          {message && (
            <p className="site-footer__message" role="status">
              {message}
            </p>
          )}
        </section>
      </div>
    </footer>
  );
}

export default Footer;