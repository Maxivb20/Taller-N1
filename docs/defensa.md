# Guía de demostración y defensa técnica

Material de apoyo para la presentación en vivo y las preguntas individuales del taller.

---

## 1. Guion de demostración (flujo principal)

Duración sugerida: 5–7 minutos. Seguir **un flujo completo**, no pantallas sueltas.

1. **Dashboard** (`/`): mostrar las métricas (activos, por vencer, morosidad, check-ins de hoy),
   el gráfico de 7 días y el **widget de clima** (Open-Meteo). Mencionar el estado de carga y
   el botón **Reintentar** ante error.
2. **Alta de socio** (`/socios` → "Nuevo socio"): cargar datos inválidos para mostrar la
   **validación**, luego corregir y guardar (aparece *toast*).
3. **Nueva membresía** (`/membresias` → "Nueva membresía"): elegir el socio recién creado, un
   plan y la fecha de inicio. Mostrar el **preview de vigencia** y que se genera un **pago
   pendiente**. Guardar.
4. **Check-in** (`/qr`): seleccionar un socio **vigente** → Validar → "Bienvenido/a" + se
   registra la asistencia. Luego seleccionar uno **vencido** → "Acceso denegado".
5. **Asistencia** (`/asistencia`): ver el registro del día actualizado.
6. **Pagos** (`/pagos`) y **Vencimientos** (`/vencimientos`): mostrar morosidad y usar
   **"Marcar pagado"**; ver cómo el estado cambia en toda la app.
7. **Persistencia**: recargar la página (F5) y comprobar que los cambios siguen (localStorage).
8. **Responsive**: reducir la ventana o abrir el devtools en modo móvil; la sidebar se reordena.

---

## 2. Preguntas frecuentes (tipo §16 del enunciado)

**¿Por qué dividieron la aplicación en estos componentes?**
Para separar responsabilidad: `layout/` (estructura y navegación), `ui/` (piezas
presentacionales reutilizables) y `pages/` (una por vista, que consume el estado).

**¿Qué información se transmite mediante props?**
Los `ui/` reciben datos ya resueltos: `DataTable` (`columns`, `children`), `StatCard`
(`label`, `value`, `sub`, `tone`), `EstadoBadge` (`estado`), `Modal` (`open`, `title`,
`footer`, `children`).

**¿Qué estados maneja este componente y por qué?**
Ej. `Socios`: búsqueda, filtro por estado, visibilidad del modal, formulario y mensaje de
error. Son estados de interacción de la UI, locales a la vista.

**¿Qué provoca el re-renderizado?**
Un cambio de estado (`useState`) o una nueva versión del estado global (`useReducer`): React
vuelve a calcular el render de los componentes que consumen ese dato.

**¿Por qué usaron `useEffect`?**
En `useWeather` para sincronizar con un sistema externo (la API de Open-Meteo): dispara el
`fetch` al montar y al reintentar. En `ClubContext` para persistir el estado en `localStorage`.

**¿Qué ocurre si la API devuelve un error?**
`obtenerClimaLocal` lanza un `Error`; `useWeather` lo captura y expone `error`; el `ErrorState`
muestra el mensaje con **botón Reintentar** (`refetch`).

**¿Cómo se transforma la respuesta de la API antes de mostrarla?**
Se toma `current_weather` y se traduce el `weathercode` a texto + ícono con `describirClima()`;
la temperatura se redondea.

**¿Qué parte funciona con datos locales?**
Todo el modelo del club (socios, planes, membresías, pagos, asistencias) proviene de
`iniciales.json` + estado en `localStorage`. Solo el clima viene de `fetch`.

**Diferencia entre un dato local y uno obtenido por fetch**: el local es inmediato, síncrono y
lo controlamos (JSON/localStorage); el de `fetch` es asíncrono, puede fallar y requiere estados
de carga/error.

---

## 3. Pregunta especial — "manipulación del DOM" con React

La rúbrica de la Actividad 1 pedía *manipulación del DOM*. En React **no manipulamos el DOM a
mano** (`document.querySelector`, `appendChild`), sino que **describimos la interfaz como
función del estado**; cuando el estado cambia, React reconcilia y actualiza el DOM real de
forma eficiente. Ejemplo: agregar un socio hace `dispatch` → cambia `state.socios` → React
vuelve a renderizar la tabla y crea la nueva fila en el DOM. El efecto observable (elementos
que aparecen/desaparecen, filtros, modales) es el mismo, pero el control es declarativo.

---

## 4. Checklist antes de la demo

- [ ] `npm install` ejecutado y `npm run dev` funcionando.
- [ ] `npm run lint` y `npm run build` sin errores.
- [ ] Datos de ejemplo "frescos" (botón **Reiniciar datos de ejemplo** en el Dashboard).
- [ ] Conexión a Internet para el widget de clima (o saber mostrar el estado de error + reintento).
- [ ] Tener a mano `docs/diseno.md` para responder sobre diseño y flujos.
