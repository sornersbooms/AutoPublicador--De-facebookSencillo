/**
 * BACKEND V2 - SISTEMA DE LICENCIAS MANUALES
 */

const SHEET_USERS = 'Usuarios';
const SHEET_KEYS = 'Licencias';

// Configuración Telegram
const TELEGRAM_BOT_TOKEN = '8590654560:AAEerw441u8GPw_Ow6AAtzinE6euwivcSv4'; 
const TELEGRAM_CHAT_ID = '6432018838';

function doPost(e) { return handleRequest(e); }
function doGet(e) { return handleRequest(e); }

function handleRequest(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const params = e.parameter || {};
    if (e.postData) Object.assign(params, JSON.parse(e.postData.contents));

    const action = params.action;
    const uuid = params.uuid;

    if (!uuid && action !== 'generate_keys') return sendJSON({ error: 'Falta UUID' });

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. Registrar / Consultar
    if (action === 'register_or_check') {
      let user = getUser(ss, uuid);
      if (!user) {
        user = registerNewUser(ss, uuid);
        sendTelegram(`🚀 Nuevo Usuario: ${uuid} (Trial)`);
      }
      return sendJSON({ success: true, data: user });
    }

    // 2. Canjear Licencia
    if (action === 'redeem_license') {
      const result = redeemKey(ss, uuid, params.key);
      return sendJSON({ success: true, data: result });
    }

    // 3. Update Stats
    if (action === 'update_stats') {
      updateStats(ss, uuid, params.type, parseInt(params.count));
      return sendJSON({ success: true });
    }

    return sendJSON({ error: 'Acción desconocida' });

  } catch (err) {
    return sendJSON({ success: false, error: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

// --- LOGICA PRINCIPAL ---

function registerNewUser(ss, uuid) {
  const sheet = getSheet(ss, SHEET_USERS);
  const now = new Date();
  const expireDate = new Date();
  expireDate.setDate(now.getDate() + 5); // 5 Días Trial
  
  // UUID, Registro, Plan, Vence, Pubs, Exts, LastCheck
  sheet.appendRow([uuid, now, 'TRIAL', expireDate, 0, 0, now]);
  return formatUser(uuid, 'TRIAL', expireDate, 0, 0);
}

function getUser(ss, uuid) {
  const sheet = getSheet(ss, SHEET_USERS);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == uuid) {
      return formatUser(uuid, data[i][2], data[i][3], data[i][4], data[i][5]);
    }
  }
  return null;
}

function redeemKey(ss, uuid, keyInput) {
  if (!keyInput) throw new Error('Falta clave');
  
  const sheetKeys = getSheet(ss, SHEET_KEYS);
  const dataKeys = sheetKeys.getDataRange().getValues();
  const sheetUsers = getSheet(ss, SHEET_USERS);
  const dataUsers = sheetUsers.getDataRange().getValues();

  // 1. Buscar Usuario Row
  let userRow = -1;
  for(let i=1; i<dataUsers.length; i++) {
    if(dataUsers[i][0] == uuid) { userRow = i + 1; break; }
  }
  if(userRow === -1) throw new Error('Usuario no registrado');

  // 2. Buscar Clave
  let keyRow = -1;
  let keyData = {};
  
  // Columnas Keys: Clave(A)|Plan(B)|Active(C)|FechaExp(D)
  for(let i=1; i<dataKeys.length; i++) {
    // Normalizar clave para comparar
    if(String(dataKeys[i][0]).trim().toUpperCase() == String(keyInput).trim().toUpperCase()) {
      keyRow = i + 1;
      keyData = {
        plan: dataKeys[i][1],
        active: String(dataKeys[i][2]).toUpperCase(),
        fixedExpire: dataKeys[i][3] // Puede estar vacío
      };
      break;
    }
  }

  if (keyRow === -1) throw new Error('Clave no encontrada');
  if (keyData.active !== 'SI' && keyData.active !== 'TRUE' && keyData.active !== 'ACTIVE' && keyData.active !== 'YES') {
    throw new Error('La clave no está activa o ya fue usada');
  }

  // 3. Aplicar Licencia
  const now = new Date();
  let newExpire = new Date();
  
  // Si la clave tiene fecha fija de vencimiento:
  if (keyData.fixedExpire && new Date(keyData.fixedExpire).getTime() > now.getTime()) {
    newExpire = new Date(keyData.fixedExpire);
  } else {
    // Si no, default 3 días
    newExpire.setDate(now.getDate() + 3);
  }

  // Actualizar Usuario (Col 3: Plan, Col 4: Vence, Returns a 0)
  sheetUsers.getRange(userRow, 3).setValue(keyData.plan);
  sheetUsers.getRange(userRow, 4).setValue(newExpire);
  sheetUsers.getRange(userRow, 5).setValue(0); // Reset Pubs
  sheetUsers.getRange(userRow, 6).setValue(0); // Reset Ext

  // Desactivar Clave (Marcar como NO o USADA)
  sheetKeys.getRange(keyRow, 3).setValue('NO'); // Active -> NO
  // Opcional: Agregar columna "Usado Por" si quieres

  sendTelegram(`💎 Canje Exitoso!\nUser: ${uuid}\nPlan: ${keyData.plan}\nVence: ${formatDate(newExpire)}`);
  
  return formatUser(uuid, keyData.plan, newExpire, 0, 0);
}

function updateStats(ss, uuid, type, count) {
  const sheet = getSheet(ss, SHEET_USERS);
  const data = sheet.getDataRange().getValues();
  for(let i=1; i<data.length; i++) {
    if(data[i][0] == uuid) {
      const col = (type === 'publish') ? 5 : 6;
      const current = parseInt(data[i][col-1]) || 0;
      sheet.getRange(i+1, col).setValue(current + count);
      return;
    }
  }
}

// --- HELPER ---

function formatUser(uuid, plan, dateObj, pub, ext) {
  const now = new Date();
  const end = new Date(dateObj);
  const diffTime = end - now;
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  
  const isExpired = daysLeft <= 0;
  
  // Límites hardcoded por Plan (Frontend también valida, pero esto informa)
  let limits = { publish: 500, extract: 500 }; // Basic default
  if (plan === 'PRO' || plan === 'TRIAL') limits = { publish: 999999, extract: 999999 };
  
  return {
    uuid, plan, 
    daysLeft: (daysLeft < 0 ? 0 : daysLeft),
    isExpired,
    usage: { publish: pub, extract: ext },
    limits
  };
}

function getSheet(ss, name) {
  let s = ss.getSheetByName(name);
  if(!s) {
    s = ss.insertSheet(name);
    if(name === SHEET_USERS) s.appendRow(['UUID','Registro','Plan','Vence','Pubs','Exts','LastCheck']);
    if(name === SHEET_KEYS) s.appendRow(['Clave','Plan','Active','Fecha-Exp']);
  }
  return s;
}

function sendJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function sendTelegram(msg) {
  try {
    UrlFetchApp.fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method:'post', contentType:'application/json',
      payload: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: msg })
    });
  } catch(e){}
}

function formatDate(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM-dd");
}

function checkExpirations() {
  // Cron diario
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getSheet(ss, SHEET_USERS);
  const data = sheet.getDataRange().getValues();
  const now = new Date();
  
  for(let i=1; i<data.length; i++) {
    const uuid = data[i][0];
    const plan = data[i][2];
    const end = new Date(data[i][3]);
    const diff = Math.ceil((end - now)/(1000*3600*24));
    
    if(diff === 3 || diff === 1) {
       sendTelegram(`⚠️ Aviso: A ${uuid} (${plan}) le quedan ${diff} días.`);
    }
  }
}
