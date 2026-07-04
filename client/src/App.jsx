import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import SelectType from './pages/SelectType';
import Register from './pages/Register';
import Assessment from './pages/Assessment';
import Results from './pages/Results';
import Admin from './pages/Admin';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/start" element={<SelectType />} />
        <Route path="/register" element={<Register />} />
        <Route path="/assessment/:token" element={<Assessment />} />
        <Route path="/results/:token" element={<Results />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}
