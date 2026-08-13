# Tecnicable — Sistema de Gestión

Sistema de gestión de clientes, promotores y solicitudes de conexión de Tecnicable.

## Repositorios

| Repo | Contenido | Archivo principal |
|------|-----------|-------------------|
| `encuesta` | Formulario público de solicitud | `index.html` (antes `index (5).html`) |
| `web` | Panel de gestión (admin) | `index.html` (antes `Tecnicable_Gestion_Firebase.html`) |
| `apt` | App Android | Proyecto Kotlin |

---

## Sincronización automática de promotores (GitHub Actions)

El formulario público muestra los promotores en el select "Promotor responsable".
Para no exponer datos sensibles (email, teléfono, dirección, uid), el formulario **NO lee
directo de `usuarios`**. En su lugar lee de la colección pública `promotores_publicos`,
que solo contiene `nombre` y `rol`.

Un **workflow de GitHub Actions** sincroniza automáticamente `usuarios` → `promotores_publicos`
cada hora (y manualmente con el botón "Run workflow").

### Archivos incluidos

```
.github/workflows/sync-promoters.yml   # Workflow (cada hora + manual)
scripts/sync-promoters.js              # Script de sincronización
scripts/package.json                   # Dependencias (firebase-admin)
```

### Configuración (1 sola vez)

1. **Firebase → Configuración del proyecto → Cuentas de servicio → Generar nueva clave privada**
   → descarga el JSON de la Service Account.

2. **GitHub → repo → Settings → Secrets and variables → Actions → New repository secret**
   - Name: `FIREBASE_SERVICE_ACCOUNT`
   - Secret: pega TODO el contenido del JSON (incluyendo las llaves `{}`).

3. **Firebase Console → Firestore → Reglas** → pega el contenido de `reglas_firestore.txt` → **Publicar**.

4. **GitHub → repo → Actions → Sync Promoters → Run workflow** (primera vez manual).

### Verificación

- Abre el formulario → select "Promotor responsable" debe mostrar los nombres.
- Los promotores en `usuarios` deben tener `rol: "promotor"` o `"promotor(a)"` (minúscula).

---

## Reglas de Firestore (resumen)

- `usuarios`: **protegida** (solo autenticados). Contiene datos sensibles.
- `promotores_publicos`: **lectura pública** (solo nombre + rol). Escrita por GitHub Actions.
- `portal_web`: creación pública (el formulario envía solicitudes sin login).
- Resto: solo admin/supervisor/dueno.

---

## Despliegue en línea

- **Formulario (`encuesta`)**: GitHub Pages (Settings → Pages → Deploy from branch → main → `/`).
- **Panel (`web`)**: GitHub Pages (mismo procedimiento).
- **App (`apt`)**: compilar APK y distribuir.

> ⚠️ No subir a GitHub el JSON de la Service Account ni `google-services.json` con claves
> sensibles. Usar GitHub Secrets para credenciales.
