const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/classroomController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { cacheResponse } = require('../middlewares/cacheMiddleware');

// 1. Listar todas las aulas
router.get('/', cacheResponse(180, 'classrooms'), ctrl.list);

// 2. Verificar disponibilidad de un aula en un horario específico
router.get('/check-availability', ctrl.checkAvailability);

// 3. Obtener matriz de ocupación / horario de una aula
router.get('/:id/schedule', ctrl.getSchedule);

// 4. Obtener aula por ID
router.get('/:id', cacheResponse(180, 'classrooms'), ctrl.get);

// 5. Crear nueva aula (Requiere autenticación)
router.post('/', requireAuth, ctrl.create);

// 6. Actualizar aula (Requiere autenticación)
router.put('/:id', requireAuth, ctrl.update);

// 7. Eliminar aula (Requiere autenticación)
router.delete('/:id', requireAuth, ctrl.remove);

module.exports = router;
