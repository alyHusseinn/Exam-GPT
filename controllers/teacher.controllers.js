const Teacher = require('../models/user');
const asyncHandler = require('express-async-handler');
/* const { body, validationResult } = require('express-validator'); */

exports.getAllTeachers = asyncHandler(async (req, res) => {
    const teachers = await Teacher.find();
    res.render('home', {
        title: 'Teachers',
        teachers: teachers
    })
});

exports.getTeacher = asyncHandler(async (req, res) => {
    const teacher = await Teacher.findById(req.params.id);
    if(!teacher) {
        const error = new Error('Teacher not found');
        error.status = 404;
        throw error;
    }
    res.render('teacher', {
        title: `${teacher.username}'s profile`,
        teacher: teacher
    });
})