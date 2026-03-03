// Google Apps Script Web App URL
// 배포 후 아래 URL을 실제 배포 URL로 교체하세요
export const GAS_URL = import.meta.env.VITE_GAS_URL || 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

async function gasGet(params) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${GAS_URL}?${query}`);
  return res.json();
}

async function gasPost(body) {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
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
