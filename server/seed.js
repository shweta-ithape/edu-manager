const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

const User = require('./models/User');
const Student = require('./models/Student');
const Trainer = require('./models/Trainer');
const Course = require('./models/Course');
const Batch = require('./models/Batch');
const Enrollment = require('./models/Enrollment');
const Attendance = require('./models/Attendance');
const Fee = require('./models/Fee');
const Result = require('./models/Result');

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    console.log('[Seed] Clearing existing database collections...');
    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Trainer.deleteMany({}),
      Course.deleteMany({}),
      Batch.deleteMany({}),
      Enrollment.deleteMany({}),
      Attendance.deleteMany({}),
      Fee.deleteMany({}),
      Result.deleteMany({})
    ]);

    console.log('[Seed] Creating Default Password Hash...');
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('password123', salt);

    // 1. Create Admin User
    console.log('[Seed] Seeding Admin User...');
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@institute.com',
      password: defaultPassword,
      role: 'ADMIN',
      status: 'ACTIVE'
    });

    // 2. Create Courses
    console.log('[Seed] Seeding Courses...');
    const courses = await Course.insertMany([
      {
        courseName: 'Fullstack Web Development (MERN)',
        description: 'Comprehensive web development masterclass using React, Node.js, Express, and MongoDB.',
        duration: '6 Months',
        totalFees: 45000,
        status: 'ACTIVE'
      },
      {
        courseName: 'Data Science & Machine Learning',
        description: 'Master Python, Pandas, Machine Learning models, Neural Networks, and Data Visualization.',
        duration: '6 Months',
        totalFees: 55000,
        status: 'ACTIVE'
      },
      {
        courseName: 'Mobile App Development (React Native)',
        description: 'Build cross-platform iOS and Android mobile apps with React Native & Expo.',
        duration: '4 Months',
        totalFees: 38000,
        status: 'ACTIVE'
      },
      {
        courseName: 'Cloud Computing & DevOps',
        description: 'Hands-on AWS cloud infrastructure, Docker containerization, Kubernetes, and CI/CD pipelines.',
        duration: '5 Months',
        totalFees: 50000,
        status: 'ACTIVE'
      },
      {
        courseName: 'UI/UX Design Masterclass',
        description: 'User research, wireframing, interactive prototyping with Figma, and design systems.',
        duration: '3 Months',
        totalFees: 30000,
        status: 'ACTIVE'
      }
    ]);

    // 3. Create Trainers
    console.log('[Seed] Seeding Trainers...');
    const trainerRawData = [
      {
        trainerId: 'TRN101',
        name: 'Dr. Rajesh Sharma',
        email: 'trainer1@institute.com',
        phone: '+91 9876543210',
        specialization: 'Fullstack Development & Cloud'
      },
      {
        trainerId: 'TRN102',
        name: 'Priya Verma',
        email: 'trainer2@institute.com',
        phone: '+91 9876543211',
        specialization: 'Data Science & AI'
      },
      {
        trainerId: 'TRN103',
        name: 'Amitabh Sen',
        email: 'trainer3@institute.com',
        phone: '+91 9876543212',
        specialization: 'Mobile Apps & UI/UX'
      }
    ];

    const trainers = [];
    for (const t of trainerRawData) {
      const user = await User.create({
        name: t.name,
        email: t.email,
        password: defaultPassword,
        role: 'TRAINER',
        status: 'ACTIVE'
      });

      const trainer = await Trainer.create({
        ...t,
        user: user._id,
        status: 'ACTIVE'
      });
      trainers.push(trainer);
    }

    // 4. Create Batches
    console.log('[Seed] Seeding Batches...');
    const today = new Date();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(today.getMonth() + 3);

    const batches = await Batch.insertMany([
      {
        batchName: 'MERN-2026-A1',
        course: courses[0]._id,
        trainer: trainers[0]._id,
        startDate: new Date('2026-01-10'),
        endDate: new Date('2026-07-10'),
        timing: '09:00 AM - 11:00 AM',
        capacity: 25,
        status: 'ACTIVE'
      },
      {
        batchName: 'DS-2026-B1',
        course: courses[1]._id,
        trainer: trainers[1]._id,
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-08-01'),
        timing: '11:30 AM - 01:30 PM',
        capacity: 20,
        status: 'ACTIVE'
      },
      {
        batchName: 'REACT-NATIVE-01',
        course: courses[2]._id,
        trainer: trainers[2]._id,
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-07-01'),
        timing: '02:00 PM - 04:00 PM',
        capacity: 20,
        status: 'ACTIVE'
      },
      {
        batchName: 'DEVOPS-AWS-2026',
        course: courses[3]._id,
        trainer: trainers[0]._id,
        startDate: new Date('2026-01-15'),
        endDate: new Date('2026-06-15'),
        timing: '04:30 PM - 06:30 PM',
        capacity: 15,
        status: 'ACTIVE'
      },
      {
        batchName: 'UIUX-DESIGN-FEB',
        course: courses[4]._id,
        trainer: trainers[2]._id,
        startDate: new Date('2026-02-15'),
        endDate: new Date('2026-05-15'),
        timing: '10:00 AM - 12:00 PM',
        capacity: 15,
        status: 'ACTIVE'
      }
    ]);

    // 5. Create 22 Students
    console.log('[Seed] Seeding 22 Students...');
    const firstNames = ['Aarav', 'Ananya', 'Rohan', 'Sneha', 'Vikram', 'Neha', 'Rahul', 'Kavya', 'Siddharth', 'Pooja', 'Aditya', 'Riya', 'Karan', 'Divya', 'Manish', 'Shreya', 'Varun', 'Meera', 'Yash', 'Tanvi', 'Abhishek', 'Nisha'];
    const lastNames = ['Sharma', 'Gupta', 'Kumar', 'Patel', 'Singh', 'Reddy', 'Joshi', 'Mehta', 'Nair', 'Bhat', 'Rao', 'Chawla', 'Verma', 'Deshmukh', 'Saxena', 'Kapoor', 'Trivedi', 'Aggarwal', 'Choudhury', 'Iyer', 'Thakur', 'Gore'];

    const students = [];
    for (let i = 0; i < 22; i++) {
      const name = `${firstNames[i]} ${lastNames[i]}`;
      const email = `student${i + 1}@institute.com`;
      const studentId = `STU${1001 + i}`;
      const phone = `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`;

      const user = await User.create({
        name,
        email,
        password: defaultPassword,
        role: 'STUDENT',
        status: 'ACTIVE'
      });

      const student = await Student.create({
        studentId,
        name,
        email,
        phone,
        address: `${101 + i}, Tech Park View, Silicon Valley Layout`,
        joiningDate: new Date('2026-01-05'),
        status: 'ACTIVE',
        user: user._id
      });
      students.push(student);
    }

    // 6. Seed Enrollments, Fees, Attendance, Results
    console.log('[Seed] Seeding Academic Records (Enrollments, Fees, Attendance, Results)...');

    // Distribute students into batches
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      // Pick batch
      const batch = batches[i % batches.length];
      const course = courses.find(c => c._id.toString() === batch.course.toString());

      // Enrollment
      await Enrollment.create({
        student: student._id,
        batch: batch._id,
        enrollmentDate: new Date('2026-01-10'),
        status: 'ENROLLED'
      });

      // Fee allocation with mixed payment statuses (PAID, PARTIAL, PENDING)
      let paidAmount = 0;
      let paymentStatus = 'PENDING';
      if (i % 3 === 0) {
        paidAmount = course.totalFees;
        paymentStatus = 'PAID';
      } else if (i % 3 === 1) {
        paidAmount = course.totalFees / 2;
        paymentStatus = 'PARTIAL';
      } else {
        paidAmount = 0;
        paymentStatus = 'PENDING';
      }

      await Fee.create({
        student: student._id,
        batch: batch._id,
        totalFees: course.totalFees,
        paidAmount,
        pendingAmount: course.totalFees - paidAmount,
        paymentStatus,
        paymentDate: paidAmount > 0 ? new Date('2026-01-12') : null
      });

      // Attendance history (past 5 sessions)
      for (let day = 1; day <= 5; day++) {
        const attDate = new Date();
        attDate.setDate(attDate.getDate() - day);
        attDate.setHours(0, 0, 0, 0);

        // 85% attendance rate simulation
        const status = (i + day) % 7 === 0 ? 'ABSENT' : 'PRESENT';

        await Attendance.create({
          student: student._id,
          batch: batch._id,
          date: attDate,
          status
        });
      }

      // Result records (for 18 of the students)
      if (i < 18) {
        const marks1 = Math.floor(65 + Math.random() * 30);
        const marks2 = Math.floor(60 + Math.random() * 35);
        const marks3 = Math.floor(i % 5 === 0 ? 25 : 70 + Math.random() * 25); // Some fails for realistic stats

        const subjectMarks = [
          { subject: 'Theory & Architecture', marksObtained: marks1, maxMarks: 100 },
          { subject: 'Practical / Lab Assessment', marksObtained: marks2, maxMarks: 100 },
          { subject: 'Capstone Project', marksObtained: marks3, maxMarks: 100 }
        ];

        const totalObtained = marks1 + marks2 + marks3;
        const percentage = Number(((totalObtained / 300) * 100).toFixed(2));
        const resultStatus = percentage >= 40 ? 'PASS' : 'FAIL';

        await Result.create({
          student: student._id,
          batch: batch._id,
          subjectMarks,
          totalMarks: totalObtained,
          percentage,
          resultStatus,
          remarks: resultStatus === 'PASS' ? 'Excellent performance in practical assessments.' : 'Needs improvement in project work.'
        });
      }
    }

    console.log('----------------------------------------------------');
    console.log('SUCCESS: Database seeded successfully with realistic data!');
    console.log('----------------------------------------------------');
    console.log('DEMO CREDENTIALS:');
    console.log('Admin User:   admin@institute.com / password123');
    console.log('Trainer 1:    trainer1@institute.com / password123');
    console.log('Trainer 2:    trainer2@institute.com / password123');
    console.log('Student 1:    student1@institute.com / password123');
    console.log('Student 2:    student2@institute.com / password123');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedData();
