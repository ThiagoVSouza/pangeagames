import { ConceptNav } from "../components/ConceptNav";
import { StoreMark } from "../components/StoreMark";

export default function ModernCinematic() {
  return <main className="cinematic">
    <ConceptNav active="modern-cinematic" />
    <section className="cine-hero">
      <header><img src="/images/pangea_logo.png" alt="Pangea Games" /><nav><a href="#cine-about">Overview</a><a href="#cine-gallery">Media</a><a href="#cine-news">Updates</a></nav><a href="#cine-buy">Wishlist</a></header>
      <div className="cine-title"><p>A world to make your own</p><h1>THE<br />OUTPOST</h1><div><span>BUILD</span><span>CULTIVATE</span><span>EXPLORE</span></div></div>
      <a className="cine-play" href="#cine-about" aria-label="Watch trailer">▶</a>
      <p className="cine-platform">PC / MAC · COMING SOON</p>
    </section>
    <section className="cine-statement" id="cine-about"><span>01 / OVERVIEW</span><h2>START WITH<br />NOTHING.<br /><i>BUILD A WORLD.</i></h2><p>A quiet valley. An open horizon. Shape a settlement that grows with you—and discover what waits beyond its gates.</p></section>
    <section className="cine-gallery" id="cine-gallery"><div className="cine-shot shot-one"><span>BUILD / 01</span></div><div className="cine-shot shot-two"><span>CULTIVATE / 02</span></div><div className="cine-shot shot-three"><span>EXPLORE / 03</span></div></section>
    <section className="cine-buy" id="cine-buy"><div><span>02 / RELEASE</span><h2>YOUR PLACE<br />IS WAITING.</h2></div><div><p>Coming first to</p><a href="#cine-news"><StoreMark /></a><small>WINDOWS · macOS</small></div></section>
    <section className="cine-news" id="cine-news"><p>GET THE SIGNAL</p><h2>MAJOR UPDATES.<br />NO NOISE.</h2><form><label className="sr-only" htmlFor="cine-email">Email address</label><input id="cine-email" type="email" placeholder="EMAIL ADDRESS"/><button type="submit">SUBSCRIBE ↗</button></form></section>
    <footer><img src="/images/pangea_logo.png" alt="Pangea Games" /><nav><a href="#">DISCORD</a><a href="#">INSTAGRAM</a><a href="#">X</a><a href="#">PRESS KIT</a><a href="#">SUPPORT</a></nav><small>© 2026 PANGEA GAMES</small></footer>
  </main>;
}
