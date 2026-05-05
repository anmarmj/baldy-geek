import { useState, useEffect } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "./firebase";
import "./App.css";

const LOGO_URL = "/logo.png"; // place your logo in /public/logo.png

export default function App() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    async function fetchImages() {
      try {
        const q = query(collection(db, "gallery"), orderBy("order", "asc"));
        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setImages(docs);
      } catch (e) {
        console.error("Failed to load gallery:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchImages();
  }, []);

  return (
    <div className="page">
      {/* ── Header / Profile ── */}
      <header className="profile">
        <div className="logo-wrap">
          <img src={LOGO_URL} alt="Baldy Geek" className="logo" />
        </div>
        <div className="bio">
          <h1 className="handle">@baldygeek</h1>
          <p className="tagline">
            Pixel-brained. Tech-obsessed. Making stuff that matters — one block at a time.
          </p>
          <div className="stats">
            <span><strong>{images.length}</strong> posts</span>
          </div>
        </div>
      </header>

      <div className="divider" />

      {/* ── Gallery ── */}
      <main className="gallery-wrap">
        {loading ? (
          <div className="loader">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="skeleton" style={{ animationDelay: `${i * 0.07}s` }} />
            ))}
          </div>
        ) : images.length === 0 ? (
          <p className="empty">No images yet. Add some in Firestore!</p>
        ) : (
          <div className="gallery">
            {images.map((img) => (
              <a
                key={img.id}
                href={img.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`cell ${hoveredId === img.id ? "hovered" : ""}`}
                onMouseEnter={() => setHoveredId(img.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <img src={img.imageUrl} alt={img.title || ""} loading="lazy" />
                <div className="overlay">
                  {img.title && <span className="img-title">{img.title}</span>}
                  <span className="open-icon">↗</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>

      <footer className="foot">© {new Date().getFullYear()} Baldy Geek, developed by <a href="https://www.animator-x.com" target="_blank">ANiMAtoR-X</a></footer>
    </div>
  );
}
