
export interface QuizData {
  motivation: string;
  biggestChallenge: string;
  softSkillFocus: string;
}

export interface UserProfile {
  name?: string;
  email?: string;
  whatsapp?: string;
  role: string;
  experience: string;
  city?: string;
  quizData?: QuizData;
  cvFile: File | null;
  cvBase64: string | null;
  cvMimeType: string | null;
  softSkillsProgress?: SoftSkillsProgress;
  avatarBase64?: string | null;
  avatarMimeType?: string | null;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
  };
}

export interface Skill {
  name: string;
  category: 'hard' | 'soft';
  level: string;
  score: number; // 0-100
}

export interface SkillGapAnalysis {
  currentStatus: string;
  missingPoints: string[];
  actionPlan: string;
}

export interface RoadmapStep {
  title: string;
  description: string;
}

// --- NEW CV BUILDER STRUCTURES ---
export interface CvExperience {
  company: string;
  role: string;
  duration: string;
  description: string; // Bullet points enhanced by AI
}

export interface CvEducation {
  institution: string;
  degree: string;
  year: string;
}

export interface ExtractedCvData {
  fullName: string;
  lastPosition?: string;
  contactInfo: string[];
  summary: string;
  skills: string[];
  languages: string[];
  experience: CvExperience[];
  education: CvEducation[];
}

// --- PREMIUM CONTENT STRUCTURES ---

export interface DressCodeData {
  attire: string;
  description: string;
  donts: string[];
  arrivalTime: string;
}

export interface QuestionData {
  id: number;
  question: string;
  bestAnswer: string;
  recruiterTip: string;
}

export interface CaseStudyData {
  title: string;
  candidateProfile: string;
  scenario: string; // The situation
  challenge: string; // The problem
  keyQuestion: string; // What the recruiter asked
  candidateResponse: string; // How they answered/behaved
  whyTheyGotHired: string; // Analysis
}

export interface InterviewPrepData {
  type?: 'qa' | 'case-study'; // Discriminator
  questions?: QuestionData[];
  caseStudies?: CaseStudyData[]; // Changed to array for multiple cases
  dressCode?: DressCodeData;
}

export interface LinkedinData {
  headline: string;
  about: string;
  keywords: string[];
}

export interface RegionalSalary {
  region: string;
  factor: string;
  average: number;
}

export interface SalaryData {
  junior: number;
  pleno: number;
  senior: number;
  marketDemand: 'Baixa' | 'Média' | 'Alta';
  regionalData: RegionalSalary[];
  negotiationStrategy: {
    mainArgument: string;
    secondaryArgument: string;
    closingPhrase: string;
  };
}

export interface SoftSkillTask {
  day: string;
  title: string;
  action: string;
  whyItMatters: string;
  toolOrTip: string;
  readingRecommendation: string;
  estimatedTime: string;
  reflectionQuestion: string;
}

export interface DiscAnalysisDetails {
  matchScore: number;
  synergies: string[];
  blindSpots: string[];
  communicationTip: string;
}

export interface AnalysisResult {
  matchScore: number;
  skills: Skill[];
  roadmap: RoadmapStep[];

  extractedName?: string;
  extractedLastRole?: string;

  linkedinData?: LinkedinData;
  salaryData?: SalaryData;
  softSkillPlan?: SoftSkillTask[];
  interviewPrep?: InterviewPrepData;

  extractedCvData?: ExtractedCvData;
  fullAnalysis?: DiscAnalysisDetails;
}

export interface DiscScore {
  D: number;
  I: number;
  S: number;
  C: number;
}

export interface DiscResult {
  primary: 'D' | 'I' | 'S' | 'C';
  secondary: 'D' | 'I' | 'S' | 'C';
  scores: DiscScore;
  name: string;
  description: string;
  fullAnalysis?: DiscAnalysisDetails;
}

export enum AppView {
  LANDING = 'LANDING',
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  PREMIUM_AREA = 'PREMIUM_AREA'
}

// --- ADMIN PANEL TYPES ---
export interface AdminUserData {
  id: string;
  userId: string;
  name: string;
  email: string;
  whatsapp: string;
  role: string;
  experience: string;
  city: string;
  cvUrl: string;
  cvMimeType: string;
  quizData?: QuizData;
  createdAt: string;
}

// --- CV OPTIMIZER TYPES ---
export interface CVOptimizationResult {
  optimizedSummary: string;
  highlightedSkills: string[];
  keyImprovements: string[];
  atsScore: number; // 0-100
  suggestions: string[];
}

// --- SOFT SKILLS GAMIFICATION TYPES ---
export interface SoftSkillsProgress {
  level: number; // Nível do usuário (1-5)
  currentDay: number; // Dia atual (1-30)
  completedDays: number[]; // Dias já completados
  badges: string[]; // Badges conquistados
  lastCompletedDate: string | null; // ISO Date do último dia completado
  experience: number; // XP acumulado
}

export interface DailyTask {
  day: number;
  title: string;
  category: 'Comunicação' | 'Liderança' | 'Inteligência Emocional' | 'Produtividade' | 'Carreira';
  action: string;
  whyItMatters: string;
  reflection: string;
  reading: string;
  xpReward: number;
}

