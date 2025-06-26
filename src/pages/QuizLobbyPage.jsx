import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import QRCodeGenerator from '../components/QRCodeGenerator';
import CollapsibleSettings from '../components/CollapsibleSettings';
import AvatarDisplay from '../components/AvatarDisplay';
import LiveRankings from '../components/LiveRankings';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUsers, FiPlay, FiCopy, FiCheck } = FiIcons;

function QuizLobbyPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch, getQuiz } = useQuiz();
  const [copied, setCopied] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  const isHost = true; // Em uma implementação real, isso seria determinado pela autenticação

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const quizData = await getQuiz(quizId);
        if (!quizData) {
          navigate('/');
          return;
        }
        setQuiz(quizData);
        dispatch({ type: 'SET_CURRENT_QUIZ', payload: quizData });
      } catch (error) {
        console.error('Error loading quiz:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [quizId, getQuiz, dispatch, navigate]);

  const copyQuizLink = async () => {
    const link = `${window.location.origin}/#/join/${quizId}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar link:', error);
    }
  };

  const startQuiz = () => {
    if (!quiz.players || quiz.players.length < 1) {
      alert('É necessário pelo menos 1 jogador para iniciar o quiz');
      return;
    }

    const timeLimit = quiz.timeType === 'perQuestion' 
      ? quiz.timePerQuestion 
      : (quiz.totalTime * 60); // Convert minutes to seconds

    dispatch({ type: 'START_GAME', payload: { timeLimit } });
    navigate(`/game/${quizId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz não encontrado</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  const joinLink = `${window.location.origin}/#/join/${quizId}`;

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quiz Info & QR Code */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 md:p-8"
          >
            <div className="text-center mb-8">
              <motion.h1 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="text-3xl font-bold text-gray-800 mb-2"
              >
                {quiz.title}
              </motion.h1>
              {quiz.description && (
                <p className="text-gray-600">{quiz.description}</p>
              )}
            </div>

            {/* Collapsible Settings */}
            <div className="mb-8">
              <CollapsibleSettings 
                quizData={quiz} 
                setQuizData={() => {}} 
                isEditing={false}
              />
            </div>

            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Escaneie o QR Code para entrar
              </h3>
              <motion.div 
                className="flex justify-center mb-4"
                whileHover={{ scale: 1.05 }}
              >
                <QRCodeGenerator value={joinLink} size={200} />
              </motion.div>
              
              <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
                <input
                  type="text"
                  value={joinLink}
                  readOnly
                  className="flex-1 bg-transparent text-sm text-gray-600 outline-none"
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={copyQuizLink}
                  className="p-2 text-blue-500 hover:bg-blue-100 rounded transition-colors"
                >
                  <SafeIcon icon={copied ? FiCheck : FiCopy} />
                </motion.button>
              </div>
            </div>

            {isHost && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startQuiz}
                disabled={!quiz.players || quiz.players.length < 1}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
              >
                <SafeIcon icon={FiPlay} />
                Iniciar Quiz
              </motion.button>
            )}
          </motion.div>

          {/* Players List & Live Rankings */}
          <div className="space-y-6">
            {/* Players List */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <SafeIcon icon={FiUsers} className="text-2xl text-blue-600" />
                <h2 className="text-xl font-bold text-gray-800">
                  Jogadores ({quiz.players ? quiz.players.length : 0}/{quiz.maxPlayers})
                </h2>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {quiz.players && quiz.players.length > 0 ? (
                  quiz.players.map((player, index) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200"
                    >
                      <AvatarDisplay avatar={player.avatar} size="md" />
                      
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{player.name}</div>
                        <div className="text-sm text-gray-600">
                          {player.lives} vidas • Pontos: {player.score}
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        {Array.from({ length: player.lives }).map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5 + (i * 0.1) }}
                            className="w-2 h-2 bg-red-500 rounded-full"
                          />
                        ))}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <SafeIcon icon={FiUsers} className="text-2xl text-gray-400" />
                    </motion.div>
                    <p className="text-gray-500">Aguardando jogadores...</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Compartilhe o QR Code ou link para que outros possam entrar
                    </p>
                  </div>
                )}
              </div>

              {quiz.players && quiz.players.length < quiz.maxPlayers && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 p-4 bg-blue-50 rounded-xl text-center"
                >
                  <p className="text-blue-700 font-medium">
                    Ainda há {quiz.maxPlayers - quiz.players.length} vagas disponíveis
                  </p>
                  <p className="text-blue-600 text-sm mt-1">
                    Compartilhe o código para mais jogadores entrarem
                  </p>
                </motion.div>
              )}
            </motion.div>

            {/* Live Rankings Preview */}
            {quiz.players && quiz.players.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <LiveRankings quizId={quizId} compact={true} />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizLobbyPage;