# 🔗 URL Shortener

A **production-grade URL Shortener** built with **Java Spring Boot**, designed for high performance (100k+ redirects/sec) using Clean Architecture, multi-level caching, and event-driven analytics.

---

## 📐 Architecture

**Modular Monolith + Onion (Clean / Hexagonal) Architecture**

```
┌──────────────────────────────────────────────────────────┐
│                    Presentation Layer                     │
│              Controllers / REST Endpoints                │
├──────────────────────────────────────────────────────────┤
│                    Application Layer                     │
│            Use Cases / DTOs / Mappers                    │
├──────────────────────────────────────────────────────────┤
│                      Domain Layer                        │
│        Models / Repositories / Services / Events         │
├──────────────────────────────────────────────────────────┤
│                   Infrastructure Layer                   │
│      JPA / Redis / Kafka / Bloom Filter / Security       │
└──────────────────────────────────────────────────────────┘
```

### Modules

```
urlshortener/
├── auth/          # JWT authentication (register, login)
├── user/          # User profile management
├── link/          # Short link CRUD operations
├── redirect/      # High-performance redirect resolution
├── analytics/     # Click tracking & statistics
├── quota/         # Usage limits per plan
└── shared/        # Common utilities, exceptions, rate limiting
```

---

## 🎨 Design Patterns

### 1. Clean Architecture / Hexagonal Architecture
Every module follows strict layer separation:
- **Domain** → business rules, no framework dependencies
- **Application** → use cases orchestrating domain logic
- **Infrastructure** → framework & external service adapters
- **Presentation** → REST controllers

### 2. Repository Pattern
Domain defines interfaces, infrastructure provides implementations:
```
UserRepository (interface)  →  UserRepositoryImpl (JPA adapter)
ShortLinkRepository         →  ShortLinkRepositoryImpl
AnalyticsRepository         →  AnalyticsRepositoryImpl
```

### 3. Strategy Pattern
Pluggable short code generation algorithms:
```
ShortCodeStrategy (interface)
  └── RandomShortCodeStrategy (7-char alphanumeric)
      # Easy to add: HashBasedStrategy, SequentialStrategy, etc.
```

### 4. Policy Pattern (Quota)
Plan-based usage limits with pluggable policies:
```
QuotaPolicy (interface)
  ├── FreeQuotaPolicy    → 100 links, 10k clicks/month
  └── ProQuotaPolicy     → 10k links, 1M clicks/month
```
`QuotaPolicyFactory` selects policy by user plan.

### 5. Event-Driven Pattern (Kafka)
Async click event pipeline for decoupled analytics:
```
Redirect → KafkaClickEventProducer → [link-click topic] → ClickEventConsumer → AnalyticsService
```

### 6. Domain Events (Spring ApplicationEvent)
In-process events for link lifecycle:
```
CreateShortLinkUseCase → publishes LinkCreatedEvent → (listeners)
```

### 7. Token Bucket Pattern (Rate Limiting)
Bucket4j-based rate limiting per endpoint:
```
RateLimitFilter → RateLimitService → Bucket4j Token Bucket
```

### 8. Mapper Pattern (MapStruct)
Compile-time type-safe mapping:
```
UserMapper:      Entity ↔ Domain ↔ DTO
ShortLinkMapper: Entity ↔ Domain ↔ DTO
```

### 9. Use Case Pattern
Single Responsibility per use case class:
```
CreateShortLinkUseCase    → validates, checks quota, generates code, saves, publishes event
ResolveRedirectUseCase    → bloom filter → cache → DB → redirect → Kafka event
GetLinkAnalyticsUseCase   → ownership check → aggregate stats
```

---

## ⚡ Caching Strategy

### Multi-Level Cache (Cache-Aside Pattern)

```
Request → Bloom Filter → L1 (Caffeine) → L2 (Redis) → Database
                ~0ms         ~0.05ms        ~0.5ms       ~5-10ms
```

| Level | Technology | Capacity | TTL | Latency |
|-------|-----------|----------|-----|---------|
| **Bloom Filter** | Guava BloomFilter | 1M entries, 1% FP | Rebuilds every 5min | ~0ms |
| **L1 Local** | Caffeine | 100,000 entries | 10 minutes | ~0.05ms |
| **L2 Distributed** | Redis | Unlimited | 24 hours | ~0.5ms |
| **Database** | PostgreSQL | Persistent | — | ~5-10ms |

### Cache-Aside Flow

