import { ConceptNav } from "../components/ConceptNav";
import { StoreMark } from "../components/StoreMark";

export default function LivingValley() {
  return <main className="valley">
    <ConceptNav active="living-valley" />
    <section className="valley-hero">
      <header><img src="/images/pangea_logo.png" alt="Pangea Games" /><nav><a href="#story">The game</a><a href="#world">The world</a><a href="#news">News</a></nav><a className="mini-cta" href="#wishlist">Wishlist ↗</a></header>
      <div className="valley-hero-copy"><p className="eyebrow">A new beginning awaits</p><h1>The<br />Outpost</h1><p>Build a home at the edge of the world.</p><div><a id="wishlist" className="steam-button" href="#platforms"><StoreMark /></a><a className="play-button" href="#story"><span>▶</span> Watch trailer</a></div></div>
      <div className="scroll-note"><span /> Discover the valley</div>
    </section>
    <section className="valley-intro" id="story"><p className="eyebrow">Your new beginning</p><h2>There is room here<br />for something lasting.</h2><p>Far beyond the familiar world, a quiet valley is waiting. Gather its resources, shape your settlement, and build a place worth calling home.</p></section>
    <section className="valley-features" id="world">
      <article><span>01</span><div className="feature-image feature-build" /><div><p className="eyebrow">Raise your home</p><h3>Build</h3><p>Turn an open field into a thriving settlement, one thoughtful choice at a time.</p></div></article>
      <article><span>02</span><div className="feature-image feature-grow" /><div><p className="eyebrow">Live by the seasons</p><h3>Cultivate</h3><p>Work with the land, care for your community, and share in everything it provides.</p></div></article>
      <article><span>03</span><div className="feature-image feature-explore" /><div><p className="eyebrow">Beyond the gate</p><h3>Explore</h3><p>Follow old roads into mountain country and discover the stories left behind.</p></div></article>
    </section>
    <section className="valley-platforms" id="platforms"><p className="eyebrow">Coming first to Steam</p><h2>Your place is waiting.</h2><p>Windows · macOS</p><a className="steam-button" href="#news"><StoreMark /></a></section>
    <section className="valley-newsletter" id="news"><div><p className="eyebrow">Dispatches from The Outpost</p><h2>News from beyond<br />the mountains.</h2></div><form><label htmlFor="valley-email">Major updates, demo news, and release announcements.</label><div><input id="valley-email" type="email" placeholder="Your email address" /><button type="submit">Join the list →</button></div></form></section>
    <footer><img src="/images/pangea_logo.png" alt="Pangea Games" /><p>We make worlds worth belonging to.</p><nav><a href="#">Discord</a><a href="#">Instagram</a><a href="#">X</a><a href="#">Press kit</a><a href="#">Support</a></nav><small>© 2026 Pangea Games</small></footer>
  </main>;
}
