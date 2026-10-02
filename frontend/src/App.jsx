import { useState } from 'react'
import AppRoutes from './routes/AppRoutes.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import './App.css'

function App() {



    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="max-w-6xl mx-auto px-4 py-6 flex-1 w-full">
                <AppRoutes />
            </main>
            <Footer />
        </div>
    )
}

export default App
