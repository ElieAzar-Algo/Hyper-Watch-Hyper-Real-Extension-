# Alert sounds

Default: the app looks for `alert.mp3` here and plays it in a loop until the user acknowledges the critical alert.

You can change the sound without renaming files by setting the env variable:

- **`NEXT_PUBLIC_CRITICAL_ALERT_SOUND`** – Path to the sound file (e.g. `/sounds/alert.mp3` or `/sounds/siren.mp3`). Default: `/sounds/alert.mp3`.
- Use **`builtin:beep`** to use the built-in beep (no file).
- Use **`builtin:siren`** to use the built-in siren-style tone (no file).

If the file is missing or fails to load and you did not set a builtin, the app falls back to the built-in beep.
