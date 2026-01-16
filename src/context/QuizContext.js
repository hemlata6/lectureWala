import React, { createContext, useContext, useState, useCallback } from 'react';

const QuizContext = createContext();

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};

// Sample questions data
const sampleQuestions = [
  {
    id: 1,
    question: "What is the correct way to create a React functional component?",
    options: [
      "function MyComponent() { return <div>Hello</div>; }",
      "const MyComponent = () => { return <div>Hello</div>; }",
      "class MyComponent extends React.Component { render() { return <div>Hello</div>; } }",
      "Both A and B are correct"
    ],
    correctAnswer: 3,
    category: "React",
    difficulty: "Easy"
  },
  {
    id: 2,
    question: "Which hook is used to manage state in React functional components?",
    options: [
      "useEffect",
      "useState",
      "useContext",
      "useReducer"
    ],
    correctAnswer: 1,
    category: "React",
    difficulty: "Easy"
  },
  {
    id: 3,
    question: "What does CSS stand for?",
    options: [
      "Computer Style Sheets",
      "Creative Style Sheets",
      "Cascading Style Sheets",
      "Colorful Style Sheets"
    ],
    correctAnswer: 2,
    category: "CSS",
    difficulty: "Easy"
  },
  {
    id: 4,
    question: "Which of the following is NOT a JavaScript data type?",
    options: [
      "String",
      "Boolean",
      "Integer",
      "Undefined"
    ],
    correctAnswer: 2,
    category: "JavaScript",
    difficulty: "Medium"
  },
  {
    id: 5,
    question: "What is the purpose of the useEffect hook in React?",
    options: [
      "To manage component state",
      "To handle side effects in functional components",
      "To create context providers",
      "To optimize component rendering"
    ],
    correctAnswer: 1,
    category: "React",
    difficulty: "Medium"
  },
  {
    id: 6,
    question: "Which CSS property is used to make text bold?",
    options: [
      "text-weight",
      "font-weight",
      "font-style",
      "text-style"
    ],
    correctAnswer: 1,
    category: "CSS",
    difficulty: "Easy"
  },
  {
    id: 7,
    question: "What is the difference between '==' and '===' in JavaScript?",
    options: [
      "There is no difference",
      "'==' checks value only, '===' checks value and type",
      "'===' checks value only, '==' checks value and type",
      "Both check value and type"
    ],
    correctAnswer: 1,
    category: "JavaScript",
    difficulty: "Medium"
  },
  {
    id: 8,
    question: "Which method is used to add an element to the end of an array in JavaScript?",
    options: [
      "append()",
      "add()",
      "push()",
      "insert()"
    ],
    correctAnswer: 2,
    category: "JavaScript",
    difficulty: "Easy"
  },
  {
    id: 9,
    question: "What is the virtual DOM in React?",
    options: [
      "A physical representation of the DOM",
      "A JavaScript representation of the real DOM",
      "A CSS framework",
      "A database for storing components"
    ],
    correctAnswer: 1,
    category: "React",
    difficulty: "Medium"
  },
  {
    id: 10,
    question: "Which CSS display property is used to create a flexible layout?",
    options: [
      "block",
      "inline",
      "flex",
      "grid"
    ],
    correctAnswer: 2,
    category: "CSS",
    difficulty: "Medium"
  }
];

export const QuizProvider = ({ children }) => {
  const [questions] = useState(sampleQuestions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds
  const [quizResults, setQuizResults] = useState(null);

  const startQuiz = useCallback(() => {
    setQuizStarted(true);
    setQuizCompleted(false);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeRemaining(30 * 60);
    setQuizResults(null);
  }, []);

  const resetQuiz = useCallback(() => {
    setQuizStarted(false);
    setQuizCompleted(false);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeRemaining(30 * 60);
    setQuizResults(null);
  }, []);

  const answerQuestion = useCallback((questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  }, []);

  const skipQuestion = useCallback((questionId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: -1 // -1 indicates skipped
    }));
  }, []);

  const goToQuestion = useCallback((index) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  }, [questions.length]);

  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [currentQuestionIndex, questions.length]);

  const previousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

  const finishQuiz = useCallback(() => {
    const results = calculateResults();
    setQuizResults(results);
    setQuizCompleted(true);
  }, [answers, questions]);

  const calculateResults = useCallback(() => {
    let correct = 0;
    let attempted = 0;
    let skipped = 0;

    questions.forEach(question => {
      const userAnswer = answers[question.id];
      
      if (userAnswer === undefined) {
        // Not attempted
      } else if (userAnswer === -1) {
        skipped++;
      } else {
        attempted++;
        if (userAnswer === question.correctAnswer) {
          correct++;
        }
      }
    });

    const totalQuestions = questions.length;
    const wrong = attempted - correct;
    const notAttempted = totalQuestions - attempted - skipped;
    const percentage = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;
    const passed = percentage >= 60; // 60% passing score

    return {
      totalQuestions,
      correct,
      wrong,
      skipped,
      notAttempted,
      attempted,
      percentage,
      passed
    };
  }, [answers, questions]);

  const getQuestionStatus = useCallback((questionId) => {
    const answer = answers[questionId];
    
    if (answer === undefined) {
      return 'not-attempted'; // Red dot
    } else if (answer === -1) {
      return 'skipped'; // Yellow dot
    } else {
      return 'attempted'; // Green dot
    }
  }, [answers]);

  const getQuestionsByCategory = useCallback(() => {
    const categories = {};
    questions.forEach(question => {
      if (!categories[question.category]) {
        categories[question.category] = [];
      }
      categories[question.category].push(question);
    });
    return categories;
  }, [questions]);

  const value = {
    // State
    questions,
    currentQuestionIndex,
    answers,
    quizStarted,
    quizCompleted,
    timeRemaining,
    quizResults,
    
    // Current question
    currentQuestion: questions[currentQuestionIndex],
    
    // Actions
    startQuiz,
    resetQuiz,
    answerQuestion,
    skipQuestion,
    goToQuestion,
    nextQuestion,
    previousQuestion,
    finishQuiz,
    
    // Utilities
    getQuestionStatus,
    getQuestionsByCategory,
    calculateResults,
    
    // Computed values
    isFirstQuestion: currentQuestionIndex === 0,
    isLastQuestion: currentQuestionIndex === questions.length - 1,
    totalQuestions: questions.length,
    
    // Time management
    setTimeRemaining
  };

  return (
    <QuizContext.Provider value={value}>
      {children}
    </QuizContext.Provider>
  );
};