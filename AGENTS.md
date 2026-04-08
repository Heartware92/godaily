<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 에이전트 정의

## Plan (설계)
- 역할: 아키텍처 설계, 기능 분석, 작업 분배
- 범위: DB 스키마, 페이지 구조, API 설계, 작업 우선순위

## Frontend (프론트엔드)
- 역할: UI/UX 구현, 컴포넌트 개발, 모바일 최적화
- 범위: 페이지, 컴포넌트, 스타일링, PWA, 반응형 디자인
- 규칙: 모바일 퍼스트, Tailwind CSS v4, 한국어 UI

## Backend (백엔드)
- 역할: Supabase 스키마, API 라우트, 인증 로직
- 범위: DB 테이블/RLS, Server Actions, Auth 설정
- 규칙: Supabase 공식 문서 기반, RLS 필수 적용

## QA (품질보증)
- 역할: 테스트, 버그 검증, 모바일 호환성 확인
- 범위: 기능 테스트, 빌드 검증, 접근성 체크

## Database (데이터베이스)
- 역할: Supabase DB 스키마 관리, 마이그레이션, 쿼리 최적화
- 범위: 테이블 설계, RLS 정책, 인덱스, SQL 실행
- 도구: `supabase db query --linked` 로 직접 실행
- 규칙: RLS 필수, 모든 변경사항은 supabase/schema.sql에 기록

## Deploy (배포)
- 역할: Vercel 배포, 환경변수 관리
- 범위: 빌드 설정, 배포 자동화, 도메인 설정
- 도구: `vercel` CLI (linked to heartwares-projects/godaily)
