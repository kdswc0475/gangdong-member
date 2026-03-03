import { useState, useEffect } from 'react';
import { getMembers, deleteMember } from '../utils/api';
import MemberDetailModal from '../components/MemberDetailModal';

export default function MemberList({ navigate, sheetType }) {
  const [members, setMembers]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState('');
  const [filterProgram, setFilterProgram] = useState('전체');
  const [activeTab, setActiveTab]         = useState('정상');
  const [selectedMember, setSelectedMember] = useState(null);
  const [error, setError]                 = useState('');

  const isSocial   = sheetType === 'social';
  const headerBg   = isSocial ? '#1e40af' : '#065f46';
  const programKey = isSocial ? '신청프로그램' : '희망수업';
  const title      = isSocial ? '사회교육 프로그램' : '노인대학 청춘캠퍼스';

  useEffect(() => { fetchMembers(); }, []);

  async function fetchMembers() {
    setLoading(true);
    setError('');
    try {
      const res = await getMembers(sheetType);
      if (res.success) setMembers(res.data);
      else setError(res.message);
    } catch { setError('데이터를 불러오는 중 오류가 발생했습니다.'); }
    setLoading(false);
  }

  async function handleDelete(member) {
    if (!window.confirm(`${member['성명']} 회원을 삭제하시겠습니까?`)) return;
    const res = await deleteMember(sheetType, member['행번호']);
    if (res.success) fetchMembers();
    else alert(res.message);
  }

  const normalMembers  = members.filter(m => m['상태'] === '정상');
  const waitingMembers = members.filter(m => m['상태'] === '대기');
  const displayList    = activeTab === '정상' ? normalMembers : waitingMembers;

  const allPrograms = ['전체', ...new Set(
    members.flatMap(m => (m[programKey] || '').split(',').map(p => p.trim()).filter(Boolean))
  )];

  const filtered = displayList.filter(m => {
    const matchSearch  = !search || m['성명']?.includes(search) || m['연락처']?.includes(search);
    const matchProgram = filterProgram === '전체' || (m[programKey] || '').includes(filterProgram);
    return matchSearch && matchProgram;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div style={{ background: headerBg }} className="px-4 pb-3">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 py-4">
            <button onClick={() => navigate('home')} className="text-white text-xl p-1">‹</button>
            <div className="flex-1">
              <p className="text-xs text-white opacity-60">{isSocial ? 'Social Education' : 'Senior University'}</p>
              <h1 className="text-white font-bold text-lg leading-tight">{title}</h1>
            </div>
            <button onClick={() => navigate('programManage', { sheetType })}
              className="text-xs bg-white bg-opacity-20 text-white px-3 py-1.5 rounded-lg">
              프로그램 관리
            </button>
          </div>

          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="이름 또는 연락처로 검색"
            className="w-full rounded-xl px-4 py-3 text-sm bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 outline-none mb-2" />

          <div className="flex gap-2 overflow-x-auto pb-1">
            {allPrograms.slice(0, 10).map(p => (
              <button key={p} onClick={() => setFilterProgram(p)}
                className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                  filterProgram === p ? 'bg-white text-gray-800' : 'bg-white bg-opacity-20 text-white'
                }`}>{p}</button>
            ))}
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className="max-w-3xl mx-auto">
        <div className="flex bg-white border-b border-gray-200 shadow-sm">
          {[
            { key: '정상', label: '정상 회원', count: normalMembers.length, color: isSocial ? '#1e40af' : '#065f46' },
            { key: '대기', label: '대기자', count: waitingMembers.length, color: '#d97706', alert: waitingMembers.length > 0 },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="flex-1 py-3.5 text-sm font-semibold flex items-center justify-center gap-2 transition-all border-b-2"
              style={{ borderColor: activeTab === tab.key ? tab.color : 'transparent', color: activeTab === tab.key ? tab.color : '#9ca3af' }}>
              {tab.label}
              <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                style={{ background: activeTab === tab.key ? (tab.alert ? '#fef3c7' : '#f0f9ff') : '#f3f4f6',
                         color: activeTab === tab.key ? tab.color : '#9ca3af' }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-500">
            {activeTab === '대기' ? '대기자' : '회원'} <strong className="text-gray-800">{filtered.length}</strong>명
          </p>
          <div className="flex gap-2">
            {activeTab === '대기' && (
              <button onClick={() => navigate('waitlist', { sheetType })}
                className="text-xs font-semibold px-4 py-2 rounded-xl border-2"
                style={{ borderColor: '#d97706', color: '#d97706' }}>
                대기자 전체 관리
              </button>
            )}
            <button
              onClick={() => navigate(isSocial ? 'social' : 'senior', {
                editMember: null,
                defaultStatus: activeTab === '대기' ? '대기' : '정상',
              })}
              style={{ background: headerBg }}
              className="text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md active:scale-95 transition-transform">
              + {activeTab === '대기' ? '대기 접수' : '신규 등록'}
            </button>
          </div>
        </div>

        {loading && <div className="text-center py-16 text-gray-400"><p className="text-4xl animate-spin">⟳</p><p className="mt-3">불러오는 중...</p></div>}
        {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm text-center">{error}<button onClick={fetchMembers} className="block mx-auto mt-2 underline text-xs">다시 시도</button></div>}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">{activeTab === '대기' ? '⏳' : '📋'}</div>
            <p className="font-medium">{activeTab === '대기' ? '대기자가 없습니다' : '등록된 회원이 없습니다'}</p>
          </div>
        )}

        <div className="space-y-3">
          {filtered.map((member, idx) => (
            <div key={idx}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 cursor-pointer active:bg-gray-50 transition-colors"
              onClick={() => setSelectedMember(member)}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-gray-800 text-base">{member['성명']}</span>
                    <span className="text-xs text-gray-400">{member['성별']}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      member['상태'] === '정상' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>{member['상태']}</span>
                    {member['특이사항'] && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 font-medium">📝 특이사항</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{member['연락처']} · {member['주소(동)']}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{member['생년월일']}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(member[programKey] || '').split(',').filter(Boolean).map((p, i) => (
                      <span key={i}
                        style={{ background: isSocial ? '#eff6ff' : '#ecfdf5', color: isSocial ? '#1d4ed8' : '#047857' }}
                        className="text-xs px-2 py-0.5 rounded-full font-medium">{p.trim()}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 ml-3" onClick={e => e.stopPropagation()}>
                  <button onClick={() => navigate(isSocial ? 'social' : 'senior', { editMember: member })}
                    className="text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg font-medium">수정</button>
                  <button onClick={() => handleDelete(member)}
                    className="text-xs bg-red-50 text-red-500 px-3 py-2 rounded-lg font-medium">삭제</button>
                </div>
              </div>
              <p className="text-xs text-gray-300 mt-2">등록일: {member['등록일']}</p>
            </div>
          ))}
        </div>
      </div>

      {selectedMember && (
        <MemberDetailModal
          member={selectedMember}
          sheetType={sheetType}
          onClose={() => setSelectedMember(null)}
          onUpdate={() => { fetchMembers(); setSelectedMember(null); }}
        />
      )}
    </div>
  );
}
