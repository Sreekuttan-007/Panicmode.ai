export interface BacklogTask {
  id: string;
  title: string;
  originalTask: string;
  estimatedMinutes: number;
  urgency: 'High' | 'Medium' | 'Low';
  status: 'pending' | 'completed';
}

export interface TargetTask {
  title: string;
  originalTask: string;
  urgencyReason: string;
  microSteps: string[];
  currentStepIndex: number;
  helperDraft: string | null;
}

export interface TriageResponse {
  assessment: string;
  target: TargetTask;
  backlog: BacklogTask[];
  handoffMessage: string;
}

export interface StuckResponse {
  simplerStep: string;
  motivation: string;
  helperDraft: string | null;
}

export interface HistoryItem {
  id: string;
  title: string;
  completedAt: string; // ISO String
  originalTask: string;
  streakCountWhenCompleted: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO String
}
