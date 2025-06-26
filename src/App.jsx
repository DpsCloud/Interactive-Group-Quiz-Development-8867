import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { QuizProvider } from './context/QuizContext';
import HomePage from './pages/HomePage';
import CreateQuizPage from './pages/CreateQuizPage';
import QuizLobbyPage from './pages/QuizLobbyPage';
import QuizGamePage from './pages/QuizGamePage';
import QuizResultsPage from './pages/QuizResultsPage';
import JoinQuizPage from './pages/JoinQuizPage';

function App() {
  return (
    <QuizProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create" element={<CreateQuizPage />} />
            <Route path="/join/:quizId" element={<JoinQuizPage />} />
            <Route path="/lobby/:quizId" element={<QuizLobbyPage />} />
            <Route path="/game/:quizId" element={<QuizGamePage />} />
            <Route path="/results/:quizId" element={<QuizResultsPage />} />
          </Routes>
        </div>
      </Router>
    </QuizProvider>
  );
}

export default App;