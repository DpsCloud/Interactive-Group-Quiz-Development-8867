import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import AvatarDisplay from './AvatarDisplay';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiTrophy, FiTrendingUp, FiTrendingDown } = FiIcons;

function LiveRankings({ quizId, compact = false }) {
  const { getRankings } = useQuiz();
  const [rankings, setRankings] = useState([]);
  const [previousRankings, setPreviousRankings] = useState([]);

  useEffect(() => {
    const updateRankings = async () => {
      try {
        const newRankings = await getRankings(quizId);
        setPreviousRankings(rankings);
        setRankings(newRankings);
      } catch (error) {
        console.error('Error updating rankings:', error);
      }
    };

    updateRankings();
    const interval = setInterval(updateRankings, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [quizId, getRankings]);

  const getRankChange = (playerId, currentIndex) => {
    const previousIndex = previousRankings.findIndex(p => p.id === playerId);
    if (previousIndex === -1) return null;
    
    if (previousIndex > currentIndex) return 'up';
    if (previousIndex < currentIndex) return 'down';
    return 'same';
  };

  if (compact) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <SafeIcon icon={FiTrophy} className="text-yellow-500" />
          <h3 className="font-semibold text-gray-800">Top 3</h3>
        </div>
        
        <div className="space-y-2">
          {rankings.slice(0, 3).map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                index === 0 ? 'bg-yellow-500 text-white' :
                index === 1 ? 'bg-gray-400 text-white' :
                'bg-orange-600 text-white'
              }`}>
                {index + 1}
              </div>
              
              <AvatarDisplay avatar={player.avatar} size="sm" />
              
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800 truncate">
                  {player.name}
                </div>
                <div className="text-xs text-gray-500">
                  {player.score} pts
                </div>
              </div>

              {getRankChange(player.id, index) && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-xs"
                >
                  {getRankChange(player.id, index) === 'up' && (
                    <SafeIcon icon={FiTrendingUp} className="text-green-500" />
                  )}
                  {getRankChange(player.id, index) === 'down' && (
                    <SafeIcon icon={FiTrendingDown} className="text-red-500" />
                  )}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <SafeIcon icon={FiTrophy} className="text-2xl text-yellow-500" />
        <h3 className="text-xl font-bold text-gray-800">Ranking ao Vivo</h3>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {rankings.map((player, index) => (
            <motion.div
              key={player.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                index === 0 ? 'bg-yellow-500 text-white' :
                index === 1 ? 'bg-gray-400 text-white' :
                index === 2 ? 'bg-orange-600 text-white' :
                'bg-gray-300 text-gray-700'
              }`}>
                {index + 1}
              </div>

              <AvatarDisplay avatar={player.avatar} size="md" />

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
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <span>Pontos: <strong className="text-blue-600">{player.score}</strong></span>
                  <span>Vidas: <strong className="text-red-600">{player.lives}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getRankChange(player.id, index) && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="p-1"
                  >
                    {getRankChange(player.id, index) === 'up' && (
                      <SafeIcon icon={FiTrendingUp} className="text-green-500" />
                    )}
                    {getRankChange(player.id, index) === 'down' && (
                      <SafeIcon icon={FiTrendingDown} className="text-red-500" />
                    )}
                  </motion.div>
                )}

                <div className="flex gap-1">
                  {Array.from({ length: player.lives }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="w-2 h-2 bg-red-500 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default LiveRankings;