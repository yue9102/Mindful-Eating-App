import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User, Timer, Volume2, VolumeX, Shield, Download,
  Trash2, ChevronRight, Upload, Palette, Scissors, Image as ImageIcon, X
} from "lucide-react";
import { Avatar } from "../components/avatar";
import { useStore, AvatarConfig } from "../components/store";

const HAIR_NAMES = ["长发", "波波头", "马尾", "短发", "丸子头", "卷发"];
const HAIR_COLORS = ["#5C3A1E", "#2D2926", "#8B5E3C", "#C4856C", "#D4AA6A", "#1A1A2E"];
const HAIR_COLOR_NAMES = ["棕色", "黑色", "浅棕", "红棕", "金色", "深蓝黑"];
const SKIN_TONES = ["#F5D5C0", "#F0C8A8", "#E0B090", "#C49070", "#A07050", "#FFE5D5"];
const OUTFIT_NAMES = ["基础款", "连衣裙", "针织衫", "西装", "背带裤", "高领"];
const OUTFIT_COLORS = ["#C4856C", "#7EB5C4", "#A894C4", "#2D2926", "#94B8A0", "#D4AA6A"];
const ACCESSORY_NAMES = ["无", "眼镜", "蝴蝶结", "耳环", "帽子"];
const BG_COLORS = ["#B8C9E8", "#C5E8B8", "#E8B8C5", "#E8D5B8", "#D5B8E8", "#B8E8D5"];

