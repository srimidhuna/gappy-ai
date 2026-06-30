import axios from 'axios';
import type { Assignment, AssignmentSource, SubmissionMode } from '../types';

const API_URL = import.meta.env.VITE_API_URL;
const apiClient = axios.create({
    baseURL: `${API_URL}/api`
});

// ── Extracted data shape from backend ──────────────────────────────────────
export interface ExtractedData {
    title: string;
    subject: string;
    description: string;
    dueDate: string | null;     // ISO or null
    dueTime: string | null;     // HH:MM or null
    source: AssignmentSource;
    priority: 'low' | 'medium' | 'high';
    professor: string | null;
    submissionMode: SubmissionMode | null;
    submissionLink: string | null;
    notes: string | null;
    confidence: number;         // 0-100
    status: string;
    summary?: string;
    estimatedHours?: number;
}

export interface SummaryResult {
    summary: string;
    keyPoints: string[];
    estimatedHours: number;
}

export interface RecommendationItem {
    title: string;
    reason: string;
    urgency: 'critical' | 'high' | 'medium' | 'low';
    suggestedHours: number;
}

export interface RecommendResult {
    recommendations: RecommendationItem[];
    insight: string;
}

export interface InsightItem {
    type: 'strength' | 'warning' | 'tip';
    text: string;
}

export interface InsightsResult {
    weeklyScore: number;
    headline: string;
    insights: InsightItem[];
    focusArea: string;
}

export interface NLSearchFilters {
    status?: string | null;
    priority?: string | null;
    source?: string | null;
    subject?: string | null;
    dueSoon?: boolean;
    dueToday?: boolean;
    dueTomorrow?: boolean;
    searchTerms?: string[];
    intent?: string;
}

// ── Duplicate detection (client-side, no API call needed) ──────────────────
export function detectDuplicates(
    candidate: Pick<ExtractedData, 'title' | 'subject' | 'dueDate'>,
    existing: Assignment[]
): Assignment[] {
    const titleLower = candidate.title.toLowerCase().trim();
    const candDue = candidate.dueDate ? candidate.dueDate.split('T')[0] : null;

    return existing.filter((a) => {
        const existTitleLower = a.title.toLowerCase().trim();
        const existDue = a.dueDate ? a.dueDate.split('T')[0] : null;

        // Exact title match
        const titleMatch = existTitleLower === titleLower;
        // Fuzzy: title similarity > 80% using simple word overlap
        const candWords = new Set(titleLower.split(/\s+/).filter(w => w.length > 3));
        const existWords = new Set(existTitleLower.split(/\s+/).filter(w => w.length > 3));
        const commonWords = [...candWords].filter(w => existWords.has(w)).length;
        const fuzzyMatch = candWords.size > 0 && commonWords / Math.max(candWords.size, existWords.size) >= 0.7;

        const subjectMatch = !candidate.subject || a.subject.toLowerCase() === candidate.subject.toLowerCase();
        const dateMatch = !candDue || !existDue || candDue === existDue;

        return (titleMatch || fuzzyMatch) && subjectMatch && dateMatch;
    });
}

// ── Estimate study hours (client-side heuristic fallback) ──────────────────
export function estimateStudyHours(
    priority: 'low' | 'medium' | 'high',
    source: string,
    title: string
): number {
    const titleLower = title.toLowerCase();
    let base = priority === 'high' ? 3 : priority === 'medium' ? 2 : 1;

    if (titleLower.includes('report') || titleLower.includes('essay') || titleLower.includes('paper')) base += 1.5;
    if (titleLower.includes('project') || titleLower.includes('design')) base += 2;
    if (titleLower.includes('quiz') || titleLower.includes('prep')) base -= 0.5;
    if (source === 'lab') base += 1;

    return Math.max(0.5, Math.round(base * 2) / 2); // Round to 0.5h
}

// ── API calls ──────────────────────────────────────────────────────────────

export async function extractAssignmentFromText(
    text: string,
    source: AssignmentSource = 'manual'
): Promise<ExtractedData> {
    const response = await apiClient.post('/extract', { message: text, source });
    if (response.data?.success) {
        const a = response.data.assignment;
        return {
            title: a.title || 'Untitled',
            subject: a.subject || 'General',
            description: a.description || '',
            dueDate: a.deadline ?? a.dueDate ?? null,
            dueTime: a.dueTime ?? null,
            source: source,
            priority: a.priority ?? 'medium',
            professor: a.professor ?? null,
            submissionMode: a.submissionMode ?? null,
            submissionLink: a.submissionLink ?? null,
            notes: a.notes ?? null,
            confidence: typeof a.confidence === 'number' ? a.confidence : 80,
            status: a.status ?? 'pending',
        };
    }
    throw new Error(response.data?.error || 'Extraction failed');
}

export async function generateSummary(
    assignment: Pick<Assignment, 'title' | 'subject' | 'description' | 'dueDate' | 'priority'> & { professor?: string }
): Promise<SummaryResult> {
    const response = await apiClient.post('/summarize', assignment);
    if (response.data?.success) return response.data as SummaryResult;
    throw new Error(response.data?.error || 'Summary failed');
}

export async function getRecommendations(assignments: Assignment[]): Promise<RecommendResult> {
    const response = await apiClient.post('/recommend', { assignments });
    if (response.data?.success) return response.data as RecommendResult;
    throw new Error(response.data?.error || 'Recommend failed');
}

export async function getProductivityInsights(assignments: Assignment[]): Promise<InsightsResult> {
    const response = await apiClient.post('/insights', { assignments });
    if (response.data?.success) return response.data as InsightsResult;
    throw new Error(response.data?.error || 'Insights failed');
}

export async function parseNaturalLanguageSearch(query: string): Promise<NLSearchFilters> {
    const response = await apiClient.post('/nlsearch', { query });
    if (response.data?.success) return response.data.filters as NLSearchFilters;
    throw new Error(response.data?.error || 'NL search failed');
}
