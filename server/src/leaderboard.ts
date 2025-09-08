// src/leaderboard.ts
import fs from "fs";
import path from "path";
import { LeaderboardEntry } from "./types.ts";

const DATA_DIR = path.resolve(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "leaderboard.json");

// keep a small in-memory buffer; still persist to disk for history
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
        // basic sanitize
        entries = arr.filter(
            (e) =>
                typeof e.nickname === "string" &&
                e.nickname.length > 0 &&
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
        // keep file size tidy (top 100 by score, newest first on ties)
        const sorted = [...entries].sort((a, b) =>
            b.score !== a.score ? b.score - a.score : b.playedAt.localeCompare(a.playedAt)
        );
        fs.writeFileSync(FILE, JSON.stringify(sorted.slice(0, 100), null, 2), "utf8");
    } catch {
        // ignore disk errors; in-memory will still work
    }
}

export function initLeaderboard() {
    loadFromDisk();
}

export function submitScore(nickname: string, score: number): LeaderboardEntry {
    // normalize + validate
    const n = (nickname ?? "").trim().slice(0, 24);
    if (!n) throw new Error("Nickname is required");
    if (!Number.isInteger(score) || score < 0) throw new Error("Score must be a non-negative integer");

    const entry: LeaderboardEntry = { nickname: n, score, playedAt: new Date().toISOString() };
    entries.push(entry);
    saveToDisk();
    return entry;
}

export function getTop(limit = 10): LeaderboardEntry[] {
    const sorted = [...entries].sort((a, b) =>
        b.score !== a.score ? b.score - a.score : b.playedAt.localeCompare(a.playedAt)
    );
    return sorted.slice(0, limit);
}
