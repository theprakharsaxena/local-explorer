import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Explore from './pages/Explore'
import Favorites from './pages/Favorites'
import PlaceDetails from './pages/PlaceDetails'

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300 antialiased">
          <Navbar />
          <main className="flex-grow pt-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/place/:id" element={<PlaceDetails />} />
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </BrowserRouter>
  )
}
