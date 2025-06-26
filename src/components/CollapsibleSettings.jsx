import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSettings, FiChevronDown, FiUsers, FiClock, FiHeart, FiTimer } = FiIcons;

function CollapsibleSettings({ quizData, setQuizData, isEditing = true }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gray-50 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <SafeIcon icon={FiSettings} className="text-xl text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">Configurações do Quiz</h3>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <SafeIcon icon={FiChevronDown} className="text-gray-600" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-200"
          >
            <div className="p-4 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <SafeIcon icon={FiUsers} className="text-blue-500" />
                    Máximo de Jogadores
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      min="2"
                      max="50"
                      value={quizData.maxPlayers}
                      onChange={(e) => setQuizData(prev => ({ ...prev, maxPlayers: parseInt(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="text-2xl font-bold text-blue-600">{quizData.maxPlayers}</div>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <SafeIcon icon={FiHeart} className="text-red-500" />
                    Número de Vidas
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={quizData.lives}
                      onChange={(e) => setQuizData(prev => ({ ...prev, lives: parseInt(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="text-2xl font-bold text-red-600">{quizData.lives}</div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                    <SafeIcon icon={FiTimer} className="text-purple-500" />
                    Tipo de Tempo
                  </label>
                  {isEditing ? (
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="timeType"
                          value="perQuestion"
                          checked={quizData.timeType === 'perQuestion'}
                          onChange={(e) => setQuizData(prev => ({ ...prev, timeType: e.target.value }))}
                          className="mr-2"
                        />
                        Por Pergunta
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="timeType"
                          value="totalQuiz"
                          checked={quizData.timeType === 'totalQuiz'}
                          onChange={(e) => setQuizData(prev => ({ ...prev, timeType: e.target.value }))}
                          className="mr-2"
                        />
                        Quiz Completo
                      </label>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600">
                      {quizData.timeType === 'perQuestion' ? 'Por Pergunta' : 'Quiz Completo'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <SafeIcon icon={FiClock} className="text-green-500" />
                    {quizData.timeType === 'perQuestion' 
                      ? 'Tempo por Pergunta (segundos)' 
                      : 'Tempo Total do Quiz (minutos)'}
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      min={quizData.timeType === 'perQuestion' ? "10" : "1"}
                      max={quizData.timeType === 'perQuestion' ? "120" : "60"}
                      value={quizData.timeType === 'perQuestion' ? quizData.timePerQuestion : quizData.totalTime}
                      onChange={(e) => setQuizData(prev => ({ 
                        ...prev, 
                        [quizData.timeType === 'perQuestion' ? 'timePerQuestion' : 'totalTime']: parseInt(e.target.value)
                      }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="text-2xl font-bold text-green-600">
                      {quizData.timeType === 'perQuestion' 
                        ? `${quizData.timePerQuestion}s` 
                        : `${quizData.totalTime}min`}
                    </div>
                  )}
                </div>
              </div>

              {!isEditing && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{quizData.questions?.length || 0}</div>
                    <div className="text-sm text-gray-600">Perguntas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{quizData.maxPlayers}</div>
                    <div className="text-sm text-gray-600">Max Jogadores</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {quizData.timeType === 'perQuestion' 
                        ? `${quizData.timePerQuestion}s` 
                        : `${quizData.totalTime}min`}
                    </div>
                    <div className="text-sm text-gray-600">Tempo</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{quizData.lives}</div>
                    <div className="text-sm text-gray-600">Vidas</div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CollapsibleSettings;