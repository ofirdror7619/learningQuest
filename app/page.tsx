"use client";

import Image from "next/image";
import { useRef, useState, useEffect, type CSSProperties } from "react";
import mathQuestions from "@/data/math-questions-he.json";
import readingQuestions from "@/data/reading-questions-he.json";
import { ORDERED_STORE_ITEMS } from "@/data/item-prices";
import { getPlayerState } from "@/data/player-states";
import { getQuestionPointsForLevel } from "@/data/question-points";

type Subject = "math" | "reading";

type Question = {
  difficulty: number;
  prompt: string;
  choices: string[];
  correctIndex: number;
};

type SubjectStats = {
  correct: number;
  answered: number;
};

type StoreHotspot = {
  left: string;
  top: string;
  width: string;
  height: string;
};

type StoreItem = {
  imageSrc: string;
  price: number;
};

type EquippedItemPlacement = {
  left: string;
  top: string;
  width: string;
  rotate?: number;
  zIndex?: number;
};

type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (state: AchievementState) => boolean;
};

type AchievementState = {
  score: number;
  correctCount: number;
  playerLevel: number;
  inventoryItems: string[];
  subjectStats: Record<Subject, SubjectStats>;
};

const KID_BACKGROUND_SRC = "/kid/background.png";
const STORE_IMAGE_SRC = "/empty-store-new-2.png";

const STORE_HOTSPOTS: StoreHotspot[] = [
  { left: "10%", top: "24%", width: "13%", height: "17%" },
  { left: "30%", top: "24%", width: "13%", height: "17%" },
  { left: "50%", top: "24%", width: "13%", height: "17%" },
  { left: "70%", top: "24%", width: "13%", height: "17%" },
  { left: "20%", top: "62%", width: "13%", height: "17%" },
  { left: "40%", top: "62%", width: "13%", height: "17%" },
  { left: "60%", top: "62%", width: "13%", height: "17%" },
];

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-correct",
    name: "🎯 תשובה ראשונה",
    description: "תשובה נכונה ראשונה",
    icon: "🎯",
    condition: (state) => state.correctCount >= 1,
  },
  {
    id: "century",
    name: "💯 75 תשובות נכונות",
    description: "ענו נכון על 75 שאלות",
    icon: "💯",
    condition: (state) => state.correctCount >= 75,
  },
  {
    id: "thousand-points",
    name: "⭐ אלף נקודות",
    description: "1000 נקודות או יותר",
    icon: "⭐",
    condition: (state) => state.score >= 1000,
  },
  {
    id: "math-master",
    name: "🔢 מתמטיקאי טוב",
    description: "50 תשובות נכונות בחשבון",
    icon: "🔢",
    condition: (state) => state.subjectStats.math.correct >= 50,
  },
  {
    id: "reading-pro",
    name: "📖 קורא טוב",
    description: "50 תשובות נכונות בקריאה",
    icon: "📖",
    condition: (state) => state.subjectStats.reading.correct >= 50,
  },
  {
    id: "level-five",
    name: "👑 מפקד הכוכבים",
    description: "הגיע לרמה 5",
    icon: "👑",
    condition: (state) => state.playerLevel === 5,
  },
  {
    id: "collector",
    name: "🎁 אספן",
    description: "רכש 5 פריטים או יותר",
    icon: "🎁",
    condition: (state) => state.inventoryItems.length >= 5,
  },
];

const STORE_ITEMS: Partial<Record<number, StoreItem>> = Object.fromEntries(
  ORDERED_STORE_ITEMS.map((item, index) => [index, { imageSrc: item.imageSrc, price: item.price }])
) as Partial<Record<number, StoreItem>>;

const EQUIPPED_ITEM_PLACEMENTS: Record<string, EquippedItemPlacement> = {
  "/helmet.png": { left: "51%", top: "17%", width: "31%", zIndex: 5 },
  "/gloves.png": { left: "50%", top: "46%", width: "34%", zIndex: 4 },
  "/boots.png": { left: "51%", top: "84%", width: "36%", zIndex: 4 },
  "/dagger.png": { left: "65%", top: "54%", width: "24%", rotate: 8, zIndex: 6 },
  "/sword.png": { left: "66%", top: "57%", width: "34%", rotate: 8, zIndex: 6 },
  "/shield-store.png": { left: "31%", top: "54%", width: "30%", zIndex: 5 },
  "/plate.png": { left: "51%", top: "60%", width: "36%", zIndex: 5 },
};

