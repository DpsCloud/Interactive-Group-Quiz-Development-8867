import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiUsers, FiTrendingUp, FiZap } = FiIcons;

function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6">
            <SafeIcon icon={FiZap} className="text-3xl text-white" />
          </div>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl md:text-6xl font-bold text-gray-800 mb-4"
        >
          Quiz Pool Lives
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto"
        >
          Crie quizzes interativos em tempo real para grupos. Diversão garantida com sistema de vidas e ranking!
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12"
        >
          <Link to="/create">
            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <SafeIcon icon={FiPlus} className="text-2xl text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Criar Quiz</h3>
              <p className="text-gray-600">Configure seu quiz personalizado com perguntas, tempo e número de vidas</p>
            </motion.div>
          </Link>

          <motion.div 
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <SafeIcon icon={FiUsers} className="text-2xl text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Participar</h3>
            <p className="text-gray-600">Escaneie o QR Code ou digite o código do quiz para entrar na diversão</p>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto text-sm text-gray-500"
        >
          <div className="flex items-center justify-center gap-2">
            <SafeIcon icon={FiUsers} className="text-blue-500" />
            <span>Multiplayer em tempo real</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <SafeIcon icon={FiTrendingUp} className="text-green-500" />
            <span>Sistema de ranking</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <SafeIcon icon={FiZap} className="text-purple-500" />
            <span>Vidas limitadas</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default HomePage;