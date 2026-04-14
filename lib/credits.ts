export const REGEN_INTERVAL_MS = 2 * 60 * 60 * 1000; // 2 hours
export const REGEN_AMOUNT = 100;
export const MAX_CREDITS = 500;
export const STARTING_CREDITS = 100;

export interface CreditData {
  credits: number;
  lastRegen: number; // timestamp
}

export const MODEL_COSTS: Record<string, number> = {
  // Free
  "arcee-ai/trinity-large-preview:free": 0,
  "liquid/lfm-2.5-1.2b-instruct:free": 0,
  // Tiny / fast
  "google/gemma-4-31b-it": 2,
  "qwen/qwen3.5-flash-02-23": 3,
  "nvidia/nemotron-3-nano-30b-a3b": 3,
  // Small
  "anthropic/claude-haiku-4-5": 5,
  "openai/gpt-5-mini": 5,
  "openai/gpt-5-nano": 3,
  "openai/gpt-5.4-mini": 5,
  "openai/gpt-5.4-nano": 3,
  "google/gemini-3-flash-preview": 5,
  "mistralai/mistral-small-2603": 5,
  "deepseek/deepseek-chat-v3.1": 5,
  "x-ai/grok-4-fast": 6,
  "x-ai/grok-4-1-fast": 6,
  // Standard
  "anthropic/claude-sonnet-4-6": 10,
  "openai/gpt-5": 10,
  "openai/gpt-5.1": 10,
  "openai/gpt-5.2": 12,
  "openai/gpt-5.4": 12,
  "deepseek/deepseek-v3.2": 8,
  "google/gemini-3-pro-preview": 12,
  "moonshotai/kimi-k2-thinking": 10,
  // Premium
  "anthropic/claude-opus-4-6": 20,
  "openai/gpt-5.4-pro": 25,
  "openai/gpt-5.2-pro": 25,
};

export function getModelCost(modelId: string): number {
  return MODEL_COSTS[modelId] ?? 8;
}

export function loadCreditData(): CreditData {
  if (typeof window === "undefined") return { credits: STARTING_CREDITS, lastRegen: Date.now() };
  try {
    const raw = localStorage.getItem("vulcan_credits");
    if (!raw) {
      const init: CreditData = { credits: STARTING_CREDITS, lastRegen: Date.now() };
      localStorage.setItem("vulcan_credits", JSON.stringify(init));
      return init;
    }
    return JSON.parse(raw) as CreditData;
  } catch {
    return { credits: STARTING_CREDITS, lastRegen: Date.now() };
  }
}

export function saveCreditData(data: CreditData) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem("vulcan_credits", JSON.stringify(data)); } catch {}
}

/** Recalculate credits accounting for time-based regen. Returns updated data. */
export function refreshCredits(): CreditData {
  const data = loadCreditData();
  const now = Date.now();
  const periods = Math.floor((now - data.lastRegen) / REGEN_INTERVAL_MS);
  if (periods > 0) {
    const newCredits = Math.min(data.credits + periods * REGEN_AMOUNT, MAX_CREDITS);
    const newLastRegen = data.lastRegen + periods * REGEN_INTERVAL_MS;
    const updated: CreditData = { credits: newCredits, lastRegen: newLastRegen };
    saveCreditData(updated);
    return updated;
  }
  return data;
}

export function deductCredits(amount: number): CreditData {
  const data = refreshCredits();
  const updated: CreditData = { ...data, credits: Math.max(0, data.credits - amount) };
  saveCreditData(updated);
  return updated;
}

export function setCreditsAdmin(amount: number): CreditData {
  const data = loadCreditData();
  const updated: CreditData = { ...data, credits: Math.min(amount, MAX_CREDITS) };
  saveCreditData(updated);
  return updated;
}

export function msUntilNextRegen(): number {
  const data = loadCreditData();
  const elapsed = Date.now() - data.lastRegen;
  return Math.max(0, REGEN_INTERVAL_MS - (elapsed % REGEN_INTERVAL_MS));
}

export function formatCountdown(ms: number): string {
  const totalSecs = Math.floor(ms / 1000);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
