# TODO - Semester-based system frontend migration

## Plan execution steps
- [ ] 1) Scan frontend for all course/marks/enrollment/admin screens and identify which ones use old course system.
- [ ] 2) Review existing frontend API calls/endpoints to map them to semester-based backend endpoints.
- [x] 3) Update Student UI: enroll/program + courses + marks/results to be semester-scoped (using `/academic/dashboard/:studentId` and `/academic/course-result`).
- [ ] 4) Update Instructor UI: remove old course-based marks flow and replace with semester-scoped marks (semester + course selected) using `/academic/course-result` and `/academic/course-result/instructor`.
- [ ] 5) Update Admin UI: remove old course catalog/offer/assign UI flows and replace with semester registration + publish + promotion using academic endpoints.
- [ ] 6) Remove/disable old course-system UI flows from routes and navigation (student/instructor/admin).

- [ ] 7) Verify compilation and run-time wiring (build/start client) and fix any regressions.

