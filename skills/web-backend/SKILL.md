---
name: web-backend
description: Comprehensive backend development skill covering Node.js, Python, Go, Java, Rust, PHP, Ruby, API design, databases, authentication, architecture patterns, performance optimization, security, and testing
---

# Web Backend

Expert-level backend development across all major languages, frameworks, and architectures. Covers server-side programming from initial design through production deployment, with deep expertise in API development, database management, authentication, performance optimization, security hardening, and testing.

## Languages & Runtimes

### Node.js

**Expertise Level:** Senior/Staff Engineer

Build production-grade Node.js services with Express, Fastify, and NestJS. Implements server-side patterns including dependency injection, middleware pipelines, event-driven architectures, and microservices communication.

#### Frameworks

**Express.js** — Minimal, unopinionated web framework. Ideal for REST APIs, proxy servers, and lightweight microservices.

```js
import express from 'express';
import { rateLimit } from 'express-rate-limit';

const app = express();

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use(express.json());
app.use('/api/', limiter);

app.get('/api/users/:id', async (req, res, next) => {
  try {
    const user = await userService.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
  });
});
```

**Fastify** — High-performance framework with schema-based validation and plugin architecture. Best for high-throughput APIs and low-latency services.

```js
import Fastify from 'fastify';
import Swagger from '@fastify/swagger';

const fastify = Fastify({ logger: true });

await fastify.register(Swagger, {
  openapi: {
    info: { title: 'My API', version: '1.0.0' },
  },
});

fastify.post('/api/orders', {
  schema: {
    body: {
      type: 'object',
      required: ['userId', 'items'],
      properties: {
        userId: { type: 'string', format: 'uuid' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              productId: { type: 'string', format: 'uuid' },
              quantity: { type: 'integer', minimum: 1 },
            },
          },
        },
      },
    },
    response: {
      201: { type: 'object', properties: { id: { type: 'string' }, status: { type: 'string' } } },
    },
  },
  handler: async (request, reply) => {
    const order = await orderService.create(request.body);
    reply.code(201).send(order);
  },
});
```

**NestJS** — Opinionated, Angular-inspired framework with dependency injection, decorators, and modular architecture. Best for enterprise applications and large teams.

```typescript
import { Controller, Get, Post, Body, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@Controller('api/orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }
}
```

#### Core Patterns

- **Middleware pipeline** — Request/response transformation, authentication, logging, error handling
- **Dependency injection** — Inversion of control for testable, loosely coupled services
- **Repository pattern** — Data access abstraction over ORMs and query builders
- **Service layer** — Business logic isolated from HTTP concerns
- **Event emitters** — `EventEmitter2` or `@nestjs/event-emitter` for decoupled domain events
- **Streaming** — `Readable`/`Writable` streams for file uploads, large datasets, real-time data
- **Graceful shutdown** — Handle `SIGTERM`/`SIGINT` to finish in-flight requests before exit

#### Best Practices

- Use TypeScript for all new projects — type safety prevents entire classes of runtime errors
- Implement structured logging with `pino` or `winston` (JSON format, correlation IDs, log levels)
- Validate all inputs with `zod`, `joi`, or `class-validator` at the API boundary
- Use connection pooling for database connections; never create a new connection per request
- Implement health check endpoints (`/health`, `/ready`) for Kubernetes and load balancers
- Set appropriate HTTP cache headers (`ETag`, `Cache-Control`) for idempotent GET requests
- Use `async`/`await` consistently; avoid raw Promise chains or callback patterns
- Handle uncaught exceptions and unhandled rejections at the process level to prevent silent failures

---

### Python Backend

**Expertise Level:** Senior/Staff Engineer

Production Python backends with FastAPI, Django, and Flask. Covers async/await patterns, dependency injection, type-safe APIs, and data-intensive services.

#### FastAPI

Modern, high-performance framework with automatic OpenAPI docs, Pydantic validation, and native async support. Best for new Python APIs and microservices.

```python
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime, timedelta
import asyncpg

app = FastAPI(title="User Service API", version="1.0.0")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class UserCreate(BaseModel):
    email: EmailStr
    name: str = Field(min_length=2, max_length=100)
    role: Optional[str] = Field(default="user", pattern="^(user|admin|moderator)$")

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    name: str
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}

@app.post("/api/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, db=Depends(get_db)):
    """Create a new user with validated input."""
    existing = await db.fetchrow("SELECT id FROM users WHERE email = $1", user.email)
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    
    row = await db.fetchrow(
        "INSERT INTO users (email, name, role) VALUES ($1, $2, $3) RETURNING *",
        user.email, user.name, user.role,
    )
    return UserResponse.model_validate(row)

@app.get("/api/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db=Depends(get_db)):
    row = await db.fetchrow("SELECT * FROM users WHERE id = $1", user_id)
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse.model_validate(row)
```

#### Django / Django REST Framework

Batteries-included framework with ORM, admin panel, authentication, and migrations. Best for content-heavy applications, SaaS products, and teams that need rapid development.

```python
# models.py
from django.db import models
from django.contrib.auth.models import AbstractUser

class Organization(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

class User(AbstractUser):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="users")
    role = models.CharField(max_length=20, choices=[("admin", "Admin"), ("member", "Member")])

# serializers.py
from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "organization", "role"]
        read_only_fields = ["id"]

# views.py
from rest_framework import viewsets, permissions
from rest_framework.permissions import IsAuthenticated

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return User.objects.filter(organization=self.request.user.organization)
```

#### Flask

Lightweight micro-framework for simple APIs, glue code, and small services. Best when you need minimal overhead and full control over architecture.

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
from marshmallow import Schema, fields, validate

app = Flask(__name__)
CORS(app)

