import { useState, useEffect, useRef, useCallback } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "./firebase";
import "./App.css";

const LOGO_URL = "/logo.png";

async function fetchCollection(name) {
  const q = query(collection(db, name), orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ docId: doc.id, ...doc.data() }));
}

// ── Game scroller ─────────────────────────────────────────────────────────────
function GameScroller({ games, selectedGame, onSelect, loading }) {
  const trackRef = useRef(null);
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0 });

  const onMouseDown = (e) => {
    drag.current = { active: true, startX: e.pageX - trackRef.current.offsetLeft, scrollLeft: trackRef.current.scrollLeft };
    trackRef.current.style.cursor = "grabbing";
  };
  const onMouseUp = () => {
    drag.current.active = false;
    if (trackRef.current) trackRef.current.style.cursor = "grab";
  };
  const onMouseMove = (e) => {
    if (!drag.current.active) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    trackRef.current.scrollLeft = drag.current.scrollLeft - (x - drag.current.startX) * 1.2;
  };

  return (
    <section className="games-section">
      <div
        className="games-track"
        ref={trackRef}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onMouseMove={onMouseMove}
      >
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="game-skeleton" style={{ animationDelay: `${i * 0.08}s` }} />
            ))
          : games.map((game) => (
              <button
                key={game.docId}
                className={`game-card ${selectedGame?.docId === game.docId ? "active" : ""}`}
                onClick={() => onSelect(game)}
                draggable={false}
              >
                <div className="game-img-wrap">
                  <img src={game.imageURL} alt={game.title} draggable={false} />
                  {selectedGame?.docId === game.docId && <div className="game-active-bar" />}
                </div>
              
              </button>
            ))}
      </div>
    </section>
  );
}