```
resolve(shortCode):
  1. Bloom Filter check
     └── definitely not exist → 404 immediately (no cache/DB hit)

  2. L1 Caffeine local cache
     └── hit → return URL (~0.05ms)

  3. L2 Redis distributed cache
     └── hit → promote to L1 → return URL (~0.5ms)

  4. Database query
     └── found → populate L1 + L2 → return URL (~5-10ms)
     └── not found → negative cache (1min TTL) → 404
```

### Negative Cache
Prevents database spam for non-existent short codes:
```
redirect:abc999 → "NULL"    (TTL = 1 minute)
```

### Bloom Filter (Cache Penetration Protection)
Prevents attackers from bypassing cache with random codes:
```
if (!bloomFilter.mightContain(shortCode)) → 404 immediately
```
- **False positive rate:** ~1%
- **Auto-rebuild:** every 5 minutes from database
- **Instant add:** new codes registered immediately on creation

---

## 🔒 Security

### JWT Authentication
- Stateless JWT tokens with configurable expiration
- `JwtAuthenticationFilter` validates tokens on every request
- BCrypt password hashing
- Custom `RestAuthenticationEntryPoint` (401) and `RestAccessDeniedHandler` (403)

### Rate Limiting (Bucket4j Token Bucket)

| Endpoint | Limit | Key | Purpose |
|----------|-------|-----|---------|
| `GET /r/{code}` | 100 req/s | IP | Anti-DDoS |
| `POST /api/v1/auth/**` | 5 req/min | IP | Anti-brute-force |
| `POST /api/v1/links` | 10 req/min | User ID | Anti-spam |
| `GET/PUT/DELETE /api/v1/**` | 60 req/min | User ID | General protection |

Response headers: `X-Rate-Limit-Remaining`, `X-Rate-Limit-Limit`

### Quota System (Redis Counters)

| Plan | Max Links | Max Clicks/Month |
|------|-----------|-----------------|
| FREE | 100 | 10,000 |
| PRO | 10,000 | 1,000,000 |

---

## 📡 API Endpoints

### Auth (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register` | Register new user |
| `POST` | `/api/v1/auth/login` | Login, returns JWT token |

### User (Authenticated)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/users/me` | Get current user profile |
| `PUT` | `/api/v1/users/me` | Update profile |
| `PUT` | `/api/v1/users/me/password` | Change password |
| `DELETE` | `/api/v1/users/me` | Deactivate account |

### Links (Authenticated)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/links` | Create short link |
| `GET` | `/api/v1/links` | Get my links |
| `GET` | `/api/v1/links/{id}` | Get link by ID |
| `PATCH` | `/api/v1/links/{id}` | Update link (title/status) |
| `DELETE` | `/api/v1/links/{id}` | Soft delete link |

### Redirect (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/r/{shortCode}` | 302 redirect to original URL |

### Analytics (Authenticated)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/links/{shortCode}/analytics` | Daily click statistics |

---

## 🛠 Tech Stack

| Component | Technology |
|-----------|-----------|
| **Framework** | Spring Boot 3.x |
| **Language** | Java 21 |
| **Database** | PostgreSQL |
| **Cache** | Redis + Caffeine |
| **Messaging** | Apache Kafka |
| **Auth** | JWT (auth0/java-jwt) |
| **Mapping** | MapStruct |
| **Migration** | Flyway |
| **Rate Limit** | Bucket4j |
| **Bloom Filter** | Google Guava |
| **Docs** | Swagger / OpenAPI (springdoc) |

---

## 🚀 Getting Started

### Prerequisites
- Java 17+
- PostgreSQL
- Docker (for Redis & Kafka)

### 1. Start Infrastructure
```bash
docker compose up -d
```
This starts **Redis** (port 6379) and **Kafka** (port 9092).

### 2. Create Database
```sql
CREATE DATABASE url_shortener;
```

### 3. Configure Environment Variables (Optional)
All configs have sensible defaults for local development:
```bash
DB_URL=jdbc:postgresql://localhost:5432/url_shortener
DB_USERNAME=postgres
DB_PASSWORD=123456
REDIS_HOST=localhost
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
JWT_SECRET=your-super-secret-key
APP_BASE_URL=http://localhost:8080
```

### 4. Run Application
```bash
./mvnw spring-boot:run
```

### 5. Access
- **API:** http://localhost:8080
- **Swagger UI:** http://localhost:8080/swagger-ui/index.html

