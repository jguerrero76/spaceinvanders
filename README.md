# Space Invaders - Game con Soporte para Mandos

Un juego Space Invaders clásico para navegador Safari en Mac con soporte completo para mandos de consola (gamepads).

## Características

✨ **Gameplay Clásico**
- Controla tu nave y dispara a los invasores
- Dificultad progresiva con aumento de niveles
- Sistema de vidas y puntuación

🎮 **Soporte para Mandos**
- Compatibilidad completa con gamepads (PS4, Xbox, etc.)
- Stick analógico izquierdo para movimiento
- Botones A/B para disparar
- D-Pad opcional para movimiento
- Indicador visual de conexión del mando

⌨️ **Controles Alternativos**
- Teclado: Flechas o WASD para movimiento
- Espacio para disparar
- Funciona en Safari en Mac

## Cómo Jugar

### Con Mando (Recomendado)
1. Conecta tu mando a tu Mac
2. Abre el juego en Safari
3. Usa el **stick analógico izquierdo** para mover la nave
4. Presiona **botón A** o **botón B** para disparar
5. El indicador en la esquina inferior derecha mostrará el estado del mando

### Con Teclado
1. Usa las **flechas del teclado** o **WASD** para mover
2. Presiona **ESPACIO** para disparar

## Requisitos

- **Navegador**: Safari en Mac (versión reciente)
- **Mando**: Cualquier gamepad compatible con Gamepad API (PS4, Xbox, etc.)
- **Hardware**: Mac compatible

## Instalación

1. Clona el repositorio:
```bash
git clone <url-del-repositorio>
cd spaceinvanders
```

2. Abre el archivo `index.html` en Safari:
   - Click derecho en `index.html`
   - Selecciona "Abrir con" → Safari
   - O arrastra el archivo a Safari

Alternativamente, puedes servir los archivos con un servidor web:
```bash
python3 -m http.server 8000
# Luego abre http://localhost:8000 en Safari
```

## Compatibilidad de Mandos

El juego usa la **Gamepad API** estándar de navegadores.

Probado con:
- ✅ PlayStation 4 DualShock 4
- ✅ Xbox One Controller
- ✅ Apple MFi Controllers
- ✅ Mandos USB genéricos

## Características del Juego

- **Puntuación**: 10 puntos por enemigo derrotado
- **Niveles**: Aumenta la dificultad y cantidad de enemigos por nivel
- **Vidas**: Comienza con 3 vidas
- **Game Over**: Ocurre si pierdes todas las vidas o si un enemigo llega al fondo

## Atajos de Teclado

| Acción | Teclado | Mando |
|--------|---------|-------|
| Mover Izquierda | Flecha Izquierda / A | Stick Izquierdo ← |
| Mover Derecha | Flecha Derecha / D | Stick Izquierdo → |
| Disparar | Espacio | Botón A / B |
| Reiniciar | Game Over Screen | Haz click en botón |

## Desarrollo

### Estructura del Proyecto
- `index.html` - HTML con interfaz y canvas
- `game.js` - Lógica del juego, física, controles y gamepad
- `README.md` - Este archivo

### Cómo Añadir Características

El código está organizado en funciones modulares:
- `createEnemyWave()` - Genera nuevas olas de enemigos
- `handleGamepadInput()` - Procesa entrada del mando
- `updatePlayer()` - Actualiza posición del jugador
- `updateEnemies()` - Actualiza IA y posición de enemigos
- `update()` - Loop principal de lógica

## Notas para Safari

- Safari soporta la **Gamepad API** desde versiones recientes
- Algunos mandos pueden requerir conexión previa en Preferencias del Sistema
- Si el mando no es detectado, intenta reconectarlo
- El indicador visual mostrará el estado de la conexión

## Solución de Problemas

**El mando no se detecta:**
1. Asegúrate de que el mando esté conectado en Preferencias del Sistema
2. Intenta desconectar y reconectar el mando
3. Recarga la página (Cmd + R)
4. Verifica que Safari sea la versión más reciente

**El movimiento del stick no funciona:**
1. El stick podría requerir un movimiento mayor (usa más de 50% del rango)
2. Prueba los botones D-Pad como alternativa
3. Usa el teclado como alternativa

**Los controles del teclado no funcionan:**
1. Asegúrate de que el canvas del juego esté enfocado
2. Haz click en el área del juego antes de usar el teclado

## Créditos

Desarrollado como ejemplo de juego web moderno con soporte para gamepads en Safari.

## Licencia

Libre para uso personal y educativo.
