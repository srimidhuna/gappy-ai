import React, { useState, useCallback } from 'react';
import { TrendingUp, Loader2, RefreshCw, AlertCircle, Zap, Shield, Lightbulb } from 'lucide-react';
import { getProductivityInsights, type InsightItem } from '../../services/aiService';
import { useAssignmentStore } from '../../store/assignmentStore';

const insightConfig: Record<InsightItem['type'], { icon: React.ReactNode; bg: string; text: string }> = {
    strength: { icon: <Shield className="w-4 h-4 text-emerald-500" />, bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
    warning: { icon: <AlertCircle className="w-4 h-4 text-amber-500" />, bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
    tip: { icon: <Lightbulb className="w-4 h-4 text-blue-500" />, bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
};

export const ProductivityInsightsCard: React.FC = () => {
    const { assignments } = useAssignmentStore();
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<{
        weeklyScore: number;
        headline: string;
        insights: InsightItem[];
        focusArea: string;
    } | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getProductivityInsights(assignments);
            setData(result);
            setLoaded(true);
        } catch {
            setError('Could not connect to AI backend. Make sure the server is running.');
        } finally {
            setLoading(false);
        }
    }, [assignments]);

    const scoreColor = data
        ? data.weeklyScore >= 70 ? 'text-emerald-600' : data.weeklyScore >= 40 ? 'text-amber-600' : 'text-red-600'
        : 'text-surface-400';

    const scoreBg = data
        ? data.weeklyScore >= 70 ? 'bg-emerald-50 border-emerald-200' : data.weeklyScore >= 40 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'
        : '';

    return (
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary-500" />
                        <h3 className="text-sm font-semibold text-surface-800">AI Productivity Insights</h3>
                    </div>
                    <p className="text-xs text-surface-400 mt-0.5">Weekly performance analysis powered by AI</p>
                </div>
                <button
                    onClick={fetch}
                    disabled={loading}
                    className="p-2 rounded-lg text-surface-400 hover:bg-surface-100 hover:text-primary-600 transition-colors cursor-pointer disabled:opacity-40"
                    title="Refresh insights"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center gap-2 py-8">
                    <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
                    <span className="text-xs text-surface-500">Analysing your week…</span>
                </div>
            )}

            {/* Error */}
            {error && !loading && (
                <div className="py-4 text-center">
                    <AlertCircle className="w-8 h-8 text-red-300 mx-auto mb-2" />
                    <p className="text-xs text-red-500">{error}</p>
                    <button onClick={fetch} className="mt-3 text-xs text-primary-600 hover:underline cursor-pointer">Try again</button>
                </div>
            )}

            {/* Idle state */}
            {!loading && !loaded && !error && (
                <div className="flex flex-col items-center justify-center py-8 text-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center">
                        <Zap className="w-7 h-7 text-primary-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-surface-600">Get AI-powered insights</p>
                        <p className="text-xs text-surface-400 mt-1">Analyse your weekly productivity, strengths, warnings, and focus areas</p>
                    </div>
                    <button
                        onClick={fetch}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-violet-500 text-white text-sm font-semibold shadow-md hover:shadow-lg hover:opacity-90 transition-all cursor-pointer"
                    >
                        ✨ Generate Insights
                    </button>
                </div>
            )}

            {/* Results */}
            {!loading && loaded && data && (
                <div className="space-y-5">
                    {/* Score + headline */}
                    <div className={`flex items-center gap-4 p-4 rounded-xl border ${scoreBg}`}>
                        <div className="text-center">
                            <p className={`text-3xl font-black ${scoreColor}`}>{data.weeklyScore}</p>
                            <p className="text-[10px] text-surface-500 font-medium">/ 100</p>
                        </div>
                        <div>
                            <p className={`text-sm font-bold ${scoreColor}`}>{data.headline}</p>
                            <p className="text-xs text-surface-500 mt-0.5">
                                Focus area: <strong>{data.focusArea}</strong>
                            </p>
                        </div>
                    </div>

                    {/* Insight cards */}
                    <div className="space-y-2.5">
                        {data.insights.map((item, idx) => {
                            const cfg = insightConfig[item.type];
                            return (
                                <div key={idx} className={`flex items-start gap-3 p-3.5 rounded-xl border ${cfg.bg}`}>
                                    <div className="flex-shrink-0 mt-0.5">{cfg.icon}</div>
                                    <p className={`text-xs leading-relaxed ${cfg.text}`}>{item.text}</p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Refresh */}
                    <button
                        onClick={fetch}
                        className="w-full py-2 text-[11px] font-medium text-surface-400 hover:text-primary-600 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                        <RefreshCw className="w-3 h-3" />
                        Refresh insights
                    </button>
                </div>
            )}
        </div>
    );
};