---

## 📊 Performance Design

Designed for **100,000+ redirects/second**:

```
┌─────────────────────────────────────────────┐
│              Redirect Request               │
│                GET /r/abc123                 │
└──────────────────┬──────────────────────────┘
                   ▼
         ┌─────────────────┐
         │  Rate Limiter    │  100 req/s per IP
         └────────┬────────┘
                  ▼
         ┌─────────────────┐
         │  Bloom Filter    │  reject invalid codes ~0ms
         └────────┬────────┘
                  ▼
         ┌─────────────────┐
         │  L1 Caffeine     │  ~0.05ms (most requests)
         └────────┬────────┘
                  ▼ (miss)
         ┌─────────────────┐
         │  L2 Redis        │  ~0.5ms
         └────────┬────────┘
                  ▼ (miss)
         ┌─────────────────┐
         │  PostgreSQL      │  ~5-10ms (rare)
         └────────┬────────┘
                  ▼
         ┌─────────────────┐
         │  302 Redirect    │
         └────────┬────────┘
                  ▼ (async)
         ┌─────────────────┐
         │  Kafka Event     │  fire-and-forget
         └─────────────────┘
```

---

## 📁 Project Structure

```
src/main/java/com/anhpt/urlshortener/
├── UrlshortenerApplication.java
│
├── auth/
│   ├── application/dto/request/          # LoginRequest, RegisterRequest
│   ├── application/dto/response/         # AuthResponse
│   ├── application/usecase/              # RegisterUseCase, LoginUseCase
│   ├── infrastructure/security/          # JWT, SecurityConfig, Filters
│   └── presentation/controller/          # AuthController
│
├── user/
│   ├── application/dto/                  # UserResponse, UpdateProfileRequest
│   ├── application/mapper/               # UserMapper (MapStruct)
│   ├── application/usecase/              # CRUD use cases
│   ├── domain/model/                     # User, UserRole, UserPlan, UserStatus
│   ├── domain/repository/                # UserRepository
│   ├── infrastructure/persistence/       # UserEntity, JPA repo, impl
│   └── presentation/controller/          # UserController
│
├── link/
│   ├── application/dto/                  # CreateRequest, UpdateRequest, Response
│   ├── application/mapper/               # ShortLinkMapper (MapStruct)
│   ├── application/usecase/              # CRUD use cases
│   ├── domain/model/                     # ShortLink, LinkStatus
│   ├── domain/repository/                # ShortLinkRepository
│   ├── domain/service/                   # ShortCodeGenerator
│   ├── domain/strategy/                  # ShortCodeStrategy, RandomStrategy
│   ├── domain/validator/                 # LinkValidator
│   ├── domain/event/                     # LinkCreatedEvent
│   ├── infrastructure/config/            # LinkConfig
│   ├── infrastructure/persistence/       # ShortLinkEntity, JPA repo, impl
│   └── presentation/controller/          # LinkController
│
├── redirect/
│   ├── application/usecase/              # ResolveRedirectUseCase
│   ├── domain/event/                     # ClickEvent
│   ├── domain/service/                   # RedirectDomainService, ports
│   ├── infrastructure/bloom/             # BloomFilterService (Guava)
│   ├── infrastructure/cache/             # MultiLevelRedirectCache
│   ├── infrastructure/client/            # DatabaseLinkQueryClient
│   ├── infrastructure/messaging/         # KafkaClickEventProducer
│   └── presentation/controller/          # RedirectController
│
├── analytics/
│   ├── application/dto/                  # AnalyticsResponse, DailyStats
│   ├── application/usecase/              # GetLinkAnalyticsUseCase
│   ├── domain/model/                     # LinkAnalytics
│   ├── domain/repository/                # AnalyticsRepository
│   ├── domain/service/                   # AnalyticsService
│   ├── infrastructure/consumer/          # ClickEventConsumer (Kafka)
│   ├── infrastructure/persistence/       # Entity, JPA repo, impl
│   └── presentation/controller/          # AnalyticsController
│
├── quota/
│   └── domain/
│       ├── policy/                       # QuotaPolicy, Free, Pro, Factory
│       └── service/                      # QuotaService (Redis counters)
│
└── shared/
    ├── exception/                        # GlobalExceptionHandler, ErrorCodes
    ├── ratelimit/                        # RateLimitFilter, Service, Plan
    ├── response/                         # ApiResponse
    └── security/                         # SecurityUtils
```
