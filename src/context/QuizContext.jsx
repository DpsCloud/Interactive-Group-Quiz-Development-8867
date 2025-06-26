import React, { createContext, useContext, useReducer, useEffect } from 'react';
import supabase from '../lib/supabase';
import { getRandomAvatar, shuffleArray } from '../utils/biblicalAvatars';

const QuizContext = createContext();

const initialState = {
  quizzes: {},
  currentQuiz: null,
  currentPlayer: null,
  gameState: 'waiting', // waiting, playing, finished
  players: [],
  currentQuestion: 0,
  timeLeft: 0,
  results: [],
  rankings: [],
  isConnected: false
};

function quizReducer(state, action) {
  switch (action.type) {
    case 'SET_CONNECTION_STATUS':
      return { ...state, isConnected: action.payload };

    case 'CREATE_QUIZ':
      return {
        ...state,
        quizzes: {
          ...state.quizzes,
          [action.payload.id]: action.payload
        },
        currentQuiz: action.payload
      };

    case 'SET_CURRENT_QUIZ':
      return {
        ...state,
        currentQuiz: action.payload
      };

    case 'JOIN_QUIZ':
      const quiz = state.quizzes[action.payload.quizId] || action.payload.quiz;
      if (!quiz) return state;
      
      const updatedPlayers = [...(quiz.players_biblical123 || quiz.players || []), action.payload.player];
      const updatedQuiz = { ...quiz, players: updatedPlayers, players_biblical123: updatedPlayers };
      
      return {
        ...state,
        quizzes: {
          ...state.quizzes,
          [action.payload.quizId]: updatedQuiz
        },
        currentQuiz: updatedQuiz,
        currentPlayer: action.payload.player,
        players: updatedPlayers
      };

    case 'UPDATE_PLAYERS':
      return {
        ...state,
        players: action.payload,
        currentQuiz: state.currentQuiz ? {
          ...state.currentQuiz,
          players: action.payload,
          players_biblical123: action.payload
        } : null
      };

    case 'START_GAME':
      return {
        ...state,
        gameState: 'playing',
        currentQuestion: 0,
        timeLeft: action.payload.timeLimit
      };

    case 'NEXT_QUESTION':
      return {
        ...state,
        currentQuestion: state.currentQuestion + 1,
        timeLeft: action.payload.timeLimit
      };

    case 'UPDATE_TIME':
      return {
        ...state,
        timeLeft: Math.max(0, state.timeLeft - 1)
      };

    case 'SUBMIT_ANSWER':
      return {
        ...state,
        results: [...state.results, action.payload]
      };

    case 'UPDATE_RANKINGS':
      return {
        ...state,
        rankings: action.payload
      };

    case 'END_GAME':
      return {
        ...state,
        gameState: 'finished'
      };

    case 'RESET_QUIZ':
      return {
        ...state,
        gameState: 'waiting',
        currentQuestion: 0,
        timeLeft: 0,
        results: []
      };

    default:
      return state;
  }
}

