// Google Apps Script Web App URL
export const GAS_URL = import.meta.env.VITE_GAS_URL || 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

// URL 유효성 검사 (디버깅용)
if (GAS_URL.includes('YOUR_SCRIPT_ID')) {
  console.error('⚠️ [API] VITE_GAS_URL이 설정되지 않았습니다. .env 파일이나 GitHub Secrets를 확인하세요.');
}

async function gasGet(params) {
  const query = new URLSearchParams(params).toString();
  const fullUrl = `${GAS_URL}?${query}`;
  console.log('🌐 [API GET] Request:', params.action, fullUrl);

  try {
    const response = await fetch(fullUrl, { mode: 'cors' });
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    const data = await response.json();
    console.log('✅ [API GET] Success:', params.action, data);
    return data;
  } catch (error) {
    console.error('❌ [API GET] Failure:', params.action, error);
    return { success: false, message: `통신 오류: ${error.message}` };
  }
}

async function gasPost(body) {
  console.log('🌐 [API POST] Request:', body.action, body);

  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    // GAS가 리다이렉트를 줄 수 있으므로 응답 텍스트를 먼저 확인
    const text = await response.text();
    console.log('📄 [API POST] Raw Response:', text);

    try {
      const data = JSON.parse(text);
      console.log('✅ [API POST] Success:', body.action, data);
      return data;
    } catch (e) {
      console.error('❌ [API POST] JSON Parse Error:', e, text);
      return { success: false, message: '서버 응답 형식이 올바르지 않습니다.' };
    }
  } catch (error) {
    console.error('❌ [API POST] Failure:', body.action, error);
    return { success: false, message: `통신 오류: ${error.message}` };
  }
}

// 회원 목록 조회
export const getMembers = (sheet) => gasGet({ action: 'getMembers', sheet });

// 중복 확인
export const checkDuplicate = (sheet, name, birthdate) =>
  gasGet({ action: 'checkDuplicate', sheet, name, birthdate });

// 회원 등록
export const addMember = (sheet, data) => gasPost({ action: 'addMember', sheet, data });

// 회원 수정
export const updateMember = (sheet, rowIndex, data) =>
  gasPost({ action: 'updateMember', sheet, rowIndex, data });

// 회원 삭제
export const deleteMember = (sheet, rowIndex) =>
  gasPost({ action: 'deleteMember', sheet, rowIndex });

// 프로그램 목록 조회
export const getPrograms = (sheet) => gasGet({ action: 'getPrograms', sheet });

// 프로그램 추가
export const addProgram = (sheet, programName) =>
  gasPost({ action: 'addProgram', sheet, programName });

// 프로그램 삭제
export const deleteProgram = (sheet, programName) =>
  gasPost({ action: 'deleteProgram', sheet, programName });

// 대기자 목록 조회 (프로그램별)
export const getWaitlist = (sheet, programName) =>
  gasGet({ action: 'getWaitlist', sheet, program: programName });

// 대기 → 정상 승인
export const approveWaitlist = (sheet, rowIndex) =>
  gasPost({ action: 'approveWaitlist', sheet, rowIndex });

// 특이사항 저장
export const saveNote = (sheet, rowIndex, note) =>
  gasPost({ action: 'saveNote', sheet, rowIndex, note });
