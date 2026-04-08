# Godaily (갓데일리)

## 프로젝트 개요
- **서비스명**: Godaily (갓데일리) - 개인 전용 일기 웹앱 (모바일 웹 최적화)
- **사용자**: 1명 (본인만 사용)
- **기술 스택**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Supabase (DB + Auth)
- **배포**: Vercel (무료)
- **DB**: Supabase Free Tier

## 디렉토리 구조
```
src/
├── app/                  # Next.js App Router
│   ├── layout.tsx        # 루트 레이아웃
│   ├── page.tsx          # 메인 (일기 목록)
│   ├── login/            # 로그인 페이지
│   ├── write/            # 일기 작성
│   ├── diary/[id]/       # 일기 상세
│   └── api/              # API 라우트
├── components/           # 공통 컴포넌트
├── lib/                  # 유틸리티
│   └── supabase/         # Supabase 클라이언트
└── types/                # TypeScript 타입
```

## 핵심 기능
1. 이메일/비밀번호 로그인 (본인 1명만)
2. 일기 CRUD (작성, 읽기, 수정, 삭제)
3. 날짜별 일기 목록
4. 기분/감정 태그
5. 모바일 최적화 (PWA)

## 개발 규칙
- 모바일 퍼스트 디자인
- 한국어 UI
- 심플하고 가벼운 코드
- Supabase RLS로 보안 처리

## 에이전트
@AGENTS.md

## 환경변수
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase Anonymous Key
