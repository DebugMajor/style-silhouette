import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Hero from "../components/Hero";
import About from '../components/About'
import Features from '../components/Features'
import TechStack from '../components/TechStack'
import Roadmap from '../components/Roadmap'
import Team from '../components/Team'
import TryApp from '../components/TryApp'

const MARQUEE_ITEMS = [
    'AI Outfit Analysis', 'Gemini 2.5 Flash', 'Style Scoring',
    'Real-time Detection', 'Digital Wardrobe', 'Voice Styling',
    'GPT-4o-mini', 'Fashion Intelligence',
]

export default function Home() {
    return (
        <div style={{ background: 'var(--void)', minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>

            {/* ── Global ambient orbs ── */}
            <div className="orb" style={{ width: '700px', height: '700px', background: 'rgba(160,8,32,.35)', top: '-250px', left: '-200px', position: 'fixed', zIndex: 0 }} />
            <div className="orb" style={{ width: '350px', height: '350px', background: 'rgba(220,20,60,.1)', bottom: '10%', right: '5%', position: 'fixed', zIndex: 0, animationDelay: '3s' }} />

            {/* ── Diagonal slash ── */}
            <div style={{ position: 'fixed', top: 0, left: '40%', width: '1px', height: '100%', background: 'linear-gradient(to bottom,transparent,rgba(220,20,60,.2),transparent)', transform: 'rotate(8deg)', transformOrigin: 'top center', pointerEvents: 'none', zIndex: 0 }} />

            {/* ── Navbar ── */}
            <Navbar />

            {/* ── All sections ── */}
            <Hero />

            {/* Marquee separator */}
            <div className="marquee-wrap" style={{ position: 'relative', zIndex: 10 }}>
                <div className="marquee-track">
                    {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
                        <div key={i} className="marquee-item">{item}</div>
                    ))}
                </div>
            </div>

            <About />
            <Features />
            <TechStack />
            <Roadmap />
            <Team />
            <TryApp />
            <Footer />
        </div>
    )
}
