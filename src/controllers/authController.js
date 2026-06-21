const { Op } = require('sequelize');
const { User, Role, Student, Teacher, Career, Registration, RegistrationDetail, sequelize } = require('../models');
const { signAccessToken } = require('../services/jwtService');
const config = require('../config/env');
const { hashPassword, verifyPassword } = require('../services/passwordService');
const { sendEmail } = require('../services/emailService');
const {
  requestPasswordReset,
  completePasswordReset,
} = require('../services/passwordRecoveryService');

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
    user.academic_title = user.Teacher.academic_grade || '';
    user.expertise = user.Teacher.profession || 'Pendiente de asignación';
  }

  delete user.password_hash;
  return user;
}

function buildAuthResponse(userInstance, expiresIn) {
  const user = toSafeUser(userInstance);
  const payload = {
    sub: user.id_user,
    username: user.username,
    role: user.id_role ?? 'user',
  };

  const token = signAccessToken(payload, { expiresIn });

  return {
    token_type: 'Bearer',
    access_token: token,
    expires_in: expiresIn || config.jwtExpiresIn,
    user,
  };
}

async function ensureUniqueUser({ username, email, document_id }) {
  const orConditions = [{ username }];

  if (email) {
    orConditions.push({ email });
  }

  if (document_id) {
    orConditions.push({ document_id });
  }

  return User.findOne({
    where: {
      [Op.or]: orConditions,
    },
  });
}

function issueToken(req, res, next) {
  try {
    const { sub, role, expiresIn } = req.body;

    const payload = {
      sub,
      role: role || 'user',
    };

    const token = signAccessToken(payload, { expiresIn });

    return res.status(201).json({
      token_type: 'Bearer',
      access_token: token,
      expires_in: expiresIn || config.jwtExpiresIn,
      payload,
    });
  } catch (error) {
    return next(error);
  }
}

