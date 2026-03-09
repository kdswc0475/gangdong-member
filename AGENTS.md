# AGENTS.md: Central Context Control Tower

## Project Context & Operations
- **Business Goal:** 강동구립 강동종합사회복지관 행정 효율화 및 지역사회 파트너십 관리 시스템 고도화.
- **Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS, Prisma, Shadcn/UI.
- **Operational Commands:**
  - `npm run dev`: 로컬 개발 서버 실행.
  - `npm run build`: 프로덕션 빌드 수행.
  - `npm test`: 전체 단위 및 통합 테스트 실행.
  - `npx prisma studio`: 데이터베이스 관리 GUI 실행.

## Golden Rules
### Immutable
- 모든 보조금 관련 데이터 처리는 '지방보조금 관리 조례' 및 회계 감사 기준(3억 원 이상 필히 확인)을 준수한다.
- 개인정보(복지관 이용자 명단 등)는 절대 클라이언트 로그에 남기지 않으며, 암호화 저장 원칙을 지킨다.
- 외부 API 키 및 DB Credentials는 반드시 .env.local을 통해서만 참조한다.

### Do's
- 복잡한 데이터 변환 로직(Excel 업로드용 formatting 등)은 전용 Utility 함수로 분리하여 테스트 코드를 작성하라.
- UI 컴포넌트는 Accessibility(웹 접근성)를 최우선으로 하며, 고령 사용자를 고려한 가독성을 확보하라.
- API Route 작성 시 예외 처리를 규격화하여 일관된 에러 응답을 반환하라.
- 한글 인코딩 및 바이트(Byte) 계산(LENB 대응) 시 정확한 인코딩 기준을 적용하라.

### Don'ts
- 컴포넌트 내부에 비즈니스 로직을 하드코딩하지 마라.
- 외부 라이브러리 추가 전 반드시 기존 스택(Shadcn/UI, Lucide 등)으로 구현 가능한지 확인하라.
- 서버 사이드 로직에서 'use client' 지시어를 남용하지 마라.
- 원본 데이터를 직접 수정(Mutation)하지 말고, 항상 불변성을 유지하여 새로운 객체를 반환하라.

## Standards & References
- **Naming:** PascalCase for Components, camelCase for variables/functions, kebab-case for files.
- **Git Strategy:** Feature Branch -> Pull Request -> Squash & Merge (Main).
- **Commit Message:** feat:, fix:, docs:, refactor:, test: 접두사 필수 사용.
- **Maintenance Policy:** 코드와 본 규칙 간의 괴리 발생 시, 즉시 AGENTS.md 업데이트를 제안하고 컨텍스트를 동기화하라.

## Context Map (Action-Based Routing)
- **[서버 로직 및 API 설계 (BE)](./app/api/AGENTS.md)** — 보조금 정산, 데이터 처리 및 외부 시스템 연동 로직 수정 시.
- **[UI/UX 프런트엔드 (FE)](./components/AGENTS.md)** — 공통 컴포넌트, 복지관 특화 대시보드 및 스타일링 작업 시.
- **[데이터 모델링 및 DB (Schema)](./prisma/AGENTS.md)** — 스키마 변경, 마이그레이션 및 쿼리 최적화 필요 시.
- **[데이터 유틸리티 (Excel/Format)](./lib/utils/AGENTS.md)** — 대량 명단 처리, 엑셀 업로드 포맷팅 및 복잡한 계산식 수정 시.
- **[비즈니스 도메인 규칙 (Social Welfare)](./constants/AGENTS.md)** — 복지관 행정 규칙, 보조금 코드(307-11 등) 및 사업 지침 참조 시.

## Data Utility Implementation Patterns (lib/utils)
- **Role:** 복지관 행정 시스템의 대량 데이터 처리 및 외부 시스템(사회복지시설정보시스템 등) 연동 포맷팅 전담.
- **Excel Logic:** IF, LEFT, LENB, REPT 등 Excel 함수를 TypeScript로 구현 시 전용 유틸 함수로 캡슐화하고 `format-*.ts`로 명명하라.
- **Validation:** 데이터 변환 전 반드시 스키마 검증(Zod)을 수행하며, 검증 로직은 `validate-*.ts`로 명명하라.
- **Testing:** 모든 포맷팅 유틸리티는 Edge Case(빈 문자열, 특수 기호 등)를 포함하여 `npm test lib/utils`로 검증하라.