// src/components/LeaderboardPanel.tsx
import React from "react";
import type { LeaderboardEntry } from "@shared/types";

export default function LeaderboardPanel({
                                             open,
                                             loading,
                                             error,
                                             top,
                                             onRefresh,
                                             onClose,
                                         }: {
    open: boolean;
    loading: boolean;
    error: string | null;
    top: LeaderboardEntry[];
    onRefresh: () => void;
    onClose: () => void;
}) {
    if (!open) return null;
    return (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
            <div className="modal">
                <div className="modal-header">
                    <h2 style={{ margin: 0 }}>Leaderboard (Top 10)</h2>
                    <button className="btn" onClick={onClose}>✕</button>
                </div>

                <div className="modal-content">
                    {loading && <div>Loading…</div>}
                    {error && <div style={{ color: "#f87171" }}>{error}</div>}
                    {!loading && !error && (
                        <ol className="lb-list">
                            {top.length === 0 && <div>No scores yet. Be the first!</div>}
                            {top.map((e, i) => (
                                <li key={`${e.nickname}-${e.playedAt}`}>
                                    <span className="rank">#{i + 1}</span>{' '}
                                    <span className="nick">{e.nickname}</span>{' '}
                                    <span className="score">{e.score} pts</span>{' '}
                                    <span className="date">{new Date(e.playedAt).toLocaleString()}</span>
                                </li>
                            ))}
                        </ol>
                    )}
                </div>

                <div className="modal-actions">
                    <button className="btn" onClick={onRefresh}>Refresh</button>
                    <button className="btn" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}
