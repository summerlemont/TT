// AIDP 标注工作区类型定义

// 维度 ID
export type DimensionId = 
  | 'merchant_data' 
  | 'store_diagnosis' 
  | 'task_diagnosis' 
  | 'script_generation' 
  | 'agent_card' 
  | 'send_timing';

// 维度评分状态
export interface DimensionScore {
  dimensionId: DimensionId;
  status: 'pending' | 'auto_filled' | 'confirmed';
  score: number | null;
  errorTags: string[];
  comment: string;
}

// Case 数据
export interface CaseData {
  caseId: string;
  caseIndex: number;
  totalCases: number;
  shopId: string;
  shopName: string;
  diagnoseDate: string;
  channel: string;
  aiTarget: string;
  scene: string;
  redcardPassed: boolean;
  suspectedItems: string[];
  merchantData: MerchantData;
  traceData: TraceData;
  touchHistory: TouchHistory;
  agentCard: AgentCard;
  autoChecks: AutoChecks;
}

// 商家数据
export interface MerchantData {
  fields: Array<{
    name: string;
    aiValue: string;
    realValue: string;
    match: boolean;
    missing?: boolean;
  }>;
  summary: {
    total: number;
    matched: number;
    mismatched: number;
    missing: number;
  };
}

// Trace 数据
export interface TraceData {
  diagnosisNode: DiagnosisNode;
  taskNode: TaskNode;
  scriptNode: ScriptNode;
}

export interface DiagnosisOutputItem {
  problem: string;
  reasoning: string;
  related_queries: string[];
  related_experience: string;
}

export interface DiagnosisNode {
  nodeName: string;
  input: {
    merchantData: string;
    experienceReference: string;
  };
  output: {
    problem: string;
    reasoning: string;
    relatedExperience: string;
  } | DiagnosisOutputItem[];
}

export interface TaskNode {
  nodeName: string;
  input: {
    actionRules: string;
    actionReference: string;
    merchantProfile: string;
  };
  output: {
    problem: string;
    advice: string;
    actionId: string;
    reasoning: string;
    more: Array<{
      name: string;
      actionId: string;
      reason: string;
    }>;
  };
}

export interface ScriptNode {
  nodeName: string;
  output: {
    scriptContent: string;
  };
}

// 会话时光机
export interface TouchHistory {
  messages: TouchMessage[];
  timeline: TouchTimeline;
}

export interface TouchMessage {
  timestamp: string;
  type: string;
  actionPoint: string;
  content: string;
  hasCard: boolean;
  cardTitle?: string;
  isCurrent: boolean;
}

export interface TouchTimeline {
  dateRange: string[];
  touches: Array<{
    date: string;
    time: string;
    action: string;
  }>;
  total7day: number;
  minIntervalDays: number;
}

// Agent 卡片
export interface AgentCard {
  cardJson: Record<string, unknown>;
  validation: Array<{
    item: string;
    result: 'pass' | 'warning' | 'error';
    detail: string;
  }>;
}

// 机标预检
export interface AutoChecks {
  merchant_data: AutoCheck;
  store_diagnosis: AutoCheck;
  task_diagnosis: AutoCheck;
  script_generation: AutoCheck;
  agent_card: AutoCheck;
  send_timing: AutoCheck;
}

export interface AutoCheck {
  autoScore: number | null;
  confidence: 'high' | 'medium' | 'low';
  status: 'pass' | 'warning' | 'error';
  checks: Array<{
    item: string;
    result: 'pass' | 'warning' | 'error' | 'suspected' | 'partial_fail' | 'need_human';
    detail: string;
  }>;
}

// 维度定义
export interface Dimension {
  id: DimensionId;
  name: string;
  maxScore: number;
}
export interface ErrorTag {
  title: string;
  score?: number;
  isRedFlag?: boolean;
  children?: Array<{
    title: string;
    isRedFlag?: boolean;
  }>;
}

// 经验卡点
export type PriorityLevel = 'P0' | 'P1' | 'P2' | 'P3';

export interface ProfileFieldValue {
  name: string;
  value: string;
  condition: string;
}

export interface ExperienceBottleneck {
  id: string;
  priority: PriorityLevel;
  name: string;
  isCovered: boolean; // 模型是否识别出来
  relatedProfileFields: ProfileFieldValue[]; // 关联的商家画像信息
}

// 模型诊断出的卡点
export interface DiagnosedBottleneck {
  name: string;
  reasoning: string;
}