class TaskSchema(Schema):
    title = fields.Str(required=True, validate=validate.Length(min=1, max=200))
    priority = fields.Int(required=True, validate=validate.Range(min=1, max=5))

task_schema = TaskSchema()

@app.route("/api/tasks", methods=["POST"])
def create_task():
    errors = task_schema.validate(request.json)
    if errors:
        return jsonify({"errors": errors}), 400
    task = task_service.create(task_schema.load(request.json))
    return jsonify(task), 201
```

#### Python Backend Patterns

- **Async/await** — `asyncio` event loop, `httpx` for async HTTP, `asyncpg` for async PostgreSQL
- **Dependency injection** — FastAPI's `Depends()`, or `dependency-injector` for larger applications
- **Background tasks** — Celery with Redis broker, or RQ for simpler job queues
- **Type hints** — Full type annotation with `mypy` strict mode for all production code
- **Pydantic models** — Runtime validation with `BaseModel`, `Field` constraints, and custom validators
- **Database migrations** — Alembic for SQLAlchemy projects, Django's built-in migration system
- **Configuration management** — `pydantic-settings` with `.env` file support and environment variable validation

---

### Go Backend

**Expertise Level:** Senior Engineer

High-performance, concurrent Go services with goroutines, channels, and idiomatic patterns. Best for infrastructure tooling, high-throughput APIs, and system-level services.

```go
package main

import (
    "context"
    "encoding/json"
    "log"
    "net/http"
    "os"
    "os/signal"
    "syscall"
    "time"

    "github.com/go-chi/chi/v5"
    "github.com/go-chi/chi/v5/middleware"
)

type Server struct {
    router *chi.Mux
    http   *http.Server
}

func NewServer() *Server {
    r := chi.NewRouter()
    r.Use(middleware.Logger)
    r.Use(middleware.Recoverer)
    r.Use(middleware.RequestID)
    r.Use(middleware.RealIP)
    r.Use(middleware.Timeout(30 * time.Second))

    s := &Server{
        router: r,
        http: &http.Server{
            Addr:         ":8080",
            Handler:      r,
            ReadTimeout:  10 * time.Second,
            WriteTimeout: 30 * time.Second,
            IdleTimeout:  60 * time.Second,
        },
    }

    r.Get("/health", s.healthCheck)
    r.Get("/api/users/{id}", s.getUser)

    return s
}

func (s *Server) Run() error {
    stop := make(chan os.Signal, 1)
    signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)

    go func() {
        log.Printf("Server starting on %s", s.http.Addr)
        if err := s.http.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            log.Fatal(err)
        }
    }()

    <-stop
    log.Println("Shutting down gracefully...")

    ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
    defer cancel()
    return s.http.Shutdown(ctx)
}

func (s *Server) healthCheck(w http.ResponseWriter, r *http.Request) {
    json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}
```

#### Go Concurrency Patterns

- **Worker pools** — Bounded goroutine pools with buffered channels for controlled parallelism
- **Fan-out/fan-in** — Distribute work across goroutines and aggregate results via channels
- **Context propagation** — Pass `context.Context` through all layers for cancellation and timeouts
- **ErrGroup** — `golang.org/x/sync/errgroup` for managing multiple concurrent operations
- **Rate limiting** — Token bucket with `time.Ticker` or `golang.org/x/time/rate`

#### Go Best Practices

- Idiomatic error handling — return errors, don't panic (except in `init()` and truly unrecoverable cases)
- Interface segregation — define small interfaces at the consumer, not the producer
- Table-driven tests — use `t.Run()` subtests for comprehensive test coverage
- `go mod` for dependency management — pin versions, use `go mod tidy`
- `golangci-lint` for static analysis — combine `go vet`, `staticcheck`, `errcheck`, and more

---

### Java Backend

**Expertise Level:** Senior Engineer

Enterprise Java with Spring Boot, Jakarta EE, and modern JVM patterns. Covers reactive programming, microservices, and production-grade service architecture.

#### Spring Boot

```java
@RestController
@RequestMapping("/api/orders")
@Validated
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse createOrder(@Valid @RequestBody CreateOrderRequest request) {
        return orderService.create(request);
    }

    @GetMapping("/{id}")
    public OrderResponse getOrder(@PathVariable UUID id) {
        return orderService.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));
    }

    @GetMapping
    public Page<OrderResponse> listOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return orderService.findAll(PageRequest.of(page, size));
    }
}
```

#### Java Backend Patterns

- **Dependency injection** — Constructor injection with `@Autowired` or explicit constructors
- **Spring Data JPA** — Repository interfaces with derived queries and `@Query` annotations
- **Reactive streams** — Spring WebFlux with `Mono`/`Flux` for non-blocking I/O
- **Bean Validation** — `@Valid`, `@NotNull`, `@Size`, custom validators at the API boundary
- **Exception handling** — `@ControllerAdvice` with `@ExceptionHandler` for global error responses
- **Actuator** — `/actuator/health`, `/actuator/metrics`, `/actuator/prometheus` for observability

---

### Rust Backend

**Expertise Level:** Senior Engineer

Memory-safe, high-performance Rust services with `axum`, `actix-web`, and `tokio`. Covers async runtime patterns, error handling, and zero-cost abstractions.

```rust
use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json, Router,
    routing::get, post,
};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

#[derive(Deserialize)]
struct CreateUser {
    name: String,
    email: String,
}

#[derive(Serialize)]
struct UserResponse {
    id: Uuid,
    name: String,
    email: String,
}

#[derive(OpenApi)]
#[openapi(
    paths(create_user, get_user),
    components(schemas(CreateUser, UserResponse))
)]
struct ApiDoc;

