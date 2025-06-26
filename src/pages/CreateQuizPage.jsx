import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import CollapsibleSettings from '../components/CollapsibleSettings';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiArrowLeft, FiPlus, FiTrash2, FiShuffle } = FiIcons;

function CreateQuizPage() {
  const navigate = useNavigate();
  const { createQuiz } = useQuiz();
  
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    maxPlayers: 10,
    timeType: 'perQuestion', // perQuestion or totalQuiz
    timePerQuestion: 30,
    totalTime: 10, // in minutes
    lives: 3,
    shuffleAnswers: true,
    questions: [
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0
      }
    ]
  });

  const [isCreating, setIsCreating] = useState(false);

  const addQuestion = () => {
    setQuizData(prev => ({
      ...prev,
      questions: [...prev.questions, {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0
      }]
    }));
  };

  const removeQuestion = (index) => {
    if (quizData.questions.length > 1) {
      setQuizData(prev => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index)
      }));
    }
  };

  const updateQuestion = (questionIndex, field, value) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex ? { ...q, [field]: value } : q
      )
    }));
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? { ...q, options: q.options.map((opt, j) => j === optionIndex ? value : opt) }
          : q
      )
    }));
  };

  const handleCreateQuiz = async () => {
    if (!quizData.title.trim() || quizData.questions.some(q => !q.question.trim())) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setIsCreating(true);
    try {
      const newQuiz = await createQuiz(quizData);
      navigate(`/lobby/${newQuiz.id}`);
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Erro ao criar quiz. Tente novamente.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <SafeIcon icon={FiArrowLeft} className="text-xl text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Criar Quiz Bíblico</h1>
              <p className="text-gray-600">Configure seu quiz personalizado</p>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título do Quiz *
              </label>
              <input
                type="text"
                value={quizData.title}
                onChange={(e) => setQuizData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Conhecendo a Bíblia"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <input
                type="text"
                value={quizData.description}
                onChange={(e) => setQuizData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Breve descrição (opcional)"
              />
            </div>
          </div>

          {/* Collapsible Settings */}
          <div className="mb-8">
            <CollapsibleSettings 
              quizData={quizData} 
              setQuizData={setQuizData}
              isEditing={true}
            />
          </div>

          {/* Shuffle Option */}
          <div className="mb-8 p-4 bg-blue-50 rounded-xl">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={quizData.shuffleAnswers}
                onChange={(e) => setQuizData(prev => ({ ...prev, shuffleAnswers: e.target.checked }))}
                className="w-4 h-4 text-blue-600"
              />
              <div className="flex items-center gap-2">
                <SafeIcon icon={FiShuffle} className="text-blue-600" />
                <span className="font-medium text-gray-800">Embaralhar respostas para cada jogador</span>
              </div>
            </label>
            <p className="text-sm text-gray-600 mt-1 ml-7">
              As opções de resposta aparecerão em ordem aleatória para cada participante
            </p>
          </div>

          {/* Questions */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Perguntas</h3>
              <button
                onClick={addQuestion}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <SafeIcon icon={FiPlus} />
                Adicionar Pergunta
              </button>
            </div>

            <div className="space-y-6">
              {quizData.questions.map((question, questionIndex) => (
                <motion.div
                  key={questionIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-800">
                      Pergunta {questionIndex + 1}
                    </h4>
                    {quizData.questions.length > 1 && (
                      <button
                        onClick={() => removeQuestion(questionIndex)}
                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <SafeIcon icon={FiTrash2} />
                      </button>
                    )}
                  </div>

                  <div className="mb-4">
                    <input
                      type="text"
                      value={question.question}
                      onChange={(e) => updateQuestion(questionIndex, 'question', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Digite a pergunta..."
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {question.options.map((option, optionIndex) => (
                      <motion.div 
                        key={optionIndex} 
                        className="flex items-center gap-3"
                        whileHover={{ scale: 1.02 }}
                      >
                        <input
                          type="radio"
                          name={`correct-${questionIndex}`}
                          checked={question.correctAnswer === optionIndex}
                          onChange={() => updateQuestion(questionIndex, 'correctAnswer', optionIndex)}
                          className="text-green-500 focus:ring-green-500"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={`Opção ${optionIndex + 1}`}
                        />
                        {question.correctAnswer === optionIndex && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-green-500 font-bold"
                          >
                            ✓
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Create Button */}
          <div className="flex justify-end">
            <button
              onClick={handleCreateQuiz}
              disabled={isCreating}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
            >
              {isCreating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Criando...
                </div>
              ) : (
                'Criar Quiz'
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default CreateQuizPage;