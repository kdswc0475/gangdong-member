// ============================================================
// 강동종합사회복지관 회원등록 시스템 - Google Apps Script
// ============================================================

const SPREADSHEET_ID = '1dzTz6L7W95zhTubrEXSxz-hlEwooYrqAu5-0jn-5A9Y';
const SHEET_SOCIAL            = '사회교육';
const SHEET_SENIOR            = '노인대학';
const SHEET_PROGRAMS_SOCIAL   = '사회교육_프로그램';
const SHEET_PROGRAMS_SENIOR   = '노인대학_프로그램';

// ── 헤더 정의 ──────────────────────────────────────────────
const SOCIAL_HEADERS = [
  '행번호','등록일','상태','성명','성별','생년월일',
  '주소(동)','연락처','비상연락처','관계','생활구분',
  '신청프로그램','개인정보동의','이용안내동의','특이사항'
];
const SENIOR_HEADERS = [
  '행번호','등록일','상태','성명','성별','생년월일',
  '주소(동)','연락처','비상연락처','관계','생활구분',
  '동거상태','희망수업','개인정보동의','특이사항'
];
const PROGRAM_HEADERS = ['프로그램명','등록일'];

// ── CORS / 응답 헬퍼 ───────────────────────────────────────
function cors(output) {
  return output
    .setMimeType(ContentService.MimeType.JSON)
    .addHeader('Access-Control-Allow-Origin', '*')
    .addHeader('Access-Control-Allow-Methods', 'GET, POST')
    .addHeader('Access-Control-Allow-Headers', 'Content-Type');
}
function ok(data)  { return cors(ContentService.createTextOutput(JSON.stringify({ success: true,  ...data }))); }
function fail(msg) { return cors(ContentService.createTextOutput(JSON.stringify({ success: false, message: msg }))); }

// ── 라우터 ─────────────────────────────────────────────────
function doGet(e) {
  try {
    const p = e.parameter;
    switch (p.action) {
      case 'getMembers':     return ok({ data: getMembers(p.sheet) });
      case 'getWaitlist':    return ok({ data: getWaitlist(p.sheet, p.program) });
      case 'getPrograms':    return ok({ data: getPrograms(p.sheet) });
      case 'checkDuplicate': return ok({ isDuplicate: checkDuplicate(p.sheet, p.name, p.birthdate) });
      default:               return fail('알 수 없는 액션');
    }
  } catch(e) { return fail(e.toString()); }
}

function doPost(e) {
  try {
    const b = JSON.parse(e.postData.contents);
    switch (b.action) {
      case 'addMember':       return ok({ rowIndex: addMember(b.sheet, b.data), message: '등록되었습니다.' });
      case 'updateMember':    updateMember(b.sheet, b.rowIndex, b.data);         return ok({ message: '수정되었습니다.' });
      case 'deleteMember':    deleteMember(b.sheet, b.rowIndex);                 return ok({ message: '삭제되었습니다.' });
      case 'approveWaitlist': approveWaitlist(b.sheet, b.rowIndex);              return ok({ message: '승인되었습니다.' });
      case 'saveNote':        saveNote(b.sheet, b.rowIndex, b.note);             return ok({ message: '특이사항이 저장되었습니다.' });
      case 'addProgram':      return ok({ message: addProgram(b.sheet, b.programName) });
      case 'deleteProgram':   deleteProgram(b.sheet, b.programName);             return ok({ message: '삭제되었습니다.' });
      default:                return fail('알 수 없는 액션');
    }
  } catch(e) { return fail(e.toString()); }
}

