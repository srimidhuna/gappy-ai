import axios from 'axios';

export interface ExtractedData {
    title: string;
    subject: string;
    description: string;
    dueDate: string | null; // ISO String or null
    source: string;
    priority: 'low' | 'medium' | 'high';
    status: string;
}

export const extractAssignmentFromText = async (text: string): Promise<ExtractedData> => {
    const response = await axios.post('http://localhost:5000/api/extract', {
        message: text
    });

    if (response.data && response.data.success) {
        const assignment = response.data.assignment;
        // Map backend 'deadline' field to frontend 'dueDate' field
        return {
            ...assignment,
            dueDate: assignment.deadline
        };
    } else {
        throw new Error(response.data?.error || 'Failed to extract assignment');
    }
};
