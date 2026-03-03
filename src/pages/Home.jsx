export default function Home({ navigate }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #0d6b8c 100%)' }}>
      {/* 헤더 */}
      <header className="py-10 px-6 text-center">
        <div className="inline-block bg-white bg-opacity-10 rounded-2xl px-8 py-4 mb-2">
          <p className="text-blue-200 text-sm font-medium tracking-widest uppercase">Gangdong Welfare Center</p>
          <h1 className="text-white text-3xl font-bold tracking-tight mt-1">강동종합사회복지관</h1>
          <p className="text-blue-100 text-base mt-1">이용자 회원 등록 시스템</p>
        </div>
      </header>

      {/* 사업 선택 */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-16 gap-6">
        <p className="text-blue-200 text-sm tracking-wide mb-2">사업을 선택하세요</p>

        {/* 사회교육 */}
        <button
          onClick={() => navigate('memberList', { sheetType: 'social' })}
          className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden group transition-transform active:scale-95"
        >
          <div className="h-2 bg-blue-500" />
          <div className="p-7 flex items-center gap-5">
            <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center text-3xl flex-shrink-0">🎭</div>
            <div className="text-left">
              <p className="text-xs text-blue-400 font-semibold tracking-wide uppercase mb-0.5">Social Education</p>
              <h2 className="text-xl font-bold text-gray-800">사회교육 프로그램</h2>
              <p className="text-sm text-gray-500 mt-0.5">발레 · 댄스 · 기타 · 미술</p>
            </div>
            <div className="ml-auto text-gray-300 text-2xl">›</div>
          </div>
        </button>

        {/* 노인대학 */}
        <button
          onClick={() => navigate('memberList', { sheetType: 'senior' })}
          className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden group transition-transform active:scale-95"
        >
          <div className="h-2 bg-emerald-500" />
          <div className="p-7 flex items-center gap-5">
            <div className="w-16 h-16 rounded-xl bg-emerald-50 flex items-center justify-center text-3xl flex-shrink-0">🎓</div>
            <div className="text-left">
              <p className="text-xs text-emerald-400 font-semibold tracking-wide uppercase mb-0.5">Senior University</p>
              <h2 className="text-xl font-bold text-gray-800">노인대학 청춘캠퍼스</h2>
              <p className="text-sm text-gray-500 mt-0.5">한글 · 영어 · 디지털 · 체조</p>
            </div>
            <div className="ml-auto text-gray-300 text-2xl">›</div>
          </div>
        </button>
      </main>

      <footer className="text-center text-blue-300 text-xs pb-8">
        © 2026 강동종합사회복지관
      </footer>
    </div>
  );
}
