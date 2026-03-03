// 사회교육 신청서 PDF 양식 컴포넌트
export default function SocialPdfTemplate({ data, sig1, sig2, sig3 }) {
  const today = data.신청일 || new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  const programs = Array.isArray(data.신청프로그램) ? data.신청프로그램 : [];

  const allPrograms = [
    '유아발레교실', '유아K-POP댄스', '유아 창의미술',
    '셔플댄스(초급반)', '셔플댄스(중급반)', '벨리댄스',
    '성인통기타', '라인댄스',
    ...(data.extraPrograms || []),
  ];

  const lifeOptions = ['일반', '기초생활수급', '차상위', '국가유공자', '기타'];

  return (
    <div id="social-pdf" style={{
      width: '210mm', minHeight: '297mm', padding: '15mm 15mm',
      fontFamily: '\'Malgun Gothic\', \'Apple SD Gothic Neo\', sans-serif',
      fontSize: '10pt', color: '#000', background: '#fff',
      boxSizing: 'border-box', lineHeight: 1.4,
    }}>
      {/* 제목 */}
      <div style={{ textAlign: 'center', marginBottom: '8mm' }}>
        <h1 style={{ fontSize: '16pt', fontWeight: 'bold', letterSpacing: '0.3em', margin: 0 }}>
          사 회 교 육 회 원 등 록 신 청 서
        </h1>
      </div>

      {/* 일반사항 표 */}
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
            <td colSpan={3} style={tdValueStyle()}>{data['주소(동)']}</td>
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
              {data.생활구분 === '기타' && <span>({data.생활구분기타})</span>}
            </td>
          </tr>
        </tbody>
      </table>

      {/* 신청 프로그램 */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '4mm' }}>
        <tbody>
          <tr>
            <td style={thStyle({ width: '20mm' })}>신청<br/>프로그램</td>
            <td style={{ border: '1px solid #000', padding: '2mm 3mm' }}>
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
          본 신청서는 개인정보 보호법 제 15조에 의거, 사회교육 프로그램 수강 등록 및 대기자 신청, 각종 증명서 발급 등을
          위해서만 사용되며 사용 개인정보 항목(성명, 주민등록번호, 전화번호, 주소 등)은 향후 5년간 보유·이용합니다.
          다만 작성자 및 대상자가 동의를 거부할 경우 파기할 수 있으며, 이에 따르는 불이익이 발생할 수 있습니다.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '3mm', gap: '3mm' }}>
          <span style={{ fontSize: '9pt' }}>(자필) 위 사항에 대해 동의하며, 담당자에게 설명을 들었습니다. 성명 :</span>
          {sig1 && <img src={sig1} alt="서명1" style={{ height: '16mm', border: '1px solid #ccc' }} />}
        </div>
      </div>

      {/* 프로그램 이용 안내 */}
      <div style={boxStyle()}>
        <p style={{ fontWeight: 'bold', textAlign: 'center', marginBottom: '2mm' }}>
          &lt;프로그램 이용 안내&gt;
        </p>
        <ol style={{ fontSize: '9pt', paddingLeft: '4mm', margin: 0, textAlign: 'justify' }}>
          <li style={{ marginBottom: '1mm' }}>수강료 납부는 개강 전 달 말일까지 납부하시기 바랍니다.</li>
          <li style={{ marginBottom: '1mm' }}>수강료 납부 후 개강 전에는 전액 환불이 가능하며, 프로그램이 진행되었을 경우 회기별 단가에 맞춰서 환불하실 수 있습니다. (단, 수업일수가 1/2을 넘을 경우 환불이 불가합니다.)</li>
          <li style={{ marginBottom: '1mm' }}>프로그램 시간 및 장소는 본 기관 사정에 의해 변경될 수 있습니다.</li>
          <li>프로그램에 따라 추가 재료비가 발생할 수 있으며, 신청된 재료비는 환불이 불가하오니 이점 양지하여 주시길 바랍니다. (단, 추가 비용 발생 시 강사와 상의 후 이용자의 결정에 따라 진행되며, 이용자의 단순변심이나 이용자에게 책임이 있는 사유로 인해 추가 비용에 대한 환불은 불가하오니 이점 양지하여 주시길 바랍니다.)</li>
        </ol>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '3mm', gap: '3mm' }}>
          <span style={{ fontSize: '9pt' }}>(자필) 위 사항에 대해 동의하며, 담당자에게 설명을 들었습니다. 성명 :</span>
          {sig2 && <img src={sig2} alt="서명2" style={{ height: '16mm', border: '1px solid #ccc' }} />}
        </div>
      </div>

      {/* 하단 */}
      <div style={{ marginTop: '6mm', textAlign: 'center' }}>
        <p style={{ marginBottom: '3mm' }}>
          상기인은 강동종합사회복지관에서 실시하는<br />
          사회교육프로그램 회원으로 등록하고자 합니다.
        </p>
        <p style={{ marginBottom: '4mm' }}>2026년 &nbsp;&nbsp;&nbsp;&nbsp; 월 &nbsp;&nbsp;&nbsp;&nbsp; 일</p>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5mm' }}>
          <span>신청인 :</span>
          {sig3 && <img src={sig3} alt="서명3" style={{ height: '16mm', border: '1px solid #ccc' }} />}
        </div>
        <p style={{ marginTop: '6mm', fontWeight: 'bold' }}>강동종합사회복지관장 귀하</p>
      </div>
    </div>
  );
}

function thStyle(extra = {}) {
  return {
    border: '1px solid #000', padding: '2mm 3mm',
    background: '#f5f5f5', fontWeight: 'bold',
    textAlign: 'center', verticalAlign: 'middle', ...extra
  };
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
