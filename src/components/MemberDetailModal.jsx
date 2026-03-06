import { useState } from 'react';
import { saveNote, approveWaitlist } from '../utils/api';
import SocialPdfTemplate from './SocialPdfTemplate';
import SeniorPdfTemplate from './SeniorPdfTemplate';
import { printPDF, savePDF } from '../utils/pdf';

export default function MemberDetailModal({ member, sheetType, onClose, onUpdate }) {
  const [note, setNote] = useState(member['기타사항'] || member['특이사항'] || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPdf, setShowPdf] = useState(false);

  const isSocial = sheetType === 'social';
  const programKey = isSocial ? '신청프로그램' : '희망수업';
  const accentColor = isSocial ? '#1e40af' : '#065f46';

  async function handleSaveNote() {
    setSaving(true);
    const res = await saveNote(sheetType, member['행번호'], note);
    setSaving(false);
    if (res.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onUpdate && onUpdate();
    } else {
      alert(res.message);
    }
  }

  async function handleApprove() {
    if (!window.confirm(`${member['성명']} 회원을 대기 → 정회원으로 승인하시겠습니까?`)) return;
    const res = await approveWaitlist(sheetType, member['행번호']);
    if (res.success) { onUpdate && onUpdate(); onClose(); }
    else alert(res.message);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* 핸들 */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* 헤더 */}
        <div className="px-6 pt-4 pb-4 flex items-center justify-between border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-800">{member['성명']}</h2>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${member['상태'] === '정회원' ? 'bg-green-100 text-green-700' :
                member['상태'] === '대기' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>{member['상태']}</span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">등록일 {member['등록일']}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-lg">×</button>
        </div>

        {/* 기본 정보 */}
        <div className="px-6 py-4 space-y-3">
          <InfoRow label="성별" value={member['성별']} />
          <InfoRow label="생년월일" value={member['생년월일']} />
          <InfoRow label="거주지" value={member['주소(동)']} />
          <InfoRow label="연락처" value={member['연락처']} />
          {member['비상연락처'] && (
            <InfoRow label="비상연락처" value={`${member['비상연락처']} (${member['관계']})`} />
          )}
          <InfoRow label="생활구분" value={member['생활구분']} />
          {!isSocial && member['동거상태'] && (
            <InfoRow label="동거상태" value={member['동거상태']} />
          )}
        </div>

        {/* 신청 프로그램 */}
        <div className="px-6 pb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            {isSocial ? '신청 프로그램' : '희망 수업'}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(member[programKey] || '').split(',').filter(Boolean).map((p, i) => (
              <span key={i} style={{ background: isSocial ? '#eff6ff' : '#ecfdf5', color: isSocial ? '#1d4ed8' : '#047857' }}
                className="text-sm px-3 py-1 rounded-full font-medium">
                {p.trim()}
              </span>
            ))}
          </div>
        </div>

        {/* 동의 여부 */}
        <div className="px-6 pb-4 flex gap-3">
          <ConsentBadge label="개인정보 동의" value={member['개인정보동의']} />
          {isSocial && <ConsentBadge label="이용안내 동의" value={member['이용안내동의']} />}
        </div>

        {/* 대기자 승인 버튼 */}
        {member['상태'] === '대기' && (
          <div className="px-6 pb-4">
            <button
              onClick={handleApprove}
              style={{ background: accentColor }}
              className="w-full py-3 rounded-xl text-white font-bold text-sm active:scale-95 transition-transform"
            >
              ✓ 정회원 등록으로 승인
            </button>
          </div>
        )}

        <div className="px-6 pb-6 space-y-3">
          <button
            onClick={() => setShowPdf(true)}
            className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm mb-1"
          >
            🖨️ 신청서 출력 (인쇄/저장)
          </button>

          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">
              📝 기타사항
            </p>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="기타사항을 입력하세요"
              rows={3}
              className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2.5 text-sm outline-none resize-none focus:border-amber-400 placeholder-gray-300"
            />
            <button
              onClick={handleSaveNote}
              disabled={saving}
              className={`mt-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${saved
                ? 'bg-green-500 text-white'
                : 'bg-amber-500 text-white active:scale-95'
                } disabled:opacity-60`}
            >
              {saving ? '저장 중...' : saved ? '✓ 저장됨' : '기타사항 저장'}
            </button>
          </div>
        </div>
      </div>

      {showPdf && (
        <div className="fixed inset-0 z-[60] bg-gray-100 overflow-auto">
          <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex gap-3">
            <button onClick={() => setShowPdf(false)}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold">닫기</button>
            <button onClick={() => printPDF(isSocial ? 'social-pdf' : 'senior-pdf')}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold">🖨️ 인쇄</button>
            <button onClick={() => savePDF(isSocial ? 'social-pdf' : 'senior-pdf', `${isSocial ? '사회교육' : '노인대학'}_${member['성명']}_신청서.pdf`)}
              className="flex-1 py-3 bg-blue-800 text-white rounded-xl font-semibold">💾 저장</button>
          </div>
          <div className="flex justify-center p-4">
            {isSocial ? (
              <SocialPdfTemplate
                data={{ ...member, 신청프로그램: (member['신청프로그램'] || '').split(',').map(s => s.trim()).filter(Boolean) }}
                sig1={null} sig2={null} sig3={null}
              />
            ) : (
              <SeniorPdfTemplate
                data={{ ...member, 희망수업: (member['희망수업'] || '').split(',').map(s => s.trim()).filter(Boolean) }}
                sig1={null}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <span className="text-xs text-gray-400 w-20 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gray-800 font-medium">{value}</span>
    </div>
  );
}

function ConsentBadge({ label, value }) {
  const agreed = value === '동의' || value === true || value === 'true';
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${agreed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-500'
      }`}>
      <span>{agreed ? '✓' : '✗'}</span>
      <span>{label}</span>
    </div>
  );
}
