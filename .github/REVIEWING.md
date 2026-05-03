# Checklist de Review — mezo

Revisar en este orden. Si algo falla en una sección, no pases a la siguiente.

## 1. Funcionalidad ✅
- [ ] La PR hace lo que dice que hace
- [ ] Probé el flujo principal localmente (`git checkout <rama>` + `npm start`)
- [ ] Probé casos borde (campos vacíos, valores extremos, sin internet)
- [ ] No rompió funcionalidad existente (login, POS, mesas, cocina, etc.)

## 2. Código 🧹
- [ ] No hay `console.log`, `debugger` ni código comentado sin razón
- [ ] No hay imports sin usar
- [ ] Los nombres de variables y funciones son claros y en inglés (excepto strings de UI)
- [ ] Comentarios en español, solo donde aporten contexto (no obvios)
- [ ] No hay duplicación obvia de lógica que ya existe en otro lado
- [ ] Los componentes nuevos están en la carpeta correcta
- [ ] No mezcla varios cambios no relacionados en una sola PR

## 3. Diseño y brand 🎨
- [ ] Usa los colores del brand kit (#080706, #141210, #F4ECD8, #C8903F, etc.)
- [ ] Fuentes correctas: Fraunces para display, DM Sans para UI
- [ ] Todo se ve bien en mobile (PWA) y desktop
- [ ] Montos en formato COP con punto como separador ($42.000)
- [ ] No introduce CSS suelto (todo Tailwind)
- [ ] Animaciones suaves, no rompen el feel premium

## 4. Estado y datos 💾
- [ ] Si guarda en localStorage, usa una key con prefijo `mezo_`
- [ ] No hace fetch a endpoints que no existen aún (a menos que esté detrás del mock)
- [ ] No expone datos sensibles en el cliente (tokens, claves)
- [ ] Si cambia la forma de los datos, considera migración para usuarios existentes

## 5. Seguridad y privacidad 🔒
- [ ] No mete API keys ni secretos en el código
- [ ] Inputs del usuario están validados (no asume que viene bien formateado)
- [ ] Cumple con Ley 1581 si toca datos personales

## 6. Git hygiene 📦
- [ ] Nombre de rama sigue convención: `feat/`, `fix/`, `chore/`, `docs/`
- [ ] Mensajes de commit siguen conventional commits
- [ ] No hay merge commits raros (idealmente rebase contra main)
- [ ] La rama está actualizada con main

## Cómo dar feedback
- **Comentarios en línea específica** para cosas puntuales
- **Comentario general** para feedback de arquitectura o decisiones grandes
- Empieza positivo cuando puedas ("buen trabajo con X, ahora ajustemos Y")
- Sé específico: en vez de "esto está mal", explica qué cambiar y por qué
- Distingue entre **bloqueante** (debe arreglarse antes del merge) y **sugerencia** (nice to have)

Usa estos prefijos en comentarios:
- `[bloqueante]` — debe arreglarse antes del merge
- `[sugerencia]` — opcional pero recomendado
- `[pregunta]` — quiero entender por qué hiciste esto
- `[nit]` — detalle menor, puedes ignorarlo

## Antes de aprobar
- [ ] Todos los `[bloqueante]` resueltos
- [ ] La PR description está completa
- [ ] CI/build pasa (cuando lo configuremos)
- [ ] Si es de Sofi: le dejé un mensaje en Slack/WhatsApp explicando qué hace bien y qué aprendió
