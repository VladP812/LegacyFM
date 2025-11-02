import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import TestAudioPage from './pages/TestAudio';

function App() {

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/test" element={<TestAudioPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App

