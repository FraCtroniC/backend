const { PreDocument } = require('../models');
const cloudinary = require('../config/cloudinary');

exports.upload = async (req, res, next) => {
  try {
    console.log('[upload] req.file:', req.file?.originalname, req.file?.mimetype, req.file?.size);
    console.log('[upload] req.body:', req.body);

    if (!req.file) {
      console.log('[upload] ERROR: no file');
      return res.status(400).json({ message: 'No se envio ningun archivo.' });
    }

    const { id_pre, document_type } = req.body;
    if (!id_pre || !document_type) {
      console.log('[upload] ERROR: missing fields', { id_pre, document_type });
      return res.status(400).json({ message: 'Faltan campos requeridos: id_pre, document_type.' });
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'pre-documents',
      resource_type: 'image',
    });

    console.log('[upload] Cloudinary OK:', result.secure_url);

    const item = await PreDocument.create({
      id_pre: Number(id_pre),
      document_type,
      file_path: result.secure_url,
    });

    console.log('[upload] DB record created:', item.id_doc);
    res.status(201).json(item);
  } catch (err) {
    console.error('[upload] ERROR:', err.message, err.stack);
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    const where = req.query.id_pre ? { id_pre: Number(req.query.id_pre) } : undefined;
    const items = await PreDocument.findAll({
      where,
      order: [['upload_date', 'DESC']],
      limit: 200,
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const item = await PreDocument.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const item = await PreDocument.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const item = await PreDocument.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }

    await item.update(req.body);
    res.json(item);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const item = await PreDocument.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }

    await item.destroy();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};