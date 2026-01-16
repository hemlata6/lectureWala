import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle,
  Circle,
  Minus,
  ChevronLeft,
  ChevronRight,
  Flag,
  RotateCcw,
  Play
} from 'lucide-react';
import Network from '../context/Network';
import { useAuth } from '../context/AuthContext';


const MCQTest = ({ onTestComplete, quizData: propQuizData, onSidebarToggle }) => {

  const { authToken } = useAuth();

  // Load quiz data from localStorage on mount, fallback to prop
  const [quizData, setQuizData] = useState(() => {
    const savedQuizData = localStorage.getItem('currentQuizData');
    if (savedQuizData) {
      try {
        return JSON.parse(savedQuizData);
      } catch (error) {
        console.error('Error parsing saved quiz data:', error);
        return propQuizData;
      }
    }
    return propQuizData;
  });

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [timeRemaining, setTimeRemaining] = useState((quizData?.quiz?.duration || 30) * 60);
  const [quizStarted, setQuizStarted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [allQuestions, setAllQuestions] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sections, setSections] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [testAccessError, setTestAccessError] = useState(null);

  useEffect(() => {
    if (propQuizData) {
      setQuizData(propQuizData);
      localStorage.setItem('currentQuizData', JSON.stringify(propQuizData));
    }
  }, [propQuizData]);

  useEffect(() => {
    if (quizStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Auto-submit when time runs out (no confirmation modal)
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quizStarted, timeRemaining]);

  useEffect(() => {
    if (quizData?.quiz?.id) {
      getAllQuestions();
    }
  }, [quizData?.quiz?.id])

  console.log('quizData', quizData);
  

  // Handle fullscreen changes and keyboard restrictions
  useEffect(() => {
    const handleFullScreenChange = () => {
      const isCurrentlyFullScreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      );

      // If user exits fullscreen manually during quiz (not through our exit functions)
      if (!isCurrentlyFullScreen && quizStarted && isFullScreen && !isSubmitting && !showConfirmModal && !showExitModal) {
        // Re-enter fullscreen immediately
        const enterFullscreen = async () => {
          try {
            if (document.documentElement.requestFullscreen) {
              await document.documentElement.requestFullscreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
              await document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
              await document.documentElement.msRequestFullscreen();
            }
            // Show submit modal to force user to submit or use exit button
            setShowConfirmModal(true);
          } catch (error) {
            console.warn('Could not re-enter fullscreen mode:', error);
          }
        };
        enterFullscreen();
      }

      setIsFullScreen(isCurrentlyFullScreen);
    };

    const handleKeyDown = (e) => {
      if (quizStarted && isFullScreen) {
        // Prevent common shortcuts that could be used to exit fullscreen or switch apps
        if (
          e.key === 'Escape' || // ESC key - show submit modal instead
          e.key === 'F11' || // Fullscreen toggle
          e.key === 'F12' || // Developer tools
          (e.altKey && e.key === 'Tab') || // Alt+Tab (switch apps)
          (e.altKey && e.key === 'F4') || // Alt+F4 (close app)
          (e.ctrlKey && e.shiftKey && e.key === 'I') || // Ctrl+Shift+I (Inspect)
          (e.ctrlKey && e.shiftKey && e.key === 'J') || // Ctrl+Shift+J (Console)
          (e.ctrlKey && e.shiftKey && e.key === 'C') || // Ctrl+Shift+C (Inspect Element)
          (e.ctrlKey && e.key === 'u') || // Ctrl+U (View Source)
          (e.ctrlKey && e.key === 'U') || // Ctrl+U (View Source - uppercase)
          (e.ctrlKey && e.key === 'i') || // Ctrl+I (Inspect)
          (e.ctrlKey && e.key === 'w') || // Ctrl+W (close tab)
          (e.ctrlKey && e.key === 't') || // Ctrl+T (new tab)
          (e.ctrlKey && e.key === 'n') || // Ctrl+N (new window)
          (e.ctrlKey && e.shiftKey && e.key === 'T') || // Ctrl+Shift+T (reopen closed tab)
          (e.metaKey && e.altKey && e.key === 'I') || // Cmd+Option+I (Inspect on Mac)
          (e.metaKey && e.altKey && e.key === 'i') || // Cmd+Option+I (Inspect on Mac - lowercase)
          (e.metaKey && e.altKey && e.key === 'J') || // Cmd+Option+J (Console on Mac)
          (e.metaKey && e.altKey && e.key === 'C') || // Cmd+Option+C (Inspect Element on Mac)
          (e.metaKey && e.key === 'w') || // Cmd+W (close tab on Mac)
          (e.metaKey && e.key === 't') || // Cmd+T (new tab on Mac)
          (e.metaKey && e.key === 'n') // Cmd+N (new window on Mac)
        ) {
          e.preventDefault();
          e.stopPropagation();

          // If ESC key is pressed, show submit modal
          if (e.key === 'Escape' && !showConfirmModal && !showExitModal) {
            setShowConfirmModal(true);
          }
        }
      }
    };

    const handleContextMenu = (e) => {
      // Prevent right-click context menu during test
      if (quizStarted && isFullScreen) {
        e.preventDefault();
        return false;
      }
    };

    // Add event listeners
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
    document.addEventListener('msfullscreenchange', handleFullScreenChange);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('contextmenu', handleContextMenu);

    // Cleanup
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
      document.removeEventListener('msfullscreenchange', handleFullScreenChange);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [quizStarted, isFullScreen, isSubmitting, showConfirmModal, showExitModal]);

  const getSectionWiseQuestionNumber = (questionId, sectionId) => {
    if (!sectionId) return 0;

    // Get all questions for this section and sort them properly
    const sectionQuestions = allQuestions
      .filter(q => q.sectionId === sectionId)
      .sort((a, b) => {
        // First sort by the order they appear in the original questions array
        const aIndex = questions.findIndex(q => q.id === a.id);
        const bIndex = questions.findIndex(q => q.id === b.id);
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        }
        // Fallback to ID sorting if not found in questions array
        return a.id - b.id;
      });

    return sectionQuestions.findIndex(q => q.id === questionId) + 1;
  };

  // Helper function to get section name by ID
  const getSectionName = (sectionId) => {
    const section = sections.find(s => s.id === sectionId);
    return section ? section.name : 'General';
  };

  const getAllQuestions = async () => {
    try {
      const response = await Network.getQuestionList(authToken, quizData?.quiz?.id);

      const fetchedQuestions = response?.questions || [];

      // Transform the question format to match our component structure
      const transformedQuestions = fetchedQuestions.map(q => ({
        id: q.id,
        question: q.parsedQuestion || q.question,
        options: q.parsedOptionList || q.optionList || [],
        correctAnswer: q.type === 'multipleChoice' ? q.multipleCorrectAns : q.correctAnswerIndex,
        category: q.sectionName || 'General',
        difficulty: 'Medium', // Default difficulty since it's not in the API response
        explanation: q.explaination || '',
        marks: q.mark || 1,
        negativeMark: q.negativeMark || 0,
        questionType: q.type
      }));

      setAllQuestions(fetchedQuestions);
      setQuestions(transformedQuestions);

      // Extract unique sections from questions
      const uniqueSections = [];
      const seenSections = new Set();

      fetchedQuestions.forEach(q => {
        if (q.sectionId && q.sectionName && !seenSections.has(q.sectionId)) {
          uniqueSections.push({
            id: q.sectionId,
            name: q.sectionName
          });
          seenSections.add(q.sectionId);
        }
      });

      setSections(uniqueSections);

      // If only one section or no sections, reset filter to 'all'
      // If multiple sections, set the first section as default
      if (uniqueSections.length <= 1) {
        setSelectedFilter('all');
      } else if (uniqueSections.length > 1) {
        setSelectedFilter(`section-${uniqueSections[0].id}`);
      }
    } catch (error) {
      console.log(error);
    }
  };


  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  };

  const formatDuration = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours} hr${hours !== 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} min${minutes !== 1 ? 's' : ''}`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds} sec${seconds !== 1 ? 's' : ''}`);

    return parts.join(' ');
  };

  // const handleStartQuiz = async () => {
  //   // Check if test is accessible before starting
  //   if (quizData?.quiz) {
  //     // Check if quiz has already been attempted
  //     if (quizData.quiz.attempt === true) {
  //       setTestAccessError({
  //         type: 'attempted',
  //         message: 'You have already attempted this test.'
  //       });
  //       return;
  //     }

  //     // Check if quiz is within valid time range
  //     const now = Date.now();
  //     // API sends timestamps in MILLISECONDS already
  //     const startTime = quizData.quiz.startTime ? Number(quizData.quiz.startTime) : null;
  //     const endTime = quizData.quiz.endTime ? Number(quizData.quiz.endTime) : null;

  //     if (startTime && now < startTime) {
  //       const startDate = new Date(startTime);
  //       console.log('❌ BLOCKING ACCESS: Test not started yet');
  //       setTestAccessError({
  //         type: 'not_started',
  //         message: `This test will be available from ${startDate.toLocaleString()}.`
  //       });
  //       return;
  //     }

  //     if (endTime && now > endTime) {
  //       const endDate = new Date(endTime);
  //       console.log('❌ BLOCKING ACCESS: Test expired');
  //       setTestAccessError({
  //         type: 'expired',
  //         message: `This test expired on ${endDate.toLocaleString()}.`
  //       });
  //       return;
  //     }

  //     console.log('✅ Test is accessible - proceeding to start');
  //   }

  //   setShowInstructions(false);
  //   setQuizStarted(true);

  //   // Collapse sidebar via parent component callback
  //   if (onSidebarToggle) {
  //     onSidebarToggle(true); // true = collapsed
  //   }

  //   // Enter fullscreen mode
  //   try {
  //     if (document.documentElement.requestFullscreen) {
  //       await document.documentElement.requestFullscreen();
  //       setIsFullScreen(true);
  //     } else if (document.documentElement.webkitRequestFullscreen) {
  //       await document.documentElement.webkitRequestFullscreen();
  //       setIsFullScreen(true);
  //     } else if (document.documentElement.msRequestFullscreen) {
  //       await document.documentElement.msRequestFullscreen();
  //       setIsFullScreen(true);
  //     }
  //   } catch (error) {
  //     console.warn('Could not enter fullscreen mode:', error);
  //   }
  // };


  const handleStartQuiz = async () => {
    // if (quizData?.quiz) {
    //   const quiz = quizData.quiz;

    //   // If already attempted
    //   if (quiz.attempt === true) {
    //     setTestAccessError({
    //       type: 'attempted',
    //       message: 'You have already attempted this test.',
    //     });
    //     return;
    //   }

    //   const now = Date.now();

    //   // These timestamps are already in milliseconds
    //   const startTime = quiz.startTime ? Number(quiz.startTime) : null;
    //   const endTime = quiz.endTime ? Number(quiz.endTime) : null;



    //   // Check if test is not started yet
    //   if (startTime && now < startTime) {
    //     const startDate = new Date(startTime);
    //     setTestAccessError({
    //       type: 'not_started',
    //       message: `This test will be available from ${startDate.toLocaleString()}.`,
    //     });
    //     return;
    //   }

    //   // Check if test expired
    //   if (endTime && now > endTime) {
    //     const endDate = new Date(endTime);
    //     setTestAccessError({
    //       type: 'expired',
    //       message: `This test expired on ${endDate.toLocaleString()}.`,
    //     });
    //     return;
    //   }

    // }

    // Start the quiz
    setShowInstructions(false);
    setQuizStarted(true);

    // Collapse sidebar
    if (onSidebarToggle) onSidebarToggle(true);

    // Enter fullscreen mode
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      else if (el.msRequestFullscreen) await el.msRequestFullscreen();
      setIsFullScreen(true);
    } catch (error) {
      console.warn('Could not enter fullscreen mode:', error);
    }
  };

  const handleAnswerSelect = (optionIndex) => {
    // Use currentQuestion for consistency across all answer handling functions
    if (currentQuestion.questionType === 'multipleChoice') {
      // Multiple choice - toggle selection
      setAnswers(prev => {
        const currentAnswers = prev[currentQuestion.id] || [];
        const answerArray = Array.isArray(currentAnswers) ? currentAnswers : [];

        if (answerArray.includes(optionIndex)) {
          // Remove if already selected
          return {
            ...prev,
            [currentQuestion.id]: answerArray.filter(idx => idx !== optionIndex)
          };
        } else {
          // Add to selection
          return {
            ...prev,
            [currentQuestion.id]: [...answerArray, optionIndex]
          };
        }
      });
    } else {
      // Single choice - replace selection
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: optionIndex
      }));
    }
  };

  const handleTextAnswerChange = (value) => {
    // Use currentQuestion instead of questions[currentQuestionIndex] to handle filtering
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const handleSkipQuestion = () => {
    // Use currentQuestion instead of questions[currentQuestionIndex] to handle filtering
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: -1 // -1 indicates skipped
    }));
  };

  const handleMarkForReview = () => {
    setMarkedForReview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion.id)) {
        newSet.delete(currentQuestion.id);
      } else {
        newSet.add(currentQuestion.id);
      }
      return newSet;
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleGoToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleExitTest = () => {
    // Show exit confirmation modal
    setShowExitModal(true);
  };

  const handleFinishQuiz = () => {
    setShowConfirmModal(true);
  };

  const handleCancelSubmit = () => {
    setShowConfirmModal(false);
    // Re-enter fullscreen mode when continuing the test
    const enterFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          await document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
          await document.documentElement.msRequestFullscreen();
        }
        setIsFullScreen(true);
      } catch (error) {
        console.warn('Could not re-enter fullscreen mode:', error);
      }
    };
    enterFullscreen();
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitQuizToAPI();
      const results = calculateResults();
      // Clear quiz data from localStorage
      localStorage.removeItem('currentQuizData');
      // Exit fullscreen and restore sidebar before showing results
      await exitFullScreen();
      onTestComplete && onTestComplete(results, quizData, answers);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      // Still show results even if API fails
      const results = calculateResults();
      // Clear quiz data from localStorage
      localStorage.removeItem('currentQuizData');
      // Exit fullscreen and restore sidebar before showing results
      await exitFullScreen();
      onTestComplete && onTestComplete(results, quizData, answers);
    } finally {
      setIsSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  const handleAutoSubmit = async () => {
    // Auto-submit when time runs out - no confirmation modal
    setIsSubmitting(true);
    try {
      await submitQuizToAPI();
      const results = calculateResults();
      // Clear quiz data from localStorage
      localStorage.removeItem('currentQuizData');
      // Exit fullscreen and restore sidebar before showing results
      await exitFullScreen();
      onTestComplete && onTestComplete(results, quizData, answers);
    } catch (error) {
      console.error('Error auto-submitting quiz:', error);
      // Still show results even if API fails
      const results = calculateResults();
      // Clear quiz data from localStorage
      localStorage.removeItem('currentQuizData');
      // Exit fullscreen and restore sidebar before showing results
      await exitFullScreen();
      onTestComplete && onTestComplete(results, quizData, answers);
    } finally {
      setIsSubmitting(false);
    }
  };

  const exitFullScreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen();
      }
      setIsFullScreen(false);
    } catch (error) {
      console.warn('Could not exit fullscreen mode:', error);
    } finally {
      // Restore sidebar via parent component callback
      if (onSidebarToggle) {
        onSidebarToggle(false); // false = expanded
      }
    }
  };



  const handleConfirmExit = async () => {
    // Clear quiz data from localStorage
    localStorage.removeItem('currentQuizData');
    // Exit fullscreen and return to normal view
    await exitFullScreen();
    setShowExitModal(false);
    setQuizStarted(false);
    setShowInstructions(true);
    // Reset quiz state if needed
    setCurrentQuestionIndex(0);
    setAnswers({});
    setMarkedForReview(new Set());
    setTimeRemaining((quizData?.quiz?.duration || 30) * 60);
  };

  const handleCancelExit = () => {
    setShowExitModal(false);
  };

  const handleFilterChange = (value) => {
    setSelectedFilter(value);
    // Reset to first question when filter changes
    setCurrentQuestionIndex(0);
  };

  // Get filtered questions based on selected filter
  const getFilteredQuestions = () => {
    // If only one section or no sections, show all questions regardless of filter
    if (sections.length <= 1 || selectedFilter === 'all') {
      return questions.map((q, index) => ({ question: q, originalIndex: index }));
    }

    return questions.map((q, index) => ({ question: q, originalIndex: index })).filter(({ question, originalIndex }) => {
      const answer = answers[question.id];
      const isMarkedForReview = markedForReview.has(question.id);
      const originalQuestion = allQuestions.find(aq => aq.id === question.id);

      // Check if question is actually answered based on question type
      let isAnswered = false;
      if (answer !== undefined && answer !== -1) {
        if (question?.questionType === 'multipleChoice') {
          isAnswered = Array.isArray(answer) && answer.length > 0;
        } else if (question?.questionType === 'numeric' || question?.questionType === 'oneWord') {
          isAnswered = answer !== '' && answer !== null;
        } else {
          isAnswered = true;
        }
      }

      switch (selectedFilter) {
        case 'attempted':
          return isAnswered;
        case 'unattempted':
          return !isAnswered && answer !== -1;
        case 'marked':
          return isMarkedForReview;
        case 'skipped':
          return answer === -1;
        case 'singleChoice':
          return question.questionType === 'singleChoice' || !question.questionType;
        case 'multipleChoice':
          return question.questionType === 'multipleChoice';
        case 'numeric':
          return question.questionType === 'numeric';
        case 'oneWord':
          return question.questionType === 'oneWord';
        default:
          // Check if it's a section filter
          if (selectedFilter.startsWith('section-')) {
            const sectionId = parseInt(selectedFilter.replace('section-', ''));
            return originalQuestion?.sectionId === sectionId;
          }
          return true;
      }
    });
  };

  const filteredQuestions = getFilteredQuestions();
  const filteredCurrentQuestion = filteredQuestions[currentQuestionIndex]?.question;
  const filteredCurrentOriginalIndex = filteredQuestions[currentQuestionIndex]?.originalIndex;

  const submitQuizToAPI = async () => {
    try {

      const quizSubmitModals = questions
        .map(question => {
          const userAnswer = answers[question.id];
          const originalQuestion = allQuestions.find(q => q.id === question.id);

          let selectedOption = null;
          let multipleAns = [];
          let oneWordAns = null;
          let numericAns = null;
          let isAttempted = false;

          if (question.questionType === 'multipleChoice') {
            if (Array.isArray(userAnswer) && userAnswer.length > 0) {
              multipleAns = userAnswer;
              selectedOption = userAnswer[0]; // Primary selection for compatibility
              isAttempted = true;
            }
          } else if (question.questionType === 'oneWord') {
            if (userAnswer !== undefined && userAnswer !== -1 && userAnswer !== '') {
              oneWordAns = userAnswer;
              isAttempted = true;
            }
          } else if (question.questionType === 'numeric') {
            if (userAnswer !== undefined && userAnswer !== -1 && userAnswer !== '') {
              numericAns = parseFloat(userAnswer) || 0;
              isAttempted = true;
            }
          } else {
            // Single choice
            if (userAnswer !== undefined && userAnswer !== -1) {
              selectedOption = userAnswer;
              multipleAns = [userAnswer];
              isAttempted = true;
            }
          }

          // Return null for unattempted or skipped questions
          if (!isAttempted) {
            return null;
          }

          return {
            quizQuestionMapId: originalQuestion?.quizQuestionMapId,
            // quizQuestionMapId: originalQuestion?.id,
            selectedOption,
            duration: Math.floor(((quizData?.quiz?.duration || 30) * 60 - timeRemaining) / questions.length), // Average time per question
            oneWordAns, // For text-based answers
            numericAns, // For numeric answers
            multipleAns // For multiple choice
          };
        })
        .filter(item => item !== null); // Remove null entries (unattempted questions)

      const payload = {
        quizSubmitModals,
        quizId: quizData?.quiz?.id
      };

      const response = await Network.submitQuiz(authToken, payload);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const calculateResults = () => {
    let correct = 0;
    let attempted = 0;
    let skipped = 0;
    let totalMarksObtained = 0;
    let totalPossibleMarks = 0;
    let negativeMark = 0;

    questions.forEach(question => {
      const userAnswer = answers[question.id];
      const questionMarks = question.marks || 1;
      const questionNegativeMarks = question.negativeMark || 0;

      totalPossibleMarks += questionMarks;

      if (userAnswer === undefined) {
        // Not attempted
      } else if (userAnswer === -1) {
        skipped++;
      } else {
        attempted++;

        // Check answer based on question type
        let isCorrect = false;

        if (question.questionType === 'multipleChoice') {
          // For multiple choice, check if user selected all correct options
          const userAnswerArray = Array.isArray(userAnswer) ? userAnswer : [];
          const correctAnswers = Array.isArray(question.correctAnswer) ? question.correctAnswer : [question.correctAnswer];

          // Check if arrays are equal (same length and same elements)
          isCorrect = userAnswerArray.length === correctAnswers.length &&
            userAnswerArray.sort().join(',') === correctAnswers.sort().join(',');
        } else if (question.questionType === 'oneWord') {
          // For one word answers, compare strings (case insensitive)
          const userAnswerStr = String(userAnswer || '').toLowerCase().trim();
          const correctAnswerStr = String(question.correctAnswer || '').toLowerCase().trim();
          isCorrect = userAnswerStr === correctAnswerStr;
        } else if (question.questionType === 'numeric') {
          // For numeric answers, compare numbers
          const userAnswerNum = parseFloat(userAnswer) || 0;
          const correctAnswerNum = parseFloat(question.correctAnswer) || 0;
          isCorrect = userAnswerNum === correctAnswerNum;
        } else {
          // For single choice, direct comparison
          isCorrect = userAnswer === question.correctAnswer;
        }

        if (isCorrect) {
          correct++;
          totalMarksObtained += questionMarks;
        } else {
          // Wrong answer - apply negative marking
          totalMarksObtained -= questionNegativeMarks;
          negativeMark += questionNegativeMarks;
        }
      }
    });

    const totalQuestions = questions.length;
    const wrong = attempted - correct;
    const notAttempted = totalQuestions - attempted - skipped;

    // Calculate percentage based on marks obtained vs total possible marks
    const marksPercentage = totalPossibleMarks > 0 ? Math.round((totalMarksObtained / totalPossibleMarks) * 100) : 0;

    // Calculate percentage based on correct answers (for display purposes)
    const correctPercentage = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;

    // Use cut-off from quiz data or default to 60%
    const passingPercentage = quizData?.quiz?.cutOff || 60;
    const passed = marksPercentage >= passingPercentage;

    // Calculate section-wise results
    const sectionWiseResults = {};
    sections.forEach(section => {
      const sectionQuestions = questions.filter(q => {
        const originalQ = allQuestions.find(aq => aq.id === q.id);
        return originalQ?.sectionId === section.id;
      });

      let sectionCorrect = 0;
      let sectionAttempted = 0;
      let sectionSkipped = 0;
      let sectionMarksObtained = 0;
      let sectionTotalMarks = 0;

      sectionQuestions.forEach(question => {
        const userAnswer = answers[question.id];
        const questionMarks = question.marks || 1;
        const questionNegativeMarks = question.negativeMark || 0;

        sectionTotalMarks += questionMarks;

        if (userAnswer === undefined) {
          // Not attempted
        } else if (userAnswer === -1) {
          sectionSkipped++;
        } else {
          sectionAttempted++;

          // Check answer based on question type (same logic as above)
          let isCorrect = false;
          if (question.questionType === 'multipleChoice') {
            const userAnswerArray = Array.isArray(userAnswer) ? userAnswer : [];
            const correctAnswers = Array.isArray(question.correctAnswer) ? question.correctAnswer : [question.correctAnswer];
            isCorrect = userAnswerArray.length === correctAnswers.length &&
              userAnswerArray.sort().join(',') === correctAnswers.sort().join(',');
          } else if (question.questionType === 'oneWord') {
            const userAnswerStr = String(userAnswer || '').toLowerCase().trim();
            const correctAnswerStr = String(question.correctAnswer || '').toLowerCase().trim();
            isCorrect = userAnswerStr === correctAnswerStr;
          } else if (question.questionType === 'numeric') {
            const userAnswerNum = parseFloat(userAnswer) || 0;
            const correctAnswerNum = parseFloat(question.correctAnswer) || 0;
            isCorrect = userAnswerNum === correctAnswerNum;
          } else {
            isCorrect = userAnswer === question.correctAnswer;
          }

          if (isCorrect) {
            sectionCorrect++;
            sectionMarksObtained += questionMarks;
          } else {
            sectionMarksObtained -= questionNegativeMarks;
          }
        }
      });

      const sectionWrong = sectionAttempted - sectionCorrect;
      const sectionNotAttempted = sectionQuestions.length - sectionAttempted - sectionSkipped;
      const sectionPercentage = sectionQuestions.length > 0 ? Math.round((sectionCorrect / sectionQuestions.length) * 100) : 0;
      const sectionMarksPercentage = sectionTotalMarks > 0 ? Math.round((sectionMarksObtained / sectionTotalMarks) * 100) : 0;

      sectionWiseResults[section.id] = {
        sectionId: section.id,
        sectionName: section.name,
        totalQuestions: sectionQuestions.length,
        correct: sectionCorrect,
        wrong: sectionWrong,
        skipped: sectionSkipped,
        notAttempted: sectionNotAttempted,
        attempted: sectionAttempted,
        percentage: sectionPercentage,
        marksPercentage: sectionMarksPercentage,
        totalMarksObtained: Math.max(0, sectionMarksObtained),
        totalPossibleMarks: sectionTotalMarks,
        questions: sectionQuestions
      };
    });

    return {
      totalQuestions,
      correct,
      wrong,
      skipped,
      notAttempted,
      attempted,
      percentage: correctPercentage, // For compatibility with Result component
      marksPercentage, // Actual marks-based percentage
      passed,
      timeSpent: ((quizData?.quiz?.duration || 30) * 60) - timeRemaining,
      totalMarksObtained: Math.max(0, totalMarksObtained), // Ensure no negative total
      totalPossibleMarks,
      negativeMark,
      passingPercentage,
      markedForReview: markedForReview.size,
      quizTitle: quizData?.title || 'MCQ Test',
      quizDuration: quizData?.quiz?.duration || 30,
      sectionWiseResults, // Add section-wise results
      sections // Add sections info
    };
  };

  const getQuestionStatus = (questionId) => {
    const answer = answers[questionId];
    const isMarkedForReview = markedForReview.has(questionId);
    const question = questions.find(q => q.id === questionId);

    // Check if question is actually answered based on question type
    let isAnswered = false;
    if (answer !== undefined && answer !== -1) {
      if (question?.questionType === 'multipleChoice') {
        // For multiple choice, check if array has at least one selection
        isAnswered = Array.isArray(answer) && answer.length > 0;
      } else if (question?.questionType === 'numeric' || question?.questionType === 'oneWord') {
        // For text/numeric input, check if not empty
        isAnswered = answer !== '' && answer !== null;
      } else {
        // For single choice, any non-undefined, non-(-1) value is considered answered
        isAnswered = true;
      }
    }

    if (isMarkedForReview && isAnswered) {
      return 'marked-for-review-answered';
    } else if (isMarkedForReview) {
      return 'marked-for-review';
    } else if (answer === undefined ||
      (question?.questionType === 'multipleChoice' && Array.isArray(answer) && answer.length === 0) ||
      ((question?.questionType === 'numeric' || question?.questionType === 'oneWord') && (answer === '' || answer === null))) {
      return 'not-attempted';
    } else if (answer === -1) {
      return 'skipped';
    } else if (isAnswered) {
      return 'attempted';
    } else {
      return 'not-attempted';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'attempted':
        return (
          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-sm">
            <CheckCircle className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
          </div>
        );
      case 'skipped':
        return (
          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-sm">
            <Minus className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
          </div>
        );
      case 'marked-for-review':
        return (
          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
            <Flag className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
          </div>
        );
      case 'marked-for-review-answered':
        return (
          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
            <Flag className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
          </div>
        );
      default:
        return (
          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-sm">
            <Circle className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
          </div>
        );
    }
  };

  const currentQuestion = filteredCurrentQuestion || questions[currentQuestionIndex];
  const selectedAnswer = answers[currentQuestion?.id];
  const isAnswered = currentQuestion?.questionType === 'multipleChoice'
    ? Array.isArray(selectedAnswer) && selectedAnswer.length > 0
    : currentQuestion?.questionType === 'numeric' || currentQuestion?.questionType === 'oneWord'
      ? selectedAnswer !== undefined && selectedAnswer !== '' && selectedAnswer !== -1
      : selectedAnswer !== undefined && selectedAnswer !== -1;

  // Show loading state while questions are being fetched
  if (quizData?.id && questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz questions...</p>
        </div>
      </div>
    );
  }

  // Show error state if no current question is available
  if (!currentQuestion && !showInstructions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">⚠️</div>
          <p className="text-gray-600">No questions available for the current filter.</p>
          <button
            onClick={() => setSelectedFilter('all')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Show All Questions
          </button>
        </div>
      </div>
    );
  }

  // Instructions screen
  if (showInstructions) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{quizData?.title || 'MCQ Test'} - Instructions</h1>
              <p className="text-gray-600">Please read the instructions carefully before starting the test</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Details</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-3 text-blue-600" />
                    <span><strong>Duration:</strong> {formatDuration((quizData?.quiz?.duration || 30) * 60)}</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-3 text-green-600" />
                    <span><strong>Questions:</strong> {questions?.length}</span>
                  </div>
                  {/* <div className="flex items-center">
                    <Flag className="h-5 w-5 mr-3 text-red-600" />
                    <span><strong>Total Marks:</strong> {quizData?.quiz?.totalMarks || questions.length}</span>
                  </div> */}
                  {quizData?.quiz?.cutOff !== 0 && (
                    <div className="flex items-center">
                      <Flag className="h-5 w-5 mr-3 text-orange-600" />
                      <span><strong>Passing Score:</strong> {quizData?.quiz?.cutOff}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Quiz Instructions</h3>
              <div className="text-blue-800 text-sm">
                {quizData?.quiz?.instruction ? (
                  <div dangerouslySetInnerHTML={{ __html: quizData.quiz.instruction }} />
                ) : (
                  <ul className="space-y-2">
                    <li>• You can navigate between questions using Next/Previous buttons</li>
                    <li>• Click on question numbers to jump directly to any question</li>
                    <li>• You can skip questions and return to them later</li>
                    <li>• Your answers are automatically saved</li>
                    <li>• The test will auto-submit when time runs out</li>
                    <li>• Make sure you have a stable internet connection</li>
                  </ul>
                )}
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleStartQuiz}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-200 flex items-center mx-auto"
              >
                <Play className="h-6 w-6 mr-3" />
                Start Test
              </button>
            </div>
          </div>
        </div>

        {/* Test Access Error Modal for Instructions Screen */}
        {testAccessError && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 mx-4">
              <div className="text-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${testAccessError.type === 'attempted'
                  ? 'bg-blue-100'
                  : testAccessError.type === 'expired'
                    ? 'bg-red-100'
                    : 'bg-yellow-100'
                  }`}>
                  {testAccessError.type === 'attempted' ? (
                    <CheckCircle className="h-10 w-10 text-blue-600" />
                  ) : testAccessError.type === 'expired' ? (
                    <Clock className="h-10 w-10 text-red-600" />
                  ) : (
                    <Clock className="h-10 w-10 text-yellow-600" />
                  )}
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {testAccessError.type === 'attempted'
                    ? 'Test Already Attempted'
                    : testAccessError.type === 'expired'
                      ? 'Test Expired'
                      : 'Test Not Yet Available'}
                </h2>

                <p className="text-gray-600 mb-6">
                  {testAccessError.message}
                </p>
                {/* 
                {testAccessError.type === 'attempted' && (
                  <p className="text-sm text-gray-500 mb-6">
                    You have already completed this test. Please check your results or contact your instructor if you believe this is an error.
                  </p>
                )} */}

                <button
                  onClick={() => setTestAccessError(null)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Timer */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          {isFullScreen && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4 rounded">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <p className="text-blue-800 text-sm font-medium">
                  🔒 Exam Mode Active - Full Screen Locked
                </p>
              </div>
            </div>
          )}
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{quizData?.title || 'MCQ Test'}</h1>
              <p className="text-gray-600">Question {currentQuestionIndex + 1} of {filteredQuestions.length} {selectedFilter !== 'all' ? `(${questions.length} total)` : ''}</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 md:space-x-6">
              <div className={`flex items-center px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm sm:text-base ${timeRemaining <= 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                {formatTime(timeRemaining)}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                {/* <button
                  onClick={handleExitTest}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 sm:px-6 rounded-lg transition-colors duration-200 text-sm sm:text-base w-full sm:w-auto"
                  title="Exit test and return to normal view"
                >
                  Exit Test
                </button> */}
                <button
                  onClick={handleFinishQuiz}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 sm:px-6 rounded-lg transition-colors duration-200 text-sm sm:text-base w-full sm:w-auto"
                >
                  Finish Test
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Question Navigation Panel - Shows after content on mobile */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:sticky lg:top-6">
              <div className="grid grid-cols-6 sm:grid-cols-5 gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                {filteredQuestions.map(({ question, originalIndex }, index) => {
                  const status = getQuestionStatus(question.id);
                  const isCurrent = index === currentQuestionIndex;
                  const originalQuestion = allQuestions.find(q => q.id === question.id);
                  const sectionWiseNumber = getSectionWiseQuestionNumber(question.id, originalQuestion?.sectionId);
                  const displayNumber = selectedFilter.startsWith('section-') ? sectionWiseNumber : originalIndex + 1;

                  return (
                    <button
                      key={question.id}
                      onClick={() => handleGoToQuestion(index)}
                      className={`relative w-10 h-10 rounded-lg border-2 font-semibold transition-colors duration-200 ${isCurrent
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
                        }`}
                      title={`Section: ${getSectionName(originalQuestion?.sectionId)}`}
                    >
                      {displayNumber}
                      <div className="absolute -top-1 -right-1">
                        {getStatusIcon(status)}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Status Legend */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Status Legend
                  {selectedFilter.startsWith('section-') && (
                    <span className="block text-xs font-normal text-gray-500 mt-1">
                      ({getSectionName(parseInt(selectedFilter.replace('section-', '')))})
                    </span>
                  )}
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-sm mr-2">
                        <CheckCircle className="h-2.5 w-2.5 text-white" />
                      </div>
                      <span className="text-gray-600">Answered</span>
                    </div>
                    <span className="text-gray-500 font-medium">
                      {filteredQuestions.filter(({ question }) => {
                        const answer = answers[question.id];
                        return answer !== undefined && answer !== -1 && (
                          question.questionType === 'multipleChoice' ?
                            Array.isArray(answer) && answer.length > 0 :
                            question.questionType === 'numeric' || question.questionType === 'oneWord' ?
                              answer !== '' && answer !== null : true
                        );
                      }).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-sm mr-2">
                        <Minus className="h-2.5 w-2.5 text-white" />
                      </div>
                      <span className="text-gray-600">Skipped</span>
                    </div>
                    <span className="text-gray-500 font-medium">
                      {filteredQuestions.filter(({ question }) => answers[question.id] === -1).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-sm mr-2">
                        <Flag className="h-2.5 w-2.5 text-white" />
                      </div>
                      <span className="text-gray-600">Marked for Review</span>
                    </div>
                    <span className="text-gray-500 font-medium">
                      {filteredQuestions.filter(({ question }) => markedForReview.has(question.id)).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-sm mr-2">
                        <Circle className="h-2.5 w-2.5 text-white" />
                      </div>
                      <span className="text-gray-600">Not Attempted</span>
                    </div>
                    <span className="text-gray-500 font-medium">
                      {filteredQuestions.filter(({ question }) => {
                        const answer = answers[question.id];
                        return answer === undefined || (
                          question.questionType === 'multipleChoice' && Array.isArray(answer) && answer.length === 0
                        ) || (
                            (question.questionType === 'numeric' || question.questionType === 'oneWord') &&
                            (answer === '' || answer === null)
                          );
                      }).length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Summary */}
              <div className="space-y-3 text-sm">
                {selectedFilter.startsWith('section-') && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h5 className="font-semibold text-blue-900 mb-2">Section Progress</h5>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Attempted:</span>
                        <span className="font-semibold text-green-600">
                          {filteredQuestions.filter(({ question }) => {
                            const answer = answers[question.id];
                            return answer !== undefined && answer !== -1;
                          }).length} / {filteredQuestions.length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Remaining:</span>
                        <span className="font-semibold text-orange-600">
                          {filteredQuestions.filter(({ question }) => {
                            const answer = answers[question.id];
                            return answer === undefined;
                          }).length}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className={selectedFilter.startsWith('section-') ? 'bg-gray-50 p-3 rounded-lg' : ''}>
                  {selectedFilter.startsWith('section-') && (
                    <h5 className="font-semibold text-gray-900 mb-2">Overall Progress</h5>
                  )}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Attempted:</span>
                      <span className="font-semibold text-green-600">
                        {Object.values(answers).filter(a => a !== undefined && a !== -1).length} / {questions.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Skipped:</span>
                      <span className="font-semibold text-yellow-600">
                        {Object.values(answers).filter(a => a === -1).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Marked for Review:</span>
                      <span className="font-semibold text-purple-600">
                        {markedForReview.size}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Remaining:</span>
                      <span className="font-semibold text-red-600">
                        {questions.length - Object.keys(answers).length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Question Content - Shows first on mobile */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
              {/* Filter/Sort Options - Only show if multiple sections */}
              {sections.length > 1 && (
                <div className="mb-4 sm:mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <label className="text-sm font-medium text-gray-700">Filter by Section:</label>
                      <select
                        value={selectedFilter}
                        onChange={(e) => handleFilterChange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        <option value="all">All Sections</option>
                        {sections.map(section => (
                          <option key={section.id} value={`section-${section.id}`}>
                            {section.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Question */}
              <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Section Badge */}
                    {(() => {
                      const originalQuestion = allQuestions.find(q => q.id === currentQuestion.id);
                      const sectionName = getSectionName(originalQuestion?.sectionId);
                      const sectionWiseNumber = getSectionWiseQuestionNumber(currentQuestion.id, originalQuestion?.sectionId);

                      return (
                        <span className="bg-indigo-100 text-indigo-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                          Q{sectionWiseNumber}
                        </span>
                      );
                    })()}

                    <span className="bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                      +{currentQuestion.marks || 1} Mark{(currentQuestion.marks || 1) > 1 ? 's' : ''}
                    </span>
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${currentQuestion.questionType === 'multipleChoice'
                      ? 'bg-blue-100 text-blue-800'
                      : currentQuestion.questionType === 'numeric'
                        ? 'bg-green-100 text-green-800'
                        : currentQuestion.questionType === 'oneWord'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                      {currentQuestion.questionType === 'multipleChoice'
                        ? 'Multiple Choice'
                        : currentQuestion.questionType === 'numeric'
                          ? 'Numeric Answer'
                          : currentQuestion.questionType === 'oneWord'
                            ? 'Text Answer'
                            : 'Single Choice'}
                    </span>
                    {markedForReview.has(currentQuestion.id) && (
                      <span className="bg-purple-100 text-purple-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                        <Flag className="w-3 h-3 inline mr-1" />
                        Marked for Review
                      </span>
                    )}
                  </div>
                  {currentQuestion.negativeMark > 0 && (
                    <div className="flex items-center">
                      <span className="bg-red-100 text-red-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                        -{currentQuestion.negativeMark} Negative Mark{currentQuestion.negativeMark !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-lg sm:text-xl font-semibold text-gray-900 leading-relaxed mb-3 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                  <div dangerouslySetInnerHTML={{ __html: currentQuestion.question }} />
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                {currentQuestion.questionType === 'numeric' ? (
                  // Numeric input field
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter your numeric answer:
                    </label>
                    <input
                      type="number"
                      value={answers[currentQuestion.id] || ''}
                      onChange={(e) => handleTextAnswerChange(e.target.value)}
                      placeholder="Enter a number"
                      className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 text-sm sm:text-base"
                    />
                  </div>
                ) : currentQuestion.questionType === 'oneWord' ? (
                  // Text input field for one word
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter your answer:
                    </label>
                    <input
                      type="text"
                      value={answers[currentQuestion.id] || ''}
                      onChange={(e) => handleTextAnswerChange(e.target.value)}
                      placeholder="Enter your answer"
                      className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 text-sm sm:text-base"
                    />
                  </div>
                ) : (
                  // Multiple choice and single choice options
                  currentQuestion.options.map((option, index) => {
                    const isMultipleChoice = currentQuestion.questionType === 'multipleChoice';
                    const currentAnswers = answers[currentQuestion.id];
                    const isSelected = isMultipleChoice
                      ? Array.isArray(currentAnswers) && currentAnswers.includes(index)
                      : selectedAnswer === index;

                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        className={`w-full text-left p-3 sm:p-4 rounded-lg border-2 transition-colors duration-200 ${isSelected
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                      >
                        <div className="flex items-start sm:items-center">
                          <span className={`w-5 h-5 sm:w-6 sm:h-6 ${isMultipleChoice ? 'rounded-md' : 'rounded-full'} border-2 mr-3 sm:mr-4 flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0 ${isSelected
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                            }`}>
                            {isSelected && (
                              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                            )}
                          </span>
                          <span className="font-medium mr-2 sm:mr-3 text-sm sm:text-base">{String.fromCharCode(65 + index)}.</span>
                          <div className="text-sm sm:text-base" dangerouslySetInnerHTML={{ __html: option }} />
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-col space-y-4">
                <div className="flex flex-wrap gap-2 sm:gap-3 justify-center sm:justify-start">
                  <button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm sm:text-base"
                  >
                    <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                    Previous
                  </button>

                  <button
                    onClick={handleSkipQuestion}
                    className="flex items-center px-3 sm:px-4 py-2 border border-yellow-300 rounded-lg text-yellow-700 bg-yellow-50 hover:bg-yellow-100 transition-colors duration-200 text-sm sm:text-base"
                  >
                    <Minus className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                    Skip
                  </button>

                  <button
                    onClick={handleMarkForReview}
                    className={`flex items-center px-3 sm:px-4 py-2 border rounded-lg transition-colors duration-200 text-sm sm:text-base ${markedForReview.has(currentQuestion.id)
                      ? 'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100'
                      : 'border-purple-300 bg-white text-purple-700 hover:bg-purple-50'
                      }`}
                  >
                    <Flag className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{markedForReview.has(currentQuestion.id) ? 'Unmark' : 'Mark for Review'}</span>
                    <span className="sm:hidden">{markedForReview.has(currentQuestion.id) ? 'Unmark' : 'Mark'}</span>
                  </button>
                </div>

                <div className="flex justify-center sm:justify-end">
                  <button
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === filteredQuestions.length - 1}
                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm sm:text-base min-w-[120px] justify-center"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Access Error Modal */}
      {testAccessError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 mx-4">
            <div className="text-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${testAccessError.type === 'attempted'
                ? 'bg-blue-100'
                : testAccessError.type === 'expired'
                  ? 'bg-red-100'
                  : 'bg-yellow-100'
                }`}>
                {testAccessError.type === 'attempted' ? (
                  <CheckCircle className="h-10 w-10 text-blue-600" />
                ) : testAccessError.type === 'expired' ? (
                  <Clock className="h-10 w-10 text-red-600" />
                ) : (
                  <Clock className="h-10 w-10 text-yellow-600" />
                )}
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {testAccessError.type === 'attempted'
                  ? 'Test Already Attempted'
                  : testAccessError.type === 'expired'
                    ? 'Test Expired'
                    : 'Test Not Yet Available'}
              </h2>

              <p className="text-gray-600 mb-6">
                {testAccessError.message}
              </p>

              {testAccessError.type === 'attempted' && (
                <p className="text-sm text-gray-500 mb-6">
                  You have already completed this test. Please check your results or contact your instructor if you believe this is an error.
                </p>
              )}

              <button
                onClick={() => setTestAccessError(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {(showConfirmModal || showExitModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Flag className="h-8 w-8 text-orange-600" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {showExitModal ? 'Exit Test?' : 'Submit Test?'}
              </h3>

              <p className="text-gray-600 mb-6">
                {showExitModal ?
                  'Are you sure you want to exit the test? Your current progress will be lost and you will return to normal view.' :
                  'Are you sure you want to submit your test? Once submitted, you cannot make any changes to your answers.'
                }
              </p>

              {/* Test Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Attempted:</span>
                  <span className="font-semibold text-green-600">
                    {Object.values(answers).filter(a => a !== undefined && a !== -1).length} / {questions.length}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Marked for Review:</span>
                  <span className="font-semibold text-purple-600">{markedForReview.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time Remaining:</span>
                  <span className="font-semibold text-blue-600">{formatTime(timeRemaining)}</span>
                </div>
              </div>

              <div className="flex space-x-3">
                {showExitModal ? (
                  <>
                    <button
                      onClick={handleCancelExit}
                      className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors duration-200"
                    >
                      Continue Test
                    </button>
                    <button
                      onClick={handleConfirmExit}
                      className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200"
                    >
                      Exit Test
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleCancelSubmit}
                      disabled={isSubmitting}
                      className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
                    >
                      Continue Test
                    </button>
                    <button
                      onClick={handleConfirmSubmit}
                      disabled={isSubmitting}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        'Submit Test'
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MCQTest;