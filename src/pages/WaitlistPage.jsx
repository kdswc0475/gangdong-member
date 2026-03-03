import { useState, useEffect } from 'react';
import { getWaitlist, getPrograms, approveWaitlist, deleteMember } from '../utils/api';

export default function WaitlistPage({ navigate, sheetType }) {
  const [waitlist, setWaitlist]       = useState([]);
  const [programs, setPrograms]       = useState([]);
  const [filterProgram, setFilterProgram] = useState('전체');
  const [loading, setLoading]         = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const isSocial  = sheetType === 'social';
  const headerBg  = isSocial ? '#1e40af' : '#065f46';
  const accentCls = isSocial ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-emerald-600 bg-emerald-50 text-emerald-700';
  const programKey = isSocial ? '신청프로그램' : '희망수업';

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [wRes, pRes] = await Promise.all([
      getWaitlist(sheetType, '전체'),
      getPrograms(sheetType),
    ]);
    if (wRes.success) setWaitlist(wRes.data);
    if (pRes.success) setPrograms(pRes.data);
    setLoading(false);
  }

  async function handleApprove(member) {
    if (!window.confirm(`${member['성명']} 회원을 대기 → 정상으로 승인하시겠습니까?`)) return;
    setActionLoading(member['행번호']);
    const res = await approveWaitlist(sheetType, member['행번호']);
    if (res.success) await fetchAll();
    else alert(res.message);
    setActionLoading(null);
  }

  async function handleDelete(member) {
    if (!window.confirm(`${member['성명']} 회원을 대기 명단에서 삭제하시겠습니까?`)) return;
    setActionLoading(member['행번호']);
    const res = await deleteMember(sheetType, member['행번호']);
    if (res.success) await fetchAll();
    else alert(res.message);
    setActionLoading(null);
  }

  // 프로그램 필터 적용
  const filtered = waitlist.filter(m => {
    if (filterProgram === '전체') return true;
    return (m[programKey] || '').includes(filterProgram);
  });

  // 프로그램별 대기 수 집계
  const countByProgram = programs.reduce((acc, p) => {
    acc[p] = waitlist.filter(m => (m[programKey] || '').includes(p)).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div style={{ background: headerBg }} className="px-4 pb-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 py-4">
            <button onClick={() => navigate('memberList', { sheetType })} className="text-white text-xl p-1">‹</button>
            <div className="flex-1">
              <p className="text-xs text-white opacity-60">Waitlist</p>
              <h1 className="text-white font-bold text-lg">대기자 명단</h1>
            </div>
            <span className="bg-white bg-opacity-20 text-white text-sm font-bold px-3 py-1 rounded-full">
              총 {waitlist.length}명
            </span>
          </div>

          {/* 프로그램 필터 탭 */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {['전체', ...programs].map(p => {
              const cnt = p === '전체' ? waitlist.length : (countByProgram[p] || 0);
              return (
                <button
                  key={p}
                  onClick={() => setFilterProgram(p)}
                  className={`flex-shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                    filterProgram === p
                      ? 'bg-white text-gray-800'
                      : 'bg-white bg-opacity-20 text-white'
                  }`}
                >
                  {p}
                  {cnt > 0 && (
                    <span className={`text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center ${
                      filterProgram === p ? 'bg-red-500 text-white' : 'bg-white bg-opacity-30 text-white'
                    }`}>
                      {cnt}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 프로그램별 요약 카드 */}
      <div className="max-w-3xl mx-auto px-4 pt-4">
        <div className="grid grid-cols-3 gap-2 mb-4">
          {programs.filter(p => (countByProgram[p] || 0) > 0).slice(0, 6).map(p => (
            <button
              key={p}
              onClick={() => setFilterProgram(p)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                filterProgram === p ? accentCls : 'bg-white border-gray-100'
              }`}
            >
              <p className="text-xs text-gray-500 truncate">{p}</p>
              <p className="text-xl font-bold text-gray-800 mt-0.5">{countByProgram[p] || 0}<span className="text-xs font-normal text-gray-400 ml-0.5">명</span></p>
            </button>
          ))}
        </div>

        {/* 등록 버튼 */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate(isSocial ? 'social' : 'senior', { editMember: null, defaultStatus: '대기' })}
            style={{ background: headerBg }}
            className="text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md active:scale-95 transition-transform"
          >
            + 대기자 접수
          </button>
        </div>

        {/* 대기자 목록 */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl animate-spin">⟳</p>
            <p className="mt-3">불러오는 중...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">🎉</div>
            <p className="font-medium">대기자가 없습니다</p>
            <p className="text-sm mt-1 text-gray-300">
              {filterProgram !== '전체' ? `${filterProgram} 프로그램의 ` : ''}대기자가 없습니다
            </p>
          </div>
        ) : (
          <div className="space-y-3 pb-8">
            {filtered.map((member, idx) => (
              <WaitlistCard
                key={idx}
                member={member}
                programKey={programKey}
                isSocial={isSocial}
                isLoading={actionLoading === member['행번호']}
                onApprove={() => handleApprove(member)}
                onDelete={() => handleDelete(member)}
                onEdit={() => navigate(isSocial ? 'social' : 'senior', { editMember: member })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WaitlistCard({ member, programKey, isSocial, isLoading, onApprove, onDelete, onEdit }) {
  const approveColor = isSocial ? 'bg-blue-600' : 'bg-emerald-600';
  const rank = member['행번호'];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-start gap-3">
        {/* 순번 */}
        <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-yellow-700">{rank}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-gray-800">{member['성명']}</span>
            <span className="text-xs text-gray-400">{member['성별']}</span>
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">대기</span>
          </div>
          <p className="text-sm text-gray-500">{member['연락처']} · {member['주소(동)']}</p>
          <p className="text-xs text-gray-400">{member['생년월일']}</p>
          {/* 신청 프로그램 */}
          <div className="flex flex-wrap gap-1 mt-2">
            {(member[programKey] || '').split(',').filter(Boolean).map((p, i) => (
              <span key={i} className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                isSocial ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
              }`}>
                {p.trim()}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-300 mt-1.5">접수일: {member['등록일']}</p>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
        <button
          onClick={onApprove}
          disabled={isLoading}
          className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold ${approveColor} disabled:opacity-50 active:scale-95 transition-transform`}
        >
          {isLoading ? '처리 중...' : '✓ 정상 승인'}
        </button>
        <button
          onClick={onEdit}
          className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium"
        >
          수정
        </button>
        <button
          onClick={onDelete}
          disabled={isLoading}
          className="px-4 py-2.5 rounded-xl bg-red-50 text-red-500 text-sm font-medium disabled:opacity-50"
        >
          삭제
        </button>
      </div>
    </div>
  );
}
