# ProGyan AlgoLens - API Contract Specifications

**Version**: 1.0  
**Base URL**: `https://api.algolens.com/api/v1`  
**Protocol**: REST + WebSocket  
**Authentication**: JWT Bearer Token

---

## Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [Execution Endpoints](#execution-endpoints)
3. [Algorithm Endpoints](#algorithm-endpoints)
4. [User Endpoints](#user-endpoints)
5. [Analytics Endpoints](#analytics-endpoints)
6. [WebSocket API](#websocket-api)
7. [Error Responses](#error-responses)
8. [Rate Limiting](#rate-limiting)

---

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe",
  "role": "student"
}
```

**Response (201 Created):**
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "student",
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

### POST /auth/login
Authenticate user and receive access token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 900
}
```

---

### POST /auth/refresh
Refresh access token using refresh token.

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 900
}
```

---

### POST /auth/logout
Invalidate current session.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (204 No Content)**

---

## Execution Endpoints

### POST /execution/start
Start code execution session.

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request:**
```json
{
  "code": "def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n-i-1):\n            if arr[j] > arr[j+1]:\n                arr[j], arr[j+1] = arr[j+1], arr[j]\n    return arr\n\nresult = bubble_sort([64, 34, 25, 12, 22, 11, 90])\nprint(result)",
  "language": "python",
  "input_data": null,
  "settings": {
    "step_by_step": true,
    "track_memory": true,
    "generate_explanations": true,
    "difficulty_level": "intermediate"
  }
}
```

**Response (202 Accepted):**
```json
{
  "session_id": "exec_7f3d8e9a-1b2c-4d5e-8f9a-0b1c2d3e4f5a",
  "status": "queued",
  "created_at": "2024-01-15T10:30:00Z",
  "websocket_url": "wss://api.algolens.com/ws/execution/exec_7f3d8e9a-1b2c-4d5e-8f9a-0b1c2d3e4f5a"
}
```

---

### GET /execution/{session_id}
Get execution session details.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "session_id": "exec_7f3d8e9a-1b2c-4d5e-8f9a-0b1c2d3e4f5a",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "code": "def bubble_sort(arr):...",
  "language": "python",
  "status": "completed",
  "created_at": "2024-01-15T10:30:00Z",
  "started_at": "2024-01-15T10:30:01Z",
  "completed_at": "2024-01-15T10:30:15Z",
  "total_steps": 156,
  "execution_time_ms": 14250,
  "result": {
    "output": "[11, 12, 22, 25, 34, 64, 90]",
    "error": null
  }
}
```

---

### POST /execution/{session_id}/stop
Stop running execution.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "session_id": "exec_7f3d8e9a-1b2c-4d5e-8f9a-0b1c2d3e4f5a",
  "status": "stopped",
  "stopped_at": "2024-01-15T10:30:10Z"
}
```

---

### GET /execution/{session_id}/steps
Get all execution steps.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `skip` (optional): Number of steps to skip (default: 0)
- `limit` (optional): Maximum steps to return (default: 100, max: 1000)

**Response (200 OK):**
```json
{
  "session_id": "exec_7f3d8e9a-1b2c-4d5e-8f9a-0b1c2d3e4f5a",
  "total_steps": 156,
  "steps": [
    {
      "step_number": 1,
      "line_number": 1,
      "code_line": "def bubble_sort(arr):",
      "timestamp": "2024-01-15T10:30:01.100Z",
      "state": {
        "variables": {},
        "stack": [
          {
            "function": "<module>",
            "line": 1,
            "locals": {}
          }
        ],
        "heap": {}
      }
    },
    {
      "step_number": 2,
      "line_number": 10,
      "code_line": "result = bubble_sort([64, 34, 25, 12, 22, 11, 90])",
      "timestamp": "2024-01-15T10:30:01.150Z",
      "state": {
        "variables": {
          "bubble_sort": "<function bubble_sort>"
        },
        "stack": [
          {
            "function": "<module>",
            "line": 10,
            "locals": {
              "bubble_sort": "<function>"
            }
          }
        ],
        "heap": {}
      }
    }
  ],
  "pagination": {
    "skip": 0,
    "limit": 100,
    "has_more": true
  }
}
```

---

### GET /execution/history
Get user's execution history.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `language` (optional): Filter by language
- `status` (optional): Filter by status (completed, failed, stopped)
- `skip` (optional): Pagination offset (default: 0)
- `limit` (optional): Items per page (default: 20, max: 100)

**Response (200 OK):**
```json
{
  "total": 45,
  "executions": [
    {
      "session_id": "exec_7f3d8e9a-1b2c-4d5e-8f9a-0b1c2d3e4f5a",
      "language": "python",
      "status": "completed",
      "created_at": "2024-01-15T10:30:00Z",
      "execution_time_ms": 14250,
      "total_steps": 156,
      "algorithm_name": "Bubble Sort"
    }
  ],
  "pagination": {
    "skip": 0,
    "limit": 20,
    "has_more": true
  }
}
```

---

## Algorithm Endpoints

### GET /algorithms
List available algorithms.

**Query Parameters:**
- `category` (optional): Filter by category (sorting, searching, graph, dp, etc.)
- `difficulty` (optional): Filter by difficulty (easy, medium, hard)
- `language` (optional): Filter by supported language
- `search` (optional): Search by name or description
- `skip` (optional): Pagination offset (default: 0)
- `limit` (optional): Items per page (default: 20, max: 100)

**Response (200 OK):**
```json
{
  "total": 150,
  "algorithms": [
    {
      "id": "algo_bubble_sort",
      "name": "Bubble Sort",
      "description": "Simple sorting algorithm that repeatedly steps through the list...",
      "category": "sorting",
      "difficulty": "easy",
      "time_complexity": "O(n²)",
      "space_complexity": "O(1)",
      "supported_languages": ["python", "javascript", "java"],
      "tags": ["sorting", "comparison", "in-place"],
      "popularity": 8.5
    }
  ],
  "pagination": {
    "skip": 0,
    "limit": 20,
    "has_more": true
  }
}
```

---

### GET /algorithms/{algorithm_id}
Get algorithm details.

**Response (200 OK):**
```json
{
  "id": "algo_bubble_sort",
  "name": "Bubble Sort",
  "description": "Bubble sort is a simple sorting algorithm...",
  "category": "sorting",
  "difficulty": "easy",
  "time_complexity": {
    "best": "O(n)",
    "average": "O(n²)",
    "worst": "O(n²)"
  },
  "space_complexity": "O(1)",
  "supported_languages": ["python", "javascript", "java"],
  "implementations": {
    "python": "def bubble_sort(arr):\n    n = len(arr)...",
    "javascript": "function bubbleSort(arr) {\n    let n = arr.length;...",
    "java": "public static void bubbleSort(int[] arr) {...}"
  },
  "explanation": {
    "overview": "Bubble sort works by repeatedly swapping adjacent elements...",
    "steps": [
      "Compare adjacent elements",
      "Swap if they are in wrong order",
      "Repeat until no swaps needed"
    ],
    "use_cases": [
      "Small datasets",
      "Nearly sorted data",
      "Educational purposes"
    ]
  },
  "related_algorithms": ["selection_sort", "insertion_sort", "quick_sort"],
  "tags": ["sorting", "comparison", "in-place"],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

---

## User Endpoints

### GET /users/me
Get current user profile.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "student",
  "profile": {
    "avatar_url": "https://cdn.algolens.com/avatars/user123.jpg",
    "bio": "Computer Science student learning algorithms",
    "learning_level": "intermediate",
    "preferred_language": "python"
  },
  "stats": {
    "total_executions": 145,
    "algorithms_completed": 23,
    "total_execution_time_hours": 12.5,
    "streak_days": 7
  },
  "created_at": "2024-01-01T00:00:00Z",
  "last_login": "2024-01-15T10:00:00Z"
}
```

---

### PATCH /users/me
Update user profile.

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request:**
```json
{
  "full_name": "John Smith",
  "profile": {
    "bio": "Updated bio",
    "learning_level": "advanced",
    "preferred_language": "javascript"
  }
}
```

**Response (200 OK):**
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "full_name": "John Smith",
  "profile": {
    "bio": "Updated bio",
    "learning_level": "advanced",
    "preferred_language": "javascript"
  },
  "updated_at": "2024-01-15T10:30:00Z"
}
```

---

## Analytics Endpoints

### GET /analytics/progress
Get user learning progress.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `period` (optional): Time period (week, month, year, all) (default: month)

**Response (200 OK):**
```json
{
  "period": "month",
  "start_date": "2024-01-01T00:00:00Z",
  "end_date": "2024-01-31T23:59:59Z",
  "summary": {
    "total_executions": 45,
    "algorithms_completed": 12,
    "total_steps": 5420,
    "average_execution_time_ms": 8500,
    "languages_used": ["python", "javascript"]
  },
  "daily_activity": [
    {
      "date": "2024-01-15",
      "executions": 5,
      "time_spent_minutes": 45
    }
  ],
  "category_breakdown": {
    "sorting": 15,
    "searching": 10,
    "graph": 8,
    "dynamic_programming": 7,
    "other": 5
  },
  "difficulty_breakdown": {
    "easy": 20,
    "medium": 18,
    "hard": 7
  }
}
```

---

## WebSocket API

### Connection
```
wss://api.algolens.com/ws/execution/{session_id}?token={access_token}
```

### Message Format
All WebSocket messages follow this structure:
```json
{
  "type": "message_type",
  "data": {},
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Client → Server Messages

#### Subscribe to Execution
```json
{
  "type": "subscribe",
  "data": {
    "session_id": "exec_7f3d8e9a-1b2c-4d5e-8f9a-0b1c2d3e4f5a"
  }
}
```

#### Control Execution
```json
{
  "type": "control",
  "data": {
    "action": "pause|resume|stop|step_forward|step_backward"
  }
}
```

#### Request Explanation
```json
{
  "type": "request_explanation",
  "data": {
    "step_number": 42,
    "difficulty_level": "intermediate"
  }
}
```

### Server → Client Messages

#### Execution Started
```json
{
  "type": "execution:started",
  "data": {
    "session_id": "exec_7f3d8e9a-1b2c-4d5e-8f9a-0b1c2d3e4f5a",
    "started_at": "2024-01-15T10:30:01Z"
  },
  "timestamp": "2024-01-15T10:30:01Z"
}
```

#### Execution Step
```json
{
  "type": "execution:step",
  "data": {
    "step_number": 42,
    "line_number": 5,
    "code_line": "if arr[j] > arr[j+1]:",
    "state": {
      "variables": {
        "arr": [34, 25, 64, 12, 22, 11, 90],
        "n": 7,
        "i": 0,
        "j": 2
      },
      "stack": [
        {
          "function": "bubble_sort",
          "line": 5,
          "locals": {
            "arr": [34, 25, 64, 12, 22, 11, 90],
            "n": 7,
            "i": 0,
            "j": 2
          }
        }
      ]
    }
  },
  "timestamp": "2024-01-15T10:30:02.500Z"
}
```

#### AI Explanation
```json
{
  "type": "ai:explanation",
  "data": {
    "step_number": 42,
    "explanation": {
      "what": "Comparing arr[2] (64) with arr[3] (12)",
      "why": "To determine if these elements need to be swapped",
      "how": "Using the > operator to check if left element is greater",
      "impact": "If true, the next step will swap these elements"
    },
    "concepts": ["comparison", "conditional", "array_indexing"],
    "difficulty_level": "intermediate"
  },
  "timestamp": "2024-01-15T10:30:02.600Z"
}
```

#### Execution Completed
```json
{
  "type": "execution:completed",
  "data": {
    "session_id": "exec_7f3d8e9a-1b2c-4d5e-8f9a-0b1c2d3e4f5a",
    "total_steps": 156,
    "execution_time_ms": 14250,
    "result": {
      "output": "[11, 12, 22, 25, 34, 64, 90]",
      "error": null
    }
  },
  "timestamp": "2024-01-15T10:30:15Z"
}
```

#### Execution Error
```json
{
  "type": "execution:error",
  "data": {
    "session_id": "exec_7f3d8e9a-1b2c-4d5e-8f9a-0b1c2d3e4f5a",
    "error": {
      "type": "RuntimeError",
      "message": "list index out of range",
      "line": 6,
      "traceback": "Traceback (most recent call last):\n  File..."
    }
  },
  "timestamp": "2024-01-15T10:30:05Z"
}
```

---

## Error Responses

All error responses follow this structure:

```json
{
  "error": {
    "code": "error_code",
    "message": "Human-readable error message",
    "details": {},
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_abc123"
  }
}
```

### Common Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | `invalid_request` | Request validation failed |
| 401 | `unauthorized` | Missing or invalid authentication |
| 403 | `forbidden` | Insufficient permissions |
| 404 | `not_found` | Resource not found |
| 409 | `conflict` | Resource conflict |
| 422 | `validation_error` | Input validation failed |
| 429 | `rate_limit_exceeded` | Too many requests |
| 500 | `internal_error` | Internal server error |
| 503 | `service_unavailable` | Service temporarily unavailable |

### Example Error Response

```json
{
  "error": {
    "code": "validation_error",
    "message": "Invalid code syntax",
    "details": {
      "field": "code",
      "issue": "SyntaxError: invalid syntax",
      "line": 5
    },
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_abc123"
  }
}
```

---

## Rate Limiting

### Rate Limit Headers
All API responses include rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705318200
```

### Rate Limits by Endpoint

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/auth/login` | 5 requests | 15 minutes |
| `/auth/register` | 3 requests | 1 hour |
| `/execution/start` | 10 requests | 1 minute |
| `/execution/*` (GET) | 100 requests | 1 minute |
| `/algorithms/*` | 100 requests | 1 minute |
| `/users/*` | 50 requests | 1 minute |

### Rate Limit Exceeded Response

```json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Too many requests. Please try again later.",
    "details": {
      "limit": 10,
      "window": "1 minute",
      "retry_after": 45
    },
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_abc123"
  }
}
```

---

## Versioning

API versioning is handled through the URL path:
- Current version: `/api/v1`
- Future versions: `/api/v2`, `/api/v3`, etc.

Deprecated versions will be supported for at least 12 months after a new version is released.

---

## Pagination

All list endpoints support cursor-based pagination:

**Request:**
```
GET /algorithms?skip=20&limit=20
```

**Response:**
```json
{
  "total": 150,
  "data": [...],
  "pagination": {
    "skip": 20,
    "limit": 20,
    "has_more": true,
    "next_cursor": "eyJpZCI6ImFsZ29fYnViYmxlX3NvcnQifQ=="
  }
}
```

---

## Filtering and Sorting

### Filtering
Use query parameters for filtering:
```
GET /algorithms?category=sorting&difficulty=easy
```

### Sorting
Use `sort` parameter:
```
GET /algorithms?sort=popularity:desc,name:asc
```

---

## Webhooks (Future)

Webhook support for external integrations:
- `execution.completed`
- `execution.failed`
- `user.registered`
- `analytics.milestone_reached`

---

## SDK Support

Official SDKs available for:
- Python: `pip install algolens-sdk`
- JavaScript/TypeScript: `npm install @algolens/sdk`
- Java: Maven/Gradle support

Example usage:
```python
from algolens import AlgoLens

client = AlgoLens(api_key="your_api_key")
execution = client.execute_code(
    code="print('hello')",
    language="python"
)
```

---

**Last Updated**: 2024-01-15  
**API Version**: 1.0  
**Contact**: api-support@algolens.com