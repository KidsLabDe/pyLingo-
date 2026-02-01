'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

// Monaco Editor dynamisch laden (SSR deaktiviert)
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div className="h-64 bg-py-gray-800 rounded-xl animate-pulse" />,
});

interface Exercise {
  id: string;
  order: number;
  type: string;
  title: string;
  instructions: string;
  starterCode?: string;
  hints: string[];
  options?: string[] | { left: string[]; right: string[]; correct: number[][] };
  xpReward: number;
}

interface Lesson {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: string;
  xpReward: number;
  module: {
    title: string;
    icon: string;
    color: string;
  };
  exercises: Exercise[];
  progress: {
    completed: boolean;
    score: number;
    exercisesDone: string[];
  } | null;
}

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pyodide, setPyodide] = useState<unknown>(null);
  const [pyodideLoading, setPyodideLoading] = useState(false);

  // Exercise state
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [fillBlankAnswer, setFillBlankAnswer] = useState('');
  const [matchSelections, setMatchSelections] = useState<Record<number, number>>({});
  const [selectedLeftIndex, setSelectedLeftIndex] = useState<number | null>(null);
  const [shuffledRight, setShuffledRight] = useState<{ items: string[]; indexMap: number[] }>({ items: [], indexMap: [] });
  const [showHint, setShowHint] = useState(0);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string; xp: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [totalXpEarned, setTotalXpEarned] = useState(0);

  useEffect(() => {
    fetchLesson();
  }, [slug]);

  useEffect(() => {
    if (lesson?.exercises[currentExerciseIndex]) {
      const exercise = lesson.exercises[currentExerciseIndex];
      setCode(exercise.starterCode || '');
      setOutput('');
      setSelectedAnswer(null);
      setFillBlankAnswer('');
      setMatchSelections({});
      setSelectedLeftIndex(null);
      setShowHint(0);
      setFeedback(null);

      // Rechte Seite mischen für Match-Übungen
      if (exercise.type === 'match' && exercise.options && typeof exercise.options === 'object' && 'right' in exercise.options) {
        const opts = exercise.options as { left: string[]; right: string[]; correct: number[][] };
        // Erstelle Index-Array und mische es
        const indices = opts.right.map((_, i) => i);
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        // Gemischte Items und Mapping speichern
        setShuffledRight({
          items: indices.map(i => opts.right[i]),
          indexMap: indices, // indexMap[displayIndex] = originalIndex
        });
      }
    }
  }, [currentExerciseIndex, lesson]);

  const fetchLesson = async () => {
    try {
      const res = await fetch(`/api/lessons/${slug}`);
      if (!res.ok) {
        router.push('/learn');
        return;
      }
      const data = await res.json();
      setLesson(data);

      // Finde erste unerledigte Übung
      if (data.progress?.exercisesDone) {
        const firstUndone = data.exercises.findIndex(
          (e: Exercise) => !data.progress.exercisesDone.includes(e.id)
        );
        if (firstUndone > 0) {
          setCurrentExerciseIndex(firstUndone);
        }
      }
    } catch {
      router.push('/learn');
    } finally {
      setLoading(false);
    }
  };

  // Pyodide laden
  const loadPyodide = useCallback(async () => {
    if (pyodide || pyodideLoading) return pyodide;

    setPyodideLoading(true);
    try {
      // @ts-expect-error - Pyodide wird global geladen
      const loadedPyodide = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/',
      });
      setPyodide(loadedPyodide);
      return loadedPyodide;
    } catch (error) {
      console.error('Pyodide laden fehlgeschlagen:', error);
      setOutput('Fehler: Python konnte nicht geladen werden.');
      return null;
    } finally {
      setPyodideLoading(false);
    }
  }, [pyodide, pyodideLoading]);

  // Python Code ausführen
  const runCode = async () => {
    setOutput('Lädt Python...');

    let py = pyodide;
    if (!py) {
      py = await loadPyodide();
    }

    if (!py) {
      setOutput('Fehler: Python konnte nicht geladen werden.');
      return;
    }

    try {
      // stdout umleiten
      // @ts-expect-error - Pyodide API
      py.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
      `);

      // Code ausführen
      // @ts-expect-error - Pyodide API
      await py.runPythonAsync(code);

      // Output holen
      // @ts-expect-error - Pyodide API
      const stdout = py.runPython('sys.stdout.getvalue()');
      // @ts-expect-error - Pyodide API
      const stderr = py.runPython('sys.stderr.getvalue()');

      const result = stdout + (stderr ? `\nFehler: ${stderr}` : '');
      setOutput(result || '(Keine Ausgabe)');
    } catch (error) {
      setOutput(`Fehler: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Antwort überprüfen
  const checkAnswer = async () => {
    if (!lesson) return;

    const exercise = lesson.exercises[currentExerciseIndex];
    setSubmitting(true);

    try {
      let answer;
      let codeData;

      switch (exercise.type) {
        case 'multiple_choice':
          answer = selectedAnswer;
          break;
        case 'fill_blank':
          answer = fillBlankAnswer;
          break;
        case 'code':
          codeData = { code, output, executed: output !== '' };
          break;
        case 'match':
          // Prüfe ob alle Zuordnungen korrekt sind
          const opts = exercise.options as { left: string[]; right: string[]; correct: number[][] };
          const allCorrect = opts.correct.every(([leftIdx, rightIdx]) =>
            matchSelections[leftIdx] === rightIdx
          );
          answer = { correct: allCorrect, selections: matchSelections };
          break;
        default:
          answer = selectedAnswer;
      }

      const res = await fetch(`/api/lessons/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId: exercise.id,
          answer,
          code: codeData,
        }),
      });

      const result = await res.json();

      setFeedback({
        correct: result.correct,
        message: result.feedback,
        xp: result.xpAwarded,
      });

      if (result.xpAwarded > 0) {
        setTotalXpEarned((prev) => prev + result.xpAwarded);
      }
    } catch {
      setFeedback({
        correct: false,
        message: 'Ein Fehler ist aufgetreten.',
        xp: 0,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Nächste Übung
  const nextExercise = () => {
    if (!lesson) return;

    if (currentExerciseIndex < lesson.exercises.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
    } else {
      // Lektion abgeschlossen
      router.push('/learn');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📖</div>
          <p className="text-py-gray-400">Lade Lektion...</p>
        </div>
      </div>
    );
  }

  if (!lesson) return null;

  const exercise = lesson.exercises[currentExerciseIndex];
  const progress = ((currentExerciseIndex + 1) / lesson.exercises.length) * 100;
  const isLastExercise = currentExerciseIndex === lesson.exercises.length - 1;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Pyodide Script */}
      <script src="https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js" async />

      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/learn')}
          className="text-py-gray-400 hover:text-white mb-4 flex items-center gap-2"
        >
          ← Zurück
        </button>

        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{lesson.module.icon}</span>
          <div>
            <p className="text-py-gray-400 text-sm">{lesson.module.title}</p>
            <h1 className="text-xl font-bold text-white">{lesson.title}</h1>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-4">
          <div className="flex-1 progress-bar">
            <motion.div
              className="progress-bar-fill"
              style={{ background: lesson.module.color }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm text-py-gray-400">
            {currentExerciseIndex + 1}/{lesson.exercises.length}
          </span>
        </div>

        {/* XP Earned */}
        {totalXpEarned > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-2 text-py-yellow-400 text-sm font-semibold"
          >
            +{totalXpEarned} XP verdient! ⭐
          </motion.div>
        )}
      </div>

      {/* Exercise Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={exercise.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="card"
        >
          {/* Exercise Title */}
          <h2 className="text-lg font-bold text-white mb-4">
            {exercise.title}
          </h2>

          {/* Instructions */}
          <div
            className="text-py-gray-300 mb-6 prose prose-invert prose-sm max-w-none"
            dangerouslySetInnerHTML={{
              __html: exercise.instructions
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/`([^`]+)`/g, '<code class="bg-py-gray-700 px-1 rounded">$1</code>')
                .replace(/```python\n([\s\S]*?)```/g, '<pre class="bg-py-gray-800 p-3 rounded-lg overflow-x-auto"><code>$1</code></pre>')
                .replace(/\n/g, '<br>'),
            }}
          />

          {/* Exercise Type Components */}
          {exercise.type === 'multiple_choice' && (
            <div className="space-y-3">
              {(exercise.options as string[])?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !feedback && setSelectedAnswer(option)}
                  disabled={!!feedback}
                  className={`
                    w-full text-left p-4 rounded-xl border-2 transition-all
                    ${selectedAnswer === option
                      ? 'border-py-green-500 bg-py-green-500/20'
                      : 'border-py-gray-600 hover:border-py-gray-500 bg-py-gray-800'
                    }
                    ${feedback && selectedAnswer === option
                      ? feedback.correct
                        ? 'border-py-green-500 bg-py-green-500/20'
                        : 'border-py-red-400 bg-py-red-400/20'
                      : ''
                    }
                  `}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {exercise.type === 'fill_blank' && (
            <div className="space-y-4">
              <div className="bg-py-gray-800 p-4 rounded-xl font-mono">
                {exercise.starterCode?.split('___').map((part, index, arr) => (
                  <span key={index}>
                    {part}
                    {index < arr.length - 1 && (
                      <input
                        type="text"
                        value={fillBlankAnswer}
                        onChange={(e) => setFillBlankAnswer(e.target.value)}
                        disabled={!!feedback}
                        className="bg-py-gray-700 border-b-2 border-py-green-500 px-2 py-1 text-white focus:outline-none w-24 text-center"
                        placeholder="..."
                      />
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {exercise.type === 'match' && exercise.options && typeof exercise.options === 'object' && 'left' in exercise.options && (
            <div className="space-y-4">
              <p className="text-py-gray-400 text-sm mb-4">
                Klicke links auf einen Begriff, dann rechts auf die passende Antwort.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {/* Linke Seite */}
                <div className="space-y-2">
                  {(exercise.options as { left: string[]; right: string[]; correct: number[][] }).left.map((item, index) => {
                    const isSelected = selectedLeftIndex === index;
                    const isMatched = matchSelections[index] !== undefined;
                    return (
                      <button
                        key={index}
                        onClick={() => !feedback && !isMatched && setSelectedLeftIndex(index)}
                        disabled={!!feedback || isMatched}
                        className={`
                          w-full p-3 rounded-xl border-2 transition-all text-left font-mono text-sm
                          ${isMatched
                            ? 'border-py-green-500 bg-py-green-500/20 opacity-60'
                            : isSelected
                            ? 'border-py-blue-400 bg-py-blue-400/20'
                            : 'border-py-gray-600 hover:border-py-gray-500 bg-py-gray-800'
                          }
                        `}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>

                {/* Rechte Seite (gemischt) */}
                <div className="space-y-2">
                  {shuffledRight.items.map((item, displayIndex) => {
                    const originalIndex = shuffledRight.indexMap[displayIndex];
                    const isMatched = Object.values(matchSelections).includes(originalIndex);
                    return (
                      <button
                        key={displayIndex}
                        onClick={() => {
                          if (!feedback && selectedLeftIndex !== null && !isMatched) {
                            setMatchSelections(prev => ({ ...prev, [selectedLeftIndex]: originalIndex }));
                            setSelectedLeftIndex(null);
                          }
                        }}
                        disabled={!!feedback || isMatched || selectedLeftIndex === null}
                        className={`
                          w-full p-3 rounded-xl border-2 transition-all text-left text-sm
                          ${isMatched
                            ? 'border-py-green-500 bg-py-green-500/20 opacity-60'
                            : selectedLeftIndex !== null
                            ? 'border-py-gray-500 hover:border-py-blue-400 bg-py-gray-800'
                            : 'border-py-gray-600 bg-py-gray-800 opacity-50'
                          }
                        `}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Verbindungen anzeigen */}
              {Object.keys(matchSelections).length > 0 && (
                <div className="mt-4 p-3 bg-py-gray-800 rounded-xl">
                  <p className="text-py-gray-400 text-xs mb-2">Deine Zuordnungen:</p>
                  {Object.entries(matchSelections).map(([leftIdx, rightIdx]) => {
                    const opts = exercise.options as { left: string[]; right: string[] };
                    return (
                      <div key={leftIdx} className="flex items-center gap-2 text-sm text-white">
                        <span className="font-mono">{opts.left[parseInt(leftIdx)]}</span>
                        <span className="text-py-green-400">→</span>
                        <span>{opts.right[rightIdx]}</span>
                        {!feedback && (
                          <button
                            onClick={() => setMatchSelections(prev => {
                              const newSelections = { ...prev };
                              delete newSelections[parseInt(leftIdx)];
                              return newSelections;
                            })}
                            className="text-py-red-400 hover:text-py-red-300 ml-2"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {exercise.type === 'code' && (
            <div className="space-y-4">
              {/* Code Editor */}
              <div className="rounded-xl overflow-hidden border border-py-gray-600">
                <MonacoEditor
                  height="200px"
                  language="python"
                  theme="vs-dark"
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 4,
                  }}
                />
              </div>

              {/* Run Button */}
              <button
                onClick={runCode}
                disabled={pyodideLoading}
                className="btn-secondary flex items-center gap-2"
              >
                {pyodideLoading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Python lädt...
                  </>
                ) : (
                  <>
                    <span>▶️</span>
                    Code ausführen
                  </>
                )}
              </button>

              {/* Output */}
              {output && (
                <div className="bg-py-gray-900 rounded-xl p-4 font-mono text-sm">
                  <p className="text-py-gray-400 text-xs mb-2">Ausgabe:</p>
                  <pre className="text-white whitespace-pre-wrap">{output}</pre>
                </div>
              )}
            </div>
          )}

          {/* Hints */}
          {exercise.hints.length > 0 && !feedback && (
            <div className="mt-6">
              <button
                onClick={() => setShowHint((prev) => Math.min(prev + 1, exercise.hints.length))}
                disabled={showHint >= exercise.hints.length}
                className="text-py-blue-400 text-sm hover:underline disabled:opacity-50"
              >
                💡 Hinweis anzeigen ({showHint}/{exercise.hints.length})
              </button>

              {showHint > 0 && (
                <div className="mt-3 space-y-2">
                  {exercise.hints.slice(0, showHint).map((hint, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-py-blue-400/10 border border-py-blue-400/30 rounded-xl p-3 text-sm text-py-blue-400"
                    >
                      💡 {hint}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`
                mt-6 p-4 rounded-xl border
                ${feedback.correct
                  ? 'bg-py-green-500/20 border-py-green-500 text-py-green-400'
                  : 'bg-py-red-400/20 border-py-red-400 text-py-red-400'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">
                  {feedback.correct ? '🎉' : '😅'}
                </span>
                <div>
                  <p className="font-bold">{feedback.correct ? 'Richtig!' : 'Fast!'}</p>
                  <p className="text-sm opacity-80">{feedback.message}</p>
                  {feedback.xp > 0 && (
                    <p className="text-py-yellow-400 font-semibold mt-1">
                      +{feedback.xp} XP! ⭐
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex justify-between">
            <div />

            {!feedback ? (
              <button
                onClick={checkAnswer}
                disabled={
                  submitting ||
                  (exercise.type === 'multiple_choice' && !selectedAnswer) ||
                  (exercise.type === 'fill_blank' && !fillBlankAnswer) ||
                  (exercise.type === 'code' && !output) ||
                  (exercise.type === 'match' && exercise.options && typeof exercise.options === 'object' && 'left' in exercise.options &&
                    Object.keys(matchSelections).length !== (exercise.options as { left: string[] }).left.length)
                }
                className="btn-primary disabled:opacity-50"
              >
                {submitting ? 'Prüfe...' : 'Überprüfen'}
              </button>
            ) : (
              <button
                onClick={nextExercise}
                className="btn-primary"
              >
                {isLastExercise ? 'Lektion abschließen 🎉' : 'Weiter →'}
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
