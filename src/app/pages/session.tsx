import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Pause, Play, Square, Droplets, Camera } from "lucide-react";
import { Avatar } from "../components/avatar";
import { useStore } from "../components/store";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

const TIPS = [
  "细细咀嚼，感受食物的层次",
  "放下手机，专注这一口",
  "注意食物的温度和口感",
  "每一口都值得被好好品味",
  "慢下来，这不是竞赛",
  "感受身体的饱腹信号",
  "享受此刻的宁静",
  "不急，你有的是时间",
];

export function SessionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    settings,
    startSession,
    endSession,
    currentSession,
    addBite,
    pauseSession,
    resumeSession,
    addWater,
    setSessionPhoto,
  } = useStore();

  const [elapsed, setElapsed] = useState(0);
  const [biteProgress, setBiteProgress] = useState(0);
  const [biteCount, setBiteCount] = useState(0);
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);
  const [tip, setTip] = useState("");
  const [specialAction, setSpecialAction] = useState<"drink" | "happy" | null>(null);
  const [waterCount, setWaterCount] = useState(0);
  const [showWaterToast, setShowWaterToast] = useState(false);
  const [showPhotoPreview, setShowPhotoPreview] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);
  const biteIntervalRef = useRef<number | null>(null);
  const sessionStarted = useRef(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const photoPromptShown = useRef(false);

  // Initialize session
  useEffect(() => {
    if (!sessionStarted.current) {
      sessionStarted.current = true;
      startSession();
    }
  }, [startSession]);

  // Handle photo=true query param - prompt camera after session starts
  useEffect(() => {
    if (searchParams.get("photo") === "true" && currentSession && !photoPromptShown.current) {
      photoPromptShown.current = true;
      // Small delay to let the page render first
      setTimeout(() => {
        photoInputRef.current?.click();
      }, 500);
    }
  }, [searchParams, currentSession]);

  // Main timer
  useEffect(() => {
    if (currentSession && !currentSession.isPaused) {
      intervalRef.current = window.setInterval(() => {
        const now = Date.now();
        const totalElapsed = Math.floor(
          (now - currentSession.startTime - currentSession.totalPausedTime) / 1000
        );
        setElapsed(totalElapsed);
      }, 200);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentSession?.isPaused, currentSession?.startTime, currentSession?.totalPausedTime]);

  // Bite cycle
  useEffect(() => {
    if (currentSession && !currentSession.isPaused) {
      const interval = settings.biteInterval;
      let progress = 0;

      biteIntervalRef.current = window.setInterval(() => {
        progress += 100 / (interval * 10);
        if (progress >= 100) {
          progress = 0;
          triggerBite();
        }
        setBiteProgress(Math.min(progress, 100));
      }, 100);
    }
    return () => {
      if (biteIntervalRef.current) clearInterval(biteIntervalRef.current);
    };
  }, [currentSession?.isPaused, settings.biteInterval]);

  const triggerBite = useCallback(() => {
    addBite();
    setBiteCount((prev) => prev + 1);

    // Random tip
    if (Math.random() < 0.25) {
      setTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
      setTimeout(() => setTip(""), 4000);
    }

    // Random special actions (low frequency)
    const rand = Math.random();
    if (rand < 0.06) {
      setSpecialAction("drink");
      setTimeout(() => setSpecialAction(null), 2500);
    } else if (rand < 0.1) {
      setSpecialAction("happy");
      setTimeout(() => setSpecialAction(null), 2000);
    }
  }, [addBite]);

  const handlePause = () => {
    if (currentSession?.isPaused) {
      resumeSession();
    } else {
      pauseSession();
    }
  };

  const handleDrinkWater = () => {
    addWater();
    setWaterCount((prev) => prev + 1);
    setSpecialAction("drink");
    setShowWaterToast(true);
    setTimeout(() => setSpecialAction(null), 2500);
    setTimeout(() => setShowWaterToast(false), 2000);
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        // Resize to 400x400 for reasonable storage
        const canvas = document.createElement("canvas");
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext("2d")!;
        const size = Math.min(img.width, img.height);
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        ctx.drawImage(img, sx, sy, size, size, 0, 0, 400, 400);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        setSessionPhoto(dataUrl);
        setShowPhotoPreview(dataUrl);
        setTimeout(() => setShowPhotoPreview(null), 2500);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const handleEnd = () => {
    if (elapsed < 30) {
      setShowConfirmEnd(true);
      return;
    }
    finishSession();
  };

  const finishSession = () => {
    const session = endSession();
    if (session) {
      const duration = Math.floor(
        (Date.now() - session.startTime - session.totalPausedTime) / 1000
      );
      const bites = session.biteTimestamps;
      const intervals: number[] = [];
      for (let i = 1; i < bites.length; i++) {
        intervals.push((bites[i] - bites[i - 1]) / 1000);
      }
      const avgInterval = intervals.length > 0
        ? intervals.reduce((a, b) => a + b, 0) / intervals.length : 0;

      const durationScore = Math.min(duration / 900, 1) * 40;
      const consistencyScore = intervals.length > 0
        ? Math.max(0, 30 - (intervals.reduce((acc, v) => acc + Math.abs(v - settings.biteInterval), 0) / intervals.length) * 2) : 15;
      const interruptionPenalty = session.interruptions * 5;
      const focusScore = Math.round(Math.min(100, Math.max(0,
        durationScore + consistencyScore + 30 - interruptionPenalty
      )));

      const summaryData = {
        duration,
        biteCount: bites.length,
        avgInterval: Math.round(avgInterval),
        interruptions: session.interruptions,
        focusScore,
        startTime: session.startTime,
        biteTimestamps: bites,
        photo: session.photo,
        waterCount: session.waterCount,
      };

      sessionStorage.setItem("sloweat_summary", JSON.stringify(summaryData));
      navigate("/summary");
    }
  };

  const isPaused = currentSession?.isPaused ?? false;

  // Progress bar width
  const progressPercent = Math.min(biteProgress, 100);

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {/* Hidden photo input */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handlePhotoCapture}
      />

      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-start justify-between relative z-10">
        <div>
          <p className="text-muted-foreground" style={{ fontSize: 12, letterSpacing: 1 }}>EATING</p>
          <p className="text-foreground tabular-nums mt-0.5" style={{ fontSize: 36 }}>
            {formatTime(elapsed)}
          </p>
        </div>
        <div className="text-right mt-1">
          <p className="text-muted-foreground" style={{ fontSize: 12 }}>已吃</p>
          <p className="text-foreground tabular-nums" style={{ fontSize: 28 }}>
            {biteCount}<span style={{ fontSize: 13 }} className="text-muted-foreground ml-0.5">口</span>
          </p>
        </div>
      </div>

      {/* Single progress bar */}
      <div className="px-6 mb-2">
        <div className="h-1.5 bg-accent rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: "var(--primary)",
            }}
            transition={{ duration: 0.1 }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-muted-foreground" style={{ fontSize: 11 }}>节奏引导</span>
          <span className="text-muted-foreground" style={{ fontSize: 11 }}>每 {settings.biteInterval}s 一口</span>
        </div>
      </div>

      {/* Main area - Avatar eating scene */}
      <div className="flex-1 flex flex-col items-center justify-center relative px-6">
        {/* Tip bubble */}
        <AnimatePresence>
          {tip && !isPaused && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute top-6 left-6 right-6 z-10"
            >
              <div className="bg-card/90 backdrop-blur-sm rounded-xl px-4 py-3 border border-border text-center">
                <p style={{ fontSize: 13 }} className="text-muted-foreground">{tip}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Water toast */}
        <AnimatePresence>
          {showWaterToast && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              className="absolute top-6 z-20"
            >
              <div className="bg-[#7EB5C4]/15 backdrop-blur-sm rounded-full px-5 py-2.5 border border-[#7EB5C4]/20 flex items-center gap-2">
                <Droplets size={15} className="text-[#7EB5C4]" />
                <span style={{ fontSize: 13 }} className="text-[#7EB5C4]">
                  喝水 +1 · 已喝{waterCount}杯
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Photo preview toast */}
        <AnimatePresence>
          {showPhotoPreview && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-6 z-20"
            >
              <div className="bg-card/95 backdrop-blur-sm rounded-2xl p-2 border border-border shadow-lg flex items-center gap-3">
                <img
                  src={showPhotoPreview}
                  alt="meal"
                  className="w-14 h-14 rounded-xl object-cover"
                />
                <div className="pr-3">
                  <p style={{ fontSize: 13 }} className="text-foreground">照片已记录</p>
                  <p style={{ fontSize: 11 }} className="text-muted-foreground">会保存到用餐日记</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dining scene */}
        <div className="relative flex flex-col items-center">
          {/* Avatar - always eating during active session */}
          <Avatar
            config={settings.avatarConfig}
            size={160}
            isEating={!isPaused}
            specialAction={specialAction}
            showCard
          />

          {/* Table surface */}
          <div className="relative -mt-2 w-56">
            <svg viewBox="0 0 224 40" className="w-full">
              {/* Table top */}
              <ellipse cx="112" cy="16" rx="108" ry="14" fill="#E8DDD6" />
              <ellipse cx="112" cy="13" rx="102" ry="11" fill="#F3EDEA" />
              {/* Food items */}
              <circle cx="70" cy="11" r="7" fill="#C4856C" opacity="0.6" />
              <circle cx="90" cy="9" r="5.5" fill="#94B8A0" opacity="0.6" />
              <circle cx="130" cy="10" r="6" fill="#D4AA6A" opacity="0.6" />
              <rect x="148" y="5" width="10" height="14" rx="3" fill="#A894C4" opacity="0.4" />
              <circle cx="112" cy="12" r="4" fill="#C95D5D" opacity="0.5" />
            </svg>
          </div>
        </div>

        {/* Session stats row */}
        <div className="mt-6 flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-muted-foreground" style={{ fontSize: 12 }}>
            <span>⏱ {Math.floor(elapsed / 60)}分钟</span>
          </div>
          <div className="w-px h-3 bg-border" />
          <div className="flex items-center gap-1.5 text-muted-foreground" style={{ fontSize: 12 }}>
            <span>间隔 {settings.biteInterval}s</span>
          </div>
          {waterCount > 0 && (
            <>
              <div className="w-px h-3 bg-border" />
              <div className="flex items-center gap-1.5 text-[#7EB5C4]" style={{ fontSize: 12 }}>
                <Droplets size={11} />
                <span>{waterCount}杯</span>
              </div>
            </>
          )}
        </div>

        {/* Photo thumbnail if taken */}
        {currentSession?.photo && (
          <motion.div
            className="mt-3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center gap-2 bg-card/80 rounded-full px-3 py-1.5 border border-border">
              <img
                src={currentSession.photo}
                alt=""
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="text-muted-foreground" style={{ fontSize: 11 }}>已拍照</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Paused overlay */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/85 flex flex-col items-center justify-center z-20 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center px-8"
            >
              <p style={{ fontSize: 40 }}>☕</p>
              <p className="text-foreground mt-3" style={{ fontSize: 18 }}>暂时离开一下</p>
              <p className="text-muted-foreground mt-1.5" style={{ fontSize: 13, lineHeight: 1.5 }}>
                没关系，喝口水放松一下<br />准备好了就继续
              </p>
              <button
                onClick={handlePause}
                className="mt-8 bg-primary text-primary-foreground rounded-full px-8 py-3 flex items-center gap-2 mx-auto active:scale-[0.97] transition-transform"
              >
                <Play size={18} />
                <span>继续用餐</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm end */}
      <AnimatePresence>
        {showConfirmEnd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20 flex items-center justify-center z-30 px-5"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-card rounded-2xl p-6 w-full max-w-sm border border-border"
            >
              <p className="text-foreground text-center" style={{ fontSize: 15 }}>还不到30秒，确定结束吗？</p>
              <p className="text-muted-foreground text-center mt-1" style={{ fontSize: 13 }}>再多待一会儿也好~</p>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowConfirmEnd(false)}
                  className="flex-1 bg-secondary text-secondary-foreground rounded-xl py-3"
                >
                  再吃一会
                </button>
                <button
                  onClick={finishSession}
                  className="flex-1 bg-foreground text-background rounded-xl py-3"
                >
                  结束
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control bar */}
      <div className="px-6 pb-8 pt-4 flex items-center justify-center gap-4">
        <button
          onClick={handlePause}
          className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center active:scale-95 transition-transform"
        >
          <Pause size={18} className="text-foreground" />
        </button>

        <button
          onClick={handleDrinkWater}
          className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center active:scale-95 transition-transform relative"
        >
          <Droplets size={18} className="text-[#7EB5C4]" />
          {waterCount > 0 && (
            <span
              className="absolute -top-1 -right-1 bg-[#7EB5C4] text-white rounded-full flex items-center justify-center"
              style={{ width: 18, height: 18, fontSize: 10 }}
            >
              {waterCount}
            </span>
          )}
        </button>

        <button
          onClick={handleEnd}
          className="w-16 h-16 rounded-full bg-foreground text-background flex flex-col items-center justify-center active:scale-95 transition-transform"
        >
          <Square size={18} />
          <span style={{ fontSize: 10, marginTop: 1 }}>结束</span>
        </button>

        <button
          onClick={() => photoInputRef.current?.click()}
          className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center active:scale-95 transition-transform relative"
        >
          <Camera size={18} className="text-primary" />
          {currentSession?.photo && (
            <span
              className="absolute -top-1 -right-1 bg-primary text-white rounded-full flex items-center justify-center"
              style={{ width: 18, height: 18, fontSize: 10 }}
            >
              ✓
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
