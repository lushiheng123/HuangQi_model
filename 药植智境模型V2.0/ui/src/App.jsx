import React from 'react'
import { Routes, BrowserRouter, Route } from 'react-router-dom'
import Hero from './pages/Hero/Hero'
import Navbar from './components/Navbar'
export default function App() {
    return (
        <>
            <Navbar />
            <BrowserRouter>
                <Routes>
                    <Route index element={<Hero />} />
                </Routes>
            </BrowserRouter>
        </>
    )
}
