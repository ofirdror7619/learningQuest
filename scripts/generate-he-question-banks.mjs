import { writeFileSync } from "node:fs";
import { join } from "node:path";

const LEVELS = [1, 2, 3, 4, 5];
const PER_LEVEL = 200;

function placeCorrect(correct, wrongOptions, index) {
  const uniques = [...new Set(wrongOptions.filter((x) => x !== correct))].slice(0, 3);
  while (uniques.length < 3) {
    uniques.push(`${uniques.length + 2}`);
  }

  const correctIndex = index % 4;
  const choices = [...uniques];
  choices.splice(correctIndex, 0, correct);

  return { choices, correctIndex };
}

function questionKey(question) {
  return [
    question.difficulty,
    question.prompt.trim(),
    question.choices.map((choice) => String(choice).trim()).join("||"),
    question.correctIndex,
  ].join("###");
}

function numericChoices(correct, i, min = 0) {
  const base = Math.max(2, Math.floor(Math.abs(correct) * 0.12));
  const wiggle = (i % 5) + 1;
  const wrongs = [
    String(Math.max(min, correct + base + wiggle)),
    String(Math.max(min, correct - base - (wiggle - 1))),
    String(Math.max(min, correct + base + 2 + (wiggle % 3))),
    String(Math.max(min, correct - (base + 1 + (wiggle % 2)))),
  ];

  return placeCorrect(String(correct), wrongs, i);
}

function makeMathQuestion(level, i) {
  const t = (i - 1) % 8;

  if (level === 1) {
    if (t < 4) {
      const a = (i % 10) + 1;
      const b = ((i * 2) % 9) + 1;
      const correct = a + b;
      return { difficulty: level, prompt: `${a} + ${b} = ?`, ...numericChoices(correct, i, 0) };
    }

    const a = ((i * 3) % 10) + 10;
    const b = (i % 9) + 1;
    const correct = a - b;
    return { difficulty: level, prompt: `${a} - ${b} = ?`, ...numericChoices(correct, i, 0) };
  }

  if (level === 2) {
    if (t < 3) {
      const a = ((i * 7) % 45) + 25;
      const b = ((i * 5) % 35) + 15;
      const correct = a + b;
      return { difficulty: level, prompt: `${a} + ${b} = ?`, ...numericChoices(correct, i, 0) };
    }

    if (t < 5) {
      const a = ((i * 9) % 45) + 50;
      const b = ((i * 4) % 25) + 11;
      const correct = a - b;
      return { difficulty: level, prompt: `${a} - ${b} = ?`, ...numericChoices(correct, i, 0) };
    }

    if (t < 7) {
      const a = (i % 7) + 3;
      const b = ((i * 2) % 8) + 2;
      const correct = a * b;
      return { difficulty: level, prompt: `${a} x ${b} = ?`, ...numericChoices(correct, i, 0) };
    }

    const divisor = (i % 8) + 2;
    const result = ((i * 3) % 9) + 2;
    const dividend = divisor * result;
    return { difficulty: level, prompt: `${dividend} / ${divisor} = ?`, ...numericChoices(result, i, 1) };
  }

  if (level === 3) {
    if (t < 2) {
      const a = ((i * 11) % 120) + 80;
      const b = ((i * 6) % 90) + 35;
      const correct = a + b;
      return { difficulty: level, prompt: `${a} + ${b} = ?`, ...numericChoices(correct, i, 0) };
    }

    if (t < 4) {
      const a = ((i * 13) % 130) + 120;
      const b = ((i * 7) % 70) + 30;
      const correct = a - b;
      return { difficulty: level, prompt: `${a} - ${b} = ?`, ...numericChoices(correct, i, 0) };
    }

    if (t < 6) {
      const a = (i % 10) + 6;
      const b = ((i * 3) % 9) + 4;
      const correct = a * b;
      return { difficulty: level, prompt: `${a} x ${b} = ?`, ...numericChoices(correct, i, 0) };
    }

    if (t === 6) {
      const divisor = (i % 9) + 3;
      const result = ((i * 4) % 16) + 5;
      const dividend = divisor * result;
      return { difficulty: level, prompt: `${dividend} / ${divisor} = ?`, ...numericChoices(result, i, 1) };
    }

    const a = (i % 15) + 8;
    const b = ((i * 2) % 11) + 4;
    const c = ((i * 3) % 7) + 2;
    const correct = a + b * c;
    return { difficulty: level, prompt: `${a} + ${b} x ${c} = ?`, ...numericChoices(correct, i, 0) };
  }

  if (level === 4) {
    if (t < 2) {
      const a = ((i * 17) % 260) + 240;
      const b = ((i * 9) % 220) + 130;
      const correct = a + b;
      return { difficulty: level, prompt: `${a} + ${b} = ?`, ...numericChoices(correct, i, 0) };
    }

    if (t < 4) {
      const a = ((i * 19) % 310) + 340;
      const b = ((i * 7) % 190) + 90;
      const correct = a - b;
      return { difficulty: level, prompt: `${a} - ${b} = ?`, ...numericChoices(correct, i, 0) };
    }

    if (t < 6) {
      const a = (i % 17) + 12;
      const b = ((i * 2) % 7) + 6;
      const correct = a * b;
      return { difficulty: level, prompt: `${a} x ${b} = ?`, ...numericChoices(correct, i, 0) };
    }

    if (t === 6) {
      const divisor = (i % 13) + 6;
      const result = ((i * 3) % 22) + 8;
      const dividend = divisor * result;
      return { difficulty: level, prompt: `${dividend} / ${divisor} = ?`, ...numericChoices(result, i, 1) };
    }

    const a = (i % 20) + 15;
    const b = ((i * 3) % 15) + 8;
    const c = ((i * 5) % 8) + 3;
    const correct = a + b * c;
    return { difficulty: level, prompt: `${a} + ${b} x ${c} = ?`, ...numericChoices(correct, i, 0) };
  }

  if (t < 2) {
    const a = ((i * 23) % 700) + 500;
    const b = ((i * 11) % 650) + 380;
    const correct = a + b;
    return { difficulty: level, prompt: `${a} + ${b} = ?`, ...numericChoices(correct, i, 0) };
  }

  if (t < 4) {
    const a = ((i * 21) % 750) + 850;
    const b = ((i * 13) % 520) + 260;
    const correct = a - b;
    return { difficulty: level, prompt: `${a} - ${b} = ?`, ...numericChoices(correct, i, 0) };
  }

  if (t < 6) {
    const a = (i % 23) + 18;
    const b = ((i * 5) % 17) + 12;
    const correct = a * b;
    return { difficulty: level, prompt: `${a} x ${b} = ?`, ...numericChoices(correct, i, 0) };
  }

  if (t === 6) {
    const divisor = (i % 19) + 8;
    const result = ((i * 7) % 31) + 16;
    const dividend = divisor * result;
    return { difficulty: level, prompt: `${dividend} / ${divisor} = ?`, ...numericChoices(result, i, 1) };
  }

  const a = (i % 25) + 20;
  const b = ((i * 4) % 20) + 10;
  const c = ((i * 6) % 12) + 4;
  const correct = (a + b) * c;
  return { difficulty: level, prompt: `(${a} + ${b}) x ${c} = ?`, ...numericChoices(correct, i, 0) };
}

