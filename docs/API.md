# API Documentation

Base URL during local development:

``` text
http://localhost:5000/api
```

Protected endpoints require:

``` text
Authorization: Bearer <JWT_TOKEN>
```

## Authentication

### POST /auth/login

Login with email and password.

``` json
{
  "email": "student1@institute.com",
  "password": "password123"
}
```

Returns a JWT and authenticated user information.

### POST /auth/register

Creates a user account using the registration workflow implemented by
the project.

### GET /auth/me

Protected. Returns the currently authenticated user and linked profile
information.

### POST /auth/change-password

Protected.

``` json
{
  "currentPassword": "oldPassword",
  "newPassword": "newPassword"
}
```

## Students

### POST /students

Admin only. Creates a student and linked user account.

### GET /students

Admin/Trainer. Supports implemented query parameters such as:

``` text
?page=1&limit=10
?search=shweta
?status=ACTIVE
```

### GET /students/:id

Returns one student. Students are restricted to their own profile
according to the authorization logic.

### PUT /students/:id

Admin only. Updates student details.

### DELETE /students/:id

Admin only. Deletes the student and linked user according to the
implemented controller logic.

## Trainers

Typical resources:

``` text
POST   /trainers
GET    /trainers
GET    /trainers/:id
PUT    /trainers/:id
DELETE /trainers/:id
```

Authorization depends on the implemented trainer routes/controller.

## Courses

### POST /courses

Admin only.

Example:

``` json
{
  "courseName": "MERN Stack Development",
  "description": "Full stack web development",
  "duration": "6 Months",
  "totalFees": 30000,
  "status": "ACTIVE"
}
```

### GET /courses

Authenticated users. Supports implemented `search` and `status` filters.

### GET /courses/:id

Authenticated users.

### PUT /courses/:id

Admin only.

### DELETE /courses/:id

Admin only. A course linked to one or more batches cannot be deleted.

## Batches

Typical resources:

``` text
POST   /batches
GET    /batches
GET    /batches/:id
PUT    /batches/:id
DELETE /batches/:id
```

The batch controller validates course/trainer references, dates,
capacity, and status according to the implemented business rules.

## Enrollments

Typical resources:

``` text
POST   /enrollments
GET    /enrollments
GET    /enrollments/:id
PUT    /enrollments/:id
DELETE /enrollments/:id
```

Business validation includes duplicate enrollment, active student/batch
requirements, and batch capacity.

## Attendance

Typical resources:

``` text
POST   /attendance
GET    /attendance
GET    /attendance/:id
PUT    /attendance/:id
DELETE /attendance/:id
```

Attendance prevents duplicate records for the same student, batch, and
date according to the implemented controller.

## Fees

Typical resources:

``` text
POST   /fees
GET    /fees
GET    /fees/:id
PUT    /fees/:id
DELETE /fees/:id
```

Fee logic validates payment amounts and calculates pending
amount/payment status.

## Results

Typical resources:

``` text
POST   /results
GET    /results
GET    /results/:id
PUT    /results/:id
DELETE /results/:id
```

Result logic validates marks and calculates total/percentage/pass-fail
status according to the implementation.

## Dashboard

``` text
GET /dashboard
```

Returns role-specific dashboard information and metrics according to the
authenticated user's role.

## Reports

``` text
GET /reports/...
```

Report routes provide the implemented student, attendance, fee, result,
and batch reporting data.

## Common HTTP Status Codes

  Status   Meaning
  -------- ----------------------------------
  200      Successful request
  201      Resource created
  400      Validation/business-rule error
  401      Missing/invalid authentication
  403      Authenticated but not authorized
  404      Resource not found
  409      Duplicate/conflicting resource
  500      Server error

> Note: Before submission, compare this document with the final route
> files and update any endpoint path that differs from the project's
> actual implementation.
