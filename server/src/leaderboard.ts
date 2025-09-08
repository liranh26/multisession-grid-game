/**
 * Leaderboard Persistence
 * -----------------------
 * Purpose: Stores and retrieves high scores from disk (JSON file) and
 * provides small guardrails to control when nickname submission is allowed.
 *
 * Typical exports:
 * - initLeaderboard(): Load scores from disk on process start.
 * - acceptIfOpen(): Returns boolean indicating whether submission UI should be shown.
 * - submitScore(nickname, score): Append a new entry (with ISO playedAt), persist.
 * - getTop(limit): Return the top N scores (tie-break by playedAt).
 *
 * File I/O:
 * - Writes a sorted, truncated list to a JSON file (top 100 by default).
 * - Uses a simple schema: { nickname: string, score: number, playedAt: ISO string }.
 *
 * Last documented: 2025-09-08 09:37:12
 */
// src/leaderboard.ts
import fs from "fs";
import path from "path";

export type LeaderboardEntry = {
    nickname: string;
    score: number;
    playedAt: string; // ISO date
};

// --- add at top-level module scope (near the other lets)
let canSubmitForCurrentGame = false;
let submittedForCurrentGame = false;

// Call when the game transitions to gameOver
export function markGameOverForSubmission() {
    canSubmitForCurrentGame = true;
    submittedForCurrentGame = false;
}

// Call on reset (or when a new game starts)
export function markGameReset() {
    canSubmitForCurrentGame = false;
    submittedForCurrentGame = false;
}

// Check & consume the gate
/**
 * Return whether nickname submission is currently allowed based on server state/time/window.
 * @returns boolean
 */
export function acceptIfOpen(): boolean {
    if (!canSubmitForCurrentGame || submittedForCurrentGame) return false;
    submittedForCurrentGame = true;
    return true;
}

const DATA_DIR = path.resolve(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "leaderboard.json");

let entries: LeaderboardEntry[] = [];

function ensureDataFile() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, "[]", "utf8");
}

function loadFromDisk() {
    try {
        ensureDataFile();
        const raw = fs.readFileSync(FILE, "utf8");
        const arr = JSON.parse(raw) as LeaderboardEntry[];
        entries = arr.filter(
            (e) =>
                typeof e.nickname === "string" &&
                e.nickname.trim().length > 0 &&
                e.nickname.length <= 24 &&
                Number.isInteger(e.score) &&
                e.score >= 0 &&
                typeof e.playedAt === "string"
        );
    } catch {
        entries = [];
    }
}

function saveToDisk() {
    try {
        ensureDataFile();
        const sorted = [...entries].sort((a, b) =>
            b.score !== a.score ? b.score - a.score : b.playedAt.localeCompare(a.playedAt)
        );
        fs.writeFileSync(FILE, JSON.stringify(sorted.slice(0, 100), null, 2), "utf8");
    } catch {
        // ignore disk errors
    }
}

/**
 * Load leaderboard entries from disk on process start. Creates file/skeleton if missing.
 * @returns void
 */
export function initLeaderboard() {
    loadFromDisk();
}

export function submitScore(nickname: string, score: number): LeaderboardEntry {
    const n = (nickname ?? "").trim().slice(0, 24);
    if (!n) throw new Error("Nickname is required");
    if (!Number.isInteger(score) || score < 0) throw new Error("Score must be a non-negative integer");

    const entry: LeaderboardEntry = { nickname: n, score, playedAt: new Date().toISOString() };
    entries.push(entry);
    saveToDisk();
    return entry;
}

/**
 * Return the top N entries sorted by score (desc) with a stable tiebreaker by playedAt (desc).
 * @param limit How many entries to return (default 10)
 * @returns LeaderboardEntry[]
 */
export function getTop(limit = 10): LeaderboardEntry[] {
    const sorted = [...entries].sort((a, b) =>
        b.score !== a.score ? b.score - a.score : b.playedAt.localeCompare(a.playedAt)
    );
    return sorted.slice(0, limit);
}
