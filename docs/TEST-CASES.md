# Test Cases and Results

The following test cases were executed during functional/API
verification. Mark the result according to the final verification
performed before submission.

## Authentication

  ID        Test                               Expected          Result
  --------- ---------------------------------- ----------------- --------
  AUTH-01   Valid login                        200 + JWT         PASS
  AUTH-02   Invalid password                   401               PASS
  AUTH-03   Registration with valid data       Account created   PASS
  AUTH-04   Duplicate registration email       Rejected          PASS
  AUTH-05   Get current user with token        200               PASS
  AUTH-06   Get current user without token     401               PASS
  AUTH-07   Change password with valid token   Success           PASS
  AUTH-08   Change password without token      401               PASS

## Students

  ID       Test                          Expected             Result
  -------- ----------------------------- -------------------- --------
  STU-01   Create student as Admin       201                  PASS
  STU-02   Duplicate student email       409/rejected         PASS
  STU-03   Duplicate student ID          409/rejected         PASS
  STU-04   Get students                  200                  PASS
  STU-05   Student pagination            Correct page/limit   PASS
  STU-06   Search/filter students        Filtered data        PASS
  STU-07   Invalid student ID            404                  PASS
  STU-08   Unauthorized student update   403                  PASS

## Courses

  ID       Test                      Expected   Result
  -------- ------------------------- ---------- --------
  CRS-01   Get all courses           200        PASS
  CRS-02   Get course by ID          200        PASS
  CRS-03   Invalid course ID         404        PASS
  CRS-04   Create course             201        PASS
  CRS-05   Missing required fields   400        PASS
  CRS-06   Negative fees             400        PASS
  CRS-07   Duplicate course name     409        PASS
  CRS-08   Update course             200        PASS
  CRS-09   Trainer updates course    403        PASS
  CRS-10   Student updates course    403        PASS
  CRS-11   Delete linked course      400        PASS
  CRS-12   Delete unlinked course    200        PASS
  CRS-13   Trainer deletes course    403        PASS
  CRS-14   Student deletes course    403        PASS

## Batches

  ID       Test                     Expected                             Result
  -------- ------------------------ ------------------------------------ --------
  BAT-01   Create valid batch       Success                              PASS
  BAT-02   Invalid date range       Rejected                             PASS
  BAT-03   Invalid capacity         Rejected                             PASS
  BAT-04   Invalid course/trainer   Rejected                             PASS
  BAT-05   Get batch                Success                              PASS
  BAT-06   Update batch             Success                              PASS
  BAT-07   Delete batch             Success/restricted by dependencies   PASS

## Enrollments

  ID       Test                      Expected   Result
  -------- ------------------------- ---------- --------
  ENR-01   Valid enrollment          Success    PASS
  ENR-02   Duplicate enrollment      Rejected   PASS
  ENR-03   Batch capacity exceeded   Rejected   PASS
  ENR-04   Invalid student           Rejected   PASS
  ENR-05   Invalid batch             Rejected   PASS

## Attendance

  ID       Test                             Expected              Result
  -------- -------------------------------- --------------------- --------
  ATT-01   Mark present                     Success               PASS
  ATT-02   Mark absent                      Success               PASS
  ATT-03   Duplicate attendance same date   Rejected              PASS
  ATT-04   Attendance percentage            Correct calculation   PASS

## Fees

  ID       Test                         Expected   Result
  -------- ---------------------------- ---------- --------
  FEE-01   Record valid payment         Success    PASS
  FEE-02   Overpayment                  Rejected   PASS
  FEE-03   Pending amount calculation   Correct    PASS
  FEE-04   Payment status calculation   Correct    PASS

## Results

  ID       Test                     Expected   Result
  -------- ------------------------ ---------- --------
  RES-01   Enter valid marks        Success    PASS
  RES-02   Invalid marks            Rejected   PASS
  RES-03   Percentage calculation   Correct    PASS
  RES-04   Pass/fail calculation    Correct    PASS

## Frontend Role Workflows

  -----------------------------------------------------------------------
  ID                Test              Expected          Result
  ----------------- ----------------- ----------------- -----------------
  UI-01             Admin             Dashboard         PASS
                    login/dashboard   accessible        

  UI-02             Trainer           Trainer dashboard PASS
                    login/dashboard   accessible        

  UI-03             Student           Student dashboard PASS
                    login/dashboard   accessible        

  UI-04             Admin management  Main actions work PASS
                    modules                             

  UI-05             Trainer permitted Main actions work PASS
                    modules                             

  UI-06             Student permitted Main actions work PASS
                    modules                             
  -----------------------------------------------------------------------

## Test Environment

-   Browser: Chrome
-   Frontend: React/Vite development server
-   Backend: Node.js/Express
-   Database: MongoDB
-   API testing: Postman
-   Database verification: MongoDB Compass

## Evidence

Before final submission, add screenshots showing representative
successful and validation tests, especially: - Login - Admin dashboard -
CRUD page - Validation error - Attendance - Fees - Results - Reports
