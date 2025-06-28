import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QuizProvider } from './context/QuizContext';
import HomePage from './pages/HomePage';
import CreateQuizPage from './pages/CreateQuizPage';
import QuizLobbyPage from './pages/QuizLobbyPage';
import QuizGamePage from './pages/QuizGamePage';
import QuizResultsPage from './pages/QuizResultsPage';
import JoinQuizPage from './pages/JoinQuizPage';
import LoginPage from './pages/LoginPage';
import { ProtectedAdminDashboard } from './pages/AdminDashboardPage';
import LogoutButton from './components/LogoutButton';
import { useAuth } from './lib/useAuth';

function App() {
  const { user } = useAuth();

  return (
    <QuizProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <nav className="bg-white shadow-sm">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
              <a href="/" className="text-xl font-bold text-blue-600">
                Quiz App
              </a>
              <div className="flex gap-4 items-center">
                {user ? (
                  <>
                    <a href="/admin" className="hover:text-blue-600">
                      Admin
                    </a>
                    <LogoutButton />
                  </>
                ) : (
                  <a href="/login" className="hover:text-blue-600">
                    Login
                  </a>
                )}
              </div>
            </div>
          </nav>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create" element={<CreateQuizPage />} />
            <Route path="/join/:quizId" element={<JoinQuizPage />} />
            <Route path="/lobby/:quizId" element={<QuizLobbyPage />} />
            <Route path="/game/:quizId" element={<QuizGamePage />} />
            <Route path="/results/:quizId" element={<QuizResultsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<ProtectedAdminDashboard />} />
          </Routes>
        </div>
      </Router>
    </QuizProvider>
  );
}

export default App;