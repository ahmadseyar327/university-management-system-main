const programSchema = require('../models/programModel');
const semesterSchema = require('../models/semesterModel');
const courseSchema = require('../models/courseModel');
const { TOTAL_SEMESTERS } = require('../utils/academicRules');

async function seedSemestersForProgram(programId, programName) {
  const existing = await semesterSchema.countDocuments({ programId });
  if (existing >= TOTAL_SEMESTERS) return;

  const toCreate = [];
  for (let n = 1; n <= TOTAL_SEMESTERS; n += 1) {
    toCreate.push({
      programId,
      semesterNumber: n,
      title: `${programName} — Semester ${n}`,
      description: '',
    });
  }
  await semesterSchema.insertMany(toCreate, { ordered: false }).catch(() => {});
}

const registerProgram = async (req, res) => {
  try {
    const { name, description, adminId } = req.body;
    if (!name) {
      return res.status(400).send({ success: false, message: 'Program name is required.' });
    }

    const exists = await programSchema.findOne({ name: name.trim() });
    if (exists) {
      return res.status(409).send({ success: false, message: 'Program name already exists.' });
    }

    const program = await programSchema.create({
      name: name.trim(),
      description: description || '',
      adminId: adminId || '',
      totalSemesters: TOTAL_SEMESTERS,
    });

    await seedSemestersForProgram(program._id.toString(), program.name);

    const semesters = await semesterSchema
      .find({ programId: program._id.toString() })
      .sort({ semesterNumber: 1 });

    res.status(201).send({
      success: true,
      message: 'Program created with 8 semesters.',
      data: { program, semesters },
    });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Could not create program.', error });
  }
};

const getPrograms = async (_req, res) => {
  try {
    const programs = await programSchema.find().sort({ name: 1 });
    res.status(200).send({ success: true, data: programs });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Could not fetch programs.', error });
  }
};

const getProgramById = async (req, res) => {
  try {
    const program = await programSchema.findById(req.params.id);
    if (!program) {
      return res.status(404).send({ success: false, message: 'Program not found.' });
    }
    const semesters = await semesterSchema
      .find({ programId: program._id.toString() })
      .sort({ semesterNumber: 1 });
    res.status(200).send({ success: true, data: { program, semesters } });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Could not fetch program.', error });
  }
};

const editProgram = async (req, res) => {
  try {
    const { name, description } = req.body;
    const program = await programSchema.findByIdAndUpdate(
      req.params.id,
      { ...(name && { name: name.trim() }), ...(description !== undefined && { description }) },
      { new: true }
    );
    if (!program) {
      return res.status(404).send({ success: false, message: 'Program not found.' });
    }
    res.status(200).send({ success: true, message: 'Program updated.', data: program });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Could not update program.', error });
  }
};

const deleteProgram = async (req, res) => {
  try {
    const programId = req.params.id;
    const semesters = await semesterSchema.find({ programId });
    const semesterIds = semesters.map((s) => s._id.toString());
    const courseCount = await courseSchema.countDocuments({
      semesterId: { $in: semesterIds },
    });
    if (courseCount > 0) {
      return res.status(400).send({
        success: false,
        message: 'Remove courses from program semesters before deleting.',
      });
    }
    await semesterSchema.deleteMany({ programId });
    await programSchema.findByIdAndDelete(programId);
    res.status(200).send({ success: true, message: 'Program deleted.' });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Could not delete program.', error });
  }
};

const updateSemester = async (req, res) => {
  try {
    const { title, description } = req.body;
    const semester = await semesterSchema.findByIdAndUpdate(
      req.params.id,
      { ...(title && { title }), ...(description !== undefined && { description }) },
      { new: true }
    );
    if (!semester) {
      return res.status(404).send({ success: false, message: 'Semester not found.' });
    }
    res.status(200).send({ success: true, message: 'Semester updated.', data: semester });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Could not update semester.', error });
  }
};

const addCourseToSemester = async (req, res) => {
  try {
    const { semesterId, title, code, description, type, fee, creditHours, adminId } = req.body;

    if (!semesterId || !title || !code) {
      return res.status(400).send({
        success: false,
        message: 'semesterId, title, and code are required.',
      });
    }

    const semester = await semesterSchema.findById(semesterId);
    if (!semester) {
      return res.status(404).send({ success: false, message: 'Semester not found.' });
    }

    const duplicate = await courseSchema.findOne({ code: code.trim(), semesterId });
    if (duplicate) {
      return res.status(409).send({ success: false, message: 'Course code already exists in this semester.' });
    }

    const course = await courseSchema.create({
      title: title.trim(),
      code: code.trim(),
      description: description || '',
      type: type || 'Core',
      fee: fee ?? 0,
      creditHours: creditHours ?? 3,
      adminId: adminId || '',
      semesterId: semester._id.toString(),
    });

    res.status(201).send({
      success: true,
      message: 'Course added to semester.',
      data: {
        ...course._doc,
        semesterNumber: semester.semesterNumber,
        programId: semester.programId,
      },
    });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Could not add course.', error });
  }
};

const getSemesterCourses = async (req, res) => {
  try {
    const { programId, semesterNumber } = req.params;
    const semester = await semesterSchema.findOne({
      programId,
      semesterNumber: Number(semesterNumber),
    });
    if (!semester) {
      return res.status(404).send({ success: false, message: 'Semester not found.' });
    }
    const courses = await courseSchema
      .find({ semesterId: semester._id.toString() })
      .sort({ title: 1 });
    res.status(200).send({ success: true, data: { semester, courses } });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Could not fetch courses.', error });
  }
};

const removeCourseFromSemester = async (req, res) => {
  try {
    await courseSchema.findByIdAndDelete(req.params.courseId);
    res.status(200).send({ success: true, message: 'Course removed.' });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Could not remove course.', error });
  }
};

module.exports = {
  registerProgram,
  getPrograms,
  getProgramById,
  editProgram,
  deleteProgram,
  updateSemester,
  addCourseToSemester,
  getSemesterCourses,
  removeCourseFromSemester,
};