async fn create_user(
    State(pool): State<PgPool>,
    Json(payload): Json<CreateUser>,
) -> Result<(StatusCode, Json<UserResponse>), (StatusCode, String)> {
    let user = sqlx::query_as!(
        UserResponse,
        "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email",
        payload.name,
        payload.email,
    )
    .fetch_one(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok((StatusCode::CREATED, Json(user)))
}

async fn get_user(
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<Json<UserResponse>, (StatusCode, String)> {
    let user = sqlx::query_as!(
        UserResponse,
        "SELECT id, name, email FROM users WHERE id = $1",
        id,
    )
    .fetch_optional(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
    .ok_or_else(|| (StatusCode::NOT_FOUND, "User not found".to_string()))?;

    Ok(Json(user))
}

pub fn app(pool: PgPool) -> Router {
    Router::new()
        .route("/api/users", post(create_user))
        .route("/api/users/{id}", get(get_user))
        .merge(SwaggerUi::new("/swagger-ui").url("/api-docs/openapi.json", ApiDoc::openapi()))
        .with_state(pool)
}
```

#### Rust Backend Patterns

- **Async runtime** — `tokio` with `#[tokio::main]` and `#[tokio::test]`
- **Error handling** — `thiserror` for library errors, `anyhow` for application errors, `Result` return types
- **Database** — `sqlx` with compile-time query checking (`sqlx::query_as!` macro)
- **Serialization** — `serde` with `Serialize`/`Deserialize` derives for JSON, form data, query params
- **OpenAPI** — `utoipa` for compile-time OpenAPI spec generation from code
- **Zero-cost abstractions** — Iterator chains, pattern matching, `Option`/`Result` combinators

---

### PHP / Laravel

**Expertise Level:** Senior Engineer

Production PHP with Laravel's expressive API layer, Eloquent ORM, queues, and service container. Best for rapid application development and SaaS products.

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(
        protected OrderService $orderService
    ) {}

    public function index(Request $request): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        $orders = Order::query()
            ->when($request->user()->isNotAdmin(), fn($q) => $q->where('user_id', $request->user()->id))
            ->latest()
            ->paginate(20);

        return OrderResource::collection($orders);
    }

    public function store(StoreOrderRequest $request): JsonResponse
    {
        $order = $this->orderService->create(
            $request->validated(),
            $request->user()
        );

        return response()->json(new OrderResource($order), 201);
    }

    public function show(Order $order): OrderResource
    {
        $this->authorize('view', $order);
        return new OrderResource($order->load(['items', 'user']));
    }
}
```

#### Laravel Patterns

- **Eloquent ORM** — Relationships, query scopes, accessors/mutators, soft deletes
- **Form requests** — Typed validation with `StoreXRequest` / `UpdateXRequest` classes
- **API resources** — Consistent JSON transformation with `JsonResource` classes
- **Queues** — Background job processing with Redis, SQS, or database drivers
- **Service container** — Dependency injection with automatic resolution and binding
- **Policies & Gates** — Fine-grained authorization with `can()` middleware
- **Events & listeners** — Domain event dispatching with synchronous or queued handlers

---

### Ruby

**Expertise Level:** Senior Engineer

Ruby on Rails and Sinatra for convention-over-configuration web applications. Covers ActiveRecord, ActionCable, Sidekiq, and Rails API mode.

```ruby
# app/controllers/api/v1/orders_controller.rb
module Api
  module V1
    class OrdersController < ApplicationController
      before_action :authenticate_user!
      before_action :set_order, only: %i[show update cancel]

      # GET /api/v1/orders
      def index
        orders = policy_scope(Order)
          .includes(:line_items, :user)
          .order(created_at: :desc)
          .page(params[:page])
          .per(params[:per_page] || 20)

        render json: orders, include: ['line_items', 'user'], meta: pagination_meta(orders)
      end

      # POST /api/v1/orders
      def create
        order = Order.new(order_params.merge(user: current_user))

        if order.save
          OrderProcessingJob.perform_later(order.id)
          render json: order, status: :created, include: ['line_items']
        else
          render json: { errors: order.errors }, status: :unprocessable_entity
        end
      end

      private

      def set_order
        @order = policy_scope(Order).find(params[:id])
        authorize @order
      end

      def order_params
        params.require(:order).permit(:shipping_address, :notes, line_items_attributes: %i[product_id quantity])
      end
    end
  end
end
```

#### Ruby Patterns

- **ActiveRecord** — Migrations, associations, scopes, callbacks, concerns, single-table inheritance
- **Pundit** — Policy-based authorization with `policy_scope` and `authorize`
- **Sidekiq** — Background job processing with Redis, retry logic, and scheduled jobs
- **RSpec** — Behavior-driven testing with `describe`, `context`, `it`, and shared examples
- **Service objects** — Plain Ruby objects (`Interactors` or `ServiceObject` pattern) for complex business logic
- **GraphQL Ruby** — Type definitions, resolvers, mutations, and dataloader for N+1 prevention

---

## API Design & Development

### REST API Design

**Principles:**

- **Resource-oriented URLs** — Use nouns for resources (`/users`, `/orders`), HTTP verbs for actions (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`)
- **Consistent response format** — Standard envelope with `data`, `meta`, `links`, and `errors` fields
- **Pagination** — Cursor-based for large datasets, offset/limit for smaller ones; always include `next`, `prev`, `total`
- **Filtering & sorting** — Query parameters (`?status=active&sort=-created_at`) with server-side validation
- **Versioning** — URL versioning (`/api/v1/`) or header-based (`Accept: application/vnd.myapi.v1+json`)
- **Idempotency** — `POST` endpoints that create resources should support `Idempotency-Key` headers for safe retries
- **HATEOAS** — Include `links` in responses for discoverable APIs

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "type": "orders",
      "attributes": {
        "status": "pending",
        "total": 149.99,
        "created_at": "2025-01-15T10:30:00Z"
      },
      "links": {
        "self": "/api/v1/orders/550e8400-e29b-41d4-a716-446655440000"
      }
    }
  ],
  "meta": {
    "total": 142,
    "page": 1,
    "per_page": 20
  },
  "links": {
    "next": "/api/v1/orders?page=2",
    "prev": null
  }
}
```

### GraphQL

Schema-first API with type definitions, resolvers, subscriptions, and DataLoader for query optimization.

```typescript
import { gql, ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import DataLoader from 'dataloader';

const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    name: String!
    orders: [Order!]!
  }

  type Order {
    id: ID!
    status: OrderStatus!
    total: Float!
    user: User!
  }

  enum OrderStatus {
    PENDING
    CONFIRMED
    SHIPPED
    DELIVERED
    CANCELLED
  }

  type Query {
    user(id: ID!): User
    users(limit: Int, offset: Int): [User!]!
    order(id: ID!): Order
  }

  type Mutation {
    createOrder(input: CreateOrderInput!): Order!
    updateOrderStatus(id: ID!, status: OrderStatus!): Order!
  }

  type Subscription {
    orderStatusChanged(orderId: ID!): Order!
  }

  input CreateOrderInput {
    userId: ID!
    items: [OrderItemInput!]!
  }

  input OrderItemInput {
    productId: ID!
    quantity: Int!
  }
