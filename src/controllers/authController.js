const { Op } = require('sequelize');
const { User, Role } = require('../models');
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
    } = req.body;

    const existingUser = await ensureUniqueUser({ username, email, document_id });
    if (existingUser) {
      return res.status(409).json({ message: 'El usuario, correo o documento ya existe' });
    }

    if (id_role != null) {
      const role = await Role.findByPk(id_role);
      if (!role) {
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
    });

    return res.status(201).json(buildAuthResponse(user));
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
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
      ],
      include: [
        {
          model: Role,
          attributes: ['id_role', 'name_role'],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const data = user.get({ plain: true });

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
      ],
      include: [
        {
          model: Role,
          attributes: ['id_role', 'name_role'],
        },
      ],
    });

    const data = updatedUser.get({ plain: true });

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