// ── 시트 헬퍼 ──────────────────────────────────────────────
function getSheet(sheetName, hdrs) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sh = ss.getSheetByName(sheetName);
  if (!sh) {
    sh = ss.insertSheet(sheetName);
    sh.appendRow(hdrs);
    const r = sh.getRange(1, 1, 1, hdrs.length);
    r.setBackground('#1a5276').setFontColor('#ffffff').setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function hdrs(sheetType)  { return sheetType === 'social' ? SOCIAL_HEADERS : SENIOR_HEADERS; }
function getDataSheet(sheetType) {
  const name = sheetType === 'social' ? SHEET_SOCIAL : SHEET_SENIOR;
  return getSheet(name, hdrs(sheetType));
}
function today() { return Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd'); }

function findRow(sh, rowIndex) {
  const last = sh.getLastRow();
  if (last < 2) return -1;
  const ids = sh.getRange(2, 1, last - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (ids[i][0] == rowIndex) return i + 2;
  }
  return -1;
}

function readAll(sheetType) {
  const sh = getDataSheet(sheetType);
  const hd = hdrs(sheetType);
  const last = sh.getLastRow();
  if (last < 2) return [];
  return sh.getRange(2, 1, last - 1, hd.length).getValues()
    .map(row => { const o = {}; hd.forEach((h, i) => o[h] = row[i]); return o; });
}

// ── 회원 CRUD ──────────────────────────────────────────────
function getMembers(sheetType) {
  return readAll(sheetType).filter(r => r['상태'] !== '삭제');
}

function getWaitlist(sheetType, programKey) {
  const field = sheetType === 'social' ? '신청프로그램' : '희망수업';
  return readAll(sheetType).filter(r =>
    r['상태'] === '대기' &&
    (!programKey || programKey === '전체' || (r[field] || '').includes(programKey))
  );
}

function checkDuplicate(sheetType, name, birthdate) {
  return readAll(sheetType).some(r =>
    r['상태'] !== '삭제' &&
    r['성명'] === name &&
    String(r['생년월일']) === String(birthdate)
  );
}

function addMember(sheetType, data) {
  const sh = getDataSheet(sheetType);
  const hd = hdrs(sheetType);
  const rowIndex = sh.getLastRow(); // 데이터 순번
  const row = hd.map(h => {
    if (h === '행번호') return rowIndex;
    if (h === '등록일') return today();
    if (h === '상태')   return data['상태'] || '정상';
    return data[h] !== undefined ? data[h] : '';
  });
  sh.appendRow(row);
  return rowIndex;
}

function updateMember(sheetType, rowIndex, data) {
  const sh = getDataSheet(sheetType);
  const hd = hdrs(sheetType);
  const targetRow = findRow(sh, rowIndex);
  if (targetRow === -1) throw new Error('회원을 찾을 수 없습니다.');
  const existing = sh.getRange(targetRow, 1, 1, hd.length).getValues()[0];
  const row = hd.map((h, i) => {
    if (h === '행번호') return rowIndex;
    if (h === '등록일') return existing[hd.indexOf('등록일')];
    return data[h] !== undefined ? data[h] : existing[i];
  });
  sh.getRange(targetRow, 1, 1, hd.length).setValues([row]);
}

function deleteMember(sheetType, rowIndex) {
  const sh = getDataSheet(sheetType);
  const hd = hdrs(sheetType);
  const targetRow = findRow(sh, rowIndex);
  if (targetRow === -1) throw new Error('회원을 찾을 수 없습니다.');
  sh.getRange(targetRow, hd.indexOf('상태') + 1).setValue('삭제');
}

function approveWaitlist(sheetType, rowIndex) {
  const sh = getDataSheet(sheetType);
  const hd = hdrs(sheetType);
  const targetRow = findRow(sh, rowIndex);
  if (targetRow === -1) throw new Error('회원을 찾을 수 없습니다.');
  sh.getRange(targetRow, hd.indexOf('상태') + 1).setValue('정상');
}

function saveNote(sheetType, rowIndex, note) {
  const sh = getDataSheet(sheetType);
  const hd = hdrs(sheetType);
  const targetRow = findRow(sh, rowIndex);
  if (targetRow === -1) throw new Error('회원을 찾을 수 없습니다.');
  sh.getRange(targetRow, hd.indexOf('특이사항') + 1).setValue(note);
}

// ── 프로그램 관리 ───────────────────────────────────────────
function getPrograms(sheetType) {
  const name = sheetType === 'social' ? SHEET_PROGRAMS_SOCIAL : SHEET_PROGRAMS_SENIOR;
  const sh = getSheet(name, PROGRAM_HEADERS);
  const defaults = sheetType === 'social'
    ? ['유아발레교실','유아K-POP댄스','유아 창의미술','셔플댄스(초급반)','셔플댄스(중급반)','벨리댄스','성인통기타','라인댄스']
    : ['한글교실(초급1반)','한글교실(초급2반)','한글교실(상급반)','영어교실(초급)','영어교실(중급)','디지털 역량 교육(초급)','디지털 역량 교육(중급)','맷돌체조','실버요가1','실버요가2','노래교실'];
  const last = sh.getLastRow();
  if (last < 2) {
    defaults.forEach(n => sh.appendRow([n, today()]));
    return defaults;
  }
  return sh.getRange(2, 1, last - 1, 1).getValues().map(r => r[0]).filter(v => v !== '');
}

function addProgram(sheetType, programName) {
  const name = sheetType === 'social' ? SHEET_PROGRAMS_SOCIAL : SHEET_PROGRAMS_SENIOR;
  const sh = getSheet(name, PROGRAM_HEADERS);
  const last = sh.getLastRow();
  if (last >= 2) {
    const existing = sh.getRange(2, 1, last - 1, 1).getValues().map(r => r[0]);
    if (existing.includes(programName)) throw new Error('이미 존재하는 프로그램입니다.');
  }
  sh.appendRow([programName, today()]);
  return '프로그램이 추가되었습니다.';
}

function deleteProgram(sheetType, programName) {
  const name = sheetType === 'social' ? SHEET_PROGRAMS_SOCIAL : SHEET_PROGRAMS_SENIOR;
  const sh = getSheet(name, PROGRAM_HEADERS);
  const last = sh.getLastRow();
  if (last < 2) throw new Error('데이터가 없습니다.');
  const data = sh.getRange(2, 1, last - 1, 1).getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === programName) { sh.deleteRow(i + 2); return; }
  }
  throw new Error('프로그램을 찾을 수 없습니다.');
}