`;

// DataLoader batch function to prevent N+1 queries
const batchUsers = async (userIds: readonly string[]) => {
  const users = await db.users.findMany({
    where: { id: { in: [...userIds] } },
  });
  return userIds.map(id => users.find(u => u.id === id));
};

const resolvers = {
  Query: {
    user: async (_, { id }, { dataSources }) => {
      return dataSources.userLoader.load(id);
    },
    orders: async (_, { limit = 20, offset = 0 }, { dataSources }) => {
      return dataSources.orders.findMany({ take: limit, skip: offset });
    },
  },
  Mutation: {
    createOrder: async (_, { input }, { dataSources }) => {
      return dataSources.orders.create({ data: input });
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
```

### gRPC

High-performance RPC framework with Protocol Buffers for service-to-service communication.

```protobuf
syntax = "proto3";

package orders.v1;

option go_package = "github.com/myorg/orders/gen/go/v1";

service OrderService {
  rpc CreateOrder(CreateOrderRequest) returns (OrderResponse);
  rpc GetOrder(GetOrderRequest) returns (OrderResponse);
  rpc ListOrders(ListOrdersRequest) returns (ListOrdersResponse);
  rpc StreamOrderUpdates(StreamOrderUpdatesRequest) returns (stream OrderResponse);
}

message CreateOrderRequest {
  string user_id = 1;
  repeated OrderItem items = 2;
  string idempotency_key = 3;
}

message OrderItem {
  string product_id = 1;
  int32 quantity = 2;
}

message OrderResponse {
  string id = 1;
  string user_id = 2;
  string status = 3;
  repeated OrderItem items = 4;
  int64 total_cents = 5;
  string created_at = 6;
}

message ListOrdersRequest {
  int32 page_size = 1;
  string page_token = 2;
  string user_id = 3;
}

message ListOrdersResponse {
  repeated OrderResponse orders = 1;
  string next_page_token = 2;
}
```

### tRPC

End-to-end typesafe APIs for TypeScript full-stack applications. Eliminates the gap between frontend and backend types.

```typescript
// server/trpc.ts
import { initTRPC } from '@trpc/server';
import SuperJSON from 'superjson';

const t = initTRPC.create({
  transformer: SuperJSON,
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
  return next({ ctx: { ...ctx, user: ctx.user } });
});

// server/routers/order.ts
import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';

export const orderRouter = router({
  create: protectedProcedure
    .input(z.object({
      items: z.array(z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.order.create({
        data: {
          userId: ctx.user.id,
          items: { create: input.items },
        },
        include: { items: true },
      });
    }),

  list: protectedProcedure
    .input(z.object({ limit: z.number().default(20), cursor: z.string().nullish() }))
    .query(async ({ input, ctx }) => {
      const items = await ctx.prisma.order.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      });
      let nextCursor: string | undefined = undefined;
      if (items.length > input.limit) {
        const next = items.pop();
        nextCursor = next.id;
      }
      return { items, nextCursor };
    }),
});
```

---

## Database Expertise

### PostgreSQL

Production-grade relational database with advanced features for complex queries, data integrity, and scalability.

**Core Skills:**

- **Schema design** — Normalized schemas with proper foreign keys, constraints (`UNIQUE`, `CHECK`, `NOT NULL`), and indexes
- **Advanced queries** — Window functions (`ROW_NUMBER()`, `RANK()`, `LAG()`), CTEs, `LATERAL JOIN`, recursive queries
- **Indexing strategies** — B-tree (default), GIN (full-text, JSONB), GiST (geospatial), partial indexes, covering indexes (`INCLUDE`)
- **JSONB** — Semi-structured data with GIN indexes, JSON path queries, and generated columns
- **Full-text search** — `tsvector`/`tsquery`, text search configurations, ranking with `ts_rank()`
- **Transactions** — `SERIALIZABLE`, `REPEATABLE READ`, `READ COMMITTED` isolation levels; advisory locks
- **Partitioning** — Range, list, and hash partitioning for large tables (time-series, multi-tenant data)
- **Connection pooling** — PgBouncer for connection multiplexing in high-concurrency environments

