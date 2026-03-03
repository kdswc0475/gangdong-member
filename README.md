<<<<<<< HEAD
# 강동종합사회복지관 이용자 회원 등록 시스템

## 📁 파일 구성

```
gangdong-welfare/
├── .github/workflows/deploy.yml  ← GitHub Actions 자동 배포
├── Code.gs                        ← Google Apps Script (백엔드)
├── src/
│   ├── App.jsx
│   ├── pages/
│   │   ├── Home.jsx               ← 사업 선택 홈
│   │   ├── SocialEducation.jsx    ← 사회교육 등록
│   │   ├── SeniorUniversity.jsx   ← 노인대학 등록
│   │   ├── MemberList.jsx         ← 회원 조회 (정상/대기 탭)
│   │   ├── WaitlistPage.jsx       ← 대기자 전용 관리
│   │   └── ProgramManage.jsx      ← 프로그램 관리
│   ├── components/
│   │   ├── SignatureCanvas.jsx     ← 터치 서명
│   │   ├── MemberDetailModal.jsx  ← 회원 상세 + 특이사항
│   │   ├── SocialPdfTemplate.jsx  ← 사회교육 신청서
│   │   └── SeniorPdfTemplate.jsx  ← 노인대학 신청서
│   └── utils/
│       ├── api.js / pdf.js / constants.js
├── vite.config.js
└── package.json
```

---

## 🚀 배포 방법 (GitHub Pages + Google Apps Script)

### ① Google Apps Script 배포

1. [script.google.com](https://script.google.com) 접속
2. **새 프로젝트** 생성
3. `Code.gs` 내용 전체 붙여넣기
4. **배포 → 새 배포**
   - 유형: **웹 앱** / 실행계정: **나** / 액세스: **모든 사용자**
5. 웹 앱 URL 복사해두기

---

### ② GitHub 저장소 생성 및 업로드

```bash
cd gangdong-welfare
git init
git add .
git commit -m "초기 커밋"
git remote add origin https://github.com/YOUR_USERNAME/gangdong-welfare.git
git push -u origin main
```

---

### ③ GitHub Secret 설정

저장소 → **Settings → Secrets and variables → Actions → New repository secret**

| Name | Value |
|------|-------|
| `VITE_GAS_URL` | ①에서 복사한 GAS 웹앱 URL |

---

### ④ GitHub Pages 활성화

저장소 → **Settings → Pages → Source: GitHub Actions** 선택 후 저장

---

### ⑤ 배포 확인

- `main` 브랜치 push 시 자동 빌드 & 배포
- 배포 URL: `https://YOUR_USERNAME.github.io/gangdong-welfare/`
- **Actions** 탭에서 진행상황 확인

---

## 📱 PWA 설치

| 기기 | 방법 |
|------|------|
| Android (Chrome) | 메뉴(⋮) → 홈 화면에 추가 |
| iOS (Safari) | 공유(□↑) → 홈 화면에 추가 |
| macOS (Chrome) | 주소창 설치 아이콘(⊕) 클릭 |

---

## ⚙️ 주요 기능

| 기능 | 설명 |
|------|------|
| 회원 등록/수정/삭제 | 사업별 양식 |
| 대기자 접수 | 대기 상태 등록 → 별도 탭 관리 |
| 대기자 승인 | 수동으로 대기→정상 전환 |
| 특이사항 | 내부용 메모 (PDF 미포함) |
| 중복 방지 | 이름+생년월일 중복 경고 |
| 터치 서명 | 태블릿 직접 서명 |
| PDF 출력 | A4 원본 양식 인쇄/저장 |
| 구글 시트 연동 | 실시간 반영 |

---

## 🔄 코드 수정 후 재배포

```bash
git add .
git commit -m "수정 내용"
git push origin main
# GitHub Actions가 자동으로 빌드 & 배포
```
=======
# gangdong-member
강동종합사회복지관 회원 등록 시스템
>>>>>>> 015b8d9980f265e6fc9982d541551db6c34b6faa
