import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiTrophy, FiHeart, FiClock, FiTarget, FiHome, FiRefreshCw } = FiIcons;

function QuizResultsPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useQuiz();
  const [rankings, setRankings] = useState([]);

  const quiz = state.currentQuiz || state.quizzes[quizId];

  useEffect(() => {
    if (!quiz) {
      navigate('/');
      return;
    }

    // Calcular rankings baseado nos resultados
    const playerStats = {};
    
    // Inicializar stats dos jogadores
    quiz.players?.forEach(player => {
      playerStats[player.id] = {
        ...player,
        correctAnswers: 0,
        totalTime: 0,
        averageTime: 0
      };
    });

    // Processar resultados
    state.results.forEach(result => {
      if (playerStats[result.playerId]) {
        if (result.isCorrect) {
          playerStats[result.playerId].correctAnswers++;
        }
        playerStats[result.playerId].totalTime += result.timeSpent;
      }
    });

    // Calcular tempo médio e criar ranking
    const playersArray = Object.values(playerStats).map(player => ({
      ...player,
      averageTime: player.totalTime / quiz.questions.length,
      accuracy: (player.correctAnswers / quiz.questions.length) * 100
    }));

    // Ordenar por pontuação (descendente) e depois por tempo médio (ascendente)
    const sortedPlayers = playersArray.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.averageTime - b.averageTime;
    });

    setRankings(sortedPlayers);
  }, [quiz, state.results, navigate]);

  const resetQuiz = () => {
    dispatch({ type: 'RESET_QUIZ' });
    navigate(`/lobby/${quizId}`);
  };

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const currentPlayer = state.currentPlayer;
  const playerRank = rankings.findIndex(p => p.id === currentPlayer?.id) + 1;

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <SafeIcon icon={FiTrophy} className="text-3xl text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Resultados do Quiz</h1>
          <h2 className="text-2xl text-blue-600 font-semibold">{quiz.title}</h2>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Estatísticas do Jogador Atual */}
          {currentPlayer && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Seu Desempenho</h3>
                
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                    {currentPlayer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="font-semibold text-gray-800">{currentPlayer.name}</div>
                  <div className="text-3xl font-bold text-blue-600 mt-2">{playerRank}º Lugar</div>
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <SafeIcon icon={FiTarget} className="text-2xl text-blue-600" />
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{currentPlayer.score}</div>
                        <div className="text-sm text-gray-600">Pontos Totais</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <SafeIcon icon={FiTarget} className="text-2xl text-green-600" />
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {rankings.find(p => p.id === currentPlayer.id)?.correctAnswers || 0}
                        </div>
                        <div className="text-sm text-gray-600">Respostas Corretas</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <SafeIcon icon={FiHeart} className="text-2xl text-red-600" />
                      <div>
                        <div className="text-2xl font-bold text-red-600">{currentPlayer.lives}</div>
                        <div className="text-sm text-gray-600">Vidas Restantes</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <SafeIcon icon={FiClock} className="text-2xl text-purple-600" />
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {Math.round(rankings.find(p => p.id === currentPlayer.id)?.accuracy || 0)}%
                        </div>
                        <div className="text-sm text-gray-600">Precisão</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Ranking Geral */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Ranking Final</h3>
              
              <div className="space-y-3">
                {rankings.map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-xl border-2 ${
                      player.id === currentPlayer?.id
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        index === 0 
                          ? 'bg-yellow-500 text-white' 
                          : index === 1 
                            ? 'bg-gray-400 text-white'
                            : index === 2
                              ? 'bg-orange-600 text-white'
                              : 'bg-gray-300 text-gray-700'
                      }`}>
                        {index + 1}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800">{player.name}</span>
                          {index < 3 && (
                            <SafeIcon 
                              icon={FiTrophy} 
                              className={`${
                                index === 0 ? 'text-yellow-500' : 
                                index === 1 ? 'text-gray-400' : 'text-orange-600'
                              }`} 
                            />
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                          <div>
                            <span className="text-gray-600">Pontos: </span>
                            <span className="font-semibold text-blue-600">{player.score}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Corretas: </span>
                            <span className="font-semibold text-green-600">{player.correctAnswers}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Vidas: </span>
                            <span className="font-semibold text-red-600">{player.lives}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Precisão: </span>
                            <span className="font-semibold text-purple-600">{Math.round(player.accuracy)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Ações */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col md:flex-row gap-4 justify-center mt-8"
        >
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <SafeIcon icon={FiHome} />
            Voltar ao Início
          </button>
          
          <button
            onClick={resetQuiz}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <SafeIcon icon={FiRefreshCw} />
            Jogar Novamente
          </button>
        </motion.div>
      </div>
    </div>
  );
}

export default QuizResultsPage;