```sql
-- Window function: running total per user
SELECT
  user_id,
  created_at,
  total_cents,
  SUM(total_cents) OVER (
    PARTITION BY user_id
    ORDER BY created_at
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS running_total
FROM orders
WHERE status = 'confirmed';

-- GIN index on JSONB for fast key-value queries
CREATE INDEX idx_users_metadata ON users USING GIN (metadata);

-- Partial index for active users only
CREATE INDEX idx_users_active_email ON users (email) WHERE status = 'active';

-- Full-text search with ranking
SELECT
  id,
  title,
  ts_rank(to_tsvector('english', body), query) AS rank
FROM articles,
     plainto_tsquery('english', 'database optimization') AS query
WHERE to_tsvector('english', body) @@ query
ORDER BY rank DESC
LIMIT 10;
```

### MongoDB

Document database for flexible schema, horizontal scaling, and geospatial queries.

**Core Skills:**

- **Document modeling** — Embedding vs referencing, schema patterns (subset, extended reference, bucket)
- **Aggregation pipeline** — `$match`, `$group`, `$lookup`, `$unwind`, `$facet`, `$merge`
- **Indexing** — Compound, text, geospatial (`2dsphere`), wildcard, TTL indexes
- **Transactions** — Multi-document ACID transactions with causal consistency
- **Change streams** — Real-time data change notifications for event-driven architectures
- **Sharding** — Hash-based and range-based sharding for horizontal scalability

```javascript
// Aggregation pipeline: order analytics
db.orders.aggregate([
  { $match: { createdAt: { $gte: ISODate("2025-01-01") } } },
  { $unwind: "$items" },
  { $group: {
    _id: "$items.productId",
    totalQuantity: { $sum: "$items.quantity" },
    totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
    orderCount: { $addToSet: "$orderId" },
  }},
  { $project: {
    _id: 0,
    productId: "$_id",
    totalQuantity: 1,
    totalRevenue: 1,
    uniqueOrders: { $size: "$orderCount" },
  }},
  { $sort: { totalRevenue: -1 } },
  { $limit: 10 },
]);
```

### Redis

In-memory data store for caching, pub/sub, rate limiting, and real-time features.

**Use Cases:**

- **Cache layer** — Cache-aside pattern with TTL, cache stampede prevention (mutex keys, probabilistic early expiration)
- **Rate limiting** — Sliding window counter with `INCR` + `EXPIRE` or `ZADD` + `ZREMRANGEBYSCORE`
- **Pub/Sub** — Real-time notifications, WebSocket message broadcasting
- **Session store** — Distributed session management for horizontally scaled web servers
- **Leaderboards** — Sorted sets (`ZADD`, `ZREVRANGE`, `ZRANK`) for ranking systems
- **Distributed locks** — `SET key value NX EX` for mutex patterns across service instances

```redis
# Sliding window rate limiting
MULTI
  ZREMRANGEBYSCORE rate:user:123 0 $(($(date +%s) - 60))
  ZADD rate:user:123 $(date +%s) $(date +%s%N)
  ZCARD rate:user:123
  EXPIRE rate:user:123 60
EXEC
```

### Prisma ORM

Type-safe database toolkit for Node.js and TypeScript with automatic migrations and query generation.

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Nested write with transaction
const order = await prisma.order.create({
  data: {
    userId: 'user-123',
    status: 'PENDING',
    items: {
      create: [
        { productId: 'prod-1', quantity: 2, priceCents: 2999 },
        { productId: 'prod-2', quantity: 1, priceCents: 4999 },
      ],
    },
    shipping: {
      create: { address: '123 Main St', city: 'Portland', state: 'OR', zip: '97201' },
    },
  },
  include: {
    items: true,
    shipping: true,
    user: { select: { email: true, name: true } },
  },
});

// Cursor-based pagination
const orders = await prisma.order.findMany({
  take: 20,
  skip: 1,
  cursor: { id: 'last-seen-id' },
  orderBy: { createdAt: 'desc' },
  where: { status: { in: ['PENDING', 'CONFIRMED'] } },
});
```

---

## Authentication & Authorization

### Authentication Patterns

**JWT (JSON Web Tokens):**

```typescript
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = '1h';

async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

function generateTokens(userId: string, role: string) {
  const payload = { sub: userId, role };
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET!, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

function verifyAccessToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { sub: string; role: string };
  } catch {
    return null;
  }
}
```

**OAuth 2.0 / OpenID Connect:**

- Authorization Code Flow with PKCE for SPAs and mobile apps
- Client Credentials Flow for service-to-service authentication
- Refresh token rotation with automatic revocation on reuse detection
- State parameter to prevent CSRF attacks
- Scope-based access control (`openid`, `profile`, `email`, custom scopes)

**Session-based authentication:**

- HTTP-only, Secure, SameSite=Strict cookies
- Server-side session storage (Redis or database)
- Session fixation prevention on login
- Concurrent session limits and device management

### Authorization Patterns

**RBAC (Role-Based Access Control):**

```typescript
type Role = 'admin' | 'moderator' | 'user';
type Permission = 'user:read' | 'user:write' | 'order:read' | 'order:write' | 'order:delete';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: ['user:read', 'user:write', 'order:read', 'order:write', 'order:delete'],
  moderator: ['user:read', 'order:read', 'order:write'],
  user: ['user:read', 'order:read', 'order:write'],
};

function hasPermission(userRole: Role, required: Permission): boolean {
  return ROLE_PERMISSIONS[userRole]?.includes(required) ?? false;
}
```

**ABAC (Attribute-Based Access Control):**

- Policies based on user attributes, resource attributes, and environment context
- CASL, OPA (Open Policy Agent), or Cedar for policy evaluation
- Example: "Users can only access resources in their organization during business hours"

**Multi-tenant isolation:**

- Row-level security (PostgreSQL RLS) for database-level tenant separation
- Middleware-based tenant resolution from subdomain, JWT claim, or header
- Schema-per-tenant for strict compliance requirements

---

## File Handling & Uploads

### Upload Strategies

**Direct multipart upload (small files, < 10MB):**

```typescript
import multer from 'multer';
import { v4 as uuid } from 'uuid';

