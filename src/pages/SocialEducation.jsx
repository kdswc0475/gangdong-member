import { useState, useRef, useEffect } from 'react';
import SignatureCanvas from '../components/SignatureCanvas';
import SocialPdfTemplate from '../components/SocialPdfTemplate';
import { DISTRICTS, LIFE_STATUS } from '../utils/constants';
import { addMember, updateMember, checkDuplicate, getPrograms } from '../utils/api';
import { savePDF, printPDF } from '../utils/pdf';

export default function SocialEducation({ navigate, editMember, defaultStatus = '정상' }) {
  const isEdit = !!editMember;

  const [form, setForm] = useState({
    성명: '', 성별: '', '주소(동)': '', 연락처: '', 비상연락처: '', 관계: '',
    생년월일: '', 생활구분: '', 신청프로그램: [], 개인정보동의: false, 이용안내동의: false,
    상태: defaultStatus, 특이사항: '',
  });

  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const [pdfSigs, setPdfSigs] = useState({ sig1: null, sig2: null, sig3: null });
  const [errors, setErrors] = useState({});

  const sig1Ref = useRef();
  const sig2Ref = useRef();
  const sig3Ref = useRef();

  useEffect(() => {
    loadPrograms();
    if (isEdit) {
      const progs = (editMember['신청프로그램'] || '').split(',').map(p => p.trim()).filter(Boolean);
      setForm({
        성명: editMember['성명'] || '',
        성별: editMember['성별'] || '',
        '주소(동)': editMember['주소(동)'] || '',
        연락처: editMember['연락처'] || '',
        비상연락처: editMember['비상연락처'] || '',
        관계: editMember['관계'] || '',
        생년월일: editMember['생년월일'] || '',
        생활구분: editMember['생활구분'] || '',
        신청프로그램: progs,
        개인정보동의: editMember['개인정보동의'] === '동의',
        이용안내동의: editMember['이용안내동의'] === '동의',
        상태: editMember['상태'] || '정회원',
        특이사항: editMember['기타사항'] || editMember['특이사항'] || '',
      });
    }
  }, []);

  async function loadPrograms() {
    const res = await getPrograms('social');
    if (res.success) setPrograms(res.data);
  }

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const toggleProgram = (p) => setForm(f => ({
    ...f,
    신청프로그램: f.신청프로그램.includes(p) ? f.신청프로그램.filter(x => x !== p) : [...f.신청프로그램, p],
  }));

  function validate() {
    const e = {};
    if (!form.성명.trim()) e.성명 = '성명을 입력하세요';
    if (!form.성별) e.성별 = '성별을 선택하세요';
    if (!form['주소(동)']) e['주소(동)'] = '주소를 선택하세요';
    if (!form.연락처.trim()) e.연락처 = '연락처를 입력하세요';
    if (!form.생년월일.trim()) e.생년월일 = '생년월일을 입력하세요';
    if (!form.생활구분) e.생활구분 = '생활구분을 선택하세요';
    if (form.신청프로그램.length === 0) e.신청프로그램 = '프로그램을 선택하세요';
    if (!form.개인정보동의) e.개인정보동의 = '개인정보 동의가 필요합니다';
    if (!form.이용안내동의) e.이용안내동의 = '이용안내 동의가 필요합니다';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(withPdf = false) {
    if (!validate()) return;
    if (!isEdit) {
      if (sig1Ref.current?.isEmpty()) { alert('개인정보 동의 서명을 해주세요'); return; }
      if (sig2Ref.current?.isEmpty()) { alert('이용안내 동의 서명을 해주세요'); return; }
      if (sig3Ref.current?.isEmpty()) { alert('신청인 서명을 해주세요'); return; }
    }
    setLoading(true);

    try {
      console.log('📝 [DEBUG] Registration Start - withPdf:', withPdf);
      if (!isEdit) {
        console.log('🔍 [DEBUG] Checking for duplicate...');
        const dupRes = await checkDuplicate('social', form.성명, form.생년월일);
        console.log('🔍 [DEBUG] Duplicate Check Result:', dupRes);
        if (dupRes.isDuplicate) {
          if (!window.confirm('동일 이름+생년월일 회원이 이미 있습니다. 그래도 등록하시겠습니까?')) {
            setLoading(false); return;
          }
        }
      }

      console.log('📦 [DEBUG] Preparing data payload...', form);
      const data = {
        ...form,
        신청프로그램: form.신청프로그램.join(', '),
        개인정보동의: form.개인정보동의 ? '동의' : '미동의',
        이용안내동의: form.이용안내동의 ? '동의' : '미동의',
        기타사항: form.특이사항, // 필드명 통일 (특이사항 -> 기타사항)
      };
      delete data.특이사항;

      console.log('🚀 [DEBUG] Sending Member Data...', data);
      const res = isEdit
        ? await updateMember('social', editMember['행번호'], data)
        : await addMember('social', data);

      console.log('📡 [DEBUG] Member Action Result:', res);

      if (res.success) {
        if (!isEdit) {
          if (withPdf) {
            setPdfSigs({
              sig1: sig1Ref.current?.toDataURL(),
              sig2: sig2Ref.current?.toDataURL(),
              sig3: sig3Ref.current?.toDataURL(),
            });
            setShowPdf(true);
          } else {
            alert('등록이 완료되었습니다.');
            navigate('memberList', { sheetType: 'social' });
          }
        } else {
          alert('수정되었습니다.');
          navigate('memberList', { sheetType: 'social' });
        }
      } else {
        alert(res.message || '오류가 발생했습니다.');
      }
    } catch (err) {
      console.error(err);
      alert('통신 중 오류가 발생했습니다. 네트워크 상태를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  }

  if (showPdf) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex gap-3">
          <button onClick={() => navigate('memberList', { sheetType: 'social' })}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold">목록으로</button>
          <button onClick={() => printPDF('social-pdf')}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold">🖨️ 인쇄</button>
          <button onClick={() => savePDF('social-pdf', `사회교육_${form.성명}_신청서.pdf`)}
            className="flex-1 py-3 bg-blue-800 text-white rounded-xl font-semibold">💾 저장</button>
        </div>
        <div className="overflow-auto">
          <SocialPdfTemplate
            data={{ ...form, 신청프로그램: form.신청프로그램 }}
            sig1={pdfSigs.sig1}
            sig2={pdfSigs.sig2}
            sig3={pdfSigs.sig3}
            allPrograms={programs}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-800 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => navigate('memberList', { sheetType: 'social' })} className="text-white text-xl">‹</button>
          <div>
            <p className="text-blue-300 text-xs">Social Education</p>
            <h1 className="text-white font-bold text-lg">{isEdit ? '회원 정보 수정' : '사회교육 회원 등록'}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        <Section title="일반사항">
          <Field label="성명" error={errors.성명} required>
            <input value={form.성명} onChange={e => set('성명', e.target.value)} className={inp(errors.성명)} placeholder="홍길동" />
          </Field>
          <Field label="성별" error={errors.성별} required>
            <div className="flex gap-3">
              {['남', '여'].map(g => (
                <button key={g} onClick={() => set('성별', g)}
                  className={`flex-1 py-3 rounded-xl font-semibold border-2 transition-all ${form.성별 === g ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-600'}`}>{g}</button>
              ))}
            </div>
          </Field>
          <Field label="거주지(동)" error={errors['주소(동)']} required>
            <select value={form['주소(동)']} onChange={e => set('주소(동)', e.target.value)} className={inp(errors['주소(동)'])}>
              <option value="">선택하세요</option>
              {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="연락처" error={errors.연락처} required>
            <input value={form.연락처} onChange={e => set('연락처', e.target.value)} className={inp(errors.연락처)} placeholder="010-0000-0000" type="tel" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="비상연락처">
              <input value={form.비상연락처} onChange={e => set('비상연락처', e.target.value)} className={inp()} placeholder="010-0000-0000" type="tel" />
            </Field>
            <Field label="관계">
              <input value={form.관계} onChange={e => set('관계', e.target.value)} className={inp()} placeholder="배우자" />
            </Field>
          </div>
          <Field label="생년월일" error={errors.생년월일} required>
            <input value={form.생년월일} onChange={e => set('생년월일', e.target.value)} className={inp(errors.생년월일)} type="date" />
          </Field>
          <Field label="생활구분" error={errors.생활구분} required>
            <select value={form.생활구분} onChange={e => set('생활구분', e.target.value)} className={inp(errors.생활구분)}>
              <option value="">선택하세요</option>
              {LIFE_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="회원 상태">
            <select value={form.상태} onChange={e => set('상태', e.target.value)} className={inp()}>
              {['정회원', '대기'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </Section>

        <Section title="신청 프로그램" error={errors.신청프로그램}>
          <div className="flex flex-wrap gap-2">
            {programs.map(p => (
              <button key={p} onClick={() => toggleProgram(p)}
                className={`px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all ${form.신청프로그램.includes(p) ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-600'
                  }`}>
                {form.신청프로그램.includes(p) ? '✓ ' : ''}{p}
              </button>
            ))}
          </div>
        </Section>

        <Section title="동의사항">
          {[
            { key: '개인정보동의', label: '개인정보 수집·이용 동의 (필수)', desc: '개인정보 보호법 제15조에 의거 5년간 보유·이용됩니다' },
            { key: '이용안내동의', label: '프로그램 이용안내 동의 (필수)', desc: '수강료 환불 규정 및 이용 안내사항에 동의합니다' },
          ].map(({ key, label, desc }) => (
            <div key={key}>
              <label className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-200 cursor-pointer">
                <input type="checkbox" checked={form[key]} onChange={e => set(key, e.target.checked)} className="mt-0.5 w-5 h-5 accent-blue-600" />
                <div><p className="font-semibold text-sm text-gray-800">{label}</p><p className="text-xs text-gray-500 mt-0.5">{desc}</p></div>
              </label>
              {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
            </div>
          ))}
        </Section>

        {!isEdit && (
          <Section title="서명">
            {[
              { ref: sig1Ref, label: '① 개인정보 동의 서명' },
              { ref: sig2Ref, label: '② 프로그램 이용안내 동의 서명' },
              { ref: sig3Ref, label: '③ 신청인 서명' },
            ].map(({ ref, label }) => (
              <div key={label}>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium text-gray-700">{label}</p>
                  <button onClick={() => ref.current?.clear()} className="text-xs text-gray-400 underline">지우기</button>
                </div>
                <SignatureCanvas ref={ref} height={80} />
              </div>
            ))}
          </Section>
        )}

        <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5">
          <h2 className="font-bold text-amber-700 text-base mb-3">📝 기타사항</h2>
          <textarea
            value={form.특이사항}
            onChange={e => set('특이사항', e.target.value)}
            placeholder="기타사항을 입력하세요"
            rows={3}
            className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2.5 text-sm outline-none resize-none focus:border-amber-400 placeholder-gray-300"
          />
        </div>

        {isEdit ? (
          <button onClick={() => handleSubmit(false)} disabled={loading}
            className="w-full py-4 bg-blue-700 text-white font-bold text-lg rounded-2xl shadow-lg active:scale-95 transition-transform disabled:opacity-60">
            {loading ? '처리 중...' : '수정 완료'}
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleSubmit(false)} disabled={loading}
              className="py-4 bg-gray-600 text-white font-bold text-base rounded-2xl shadow-lg active:scale-95 transition-transform disabled:opacity-60">
              {loading ? '처리 중...' : '등록 완료'}
            </button>
            <button onClick={() => handleSubmit(true)} disabled={loading}
              className="py-4 bg-blue-700 text-white font-bold text-base rounded-2xl shadow-lg active:scale-95 transition-transform disabled:opacity-60">
              {loading ? '처리 중...' : '신청서 출력'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children, error }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h2 className="font-bold text-gray-700 text-base mb-4 pb-2 border-b border-gray-100">{title}</h2>
      {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
      <div className="space-y-3">{children}</div>
    </div>
  );
}
function Field({ label, children, error, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
function inp(error) {
  return `w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors ${error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-blue-400 focus:bg-white'}`;
}
