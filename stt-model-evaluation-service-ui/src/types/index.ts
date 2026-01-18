// Sample Management Types
export interface Sample {
  id: string
  name: string
  fileUrl: string
  industry: Industry
  scenario: Scenario
  noiseLevel: NoiseLevel
  playbackParams?: PlaybackParams
  fingerprint: string
  format: string
  duration?: number
  createdAt: string
  updatedAt: string
}

export interface PlaybackParams {
  volume?: number
  speed?: number
  loop?: boolean
}

export type Industry = 'finance' | 'manufacturing' | 'government' | 'healthcare' | 'education' | 'retail' | 'other'
export type Scenario = 'user_interview' | 'call_center' | 'counter_service' | 'meeting' | 'broadcast' | 'other'
export type NoiseLevel = 'low' | 'medium' | 'high'

export interface SampleUploadParams {
  file: File
  name: string
  industry: Industry
  scenario: Scenario
  noiseLevel: NoiseLevel
  playbackParams?: PlaybackParams
}

export interface SampleFilter {
  industry?: Industry[]
  scenario?: Scenario[]
  noiseLevel?: NoiseLevel[]
  keyword?: string
}

// Model Management Types
export interface Model {
  id: string
  name: string
  vendor: string
  version: string
  interfaceType: InterfaceType
  endpoint: string
  port: number
  protocol: Protocol
  authConfig: AuthConfig
  supportedLanguages: string[]
  samplingRate: number
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export type InterfaceType = 'http_api' | 'grpc' | 'websocket'
export type Protocol = 'http' | 'https' | 'ws' | 'wss' | 'grpc'

export interface AuthConfig {
  type: AuthType
  apiKey?: string
  token?: string
  username?: string
  password?: string
  oauthConfig?: OAuthConfig
}

export type AuthType = 'api_key' | 'token' | 'username_password' | 'oauth' | 'none'

export interface OAuthConfig {
  clientId: string
  clientSecret: string
  tokenUrl: string
  scope?: string
}

export interface ModelGroup {
  id: string
  name: string
  type: GroupType
  modelIds: string[]
  createdAt: string
}

export type GroupType = 'vendor' | 'version' | 'scenario' | 'custom'

// Task Management Types
export interface TestTask {
  id: string
  name: string
  description?: string
  executionParams: ExecutionParams
  sampleSelection: SampleSelection
  modelSelection: ModelSelection
  schedule: Schedule
  status: TaskStatus
  progress?: number
  createdAt: string
  updatedAt: string
  startedAt?: string
  completedAt?: string
}

export interface ExecutionParams {
  duration?: number // seconds
  concurrency: number
  loopMode: boolean
}

export interface SampleSelection {
  type: SelectionType
  sampleIds?: string[]
  filters?: SampleFilter
}

export type SelectionType = 'manual' | 'filter'

export interface ModelSelection {
  type: 'single' | 'comparative'
  modelIds: string[]
}

export interface Schedule {
  type: 'immediate' | 'scheduled'
  scheduledTime?: string
}

export type TaskStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled'

export interface TaskExecutionLog {
  id: string
  taskId: string
  level: LogLevel
  message: string
  timestamp: string
}

export type LogLevel = 'info' | 'warning' | 'error' | 'debug'

export interface TestResult {
  id: string
  taskId: string
  sampleId: string
  modelId: string
  rawResult: string
  metrics: EvaluationMetrics
  errorType?: ErrorType
  createdAt: string
}

export interface EvaluationMetrics {
  accuracy: AccuracyMetrics
  performance: PerformanceMetrics
  robustness: RobustnessMetrics
}

export interface AccuracyMetrics {
  wer: number // Word Error Rate
  cer: number // Character Error Rate
  ser: number // Sentence Error Rate
  bleu?: number
  rouge?: number
}

export interface PerformanceMetrics {
  latency: number // milliseconds
  throughput: number // requests per second
  resourceUsage: ResourceUsage
}

export interface ResourceUsage {
  cpu?: number
  memory?: number
  gpu?: number
}

export interface RobustnessMetrics {
  noiseResistance: number
  accentAdaptation: number
  speedVariation: number
}

export type ErrorType = 'substitution' | 'insertion' | 'deletion' | 'timeout' | 'api_error' | 'format_error'

export interface InstantTest {
  id: string
  audioFile: File | string
  modelId: string
  result?: string
  label?: string
  createdAt: string
}

// Evaluation Report Types
export interface EvaluationReport {
  id: string
  taskId: string
  taskName: string
  grade: Grade
  overallScore: number
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  detailedMetrics: DetailedMetrics
  errorDistribution: ErrorDistribution
  createdAt: string
  version: number
}

export type Grade = 'A+' | 'A' | 'B' | 'C' | 'D'

export interface DetailedMetrics {
  accuracy: AccuracyMetrics[]
  performance: PerformanceMetrics[]
  robustness: RobustnessMetrics[]
  trends: MetricTrend[]
}

export interface MetricTrend {
  metric: string
  values: number[]
  timestamps: string[]
}

export interface ErrorDistribution {
  substitution: number
  insertion: number
  deletion: number
  timeout: number
  api_error: number
  format_error: number
}

// System Management Types
export interface User {
  id: string
  username: string
  email: string
  role: UserRole
  projectIds: string[]
  createdAt: string
  updatedAt: string
}

export type UserRole = 'admin' | 'tester' | 'viewer'

export interface Project {
  id: string
  name: string
  description?: string
  teamIds: string[]
  createdAt: string
}

export interface Team {
  id: string
  name: string
  userIds: string[]
  createdAt: string
}

export interface AuditLog {
  id: string
  userId: string
  username: string
  action: string
  resource: string
  resourceId?: string
  details?: Record<string, any>
  timestamp: string
}

export interface SystemConfig {
  metricWeights: MetricWeights
  alertThresholds: AlertThresholds
  slaTargets: SLATargets
}

export interface MetricWeights {
  accuracy: number
  performance: number
  robustness: number
}

export interface AlertThresholds {
  errorRate: number
  latency: number
  resourceUsage: number
}

export interface SLATargets {
  accuracy: number
  latency: number
  availability: number
}

// API Response Types
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}
