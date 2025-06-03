# Order Management Service

A scalable microservice built with NestJS and TypeScript for managing orders across multiple storefronts globally.

## Features

- Create orders with products and quantities
- Update order status (processing, canceled, delivered, etc.)
- Update shipping information (tracking company, tracking number)
- Delete orders
- Integration with external services (Customer Service, Inventory Service)

## Technical Stack

- **Language**: TypeScript
- **Framework**: NestJS
- **Validation**: class-validator
- **UUID Generation**: uuid

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/order-management-service.git
   cd order-management-service
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the service:
   ```bash
   npm run start:dev
   ```

The service will be available at `http://localhost:3000`.

## API Endpoints

### Create Order
```http
POST /orders
Content-Type: application/json

{
  "customerId": "string",
  "items": [
    {
      "productId": "string",
      "variantId": "string",
      "quantity": number
    }
  ],
  "shippingAddress": {
    "street": "string",
    "city": "string",
    "state": "string",
    "country": "string",
    "postalCode": "string"
  }
}
```

### Get Order
```http
GET /orders/:id
```

### Update Order Status
```http
PUT /orders/:id/status
Content-Type: application/json

{
  "status": "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELED"
}
```

### Update Shipping Information
```http
PUT /orders/:id/shipping
Content-Type: application/json

{
  "trackingCompany": "string",
  "trackingNumber": "string",
  "estimatedDeliveryDate": "2024-03-21T00:00:00Z"
}
```

### Delete Order
```http
DELETE /orders/:id
```

## Testing

Run tests:
   ```bash
   npm run test
   ```

## Architecture & Design Decisions

### Service Communication
The service communicates with external services (Customer Service and Inventory Service) through HTTP APIs. In a production environment, this would be implemented using:
- Service discovery (e.g., AWS Service Discovery)
- Circuit breakers for resilience (e.g., using libraries like `@nestjs/circuit-breaker`)
- Message queues for asynchronous operations (e.g., AWS SQS)

### Data Storage
Currently using in-memory storage for demonstration. In production, this would be replaced with:
- Primary database: Amazon RDS (PostgreSQL) for order data
- Cache layer: Amazon ElastiCache (Redis) for frequently accessed data
- Event store: Amazon DynamoDB for event sourcing

### Scalability Considerations
- Horizontal scaling using AWS ECS with Auto Scaling
- Load balancing using AWS Application Load Balancer
- Database read replicas for read-heavy operations
- Caching layer for frequently accessed data
- Event-driven architecture for asynchronous operations

### Security
- API Gateway for rate limiting and API key management
- AWS WAF for web application firewall protection
- VPC configuration for network isolation
- AWS Secrets Manager for sensitive configuration
- IAM roles and policies for service-to-service communication

## Known Limitations

1. In-memory storage (not persistent)
2. No authentication/authorization
3. Limited error handling
4. No rate limiting
5. No metrics or monitoring
6. Mock external services

## Future Improvements

1. Implement persistent storage with PostgreSQL
2. Add authentication using JWT
3. Implement comprehensive error handling
4. Add request validation middleware
5. Implement rate limiting
6. Add metrics and monitoring (e.g., Prometheus + Grafana)
7. Implement real external service integrations
8. Add comprehensive test coverage
9. Implement event sourcing for order history
10. Add distributed tracing

## Production Deployment

For production deployment on AWS:

1. **Infrastructure**:
   - ECS Fargate for container orchestration
   - Application Load Balancer for load balancing
   - RDS for database
   - ElastiCache for caching
   - CloudWatch for logging and monitoring

2. **CI/CD**:
   - GitHub Actions for CI/CD pipeline
   - AWS CodeDeploy for blue-green deployments
   - AWS ECR for container registry

3. **Monitoring**:
   - CloudWatch for logs and metrics
   - X-Ray for distributed tracing
   - CloudWatch Alarms for alerting

4. **Security**:
   - AWS WAF for web application firewall
   - AWS Secrets Manager for secrets
   - IAM roles for service permissions
   - VPC for network isolation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
