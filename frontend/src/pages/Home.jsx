import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Hero from '../components/Hero'
import About from '../components/About'
import Features from '../components/Features'
import TechStack from '../components/TechStack'
import Roadmap from '../components/Roadmap'
import Team from '../components/Team'
import TryApp from '../components/TryApp'

export default function Home() {
    return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', position: 'relative' }}>
            <Navbar />
            <Hero />
            <Features />
            <About />
            <TechStack />
            <Roadmap />
            <Team />
            <TryApp />
            <Footer />
        </div>
    )
}