export function SettingsPage() {
  const { settings, updateSettings, entries } = useStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showExportDone, setShowExportDone] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [customizerTab, setCustomizerTab] = useState<"hair" | "face" | "outfit" | "acc">("hair");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const config = settings.avatarConfig;

  const updateAvatar = (partial: Partial<AvatarConfig>) => {
    updateSettings({ avatarConfig: { ...config, ...partial } });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        // Resize to 200x200
        const canvas = document.createElement("canvas");
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext("2d")!;
        const size = Math.min(img.width, img.height);
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        ctx.drawImage(img, sx, sy, size, size, 0, 0, 200, 200);
        updateAvatar({ uploadedImage: canvas.toDataURL("image/jpeg", 0.8) });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    updateAvatar({ uploadedImage: undefined });
  };

  const handleExport = () => {
    const data = JSON.stringify(entries, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sloweat_diary_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportDone(true);
    setTimeout(() => setShowExportDone(false), 2000);
  };

  const handleClearAll = () => {
    localStorage.removeItem("sloweat_entries");
    window.location.reload();
  };

  return (
    <div className="flex flex-col px-6 pt-8 pb-6 min-h-full">
      <h1 className="text-foreground mb-6">设置</h1>

      {/* Avatar Preview + Actions */}
      <motion.div
        className="bg-card rounded-2xl p-5 border border-border mb-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <User size={15} className="text-primary" />
          <p className="text-foreground" style={{ fontSize: 14 }}>我的化身</p>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex-shrink-0">
            <Avatar config={config} size={100} showCard />
          </div>
          <div className="flex-1 space-y-2.5">
            <button
              onClick={() => setShowCustomizer(true)}
              className="w-full flex items-center gap-2 bg-secondary rounded-lg px-3 py-2.5 active:scale-[0.98] transition-transform"
            >
              <Scissors size={14} className="text-primary" />
              <span style={{ fontSize: 13 }} className="text-foreground">自定义捏脸</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-2 bg-secondary rounded-lg px-3 py-2.5 active:scale-[0.98] transition-transform"
            >
              <Upload size={14} className="text-primary" />
              <span style={{ fontSize: 13 }} className="text-foreground">上传照片</span>
            </button>
            {config.uploadedImage && (
              <button
                onClick={handleRemoveImage}
                className="w-full flex items-center gap-2 bg-secondary rounded-lg px-3 py-2.5 active:scale-[0.98] transition-transform"
              >
                <X size={14} className="text-destructive" />
                <span style={{ fontSize: 13 }} className="text-muted-foreground">移除照片</span>
              </button>
            )}
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
        <p className="text-muted-foreground mt-3" style={{ fontSize: 11, lineHeight: 1.5 }}>
          上传照片后将替换像素化身。照片仅保存在本地设备。
        </p>
      </motion.div>

      {/* User Name */}
      <motion.div
        className="bg-card rounded-2xl p-5 border border-border mb-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <p className="text-foreground mb-2" style={{ fontSize: 13 }}>称呼</p>
        <input
          type="text"
          value={settings.userName}
          onChange={(e) => updateSettings({ userName: e.target.value })}
          placeholder="怎么称呼你？"
          className="w-full bg-input-background rounded-lg px-4 py-2.5 text-foreground placeholder:text-muted-foreground/40 border border-border"
          style={{ fontSize: 14 }}
        />
      </motion.div>

      {/* Bite Interval */}
      <motion.div
        className="bg-card rounded-2xl p-5 border border-border mb-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Timer size={15} className="text-primary" />
          <p className="text-foreground" style={{ fontSize: 14 }}>每口节奏</p>
          <span className="ml-auto text-primary" style={{ fontSize: 16 }}>
            {settings.biteInterval}s
          </span>
        </div>
        <input
          type="range"
          min={8}
          max={25}
          step={1}
          value={settings.biteInterval}
          onChange={(e) => updateSettings({ biteInterval: Number(e.target.value) })}
          className="w-full accent-primary"
        />
        <div className="flex justify-between mt-1.5">
          <span className="text-muted-foreground" style={{ fontSize: 11 }}>快 8s</span>
          <span className="text-muted-foreground" style={{ fontSize: 11 }}>推荐 15s</span>
          <span className="text-muted-foreground" style={{ fontSize: 11 }}>慢 25s</span>
        </div>
      </motion.div>

      {/* Sound Toggle */}
      <motion.div
        className="bg-card rounded-2xl p-5 border border-border mb-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <button onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })} className="w-full flex items-center gap-3">
          {settings.soundEnabled ? <Volume2 size={15} className="text-primary" /> : <VolumeX size={15} className="text-muted-foreground" />}
          <span className="text-foreground flex-1 text-left" style={{ fontSize: 14 }}>提示音</span>
          <div className={`w-11 h-6 rounded-full relative transition-colors ${settings.soundEnabled ? "bg-primary" : "bg-switch-background"}`}>
            <motion.div
              className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm"
              animate={{ left: settings.soundEnabled ? 22 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </div>
        </button>
      </motion.div>

      {/* Privacy & Data */}
      <motion.div
        className="bg-card rounded-2xl border border-border mb-4 overflow-hidden"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2 px-5 pt-4 pb-2">
          <Shield size={15} className="text-primary" />
          <p className="text-foreground" style={{ fontSize: 14 }}>隐私与数据</p>
        </div>
        <p className="px-5 pb-3 text-muted-foreground" style={{ fontSize: 12 }}>
          所有数据仅保存在你的设备上，不会上传至任何服务器。
        </p>
        <button
          onClick={handleExport}
          className="w-full flex items-center gap-3 px-5 py-3.5 border-t border-border active:bg-secondary/50 transition-colors"
        >
          <Download size={15} className="text-muted-foreground" />
          <span className="text-foreground flex-1 text-left" style={{ fontSize: 14 }}>导出数据</span>
          {showExportDone ? (
            <span className="text-[#94B8A0]" style={{ fontSize: 12 }}>已导出</span>
          ) : (
            <ChevronRight size={14} className="text-muted-foreground" />
          )}
        </button>
        <button
          onClick={() => setShowClearConfirm(true)}
          className="w-full flex items-center gap-3 px-5 py-3.5 border-t border-border active:bg-secondary/50 transition-colors"
        >
          <Trash2 size={15} className="text-destructive" />
          <span className="text-destructive flex-1 text-left" style={{ fontSize: 14 }}>清除所有数据</span>
          <ChevronRight size={14} className="text-muted-foreground" />
        </button>
      </motion.div>

      {/* Footer */}
      <div className="text-center mt-4 mb-2">
        <p className="text-muted-foreground" style={{ fontSize: 11 }}>陪你慢慢吃 v1.0</p>
      </div>

      {/* Clear confirm */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 px-5"
          >
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
              className="bg-card rounded-2xl p-6 w-full max-w-sm border border-border"
            >
              <p className="text-foreground text-center" style={{ fontSize: 15 }}>确定清除所有数据？</p>
              <p className="text-muted-foreground text-center mt-1" style={{ fontSize: 13 }}>这将永久删除全部记录和设置</p>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowClearConfirm(false)} className="flex-1 bg-secondary text-secondary-foreground rounded-xl py-3">取消</button>
                <button onClick={handleClearAll} className="flex-1 bg-destructive text-destructive-foreground rounded-xl py-3">清除</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar Customizer Panel */}
      <AnimatePresence>
        {showCustomizer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20 z-60 flex items-end justify-center"
            onClick={(e) => { if (e.target === e.currentTarget) setShowCustomizer(false); }}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-card w-full max-w-md rounded-t-3xl border-t border-border"
              style={{ maxHeight: "80vh" }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-accent" />
              </div>

              {/* Preview */}
              <div className="flex items-center justify-between px-5 pb-4">
                <div>
                  <p className="text-foreground" style={{ fontSize: 16 }}>自定义化身</p>
                  <p className="text-muted-foreground" style={{ fontSize: 12 }}>选择你喜欢的风格</p>
                </div>
                <Avatar config={config} size={80} showCard />
              </div>

              {/* Tabs */}
              <div className="flex px-5 gap-1 mb-3">
                {([
                  { key: "hair" as const, label: "发型" },
                  { key: "face" as const, label: "肤色" },
                  { key: "outfit" as const, label: "服装" },
                  { key: "acc" as const, label: "配饰" },
                ]).map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setCustomizerTab(tab.key)}
                    className={`flex-1 py-2 rounded-lg transition-colors ${
                      customizerTab === tab.key
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                    style={{ fontSize: 13 }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="px-5 pb-6 overflow-y-auto" style={{ maxHeight: "40vh" }}>
                {customizerTab === "hair" && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-muted-foreground mb-2" style={{ fontSize: 12 }}>发型</p>
                      <div className="grid grid-cols-3 gap-2">
                        {HAIR_NAMES.map((name, i) => (
                          <button
                            key={i}
                            onClick={() => updateAvatar({ hairStyle: i })}
                            className={`py-2.5 rounded-lg border transition-all ${
                              config.hairStyle === i
                                ? "border-primary bg-primary/5 text-foreground"
                                : "border-border text-muted-foreground"
                            }`}
                            style={{ fontSize: 13 }}
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-2" style={{ fontSize: 12 }}>发色</p>
                      <div className="flex gap-2.5">
                        {HAIR_COLORS.map((color, i) => (
                          <button
                            key={color}
                            onClick={() => updateAvatar({ hairColor: color })}
                            className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                              config.hairColor === color ? "border-primary scale-110" : "border-transparent"
                            }`}
                          >
                            <div className="w-7 h-7 rounded-full" style={{ backgroundColor: color }} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {customizerTab === "face" && (
                  <div>
                    <p className="text-muted-foreground mb-2" style={{ fontSize: 12 }}>肤色</p>
                    <div className="flex gap-3">
                      {SKIN_TONES.map((tone) => (
                        <button
                          key={tone}
                          onClick={() => updateAvatar({ skinTone: tone })}
                          className={`w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center ${
                            config.skinTone === tone ? "border-primary scale-110" : "border-transparent"
                          }`}
                        >
                          <div className="w-9 h-9 rounded-full" style={{ backgroundColor: tone }} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {customizerTab === "outfit" && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-muted-foreground mb-2" style={{ fontSize: 12 }}>款式</p>
                      <div className="grid grid-cols-3 gap-2">
                        {OUTFIT_NAMES.map((name, i) => (
                          <button
                            key={i}
                            onClick={() => updateAvatar({ outfitStyle: i })}
                            className={`py-2.5 rounded-lg border transition-all ${
                              config.outfitStyle === i
                                ? "border-primary bg-primary/5 text-foreground"
                                : "border-border text-muted-foreground"
                            }`}
                            style={{ fontSize: 13 }}
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-2" style={{ fontSize: 12 }}>颜色</p>
                      <div className="flex gap-2.5">
                        {OUTFIT_COLORS.map((color) => (
                          <button
                            key={color}
                            onClick={() => updateAvatar({ outfitColor: color })}
                            className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                              config.outfitColor === color ? "border-primary scale-110" : "border-transparent"
                            }`}
                          >
                            <div className="w-7 h-7 rounded-full" style={{ backgroundColor: color }} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {customizerTab === "acc" && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-muted-foreground mb-2" style={{ fontSize: 12 }}>配饰</p>
                      <div className="grid grid-cols-3 gap-2">
                        {ACCESSORY_NAMES.map((name, i) => (
                          <button
                            key={i}
                            onClick={() => updateAvatar({ accessory: i })}
                            className={`py-2.5 rounded-lg border transition-all ${
                              config.accessory === i
                                ? "border-primary bg-primary/5 text-foreground"
                                : "border-border text-muted-foreground"
                            }`}
                            style={{ fontSize: 13 }}
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-2" style={{ fontSize: 12 }}>背景卡片颜色</p>
                      <div className="flex gap-2.5">
                        {BG_COLORS.map((color) => (
                          <button
                            key={color}
                            onClick={() => updateAvatar({ bgColor: color })}
                            className={`w-10 h-10 rounded-lg border-2 transition-all flex items-center justify-center ${
                              config.bgColor === color ? "border-primary scale-110" : "border-transparent"
                            }`}
                          >
                            <div className="w-7 h-7 rounded-lg" style={{ backgroundColor: color }} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Done button */}
              <div className="px-5 pb-8 pt-2">
                <button
                  onClick={() => setShowCustomizer(false)}
                  className="w-full bg-primary text-primary-foreground rounded-xl py-3 active:scale-[0.98] transition-transform"
                >
                  完成
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
