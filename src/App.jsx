import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, ImagePlus } from "lucide-react";

const YEAR_OPTIONS = [2024, 2025, 2026, 2027];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const OCCASIONS = [
  "Studio coffee",
  "Gallery stroll",
  "Bookstore date",
  "Office rhythm",
  "Rainy errands",
  "Late lunch",
  "Weekend market",
  "Sunset dinner",
];
const THOUGHTS = [
  "今天的布料很轻，像把情绪也一起熨平了。",
  "想记住风吹过裙摆的那一下，很像电影开场。",
  "颜色很安静，却让整天都显得更有分寸。",
  "比起漂亮，更喜欢今天穿起来很像自己。",
  "鞋跟落地的节奏，居然也能让人安心。",
  "像把一小页春天别在身上，走路都慢一点。",
  "没有刻意打扮，却刚好适合今天的心情。",
];
const PHOTO_SWATCHES = [
  ["oklch(0.93 0.05 75)", "oklch(0.82 0.1 32)", "oklch(0.74 0.11 18)"],
  ["oklch(0.92 0.07 145)", "oklch(0.83 0.08 185)", "oklch(0.75 0.09 228)"],
  ["oklch(0.94 0.05 35)", "oklch(0.86 0.09 12)", "oklch(0.78 0.11 352)"],
  ["oklch(0.95 0.04 92)", "oklch(0.86 0.07 118)", "oklch(0.79 0.09 162)"],
  ["oklch(0.93 0.05 26)", "oklch(0.87 0.06 340)", "oklch(0.8 0.08 14)"],
];
const MOOD_STYLES = [
  { color: "var(--mood-yellow)", face: "laugh" },
  { color: "var(--mood-peach)", face: "smile" },
  { color: "var(--mood-green)", face: "flat" },
  { color: "var(--mood-blue)", face: "sad" },
  { color: "var(--mood-lavender)", face: "cry" },
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getWeekdayIndex(year, month, day) {
  const jsDay = new Date(year, month, day).getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

function getMonthEntries(year, month) {
  const daysInMonth = getDaysInMonth(year, month);
  const entries = [];

  for (let day = 1; day <= daysInMonth; day += 1) {
    const weekdayIndex = getWeekdayIndex(year, month, day);
    const date = new Date(year, month, day);
    const temperature = 16 + ((day * 3) % 13);
    const occasion = OCCASIONS[(day + month) % OCCASIONS.length];
    const thought = THOUGHTS[(day + weekdayIndex) % THOUGHTS.length];
    const palette = PHOTO_SWATCHES[(day + month) % PHOTO_SWATCHES.length];
    const moodStyle = MOOD_STYLES[(day + weekdayIndex + month) % MOOD_STYLES.length];

    entries.push({
      id: `${year}-${month}-${day}`,
      day,
      dayName: WEEKDAY_LABELS[weekdayIndex],
      weekdayIndex,
      temperature,
      occasion,
      thought,
      palette,
      moodStyle,
      title: ["Quiet color", "Cafe layers", "Soft tailoring", "Weekend ease"][day % 4],
      monthLabel: date.toLocaleDateString("en-US", { month: "long", day: "numeric" }),
    });
  }

  return entries;
}

function MoodDot({ entry, isSelected, onSelect }) {
  if (!entry) {
    return <span className="mood-dot mood-dot-empty" aria-hidden="true" />;
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(entry)}
      className={`mood-dot ${isSelected ? "mood-dot-selected" : ""}`}
      style={{ "--mood-fill": entry.moodStyle.color }}
      aria-label={`Open journal for ${entry.monthLabel}`}
    >
      <span className="mood-face">
        <span className="mood-eyes" />
        <span className={`mood-mouth mood-mouth-${entry.moodStyle.face}`} />
      </span>
    </button>
  );
}

function CalendarPanel({ year, month, setYear, setMonth, entries, selectedEntry, onSelectEntry, onRecordingNow }) {
  const firstOffset = getWeekdayIndex(year, month, 1);
  const totalSlots = Math.ceil((firstOffset + entries.length) / 7) * 7;
  const cells = Array.from({ length: totalSlots }, (_, index) => {
    const entryIndex = index - firstOffset;
    return entryIndex >= 0 && entryIndex < entries.length ? entries[entryIndex] : null;
  });

  return (
    <aside className="calendar-panel">
      <div className="calendar-panel-inner">
        <div className="calendar-header">
          <div>
            <span className="eyebrow">
              <CalendarDays size={14} strokeWidth={1.7} />
              Digital outfit journal
            </span>
            <h1 className="title">Outfit Diary</h1>
            <p className="subtitle">Check the calendar on the left, then jump into that day’s recording.</p>
          </div>

          <label className="selector">
            <span>Year</span>
            <select value={year} onChange={(event) => setYear(Number(event.target.value))}>
              {YEAR_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="month-pill-row" aria-label="Month selector">
          {MONTH_NAMES.slice(0, 4).map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => setMonth(index)}
              className={`month-pill ${month === index ? "month-pill-active" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="calendar-summary">
          <div className="calendar-summary-copy">
            <h2>Outfit Mood</h2>
            <p>Your journal by day</p>
          </div>
          {selectedEntry ? (
            <div className="selected-badge">
              <span>{selectedEntry.monthLabel}</span>
              <strong>{selectedEntry.occasion}</strong>
            </div>
          ) : null}
        </div>

        <section className="mood-calendar-card paper-card">
          <div className="mood-calendar-weekdays">
            {WEEKDAY_LABELS.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
          <div className="mood-calendar-grid">
            {cells.map((entry, index) => (
              <MoodDot
                key={entry?.id ?? `empty-${index}`}
                entry={entry}
                isSelected={selectedEntry?.id === entry?.id}
                onSelect={onSelectEntry}
              />
            ))}
          </div>
        </section>

        <button type="button" className="recording-now-button" onClick={onRecordingNow}>
          Recording now
        </button>
      </div>
    </aside>
  );
}

function ReelPanel({ entries, selectedEntry }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const reelItems = entries.slice(0, 12);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % reelItems.length);
    }, 2200);

    return () => window.clearInterval(timer);
  }, [reelItems.length]);

  const activeEntry = reelItems[activeIndex] ?? selectedEntry;

  return (
    <section className="reel-panel">
      <div className="thumbnail-wall">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeEntry?.id ?? "empty"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.22 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="thumbnail-glow"
            style={{
              background: activeEntry
                ? `radial-gradient(circle at center, ${activeEntry.palette[1]}, transparent 72%)`
                : "radial-gradient(circle at center, var(--surface-butter), transparent 72%)",
            }}
          />
        </AnimatePresence>

        <div className="thumbnail-grid">
          {reelItems.map((entry, index) => (
            <motion.div
              key={entry.id}
              animate={{
                opacity: index === activeIndex ? 1 : 0.58,
                scale: index === activeIndex ? 1.04 : 1,
                y: index === activeIndex ? -4 : 0,
              }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className={`reel-thumb ${selectedEntry?.id === entry.id ? "reel-thumb-selected" : ""}`}
              style={{
                background: `linear-gradient(145deg, ${entry.palette[0]}, ${entry.palette[1]} 55%, ${entry.palette[2]})`,
              }}
            >
              <span className="reel-thumb-date">{entry.day}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RecordingPanel({ customImage, form, onFieldChange, onImageChange, selectedEntry, recordingRef }) {
  const previewStyle = customImage
    ? { backgroundImage: `url(${customImage})` }
    : {
        background: selectedEntry
          ? `linear-gradient(145deg, ${selectedEntry.palette[0]}, ${selectedEntry.palette[1]} 55%, ${selectedEntry.palette[2]})`
          : "linear-gradient(145deg, var(--surface-butter), var(--surface-rose))",
      };

  return (
    <section ref={recordingRef} className="recording-panel">
      <div className="recording-topbar">
        <div>
          <span className="eyebrow">Recording page</span>
          <h2>{form.title || "A page for today's outfit"}</h2>
          {selectedEntry ? <p className="selected-date-note">{selectedEntry.monthLabel} · {selectedEntry.dayName}</p> : null}
        </div>
      </div>

      <div className="editor-layout">
        <div className="editor-photo-panel">
          <div className="editor-photo-shell paper-card">
            <div className="editor-photo" style={previewStyle}>
              {!customImage ? (
                <div className="editor-photo-placeholder">
                  <ImagePlus size={24} strokeWidth={1.8} />
                  <span>Add outfit photo</span>
                </div>
              ) : null}
            </div>
          </div>
          <label className="upload-button">
            <ImagePlus size={16} strokeWidth={1.8} />
            <span>Upload picture</span>
            <input type="file" accept="image/*" onChange={onImageChange} hidden />
          </label>
        </div>

        <div className="editor-fields">
          <label className="editor-field">
            <span>Page title</span>
            <input name="title" value={form.title} onChange={onFieldChange} placeholder="Soft trench, cream knit, red flats" />
          </label>
          <label className="editor-field">
            <span>Occasion</span>
            <input name="occasion" value={form.occasion} onChange={onFieldChange} placeholder="Bookstore afternoon" />
          </label>
          <div className="editor-metrics">
            <label className="editor-field">
              <span>Temperature</span>
              <input name="temperature" value={form.temperature} onChange={onFieldChange} placeholder="21°C" />
            </label>
            <label className="editor-field">
              <span>Journal mood</span>
              <input name="rating" value={form.rating} onChange={onFieldChange} placeholder="Soft, playful, polished" />
            </label>
          </div>
          <label className="editor-field">
            <span>Thoughts</span>
            <textarea
              name="thoughts"
              value={form.thoughts}
              onChange={onFieldChange}
              placeholder="Write what the outfit felt like, where the day went, and what you want to remember."
              rows={7}
            />
          </label>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(Math.min(today.getMonth(), 3));
  const [customImage, setCustomImage] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const recordingRef = useRef(null);
  const [form, setForm] = useState({
    title: "Quiet color, polished layers",
    occasion: "Late afternoon cafe sketching",
    temperature: "21°C",
    rating: "Soft, playful, polished",
    thoughts: "今天想把颜色穿得更明显一点。珊瑚色鞋子和奶油色上衣碰在一起，整个人都明亮了，像是把一点点夕阳留在身上。",
  });

  const monthEntries = useMemo(() => getMonthEntries(year, month), [month, year]);

  useEffect(() => {
    setSelectedEntry(monthEntries[0] ?? null);
  }, [monthEntries]);

  useEffect(() => () => {
    if (customImage) {
      URL.revokeObjectURL(customImage);
    }
  }, [customImage]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (customImage) {
      URL.revokeObjectURL(customImage);
    }

    setCustomImage(URL.createObjectURL(file));
  };

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSelectEntry = (entry) => {
    setSelectedEntry(entry);
    setForm((current) => ({
      ...current,
      title: `${entry.title} · ${entry.dayName}`,
      occasion: entry.occasion,
      temperature: `${entry.temperature}°C`,
      thoughts: entry.thought,
    }));
  };

  const handleRecordingNow = () => {
    recordingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="min-h-screen bg-[color:var(--paper)] text-[color:var(--ink)]">
      <div className="paper-noise" />
      <div className="color-wash color-wash-one" />
      <div className="color-wash color-wash-two" />
      <div className="color-wash color-wash-three" />

      <section className="mx-auto flex min-h-screen w-full max-w-[1680px] flex-col px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
        <div className="landing-split">
          <CalendarPanel
            year={year}
            month={month}
            setYear={setYear}
            setMonth={setMonth}
            entries={monthEntries}
            selectedEntry={selectedEntry}
            onSelectEntry={handleSelectEntry}
            onRecordingNow={handleRecordingNow}
          />

          <div className="right-rail">
            <ReelPanel entries={monthEntries} selectedEntry={selectedEntry} />
            <RecordingPanel
              customImage={customImage}
              form={form}
              onFieldChange={handleFieldChange}
              onImageChange={handleImageChange}
              selectedEntry={selectedEntry}
              recordingRef={recordingRef}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
