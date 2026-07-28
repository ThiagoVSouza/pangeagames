import { ConceptNav } from "../components/ConceptNav";
import { StoreMark } from "../components/StoreMark";

export default function FieldJournal() {
  return <main className="journal">
    <ConceptNav active="field-journal" />
    <div className="journal-shell">
      <header><img src="/images/pangea_logo.png" alt="Pangea Games" /><p>Field Notes · Volume I</p><button aria-label="Open menu">Menu ☰</button></header>
      <section className="journal-hero">
        <div className="journal-art"><img src="/images/capsule.png" alt="A pastoral valley with The Outpost beneath snow-capped mountains" /><span className="tape tape-one" /><span className="caption">Fig. 01 — The valley, looking north</span></div>
        <div className="journal-title"><p className="handwritten">A new beginning...</p><h1>The<br /><i>Outpost</i></h1><p>Build a home at the edge of the world.</p><a href="#journal-story"><StoreMark /></a><small>Available first on Windows + macOS</small></div>
      </section>
      <section className="journal-story" id="journal-story"><aside><span>Entry № 001</span><p>Season<br />Early Spring</p></aside><article><p className="dropcap">Far beyond the familiar world, a quiet valley is waiting. Gather its resources, shape your settlement, and build a place worth calling home.</p><blockquote>“There is room here for something lasting.”</blockquote></article></section>
      <section className="journal-notes">
        <article><span className="scribble">01</span><div className="polaroid image-a"><div /><small>First foundations</small></div><h2>Build with purpose</h2><p>Every path, workshop, and home tells part of your settlement’s story.</p></article>
        <article><span className="scribble">02</span><div className="polaroid image-b"><div /><small>A generous season</small></div><h2>Follow the land</h2><p>Plant, harvest, and adapt as the valley changes around you.</p></article>
        <article><span className="scribble">03</span><div className="polaroid image-c"><div /><small>Road into the mountains</small></div><h2>Look beyond</h2><p>Trade familiar paths for old roads and unexpected discoveries.</p></article>
      </section>
      <section className="journal-letter"><div><p className="handwritten">Stay in touch</p><h2>Dispatches<br />from the valley</h2><p>An occasional letter with development stories, demo news, and the road to release.</p></div><form><label htmlFor="journal-email">Address this letter to</label><input id="journal-email" type="email" placeholder="name@example.com" /><button type="submit">Seal & send →</button></form></section>
      <footer><img src="/images/pangea_logo.png" alt="Pangea Games" /><nav><a href="#">Press kit</a><a href="#">Support</a><a href="#">Discord</a><a href="#">Instagram</a><a href="#">X</a></nav><small>Recorded in 2026 · Pangea Games</small></footer>
    </div>
  </main>;
}
