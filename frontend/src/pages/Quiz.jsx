import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosInstance from '../utils/axios';
import { FiCheckCircle, FiXCircle, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Quiz = () => {
  const { id, quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      const response = await axiosInstance.get(`/quizzes/${quizId}`);
      setQuiz(response.data.data);
      setSubmitted(response.data.data.isSubmitted);
      if (response.data.data.submission) {
        setSubmission(response.data.data.submission);
        // Pre-fill answers for review
        const reviewAnswers = {};
        response.data.data.questions.forEach((q, index) => {
          const answer = response.data.data.submission.quizAnswers.find(
            (a) => a.questionIndex === index
          );
          if (answer) {
            reviewAnswers[index] = answer.selectedAnswer;
          }
        });
        setAnswers(reviewAnswers);
      }
    } catch (error) {
      toast.error('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex, answerIndex) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionIndex]: answerIndex }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== quiz.questions.length) {
      toast.error('Please answer all questions');
      return;
    }

    try {
      const answerArray = Object.keys(answers).map((key) => ({
        questionIndex: parseInt(key),
        selectedAnswer: answers[key],
      }));

      const response = await axiosInstance.post(`/quizzes/${quizId}/submit`, {
        answers: answerArray,
      });

      setSubmission(response.data.data);
      setSubmitted(true);
      toast.success('Quiz submitted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit quiz');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Quiz not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link
        to={`/courses/${id}`}
        className="text-primary-600 hover:text-primary-700 mb-6 inline-flex items-center space-x-2"
      >
        <FiArrowLeft />
        <span>Back to Course</span>
      </Link>

      <div className="card">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{quiz.title}</h1>
        {quiz.description && (
          <p className="text-gray-600 dark:text-gray-400 mb-6">{quiz.description}</p>
        )}

        {submitted && submission && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your Score</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {submission.quizScore} / {quiz.totalPoints} ({submission.quizPercentage.toFixed(1)}%)
                </p>
              </div>
              <div>
                {submission.quizPassed ? (
                  <div className="flex items-center space-x-2 text-green-600">
                    <FiCheckCircle className="w-6 h-6" />
                    <span className="font-semibold">Passed</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-red-600">
                    <FiXCircle className="w-6 h-6" />
                    <span className="font-semibold">Failed</span>
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Passing Score: {quiz.passingScore}%
            </p>
          </div>
        )}

        <div className="space-y-6">
          {quiz.questions.map((question, qIndex) => {
            const userAnswer = answers[qIndex];
            const submissionAnswer = submitted && submission
              ? submission.quizAnswers.find((a) => a.questionIndex === qIndex)
              : null;
            const isCorrect = submissionAnswer?.isCorrect;

            return (
              <div key={qIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Question {qIndex + 1}
                  </h3>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {question.points} {question.points === 1 ? 'point' : 'points'}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4">{question.question}</p>
                <div className="space-y-2">
                  {question.options.map((option, oIndex) => {
                    const isSelected = userAnswer === oIndex;
                    const isCorrectAnswer = oIndex === question.correctAnswer;

                    return (
                      <label
                        key={oIndex}
                        className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                          submitted
                            ? isCorrectAnswer
                              ? 'border-green-500 bg-green-50 dark:bg-green-900'
                              : isSelected && !isCorrect
                              ? 'border-red-500 bg-red-50 dark:bg-red-900'
                              : 'border-gray-200 dark:border-gray-700'
                            : isSelected
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900'
                            : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${qIndex}`}
                          value={oIndex}
                          checked={isSelected}
                          onChange={() => handleAnswerChange(qIndex, oIndex)}
                          disabled={submitted}
                          className="w-4 h-4 text-primary-600"
                        />
                        <span className="flex-1 text-gray-900 dark:text-white">{option}</span>
                        {submitted && isCorrectAnswer && (
                          <FiCheckCircle className="w-5 h-5 text-green-600" />
                        )}
                        {submitted && isSelected && !isCorrect && (
                          <FiXCircle className="w-5 h-5 text-red-600" />
                        )}
                      </label>
                    );
                  })}
                </div>
                {submitted && submissionAnswer && (
                  <div className="mt-4 text-sm">
                    {isCorrect ? (
                      <p className="text-green-600">Correct! You earned {submissionAnswer.points} points.</p>
                    ) : (
                      <p className="text-red-600">
                        Incorrect. The correct answer is: {question.options[question.correctAnswer]}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!submitted && (
          <div className="mt-8">
            <button onClick={handleSubmit} className="btn-primary w-full">
              Submit Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;

