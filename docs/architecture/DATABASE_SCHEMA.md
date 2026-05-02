# ProGyan AlgoLens - Database Schema Design

**Database**: PostgreSQL 15+  
**ORM**: SQLAlchemy  
**Migration Tool**: Alembic  
**Version**: 1.0

---

## Table of Contents

1. [Schema Overview](#schema-overview)
2. [Core Tables](#core-tables)
3. [Relationships](#relationships)
4. [Indexes](#indexes)
5. [Partitioning Strategy](#partitioning-strategy)
6. [Data Retention](#data-retention)

---

## Schema Overview

The database is organized into logical domains:
- **Authentication & Users**: User accounts, roles, sessions
- **Execution**: Code execution sessions, steps, results
- **Algorithms**: Algorithm definitions, implementations
- **AI & Learning**: Explanations, learner profiles, feedback
- **Analytics**: Usage statistics, performance metrics

---

## Core Tables

### users
Stores user account information.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'educator', 'student', 'guest')),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
```

---

### user_profiles
Extended user profile information.

```sql
CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    learning_level VARCHAR(50) DEFAULT 'intermediate' CHECK (learning_level IN ('beginner', 'intermediate', 'advanced')),
    preferred_language VARCHAR(50) DEFAULT 'python',
    timezone VARCHAR(100) DEFAULT 'UTC',
    notification_preferences JSONB DEFAULT '{"email": true, "push": false}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

### oauth_accounts
OAuth provider accounts linked to users.

```sql
CREATE TABLE oauth_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('google', 'github', 'microsoft')),
    provider_user_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(provider, provider_user_id)
);

CREATE INDEX idx_oauth_user_id ON oauth_accounts(user_id);
CREATE INDEX idx_oauth_provider ON oauth_accounts(provider);
```

---

### refresh_tokens
Stores refresh tokens for JWT authentication.

```sql
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
```

---

### algorithms
Algorithm definitions and metadata.

```sql
CREATE TABLE algorithms (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('sorting', 'searching', 'graph', 'dynamic_programming', 'greedy', 'backtracking', 'divide_conquer', 'other')),
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    time_complexity_best VARCHAR(50),
    time_complexity_average VARCHAR(50),
    time_complexity_worst VARCHAR(50),
    space_complexity VARCHAR(50),
    tags TEXT[] DEFAULT '{}',
    popularity DECIMAL(3,1) DEFAULT 5.0 CHECK (popularity >= 0 AND popularity <= 10),
    is_published BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_algorithms_category ON algorithms(category);
CREATE INDEX idx_algorithms_difficulty ON algorithms(difficulty);
CREATE INDEX idx_algorithms_popularity ON algorithms(popularity DESC);
CREATE INDEX idx_algorithms_tags ON algorithms USING GIN(tags);
```

---

### algorithm_implementations
Code implementations for algorithms in different languages.

```sql
CREATE TABLE algorithm_implementations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    algorithm_id VARCHAR(100) NOT NULL REFERENCES algorithms(id) ON DELETE CASCADE,
    language VARCHAR(50) NOT NULL CHECK (language IN ('python', 'javascript', 'java', 'cpp', 'go')),
    code TEXT NOT NULL,
    test_cases JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(algorithm_id, language)
);

CREATE INDEX idx_algorithm_implementations_algorithm_id ON algorithm_implementations(algorithm_id);
CREATE INDEX idx_algorithm_implementations_language ON algorithm_implementations(language);

---

### user_algorithms
Algorithms saved by users for persistence.

```sql
CREATE TABLE user_algorithms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    code TEXT NOT NULL,
    language VARCHAR(50) NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_algorithms_user_id ON user_algorithms(user_id);
CREATE INDEX idx_user_algorithms_title ON user_algorithms(title);
```

---

### algorithm_shares
Permissions for shared algorithms.

```sql
CREATE TABLE algorithm_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    algorithm_id UUID NOT NULL REFERENCES user_algorithms(id) ON DELETE CASCADE,
    shared_with_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission VARCHAR(20) NOT NULL CHECK (permission IN ('view', 'edit')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(algorithm_id, shared_with_user_id)
);

CREATE INDEX idx_algorithm_shares_user_id ON algorithm_shares(shared_with_user_id);
CREATE INDEX idx_algorithm_shares_algorithm_id ON algorithm_shares(algorithm_id);
```
```

---

### execution_sessions
Code execution session records.

```sql
CREATE TABLE execution_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    algorithm_id VARCHAR(100) REFERENCES algorithms(id),
    code TEXT NOT NULL,
    language VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'paused', 'completed', 'failed', 'stopped', 'timeout')),
    input_data JSONB,
    settings JSONB DEFAULT '{"step_by_step": true, "track_memory": true, "generate_explanations": true}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    execution_time_ms INTEGER,
    total_steps INTEGER DEFAULT 0,
    error_message TEXT,
    error_traceback TEXT
) PARTITION BY RANGE (created_at);

-- Partitions (monthly)
CREATE TABLE execution_sessions_2024_01 PARTITION OF execution_sessions
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE execution_sessions_2024_02 PARTITION OF execution_sessions
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- Indexes
CREATE INDEX idx_execution_sessions_user_id ON execution_sessions(user_id);
CREATE INDEX idx_execution_sessions_status ON execution_sessions(status);
CREATE INDEX idx_execution_sessions_created_at ON execution_sessions(created_at DESC);
CREATE INDEX idx_execution_sessions_algorithm_id ON execution_sessions(algorithm_id);
```

---

### execution_steps
Individual execution steps (stored separately for performance).

```sql
CREATE TABLE execution_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES execution_sessions(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    line_number INTEGER NOT NULL,
    code_line TEXT NOT NULL,
    state JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(session_id, step_number)
) PARTITION BY HASH (session_id);

-- Hash partitions for better distribution
CREATE TABLE execution_steps_0 PARTITION OF execution_steps
    FOR VALUES WITH (MODULUS 4, REMAINDER 0);

CREATE TABLE execution_steps_1 PARTITION OF execution_steps
    FOR VALUES WITH (MODULUS 4, REMAINDER 1);

CREATE TABLE execution_steps_2 PARTITION OF execution_steps
    FOR VALUES WITH (MODULUS 4, REMAINDER 2);

CREATE TABLE execution_steps_3 PARTITION OF execution_steps
    FOR VALUES WITH (MODULUS 4, REMAINDER 3);

-- Indexes
CREATE INDEX idx_execution_steps_session_id ON execution_steps(session_id);
CREATE INDEX idx_execution_steps_step_number ON execution_steps(session_id, step_number);
```

---

### execution_results
Final execution results and output.

```sql
CREATE TABLE execution_results (
    session_id UUID PRIMARY KEY REFERENCES execution_sessions(id) ON DELETE CASCADE,
    output TEXT,
    return_value JSONB,
    memory_usage_bytes BIGINT,
    peak_memory_bytes BIGINT,
    cpu_time_ms INTEGER,
    visualization_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_execution_results_session_id ON execution_results(session_id);
```

---

### ai_explanations
AI-generated explanations for execution steps.

```sql
CREATE TABLE ai_explanations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES execution_sessions(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    difficulty_level VARCHAR(20) NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    explanation JSONB NOT NULL,
    concepts TEXT[] DEFAULT '{}',
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tokens_used INTEGER,
    generation_time_ms INTEGER,
    
    UNIQUE(session_id, step_number, difficulty_level)
);

CREATE INDEX idx_ai_explanations_session_id ON ai_explanations(session_id);
CREATE INDEX idx_ai_explanations_concepts ON ai_explanations USING GIN(concepts);
```

---

### learner_profiles
Adaptive learning profiles for users.

```sql
CREATE TABLE learner_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    difficulty_score DECIMAL(3,2) DEFAULT 0.5 CHECK (difficulty_score >= 0 AND difficulty_score <= 1),
    concept_understanding JSONB DEFAULT '{}',
    learning_pace VARCHAR(20) DEFAULT 'medium' CHECK (learning_pace IN ('slow', 'medium', 'fast')),
    preferred_explanation_style VARCHAR(50) DEFAULT 'balanced',
    total_feedback_count INTEGER DEFAULT 0,
    positive_feedback_count INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_learner_profiles_difficulty_score ON learner_profiles(difficulty_score);
```

---

### explanation_feedback
User feedback on AI explanations.

```sql
CREATE TABLE explanation_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    explanation_id UUID NOT NULL REFERENCES ai_explanations(id) ON DELETE CASCADE,
    helpful BOOLEAN NOT NULL,
    too_simple BOOLEAN DEFAULT FALSE,
    too_complex BOOLEAN DEFAULT FALSE,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_explanation_feedback_user_id ON explanation_feedback(user_id);
CREATE INDEX idx_explanation_feedback_explanation_id ON explanation_feedback(explanation_id);
CREATE INDEX idx_explanation_feedback_helpful ON explanation_feedback(helpful);
```

---

### user_progress
Tracks user progress through algorithms.

```sql
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    algorithm_id VARCHAR(100) NOT NULL REFERENCES algorithms(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'mastered')),
    attempts INTEGER DEFAULT 0,
    successful_executions INTEGER DEFAULT 0,
    total_time_spent_seconds INTEGER DEFAULT 0,
    last_attempted TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, algorithm_id)
);

CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_algorithm_id ON user_progress(algorithm_id);
CREATE INDEX idx_user_progress_status ON user_progress(status);
```

---

### analytics_events
General analytics events tracking.

```sql
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB DEFAULT '{}',
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

-- Monthly partitions
CREATE TABLE analytics_events_2024_01 PARTITION OF analytics_events
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);
```

---

### daily_user_stats
Aggregated daily statistics per user.

```sql
CREATE TABLE daily_user_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    executions_count INTEGER DEFAULT 0,
    successful_executions INTEGER DEFAULT 0,
    failed_executions INTEGER DEFAULT 0,
    total_execution_time_ms BIGINT DEFAULT 0,
    total_steps INTEGER DEFAULT 0,
    algorithms_attempted INTEGER DEFAULT 0,
    explanations_requested INTEGER DEFAULT 0,
    time_spent_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, date)
);

CREATE INDEX idx_daily_user_stats_user_id ON daily_user_stats(user_id);
CREATE INDEX idx_daily_user_stats_date ON daily_user_stats(date DESC);
```

---

### system_metrics
System-wide performance metrics.

```sql
CREATE TABLE system_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,2) NOT NULL,
    metric_unit VARCHAR(50),
    tags JSONB DEFAULT '{}',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (recorded_at);

-- Hourly partitions for recent data
CREATE TABLE system_metrics_recent PARTITION OF system_metrics
    FOR VALUES FROM (CURRENT_TIMESTAMP - INTERVAL '7 days') TO (MAXVALUE);

CREATE INDEX idx_system_metrics_name ON system_metrics(metric_name);
CREATE INDEX idx_system_metrics_recorded_at ON system_metrics(recorded_at DESC);
```

---

## Relationships

### Entity Relationship Diagram (Textual)

```
users (1) ──< (M) execution_sessions
users (1) ──< (M) user_progress
users (1) ──< (M) explanation_feedback
users (1) ──< (M) oauth_accounts
users (1) ──< (1) learner_profiles

user_algorithms (1) ──< (M) algorithm_shares
users (1) ──< (M) user_algorithms
users (1) ──< (M) algorithm_shares (shared_with)

algorithms (1) ──< (M) algorithm_implementations
algorithms (1) ──< (M) execution_sessions
algorithms (1) ──< (M) user_progress

execution_sessions (1) ──< (M) execution_steps
execution_sessions (1) ──< (1) execution_results
execution_sessions (1) ──< (M) ai_explanations

ai_explanations (1) ──< (M) explanation_feedback
```

---

## Indexes

### Primary Indexes
All tables have primary key indexes automatically created.

### Secondary Indexes
Strategic indexes for common query patterns:

**User Queries:**
- `idx_users_email` - Login lookups
- `idx_users_role` - Role-based filtering
- `idx_oauth_user_id` - OAuth account lookups

**Execution Queries:**
- `idx_execution_sessions_user_id` - User's execution history
- `idx_execution_sessions_status` - Active executions
- `idx_execution_steps_session_id` - Step retrieval

**Algorithm Queries:**
- `idx_algorithms_category` - Category filtering
- `idx_algorithms_difficulty` - Difficulty filtering
- `idx_algorithms_popularity` - Popular algorithms

**Analytics Queries:**
- `idx_daily_user_stats_user_id` - User statistics
- `idx_analytics_events_type` - Event type filtering

### Composite Indexes

```sql
-- Frequently queried together
CREATE INDEX idx_execution_sessions_user_status 
    ON execution_sessions(user_id, status);

CREATE INDEX idx_user_progress_user_status 
    ON user_progress(user_id, status);

-- Covering index for common query
CREATE INDEX idx_algorithms_category_difficulty_popularity 
    ON algorithms(category, difficulty, popularity DESC);
```

---

## Partitioning Strategy

### Time-Based Partitioning
Tables with high write volume are partitioned by time:

**execution_sessions**: Monthly partitions
- Improves query performance for recent data
- Simplifies data archival
- Partition pruning for date-range queries

**execution_steps**: Hash partitions
- Distributes load across partitions
- Better for concurrent writes
- Improves parallel query execution

**analytics_events**: Monthly partitions
- Efficient for time-series queries
- Easy to drop old partitions

### Partition Management

```sql
-- Automated partition creation (using pg_partman extension)
SELECT partman.create_parent(
    'public.execution_sessions',
    'created_at',
    'native',
    'monthly'
);

-- Retention policy (keep 12 months)
UPDATE partman.part_config 
SET retention = '12 months',
    retention_keep_table = false
WHERE parent_table = 'public.execution_sessions';
```

---

## Data Retention

### Retention Policies

| Table | Retention Period | Archive Strategy |
|-------|-----------------|------------------|
| execution_sessions | 12 months | Move to cold storage |
| execution_steps | 6 months | Delete after archival |
| ai_explanations | 12 months | Keep aggregated data |
| analytics_events | 24 months | Aggregate to daily stats |
| daily_user_stats | Indefinite | Keep all |
| system_metrics | 90 days | Aggregate to hourly/daily |

### Archival Process

```sql
-- Archive old execution sessions to S3
CREATE OR REPLACE FUNCTION archive_old_executions()
RETURNS void AS $$
BEGIN
    -- Export to S3 via pg_dump or COPY
    COPY (
        SELECT * FROM execution_sessions 
        WHERE created_at < CURRENT_DATE - INTERVAL '12 months'
    ) TO PROGRAM 'aws s3 cp - s3://algolens-archive/executions/';
    
    -- Delete archived data
    DELETE FROM execution_sessions 
    WHERE created_at < CURRENT_DATE - INTERVAL '12 months';
END;
$$ LANGUAGE plpgsql;

-- Schedule via pg_cron
SELECT cron.schedule('archive-executions', '0 2 1 * *', 'SELECT archive_old_executions()');
```

---

## Performance Optimization

### Materialized Views

```sql
-- Popular algorithms view
CREATE MATERIALIZED VIEW mv_popular_algorithms AS
SELECT 
    a.id,
    a.name,
    a.category,
    a.difficulty,
    COUNT(DISTINCT es.user_id) as unique_users,
    COUNT(es.id) as total_executions,
    AVG(es.execution_time_ms) as avg_execution_time
FROM algorithms a
LEFT JOIN execution_sessions es ON a.id = es.algorithm_id
WHERE es.status = 'completed'
GROUP BY a.id, a.name, a.category, a.difficulty
ORDER BY total_executions DESC;

CREATE UNIQUE INDEX ON mv_popular_algorithms(id);

-- Refresh daily
SELECT cron.schedule('refresh-popular-algorithms', '0 3 * * *', 
    'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_popular_algorithms');
```

### Query Optimization Tips

1. **Use EXPLAIN ANALYZE** for slow queries
2. **Avoid SELECT *** - specify columns
3. **Use appropriate JOIN types**
4. **Leverage partition pruning**
5. **Use connection pooling** (PgBouncer)
6. **Monitor with pg_stat_statements**

---

## Backup Strategy

### Continuous Archiving (WAL)
```bash
# postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'aws s3 cp %p s3://algolens-wal/%f'
```

### Daily Backups
```bash
# Full backup daily at 2 AM
0 2 * * * pg_dump -Fc algolens > /backups/algolens_$(date +\%Y\%m\%d).dump
```

### Point-in-Time Recovery
- WAL archiving enables PITR
- RPO: 5 minutes
- RTO: 1 hour

---

## Security

### Row-Level Security (RLS)

```sql
-- Enable RLS on sensitive tables
ALTER TABLE execution_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own executions
CREATE POLICY user_executions_policy ON execution_sessions
    FOR ALL
    TO authenticated_user
    USING (user_id = current_user_id());

-- Policy: Admins can see all
CREATE POLICY admin_executions_policy ON execution_sessions
    FOR ALL
    TO admin_user
    USING (true);
```

### Encryption
- Encryption at rest: PostgreSQL native encryption
- Encryption in transit: SSL/TLS required
- Sensitive fields: Use pgcrypto for additional encryption

---

## Monitoring

### Key Metrics to Monitor
- Connection pool usage
- Query execution time (p95, p99)
- Table bloat
- Index usage
- Replication lag
- Disk usage
- Cache hit ratio

### Monitoring Queries

```sql
-- Slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;
```

---

**Last Updated**: 2024-01-15  
**Schema Version**: 1.0  
**Database**: PostgreSQL 15+