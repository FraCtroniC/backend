# Contribuir

Gracias por ayudar a mejorar el proyecto.

## Flujo sugerido

1. Crear una rama desde `main`.
2. Hacer cambios pequenos y centrados.
3. Mantener consistencia con el estilo existente.
4. Verificar que el proyecto inicie sin errores.
5. Abrir un pull request con descripcion clara.

## Reglas basicas

- No romper las rutas existentes.
- No cambiar contratos de API sin documentarlo.
- Mantener actualizados `Docs/` y `postman/` si cambia un endpoint.
- Usar nombres descriptivos en controladores, modelos y rutas.

## Antes de enviar

- Revisar sintaxis de los archivos modificados.
- Probar las rutas afectadas con Postman o cURL.
- Confirmar que la documentacion refleje el cambio.

## Sugerencias de calidad

- Preferir validaciones en rutas para errores de entrada.
- Centralizar respuestas de error en los middlewares.
- Mantener los controladores enfocados en la logica de negocio.