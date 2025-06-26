import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { withErrorBoundary } from '../common/ErrorBoundary';
import { useQuiz } from '../context/QuizContext';
import { shuffleArray } from '../utils/biblicalAvatars';
import AvatarDisplay from '../components/AvatarDisplay';
import LiveRankings from '../components/LiveRankings';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiClock, FiHeart, FiCheck, FiX, FiZap } = FiIcons;

function QuizGamePage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch, getQuiz, updatePlayerScore, submitAnswer } = useQuiz();
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quiz, setQuiz] = useState(null);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);
  const [totalQuizTime, setTotalQuizTime] = useState(0);

  const currentPlayer = state.currentPlayer;
  const currentQuestion = quiz?.questions[state.currentQuestion];

  // Load quiz and setup question
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const quizData = await getQuiz(quizId);
        if (!quizData || !currentPlayer) {
          navigate('/');
          return;
        }
        setQuiz(quizData);
        
        // Setup time limit
        let timeLimit;
        if (quizData.timeType === 'perQuestion') {
          timeLimit = quizData.timePerQuestion;
        } else {
          // Total quiz time - distribute across questions
          const totalSeconds = quizData.totalTime * 60;
          timeLimit = Math.floor(totalSeconds / quizData.questions.length);
          setTotalQuizTime(totalSeconds);
        }
        
        setTimeLeft(timeLimit);
      } catch (error) {
        console.error('Error loading quiz:', error);
        navigate('/');
      }
    };

    let isMounted = true;
    loadQuiz().catch(error => {
      if (isMounted) {
        console.error('Failed to load quiz:', error);
        navigate('/');
      }
    });
    
    return () => {
      isMounted = false;
    };
  }, [quizId, getQuiz, currentPlayer, navigate, state.currentQuestion]);

  // Shuffle options when question changes
  useEffect(() => {
    if (currentQuestion && quiz?.shuffleAnswers) {
      const optionsWithIndex = currentQuestion.options.map((option, index) => ({
        option,
        originalIndex: index
      }));
      
      const shuffled = shuffleArray([...optionsWithIndex]);
      setShuffledOptions(shuffled);
      
      // Find where the correct answer ended up
      const newCorrectIndex = shuffled.findIndex(
        item => item.originalIndex === currentQuestion.correctAnswer
      );
      setCorrectAnswerIndex(newCorrectIndex);
    } else if (currentQuestion) {
      // No shuffling
      const optionsWithIndex = currentQuestion.options.map((option, index) => ({
        option,
        originalIndex: index
      }));
      setShuffledOptions(optionsWithIndex);
      setCorrectAnswerIndex(currentQuestion.correctAnswer);
    }
  }, [currentQuestion, quiz?.shuffleAnswers]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !showResult) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleTimeUp();
    }
  }, [timeLeft, showResult]);

  const handleTimeUp = useCallback(() => {
    if (!quiz || !currentPlayer || selectedAnswer === null) return;
    
    // Time's up without answer - lose a life
    const updatedLives = Math.max(0, currentPlayer.lives - 1);
    const timeSpentOnQuestion = quiz.timeType === 'perQuestion'
      ? quiz.timePerQuestion
      : Math.floor((quiz.totalTime * 60) / quiz.questions.length);
      
    dispatch({
      type: 'SUBMIT_ANSWER',
      payload: {
        playerId: currentPlayer.id,
        questionIndex: state.currentQuestion,
        answer: null,
        isCorrect: false,
        timeSpent: timeSpentOnQuestion
      }
    });

    updatePlayerScore(currentPlayer.id, currentPlayer.score, updatedLives);
    submitAnswer(currentPlayer.id, quizId, state.currentQuestion, null, false, timeSpentOnQuestion);
    
    setShowResult(true);
    
    setTimeout(() => {
      nextQuestion();
    }, 3000);
  }, [
    selectedAnswer,
    currentPlayer,
    dispatch,
    state.currentQuestion,
    quiz,
    updatePlayerScore,
    submitAnswer,
    quizId
  ]);

  const submitAnswerHandler = useCallback((answerIndex) => {
    if (selectedAnswer !== null || showResult) return;

    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === correctAnswerIndex;
    const timeSpentOnQuestion = (quiz.timeType === 'perQuestion'
      ? quiz.timePerQuestion
      : Math.floor((quiz.totalTime * 60) / quiz.questions.length)) - timeLeft;

    let updatedPlayer = { ...currentPlayer };
    
    if (isCorrect) {
      // Correct answer - gain points based on time
      const timeBonus = Math.max(1, Math.floor(timeLeft / 5));
      updatedPlayer.score += 100 + timeBonus;
    } else {
      // Wrong answer - lose a life
      updatedPlayer.lives = Math.max(0, updatedPlayer.lives - 1);
    }

    dispatch({
      type: 'SUBMIT_ANSWER',
      payload: {
        playerId: currentPlayer.id,
        questionIndex: state.currentQuestion,
        answer: answerIndex,
        isCorrect,
        timeSpent: timeSpentOnQuestion
      }
    });

    // Update player in current context for immediate UI update
    dispatch({
      type: 'JOIN_QUIZ',
      payload: {
        quizId: quiz.id,
        player: updatedPlayer,
        quiz: quiz
      }
    });

    updatePlayerScore(currentPlayer.id, updatedPlayer.score, updatedPlayer.lives);
    submitAnswer(currentPlayer.id, quizId, state.currentQuestion, answerIndex, isCorrect, timeSpentOnQuestion);
    
    setShowResult(true);
    
    setTimeout(() => {
      nextQuestion();
    }, 3000);
  }, [
    selectedAnswer,
    showResult,
    correctAnswerIndex,
    quiz,
    timeLeft,
    currentPlayer,
    dispatch,
    state.currentQuestion,
    updatePlayerScore,
    submitAnswer,
    quizId,
  ]);

  const nextQuestion = useCallback(() => {
    if (state.currentQuestion + 1 >= quiz.questions.length) {
      // Quiz finished
      dispatch({ type: 'END_GAME' });
      navigate(`/results/${quizId}`);
    } else {
      // Next question
      const timeLimit = quiz.timeType === 'perQuestion' 
        ? quiz.timePerQuestion 
        : Math.floor((quiz.totalTime * 60) / quiz.questions.length);
      
      dispatch({ 
        type: 'NEXT_QUESTION', 
        payload: { timeLimit } 
      });
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(timeLimit);
    }
  }, [quiz, quizId, dispatch, state.currentQuestion]);

  if (!quiz || !currentQuestion || !currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Check if player still has lives
  if (currentPlayer.lives <= 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SafeIcon icon={FiX} className="text-2xl text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Game Over!</h2>
          <p className="text-gray-600 mb-6">Você perdeu todas as suas vidas.</p>
          <p className="text-lg font-semibold text-blue-600 mb-6">
            Pontuação Final: {currentPlayer.score}
          </p>
          <button
            onClick={() => navigate(`/results/${quizId}`)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Ver Resultados
          </button>
        </motion.div>
      </div>
    );
  }

  const progressPercentage = ((state.currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Player Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <AvatarDisplay avatar={currentPlayer.avatar} size="md" />
                  <div>
                    <div className="font-semibold text-gray-800">{currentPlayer.name}</div>
                    <div className="text-sm text-gray-600">Pontos: {currentPlayer.score}</div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <SafeIcon icon={FiHeart} className="text-red-500" />
                    <span className="font-semibold">{currentPlayer.lives}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <SafeIcon icon={FiClock} className="text-blue-500" />
                    <span className={`font-semibold ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-gray-800'}`}>
                      {timeLeft}s
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Pergunta {state.currentQuestion + 1} de {quiz.questions.length}</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Quiz Type Indicator */}
              <div className="mt-2 text-center">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {quiz.timeType === 'perQuestion' 
                    ? `${quiz.timePerQuestion}s por pergunta` 
                    : `${quiz.totalTime} minutos total`}
                </span>
              </div>
            </motion.div>

            {/* Question */}
            <motion.div
              key={state.currentQuestion}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-8 border border-blue-100"
            >
              <motion.h2 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-8"
              >
                {currentQuestion.question}
              </motion.h2>

              <div className="grid md:grid-cols-2 gap-4">
                {shuffledOptions.map((item, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => submitAnswerHandler(index)}
                    disabled={showResult}
                    whileHover={!showResult ? { scale: 1.02, y: -2 } : {}}
                    whileTap={!showResult ? { scale: 0.98 } : {}}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                      showResult
                        ? index === correctAnswerIndex
                          ? 'bg-green-100 border-green-500 text-green-800 shadow-green-200 shadow-lg'
                          : selectedAnswer === index
                            ? 'bg-red-100 border-red-500 text-red-800 shadow-red-200 shadow-lg'
                            : 'bg-gray-100 border-gray-300 text-gray-600'
                        : selectedAnswer === index
                          ? 'bg-blue-100 border-blue-500 text-blue-800 shadow-blue-200 shadow-lg'
                          : 'bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <motion.div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          showResult
                            ? index === correctAnswerIndex
                              ? 'bg-green-500 text-white'
                              : selectedAnswer === index
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-400 text-white'
                            : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        }`}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.3 }}
                      >
                        {String.fromCharCode(65 + index)}
                      </motion.div>
                      <span className="font-medium">{item.option}</span>
                      {showResult && index === correctAnswerIndex && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-auto"
                        >
                          <SafeIcon icon={FiCheck} className="text-green-500 text-xl" />
                        </motion.div>
                      )}
                      {showResult && selectedAnswer === index && index !== correctAnswerIndex && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-auto"
                        >
                          <SafeIcon icon={FiX} className="text-red-500 text-xl" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Live Rankings Sidebar */}
          <div className="lg:col-span-1">
            <LiveRankings quizId={quizId} />
          </div>
        </div>

        {/* Timer Visual */}
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl shadow-lg ${
              timeLeft <= 5 
                ? 'bg-red-500 text-white animate-pulse' 
                : timeLeft <= 10
                  ? 'bg-orange-500 text-white'
                  : 'bg-blue-500 text-white'
            }`}
          >
            <SafeIcon icon={FiZap} className="text-xl" />
          </motion.div>
        </div>

        {/* Result Modal */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 50 }}
                className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
              >
                {selectedAnswer === correctAnswerIndex ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <SafeIcon icon={FiCheck} className="text-3xl text-green-500" />
                    </div>
                    <h3 className="text-3xl font-bold text-green-600 mb-2">Correto!</h3>
                    <p className="text-gray-600 text-lg">
                      +{100 + Math.max(1, Math.floor(timeLeft / 5))} pontos
                    </p>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className="mt-4 text-4xl"
                    >
                      🎉
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <SafeIcon icon={FiX} className="text-3xl text-red-500" />
                    </div>
                    <h3 className="text-3xl font-bold text-red-600 mb-2">
                      {selectedAnswer === null ? 'Tempo Esgotado!' : 'Incorreto!'}
                    </h3>
                    <p className="text-gray-600 mb-2 text-lg">-1 vida</p>
                    <p className="text-sm text-gray-500">
                      Resposta correta: {shuffledOptions[correctAnswerIndex]?.option}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


export default withErrorBoundary(QuizGamePage);