export function QuizProvider({ children }) {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  useEffect(() => {
    // Test Supabase connection and create tables
    const initializeDatabase = async () => {
      try {
        // Test connection with a simple query
        const { data, error } = await supabase.from('quizzes_biblical123').select('id').limit(1);
        
        if (error && error.code === '42P01') {
          // Table doesn't exist, create it
          console.log('Creating database tables...');
          await createTables();
        }
        
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: true });
        console.log('✅ Supabase connected successfully!');
      } catch (error) {
        console.log('⚠️ Supabase connection pending...', error.message);
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: false });
      }
    };

    initializeDatabase();
  }, []);

  const createTables = async () => {
    try {
      // Execute the SQL to create tables
      const createTablesSQL = `
        -- Create Quizzes Table
        CREATE TABLE IF NOT EXISTS quizzes_biblical123 (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          description TEXT,
          max_players INTEGER DEFAULT 10,
          time_type TEXT DEFAULT 'perQuestion' CHECK (time_type IN ('perQuestion', 'totalQuiz')),
          time_per_question INTEGER DEFAULT 30,
          total_time INTEGER DEFAULT 10,
          lives INTEGER DEFAULT 3,
          shuffle_answers BOOLEAN DEFAULT true,
          questions JSONB NOT NULL,
          status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create Players Table  
        CREATE TABLE IF NOT EXISTS players_biblical123 (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          quiz_id UUID REFERENCES quizzes_biblical123(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          avatar JSONB,
          lives INTEGER DEFAULT 3 CHECK (lives >= 0),
          score INTEGER DEFAULT 0 CHECK (score >= 0),
          joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create Game Answers Table
        CREATE TABLE IF NOT EXISTS game_answers_biblical123 (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          player_id UUID REFERENCES players_biblical123(id) ON DELETE CASCADE,
          quiz_id UUID REFERENCES quizzes_biblical123(id) ON DELETE CASCADE,
          question_index INTEGER NOT NULL,
          answer_index INTEGER,
          is_correct BOOLEAN NOT NULL DEFAULT false,
          time_spent INTEGER NOT NULL DEFAULT 0,
          answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Enable RLS
        ALTER TABLE quizzes_biblical123 ENABLE ROW LEVEL SECURITY;
        ALTER TABLE players_biblical123 ENABLE ROW LEVEL SECURITY;
        ALTER TABLE game_answers_biblical123 ENABLE ROW LEVEL SECURITY;

        -- Create Policies
        CREATE POLICY IF NOT EXISTS "Public access on quizzes" ON quizzes_biblical123 FOR ALL USING (true) WITH CHECK (true);
        CREATE POLICY IF NOT EXISTS "Public access on players" ON players_biblical123 FOR ALL USING (true) WITH CHECK (true);
        CREATE POLICY IF NOT EXISTS "Public access on answers" ON game_answers_biblical123 FOR ALL USING (true) WITH CHECK (true);

        -- Create Indexes
        CREATE INDEX IF NOT EXISTS idx_players_quiz_id ON players_biblical123(quiz_id);
        CREATE INDEX IF NOT EXISTS idx_players_score ON players_biblical123(score DESC);
      `;

      const { error } = await supabase.rpc('exec_sql', { sql: createTablesSQL });
      if (error) {
        console.error('Error creating tables:', error);
      } else {
        console.log('✅ Database tables created successfully!');
      }
    } catch (error) {
      console.error('Error in createTables:', error);
    }
  };

  // Real-time subscriptions
  useEffect(() => {
    if (!state.isConnected) return;

    const channels = [];

    // Subscribe to players changes
    const playersChannel = supabase
      .channel('players-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'players_biblical123' },
        (payload) => {
          console.log('Player update:', payload);
          // Trigger rankings update
          if (state.currentQuiz) {
            updateRankings(state.currentQuiz.id);
          }
        }
      )
      .subscribe();

    channels.push(playersChannel);

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [state.isConnected, state.currentQuiz]);

  const updateRankings = async (quizId) => {
    try {
      const rankings = await getRankings(quizId);
      dispatch({ type: 'UPDATE_RANKINGS', payload: rankings });
    } catch (error) {
      console.error('Error updating rankings:', error);
    }
  };

  const createQuiz = async (quizData) => {
    try {
      const quiz = {
        id: crypto.randomUUID(),
        title: quizData.title,
        description: quizData.description,
        max_players: quizData.maxPlayers,
        time_type: quizData.timeType,
        time_per_question: quizData.timePerQuestion,
        total_time: quizData.totalTime,
        lives: quizData.lives,
        shuffle_answers: quizData.shuffleAnswers,
        questions: quizData.questions,
        status: 'waiting',
        created_at: new Date().toISOString()
      };

      if (state.isConnected) {
        const { data, error } = await supabase
          .from('quizzes_biblical123')
          .insert([quiz])
          .select()
          .single();

        if (error) throw error;
        dispatch({ type: 'CREATE_QUIZ', payload: data });
        return data;
      } else {
        dispatch({ type: 'CREATE_QUIZ', payload: quiz });
        return quiz;
      }
    } catch (error) {
      console.error('Error creating quiz:', error);
      throw error;
    }
  };

  const joinQuiz = async (quizId, playerData) => {
    try {
      const avatar = playerData.avatar || getRandomAvatar();
      const player = {
        id: crypto.randomUUID(),
        quiz_id: quizId,
        name: playerData.name,
        avatar: avatar,
        lives: playerData.lives,
        score: 0,
        joined_at: new Date().toISOString()
      };

      if (state.isConnected) {
        const { data, error } = await supabase
          .from('players_biblical123')
          .insert([player])
          .select()
          .single();

        if (error) throw error;

        // Get updated quiz with players
        const { data: quiz, error: quizError } = await supabase
          .from('quizzes_biblical123')
          .select('*, players_biblical123(*)')
          .eq('id', quizId)
          .single();

        if (quizError) throw quizError;

        dispatch({ 
          type: 'JOIN_QUIZ', 
          payload: { quizId, player: data, quiz } 
        });
        return data;
      } else {
        dispatch({ 
          type: 'JOIN_QUIZ', 
          payload: { quizId, player } 
        });
        return player;
      }
    } catch (error) {
      console.error('Error joining quiz:', error);
      throw error;
    }
  };

  const getQuiz = async (quizId) => {
    try {
      if (state.isConnected) {
        const { data, error } = await supabase
          .from('quizzes_biblical123')
          .select('*, players_biblical123(*)')
          .eq('id', quizId)
          .single();

        if (error) throw error;
        
        // Transform data for compatibility
        const transformedData = {
          ...data,
          maxPlayers: data.max_players,
          timeType: data.time_type,
          timePerQuestion: data.time_per_question,
          totalTime: data.total_time,
          shuffleAnswers: data.shuffle_answers,
          players: data.players_biblical123
        };

        return transformedData;
      } else {
        return state.quizzes[quizId];
      }
    } catch (error) {
      console.error('Error getting quiz:', error);
      return null;
    }
  };

  const updatePlayerScore = async (playerId, score, lives) => {
    try {
      if (state.isConnected) {
        const { error } = await supabase
          .from('players_biblical123')
          .update({ score, lives, updated_at: new Date().toISOString() })
          .eq('id', playerId);

        if (error) throw error;
      }

      // Update local state
      if (state.currentPlayer && state.currentPlayer.id === playerId) {
        dispatch({
          type: 'JOIN_QUIZ',
          payload: {
            quizId: state.currentQuiz.id,
            player: { ...state.currentPlayer, score, lives },
            quiz: state.currentQuiz
          }
        });
      }
    } catch (error) {
      console.error('Error updating player score:', error);
    }
  };

  const submitAnswer = async (playerId, quizId, questionIndex, answerIndex, isCorrect, timeSpent) => {
    try {
      if (state.isConnected) {
        const { error } = await supabase
          .from('game_answers_biblical123')
          .insert([{
            player_id: playerId,
            quiz_id: quizId,
            question_index: questionIndex,
            answer_index: answerIndex,
            is_correct: isCorrect,
            time_spent: timeSpent
          }]);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const getRankings = async (quizId) => {
    try {
      if (state.isConnected) {
        const { data, error } = await supabase
          .from('players_biblical123')
          .select('*')
          .eq('quiz_id', quizId)
          .order('score', { ascending: false })
          .order('updated_at', { ascending: true }); // Tie-breaker: who reached the score first

        if (error) throw error;
        return data || [];
      } else {
        return (state.players || []).sort((a, b) => b.score - a.score);
      }
    } catch (error) {
      console.error('Error getting rankings:', error);
      return [];
    }
  };

  const startQuiz = async (quizId) => {
    try {
      if (state.isConnected) {
        const { error } = await supabase
          .from('quizzes_biblical123')
          .update({ status: 'playing', updated_at: new Date().toISOString() })
          .eq('id', quizId);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error starting quiz:', error);
    }
  };

  return (
    <QuizContext.Provider value={{ 
      state, 
      dispatch,
      createQuiz,
      joinQuiz,
      getQuiz,
      updatePlayerScore,
      submitAnswer,
      getRankings,
      startQuiz
    }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}