const storage = multer.diskStorage({
  destination: '/tmp/uploads',
  filename: (req, file, cb) => cb(null, `${uuid()}-${file.originalname}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    cb(null, allowed.includes(file.mimetype));
  },
});

app.post('/api/uploads', upload.single('file'), async (req, res) => {
  const file = await fileService.save({
    key: req.file.filename,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    userId: req.user.id,
  });
  res.status(201).json(file);
});
```

**Presigned URL upload (large files, cloud storage):**

```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-formatter';

const s3 = new S3Client({ region: process.env.AWS_REGION });

app.post('/api/uploads/presign', async (req, res) => {
  const { fileName, mimeType, fileSize } = req.body;
  const key = `uploads/${req.user.id}/${uuid()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.UPLOAD_BUCKET,
    Key: key,
    ContentType: mimeType,
    ContentLength: fileSize,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
  res.json({ uploadUrl: url, key, downloadUrl: `https://cdn.example.com/${key}` });
});
```

### File Processing

- **Image processing** — `sharp` (Node.js), `Pillow` (Python) for resizing, format conversion, optimization
- **Chunked uploads** — Resume interrupted uploads with chunk tracking
- **Virus scanning** — ClamAV integration for user-uploaded files
- **CDN distribution** — CloudFront, Cloudflare, or Fastly for global file delivery
- **Lifecycle policies** — Automatic transition to cold storage and expiration for temporary files

---

## Backend Architecture Patterns

### Monolithic Architecture

Single deployable unit with modular internal structure. Best for small teams, early-stage products, and applications with bounded complexity.

**Structure:**
```
src/
├── controllers/     # HTTP request handlers
├── services/        # Business logic
├── repositories/    # Data access
├── models/          # Domain entities and DTOs
├── middleware/      # Cross-cutting concerns
├── config/          # Application configuration
├── utils/           # Shared utilities
└── index.ts         # Application entry point
```

### Microservices Architecture

Independently deployable services communicating over the network. Best for large organizations, independent team ownership, and systems requiring different scaling profiles.

**Communication patterns:**

- **Synchronous** — REST, gRPC, tRPC for request/response
- **Asynchronous** — Message queues (RabbitMQ, Kafka, SQS) for event-driven communication
- **Service mesh** — Istio, Linkerd for mTLS, traffic management, and observability
- **API Gateway** — Kong, AWS API Gateway, or custom gateway for routing, rate limiting, and authentication

### Event Sourcing

Persist state changes as a sequence of immutable events. Rebuild current state by replaying events from the event store.

```typescript
interface DomainEvent {
  aggregateId: string;
  type: string;
  version: number;
  timestamp: Date;
  payload: Record<string, unknown>;
}

class EventStore {
  async append(aggregateId: string, events: DomainEvent[], expectedVersion: number): Promise<void> {
    // Optimistic concurrency check
    const current = await this.getLastVersion(aggregateId);
    if (current !== expectedVersion) {
      throw new ConcurrencyError(`Expected version ${expectedVersion}, got ${current}`);
    }
    await this.db.transaction(events);
  }

  async getStream(aggregateId: string, fromVersion = 0): Promise<DomainEvent[]> {
    return this.db.query(
      "SELECT * FROM events WHERE aggregate_id = $1 AND version > $2 ORDER BY version",
      [aggregateId, fromVersion]
    );
  }
}
```

### CQRS (Command Query Responsibility Segregation)

Separate write model (commands) from read model (queries) for optimized performance and scalability.

- **Commands** — Mutate state, validated against business rules, produce domain events
- **Queries** — Read from denormalized read models optimized for specific UI/data needs
- **Read model updates** — Event handlers project events into read model tables
- **Eventual consistency** — Read models may lag behind write models; UI should handle stale data

### Saga Pattern

Distributed transaction pattern for microservices where a single business operation spans multiple services.

- **Choreography** — Services emit events and react to events from other services
- **Orchestration** — A central saga coordinator commands each service and triggers compensations on failure
- **Compensating transactions** — Reverse actions for each step (e.g., cancel order, refund payment, release inventory)

---

## Performance Optimization

### Database Performance

- **Query optimization** — `EXPLAIN ANALYZE` to identify slow queries, missing indexes, and sequential scans
- **Connection pooling** — PgBouncer, connection poolers for serverless environments (connection multiplexing)
- **Read replicas** — Route read queries to replicas; write queries to primary
- **Query result caching** — Cache expensive query results in Redis with appropriate TTLs
- **Batch operations** — Bulk inserts/updates instead of individual operations (`INSERT ... VALUES (...), (...), (...)`)
- **Materialized views** — Pre-computed aggregations for complex reporting queries

### Application Performance

- **Response caching** — HTTP cache headers (`Cache-Control`, `ETag`, `Vary`), CDN edge caching
- **Data serialization** — Efficient JSON serialization, Protobuf for internal service communication
- **Compression** — Gzip/Brotli compression for HTTP responses
- **Lazy loading** — Defer expensive computations until the result is actually needed
- **Pagination** — Always paginate large result sets; use cursor-based pagination for infinite scroll
- **Streaming** — Stream large responses instead of buffering in memory
- **Connection keep-alive** — Reuse HTTP connections for sequential requests

### Profiling & Monitoring

- **APM tools** — Datadog, New Relic, Sentry for distributed tracing and error tracking
- **Custom metrics** — Prometheus metrics (request count, latency histogram, error rate, active connections)
- **Logging** — Structured JSON logs with correlation IDs, log levels, and contextual metadata
- **Load testing** — k6, Artillery for identifying bottlenecks under realistic traffic patterns
- **Memory profiling** — Heap snapshots, allocation profiles for identifying memory leaks

---

## Security Best Practices

### Input Validation & Sanitization

- Validate ALL input at the API boundary using schema validation (Zod, Joi, Pydantic, class-validator)
- Sanitize output to prevent XSS — encode HTML entities, use Content Security Policy headers
- Parameterized queries to prevent SQL injection — never concatenate user input into SQL strings
- File upload validation — check MIME type, file size, extension, and scan for malware

### Authentication Security

- Password hashing with bcrypt, argon2, or scrypt — never store plain text or reversible encryption
- JWT secret rotation — support multiple signing keys for zero-downtime secret changes
- Rate limiting on authentication endpoints — prevent brute force and credential stuffing attacks
- Account lockout after N failed attempts — with exponential backoff and admin override capability

### Infrastructure Security

- **HTTPS everywhere** — TLS 1.2+ for all endpoints, HSTS headers, certificate pinning for mobile
- **CORS configuration** — Whitelist specific origins, never use `*` for credentials-enabled endpoints
- **Security headers** — `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`
- **Secrets management** — Environment variables, AWS Secrets Manager, HashiCorp Vault; never commit secrets
- **Dependency scanning** — `npm audit`, `pip-audit`, `cargo audit`, Dependabot for automated vulnerability detection
- **Least privilege** — Database users with minimal required permissions, service accounts with scoped access

### OWASP Top 10 Mitigations

1. **Broken Access Control** — Enforce authorization on every endpoint, test with automated policies
2. **Cryptographic Failures** — Use strong algorithms (AES-256, RSA-2048+, ECDSA), rotate keys
3. **Injection** — Parameterized queries, input validation, output encoding
4. **Insecure Design** — Threat modeling, abuse case analysis, security reviews in design phase
5. **Security Misconfiguration** — Hardened defaults, minimal feature surface, automated configuration audits
6. **Vulnerable Components** — Dependency pinning, regular updates, vulnerability scanning
7. **Authentication Failures** — MFA, rate limiting, breach detection, secure session management
8. **Data Integrity Failures** — Digital signatures, checksums, CI/CD pipeline integrity
9. **Logging & Monitoring Failures** — Detect and respond to suspicious activity within SLA
10. **SSRF** — Allowlist outbound destinations, disable unused URL schemes, network segmentation

---

## Testing Backend Applications

### Unit Testing

Test individual functions, classes, and modules in isolation with mocked dependencies.

```typescript
// Jest example
import { describe, it, expect, beforeEach } from '@jest/globals';
import { OrderService } from './order.service';
import { mockOrderRepository } from '../__mocks__/order.repository';

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(() => {
    service = new OrderService(mockOrderRepository);
  });

  it('should create an order with valid items', async () => {
    const input = {
      userId: 'user-123',
      items: [{ productId: 'prod-1', quantity: 2 }],
    };

    const order = await service.create(input);

    expect(order.status).toBe('PENDING');
    expect(order.items).toHaveLength(1);
    expect(mockOrderRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: input.userId })
    );
  });

  it('should throw if user has no items', async () => {
    await expect(
      service.create({ userId: 'user-123', items: [] })
    ).rejects.toThrow('Order must contain at least one item');
  });
});
```

### Integration Testing

Test the interaction between the application and real infrastructure (database, cache, external APIs with mocks).

```python
# pytest with FastAPI TestClient
import pytest
from httpx import AsyncClient
from app.main import app
from app.db import get_db