async function register(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const {
      id_role,
      document_id,
      username,
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

    const existingUser = await ensureUniqueUser({ username, email, document_id });
    if (existingUser) {
      await t.rollback();
      return res.status(409).json({ message: 'El usuario, correo o documento ya existe' });
    }

    if (id_role != null) {
      const role = await Role.findByPk(id_role, { transaction: t });
      if (!role) {
        await t.rollback();
        return res.status(400).json({ message: 'El rol indicado no existe' });
      }
    }

    const user = await User.create({
      id_role: id_role ?? null,
      document_id,
      username,
      password_hash: hashPassword(password),
      first_name,
      second_name,
      first_lastname,
      second_lastname,
      email: email ?? null,
      phone,
      date_birth,
      status: status || 'Activo',
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

    return res.status(201).json(buildAuthResponse(reloadedUser || user));
  } catch (error) {
    await t.rollback();
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({
      where: { username },
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
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    if (user.status && user.status !== 'Activo') {
      return res.status(403).json({ message: 'El usuario no está activo' });
    }

    const isValid = verifyPassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    return res.json(buildAuthResponse(user));
  } catch (error) {
    return next(error);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const user = await User.findOne({
      where: {
        email: {
          [Op.iLike]: req.body.email.trim().toLowerCase(),
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'No existe un usuario registrado con ese correo' });
    }

    await requestPasswordReset({
      user,
      sendEmail,
      frontendUrl: config.frontendUrl,
      tokenExpiresIn: config.passwordResetTokenExpiresIn,
    });

    return res.json({ message: 'Se envio un enlace de recuperacion al correo indicado' });
  } catch (error) {
    return next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const result = await completePasswordReset({
      token: req.body.token,
      newPassword: req.body.newPassword,
      findUserById: async (userId) => User.findByPk(userId),
      hashPassword,
    });

    return res.status(result.status).json(result.body);
  } catch (error) {
    return next(error);
  }
}

function me(req, res) {
  return res.json({
    authenticated: true,
    token_payload: req.auth,
  });
}

async function profile(req, res, next) {
  try {
    const userId = req.auth.sub;

    const user = await User.findByPk(userId, {
      attributes: [
        'id_user',
        'email',
        'phone',
        'first_name',
        'second_name',
        'first_lastname',
        'second_lastname',
        'id_role',
        'document_id',
        'date_birth',
      ],
      include: [
        {
          model: Role,
          attributes: ['id_role', 'name_role'],
        },
        {
          model: Student,
          include: [Career],
        },
        {
          model: Teacher,
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const data = user.get({ plain: true });

    let calculatedCum = 0.0;
    if (data.Student) {
      const registrations = await Registration.findAll({
        where: { id_student: data.Student.id_student },
        include: [{
          model: RegistrationDetail
        }]
      });
      let totalGrades = 0;
      let gradesCount = 0;
      registrations.forEach(reg => {
        if (reg.RegistrationDetails) {
          reg.RegistrationDetails.forEach(detail => {
            if (detail.final_note !== null && detail.final_note !== undefined) {
              totalGrades += Number(detail.final_note);
              gradesCount++;
            }
          });
        }
      });
      if (gradesCount > 0) {
        calculatedCum = Number((totalGrades / gradesCount).toFixed(2));
      }
    }

    return res.json({
      id: data.id_user,
      email: data.email,
      phone: data.phone,
      first_name: data.first_name,
      second_name: data.second_name,
      first_lastname: data.first_lastname,
      second_lastname: data.second_lastname,
      name: data.first_name,
      lastname: data.first_lastname,
      role: data.Role?.name_role ?? null,
      career: data.Student?.Career?.name_career ?? (data.Role?.name_role === 'Estudiante' ? 'Informática' : ''),
      academic_title: data.Teacher?.academic_grade ?? '',
      expertise: data.Teacher?.profession ?? '',
      document_id: data.document_id,
      date_birth: data.date_birth,
      cum: calculatedCum,
      academicStatus: data.Student?.status ?? (data.Role?.name_role === 'Estudiante' ? 'Regular' : ''),
      id_student: data.Student?.id_student ?? null,
      id_teacher: data.Teacher?.id_teacher ?? null,
    });
  } catch (error) {
    return next(error);
  }
}

async function profileUpdate(req, res, next) {
  try {
    const userId = req.auth.sub;
    const {
      email,
      phone,
      first_name,
      second_name,
      first_lastname,
      second_lastname,
    } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await user.update({
      ...(email !== undefined ? { email } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(first_name !== undefined ? { first_name } : {}),
      ...(second_name !== undefined ? { second_name } : {}),
      ...(first_lastname !== undefined ? { first_lastname } : {}),
      ...(second_lastname !== undefined ? { second_lastname } : {}),
    });

    const updatedUser = await User.findByPk(userId, {
      attributes: [
        'id_user',
        'email',
        'phone',
        'first_name',
        'second_name',
        'first_lastname',
        'second_lastname',
        'id_role',
        'document_id',
        'date_birth',
      ],
      include: [
        {
          model: Role,
          attributes: ['id_role', 'name_role'],
        },
        {
          model: Student,
          include: [Career],
        },
        {
          model: Teacher,
        },
      ],
    });

    const data = updatedUser.get({ plain: true });

    let calculatedCum = 0.0;
    if (data.Student) {
      const registrations = await Registration.findAll({
        where: { id_student: data.Student.id_student },
        include: [{
          model: RegistrationDetail
        }]
      });
      let totalGrades = 0;
      let gradesCount = 0;
      registrations.forEach(reg => {
        if (reg.RegistrationDetails) {
          reg.RegistrationDetails.forEach(detail => {
            if (detail.final_note !== null && detail.final_note !== undefined) {
              totalGrades += Number(detail.final_note);
              gradesCount++;
            }
          });
        }
      });
      if (gradesCount > 0) {
        calculatedCum = Number((totalGrades / gradesCount).toFixed(2));
      }
    }

    return res.json({
      id: data.id_user,
      email: data.email,
      phone: data.phone,
      first_name: data.first_name,
      second_name: data.second_name,
      first_lastname: data.first_lastname,
      second_lastname: data.second_lastname,
      name: data.first_name,
      lastname: data.first_lastname,
      role: data.Role?.name_role ?? null,
      career: data.Student?.Career?.name_career ?? '',
      academic_title: data.Teacher?.academic_grade ?? '',
      expertise: data.Teacher?.profession ?? '',
      document_id: data.document_id,
      date_birth: data.date_birth,
      cum: calculatedCum,
      academicStatus: data.Student?.status ?? '',
      id_student: data.Student?.id_student ?? null,
      id_teacher: data.Teacher?.id_teacher ?? null,
    });
  } catch (error) {
    return next(error);
  }
}

async function changePassword(req, res, next) {
  try {
    const userId = req.auth.sub; // Extraído del token por requireAuth
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // 1. Verificar si la contraseña actual es correcta
    const isValid = verifyPassword(currentPassword, user.password_hash);
    if (!isValid) {
      return res.status(400).json({ message: 'La contraseña actual es incorrecta' });
    }

    // 2. Hashear la nueva contraseña y actualizar
    await user.update({
      password_hash: hashPassword(newPassword),
    });

    return res.json({ message: 'Contraseña actualizada con éxito' });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  login,
  issueToken,
  me,
  profile,
  profileUpdate,
  changePassword,
  forgotPassword,
  resetPassword,
};
