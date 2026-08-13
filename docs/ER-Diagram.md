# Database ER Diagram

The platform uses MongoDB collections represented by Mongoose models.

## Main Entities

-   User
-   Student
-   Trainer
-   Course
-   Batch
-   Enrollment
-   Attendance
-   Fee
-   Result

## Relationship Diagram

``` mermaid
erDiagram
    USER ||--o| STUDENT : "has profile"
    USER ||--o| TRAINER : "has profile"

    COURSE ||--o{ BATCH : "contains"
    TRAINER ||--o{ BATCH : "teaches"

    STUDENT ||--o{ ENROLLMENT : "has"
    BATCH ||--o{ ENROLLMENT : "contains"

    STUDENT ||--o{ ATTENDANCE : "has"
    BATCH ||--o{ ATTENDANCE : "records"

    STUDENT ||--o{ FEE : "has"
    BATCH ||--o{ FEE : "belongs to"

    STUDENT ||--o{ RESULT : "has"
    BATCH ||--o{ RESULT : "belongs to"

    USER {
        ObjectId _id PK
        string name
        string email
        string password
        string role
        string status
    }

    STUDENT {
        ObjectId _id PK
        string studentId UK
        string name
        string email UK
        string phone
        string address
        date joiningDate
        string status
        ObjectId user FK
    }

    TRAINER {
        ObjectId _id PK
        string trainerId
        string name
        string email
        string phone
        string specialization
        date joiningDate
        string status
        ObjectId user FK
    }

    COURSE {
        ObjectId _id PK
        string courseName
        string description
        string duration
        number totalFees
        string status
    }

    BATCH {
        ObjectId _id PK
        string batchName
        ObjectId course FK
        ObjectId trainer FK
        date startDate
        date endDate
        string timing
        number capacity
        string status
    }

    ENROLLMENT {
        ObjectId _id PK
        ObjectId student FK
        ObjectId batch FK
        date enrollmentDate
        string status
    }

    ATTENDANCE {
        ObjectId _id PK
        ObjectId student FK
        ObjectId batch FK
        date date
        string status
    }

    FEE {
        ObjectId _id PK
        ObjectId student FK
        ObjectId batch FK
        number totalFees
        number paidAmount
        number pendingAmount
        string paymentStatus
        date paymentDate
    }

    RESULT {
        ObjectId _id PK
        ObjectId student FK
        ObjectId batch FK
        array subjectMarks
        number totalMarks
        number percentage
        string resultStatus
        string remarks
    }
```

## Important Constraints

-   Student and Trainer profiles are linked to User accounts.
-   Batch references a Course and Trainer.
-   Enrollment links Student and Batch.
-   Attendance links Student and Batch.
-   Fees link Student and Batch.
-   Results link Student and Batch.
-   A course linked to a batch is protected from deletion by the
    business rule implemented in the backend.
