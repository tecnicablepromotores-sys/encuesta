// scripts/sync-promoters.js
// Sincroniza usuarios (rol=promotor) -> promotores_publicos
// Ejecutado por GitHub Actions (gratis, automático, cada hora)
//
// REQUISITO: Configurar en GitHub el secret FIREBASE_SERVICE_ACCOUNT
// con el JSON de la Service Account de Firebase (Project Settings -> Service Accounts).

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// 1. Cargar credenciales desde el secret de GitHub
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
if (!serviceAccount?.project_id) {
  console.error('❌ FIREBASE_SERVICE_ACCOUNT no configurado en GitHub Secrets');
  process.exit(1);
}

// 2. Inicializar Admin SDK (ignora reglas de seguridad, permisos de administrador)
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function syncPromoters() {
  console.log('🔄 Iniciando sincronización de promotores...');

  try {
    // 3. Leer TODOS los usuarios
    const snap = await db.collection('usuarios').get();
    console.log(`📋 ${snap.size} documentos en 'usuarios'`);

    const batch = db.batch();
    let promotoresCount = 0;
    let eliminadosCount = 0;

    snap.forEach(doc => {
      const data = doc.data();
      const rol = (data.rol || '').trim().toLowerCase();
      const esPromotor = rol === 'promotor' || rol === 'promotor(a)';
      const nombre = data.nombre?.trim();

      const ref = db.collection('promotores_publicos').doc(doc.id);

      if (esPromotor && nombre) {
        // Es promotor válido -> escribir en colección pública (SOLO nombre + rol)
        batch.set(ref, { nombre, rol: 'promotor' }, { merge: true });
        promotoresCount++;
      } else {
        // No es promotor (admin, supervisor, sin rol, sin nombre) -> limpiar
        batch.delete(ref);
        eliminadosCount++;
      }
    });

    // 4. Commit atómico
    await batch.commit();

    console.log('✅ Sincronización completada:');
    console.log(`   • Promotores públicos: ${promotoresCount}`);
    console.log(`   • Limpiados (no promotores): ${eliminadosCount}`);
  } catch (error) {
    console.error('❌ Error en sincronización:', error);
    process.exit(1);
  }
}

syncPromoters();
