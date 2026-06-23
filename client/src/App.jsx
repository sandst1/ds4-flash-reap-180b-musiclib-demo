import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

function Home() {
  return <h2>Welcome to Music Library</h2>;
}

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export { App };
