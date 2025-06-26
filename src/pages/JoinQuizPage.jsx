import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import { getRandomAvatar } from '../utils/biblicalAvatars';
import AvatarDisplay from '../components/AvatarDisplay';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUser, FiArrowRight, FiAlertCircle, FiRefreshCw } = FiIcons;

function JoinQuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { getQuiz, joinQuiz } = useQuiz();
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(getRandomAvatar());

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const quizData = await getQuiz(quizId);
        if (!quizData) {
          setError('Quiz não encontrado');
          return;
        }

        if (quizData.status === 'playing') {
          setError('Este quiz já está em andamento');
          return;
        }

        if (quizData.status === 'finished') {
          setError('Este quiz já foi finalizado');
          return;
        }

        if (quizData.players && quizData.players.length >= quizData.maxPlayers) {
          setError('Este quiz já atingiu o número máximo de jogadores');
          return;
        }

        setQuiz(quizData);
      } catch (error) {
        console.error('Error loading quiz:', error);
        setError('Erro ao carregar quiz');
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [quizId, getQuiz]);

  const handleJoinQuiz = async () => {
    if (!playerName.trim()) {
      setError('Por favor, digite seu nome');
      return;
    }

    if (quiz.players && quiz.players.some(p => p.name.toLowerCase() === playerName.toLowerCase())) {
      setError('Este nome já está sendo usado');
      return;
    }

    setJoining(true);
    try {
      await joinQuiz(quizId, {
        name: playerName.trim(),
        lives: quiz.lives,
        avatar: selectedAvatar
      });

      navigate(`/lobby/${quizId}`);
    } catch (error) {
      console.error('Error joining quiz:', error);
      setError('Erro ao entrar no quiz. Tente novamente.');
    } finally {
      setJoining(false);
    }
  };

  const changeAvatar = () => {
    setSelectedAvatar(getRandomAvatar());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SafeIcon icon={FiAlertCircle} className="text-2xl text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Voltar ao Início
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <SafeIcon icon={FiUser} className="text-2xl text-blue-600" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Entrar no Quiz</h1>
          <h2 className="text-xl text-blue-600 font-semibold">{quiz.title}</h2>
          {quiz.description && (
            <p className="text-gray-600 mt-2">{quiz.description}</p>
          )}
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="font-semibold text-gray-800">{quiz.maxPlayers}</div>
              <div className="text-gray-600">Max Jogadores</div>
            </div>
            <div>
              <div className="font-semibold text-gray-800">
                {quiz.timeType === 'perQuestion' 
                  ? `${quiz.timePerQuestion}s` 
                  : `${quiz.totalTime}min`}
              </div>
              <div className="text-gray-600">
                {quiz.timeType === 'perQuestion' ? 'Por Pergunta' : 'Total'}
              </div>
            </div>
            <div>
              <div className="font-semibold text-gray-800">{quiz.lives}</div>
              <div className="text-gray-600">Vidas</div>
            </div>
          </div>
        </div>

        {/* Avatar Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Seu Avatar Bíblico
          </label>
          <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 rounded-xl">
            <AvatarDisplay avatar={selectedAvatar} size="lg" showName={true} />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={changeAvatar}
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            >
              <SafeIcon icon={FiRefreshCw} />
            </motion.button>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seu Nome
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !joining && handleJoinQuiz()}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Digite seu nome"
            maxLength={20}
            disabled={joining}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleJoinQuiz}
          disabled={!playerName.trim() || joining}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
        >
          {joining ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Entrando...</span>
            </>
          ) : (
            <>
              <span>Entrar no Quiz</span>
              <SafeIcon icon={FiArrowRight} />
            </>
          )}
        </motion.button>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Jogadores conectados: {quiz.players ? quiz.players.length : 0}/{quiz.maxPlayers}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default JoinQuizPage;