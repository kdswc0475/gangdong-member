// 노인대학 신청서 PDF 양식
export default function SeniorPdfTemplate({ data, sig1 }) {
  const lifeOptions = ['일반', '기초생활수급', '차상위', '국가유공자', '기타'];
  const livingOptions = ['노인부부', '1인가구', '직계가족', '친척', '기타'];
  const programs = Array.isArray(data.희망수업) ? data.희망수업 : [];

  const allPrograms = [
    '한글교실(초급1반)', '한글교실(초급2반)', '한글교실(상급반)',
    '영어교실(초급)', '영어교실(중급)',
    '디지털 역량 교육(초급)', '디지털 역량 교육(중급)',
    '맷돌체조', '실버요가1', '실버요가2', '노래교실',
    ...(data.extraPrograms || []),
  ];

  return (
    <div id="senior-pdf" style={{
      width: '210mm', minHeight: '297mm', padding: '15mm 15mm',
      fontFamily: '\'Malgun Gothic\', \'Apple SD Gothic Neo\', sans-serif',
      fontSize: '10pt', color: '#000', background: '#fff',
      boxSizing: 'border-box', lineHeight: 1.4,
    }}>
      {/* 제목 */}
      <div style={{ textAlign: 'center', marginBottom: '8mm' }}>
        <h1 style={{ fontSize: '16pt', fontWeight: 'bold', letterSpacing: '0.3em', margin: 0 }}>
          회 원 등 록 신 청 서
        </h1>
      </div>

      {/* 일반사항 */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '4mm' }}>
        <tbody>
          <tr>
            <td rowSpan={5} style={thStyle({ width: '12mm', writingMode: 'vertical-rl', textAlign: 'center' })}>
              일<br/>반<br/>사<br/>항
            </td>
            <td style={tdLabelStyle()}>성 명</td>
            <td style={tdValueStyle()}>{data.성명}</td>
            <td style={tdLabelStyle()}>성 별</td>
            <td style={tdValueStyle()}>
              □ 남 {data.성별 === '남' ? '✓' : ''} &nbsp;&nbsp; □ 여 {data.성별 === '여' ? '✓' : ''}
            </td>
          </tr>
          <tr>
            <td style={tdLabelStyle()}>주 소</td>
            <td colSpan={3} style={tdValueStyle()}>
              {data['주소(동)']} <span style={{ color: '#888', fontSize: '9pt' }}>(강동구)</span>
            </td>
          </tr>
          <tr>
            <td style={tdLabelStyle()}>연락처</td>
            <td style={tdValueStyle()}>{data.연락처}</td>
            <td style={tdLabelStyle()}>비상연락처</td>
            <td style={tdValueStyle()}>{data.비상연락처} (관계: {data.관계})</td>
          </tr>
          <tr>
            <td style={tdLabelStyle()}>생년월일</td>
            <td colSpan={3} style={tdValueStyle()}>{data.생년월일}</td>
          </tr>
          <tr>
            <td style={tdLabelStyle()}>생활구분</td>
            <td colSpan={3} style={tdValueStyle()}>
              {lifeOptions.map(opt => (
                <span key={opt} style={{ marginRight: '6mm' }}>
                  □ {opt} {data.생활구분 === opt ? '✓' : ''}
                </span>
              ))}
            </td>
          </tr>
        </tbody>
      </table>

      {/* 참고사항 */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '4mm' }}>
        <tbody>
          <tr>
            <td rowSpan={2} style={thStyle({ width: '12mm', writingMode: 'vertical-rl', textAlign: 'center' })}>
              참<br/>고<br/>사<br/>항
            </td>
            <td style={tdLabelStyle()}>동거상태</td>
            <td colSpan={3} style={tdValueStyle()}>
              {livingOptions.map(opt => (
                <span key={opt} style={{ marginRight: '6mm' }}>
                  □ {opt} {data.동거상태 === opt ? '✓' : ''}
                </span>
              ))}
              {data.동거상태 === '기타' && <span>({data.동거상태기타})</span>}
            </td>
          </tr>
          <tr>
            <td style={tdLabelStyle()}>희망수업</td>
            <td colSpan={3} style={tdValueStyle()}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2mm 6mm' }}>
                {allPrograms.map(p => (
                  <span key={p}>□ {p} {programs.includes(p) ? '✓' : ''}</span>
                ))}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* 개인정보 동의 */}
      <div style={boxStyle()}>
        <p style={{ fontWeight: 'bold', textAlign: 'center', marginBottom: '2mm' }}>
          &lt;개인정보제공 활용 및 동의서&gt;
        </p>
        <p style={{ fontSize: '9pt', textAlign: 'justify' }}>
          본 신청서는 개인정보 보호법 제 15조에 의거, 평생교육 프로그램 수강 등록을 위해서만 사용되며
          사용 개인정보 항목(성명, 주민등록번호, 전화번호, 주소 등)은 향후 5년간 보유·이용합니다.
          다만 작성자 및 대상자가 동의를 거부할 경우 파기할 수 있으며, 이에 따르는 불이익이 발생할 수 있습니다.
        </p>
        <div style={{ marginTop: '3mm', fontSize: '9pt' }}>
          이 사항에 대하여 동의하십니까?
          <span style={{ marginLeft: '4mm' }}>
            □ 동의함 {data.개인정보동의 ? '✓' : ''}
            &nbsp;&nbsp;&nbsp;
            □ 동의하지 않음 {!data.개인정보동의 ? '✓' : ''}
          </span>
        </div>
      </div>

      {/* 하단 */}
      <div style={{ marginTop: '8mm', textAlign: 'center' }}>
        <p style={{ marginBottom: '3mm' }}>
          상기 본인은 강동복지관 노인대학 "청춘 캠퍼스" 수강 신청서를 제출합니다.
        </p>
        <p style={{ marginBottom: '4mm' }}>2026년 &nbsp;&nbsp;&nbsp;&nbsp; 월 &nbsp;&nbsp;&nbsp;&nbsp; 일</p>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5mm' }}>
          <span>신청인 :</span>
          {sig1 && <img src={sig1} alt="서명" style={{ height: '16mm', border: '1px solid #ccc' }} />}
        </div>
        <p style={{ marginTop: '6mm', fontWeight: 'bold' }}>강동종합사회복지관장 귀하</p>
      </div>
    </div>
  );
}

function thStyle(extra = {}) {
  return { border: '1px solid #000', padding: '2mm 3mm', background: '#f5f5f5', fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle', ...extra };
}
function tdLabelStyle() {
  return { border: '1px solid #000', padding: '2mm 3mm', background: '#f5f5f5', fontWeight: 'bold', textAlign: 'center', whiteSpace: 'nowrap', width: '18mm' };
}
function tdValueStyle() {
  return { border: '1px solid #000', padding: '2mm 3mm', minWidth: '30mm' };
}
function boxStyle() {
  return { border: '1px solid #000', padding: '3mm 4mm', marginBottom: '3mm' };
}
