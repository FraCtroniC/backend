const { User, Role, Student, Teacher, Career, sequelize } = require('../models');
const { Op } = require('sequelize');

function toSafeUser(userInstance) {
  const user = userInstance.get({ plain: true });
  
  user.career = '';
  user.period = '2026-II';
  user.cum = 0;
  
  if (user.Student) {
    user.career = user.Student.Career?.name_career || '';
    user.cum = 16.45;
  }
  
  if (user.Teacher) {
    user.academic_title = user.Teacher.academic_grade || '';
    user.expertise = user.Teacher.profession || 'Pendiente de asignación';
  }

  //delete user.password_hash;
  return user;
}

// 1. Listar todos los usuarios (máximo 50)
exports.list = async (req, res, next) => {
  try {
    const users = await User.findAll({ 
      limit: 50,
      include: [
        {
          model: Student,
          include: [Career]
        },
        {
          model: Teacher
        }
      ]
    });
    res.json(users.map(toSafeUser));
  } catch (err) {
    next(err);
  }
};

// 2. Obtener un usuario específico por su ID (UUID)
exports.get = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [
        {
          model: Student,
          include: [Career]
        },
        {
          model: Teacher
        }
      ]
    });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(toSafeUser(user));
  } catch (err) {
    next(err);
  }
};

// 3. Crear un nuevo usuario
exports.create = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const {
      id_role,
      document_id,
      username,
      password_hash,
      first_name,
      second_name,
      first_lastname,
      second_lastname,
      email,
      phone,
      date_birth,
      status,
      career,
      academic_grade,
      profession,
    } = req.body;

    const user = await User.create({ 
      id_role, 
      document_id, 
      username, 
      password_hash,
      first_name,
      second_name,
      first_lastname,
      second_lastname,
      email, 
      phone,
      date_birth,
      status 
    }, { transaction: t });

    // Determine role name
    let resolvedRoleName = '';
    if (user.id_role) {
      const roleRecord = await Role.findByPk(user.id_role, { transaction: t });
      if (roleRecord) {
        resolvedRoleName = roleRecord.name_role;
      }
    }

    // Associate with Student or Teacher
    if (resolvedRoleName === 'Estudiante') {
      let resolvedCareerId = null;
      if (career) {
        if (!isNaN(Number(career))) {
          resolvedCareerId = Number(career);
        } else {
          const foundCareer = await Career.findOne({
            where: {
              name_career: {
                [Op.iLike]: `%${career.trim()}%`
              }
            },
            transaction: t
          });
          if (foundCareer) {
            resolvedCareerId = foundCareer.id_career;
          }
        }
      }

      if (!resolvedCareerId) {
        const firstCareer = await Career.findOne({ order: [['id_career', 'ASC']], transaction: t });
        if (firstCareer) {
          resolvedCareerId = firstCareer.id_career;
        }
      }

      await Student.create({
        id_user: user.id_user,
        id_career: resolvedCareerId || 1,
        id_semester: 1,
        status: 'Regular',
        admission_date: new Date()
      }, { transaction: t });
    } else if (resolvedRoleName === 'Docente') {
      await Teacher.create({
        id_user: user.id_user,
        academic_grade: academic_grade || 'Licenciado',
        profession: profession || 'Docente'
      }, { transaction: t });
    }

    await t.commit();

    // Reload user with Student and Career to include it in the response
    const reloadedUser = await User.findByPk(user.id_user, {
      include: [
        {
          model: Student,
          include: [Career]
        },
        {
          model: Teacher
        }
      ]
    });

    res.status(201).json(toSafeUser(reloadedUser || user));
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const {
      id_role,
      username,
      password_hash,
      password,
      first_name,
      second_name,
      first_lastname,
      second_lastname,
      email,
      phone,
      date_birth,
      status,
      career,
      academic_grade,
      profession,
    } = req.body;

    let finalPasswordHash = password_hash;
    if (password) {
      const { hashPassword } = require('../services/passwordService');
      finalPasswordHash = hashPassword(password);
    }

    await user.update({ 
      id_role, 
      username, 
      password_hash: finalPasswordHash,
      first_name,
      second_name,
      first_lastname,
      second_lastname,
      email, 
      phone,
      date_birth,
      status 
    });

    // Update associated Student record (career) if applicable
    if (career) {
      let resolvedCareerId = null;
      if (!isNaN(Number(career))) {
        resolvedCareerId = Number(career);
      } else {
        const foundCareer = await Career.findOne({
          where: {
            name_career: {
              [Op.iLike]: `%${career.trim()}%`
            }
          }
        });
        if (foundCareer) {
          resolvedCareerId = foundCareer.id_career;
        }
      }

      if (resolvedCareerId) {
        const student = await Student.findOne({ where: { id_user: user.id_user } });
        if (student) {
          await student.update({ id_career: resolvedCareerId });
        }
      }
    }

    // Update associated Teacher record (academic grade and profession) if applicable
    if (academic_grade || profession) {
      const teacher = await Teacher.findOne({ where: { id_user: user.id_user } });
      if (teacher) {
        await teacher.update({
          academic_grade: academic_grade || teacher.academic_grade,
          profession: profession || teacher.profession
        });
      }
    }

    const reloadedUser = await User.findByPk(user.id_user, {
      include: [
        {
          model: Student,
          include: [Career]
        },
        {
          model: Teacher
        }
      ]
    });

    res.json(toSafeUser(reloadedUser || user));
  } catch (err) {
    next(err);
  }
};
// 5. Eliminar un usuario (DELETE)
exports.remove = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await user.destroy();
    res.status(204).end(); // Todo bien, pero no hay contenido que devolver
  } catch (err) {
    next(err);
  }
};