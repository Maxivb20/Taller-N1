# ClubTrack Mobile — proyecto Android Studio

Proyecto Android (Capacitor 8) reconstruido a partir de los archivos nativos de `Taller 4/2_Codigo_Nativo_Android_Studio` y del bundle web extraído de `ClubTrack-Taller4.apk`.

## Abrir en Android Studio

1. En esta carpeta, ejecuta una vez:

   ```bash
   npm install
   ```

   (El módulo Gradle `capacitor-android` se referencia desde `node_modules`.)

2. Abre Android Studio y elige **File → Open…**, seleccionando la carpeta `android/` de este directorio.

3. Espera la sincronización de Gradle. Si aparece *Trust Project*, acéptalo.

4. Selecciona un dispositivo/emulador y presiona **Run 'app'** (`Shift + F10`).

## Compilar por línea de comandos

```bash
cd android
gradlew assembleDebug
```

El APK queda en `android/app/build/outputs/apk/debug/app-debug.apk`.

## Notas

- `dist/` contiene la app web recuperada del APK original. Tras cambiar el frontend web, ejecuta `npx cap sync android` para copiar los archivos al proyecto nativo.
- Los archivos nativos originales (`AndroidManifest.xml`, `MainActivity.java`) se conservan en `Taller 4/2_Codigo_Nativo_Android_Studio` y fueron copiados a `android/app/src/main/`.
- Los permisos nativos (cámara, flash, vibración e internet) están en `android/app/src/main/AndroidManifest.xml`.
