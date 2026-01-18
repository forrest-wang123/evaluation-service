# STT Model Evaluation Service Planning

## 1. Target Users
*   **Application Development Teams**: Need to evaluate different model performance to select suitable vendors or solutions.
*   **Model R&D Teams**: Speech recognition algorithm engineers, model optimization engineers.

## 2. Feature List

### 2.1 Sample Management (Sample Sources: Appendix A)

*   **Sample Upload**
    *   Supports audio file upload (supports formats like mp3, wav, aac, pcm).
    *   Metadata management: Name, file URL (s3, supports online playback), industry (finance, manufacturing, government, etc.), scenario (user interview, call center, counter service, etc.), noise level, playback parameters.
    *   Automatic audio fingerprint generation (to avoid duplicate uploads).
    *   Batch import/export of sample sets.
*   **Sample Management**
    *   Modify sample metadata.
    *   Delete samples (cascading delete of associated test records).
*   **Audio Processing**
    *   Automatic format conversion (unified conversion to standard pcm format).
    *   Automatic audio metadata labeling (industry, scenario, noise level, etc.).

### 2.2 Model Management

*   **Model Integration**
    *   Supports various interface types (HTTP API, gRPC, WebSocket).
    *   Connection configuration: endpoint address, port, protocol.
    *   Authentication configuration: API Key, Token, Username/Password, OAuth.
    *   Model metadata: vendor, version, supported languages, sampling rate requirements.
*   **Model Configuration**
    *   Edit model parameters.
    *   Test connection validity.
    *   Delete model (check for associated test records).
*   **Model Grouping**
    *   Group by vendor/version/application scenario.
    *   Model comparison view.

### 2.3 Task Management

*   **Test Task Definition**
    *   Task naming and description.
    *   Execution parameters: duration, concurrency, loop mode.
    *   Sample selection: manual selection or conditional filtering.
    *   Model selection: single model or multiple model comparative testing.
    *   Scheduling: execute immediately or scheduled execution.
*   **Task Execution & Monitoring**
    *   Real-time progress monitoring.
    *   View execution logs.
    *   Task pause/resume/terminate control.
    *   Exception alerts (email/internal message).
*   **Result Viewing & Analysis**
    *   Detailed evaluation report generation.
    *   Metric comparison visualization.
    *   View raw recognition results.
    *   Error case analysis.
*   **Instant Testing & Labeling**
    *   Real-time recording or upload for testing.
    *   Manual labeling interface.
    *   Save as new test samples.
    *   Label version management.

### 2.4 Evaluation Reports

*   **Comprehensive Evaluation Report**
    *   Automatic scoring based on the evaluation indicator system.
    *   Grade assessment (A+/A/B/C/D).
    *   Strength and weakness analysis.
    *   Improvement suggestions.
*   **Detailed Metric Analysis (Detailed metrics: Appendix B)**
    *   Detailed data for accuracy metrics.
    *   Performance metric trend charts.
    *   Robustness test results.
    *   Error type distribution.
*   **Export & Sharing**
    *   PDF/Excel report export.
    *   Report link sharing.
    *   Historical report version comparison.

### 2.5 System Management

*   **User & Permission Management**
    *   Role-based access control (Admin, Tester, Viewer).
    *   Project/team isolation.
    *   Operation audit logs.
*   **System Configuration**
    *   Evaluation metric weight configuration.
    *   Alert threshold settings.
    *   SLA target customization.

## 3. Project Architecture

### 3.1 Functional Architecture
xxx

### 3.2 Deployment Architecture
xxx

### 3.3 Technology Stack
**Frontend Tech Stack**
- Vue 3 + TypeScript
- Element Plus UI Framework
- ECharts for Data Visualization
- Web Audio API for Audio Processing
- WebSocket for Real-time Communication

**Backend Tech Stack**
- Java 17 + Spring Boot 3.x
- Spring Security + JWT Authentication
- MyBatis Plus for Data Access
- WebFlux for Asynchronous Processing
- gRPC Client (for connecting to model services)

**Storage & Middleware**
- MySQL 8.0 (Relational Data)
- AWS S3 (Audio File Storage)
- MinIO (Local S3-compatible storage, Dev Environment)

**Operations & Monitoring**
- Docker + Kubernetes
- Jenkins/GitLab CI
- Prometheus + Grafana
- ELK Stack for Logging
- Skywalking for Full-link Tracing

**Audio Processing**
- FFmpeg (Format Conversion)
- SoX (Audio Processing)
- Python Audio Analysis Service (Independent Microservice)

## 4. Non-Functional Requirements Planning

### 4.1 Performance Requirements
- **Response Time**
  - Page load time: < 1 second
  - API response time: P95 < 500ms
  - Report generation time: < 30 seconds (for 1000 test records)
- **Concurrency Capability**
  - Supports 100+ concurrent users.
  - Supports 50+ parallel test tasks.
  - Audio upload concurrency: 100+.
- **Data Processing**
  - Supports single audio files up to 2GB.
  - Supports management of tens of thousands of samples.
  - Real-time streaming audio processing.

### 4.2 Reliability Requirements
- **Availability**
  - Overall system availability: 99.9%
  - Core service availability: 99.95%
  - Planned maintenance window: < 4 hours per month
- **Fault Tolerance**
  - Single point of failure automatic recovery time: < 5 minutes.
  - Data loss risk: RPO < 15 minutes.
  - Service degradation strategy: Core functions prioritized.
