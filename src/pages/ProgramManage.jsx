import { useState, useEffect } from 'react';
import { getPrograms, addProgram, deleteProgram } from '../utils/api';

export default function ProgramManage({ navigate, sheetType }) {
  const [programs, setPrograms] = useState([]);
  const [newProgram, setNewProgram] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const isSocial = sheetType === 'social';
  const headerBg = isSocial ? '#1e40af' : '#065f46';
  const title = isSocial ? '사회교육 프로그램 관리' : '노인대학 프로그램 관리';

  useEffect(() => { fetchPrograms(); }, []);

  async function fetchPrograms() {
    setLoading(true);
    const res = await getPrograms(sheetType);
    if (res.success) setPrograms(res.data);
    setLoading(false);
  }

  async function handleAdd() {
    const name = newProgram.trim();
    if (!name) return;
    setAdding(true);
    const res = await addProgram(sheetType, name);
    if (res.success) {
      setNewProgram('');
      await fetchPrograms();
    } else {
      alert(res.message);
    }
    setAdding(false);
  }

  async function handleDelete(name) {
    if (!window.confirm(`"${name}" 프로그램을 삭제하시겠습니까?`)) return;
    const res = await deleteProgram(sheetType, name);
    if (res.success) fetchPrograms();
    else alert(res.message);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div style={{ background: headerBg }} className="px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => navigate('memberList', { sheetType })} className="text-white text-xl">‹</button>
          <h1 className="text-white font-bold text-lg">{title}</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* 추가 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
          <h2 className="font-bold text-gray-700 mb-3">신규 프로그램 추가</h2>
          <div className="flex gap-2">
            <input
              value={newProgram}
              onChange={e => setNewProgram(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="프로그램명 입력"
              className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-blue-400"
            />
            <button onClick={handleAdd} disabled={adding || !newProgram.trim()}
              style={{ background: headerBg }}
              className="text-white px-5 py-3 rounded-xl font-semibold text-sm disabled:opacity-50">
              추가
            </button>
          </div>
        </div>

        {/* 목록 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-bold text-gray-700 mb-3">등록된 프로그램 ({programs.length}개)</h2>
          {loading ? (
            <div className="text-center py-8 text-gray-400">불러오는 중...</div>
          ) : (
            <div className="space-y-2">
              {programs.map((p, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-700 font-medium">{p}</span>
                  <button onClick={() => handleDelete(p)}
                    className="text-xs text-red-400 hover:text-red-600 font-medium px-2 py-1">
                    삭제
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