@pytest.fixture
async def test_db():
    # Create fresh test database
    await create_test_schema()
    yield
    await drop_test_schema()

@pytest.mark.asyncio
async def test_create_user(test_db):
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post("/api/users", json={
            "email": "test@example.com",
            "name": "Test User",
            "role": "user",
        })
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "test@example.com"
        assert "id" in data
```

### API Contract Testing

Validate that the API conforms to its specification (OpenAPI/Swagger) and that consumers receive the expected response shapes.

```typescript
// Pact consumer test
import { PactV3, MatchersV3 } from '@pact-foundation/pact';

const provider = new PactV3({
  consumer: 'WebApp',
  provider: 'OrderService',
});

provider
  .given('an order exists', { orderId: 'ord-123' })
  .uponReceiving('a request for an order')
  .withRequest({ method: 'GET', path: `/api/orders/ord-123` })
  .willRespondWith({
    status: 200,
    headers: { 'Content-Type': MatchersV3.contentTypeApplicationJson },
    body: {
      id: 'ord-123',
      status: MatchersV3.string('CONFIRMED'),
      total: MatchersV3.decimal(149.99),
    },
  })
  .executeTest(async (mockServer) => {
    const client = createOrderClient(mockServer.url);
    const order = await client.getOrder('ord-123');
    expect(order.status).toBe('CONFIRMED');
  });
```

### Load Testing

Simulate realistic traffic patterns to identify performance bottlenecks before production.

```javascript
// k6 load test
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 50 },    // Ramp up to 50 VUs
    { duration: '2m', target: 50 },     // Stay at 50 VUs
    { duration: '30s', target: 200 },   // Spike to 200 VUs
    { duration: '2m', target: 200 },    // Stay at 200 VUs
    { duration: '30s', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],   // 95% of requests must complete below 500ms
    errors: ['rate<0.05'],              // Error rate must be below 5%
  },
};