// ── Playlist tabs ─────────────────────────────────────────────────────────────
function PlaylistTabs({ playlists, selected, onSelect, loading }) {
  const trackRef = useRef(null);
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0 });

  const onMouseDown = (e) => {
    drag.current = { active: true, startX: e.pageX - trackRef.current.offsetLeft, scrollLeft: trackRef.current.scrollLeft };
  };
  const onMouseUp = () => { drag.current.active = false; };
  const onMouseMove = (e) => {
    if (!drag.current.active) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    trackRef.current.scrollLeft = drag.current.scrollLeft - (x - drag.current.startX) * 1.2;
  };

  return (
    <div className="tabs-wrap">
      <div
        className="tabs-track"
        ref={trackRef}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onMouseMove={onMouseMove}
      >
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="tab-skeleton" style={{ animationDelay: `${i * 0.07}s` }} />
          ))
        ) : (
          <>
            <button
              className={`tab ${selected === "all" ? "active" : ""}`}
              onClick={() => onSelect("all")}
            >
              الكل
            </button>
            {playlists.map((pl) => (
              <button
                key={pl.docId}
                className={`tab ${selected?.docId === pl.docId ? "active" : ""}`}
                onClick={() => onSelect(pl)}
              >
                {pl.title}
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ── Gallery grid ──────────────────────────────────────────────────────────────
function Gallery({ items, loading }) {
  const [hovered, setHovered] = useState(null);

  if (loading) {
    return (
      <div className="gallery">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="skeleton-cell" style={{ animationDelay: `${i * 0.06}s` }} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return <p className="empty">Nothing here yet!!!</p>;
  }

  return (
    <div className="gallery">
      {items.map((img) => (
        <a
          key={img.docId}
          href={img.link}
          target="_blank"
          rel="noopener noreferrer"
          className={`cell ${hovered === img.docId ? "hovered" : ""}`}
          onMouseEnter={() => setHovered(img.docId)}
          onMouseLeave={() => setHovered(null)}
        >
          <img src={img.imageUrl} alt={img.title || ""} loading="lazy" draggable={false} />
          <div className="overlay">
            {img.title && <span className="img-title">{img.title}</span>}
            <span className="open-icon">↗</span>
          </div>
        </a>
      ))}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [games, setGames] = useState([]);
  const [allPlaylists, setAllPlaylists] = useState([]);
  const [allGallery, setAllGallery] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState("all");
  const [loading, setLoading] = useState({ games: true, playlists: true, gallery: true });

  useEffect(() => {
    // Fetch playlists (no "order" field needed — sorted by title fallback)
    const fetchPlaylists = async () => {
      try {
        const snap = await getDocs(collection(db, "playlists"));
        return snap.docs.map((doc) => ({ docId: doc.id, ...doc.data() }));
      } catch { return []; }
    };

    fetchCollection("games").then((data) => {
       console.log("GAMES:", data);
      setGames(data);
      if (data.length > 0) setSelectedGame(data[0]);
      setLoading((l) => ({ ...l, games: false }));
    });

    fetchPlaylists().then((data) => {
      setAllPlaylists(data);
      setLoading((l) => ({ ...l, playlists: false }));
    });

    fetchCollection("gallery").then((data) => {
      setAllGallery(data);
      setLoading((l) => ({ ...l, gallery: false }));
    });
  }, []);

  const handleGameSelect = useCallback((game) => {
    setSelectedGame(game);
    setSelectedPlaylist("all");
  }, []);

  // Playlists that belong to the selected game
  const visiblePlaylists = selectedGame
    ? allPlaylists.filter((pl) => pl.gameID === selectedGame.docId)
    : [];

  // Gallery filtered by game → then playlist
  const visibleGallery = allGallery.filter((img) => {
    if (!selectedGame) return false;
    if (img.gameID !== selectedGame.docId) return false;
    if (selectedPlaylist === "all") return true;
    return img.playlistID === selectedPlaylist.docId;
  });

  return (
    <div className="page">
      {/* ── Hero ── */}
      <header className="hero">
        <div className="logo-wrap">
          <img src={LOGO_URL} alt="Baldy Geek" className="logo" />
        </div>
       <p className="bio">تواصل معنا! 👇</p>
<div className="socials">
  <a href="https://www.youtube.com/@baldygeek" target="_blank" rel="noopener noreferrer" className="social-btn youtube">
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/></svg>
  </a>
  <a href="https://www.instagram.com/baldygeek" target="_blank" rel="noopener noreferrer" className="social-btn instagram">
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.3.2 4.8 1.7 5 5 .1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.2 3.3-1.7 4.8-5 5-1.3.1-1.6.1-4.9.1s-3.6 0-4.8-.1c-3.3-.2-4.8-1.7-5-5C2.1 15.7 2 15.3 2 12s0-3.6.1-4.8c.2-3.3 1.7-4.8 5-5 1.2-.1 1.6-.1 4.9-.1zm0-2.2C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1.0 8.3 0 8.7 0 12s0 3.7.1 4.9C.3 21.3 2.7 23.7 7.1 23.9 8.3 24 8.7 24 12 24s3.7 0 4.9-.1c4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9s0-3.7-.1-4.9c-.2-4.4-2.6-6.8-7-7C15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4A6.2 6.2 0 0 0 12 5.8zm0 10.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.8a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8z"/></svg>
  </a>
  <a href="https://www.tiktok.com/@baldygeek83" target="_blank" rel="noopener noreferrer" className="social-btn tiktok">
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.6 3.3A4.9 4.9 0 0 1 14.7 0h-3.6v16.4a2.9 2.9 0 0 1-2.9 2.5 2.9 2.9 0 0 1-2.9-2.9 2.9 2.9 0 0 1 2.9-2.9c.3 0 .5 0 .8.1V9.5a6.5 6.5 0 0 0-.8 0 6.5 6.5 0 0 0-6.5 6.5 6.5 6.5 0 0 0 6.5 6.5 6.5 6.5 0 0 0 6.5-6.5V8.1a8.4 8.4 0 0 0 4.9 1.6V6.1a4.9 4.9 0 0 1-3-2.8z"/></svg>
  </a>
  <a href="https://www.facebook.com/Baldygeek" target="_blank" rel="noopener noreferrer" className="social-btn facebook">
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.1C24 5.4 18.6 0 12 0S0 5.4 0 12.1C0 18.1 4.4 23 10.1 24v-8.4H7.1v-3.5h3V9.4c0-3 1.8-4.6 4.5-4.6 1.3 0 2.7.2 2.7.2v2.9h-1.5c-1.5 0-1.9.9-1.9 1.9v2.2h3.3l-.5 3.5h-2.8V24C19.6 23 24 18.1 24 12.1z"/></svg>
  </a>
</div>
      </header>

      {/* ── Games scroller ── */}
      <GameScroller
        games={games}
        selectedGame={selectedGame}
        onSelect={handleGameSelect}
        loading={loading.games}
      />

      {/* ── Playlist tabs ── */}
      <PlaylistTabs
        playlists={visiblePlaylists}
        selected={selectedPlaylist}
        onSelect={setSelectedPlaylist}
        loading={loading.playlists}
      />

      {/* ── Gallery ── */}
      <main className="gallery-wrap">
        <Gallery items={visibleGallery} loading={loading.gallery} />
      </main>

      <footer className="foot">© {new Date().getFullYear()} Baldy Geek, Developed by <a href="https://www.animator-x.com" target="_blank">ANiMAtoR-X</a></footer>
    </div>
  );
}