const QUESTION_BANK: Record<Subject, Question[]> = {
  math: mathQuestions,
  reading: readingQuestions,
};

const CONFETTI_PIECES = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  left: `${(i * 17) % 100}%`,
  delay: `${((i * 7) % 10) / 20}s`,
  duration: `${2 + ((i * 5) % 10) / 10}s`,
  color: ["#ff8b2a", "#4f7de0", "#00a884", "#d82f49", "#ffd54f", "#7c3aed"][i % 6],
}));

function getPlayerLevel(currentScore: number): number {
  return Math.min(5, Math.floor(currentScore / 2000) + 1);
}

function getRandomQuestionByLevel(currentScore: number, subject: Subject): Question {
  const level = getPlayerLevel(currentScore);
  const questionsForLevel = QUESTION_BANK[subject].filter((question) => question.difficulty === level);
  const source = questionsForLevel.length > 0 ? questionsForLevel : QUESTION_BANK[subject];
  const randomIndex = Math.floor(Math.random() * source.length);

  return source[randomIndex];
}

export default function Home() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const crowdAudioRef = useRef<HTMLAudioElement | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [subjectStats, setSubjectStats] = useState<Record<Subject, SubjectStats>>({
    math: { correct: 0, answered: 0 },
    reading: { correct: 0, answered: 0 },
  });
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [storeWarningMessage, setStoreWarningMessage] = useState<string | null>(null);
  const [inventoryItems, setInventoryItems] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [equippedItems, setEquippedItems] = useState<string[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(45);
  const warningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousUnlockedIdsRef = useRef<string[]>([]);
  const triedAutoplayRef = useRef(false);

  const hasAnswered = selectedIndex !== null;

  const correctCount = subjectStats.math.correct + subjectStats.reading.correct;
  const playerLevel = getPlayerLevel(score);
  const pointsToNextLevel = playerLevel < 5 ? playerLevel * 2000 - score : 0;
  const pointsPerCorrect = getQuestionPointsForLevel(playerLevel);
  const achievementState: AchievementState = {
    score,
    correctCount,
    playerLevel,
    inventoryItems,
    subjectStats,
  };
  const unlockedAchievements = ACHIEVEMENTS.filter((achievement) => achievement.condition(achievementState));
  const unlockedAchievementIds = new Set(
    unlockedAchievements.map((achievement) => achievement.id)
  );
  const lockedAchievements = ACHIEVEMENTS.filter((achievement) => !unlockedAchievementIds.has(achievement.id));
  const currentPlayerState = getPlayerState(inventoryItems);
  const orderedStoreIndexes = Object.keys(STORE_ITEMS)
    .map((key) => Number(key))
    .sort((a, b) => a - b);
  const nextRequiredStoreIndex = orderedStoreIndexes.find((index) => {
    const candidate = STORE_ITEMS[index];
    return !!candidate && !inventoryItems.includes(candidate.imageSrc);
  });

  function tryStartAudio() {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.muted = isMuted;
    audio.volume = Math.max(0, Math.min(1, volume / 100));

    audio
      .play()
      .then(() => {})
      .catch(() => {
        // Browser autoplay policies can block playback before user interaction.
      });
  }

  function handleSubjectPick(nextSubject: Subject) {
    setCurrentQuestion(getRandomQuestionByLevel(score, nextSubject));
    setSubject(nextSubject);
    setSelectedIndex(null);
  }

  function handleAnswer(choiceIndex: number) {
    if (!currentQuestion || hasAnswered || !subject) {
      return;
    }

    const isCorrect = choiceIndex === currentQuestion.correctIndex;
    setSelectedIndex(choiceIndex);

    setSubjectStats((current) => {
      const activeStats = current[subject];

      return {
        ...current,
        [subject]: {
          answered: activeStats.answered + 1,
          correct: activeStats.correct + (isCorrect ? 1 : 0),
        },
      };
    });

    if (isCorrect) {
      setScore((current) => current + getQuestionPointsForLevel(getPlayerLevel(current)));
    }
  }

  function nextQuestion() {
    if (!subject) {
      return;
    }

    setCurrentQuestion(getRandomQuestionByLevel(score, subject));
    setSelectedIndex(null);
  }

  function showStoreWarning(message: string, durationMs: number) {
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    setStoreWarningMessage(message);
    warningTimeoutRef.current = setTimeout(() => {
      setStoreWarningMessage(null);
    }, durationMs);
  }

  function handleStoreItemClick(itemIndex: number) {
    const item = STORE_ITEMS[itemIndex];
    if (!item) {
      return;
    }

    if (nextRequiredStoreIndex === undefined) {
      return;
    }

    if (itemIndex !== nextRequiredStoreIndex) {
      showStoreWarning("לא ניתן לרכוש חפץ זה, יש עוד חפצים שלא רכשת!", 2500);

      return;
    }

    if (score < item.price) {
      showStoreWarning("אין מספיק נקודות!", 2000);

      return;
    }

    setStoreWarningMessage(null);
    setScore((current) => current - item.price);
    setInventoryItems((current) => [...current, item.imageSrc]);
  }

  useEffect(() => {
    const previous = previousUnlockedIdsRef.current;
    const current = unlockedAchievements.map((achievement) => achievement.id);
    const hasNewUnlock = current.some((id) => !previous.includes(id));

    previousUnlockedIdsRef.current = current;

    if (!hasNewUnlock) {
      return;
    }

    const crowdAudio = crowdAudioRef.current;
    if (crowdAudio && !isMuted) {
      crowdAudio.currentTime = 0;
      crowdAudio.volume = Math.max(0, Math.min(1, volume / 100));
      crowdAudio.play().catch(() => {
        // Some browsers still may block playback if interaction was not detected.
      });
    }

    const showTimer = setTimeout(() => setShowConfetti(true), 0);
    const hideTimer = setTimeout(() => setShowConfetti(false), 2600);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [unlockedAchievements, isMuted, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.muted = isMuted;
    audio.volume = Math.max(0, Math.min(1, volume / 100));

    const crowdAudio = crowdAudioRef.current;
    if (crowdAudio) {
      crowdAudio.muted = isMuted;
      crowdAudio.volume = Math.max(0, Math.min(1, volume / 100));
    }
  }, [isMuted, volume]);

  useEffect(() => {
    if (triedAutoplayRef.current) {
      return;
    }

    triedAutoplayRef.current = true;
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.muted = false;
    audio.volume = Math.max(0, Math.min(1, volume / 100));

    audio
      .play()
      .then(() => {
        setIsMuted(false);
      })
      .catch(() => {
        // If unmuted autoplay is blocked, start muted so playback begins on load.
        audio.muted = true;
        audio
          .play()
          .then(() => {
            setIsMuted(true);

            // Try to switch to audible playback shortly after start when possible.
            const unmuteTimer = setTimeout(() => {
              audio.muted = false;
              setIsMuted(false);
            }, 220);

            return () => clearTimeout(unmuteTimer);
          })
          .catch(() => {
            // Final fallback: wait for explicit user interaction.
          });
      });
  }, [volume]);

  function toggleEquippedItem(itemSrc: string) {
    if (equippedItems.includes(itemSrc)) {
      setEquippedItems(equippedItems.filter((item) => item !== itemSrc));
    } else {
      setEquippedItems([...equippedItems, itemSrc]);
    }
  }

  return (
    <main
      className="game-screen"
      onPointerDown={() => {
        tryStartAudio();
      }}
    >
      <audio ref={audioRef} src="/music.mp3" loop autoPlay playsInline preload="auto" />
      <audio ref={crowdAudioRef} src="/crowd.mp3" preload="auto" />

      <div className="bg-blob bg-blob-one" aria-hidden="true" />
      <div className="bg-blob bg-blob-two" aria-hidden="true" />
      <div className="bg-blob bg-blob-three" aria-hidden="true" />

      <div className="bg-decoration bg-deco-star" style={{ top: "10%", left: "5%" }} aria-hidden="true">⭐</div>
      <div className="bg-decoration bg-deco-book" style={{ top: "20%", right: "8%" }} aria-hidden="true">📚</div>
      <div className="bg-decoration bg-deco-pencil" style={{ bottom: "15%", left: "3%" }} aria-hidden="true">✏️</div>
      <div className="bg-decoration bg-deco-star" style={{ bottom: "10%", right: "5%" }} aria-hidden="true">⭐</div>
      <div className="bg-decoration bg-deco-book" style={{ top: "50%", right: "1%" }} aria-hidden="true">📚</div>

      <section className="panel panel-kid">
        <h2 className="panel-title">אדם</h2>
        <div className="kid-container">
          <Image
            src={KID_BACKGROUND_SRC}
            alt="Kid background"
            fill
            className="kid-background-image"
            sizes="(max-width: 1024px) 100vw, 260px"
            priority
          />
          <Image
            src={currentPlayerState.kidImageSrc}
            alt="Kid character"
            fill
            className="kid-image"
            sizes="(max-width: 1024px) 100vw, 260px"
            priority
          />

          {equippedItems.length > 0 && (
            <div className="equipped-items-overlay">
              {equippedItems.map((itemSrc, index) => {
                const placement = EQUIPPED_ITEM_PLACEMENTS[itemSrc] ?? {
                  left: "50%",
                  top: `${42 + index * 8}%`,
                  width: "24%",
                  zIndex: 4,
                };

                return (
                  <div
                    key={itemSrc}
                    className="equipped-item-slot"
                    style={{
                      left: placement.left,
                      top: placement.top,
                      width: placement.width,
                      transform: `translate(-50%, -50%) rotate(${placement.rotate ?? 0}deg)`,
                      zIndex: placement.zIndex ?? 4,
                    }}
                  >
                    <Image
                      src={itemSrc}
                      alt="Equipped item"
                      fill
                      sizes="(max-width: 1024px) 28vw, 88px"
                      className="equipped-item-icon"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <button
          type="button"
          className="store-button"
          onClick={() => {
            setIsStoreOpen(true);
            setStoreWarningMessage(null);
          }}
        >
          חנות
        </button>

        <div className="inventory-box">
          <h3 className="inventory-title">מלאי</h3>
          <div className="inventory-grid">
            {inventoryItems.length === 0 ? (
              <p className="inventory-empty">אין פריטים עדיין</p>
            ) : (
              inventoryItems.map((itemSrc, index) => (
                <button
                  key={`inventory-item-${index}`}
                  className={`inventory-item ${equippedItems.includes(itemSrc) ? 'equipped' : ''}`}
                  onClick={() => toggleEquippedItem(itemSrc)}
                  type="button"
                  title="לחצו כדי ללבוש/הורידו"
                >
                  <Image src={itemSrc} alt="פריט במלאי" width={56} height={56} className="inventory-image" />
                </button>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="panel panel-gameplay">
        <div className="gameplay-main">
          <h1 className="game-title">מסע הלמידה של אדם</h1>
          <p className="game-subtitle">בחרו מקצוע, פתרו שאלות, ושברו את השיא שלכם.</p>

          {!subject ? (
            <div className="subject-picker" role="group" aria-label="בחרו מקצוע">
              <p className="subject-text">בחרו מקצוע</p>
              <div className="subject-actions">
                <button type="button" className="subject-button" onClick={() => handleSubjectPick("math")}>
                  חשבון
                </button>
                <button
                  type="button"
                  className="subject-button subject-reading"
                  onClick={() => handleSubjectPick("reading")}
                >
                  קריאה
                </button>
              </div>
            </div>
          ) : (
            <div className={`question-card ${subject === "math" ? "math-mode" : ""}`}>
              <div className="question-topline">
                <span className="subject-chip">{subject === "math" ? "חשבון" : "קריאה"}</span>
                <button type="button" className="switch-link" onClick={() => setSubject(null)}>
                  החלפת מקצוע
                </button>
              </div>

              <p className="question-prompt">{currentQuestion?.prompt}</p>

              <div className="answers-grid">
                {currentQuestion?.choices.map((choice, index) => {
                  const isCorrect = index === currentQuestion.correctIndex;
                  const isSelected = index === selectedIndex;

                  let className = "answer-button";
                  if (hasAnswered && isCorrect) {
                    className += " is-correct";
                  }
                  if (hasAnswered && isSelected && !isCorrect) {
                    className += " is-wrong";
                  }

                  return (
                    <button
                      key={`${currentQuestion.prompt}-${choice}`}
                      type="button"
                      className={className}
                      onClick={() => handleAnswer(index)}
                      disabled={hasAnswered}
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>

              {hasAnswered && (
                <div className="result-row">
                  <p className="result-text">
                    {selectedIndex === currentQuestion?.correctIndex ? `כל הכבוד! קיבלתם ${pointsPerCorrect} נקודות` : "לא הפעם, נסו את השאלה הבאה"}
                  </p>
                  <button type="button" className="next-button" onClick={nextQuestion}>
                    לשאלה הבאה
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="audio-controls" role="group" aria-label="בקרת מוזיקה">
          <button
            type="button"
            className="audio-mute-button"
            onClick={() => {
              setIsMuted((current) => !current);
              tryStartAudio();
            }}
          >
            {isMuted ? "🔊 נגן מוזיקה וצלילים" : "🔊 השתק מוזיקה וצלילים"}
          </button>

          <label className="audio-volume-label" htmlFor="volume-slider">
            עוצמה
          </label>
          <input
            id="volume-slider"
            className="audio-volume-slider"
            type="range"
            min={0}
            max={100}
            step={1}
            value={volume}
            onChange={(event) => {
              const nextVolume = Number(event.target.value);
              setVolume(nextVolume);
              if (nextVolume > 0 && isMuted) {
                setIsMuted(false);
              }
              tryStartAudio();
            }}
          />
        </div>
      </section>

      <aside className="panel panel-hud">
        <div className="hud-badge">מרוץ הנקודות</div>
        <div className="hud-stat">
          <span>נקודות</span>
          <strong>{score}</strong>
        </div>
        <div className="hud-stat">
          <span>תשובות נכונות</span>
          <strong>{correctCount}</strong>
        </div>

        <div className="hud-level-card">
          <div className="hud-level-row">
            <span>רמת קושי</span>
            <strong>{playerLevel}</strong>
          </div>
          <small>{playerLevel < 5 ? `עוד ${pointsToNextLevel} נקודות לרמה הבאה` : "רמה מקסימלית!"}</small>
        </div>

        <div className="achievements-box">
          <h3 className="achievements-title">הישגים</h3>
          <div className="achievements-grid">
            {unlockedAchievements.length > 0 && <p className="achievement-group-title">הושלמו</p>}
            {unlockedAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="achievement-chip is-unlocked"
                title={achievement.description}
              >
                <span className="achievement-name">{achievement.name}</span>
                <span className="achievement-desc">{achievement.description}</span>
              </div>
            ))}

            {lockedAchievements.length > 0 && <p className="achievement-group-title">היעדים הבאים</p>}
            {lockedAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="achievement-chip is-locked"
                title={achievement.description}
              >
                <span className="achievement-name">{achievement.name}</span>
                <span className="achievement-desc">{achievement.description}</span>
              </div>
            ))}

            {lockedAchievements.length === 0 && (
              <p className="inventory-empty">כל ההישגים הושלמו!</p>
            )}
          </div>
        </div>
      </aside>

      {showConfetti && (
        <div className="confetti-container">
          {CONFETTI_PIECES.map((piece) => (
            <div
              key={piece.id}
              className="confetti"
              style={{
                left: piece.left,
                "--delay": piece.delay,
                "--duration": piece.duration,
                background: piece.color,
              } as CSSProperties}
            />
          ))}
        </div>
      )}

      {isStoreOpen && (
        <div
          className="store-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Store"
          onClick={() => {
            setIsStoreOpen(false);
            setStoreWarningMessage(null);
            if (warningTimeoutRef.current) {
              clearTimeout(warningTimeoutRef.current);
            }
          }}
        >
          <div className="store-modal-content" onClick={(event) => event.stopPropagation()}>
            <div className="store-image-wrap">
              <Image src={STORE_IMAGE_SRC} alt="Store" width={900} height={700} className="store-image" priority />

              {storeWarningMessage && <div className="store-warning">{storeWarningMessage}</div>}

              {STORE_HOTSPOTS.map((spot, index) => (
                <div
                  key={`store-item-${index + 1}`}
                  className="store-hotspot"
                  style={{ left: spot.left, top: spot.top, width: spot.width, height: spot.height }}
                >
                  {(() => {
                    const storeItem = STORE_ITEMS[index];
                    const isPurchased = !!storeItem && inventoryItems.includes(storeItem.imageSrc);
                    const isLocked = nextRequiredStoreIndex !== undefined && index > nextRequiredStoreIndex;
                    const isUnavailable = !storeItem || isPurchased;
                    const isDisabledVisual = isUnavailable || isLocked;

                    return (
                      <>
                        {storeItem && (
                          <Image
                            src={storeItem.imageSrc}
                            alt="Store item"
                            width={180}
                            height={180}
                            className={`store-item-image ${isDisabledVisual ? "is-disabled" : ""}`}
                          />
                        )}

                        <button
                          type="button"
                          className={`store-hotspot-button ${isDisabledVisual ? "is-disabled" : ""}`}
                          onClick={() => {
                            if (isLocked) {
                              showStoreWarning("לא ניתן לרכוש חפץ זה, יש עוד חפצים שלא רכשת!", 2500);
                              return;
                            }

                            handleStoreItemClick(index);
                          }}
                          aria-label={`פריט ${index + 1}`}
                          aria-disabled={isDisabledVisual}
                          disabled={isUnavailable}
                        />

                        {storeItem && <div className="store-price">{storeItem.price} נקודות</div>}
                      </>
                    );
                  })()}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
