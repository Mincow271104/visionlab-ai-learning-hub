import { useId, useState } from 'react';
import { saveQuizScore } from '../../utils/progress';

export interface KnowledgeQuestion {
  readonly question: string;
  readonly options: readonly string[];
  readonly correctIndex: number;
  readonly explanation: string;
}

interface Props {
  readonly lessonId: string;
  readonly questions: readonly KnowledgeQuestion[];
}

export default function KnowledgeCheck({ lessonId, questions }: Props) {
  const baseId = useId();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Record<number, boolean>>({});
  const [showSummary, setShowSummary] = useState(false);
  const [storageWarning, setStorageWarning] = useState(false);

  if (questions.length === 0) {
    return null;
  }

  const currentQuestion = questions[currentIndex];
  const selectedOption = selectedOptions[currentIndex];
  const isSubmitted = Boolean(submittedQuestions[currentIndex]);
  const isCorrect =
    isSubmitted && selectedOption === currentQuestion.correctIndex;

  const computeScore = (
    selections: Record<number, number>,
    submitted: Record<number, boolean>
  ): number =>
    questions.reduce((total, question, idx) => {
      if (submitted[idx] && selections[idx] === question.correctIndex) {
        return total + 1;
      }
      return total;
    }, 0);

  const handleSelect = (optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedOptions((prev) => ({
      ...prev,
      [currentIndex]: optionIndex,
    }));
  };

  const handleSubmit = () => {
    if (selectedOption === undefined) return;
    const nextSubmitted = {
      ...submittedQuestions,
      [currentIndex]: true,
    };
    setSubmittedQuestions(nextSubmitted);

    const allSubmitted = questions.every((_, idx) => Boolean(nextSubmitted[idx]));
    if (allSubmitted) {
      const score = computeScore(selectedOptions, nextSubmitted);
      const { persisted } = saveQuizScore(lessonId, score, questions.length);
      setStorageWarning(!persisted);
    }
  };

  const handleRetryQuestion = () => {
    setSubmittedQuestions((prev) => {
      const next = { ...prev };
      delete next[currentIndex];
      return next;
    });
    setSelectedOptions((prev) => {
      const next = { ...prev };
      delete next[currentIndex];
      return next;
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }
    const score = computeScore(selectedOptions, submittedQuestions);
    const { persisted } = saveQuizScore(lessonId, score, questions.length);
    setStorageWarning(!persisted);
    setShowSummary(true);
  };

  const handleResetQuiz = () => {
    setCurrentIndex(0);
    setSelectedOptions({});
    setSubmittedQuestions({});
    setShowSummary(false);
    setStorageWarning(false);
  };

  const finalScore = computeScore(selectedOptions, submittedQuestions);

  return (
    <section
      className="vl-widget"
      aria-labelledby={`${baseId}-heading`}
    >
      <div className="vl-widget__header">
        <div>
          <p className="vl-widget__eyebrow">Knowledge Check</p>
          <h3 id={`${baseId}-heading`} className="vl-widget__title">
            Check your understanding
          </h3>
          <p className="vl-widget__goal">
            Answer one question at a time and submit to see the explanation.
            Scores are saved locally in your browser.
          </p>
        </div>
        <span className="vl-badge vl-badge--accent">
          {questions.length} questions
        </span>
      </div>

      {showSummary ? (
        <div>
          <div
            className="vl-quiz__feedback vl-quiz__feedback--correct"
            role="status"
          >
            <p className="vl-quiz__feedback-title">
              Quiz complete: {finalScore} / {questions.length} correct (
              {Math.round((finalScore / questions.length) * 100)}%)
            </p>
            <p>
              {finalScore === questions.length
                ? 'Great work—you answered every check question accurately.'
                : 'Review any missed concepts above or retake the check whenever you are ready.'}
            </p>
          </div>

          {storageWarning && (
            <p className="vl-notice" role="status">
              Browser local storage is unavailable or blocked, so your quiz
              score could not be saved beyond this session.
            </p>
          )}

          <div className="vl-btn-row" style={{ marginTop: '1rem' }}>
            <button
              type="button"
              className="vl-btn vl-btn--primary"
              onClick={handleResetQuiz}
            >
              Retake Knowledge Check
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="vl-quiz__progress">
            <span>
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span>
              Answered:{' '}
              {Object.keys(submittedQuestions).length}/{questions.length}
            </span>
          </div>

          <fieldset className="vl-quiz__options">
            <legend className="vl-quiz__question">
              {currentQuestion.question}
            </legend>

            {currentQuestion.options.map((optionText, optionIdx) => {
              const optionId = `${baseId}-q${currentIndex}-opt${optionIdx}`;
              const isSelected = selectedOption === optionIdx;
              const isRightOption =
                isSubmitted && optionIdx === currentQuestion.correctIndex;
              const isWrongSelection =
                isSubmitted && isSelected && !isRightOption;

              let optionClass = 'vl-quiz__option';
              if (isRightOption) {
                optionClass += ' vl-quiz__option--correct';
              } else if (isWrongSelection) {
                optionClass += ' vl-quiz__option--incorrect';
              } else if (isSelected) {
                optionClass += ' vl-quiz__option--selected';
              }

              return (
                <label
                  key={optionId}
                  htmlFor={optionId}
                  className={optionClass}
                >
                  <input
                    id={optionId}
                    type="radio"
                    name={`${baseId}-q${currentIndex}`}
                    checked={isSelected}
                    disabled={isSubmitted}
                    onChange={() => handleSelect(optionIdx)}
                  />
                  <span>
                    {optionText}
                    {isRightOption && (
                      <strong className="vl-badge vl-badge--teal" style={{ marginLeft: '0.5rem' }}>
                        ✓ Correct answer
                      </strong>
                    )}
                    {isWrongSelection && (
                      <strong className="vl-badge vl-badge--amber" style={{ marginLeft: '0.5rem' }}>
                        ✗ Selected
                      </strong>
                    )}
                  </span>
                </label>
              );
            })}
          </fieldset>

          {isSubmitted && (
            <div
              className={`vl-quiz__feedback ${
                isCorrect
                  ? 'vl-quiz__feedback--correct'
                  : 'vl-quiz__feedback--incorrect'
              }`}
              role="status"
            >
              <p className="vl-quiz__feedback-title">
                {isCorrect ? '✓ Correct' : '✗ Not quite'}
              </p>
              <p>{currentQuestion.explanation}</p>
            </div>
          )}

          <div className="vl-btn-row">
            {!isSubmitted ? (
              <button
                type="button"
                className="vl-btn vl-btn--primary"
                disabled={selectedOption === undefined}
                onClick={handleSubmit}
              >
                Submit Answer
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="vl-btn vl-btn--primary"
                  onClick={handleNext}
                >
                  {currentIndex < questions.length - 1
                    ? 'Next Question'
                    : 'View Final Score'}
                </button>
                <button
                  type="button"
                  className="vl-btn"
                  onClick={handleRetryQuestion}
                >
                  Retry Question
                </button>
              </>
            )}

            {currentIndex > 0 && (
              <button
                type="button"
                className="vl-btn"
                onClick={() => setCurrentIndex((prev) => prev - 1)}
              >
                Previous Question
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
