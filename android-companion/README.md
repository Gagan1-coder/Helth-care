# LifeLink AI — Native Android Companion Specification

## 1. Overview
The **LifeLink Android Companion** is an optional native companion application built in Kotlin that extends LifeLink's web application with hardware-level capabilities that ordinary browser sandboxes cannot universally access.

## 2. Supported Hardware SOS Mechanisms

### Method 3: Back-Tap SOS
- **Mechanism**: Implemented via an Android Accessibility Service (`AccessibilityService`) listening for dual accelerometer impulse spikes, or utilizing Google Pixel / Android 12+ Quick Tap integration.
- **Permission**: `android.permission.BIND_ACCESSIBILITY_SERVICE`
- **Fallback**: In-app simulated double-tap button on web dashboard.

### Method 4: Volume Pattern SOS
- **Mechanism**: Implemented via `AccessibilityService.onKeyEvent(KeyEvent event)` or `dispatchKeyEvent` inside active foreground activities. Detects the sequence `VOLUME_UP` ➔ `VOLUME_UP` ➔ `VOLUME_DOWN` within a 3-second rolling window.
- **Restrictions**: Background key interception without accessibility service is blocked by Android security sandbox to prevent keystroke logging.
- **Fallback**: Interactive volume key sequence simulator on web dashboard.

### Method 5: Power Button SOS
- **Mechanism**: Registers a system `BroadcastReceiver` listening for `Intent.ACTION_SCREEN_ON` and `Intent.ACTION_SCREEN_OFF`. Counts 4 state flips within 3 seconds to trigger emergency broadcast.
- **Restrictions**: Universal interception of raw `KEYCODE_POWER` is reserved for the Android OS kernel and OEM emergency assistants.
- **Fallback**: In-app press-and-hold trigger on web dashboard.

---

## 3. Native Kotlin Reference Implementations

### `LifeLinkAccessibilityService.kt`
```kotlin
package ai.lifelink.companion.services

import android.accessibilityservice.AccessibilityService
import android.view.KeyEvent
import android.view.accessibility.AccessibilityEvent
import android.util.Log

class LifeLinkAccessibilityService : AccessibilityService() {

    private val keyHistory = mutableListOf<Long>()
    private var lastKeyTime = 0L

    override fun onKeyEvent(event: KeyEvent): Boolean {
        if (event.action == KeyEvent.ACTION_DOWN) {
            val now = System.currentTimeMillis()
            if (now - lastKeyTime > 3000) {
                keyHistory.clear()
            }
            lastKeyTime = now

            when (event.keyCode) {
                KeyEvent.KEYCODE_VOLUME_UP -> keyHistory.add(1L)
                KeyEvent.KEYCODE_VOLUME_DOWN -> keyHistory.add(2L)
            }

            // Pattern: VolUp (1), VolUp (1), VolDown (2)
            if (keyHistory.takeLast(3) == listOf(1L, 1L, 2L)) {
                Log.w("LifeLink", "Volume SOS pattern matched! Triggering emergency broadcast.")
                triggerNativeSos("volume_pattern")
                keyHistory.clear()
                return true // Consume event
            }
        }
        return super.onKeyEvent(event)
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {}
    override fun onInterrupt() {}

    private fun triggerNativeSos(method: String) {
        // Dispatches HTTP POST to LifeLink backend: /api/v1/emergency/create
    }
}
```

### `PowerButtonReceiver.kt`
```kotlin
package ai.lifelink.companion.receivers

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class PowerButtonReceiver : BroadcastReceiver() {
    companion object {
        private var screenPressCount = 0
        private var firstPressTime = 0L
    }

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_SCREEN_ON || intent.action == Intent.ACTION_SCREEN_OFF) {
            val now = System.currentTimeMillis()
            if (now - firstPressTime > 3500) {
                screenPressCount = 0
                firstPressTime = now
            }
            screenPressCount++

            if (screenPressCount >= 4) {
                Log.w("LifeLink", "4x Power button state changes detected! Launching SOS.")
                screenPressCount = 0
                // Launch LifeLink High Priority Intent
            }
        }
    }
}
```