- **Data Security**
  - Audio data encrypted at rest (AES-256).
  - Transmission encryption (TLS 1.3).
  - Sensitive information masking.

### 4.3 Scalability
- **Horizontal Scaling**
  - Stateless services support auto-scaling.
  - Database read-write separation.
  - Cache cluster scaling.
- **Functional Extensibility**
  - Plug-in model integration.
  - Configurable evaluation metrics.
  - Customizable report templates.

### 4.4 Maintainability
- **Code Quality**
  - Unit test coverage > 80%.
  - Automated integration tests.
  - Code style checking.
- **Documentation Completeness**
  - API documentation (OpenAPI 3.0).
  - Deployment documentation.
  - Troubleshooting manual.
- **Monitoring & Alerting**
  - Key business metrics monitoring.
  - Automatic anomaly detection.
  - Multi-level alert notifications (email/SMS/Teams).

### 4.5 Deployment & Operations
  - Deployment on AWS EKS.
  - Storage using: AWS RDS for MySQL, AWS S3.

## 5. Project Milestone Planning

### Phase 1 (2 weeks): Core MVP Features
- Basic sample management functionality.
- Single model test execution.
- Basic accuracy metric evaluation.
- Simple report generation.

### Phase 2 (2 weeks): Complete Evaluation System
- Multi-model comparative testing.
- Complete evaluation indicator system.
- Real-time testing and labeling.
- Advanced report features.

## Appendix A. Sample Sources
 - Movie audio and subtitles; advantage: realistic scenarios, subtitles have detailed time annotations.
 - BBC, CNN, and other news media audio with subtitles.
 - CallCenter recordings, using large language models to generate subtitles.

## Appendix B. Evaluation Indicator System

###  B.1 Accuracy Metrics

| Metric | English Name | Description | Calculation/Measurement Method | Suggested Weight |
|--------|--------------|-------------|--------------------------------|------------------|
| **Word Error Rate** | Word Error Rate (WER) | Overall word recognition accuracy | `WER = (S+D+I)/N × 100%`<br>S=Substitutions, D=Deletions, I=Insertions, N=Total Words | 40% |
| **Sentence Error Rate** | Sentence Error Rate (SER) | Proportion of completely correct sentences | `SER = Incorrect Sentences/Total Sentences × 100%` | 15% |
| **Digit Accuracy** | Digit Accuracy | Accuracy in recognizing numeric content | `Correct Digits/Total Digits × 100%`<br>Specifically tests 0-9 and combinations. | 30% |
| **Entity Accuracy** | Entity Accuracy | Accuracy in recognizing named entities (person/location/organization, etc.) | `Correct Entities/Total Entities × 100%`<br>Evaluated via NER model comparison. | 15% |

###  B.2 Performance Metrics

| Metric | English Name | Description | Measurement Method | SLA Target |
|--------|--------------|-------------|--------------------|------------|
| **Overall Latency** | Overall Latency | Total latency across all segments | Overall Average Latency of all segments | < 200ms |
| **Maximum Latency** | Maximum Latency | Maximum segment latency | Maximum Segment Latency | < 2000ms |
| **First Word Latency** | First Word Latency | Time to first recognition result | Audio start → First word displayed | < 100ms |
| **Concurrent Users** | Concurrent Users | Number of simultaneous user sessions processed | Stable concurrent users under load test | > 1000 |
| **Error Rate** | Error Rate | Proportion of failed API calls | `5xx Errors/Total Requests × 100%` | < 0.1% |

###  B.3 Robustness Metrics

| Metric | English Name | Description | Test Scenario | Acceptable Degradation |
|--------|--------------|-------------|---------------|------------------------|
| **Noise Robustness** | Noise Robustness | Performance retention in noisy environments | Test at SNR 10-30dB | WER increase < 50% |
| **Accent Adaptation** | Accent Adaptation | Recognition capability for different accents | Test with regional accents | WER difference < 30% |
| **Speaking Rate Adaptation** | Speaking Rate Adaptation | Recognition effectiveness for different speaking speeds | Speaking rate 120-300 words/min | WER change < 40% |
| **Domain Adaptation** | Domain Adaptation | Recognition of domain-specific terminology | Medical/legal/financial, etc. | WER for terminology < 20% |
| **Device Compatibility** | Device Compatibility | Performance with different recording devices | Phone/microphone/headset | WER difference < 25% |
| **Audio Format Compatibility** | File Format Compatibility | Performance with different audio file formats | pcm/mp3/wav/aiff/... | WER difference < 25% |
| **Network Resilience** | Network Resilience | Performance under poor network conditions | Latency test 100-500ms | Failure rate < 5% |

### B.4 Evaluation Grading Standard

| Grade | Composite Score | WER | Latency | Description |
|-------|-----------------|-----|---------|-------------|
| **A+ (Excellent)** | ≥ 90 points | < 5% | < 200ms | Industry-leading, no obvious weaknesses. |
| **A (Good)** | 80-89 points | 5-10% | 200-300ms | Good performance, suitable for production. |
| **B (Medium)** | 70-79 points | 10-15% | 300-500ms | Basically usable, requires targeted optimization. |
| **C (Pass)** | 60-69 points | 15-20% | 500-1000ms | Suitable only for non-critical scenarios. |
| **D (Poor)** | < 60 points | > 20% | > 1000ms | Not recommended for production use. |
