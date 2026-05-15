const { Op } = require('sequelize');
const { User, Role } = require('../models');
const { signAccessToken } = require('../services/jwtService');
const config = require('../config/env');
const { hashPassword, verifyPassword } = require('../services/passwordService');

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

async function ensureUniqueUser(username, email) {
  return User.findOne({
    where: {
      [Op.or]: [{ username }, { email }],
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
    const { id_role, document_id, username, password, name, lastname, email, status } = req.body;

    const existingUser = await ensureUniqueUser(username, email);
    if (existingUser) {
      return res.status(409).json({ message: 'El usuario o correo ya existe' });
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
      name,
      lastname,
      email,
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

function me(req, res) {
  return res.json({
    authenticated: true,
    token_payload: req.auth,
  });
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
  changePassword,
};
