export interface MoodTrend {
    label: string;
    score: number;
    max: number;
    trend: 'up' | 'down' | 'neutral';
  }
  
  export interface Medication {
    name: string;
    status: 'Active' | 'Inactive' | 'Pending';
    updatedDaysAgo: number;
  }
  
  export interface SessionFlag {
    id: number;
    label: string;
    severity: 'warning' | 'critical' | 'info';
    isNew: boolean;
  }
  
  export interface LastSession {
    daysAgo: number;
    rating: number;
    note: string;
  }
  
  export interface AISummary {
    text: string;
    suggestedFocus: string[];
    generatedMinutesAgo: number | null;
    generatedBy?: string;
    model?: string;
  }
  
  export interface Patient {
    id: string;
    name: string;
    initials: string;
    session: { current: number; total: number };
    program: string;
    nextSession: string;
    flags: SessionFlag[];
    medications: Medication[];
    lastSession: LastSession;
    moodTrends: MoodTrend[];
    aiSummary: AISummary;
  }
  
  export interface PatientListItem {
    id: string;
    name: string;
    initials: string;
    session: { current: number; total: number };
    program: string;
    nextSession: string;
    flagCount: number;
  }