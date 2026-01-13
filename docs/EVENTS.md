# Event Reference

Emotive Engine emits events when state changes occur, allowing you to react to mascot behavior in your application.

## Listening to Events

```javascript
// Subscribe to an event
mascot.eventManager.on('emotion:change', (data) => {
    console.log(`Emotion changed to: ${data.emotion}`);
});

// Unsubscribe from an event
const handler = (data) => console.log(data);
mascot.eventManager.on('position:change', handler);
mascot.eventManager.off('position:change', handler);
```

---

## Core State Events

### `emotion:change`
Emitted when the emotional state changes.

| Property | Type | Description |
|----------|------|-------------|
| `emotion` | `string` | New emotion name |
| `undertone` | `string \| null` | Active undertone modifier |

```javascript
mascot.eventManager.on('emotion:change', ({ emotion, undertone }) => {
    console.log(`Now feeling ${emotion}${undertone ? ` with ${undertone} undertone` : ''}`);
});

mascot.setEmotion('joy', 'excitement');
// Logs: "Now feeling joy with excitement undertone"
```

---

### `undertone:change`
Emitted when the undertone changes without changing the base emotion.

| Property | Type | Description |
|----------|------|-------------|
| `undertone` | `string \| null` | New undertone value |

```javascript
mascot.eventManager.on('undertone:change', ({ undertone }) => {
    console.log(`Undertone: ${undertone || 'cleared'}`);
});

mascot.updateUndertone('nervous');
// Logs: "Undertone: nervous"
```

---

### `gesture:trigger`
Emitted when a gesture animation starts.

| Property | Type | Description |
|----------|------|-------------|
| `gesture` | `string` | Gesture name that was triggered |

```javascript
mascot.eventManager.on('gesture:trigger', ({ gesture }) => {
    console.log(`Playing gesture: ${gesture}`);
});

mascot.express('bounce');
// Logs: "Playing gesture: bounce"
```

---

### `shape:morph`
Emitted when a geometry morph begins.

| Property | Type | Description |
|----------|------|-------------|
| `shape` | `string` | Target geometry name |

```javascript
mascot.eventManager.on('shape:morph', ({ shape }) => {
    console.log(`Morphing to: ${shape}`);
});

mascot.morphTo('heart');
// Logs: "Morphing to: heart"
```

---

## Position & Scale Events

### `position:change`
Emitted when the mascot position changes via `setPosition()` or `animateToPosition()`.

| Property | Type | Description |
|----------|------|-------------|
| `x` | `number` | New X position (pixels) |
| `y` | `number` | New Y position (pixels) |
| `z` | `number` | New Z position (pixels) |
| `previous` | `{x, y, z}` | Previous position |

```javascript
mascot.eventManager.on('position:change', ({ x, y, previous }) => {
    const deltaX = x - previous.x;
    const deltaY = y - previous.y;
    console.log(`Moved by (${deltaX}, ${deltaY})`);
});

mascot.setPosition(100, 50);
// Logs: "Moved by (100, 50)" (assuming started at 0,0)
```

---

### `scale:change`
Emitted when the containment scale changes.

| Property | Type | Description |
|----------|------|-------------|
| `scale` | `number` | New scale factor |
| `previous` | `number` | Previous scale factor |

```javascript
mascot.eventManager.on('scale:change', ({ scale, previous }) => {
    console.log(`Scale changed: ${previous} → ${scale}`);
});

mascot.setContainment({ width: 200, height: 200 }, 0.5);
// Logs: "Scale changed: 1 → 0.5"
```

---

## Animation Events

### `animation:growIn`
Emitted when the grow-in animation starts.

| Property | Type | Description |
|----------|------|-------------|
| `duration` | `number` | Animation duration in ms |

```javascript
mascot.eventManager.on('animation:growIn', ({ duration }) => {
    console.log(`Growing in over ${duration}ms`);
});

mascot.growIn(500);
// Logs: "Growing in over 500ms"
```

---

## Visual Effect Events

### `coreGlow:toggle`
Emitted when the inner core glow is enabled or disabled.

| Property | Type | Description |
|----------|------|-------------|
| `enabled` | `boolean` | Whether core glow is now enabled |

```javascript
mascot.eventManager.on('coreGlow:toggle', ({ enabled }) => {
    console.log(`Core glow: ${enabled ? 'ON' : 'OFF'}`);
});

mascot.setCoreGlowEnabled(false);
// Logs: "Core glow: OFF"
```

---

### `sss:presetChanged`
Emitted when a Subsurface Scattering preset is applied.

| Property | Type | Description |
|----------|------|-------------|
| `preset` | `string` | SSS preset name |

```javascript
mascot.eventManager.on('sss:presetChanged', ({ preset }) => {
    console.log(`Applied SSS preset: ${preset}`);
});

mascot.setSSSPreset('emerald');
// Logs: "Applied SSS preset: emerald"
```

---

## Eclipse Events

### `eclipse:solar:start`
Emitted when a solar eclipse animation begins.

| Property | Type | Description |
|----------|------|-------------|
| `type` | `string` | Eclipse type: `'annular'` or `'total'` |

```javascript
mascot.eventManager.on('eclipse:solar:start', ({ type }) => {
    console.log(`Solar eclipse starting: ${type}`);
});

mascot.startSolarEclipse({ type: 'total' });
// Logs: "Solar eclipse starting: total"
```

---

### `eclipse:lunar:start`
Emitted when a lunar eclipse animation begins.

| Property | Type | Description |
|----------|------|-------------|
| `type` | `string` | Eclipse type: `'total'`, `'partial'`, or `'penumbral'` |

```javascript
mascot.eventManager.on('eclipse:lunar:start', ({ type }) => {
    console.log(`Lunar eclipse starting: ${type}`);
});

mascot.startLunarEclipse({ type: 'total' });
// Logs: "Lunar eclipse starting: total"
```

---

### `eclipse:stop`
Emitted when an eclipse animation ends.

No payload data.

```javascript
mascot.eventManager.on('eclipse:stop', () => {
    console.log('Eclipse ended');
});

mascot.stopEclipse();
// Logs: "Eclipse ended"
```

---

## Event Design Principles

All events follow these patterns:

1. **Previous Value**: State change events include the `previous` value when applicable
2. **Namespaced Names**: Events use `category:action` format (e.g., `emotion:change`)
3. **Object Payloads**: All events pass an object (even if single property) for forward compatibility
4. **Consistent Timing**: Events fire synchronously when the state change occurs