export default function () {
  const res = http.get(`${__ENV.BASE_URL}/api/orders`);
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  sleep(1);
}
```

### Testing Pyramid

1. **Unit tests (70%)** — Fast, isolated, test business logic and edge cases
2. **Integration tests (20%)** — Test database interactions, external API integrations, message queue consumers
3. **E2E / API tests (10%)** — Full request lifecycle from HTTP entry to database persistence and back

---

## Backend Architecture & Infrastructure

### Design Patterns

- **Domain-Driven Design (DDD)** — Bounded contexts, aggregate roots, value objects, domain events
- **Clean Architecture** — Dependency rule (inner layers know nothing about outer layers), use case interactor pattern
- **Hexagonal Architecture** — Ports and adapters, infrastructure plugged via interfaces
- **Factory pattern** — Object creation encapsulated for complex construction logic
- **Strategy pattern** — Interchangeable algorithms selected at runtime (payment providers, notification channels)
- **Observer pattern** — Event-driven notification between decoupled components

### Cloud-Native Patterns

- **Health checks** — `/health` (liveness) and `/ready` (readiness) for Kubernetes orchestration
- **Configuration management** — Environment variables, config maps, secrets stores; 12-factor app principles
- **Graceful degradation** — Circuit breakers, fallback responses, bulkheads for resilience
- **Horizontal scaling** — Stateless services behind load balancers, session externalization
- **Blue-green deployment** — Zero-downtime releases with instant rollback capability
- **Canary releases** — Gradual traffic shift with automated rollback on error rate increase

### Message Queues & Event Streaming

- **RabbitMQ** — Routing exchanges, dead letter queues, message persistence, consumer acknowledgments
- **Apache Kafka** — Partitioned logs, consumer groups, exactly-once semantics, schema registry
- **AWS SQS** — FIFO queues, visibility timeouts, dead-letter queues, long polling
- **Redis Streams** — Lightweight streaming with consumer groups, pending entry lists, claimable messages

### Serverless Backend

- **AWS Lambda** — Event-driven functions with API Gateway, DynamoDB, S3 triggers
- **Cloudflare Workers** — Edge computing with V8 isolates, KV storage, Durable Objects
- **Vercel/Netlify Functions** — Serverless functions deployed with frontend applications
- **Best practices** — Cold start mitigation, connection pooling alternatives, stateless design, ephemeral storage limits

---

## Capabilities Merged From

This consolidated skill merges the capabilities of 148 specialized backend skills including:

**Node.js:** nodejs-backend-patterns, nodejs-best-practices, javascript-mastery, javascript-pro, typescript-pro, typescript-expert, typescript-advanced-types, modern-javascript-patterns

**Python:** python-pro, python-patterns, python-fastapi-development, async-python-patterns, python-performance-optimization, python-packaging, django-pro, django-access-review, django-perf-review, python-development-python-scaffold

**API Development:** api-design-principles, api-patterns, api-endpoint-builder, api-documentation, api-documenter, api-security-best-practices, api-security-testing, api-testing-observability-api-mock, openapi-spec-generation, graphql, graphql-architect, native-data-fetching

**Databases:** postgres-best-practices, postgresql, postgresql-optimization, nosql-expert, prisma-expert, database, database-admin, database-architect, database-design, database-migration, database-optimizer, database-cloud-optimization-cost-optimize, sql-pro, sql-optimization-patterns, neon-postgres, using-neon, database-migrations-sql-migrations, database-migrations-migration-observability

**Architecture:** backend-architect, backend-dev-guidelines, microservices-patterns, domain-driven-design, ddd-strategic-design, ddd-context-mapping, ddd-tactical-patterns, cqrs-implementation, event-sourcing-architect, event-store-design, saga-orchestration, monorepo-architect, monorepo-management, projection-patterns, lightning-architecture-review, lightning-factory-explainer, lightning-channel-factories

**Frameworks & Runtimes:** nestjs-expert, hono, trpc-fullstack, grpc-golang, fastapi-pro, fastapi-router-py, fastapi-templates, cloudflare-workers-expert, dbos-typescript, dbos-python, dbos-golang, inngest, trigger-dev, temporal-python-pro, temporal-golang-pro, bullmq-specialist

**Languages:** golang-pro, go-concurrency-patterns, java-pro, ruby-pro, php-pro, laravel-expert, laravel-security-audit, rust-pro, rust-async-patterns, kotlin-coroutines-expert, c-pro, cpp-pro, csharp-pro, elixir-pro, haskell-pro, scala-pro, julia-pro

**Security:** auth-implementation-patterns, backend-security-coder, api-security-best-practices, api-security-testing, nextjs-supabase-auth

**Infrastructure:** file-uploads, payment-integration, stripe-integration, stripe-automation, paypal-integration, plaid-fintech, twilio-communications, shopify-apps, shopify-development, supabase-automation, algolia-search, hybrid-search-implementation

**Performance:** performance-engineer, performance-optimizer, performance-profiling, application-performance-performance-optimization, python-performance-optimization, web-performance-optimization

**Quality:** error-handling-patterns, framework-migration-code-migrate, framework-migration-deps-upgrade, framework-migration-legacy-modernize, legacy-modernizer

**Workflow & Operations:** backend-development-feature-development, backend-product-manager, full-stack-orchestration-full-stack-feature, data-engineering-data-driven-feature, data-engineering-data-pipeline, expo-api-routes, saas-multi-tenant, saas-mvp-launcher, revops

**Functional Programming (Backend):** fp-async, fp-backend, fp-data-transforms, fp-either-ref, fp-errors, fp-option-ref, fp-pipe-ref, fp-pragmatic, fp-react, fp-refactor, fp-taskeither-ref, fp-ts-errors, fp-ts-pragmatic, fp-ts-react, fp-types-ref

**Workspace & Tooling:** nx-workspace-patterns, turborepo-caching, moodle-external-api-development, wordpress, wordpress-plugin-development, wordpress-theme-development, wordpress-woocommerce-development, customer-support