const wordsSimple = ["ילד", "כדור", "ספר", "דג", "שמש", "בית", "פרח", "כלב", "חתול", "עץ"];
const wordsMedium = ["מחברת", "כיתה", "ספריה", "מדרכה", "משפחה", "תלמיד", "מחשב", "חלון", "סיפור", "שיעור"];
const wordsAdvanced = ["אחריות", "סבלנות", "התמדה", "יצירתיות", "התחשבות", "הקשבה", "שיתוף", "התארגנות", "התמודדות", "התפתחות"];

function makeReadingQuestion(level, i) {
  const t = (i - 1) % 8;
  const simple = wordsSimple[i % wordsSimple.length];
  const medium = wordsMedium[i % wordsMedium.length];
  const advanced = wordsAdvanced[i % wordsAdvanced.length];

  if (level === 1) {
    if (t === 0) {
      const correct = simple;
      const wrongs = [wordsSimple[(i + 1) % 10], wordsSimple[(i + 2) % 10], wordsSimple[(i + 3) % 10]].map((w) => `${w}${w[0]}`);
      return { difficulty: level, prompt: `איזו מילה מתחילה באות ${simple[0]}?`, ...placeCorrect(correct, wrongs, i) };
    }

    if (t === 1) {
      const correct = simple[0];
      const wrongs = [simple[simple.length - 1], "מ", "נ", "ל"];
      return { difficulty: level, prompt: `בחרו את האות הראשונה במילה ${simple}:`, ...placeCorrect(correct, wrongs, i) };
    }

    if (t === 2) {
      const correct = wordsSimple[(i + 4) % 10];
      const wrongs = ["זפלון", "נבדור", "קרטיבש", "טלנוף"];
      return { difficulty: level, prompt: "איזו מהאפשרויות היא מילה אמיתית?", ...placeCorrect(correct, wrongs, i) };
    }

    if (t === 3) {
      const correct = "?";
      return { difficulty: level, prompt: "איזה סימן מתאים לשאלה?", ...placeCorrect(correct, [".", "!", ","], i) };
    }

    if (t === 4) {
      const correct = `${simple} קטן.`;
      return { difficulty: level, prompt: "בחרו משפט קצר תקין:", ...placeCorrect(correct, [`${simple} קטן`, `${simple} קטן,`, `קטן ${simple}.`], i) };
    }

    if (t === 5) {
      const correct = wordsSimple[(i + 5) % 10];
      const wrongs = [
        `${wordsSimple[(i + 6) % 10]}${wordsSimple[(i + 6) % 10][0]}`,
        `${wordsSimple[(i + 7) % 10]}${wordsSimple[(i + 7) % 10][0]}`,
        `${wordsSimple[(i + 8) % 10]}${wordsSimple[(i + 8) % 10][0]}`,
      ];
      return { difficulty: level, prompt: "איזו אפשרות היא מילה כתובה נכון?", ...placeCorrect(correct, wrongs, i) };
    }

    if (t === 6) {
      const correct = wordsSimple[(i + 2) % 10];
      return { difficulty: level, prompt: "איזו מילה היא שם עצם?", ...placeCorrect(correct, ["רץ", "יפה", "מהר"], i) };
    }

    const correct = `${simple} ${wordsSimple[(i + 1) % 10]}`;
    const wrongs = [
      `${simple}${wordsSimple[(i + 1) % 10]}`,
      `${wordsSimple[(i + 2) % 10]} ${wordsSimple[(i + 3) % 10]},`,
      `${wordsSimple[(i + 4) % 10]} ${wordsSimple[(i + 5) % 10]}`,
    ];
    return { difficulty: level, prompt: "בחרו צירוף מילים פשוט ותקין:", ...placeCorrect(correct, wrongs, i) };
  }

  if (level === 2) {
    if (t === 0) {
      const correct = `ה${simple} רץ בחצר.`;
      return { difficulty: level, prompt: "איזה משפט כתוב נכון?", ...placeCorrect(correct, [`ה${simple} רץ בחצר`, `ה${simple} רץ בחצר,`, `רץ ה${simple} בחצר.`], i) };
    }

    if (t === 1) {
      const correct = "גדול";
      return { difficulty: level, prompt: "מהי המילה ההפוכה לקטן?", ...placeCorrect(correct, ["רחוק", "חלש", "איטי"], i) };
    }

    if (t === 2) {
      const correct = `אני קורא ${simple}.`;
      return { difficulty: level, prompt: "בחרו משפט עם פועל מתאים:", ...placeCorrect(correct, [`אני קורא ${simple}`, `אני קרוא ${simple}.`, `אני קורא ${simple},`], i) };
    }

    if (t === 3) {
      const correct = medium;
      return { difficulty: level, prompt: "איזו מילה מתאימה ללימודים בבית ספר?", ...placeCorrect(correct, [simple, "ענן", "כפית"], i) };
    }

    if (t === 4) {
      const correct = "!";
      return { difficulty: level, prompt: "איזה סימן מתאים למשפט התפעלות?", ...placeCorrect(correct, ["?", ".", ","], i) };
    }

    if (t === 5) {
      const correct = "הילדה משחקת בכדור.";
      return { difficulty: level, prompt: "איזה משפט תקין דקדוקית?", ...placeCorrect(correct, ["הילדה משחק בכדור.", "הילדה משחקת בכדור", "הילדה משחקת בכדור,"], i) };
    }

    if (t === 6) {
      const correct = "יפה";
      return { difficulty: level, prompt: "איזו מילה היא שם תואר?", ...placeCorrect(correct, ["שולחן", "מחברת", "חלון"], i) };
    }

    const correct = `${simple} ב${medium}.`;
    return { difficulty: level, prompt: "בחרו משפט ברור ותקין:", ...placeCorrect(correct, [`${simple} ב${medium}`, `ב${medium} ${simple}.`, `${simple} ב${medium},`], i) };
  }

  if (level === 3) {
    if (t === 0) {
      const correct = `אתמול קראתי ${medium} מעניין.`;
      return { difficulty: level, prompt: "איזה משפט בזמן עבר?", ...placeCorrect(correct, [`מחר אקרא ${medium} מעניין.`, `היום אני קורא ${medium} מעניין.`, `אתמול קראתי ${medium} מעניין`], i) };
    }

    if (t === 1) {
      const correct = "עליז";
      return { difficulty: level, prompt: "מהי מילה נרדפת לשמח?", ...placeCorrect(correct, ["עצוב", "כועס", "עייף"], i) };
    }

    if (t === 2) {
      const correct = "הילדים שיחקו בחצר.";
      return { difficulty: level, prompt: "איזה משפט מתאים לרבים?", ...placeCorrect(correct, ["הילדים שיחק בחצר.", "הילדים שיחקה בחצר.", "הילדים שיחקו בחצר"], i) };
    }

    if (t === 3) {
      const correct = "אם אסיים שיעורים, אלך לשחק.";
      return { difficulty: level, prompt: "בחרו משפט עם מילת תנאי:", ...placeCorrect(correct, ["אסיים שיעורים אלך לשחק.", "אם אסיים שיעורים אלך לשחק", "אם אסיים שיעורים, אלך לשחק"], i) };
    }

    if (t === 4) {
      const correct = `ה${simple} ${medium} מאוד.`;
      return { difficulty: level, prompt: "איזה משפט כולל תיאור?", ...placeCorrect(correct, [`ה${simple} ${medium} מאוד`, `${medium} ${simple} מאוד.`, `מאוד ה${simple} ${medium}.`], i) };
    }

    if (t === 5) {
      const correct = "כתיבה";
      return { difficulty: level, prompt: "איזו מילה שייכת למשפחת המילים של כתב?", ...placeCorrect(correct, ["ריצה", "אכילה", "שמיעה"], i) };
    }

    if (t === 6) {
      const correct = `מי אחראי על ${medium}?`;
      return { difficulty: level, prompt: "איזה משפט שאלה תקין?", ...placeCorrect(correct, [`מי אחראי על ${medium}.`, `מי אחראי על ${medium}!`, `מי אחראי על ${medium},`], i) };
    }

    const correct = `${simple} אבל ${medium}.`;
    return { difficulty: level, prompt: "בחרו משפט עם מילת קישור:", ...placeCorrect(correct, [`${simple} ${medium}.`, `אבל ${simple} ${medium}.`, `${simple}, ${medium}`], i) };
  }

  if (level === 4) {
    if (t === 0) {
      const correct = "למרות הגשם, המשכנו ללכת לבית הספר.";
      return { difficulty: level, prompt: "איזה משפט מורכב כתוב נכון?", ...placeCorrect(correct, ["למרות הגשם המשכנו ללכת לבית הספר.", "למרות הגשם, המשכנו ללכת לבית הספר", "למרות הגשם המשכנו, ללכת לבית הספר."], i) };
    }

    if (t === 1) {
      const correct = "איטי";
      return { difficulty: level, prompt: "מהי המילה ההפוכה למהיר?", ...placeCorrect(correct, ["זריז", "נמרץ", "חזק"], i) };
    }

    if (t === 2) {
      const correct = "הבנות התאמנו ואז יצאו להפסקה.";
      return { difficulty: level, prompt: "איזה משפט מציג רצף פעולות נכון?", ...placeCorrect(correct, ["הבנות התאמנו ואז יצאו להפסקה", "ואז הבנות התאמנו יצאו להפסקה.", "הבנות ואז התאמנו יצאו להפסקה."], i) };
    }

    if (t === 3) {
      const correct = "הספרייה";
      return { difficulty: level, prompt: "איזו צורת כתיב תקינה?", ...placeCorrect(correct, ["הספריה", "הספרייהה", "הספריהה"], i) };
    }

    if (t === 4) {
      const correct = "המורה ביקשה שנכתוב תשובה מלאה ומנומקת.";
      return { difficulty: level, prompt: "בחרו משפט מדויק ללשון בית ספרית:", ...placeCorrect(correct, ["המורה ביקשה שנכתוב תשובה מלאה ומנומקת", "המורה ביקשה שנכתוב תשובה מלאה, ומנומקת.", "המורה ביקשה שנכתוב תשובה מלאה ומנומקת,"], i) };
    }

    if (t === 5) {
      const correct = "הוא אמר: \"אני מוכן להתחיל.\"";
      return { difficulty: level, prompt: "איזה משפט משתמש נכון במירכאות?", ...placeCorrect(correct, ["הוא אמר \"אני מוכן להתחיל\".", "הוא אמר: אני מוכן להתחיל.", "הוא אמר: \"אני מוכן להתחיל.\"!"], i) };
    }

    if (t === 6) {
      const correct = "התמדה";
      return { difficulty: level, prompt: "איזו מילה מתאימה לשדה סמנטי של למידה והתפתחות?", ...placeCorrect(correct, ["כפית", "ענן", "כביש"], i) };
    }

    const correct = "הדיון היה מעניין, ולכן כולם הקשיבו.";
    return { difficulty: level, prompt: "איזה משפט כולל מילת קישור מתאימה?", ...placeCorrect(correct, ["הדיון היה מעניין ולכן כולם הקשיבו", "הדיון היה מעניין ולכן, כולם הקשיבו.", "הדיון היה מעניין, לכן כולם הקשיבו"], i) };
  }

  if (t === 0) {
    const correct = "אף על פי שהשעה מאוחרת, המשכנו לעבוד בריכוז.";
    return { difficulty: level, prompt: "איזה משפט מורכב ומדויק תחבירית?", ...placeCorrect(correct, ["אף על פי שהשעה מאוחרת המשכנו לעבוד בריכוז.", "אף על פי שהשעה מאוחרת, המשכנו לעבוד בריכוז", "אף על פי שהשעה מאוחרת, המשכנו, לעבוד בריכוז."], i) };
  }

  if (t === 1) {
    const correct = "התחשבות";
    return { difficulty: level, prompt: "איזו מילה מבטאת ערך חברתי?", ...placeCorrect(correct, ["שולחן", "מטריה", "חלון"], i) };
  }

  if (t === 2) {
    const correct = "המסקנה התקבלה לאחר בדיקה מעמיקה של הנתונים.";
    return { difficulty: level, prompt: "בחרו משפט בסגנון אקדמי-תקין:", ...placeCorrect(correct, ["המסקנה התקבלה לאחר בדיקה מעמיקה של הנתונים", "המסקנה התקבלה, לאחר בדיקה מעמיקה של הנתונים.", "המסקנה התקבלה לאחר בדיקה מעמיקה של הנתונים,"], i) };
  }

  if (t === 3) {
    const correct = "התארגנות";
    return { difficulty: level, prompt: "איזו מילה שייכת למשפחת מילים של ארגון וסדר?", ...placeCorrect(correct, ["ריצה", "אכילה", "קפיצה"], i) };
  }

  if (t === 4) {
    const correct = "הכותב טוען שהשינוי יוביל לשיפור משמעותי.";
    return { difficulty: level, prompt: "איזה משפט מתאים להבנת הנקרא ברמה גבוהה?", ...placeCorrect(correct, ["הכותב טוען שהשינוי יוביל לשיפור משמעותי", "הכותב טוען, שהשינוי יוביל לשיפור משמעותי.", "הכותב טוען שהשינוי יוביל לשיפור משמעותי,"], i) };
  }

  if (t === 5) {
    const correct = "אם נשמור על התמדה, נצליח להשיג את המטרה.";
    return { difficulty: level, prompt: "איזה משפט מבטא קשר סיבה-תוצאה ברור?", ...placeCorrect(correct, ["אם נשמור על התמדה נצליח להשיג את המטרה.", "אם נשמור על התמדה, נצליח להשיג את המטרה", "אם נשמור על התמדה, נצליח, להשיג את המטרה."], i) };
  }

  if (t === 6) {
    const correct = "התמודדות";
    return { difficulty: level, prompt: "איזו מילה מתאימה לנושא פתרון בעיות?", ...placeCorrect(correct, ["מזלג", "תיק", "חלון"], i) };
  }

  const correct = "הצגת הטיעונים הייתה עקבית, ברורה ומשכנעת.";
  return { difficulty: level, prompt: "בחרו משפט תקין עם אוצר מילים מתקדם:", ...placeCorrect(correct, ["הצגת הטיעונים הייתה עקבית, ברורה ומשכנעת", "הצגת הטיעונים הייתה, עקבית ברורה ומשכנעת.", "הצגת הטיעונים הייתה עקבית ברורה ומשכנעת."], i) };
}

const math = [];
const reading = [];

for (const level of LEVELS) {
  for (let i = 1; i <= PER_LEVEL; i += 1) {
    math.push(makeMathQuestion(level, i));
    reading.push(makeReadingQuestion(level, i));
  }
}

const root = process.cwd();
writeFileSync(join(root, "data", "math-questions-he.json"), `${JSON.stringify(math, null, 2)}\n`, "utf8");
writeFileSync(join(root, "data", "reading-questions-he.json"), `${JSON.stringify(reading, null, 2)}\n`, "utf8");

console.log("Math total:", math.length);
console.log("Reading total:", reading.length);
