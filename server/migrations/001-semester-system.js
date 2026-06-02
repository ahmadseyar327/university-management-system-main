/**
 * Migration 001 — Semester-based academic system
 *
 * Run: node migrations/001-semester-system.js
 *
 * Safe to run multiple times (idempotent checks).
 * Does NOT delete existing data.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const programSchema = require('../models/programModel');
const semesterSchema = require('../models/semesterModel');
const courseSchema = require('../models/courseModel');
const studentSchema = require('../models/studentModel');
const registeredCourseSchema = require('../models/registeredCourseModel');
const studentAcademicRecordSchema = require('../models/studentAcademicRecordModel');
const { TOTAL_SEMESTERS, STUDENT_STATUS } = require('../utils/academicRules');

const LEGACY_PROGRAM_NAME = 'Legacy General Program';

async function connect() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');
}

async function ensureLegacyProgram() {
  let program = await programSchema.findOne({ isLegacy: true });
  if (!program) {
    program = await programSchema.create({
      name: LEGACY_PROGRAM_NAME,
      description: 'Auto-created for existing catalog courses during migration.',
      totalSemesters: TOTAL_SEMESTERS,
      isLegacy: true,
    });
    console.log('Created legacy program:', program._id.toString());
  } else {
    console.log('Legacy program exists:', program._id.toString());
  }
  return program;
}

async function ensureSemesters(programId, programName) {
  for (let n = 1; n <= TOTAL_SEMESTERS; n += 1) {
    const exists = await semesterSchema.findOne({ programId, semesterNumber: n });
    if (!exists) {
      await semesterSchema.create({
        programId,
        semesterNumber: n,
        title: `${programName} — Semester ${n}`,
        description: '',
      });
      console.log(`  Created semester ${n}`);
    }
  }
  return semesterSchema.findOne({ programId, semesterNumber: 1 });
}

async function linkOrphanCourses(semester1Id, programId) {
  const orphans = await courseSchema.find({
    $or: [{ semesterId: '' }, { semesterId: { $exists: false } }, { semesterId: null }],
  });

  let linked = 0;
  for (const course of orphans) {
    await courseSchema.findByIdAndUpdate(course._id, {
      semesterId: semester1Id,
      description: course.description || '',
    });
    linked += 1;
  }
  console.log(`Linked ${linked} catalog courses to Semester 1`);
  return linked;
}

async function migrateRegisteredCourses(programId) {
  const rows = await registeredCourseSchema.find({
    $or: [{ programId: '' }, { programId: { $exists: false } }],
  });

  let updated = 0;
  for (const row of rows) {
    await registeredCourseSchema.findByIdAndUpdate(row._id, {
      programId,
      semesterNumber: row.semesterNumber || 1,
      enrollmentType: row.enrollmentType || 'manual',
    });
    updated += 1;
  }
  console.log(`Updated ${updated} registeredCourse rows with programId`);
}

async function createAcademicRecordsForStudents(programId) {
  const students = await studentSchema.find();
  let created = 0;

  for (const student of students) {
    const exists = await studentAcademicRecordSchema.findOne({
      studentId: student._id.toString(),
    });
    if (exists) continue;

    const hasEnrollment = await registeredCourseSchema.findOne({
      studentId: student._id.toString(),
    });

    if (hasEnrollment) {
      await studentAcademicRecordSchema.create({
        studentId: student._id.toString(),
        programId,
        currentSemester: 1,
        enrollmentDate: student.createdAt || new Date(),
        status: STUDENT_STATUS.ACTIVE,
      });
      created += 1;
    }
  }
  console.log(`Created ${created} student academic records (existing enrollments)`);
}

async function run() {
  try {
    await connect();

    const program = await ensureLegacyProgram();
    const programId = program._id.toString();
    const sem1 = await ensureSemesters(programId, program.name);
    await linkOrphanCourses(sem1._id.toString(), programId);
    await migrateRegisteredCourses(programId);
    await createAcademicRecordsForStudents(programId);

    console.log('\nMigration 001 completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

run();
