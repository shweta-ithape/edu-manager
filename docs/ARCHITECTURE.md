# System Architecture

## Architecture Style

The application follows a MERN full-stack architecture.

``` text
┌─────────────────────────────┐
│        React Frontend       │
│ React Router / Tailwind     │
│ Axios / Recharts            │
└──────────────┬──────────────┘
               │ HTTP/JSON
               ↓
┌─────────────────────────────┐
│       Express REST API      │
│ Routes → Middleware         │
│ → Controllers → Validation  │
└──────────────┬──────────────┘
               │ Mongoose
               ↓
┌─────────────────────────────┐
│          MongoDB            │
│ Users / Students / Trainers │
│ Courses / Batches / etc.    │
└─────────────────────────────┘
```

## Frontend

The React application is responsible for:

-   Authentication UI
-   Role-based navigation
-   Forms and validation
-   Dashboard views
-   Tables/search/filter/pagination
-   API communication through Axios
-   Charts through Recharts
-   User feedback/loading/error states

Important areas include:

``` text
client/src/
├── components/
├── context/
├── pages/
├── services/
├── utils/
├── App.jsx
└── main.jsx
```

## Backend

The Express backend is responsible for:

-   REST API routing
-   Authentication
-   Authorization
-   Business rules
-   Data validation
-   CRUD operations
-   Aggregations/dashboard data
-   Error handling

Typical structure:

``` text
server/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── utils/
├── seed.js
└── server.js
```

## Authentication Flow

``` text
Login form
   ↓
POST /api/auth/login
   ↓
Verify email/password
   ↓
bcrypt password comparison
   ↓
Generate JWT
   ↓
Frontend stores token
   ↓
Axios attaches Bearer token
   ↓
protect middleware verifies JWT
   ↓
role middleware checks permissions
   ↓
Controller executes operation
```

## Authorization

Roles:

``` text
ADMIN
TRAINER
STUDENT
```

The backend is the final authority for access control. Frontend route
restrictions improve usability but must not replace server-side
authorization.

## Error Handling

The application returns structured error responses containing a success
indicator and message where implemented.

Examples:

``` json
{
  "success": false,
  "message": "Invalid credentials"
}
```

HTTP status codes communicate the category of failure.

## Business Validation

Business validation is implemented in controllers/models where required.
Examples include:

-   Duplicate resources
-   Required fields
-   Date validation
-   Capacity validation
-   Duplicate enrollment
-   Duplicate attendance
-   Fee constraints
-   Result constraints
-   Course deletion dependency

## Data Flow Example: Enrollment

``` text
Admin UI
   ↓
POST /api/enrollments
   ↓
JWT protect middleware
   ↓
Role authorization
   ↓
Validate student
   ↓
Validate batch
   ↓
Check duplicate enrollment
   ↓
Check capacity
   ↓
Create Enrollment document
   ↓
Return JSON response
   ↓
React refreshes UI
```
