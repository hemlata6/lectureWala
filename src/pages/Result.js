import React, { useEffect, useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  Download,
  Share2,
  Trophy,
  Target,
  TrendingUp,
  BookOpen,
  Eye,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Network from '../context/Network';
import { useAuth } from '../context/AuthContext';

const Result = ({ results, onRetakeTest, onGoHome, quizData: propQuizData, userAnswers }) => {
  const { authToken } = useAuth();
  const [testResults, setTestResults] = useState(results);
  const [showSolutionsModal, setShowSolutionsModal] = useState(false);
  const [solutions, setSolutions] = useState([]);
  const [loadingSolutions, setLoadingSolutions] = useState(false);
  const [currentSolutionIndex, setCurrentSolutionIndex] = useState(0);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [selectedSectionFilter, setSelectedSectionFilter] = useState('all');
  const [apiResult, setApiResult] = useState(null);
  const [loading, setLoading] = useState(false);

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



  useEffect(() => {
    fetchResultData();
  }, [])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getGradeInfo = (percentage) => {
    if (percentage >= 90) return { grade: 'A+', color: 'text-emerald-600', bgColor: 'bg-emerald-100' };
    if (percentage >= 80) return { grade: 'A', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (percentage >= 70) return { grade: 'B', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (percentage >= 60) return { grade: 'C', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    if (percentage >= 50) return { grade: 'D', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    return { grade: 'F', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const gradeInfo = getGradeInfo(testResults?.percentage || 0);

  const fetchResultData = async () => {
    if (!quizData?.quiz?.id) {
      return;
    }

    setLoading(true);
    try {
      const response = await Network.fetchSolution(authToken, quizData.quiz.id);
      setApiResult(response);

      // Extract leaderboard data
      const leaderboard = response?.leaderBoardList || [];
      setLeaderboardData(leaderboard);

      // If testResults is null (navigating from attempted quiz), construct it from API response
      if (!results && response) {
        // Calculate section-wise results from analysis array
        const sectionWiseResults = {};
        if (response.analysis && Array.isArray(response.analysis)) {
          response.analysis.forEach(section => {
            const sectionPercentage = section.percent || 0;

            const marksPercentage = section.totalMarks > 0
              ? Math.round((section.marksObtained / section.totalMarks) * 100)
              : 0;

            sectionWiseResults[section.sectionId] = {
              sectionId: section.sectionId,
              sectionName: section.sectionName,
              totalQuestions: section.totalQuestion,
              attempted: section.attemptedQuestion || (section.correctAnswer + section.wrongAnswer + section.skippedAnswer),
              correct: section.correctAnswer,
              wrong: section.wrongAnswer,
              skipped: section.skippedAnswer || 0,
              notAttempted: section.totalQuestion - (section.attemptedQuestion || (section.correctAnswer + section.wrongAnswer + section.skippedAnswer)),
              percentage: sectionPercentage,
              totalPossibleMarks: section.totalMarks,
              totalMarksObtained: section.marksObtained,
              marksPercentage: marksPercentage
            };
          });
        }

        // Construct overall test results from parent keys
        const overallPercentage = response.percent || 0;
        const attemptedQuestions = response.correctAnswer + response.wrongAnswer + response.skippedAnswer;

        const constructedResults = {
          totalQuestions: response.totalQuestions,
          attempted: attemptedQuestions,
          correct: response.correctAnswer,
          wrong: response.wrongAnswer,
          skipped: response.skippedAnswer,
          notAttempted: response.totalQuestions - attemptedQuestions,
          percentage: overallPercentage,
          timeSpent: Math.floor((response.totalDuration || 0) / 1000), // Convert to seconds
          passed: overallPercentage >= (quizData?.quiz?.cutOff || 60),
          totalPossibleMarks: response.totalMarks,
          totalMarksObtained: response.obtainedMarks,
          sectionWiseResults: Object.keys(sectionWiseResults).length > 0 ? sectionWiseResults : null,
          sections: response.analysis?.map(s => ({ id: s.sectionId, name: s.sectionName })) || [],
          passingPercentage: response.cutOff || quizData?.quiz?.cutOff || 60,
          studentId: response.studentId
        };

        setTestResults(constructedResults);
      }
    } catch (error) {
      console.error('Error fetching result data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSolutions = async () => {
    if (!quizData?.quiz?.id) {
      return;
    }

    setLoadingSolutions(true);
    try {
      const response = await Network.fetchSolution(authToken, quizData.quiz.id);

      // Transform the solutions data to match our display format
      const transformedSolutions = response?.questions || [];
      setSolutions(transformedSolutions);

      setShowSolutionsModal(true);
      setCurrentSolutionIndex(0);
    } catch (error) {
    } finally {
      setLoadingSolutions(false);
    }
  };

  const closeSolutionsModal = () => {
    setShowSolutionsModal(false);
    setSolutions([]);
    setCurrentSolutionIndex(0);
    setSelectedSectionFilter('all');
  };

  const nextSolution = () => {
    if (currentSolutionIndex < solutions.length - 1) {
      setCurrentSolutionIndex(currentSolutionIndex + 1);
    }
  };

  const previousSolution = () => {
    if (currentSolutionIndex > 0) {
      setCurrentSolutionIndex(currentSolutionIndex - 1);
    }
  };

  const goToSolution = (index) => {
    setCurrentSolutionIndex(index);
  };

  const getUserAnswerForQuestion = (questionId) => {
    return userAnswers?.[questionId];
  };

  const isUserAnswerCorrect = (question, userAnswer) => {
    if (userAnswer === undefined || userAnswer === -1) return null; // Not answered or skipped

    // Handle different question types
    if (question.type === 'multipleChoice') {
      // For multiple choice, compare with multipleCorrectAns array
      const correctAnswers = question.multipleCorrectAns || [];
      if (Array.isArray(userAnswer)) {
        // User answer is array for multiple choice
        return JSON.stringify(userAnswer.sort()) === JSON.stringify(correctAnswers.sort());
      } else {
        // Single answer selected in multiple choice question
        return correctAnswers.length === 1 && correctAnswers.includes(userAnswer);
      }
    } else if (question.type === 'singleChoice') {
      // For single choice, compare with correctAnswerIndex
      return userAnswer === question.correctAnswerIndex;
    } else if (question.type === 'numeric') {
      // For numeric answers, compare with numericAns
      const userAnswerNum = parseFloat(userAnswer) || 0;
      const correctAnswerNum = parseFloat(question.numericAns) || 0;
      return userAnswerNum === correctAnswerNum;
    } else if (question.type === 'oneWord') {
      // For one word answers, compare with oneWordAns (case insensitive)
      const userAnswerStr = String(userAnswer || '').toLowerCase().trim();
      const correctAnswerStr = String(question.oneWordAns || '').toLowerCase().trim();
      return userAnswerStr === correctAnswerStr;
    } else {
      // Fallback for backward compatibility
      return userAnswer === question.correctAnswerIndex;
    }
  };

  const isOptionCorrect = (question, optionIndex) => {
    if (question.type === 'multipleChoice') {
      const correctAnswers = question.multipleCorrectAns || [];
      return correctAnswers.includes(optionIndex);
    } else if (question.type === 'singleChoice') {
      return optionIndex === question.correctAnswerIndex;
    } else {
      // For numeric and oneWord, options don't apply
      return false;
    }
  };

  const isOptionSelectedByUser = (question, optionIndex, userAnswer) => {
    if (userAnswer === undefined || userAnswer === -1) return false;

    if (question.type === 'multipleChoice') {
      if (Array.isArray(userAnswer)) {
        return userAnswer.includes(optionIndex);
      } else {
        return userAnswer === optionIndex;
      }
    } else if (question.type === 'singleChoice') {
      return userAnswer === optionIndex;
    } else {
      // For numeric and oneWord, options don't apply
      return false;
    }
  };

  const getCorrectAnswerDisplay = (question) => {
    if (question.type === 'multipleChoice') {
      const correctAnswers = question.multipleCorrectAns || [];
      if (correctAnswers.length === 0) return 'No correct answer';
      if (correctAnswers.length === 1) {
        return `Option ${String.fromCharCode(65 + correctAnswers[0])}`;
      }
      return correctAnswers
        .map(index => `Option ${String.fromCharCode(65 + index)}`)
        .join(', ');
    } else if (question.type === 'singleChoice') {
      return `Option ${String.fromCharCode(65 + question.correctAnswerIndex)}`;
    } else if (question.type === 'numeric') {
      return question.numericAns || 'No answer provided';
    } else if (question.type === 'oneWord') {
      return question.oneWordAns || 'No answer provided';
    } else {
      // Fallback for backward compatibility
      return `Option ${String.fromCharCode(65 + question.correctAnswerIndex)}`;
    }
  };

  const getUserAnswerDisplay = (question, userAnswer) => {
    if (userAnswer === undefined || userAnswer === -1) {
      return 'Not Answered';
    }

    if (question.type === 'multipleChoice') {
      if (Array.isArray(userAnswer)) {
        if (userAnswer.length === 0) return 'Not Answered';
        if (userAnswer.length === 1) {
          return `Option ${String.fromCharCode(65 + userAnswer[0])}`;
        }
        return userAnswer
          .map(index => `Option ${String.fromCharCode(65 + index)}`)
          .join(', ');
      } else {
        return `Option ${String.fromCharCode(65 + userAnswer)}`;
      }
    } else if (question.type === 'singleChoice') {
      return `Option ${String.fromCharCode(65 + userAnswer)}`;
    } else if (question.type === 'numeric') {
      return userAnswer.toString();
    } else if (question.type === 'oneWord') {
      return userAnswer.toString();
    } else {
      // Fallback for backward compatibility
      return `Option ${String.fromCharCode(65 + userAnswer)}`;
    }
  };

  const performanceData = [
    {
      label: 'Correct',
      value: testResults?.correct || 0,
      percentage: testResults?.totalQuestions > 0 ? ((testResults?.correct || 0) / testResults?.totalQuestions) * 100 : 0,
      color: 'bg-green-500',
      icon: CheckCircle,
      iconColor: 'text-green-500'
    },
    {
      label: 'Wrong',
      value: testResults?.wrong || 0,
      percentage: testResults?.totalQuestions > 0 ? ((testResults?.wrong || 0) / testResults?.totalQuestions) * 100 : 0,
      color: 'bg-red-500',
      icon: XCircle,
      iconColor: 'text-red-500'
    },
    {
      label: 'Skipped',
      value: testResults?.skipped || 0,
      percentage: testResults?.totalQuestions > 0 ? ((testResults?.skipped || 0) / testResults?.totalQuestions) * 100 : 0,
      color: 'bg-yellow-500',
      icon: Clock,
      iconColor: 'text-yellow-500'
    },
    {
      label: 'Not Attempted',
      value: testResults?.notAttempted || 0,
      percentage: testResults?.totalQuestions > 0 ? ((testResults?.notAttempted || 0) / testResults?.totalQuestions) * 100 : 0,
      color: 'bg-gray-500',
      icon: BookOpen,
      iconColor: 'text-gray-500'
    }
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your results...</p>
        </div>
      </div>
    );
  }

  // Show error state if no data available
  if (!testResults && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">No Results Available</h2>
          <p className="text-lg text-gray-600 mb-6">
            Unable to load quiz results. Please try again later.
          </p>
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Go to Home
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full flex items-center justify-center mb-3 sm:mb-4 ${testResults?.passed ? 'bg-green-100' : 'bg-red-100'
            }`}>
            {testResults?.passed ? (
              <Trophy className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
            ) : (
              <Target className="h-8 w-8 sm:h-10 sm:w-10 text-red-600" />
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {testResults?.passed ? 'Congratulations!' : 'Test Completed'}
          </h1>

          <p className="text-base sm:text-lg text-gray-600 px-4">
            {testResults?.passed
              ? 'You have successfully passed the test!'
              : 'Better luck next time. Keep practicing!'}
          </p>
        </div>

        {/* Comprehensive Test Results Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-8 mb-6 sm:mb-8">
          {/* Main Header */}
          <div className="text-center mb-8 sm:mb-10">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Target className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Test Performance Analysis</h2>
            <p className="text-sm sm:text-base text-gray-600 px-4">Complete overview of your overall and section-wise performance</p>
          </div>

          {/* Main Content Grid - Overall and Section-wise in same row */}
          <div className={`grid gap-8 sm:gap-10 ${testResults?.sectionWiseResults && Object.keys(testResults?.sectionWiseResults).length > 1
            ? 'grid-cols-1 xl:grid-cols-2'
            : 'grid-cols-1'
            }`}>

            {/* Overall Results Section */}
            <div className="space-y-6 sm:space-y-8">
              <div className={`grid gap-6 sm:gap-8 ${testResults?.sectionWiseResults && Object.keys(testResults?.sectionWiseResults).length > 1
                ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-1'
                : 'grid-cols-1 md:grid-cols-2'
                }`}>
                {/* Score Circle */}
                <div className="text-center">
                  <div className="relative w-36 h-36 sm:w-48 sm:h-48 mx-auto mb-4 sm:mb-6">
                    <svg className="w-36 h-36 sm:w-48 sm:h-48 transform -rotate-90" viewBox="0 0 100 100">
                      {/* Background circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-200"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${testResults?.percentage * 2.51} 251`}
                        className={testResults?.passed ? 'text-green-500' : 'text-red-500'}
                        strokeLinecap="round"
                      />
                    </svg>

                    {/* Center content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
                        {testResults?.percentage}%
                      </div>
                      <div className={`text-sm sm:text-lg font-semibold px-2 sm:px-3 py-1 rounded-full ${gradeInfo.bgColor} ${gradeInfo.color}`}>
                        Grade {gradeInfo.grade}
                      </div>
                    </div>
                  </div>

                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${testResults?.passed
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {testResults?.passed ? (
                      <>
                        <CheckCircle className="h-6 w-6 mr-2" />
                        PASSED
                      </>
                    ) : (
                      <>
                        <XCircle className="h-6 w-6 mr-2" />
                        FAILED
                      </>
                    )}
                  </div>
                </div>

                {/* Overall Statistics */}
                <div className="space-y-4 sm:space-y-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Overall Test Statistics</h3>

                  <div className={`grid gap-3 sm:gap-4 ${testResults?.sectionWiseResults && Object.keys(testResults?.sectionWiseResults).length > 1
                    ? 'grid-cols-1 sm:grid-cols-3 xl:grid-cols-1'
                    : 'grid-cols-1 sm:grid-cols-3'
                    }`}>
                    <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                      <div className="text-xl sm:text-2xl font-bold text-blue-600">{testResults?.totalQuestions}</div>
                      <div className="text-xs sm:text-sm text-blue-700">Total Questions</div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-3 sm:p-4">
                      <div className="text-xl sm:text-2xl font-bold text-green-600">{testResults?.attempted}</div>
                      <div className="text-xs sm:text-sm text-green-700">Attempted</div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-3 sm:p-4">
                      <div className="text-xl sm:text-2xl font-bold text-purple-600">{formatTime(testResults?.timeSpent)}</div>
                      <div className="text-xs sm:text-sm text-purple-700">Time Spent</div>
                    </div>
                  </div>

                  {/* Performance Breakdown */}
                  <div className="pt-3 sm:pt-4">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Performance Breakdown</h4>
                    <div className="space-y-3">
                      {performanceData.map((item, index) => {
                        const Icon = item.icon;
                        return (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Icon className={`h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 ${item.iconColor}`} />
                              <span className="text-sm sm:text-base text-gray-700 font-medium">{item.label}</span>
                            </div>
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <div className="w-16 sm:w-20 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${item.color}`}
                                  style={{ width: `${item?.percentage}%` }}
                                />
                              </div>
                              <span className="text-sm sm:text-base text-gray-900 font-semibold w-6 sm:w-8 text-right">{item.value}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section-wise Results */}
            {testResults?.sectionWiseResults && Object.keys(testResults?.sectionWiseResults).length > 1 && (
              <div className="space-y-6 sm:space-y-8">
                <div className="text-center xl:text-left">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Section-wise Performance</h3>
                  <p className="text-sm sm:text-base text-gray-600">Detailed performance breakdown by individual sections</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-4 sm:gap-6">
                  {Object.values(testResults?.sectionWiseResults).map((section, index) => {
                    const sectionGradeInfo = getGradeInfo(section?.percentage);

                    return (
                      <div key={section.sectionId} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                        {/* Section Header */}
                        <div className="text-center mb-4">
                          <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 truncate" title={section.sectionName}>
                            {section.sectionName}
                          </h4>
                          <div className="flex items-center justify-center space-x-2">
                            <div className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${sectionGradeInfo.bgColor} ${sectionGradeInfo.color}`}>
                              Grade {sectionGradeInfo.grade}
                            </div>
                            <span className="text-lg sm:text-xl font-bold text-gray-900">
                              {section?.percentage}%
                            </span>
                          </div>
                        </div>

                        {/* Section Stats */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Questions:</span>
                            <span className="font-semibold text-gray-900">{section?.totalQuestions}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Correct:</span>
                            <span className="font-semibold text-green-600">{section.correct}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Wrong:</span>
                            <span className="font-semibold text-red-600">{section.wrong}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Attempted:</span>
                            <span className="font-semibold text-blue-600">{section?.attempted}</span>
                          </div>

                          {/* Section Progress Bar */}
                          <div className="pt-2">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>Progress</span>
                              <span>{section?.attempted}/{section?.totalQuestions}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(section?.attempted / section?.totalQuestions) * 100}%` }}
                              />
                            </div>
                          </div>

                          {/* Section Marks */}
                          <div className="pt-2 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Marks Obtained:</span>
                              <span className="font-bold text-gray-900">
                                {section.totalMarksObtained}/{section?.totalPossibleMarks}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Marks %:</span>
                              <span className={`font-semibold ${section.marksPercentage >= 60 ? 'text-green-600' : 'text-red-600'}`}>
                                {section.marksPercentage}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Certificate Section */}
        {/* {testResults?.passed && (
          <div className="mt-6 sm:mt-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 sm:p-8 text-center text-white">
            <Trophy className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Certificate Earned!</h3>
            <p className="text-yellow-100 mb-4 sm:mb-6 text-sm sm:text-base px-4">
              Congratulations! You've earned a certificate for passing this test.
              Download your certificate to showcase your achievement.
            </p>
            <button className="bg-white text-orange-600 font-bold py-2 sm:py-3 px-6 sm:px-8 rounded-lg hover:bg-yellow-50 transition-colors duration-200 text-sm sm:text-base">
              <Download className="h-4 w-4 sm:h-5 sm:w-5 mr-2 inline" />
              Download Certificate
            </button>
          </div>
        )} */}

        {/* Action Buttons */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
          <button
            onClick={fetchSolutions}
            disabled={loadingSolutions}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 sm:px-8 rounded-lg transition-colors duration-200 flex items-center justify-center disabled:opacity-50 text-sm sm:text-base w-full sm:w-auto"
          >
            {loadingSolutions ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                <span className="hidden sm:inline">Loading Solutions...</span>
                <span className="sm:hidden">Loading...</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="hidden sm:inline">View Solutions/Review Answers</span>
                <span className="sm:hidden">View Solutions</span>
              </>
            )}
          </button>

          {/* {onRetakeTest && (
            <button
              onClick={onRetakeTest}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Retake Test
            </button>
          )} */}

          {onGoHome && (
            <button
              onClick={onGoHome}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 sm:px-8 rounded-lg transition-colors duration-200 text-sm sm:text-base w-full sm:w-auto"
            >
              Go to Home
            </button>
          )}
        </div>

        {/* Leaderboard Section */}
        {leaderboardData.length > 0 && (
          <div className="mt-8 sm:mt-12 bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Leaderboard</h2>
              <p className="text-sm sm:text-base text-gray-600 px-4">See how you performed compared to other participants</p>
            </div>

            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 sm:py-4 px-3 sm:px-6 font-semibold text-gray-900 text-sm sm:text-base">Rank</th>
                    <th className="text-left py-3 sm:py-4 px-3 sm:px-6 font-semibold text-gray-900 text-sm sm:text-base">Name</th>
                    <th className="text-center py-3 sm:py-4 px-3 sm:px-6 font-semibold text-gray-900 text-sm sm:text-base">Score</th>
                    <th className="text-center py-3 sm:py-4 px-3 sm:px-6 font-semibold text-gray-900 text-sm sm:text-base">Percentage</th>
                    <th className="text-center py-3 sm:py-4 px-3 sm:px-6 font-semibold text-gray-900 text-sm sm:text-base hidden sm:table-cell">Time Taken</th>
                    <th className="text-center py-3 sm:py-4 px-3 sm:px-6 font-semibold text-gray-900 text-sm sm:text-base">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData
                    .sort((a, b) => (b.obtainedMarks || 0) - (a.obtainedMarks || 0)) // Sort by marks descending
                    .map((participant, index) => {
                      const isCurrentUser = participant?.studentId === testResults?.studentId;
                      const rank = index + 1;
                      const percentage = Math.round(((participant.obtainedMarks || 0) / (testResults?.totalPossibleMarks || testResults?.totalQuestions || 10)) * 100);

                      return (
                        <tr
                          key={participant.id || index}
                          className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${isCurrentUser ? 'bg-blue-50 border-blue-200' : ''
                            }`}
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              {rank <= 3 && (
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                                  rank === 2 ? 'bg-gray-100 text-gray-800' :
                                    'bg-orange-100 text-orange-800'
                                  }`}>
                                  {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                                </div>
                              )}
                              <span className={`font-semibold ${isCurrentUser ? 'text-blue-900' : 'text-gray-900'}`}>
                                #{rank}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${isCurrentUser ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                {(participant.userName || 'Student').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className={`font-medium ${isCurrentUser ? 'text-blue-900' : 'text-gray-900'}`}>
                                  {participant.userName || 'Anonymous'}
                                  {isCurrentUser && (
                                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                      You
                                    </span>
                                  )}
                                </div>
                                {participant.contact && (
                                  <div className="text-sm text-gray-500">{participant.contact}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className={`font-bold text-lg ${isCurrentUser ? 'text-blue-900' : 'text-gray-900'}`}>
                              {participant.obtainedMarks || 0}
                            </span>
                            <span className="text-gray-500 text-sm">
                              /{testResults?.totalPossibleMarks || testResults?.totalQuestions || 10}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${percentage >= 80 ? 'bg-green-100 text-green-800' :
                              percentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                              {percentage}%
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className="text-gray-600">
                              {participant.duration ? formatTime(participant.duration / 1000) : 'N/A'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${percentage >= (testResults?.passingPercentage || 60)
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                              }`}>
                              {percentage >= (testResults?.passingPercentage || 60) ? 'Passed' : 'Failed'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {leaderboardData.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No leaderboard data available yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Solutions Modal - Full Page */}
        {showSolutionsModal && solutions.length > 0 && (
          <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-blue-600 text-white shadow-lg z-10">
              <div className="mx-auto px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg sm:text-2xl font-bold truncate">Solutions & Explanations</h3>
                    <p className="text-blue-100 text-sm sm:text-base">
                      {selectedSectionFilter === 'all'
                        ? `All ${solutions.length} questions with detailed solutions`
                        : `${solutions.filter(s => {
                          const sectionId = testResults?.sections?.find(sec => sec.name === selectedSectionFilter)?.id;
                          return s.sectionId === sectionId;
                        }).length} questions from ${selectedSectionFilter} section`
                      }
                    </p>
                  </div>
                  <button
                    onClick={closeSolutionsModal}
                    className="text-blue-100 hover:text-white transition-colors p-1 sm:p-2 rounded-lg hover:bg-blue-700 flex-shrink-0 ml-2"
                  >
                    <X className="h-6 w-6 sm:h-8 sm:w-8" />
                  </button>
                </div>

                {/* Section Filter */}
                {testResults?.sections && testResults?.sections.length > 1 && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <label className="text-blue-100 text-sm font-medium whitespace-nowrap">Filter by Section:</label>
                    <select
                      value={selectedSectionFilter}
                      onChange={(e) => setSelectedSectionFilter(e.target.value)}
                      className="px-3 py-2 bg-blue-700 border border-blue-500 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white focus:border-white min-w-0 flex-1 sm:flex-initial sm:min-w-[200px]"
                    >
                      <option value="all">All Sections</option>
                      {testResults?.sections.map(section => (
                        <option key={section.id} value={section.name}>
                          {section.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
              <div className="space-y-6 sm:space-y-8">
                {(() => {
                  // Filter solutions based on selected section
                  let filteredSolutions = solutions;
                  if (selectedSectionFilter !== 'all' && testResults?.sections) {
                    const sectionId = testResults?.sections.find(sec => sec.name === selectedSectionFilter)?.id;
                    filteredSolutions = solutions.filter(s => s.sectionId === sectionId);
                  }

                  return filteredSolutions.map((solution, index) => {
                    const userAnswer = getUserAnswerForQuestion(solution.id);
                    const isCorrect = isUserAnswerCorrect(solution, userAnswer);

                    return (
                      <div key={solution.id} className="bg-white border border-gray-200 rounded-lg sm:rounded-xl shadow-sm overflow-hidden">
                        {/* Question Header */}
                        <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                            <div className="flex flex-col">
                              <h4 className="text-lg sm:text-xl font-semibold text-gray-900">
                                Question {selectedSectionFilter === 'all' ? solutions.findIndex(s => s.id === solution.id) + 1 : index + 1}
                              </h4>
                              {solution.sectionName && (
                                <span className="text-sm text-gray-600 mt-1">
                                  Section: {solution.sectionName}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 sm:space-x-3">
                              {/* Question Status */}
                              {isCorrect === true && (
                                <span className="bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center">
                                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                  <span className="hidden sm:inline">Correct</span>
                                  <span className="sm:hidden">✓</span>
                                </span>
                              )}
                              {isCorrect === false && (
                                <span className="bg-red-100 text-red-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center">
                                  <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                  <span className="hidden sm:inline">Incorrect</span>
                                  <span className="sm:hidden">✗</span>
                                </span>
                              )}
                              {isCorrect === null && (
                                <span className="bg-gray-100 text-gray-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center">
                                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                  <span className="hidden sm:inline">Not Answered</span>
                                  <span className="sm:hidden">-</span>
                                </span>
                              )}

                              {/* Question Type */}
                              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${solution.type === 'multipleChoice'
                                ? 'bg-blue-100 text-blue-800'
                                : solution.type === 'numeric'
                                  ? 'bg-green-100 text-green-800'
                                  : solution.type === 'oneWord'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-orange-100 text-orange-800'
                                }`}>
                                <span className="hidden sm:inline">
                                  {solution.type === 'multipleChoice'
                                    ? 'Multiple Choice'
                                    : solution.type === 'numeric'
                                      ? 'Numeric Answer'
                                      : solution.type === 'oneWord'
                                        ? 'Text Answer'
                                        : 'Single Choice'}
                                </span>
                                <span className="sm:hidden">
                                  {solution.type === 'multipleChoice'
                                    ? 'Multi'
                                    : solution.type === 'numeric'
                                      ? 'Num'
                                      : solution.type === 'oneWord'
                                        ? 'Text'
                                        : 'Single'}
                                </span>
                              </span>

                              {/* Marks */}
                              <span className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                                +{solution.mark || 1}
                                <span className="hidden sm:inline"> Mark{(solution.mark || 1) > 1 ? 's' : ''}</span>
                              </span>

                              {(solution.negativeMark || 0) > 0 && (
                                <span className="bg-red-100 text-red-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                                  -{solution.negativeMark}
                                  <span className="hidden sm:inline"> Negative</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Question Content */}
                        <div className="px-4 sm:px-6 py-4 sm:py-6">
                          {/* Question Text */}
                          <div className="text-base sm:text-lg text-gray-900 mb-4 sm:mb-6 leading-relaxed">
                            <div dangerouslySetInnerHTML={{
                              __html: solution.parsedQuestion || solution.question
                            }} />
                          </div>

                          {/* Options or Input Display */}
                          <div className="space-y-3 mb-4 sm:mb-6">
                            {solution.type === 'numeric' ? (
                              // Numeric input display
                              <div className="p-3 sm:p-4 rounded-lg border-2 border-gray-200 bg-gray-50">
                                <div className="text-sm sm:text-base text-gray-700">
                                  <strong>Expected Answer Type:</strong> Numeric Input
                                </div>
                              </div>
                            ) : solution.type === 'oneWord' ? (
                              // Text input display
                              <div className="p-3 sm:p-4 rounded-lg border-2 border-gray-200 bg-gray-50">
                                <div className="text-sm sm:text-base text-gray-700">
                                  <strong>Expected Answer Type:</strong> Text Input
                                </div>
                              </div>
                            ) : (
                              // Choice-based options (multipleChoice and singleChoice)
                              (solution.parsedOptionList || solution.optionList || []).map((option, optionIndex) => {
                                const isCorrectOption = isOptionCorrect(solution, optionIndex);
                                const isUserSelected = isOptionSelectedByUser(solution, optionIndex, userAnswer);

                                let optionClass = 'border-gray-200 bg-white';

                                if (isCorrectOption && isUserSelected) {
                                  // User selected correct answer
                                  optionClass = 'border-green-500 bg-green-50';
                                } else if (isCorrectOption) {
                                  // Correct answer (not selected by user)
                                  optionClass = 'border-green-500 bg-green-50';
                                } else if (isUserSelected) {
                                  // User selected wrong answer
                                  optionClass = 'border-red-500 bg-red-50';
                                }
                                return (
                                  <div
                                    key={optionIndex}
                                    className={`p-3 sm:p-4 rounded-lg border-2 ${optionClass} transition-colors`}
                                  >
                                    <div className="flex items-start sm:items-center">
                                      <span className="font-semibold mr-2 sm:mr-3 text-gray-700 text-sm sm:text-base flex-shrink-0">
                                        {String.fromCharCode(65 + optionIndex)}.
                                      </span>
                                      <div className="flex-1 text-sm sm:text-base" dangerouslySetInnerHTML={{ __html: option }} />
                                      <div className="ml-2 sm:ml-4 flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                                        {isCorrectOption && isUserSelected && (
                                          <div className="flex items-center">
                                            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-1" />
                                            <span className="text-xs sm:text-sm font-medium text-green-700 hidden sm:inline">Your Correct Choice</span>
                                            <span className="text-xs font-medium text-green-700 sm:hidden">✓</span>
                                          </div>
                                        )}
                                        {isCorrectOption && !isUserSelected && (
                                          <div className="flex items-center">
                                            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-1" />
                                            <span className="text-xs sm:text-sm font-medium text-green-700 hidden sm:inline">Correct Answer</span>
                                            <span className="text-xs font-medium text-green-700 sm:hidden">✓</span>
                                          </div>
                                        )}
                                        {!isCorrectOption && isUserSelected && (
                                          <div className="flex items-center">
                                            <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 mr-1" />
                                            <span className="text-xs sm:text-sm font-medium text-red-700 hidden sm:inline">Your Wrong Choice</span>
                                            <span className="text-xs font-medium text-red-700 sm:hidden">✗</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>

                          {/* User Answer Summary */}
                          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                              <div className="flex flex-col space-y-1 sm:space-y-2">
                                <span className="text-xs sm:text-sm font-medium text-gray-600">Your Answer</span>
                                <span className={`text-sm sm:text-base font-semibold ${userAnswer !== undefined && userAnswer !== -1
                                  ? 'text-gray-900'
                                  : 'text-gray-500'
                                  }`}>
                                  {getUserAnswerDisplay(solution, userAnswer)}
                                </span>
                              </div>
                              <div className="flex flex-col space-y-1 sm:space-y-2">
                                <span className="text-xs sm:text-sm font-medium text-gray-600">Correct Answer</span>
                                <span className="text-sm sm:text-base font-semibold text-green-700">
                                  {getCorrectAnswerDisplay(solution)}
                                </span>
                              </div>
                            </div>

                            {/* Performance indicator */}
                            <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                                <span className="text-xs sm:text-sm font-medium text-gray-600">Result:</span>
                                <div className="flex items-center">
                                  {isCorrect === true && (
                                    <>
                                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-1" />
                                      <span className="text-xs sm:text-sm font-semibold text-green-700">
                                        +{solution.mark || 1} Mark{(solution.mark || 1) > 1 ? 's' : ''}
                                      </span>
                                    </>
                                  )}
                                  {isCorrect === false && (
                                    <>
                                      <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 mr-1" />
                                      <span className="text-xs sm:text-sm font-semibold text-red-700">
                                        -{solution.negativeMark || 0} Mark{(solution.negativeMark || 0) !== 1 ? 's' : ''}
                                      </span>
                                    </>
                                  )}
                                  {isCorrect === null && (
                                    <>
                                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mr-1" />
                                      <span className="text-xs sm:text-sm font-semibold text-gray-500">
                                        <span className="hidden sm:inline">0 Marks (Not Attempted)</span>
                                        <span className="sm:hidden">Not Attempted</span>
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Explanation */}
                          {solution.explaination && (
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 sm:p-6 rounded-r-lg">
                              <h5 className="font-semibold text-blue-900 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                <span className="hidden sm:inline">Detailed Explanation:</span>
                                <span className="sm:hidden">Explanation:</span>
                              </h5>
                              <div
                                className="text-blue-800 leading-relaxed text-sm sm:text-base"
                                dangerouslySetInnerHTML={{
                                  __html: solution.explaination
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Footer */}
              <div className="mt-8 sm:mt-12 text-center py-6 sm:py-8 border-t border-gray-200">
                <p className="text-gray-600 mb-4 text-sm sm:text-base px-4">
                  {selectedSectionFilter === 'all'
                    ? `You've reviewed all ${solutions.length} questions and their solutions.`
                    : `You've reviewed all questions from the ${selectedSectionFilter} section.`
                  }
                </p>
                <button
                  onClick={closeSolutionsModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 sm:px-8 rounded-lg transition-colors duration-200 text-sm sm:text-base w-full sm:w-auto max-w-xs"
                >
                  Back to Results
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Result;