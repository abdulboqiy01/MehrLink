# MehrLink API Contract

This document defines the RESTful API contract for the MehrLink platform. The backend provides a series of endpoints for managing users, donations, assistance requests, tasks, and notifications.

## Base URL
`/api/v1`

## Common Response Structures

**Success (2xx):**
```json
{
  "success": true,
  "data": { ... } // Response payload
}
```

**Error (4xx, 5xx):**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error description.",
    "details": [] // Optional validation errors or context
  }
}
```

## Authentication & Authorization
- **Authentication Requirement:** Unless specified as "Public", all endpoints require a Bearer token in the `Authorization` header (`Authorization: Bearer <token>`).
- **Authorization Rule:** Verified by the user's role (`USER`, `VOLUNTEER`, `ADMIN`). Certain endpoints restrict access based on resource ownership (e.g., you can only edit your own requests).

---

## 1. Authentication Endpoints

### 1.1 Register
- **Method:** `POST /auth/register`
- **Auth:** Public
- **Request Body:**
  ```json
  {
    "firstName": "Ali",
    "lastName": "Valiyev",
    "phone": "+998901234567",
    "password": "SecurePassword123!",
    "role": "USER" // Optional: defaults to USER
  }
  ```
- **Response (201):** User profile and JWT token.

### 1.2 Login
- **Method:** `POST /auth/login`
- **Auth:** Public
- **Request Body:**
  ```json
  {
    "phone": "+998901234567",
    "password": "SecurePassword123!"
  }
  ```
- **Response (200):** User profile and JWT token.

### 1.3 Get Current User
- **Method:** `GET /auth/me`
- **Auth:** Required (Any Role)
- **Response (200):** Logged-in user's profile data.

---

## 2. Donations

### 2.1 Create Donation
- **Method:** `POST /donations`
- **Auth:** Required (Any Role)
- **Request Body:**
  ```json
  {
    "title": "Winter Clothes",
    "description": "Two boxes of winter jackets.",
    "category": "CLOTHING",
    "quantity": 2, // integer
    "monetaryValue": null // decimal (optional)
  }
  ```
- **Response (201):** Created donation record.

### 2.2 List Donations
- **Method:** `GET /donations`
- **Auth:** Required (Any Role)
- **Query Params:** `status`, `category`, `page`, `limit`
- **Response (200):** Paginated array of donations.

### 2.3 Update Donation Status
- **Method:** `PATCH /donations/:id/status`
- **Auth:** Required (Admin or Assigned Volunteer/Owner)
- **Request Body:**
  ```json
  {
    "status": "ACCEPTED" // PENDING, ACCEPTED, ASSIGNED_TO_VOLUNTEER, DELIVERED, COMPLETED, CANCELLED
  }
  ```
- **Response (200):** Updated donation record.

---

## 3. Assistance Requests

### 3.1 Create Assistance Request
- **Method:** `POST /assistance-requests`
- **Auth:** Required (USER)
- **Request Body:**
  ```json
  {
    "title": "Need Medical Supplies",
    "description": "Wheelchair needed for elderly.",
    "urgency": "HIGH", // LOW, MEDIUM, HIGH, CRITICAL
    "location": "Tashkent, Yunusabad"
  }
  ```
- **Response (201):** Created request record.

### 3.2 List Assistance Requests
- **Method:** `GET /assistance-requests`
- **Auth:** Required (Any Role)
- **Query Params:** `status`, `urgency`, `page`, `limit`
- **Response (200):** Paginated array of assistance requests.

### 3.3 Update Request Status
- **Method:** `PATCH /assistance-requests/:id/status`
- **Auth:** Required (Admin or Assigned Volunteer)
- **Request Body:**
  ```json
  {
    "status": "APPROVED" // PENDING, REVIEWING, APPROVED, IN_PROGRESS, RESOLVED, REJECTED
  }
  ```
- **Response (200):** Updated request record.

---

## 4. Volunteer Tasks

### 4.1 Assign Task
- **Method:** `POST /tasks`
- **Auth:** Required (Admin)
- **Request Body:**
  ```json
  {
    "volunteerId": "uuid-here",
    "assistanceRequestId": "uuid-here",
    "description": "Deliver wheelchair to address."
  }
  ```
- **Response (201):** Created volunteer task.

### 4.2 Update Task Status
- **Method:** `PATCH /tasks/:id/status`
- **Auth:** Required (Assigned Volunteer or Admin)
- **Request Body:**
  ```json
  {
    "status": "IN_PROGRESS" // PENDING, ACCEPTED, IN_PROGRESS, COMPLETED, VERIFIED, CANCELLED
  }
  ```
- **Response (200):** Updated task.

---

## 5. Notifications

### 5.1 Get My Notifications
- **Method:** `GET /notifications`
- **Auth:** Required (Any Role)
- **Response (200):** Array of user's notifications.

### 5.2 Mark Notification as Read
- **Method:** `PATCH /notifications/:id/read`
- **Auth:** Required (Owner)
- **Response (200):** Updated notification status.
