# JODDB System Track

A Django/DRF-based system for managing job orders, tasks, and quality control processes with analytics and metrics tracking.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- PostgreSQL/SQLite3
- Virtual Environment

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/Whatever42Amman/JODDB_system_track.git
cd JODDB_system_track
```

2. **Create and activate virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Setup database**
```bash
python manage.py migrate
```

5. **Create initial superuser**
```bash
python manage.py createsuperuser
```

6. **Load sample data (optional)**
```bash
python manage.py seed_users
```

7. **Run development server**
```bash
python manage.py runserver
```

## 🔑 Authentication

The system uses JWT authentication. To get started:

1. **Login to obtain tokens**
```http
POST /api/v1/auth/login/
{
    "username": "your_username",
    "password": "your_password"
}
```

2. **Use the access token in requests**
```http
GET /api/v1/dashboard/job-orders/
Authorization: Bearer your_access_token
```

3. **Refresh token when expired**
```http
POST /api/v1/auth/token/refresh/
{
    "refresh": "your_refresh_token"
}
```

## 📊 Dashboard Endpoints

### Job Order Dashboard
```http
GET /api/v1/dashboard/job-orders/
GET /api/v1/dashboard/job-orders/{id}/
```
- Access: Planning Engineer & Supervisor (full access), Technician & QI (filtered access)
- Returns: Job orders with progress, due dates, and rejection counts

### Technician Mobile View
```http
GET /api/v1/tasks/my/
```
- Access: Technician only
- Returns: Active tasks assigned to the authenticated technician

### Review Queue
```http
GET /api/v1/review-queue/
```
- Access: Quality Inspector & Supervisor
- Returns: Tasks pending review based on role

## 📈 Metrics & Analytics

### Technician Metrics
```http
GET /api/v1/metrics/technician/{id}/?date=YYYY-MM-DD
```
- Access: Planning Engineer & Supervisor
- Returns: Daily performance metrics (productivity, efficiency, utilization)

### Job Order Metrics
```http
GET /api/v1/metrics/job-order/{id}/
```
- Access: Planning Engineer & Supervisor
- Returns: Progress stats and active alerts

## 🧪 Testing

### Run All Tests
```bash
python manage.py test
```

### Run Specific Test Categories
```bash
python manage.py test core.tests.test_metrics
python manage.py test core.tests.test_dashboard
```

### Check Code Coverage
```bash
coverage run --source='.' manage.py test
coverage report
```

## 🔄 Development Workflow

1. **Update Dependencies**
```bash
pip freeze > requirements.txt
```

2. **Make Migrations**
```bash
python manage.py makemigrations
python manage.py migrate
```

3. **Check API Documentation**
- Visit `/admin/` for Django Admin interface
- Use browser's dev tools to inspect API responses
- Check status codes and response formats

## 🔒 Role-Based Access

The system supports five roles:
- Planning Engineer (`planning`)
- Supervisor (`supervisor`)
- Quality Inspector (`quality`)
- Technician (`technician`)
- System Admin (`admin`)

Each role has specific permissions and access patterns. Test endpoints with different user roles to ensure proper access control.

## 🐛 Troubleshooting

1. **Database Issues**
```bash
python manage.py flush  # Clear all data
python manage.py migrate --run-syncdb  # Sync DB structure
```

2. **Permission Issues**
- Check user role in Django Admin
- Verify token expiration
- Review request headers

3. **Performance Issues**
- Check query optimization in Django Debug Toolbar
- Review database indexes
- Monitor API response times

## 📱 Frontend Integration

When integrating with frontend:

1. **CORS Settings**
- Check `settings.py` for CORS configuration
- Add frontend domain to `CORS_ALLOWED_ORIGINS`

2. **API Response Format**
- All endpoints return consistent JSON structures
- Check response schemas in serializers
- Handle pagination where applicable

3. **Error Handling**
- 400: Bad Request (invalid input)
- 401: Unauthorized (invalid/missing token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Server Error

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request

## 📝 License

This project is proprietary and confidential.

## 📮 Support

For technical support or questions, contact the development team.

## 🏗 Project Architecture & Features

### 1. Core System Components 🏢

#### Authentication & Authorization 🔐

##### JWT Authentication System
- **Token Management**
  - Access Token: 15-minute lifetime for active operations
  - Refresh Token: 7-day lifetime for maintaining sessions
  - Blacklist support for logout/security
  - Automatic token refresh mechanism
  
- **Security Features**
  - Password hashing using Argon2
  - Rate limiting for login attempts
  - Token rotation on security events
  - IP-based security checks

##### Role-Based Access Control (RBAC)
- **User Roles & Capabilities**
  1. Planning Engineer (`planning`)
     - Create and manage job orders
     - Access all analytics
     - Manage user accounts
     - View system-wide reports
  
  2. Supervisor (`supervisor`)
     - Final review authority
     - Access to performance metrics
     - Team management capabilities
     - Alert management
  
  3. Quality Inspector (`quality`)
     - Inspection queue management
     - Quality metrics recording
     - Rejection handling
     - Documentation access
  
  4. Technician (`technician`)
     - Task management
     - Time tracking
     - Report submission
     - Personal metrics view
  
  5. System Admin (`admin`)
     - Full system access
     - Configuration management
     - System maintenance
     - Backup/restore capabilities
- **JWT-based Authentication**
  - Access & Refresh token system
  - Token expiration handling
  - Secure password storage
- **Role-Based Access Control (RBAC)**
  - 5 distinct roles with different permissions
  - Custom permission classes per view
  - Role validation middleware

#### Job Order Management System 📋

##### Job Order Creation & Lifecycle
- **Order Creation Process**
  - Unique order code generation (format: JO-YYYY-XXXX)
  - Multi-device support (up to 1000 per order)
  - Automated task generation
  - Smart due date validation
  - Priority level assignment

- **Bulk Operations**
  - Mass device registration
  - Batch task assignment
  - Group status updates
  - Bulk completion processing
  
- **Documentation & Tracking**
  - Full audit trail
  - Change history logging
  - Document attachment support
  - Comment threading

##### Device Management
- **Device Registration**
  - Unique serial number validation
  - QR code generation
  - Manufacturer details tracking
  - Warranty information
  
- **Status Lifecycle**
  1. Pending ⏳
     - Initial registration
     - Pre-assignment phase
  2. In Progress 🔄
     - Active work phase
     - Time tracking active
  3. Quality Check 🔍
     - Inspection phase
     - Documentation review
  4. Completed ✅
     - Final approval
     - History archived
  5. Rejected ❌
     - Issue documentation
     - Rework routing

- **Relationship Management**
  - Device-Task mappings
  - Component tracking
  - Dependency management
  - Resource allocation

#### Task Workflow Engine ⚙️

##### Task Lifecycle Management
- **Creation & Assignment**
  - Automatic task generation
  - Skill-based routing
  - Priority calculation
  - Resource availability check
  
- **Status Transitions**
  1. Available 📋
     - Visible in task pool
     - Ready for assignment
  2. In Progress 🔄
     - Active work tracking
     - Real-time updates
  3. Done ✅
     - Completion marking
     - Time calculation
  4. QA Pending 🔍
     - Review queue
     - Documentation check
  5. Rejected ⚠️
     - Issue tracking
     - Rework routing
  6. Completed 🏆
     - Final approval
     - Metrics calculation

##### Time Management System
- **Standard Time Framework**
  - Base time calculation
  - Complexity factors
  - Tool requirements
  - Skill level adjustments
  
- **Actual Time Tracking**
  - Start/stop precision
  - Break time handling
  - Interruption logging
  - Multi-task support
  
- **Efficiency Metrics**
  - Real-time calculation
  - Historical trending
  - Performance benchmarking
  - Optimization suggestions
  
- **Automation Features**
  - Auto-pause detection
  - Overtime alerts
  - Efficiency warnings
  - Break reminders

### 2. Quality Control System 🎯

#### Inspection Process Management

##### Quality Inspector Review System
- **Task Verification Process**
  1. Initial Check
     - Visual inspection
     - Documentation review
     - Standard compliance
     - Tool calibration check
  
  2. Performance Validation
     - Time efficiency review
     - Quality metrics check
     - Standard adherence
     - Process compliance
  
  3. Documentation Review
     - Report completeness
     - Photo documentation
     - Measurement records
     - Tool usage logs

- **Rejection Management**
  1. Issue Classification
     - Quality defects
     - Time overruns
     - Process violations
     - Documentation gaps
  
  2. Feedback System
     - Detailed comments
     - Photo attachments
     - Improvement suggestions
     - Training recommendations
  
  3. Resolution Tracking
     - Issue logging
     - Resolution planning
     - Follow-up scheduling
     - Prevention measures

##### Supervisor Review Framework
- **Approval Workflow**
  1. Initial Assessment
     - QI report review
     - Metrics validation
     - Process compliance
     - Resource utilization
  
  2. Quality Standards
     - ISO compliance
     - Industry standards
     - Internal policies
     - Safety regulations
  
  3. Performance Review
     - Efficiency metrics
     - Quality scores
     - Time management
     - Resource utilization

- **Decision Management**
  1. Approval Process
     - Standard completion
     - Documentation verification
     - Metric validation
     - Final signoff
  
  2. Rejection Handling
     - Issue documentation
     - Rework planning
     - Resource allocation
     - Timeline adjustment
  
  3. Improvement Tracking
     - Pattern identification
     - Training needs
     - Process updates
     - Standard revisions

#### Performance Analytics Engine 📊

##### Technician Performance Metrics
- **Productivity Metrics**
  1. Daily Calculations
     - Tasks completed
     - Time efficiency
     - Quality score
     - Standard compliance
  
  2. Trend Analysis
     - Weekly patterns
     - Monthly averages
     - YoY comparison
     - Skill progression
  
  3. Efficiency Indicators
     - Time utilization
     - Quality ratio
     - Resource usage
     - Cost efficiency

- **Time Utilization Analytics**
  1. Work Time Analysis
     - Active work time
     - Setup time
     - Break patterns
     - Overtime tracking
  
  2. Efficiency Ratios
     - Standard vs. Actual
     - Setup efficiency
     - Process adherence
     - Tool utilization
  
  3. Performance Optimization
     - Peak performance times
     - Fatigue indicators
     - Training needs
     - Process bottlenecks

##### Job Order Analytics
- **Progress Tracking**
  1. Completion Metrics
     - Task completion rate
     - Time to completion
     - Quality pass rate
     - Resource utilization
  
  2. Quality Indicators
     - First-time pass rate
     - Rejection analysis
     - Rework patterns
     - Quality trends
  
  3. Timeline Management
     - Due date tracking
     - Delay analysis
     - Critical path monitoring
     - Resource allocation

- **Performance Reports**
  1. Daily Summaries
     - Completion status
     - Quality metrics
     - Time efficiency
     - Resource usage
  
  2. Trend Analysis
     - Weekly patterns
     - Monthly performance
     - Quality trends
     - Efficiency evolution
  
  3. Predictive Analytics
     - Completion forecasts
     - Risk assessment
     - Resource planning
     - Quality predictions

### 3. Analytics & Reporting System 📈

#### Advanced Dashboard Framework

##### Role-Specific Dashboards
1. **Planning Engineer Portal**
   - **Overview Metrics**
     - Total active orders
     - Resource utilization
     - Quality statistics
     - Timeline compliance
   
   - **Management Tools**
     - Order creation
     - Resource allocation
     - Timeline adjustment
     - Priority management
   
   - **Analytics Views**
     - Performance trends
     - Resource optimization
     - Quality analysis
     - Cost tracking

2. **Supervisor Dashboard**
   - **Team Overview**
     - Active technicians
     - Task distribution
     - Quality metrics
     - Efficiency scores
   
   - **Quality Management**
     - Review queue
     - Issue tracking
     - Resolution status
     - Training needs
   
   - **Performance Monitoring**
     - Real-time tracking
     - Alert management
     - Resource balancing
     - Timeline monitoring

3. **Technician Interface**
   - **Task Management**
     - Active tasks
     - Queue preview
     - Time tracking
     - Quality requirements
   
   - **Performance Metrics**
     - Personal efficiency
     - Quality score
     - Time utilization
     - Skill progression
   
   - **Documentation Tools**
     - Work logging
     - Issue reporting
     - Quality checks
     - Time recording

4. **QI Review Station**
   - **Inspection Queue**
     - Pending reviews
     - Priority sorting
     - History tracking
     - Standard references
   
   - **Quality Tools**
     - Checklist management
     - Issue documentation
     - Photo attachments
     - Measurement logging
   
   - **Performance Tracking**
     - Review efficiency
     - Issue patterns
     - Resolution rates
     - Quality trends

##### Real-Time Analytics Engine
- **Progress Monitoring**
  1. Live Tracking
     - Task status
     - Time usage
     - Quality metrics
     - Resource state
  
  2. Performance Calculation
     - Efficiency ratios
     - Quality scores
     - Time analysis
     - Cost metrics
  
  3. Predictive Analysis
     - Completion forecasts
     - Risk assessment
     - Resource needs
     - Quality predictions

- **Alert System Integration**
  1. Threshold Monitoring
     - Performance drops
     - Quality issues
     - Timeline risks
     - Resource constraints
  
  2. Notification Engine
     - Priority routing
     - Role-based delivery
     - Escalation rules
     - Action tracking
  
  3. Response Management
     - Issue logging
     - Action planning
     - Resolution tracking
     - Prevention measures

#### Intelligent Alert System 🚨

##### Automated Alert Engine
1. **Performance Alerts**
   - **Efficiency Monitoring**
     - Low efficiency detection
     - Time overrun warnings
     - Resource utilization alerts
     - Quality threshold alerts
   
   - **Timeline Tracking**
     - Due date proximity
     - Critical path delays
     - Resource bottlenecks
     - Schedule conflicts
   
   - **Quality Triggers**
     - Rejection patterns
     - Error rate spikes
     - Standard violations
     - Tool calibration needs

2. **Smart Notification System**
   - **Priority Management**
     - Critical alerts
     - Warning levels
     - Information notices
     - System updates
   
   - **Delivery Rules**
     - Role-based routing
     - Escalation paths
     - Backup notifications
     - Acknowledgment tracking
   
   - **Channel Integration**
     - In-app notifications
     - Email alerts
     - SMS (critical)
     - Dashboard updates

##### Alert Management Framework
1. **Configuration System**
   - **Threshold Settings**
     - Performance limits
     - Time thresholds
     - Quality standards
     - Resource bounds
   
   - **Routing Rules**
     - User preferences
     - Role requirements
     - Priority levels
     - Escalation chains
   
   - **Response Templates**
     - Standard actions
     - Resolution paths
     - Documentation requirements
     - Follow-up procedures

2. **Historical Tracking**
   - **Alert Analytics**
     - Frequency analysis
     - Pattern detection
     - Response times
     - Resolution rates
   
   - **Performance Impact**
     - Productivity effects
     - Quality correlation
     - Resource implications
     - Cost analysis
   
   - **Improvement Tracking**
     - Prevention measures
     - System updates
     - Training needs
     - Process modifications

### 4. Advanced API Architecture 🔌

#### High-Performance API Framework

##### Optimized Endpoint System
1. **Read-Only Operations**
   - **Cache Management**
     - Redis integration
     - Cache invalidation
     - Partial updates
     - Version control
   
   - **Query Optimization**
     - Eager loading
     - Selective fields
     - Indexed searches
     - Batch processing
   
   - **Performance Features**
     - Response compression
     - ETags support
     - Conditional requests
     - Rate limiting

2. **Mobile-First Design**
   - **Response Optimization**
     - Payload minimization
     - Field selection
     - Nested limitation
     - Compression
   
   - **Bandwidth Management**
     - Chunked responses
     - Partial content
     - Resource prioritization
     - Cache directives
   
   - **Mobile Features**
     - Offline support
     - Sync management
     - Battery optimization
     - Network adaptation

##### API Performance Features
1. **Query Management**
   - **Optimization Layer**
     - Query planning
     - Index utilization
     - Join optimization
     - Result caching
   
   - **Load Balancing**
     - Request distribution
     - Server health
     - Traffic management
     - Failover support
   
   - **Resource Control**
     - Connection pooling
     - Thread management
     - Memory optimization
     - CPU allocation

2. **Response Handling**
   - **Format Optimization**
     - JSON compression
     - Field filtering
     - Nested limitation
     - Metadata reduction
   
   - **Transfer Efficiency**
     - Chunked encoding
     - Stream processing
     - Async operations
     - Background tasks
   
   - **Error Management**
     - Graceful degradation
     - Retry logic
     - Circuit breakers
     - Fallback options

#### Data Security
- **Access Control**
  - Role-based visibility
  - Data isolation
  - Secure transmission
- **Validation**
  - Input sanitization
  - Business rule enforcement
  - Error handling

### 5. Current Limitations & Future Improvements

#### Known Limitations
- Limited batch processing capabilities
- No real-time notifications (webhook/socket)
- Basic search functionality
- Limited reporting features

#### Planned Improvements
- **Real-time Updates**
  - WebSocket integration for live updates
  - Push notifications support
- **Advanced Analytics**
  - Custom report generation
  - Advanced metric calculations
  - Historical data analysis
- **UI/UX Enhancements**
  - Mobile app development
  - Dashboard customization
  - Interactive charts and graphs

#### Performance Optimization
- Implementation of caching
- Query optimization
- Background task processing

### 6. Integration Points

#### Frontend Integration
- **REST API Endpoints**
  - Consistent JSON responses
  - Clear error handling
  - Documented schemas
- **Authentication Flow**
  - Token management
  - Session handling
  - Role-based routing

#### External Systems
- **Export Capabilities**
  - Data export formats
  - API integration points
  - Webhook support (planned)

### 7. Development & Deployment

#### Development Environment
- Django 4.2+
- Python 3.8+
- PostgreSQL/SQLite3
- JWT Authentication

#### Deployment Requirements
- WSGI/ASGI server
- Database server
- Static file hosting
- SSL certificate
