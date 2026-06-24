const { User, Role, Student, Teacher, Career, AcademicTitle, sequelize } = require('../models');
const { Op } = require('sequelize');


function toSafeUser(userInstance) {
  const user = userInstance.get({ plain: true });
  
  user.career = '';
  user.period = '2026-II';
  user.cum = 0;
  
  if (user.Student) {
    user.career = user.Student.Career?.name_career || '';
    user.cum = 0.0;
  }
  
  if (user.Teacher) {
    user.academic_title = user.Teacher.AcademicTitle?.name_title || user.Teacher.academic_grade || '';
    user.id_academic_title = user.Teacher.id_academic_title;
    user.expertise = user.Teacher.profession || 'Pendiente de asignación';
  }

  //delete user.password_hash;
  return user;

}

// 1. Listar usuarios con paginación y filtros
exports.list = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { search, role, status, career, academic_title } = req.query;

    const where = {};

    if (status && status !== 'Todos') {
      where.status = { [Op.iLike]: status };
    }

    if (search) {
      const searchTerms = search.trim().split(/\s+/);
      const searchConditions = searchTerms.map(term => ({
        [Op.or]: [
          { document_id: { [Op.iLike]: `%${term}%` } },
          { first_name: { [Op.iLike]: `%${term}%` } },
          { second_name: { [Op.iLike]: `%${term}%` } },
          { first_lastname: { [Op.iLike]: `%${term}%` } },
          { second_lastname: { [Op.iLike]: `%${term}%` } },
          { email: { [Op.iLike]: `%${term}%` } },
          { username: { [Op.iLike]: `%${term}%` } }
        ]
      }));
      
      where[Op.and] = [
        ...(where[Op.and] || []),
        ...searchConditions
      ];
    }

    // Role filtering mapping: students=3, teachers=2, admins=1
    if (role) {
      if (role === 'students') where.id_role = 3;
      else if (role === 'teachers') where.id_role = 2;
      else if (role === 'admins') where.id_role = 1;
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Student,
          include: [
            {
              model: Career,
              where: (role === 'students' && career) ? { name_career: { [Op.iLike]: `%${career.trim()}%` } } : undefined,
              required: !!(role === 'students' && career)
            }
          ],
          required: !!(role === 'students' && career)
        },
        {
          model: Teacher,
          include: [
            {
              model: AcademicTitle,
              where: (role === 'teachers' && academic_title) ? { name_title: { [Op.iLike]: `%${academic_title.trim()}%` } } : undefined,
              required: !!(role === 'teachers' && academic_title)
            }
          ],
          required: !!(role === 'teachers' && academic_title)
        }
      ]

    });

    res.json({
      data: rows.map(toSafeUser),
      meta: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        limit
      }
    });
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
          model: Teacher,
          include: [AcademicTitle]
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
      id_academic_title,
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
      let resolvedTitleId = id_academic_title || null;
      let resolvedGrade = academic_grade;
      if (!resolvedTitleId && academic_grade) {
        const titleRecord = await AcademicTitle.findOne({
          where: { name_title: { [Op.iLike]: academic_grade.trim() } },
          transaction: t
        });
        if (titleRecord) {
          resolvedTitleId = titleRecord.id_academic_title;
          resolvedGrade = titleRecord.name_title;
        }
      } else if (resolvedTitleId) {
        const titleRecord = await AcademicTitle.findByPk(resolvedTitleId, { transaction: t });
        if (titleRecord) {
          resolvedGrade = titleRecord.name_title;
        }
      }
      await Teacher.create({
        id_user: user.id_user,
        id_academic_title: resolvedTitleId,
        academic_grade: resolvedGrade || 'Licenciado',
        profession: profession || resolvedGrade || 'Docente'
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
          model: Teacher,
          include: [AcademicTitle]
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
      id_academic_title,
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
    if (academic_grade || profession || id_academic_title !== undefined) {
      const teacher = await Teacher.findOne({ where: { id_user: user.id_user } });
      if (teacher) {
        let resolvedTitleId = id_academic_title !== undefined ? id_academic_title : teacher.id_academic_title;
        let resolvedGrade = academic_grade || teacher.academic_grade;
        if (id_academic_title === undefined && academic_grade) {
          const titleRecord = await AcademicTitle.findOne({
            where: { name_title: { [Op.iLike]: academic_grade.trim() } }
          });
          if (titleRecord) {
            resolvedTitleId = titleRecord.id_academic_title;
            resolvedGrade = titleRecord.name_title;
          }
        } else if (id_academic_title) {
          const titleRecord = await AcademicTitle.findByPk(id_academic_title);
          if (titleRecord) {
            resolvedGrade = titleRecord.name_title;
          }
        }
        await teacher.update({
          id_academic_title: resolvedTitleId,
          academic_grade: resolvedGrade,
          profession: profession || resolvedGrade || teacher.profession
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
          model: Teacher,
          include: [AcademicTitle]
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