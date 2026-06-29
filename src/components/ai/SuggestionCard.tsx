import React, { useState, useCallback } from 'react';
import {
    Lightbulb, ArrowRight, RefreshCw, Loader2,
    Flame, Clock, AlertCircle, CheckCircle2, Zap,
} from 'lucide-react';
import { getRecommendations, type RecommendationItem } from '../../services/aiService';
import { useAssignmentStore } from '../../store/assignmentStore';

const urgencyConfig: Record<RecommendationItem['urgency'], { color: string; icon: React.ReactNode; label: string }> = {
    critical: { color: 'bg-red-50 border-red-200 text-red-700', icon: <AlertCircle className="w-3.5 h-3.5 text-red-500" />, label: 'Critical' },
    high: { color: 'bg-amber-50 border-amber-200 text-amber-700', icon: <Flame className="w-3.5 h-3.5 text-amber-500" />, label: 'High' },
    medium: { color: 'bg-blue-50 border-blue-200 text-blue-700', icon: <Clock className="w-3.5 h-3.5 text-blue-500" />, label: 'Medium' },
    low: { color: 'bg-emerald-50 border-emerald-200 text-emerald-700', icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />, label: 'Low' },
};

export const SuggestionCard: React.FC = () => {
    const { assignments } = useAssignmentStore();
    const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
    const [insight, setInsight] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRecommendations = useCallback(async () => {
        const pending = assignments.filter((a) => a.status !== 'completed');
        if (!pending.length) {
            setInsight('🎉 You have no pending assignments! Time to get ahead of schedule.');
            setRecommendations([]);
            setLoaded(true);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const result = await getRecommendations(pending);
            setRecommendations(result.recommendations ?? []);
            setInsight(result.insight ?? '');
            setLoaded(true);
        } catch {
            setError('Could not connect to AI. Is the backend running?');
        } finally {
            setLoading(false);
        }
    }, [assignments]);

    return (
        <div className="bg-white rounded-xl border border-surface-200 p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    <h3 className="text-sm font-semibold text-surface-800">What should I work on next?</h3>
                </div>
                <button
                    onClick={fetchRecommendations}
                    disabled={loading}
                    title="Refresh AI recommendations"
                    className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 hover:text-primary-600 transition-colors cursor-pointer disabled:opacity-40"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* States */}
            {loading && (
                <div className="flex items-center gap-2 py-6 justify-center">
                    <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
                    <span className="text-xs text-surface-500">AI is analysing your workload…</span>
                </div>
            )}

            {error && (
                <div className="py-4 text-center">
                    <AlertCircle className="w-8 h-8 text-red-300 mx-auto mb-2" />
                    <p className="text-xs text-red-500">{error}</p>
                </div>
            )}

            {!loading && !loaded && !error && (
                <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                        <Zap className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-surface-600">AI-powered recommendations</p>
                        <p className="text-[11px] text-surface-400 mt-0.5">Get personalised suggestions based on priority, due dates, and workload</p>
                    </div>
                    <button
                        onClick={fetchRecommendations}
                        className="px-4 py-2 rounded-lg bg-primary-50 border border-primary-200 text-xs font-semibold text-primary-700 hover:bg-primary-100 transition-colors cursor-pointer"
                    >
                        ✨ Get AI Recommendations
                    </button>
                </div>
            )}

            {!loading && loaded && !error && (
                <div className="space-y-3">
                    {/* Recommendations */}
                    {recommendations.map((rec, idx) => {
                        const cfg = urgencyConfig[rec.urgency];
                        return (
                            <div key={idx} className={`flex items-start gap-3 p-3.5 rounded-xl border ${cfg.color} transition-all hover:shadow-sm`}>
                                <div className="flex-shrink-0 mt-0.5">{cfg.icon}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">{cfg.label}</span>
                                        <span className="text-[10px] text-surface-400">· {rec.suggestedHours}h suggested</span>
                                    </div>
                                    <p className="text-xs font-semibold mt-0.5 truncate">{rec.title}</p>
                                    <p className="text-[11px] opacity-80 mt-0.5 leading-relaxed">{rec.reason}</p>
                                </div>
                                <button className="mt-1 p-1 rounded-lg hover:bg-black/5 transition-colors cursor-pointer flex-shrink-0">
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        );
                    })}

                    {/* AI Insight */}
                    {insight && (
                        <div className="flex items-start gap-2 p-3 rounded-xl bg-violet-50 border border-violet-200 mt-1">
                            <Lightbulb className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-violet-700 leading-relaxed">{insight}</p>
                        </div>
                    )}

                    <button
                        onClick={fetchRecommendations}
                        className="w-full py-2 text-[11px] font-medium text-surface-400 hover:text-primary-600 transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                        <RefreshCw className="w-3 h-3" />
                        Refresh recommendations
                    </button>
                </div>
            )}
        </div>
    );
};
