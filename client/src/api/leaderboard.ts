// src/api/leaderboard.ts
export type SubmitPayload = { nickname: string; score: number };
export type TopResponse<T> = { top: T[] };

// @ts-ignore
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

export async function fetchTop<T>(limit = 10): Promise<TopResponse<T>> {
    const res = await fetch(`${SERVER_URL}/leaderboard/top?limit=${limit}`, {
        method: "GET",
    });
    if (!res.ok) throw new Error(`Failed fetching leaderboard: ${res.status}`);
    return res.json();
}

export async function submitScore(body: SubmitPayload) {
    const res = await fetch(`${SERVER_URL}/leaderboard/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const j = await safeJson(res);
        throw new Error(j?.error || `Submit failed: ${res.status}`);
    }
    return res.json();
}

async function safeJson(res: Response) {
    try {
        return await res.json();
    } catch {
        return undefined;
    }
}
