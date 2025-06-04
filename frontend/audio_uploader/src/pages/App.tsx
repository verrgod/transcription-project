import React from 'react';
import Header from '../components/Header.tsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Transcribe from './Transcribe.tsx';
import About from './About.tsx';
import Home from './Home.tsx';

const App: React.FC = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/transcribe" element={<Transcribe />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
};

export default App;
