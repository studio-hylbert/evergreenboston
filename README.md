# 보스톤늘푸른교회 — The Evergreen Church of Boston

브루클라인 한인 교회의 정적 웹사이트. Next.js 16(App Router), React 19, Tailwind CSS v4로
만들었고 모든 라우트를 빌드 시점에 미리 렌더링한다.

> **아직 공개 전이다.** 교단 표기와 연락처 등 확인이 남은 항목이 있다.
> `CONTENT-CHECKLIST.md` 참고.

## 실행

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 모든 라우트를 out/ 으로 정적 생성
npm run lint
```

빌드는 유튜브 피드를 네트워크로 읽으므로 인터넷 연결이 필요하다.

## 구조

```
app/
  (site)/[lang]/    ko와 en 두 트리가 빌드 시점에 모두 생성된다
    layout.tsx      <html lang>, 폰트, 헤더/푸터
    page.tsx        홈. 예배 시간과 오시는 길을 최상단에 둔다
    about/ worship/ sermons/ community/ visit/
  (entry)/          / 하나. 언어를 감지해 /ko 또는 /en 으로 보낸다
  sitemap.ts robots.ts
components/         SiteHeader, SiteFooter, LocaleSwitcher, SermonCard,
                    SermonPlayer, PageHeader, Prose, SectionHeading,
                    EvergreenMark
content/            모든 문구와 데이터. 컴포넌트 안에 콘텐츠를 두지 않는다
lib/                i18n.ts, ui.ts, youtube.ts, content.ts, nav.ts,
                    asset.ts, format.ts, site-url.ts
public/images/      임시 이미지. 출처는 IMAGE-CREDITS.md 참고
```

## 콘텐츠 모델

`content/`가 유일한 원본이다. 교회 이름·주소·예배 시간을 코드에 하드코딩하지 않는다.
두 번째 고객이 생겼을 때 이 구조를 그대로 복사해 `content/`만 갈아끼우기 위함이다.

**확인되지 않은 내용은 문구로 채우지 않고 비워 둔다.** "추후 안내 예정" 같은 자리표시 문장은
쓰지 않는다. 값이 없으면 해당 항목 자체가 렌더링되지 않는다.
`content/visit.json`의 `transit`가 빈 배열인 것이 그 예다.

| 파일 | 담는 것 |
| --- | --- |
| `site.json` | 교회명, 미션, 교단, 주소, 연락처, SNS 링크, 유튜브 채널 ID |
| `worship.json` | 예배와 기도회 시간, 오픈카톡 참여코드 |
| `visit.json` | 교통편, 주차, 도착 후 안내 |
| `pages/about.md` | 서술형 문구 (마크다운 + front matter) |

**형식은 의도적으로 CMS 호환이다.** 컬렉션형 문구는 front matter가 있는 마크다운,
단일 값은 JSON으로 둔다. 나중에 교역자가 직접 글을 올려야 하면
Sveltia CMS나 Pages CMS를 `content/`에 연결하기만 하면 되고, 페이지 코드는 그대로 둔다.
지금 CMS를 넣지 않은 이유는 콘텐츠 스키마가 아직 확정되지 않았고,
교역자가 직접 관리할지도 정해지지 않았기 때문이다.

라우팅은 예외다. `lib/nav.ts`의 각 항목은 실제 디렉토리가 있어야 동작하므로,
CMS 편집자가 경로를 바꿔 링크가 깨지는 일이 없도록 코드에 둔다.

## 한국어 / 영어

`/ko`와 `/en` 두 정적 트리를 빌드 시점에 모두 생성한다. 검색엔진은 양쪽을 각각 색인하고,
각 페이지는 자기 자신을 `canonical`로, 같은 페이지의 다른 언어를 `hreflang`으로 가리킨다.

**언어 감지는 브라우저에서 한다.** 정적 export에는 서버가 없어서 `Accept-Language`를
협상할 수 없고, `output: export`에서는 middleware도 동작하지 않는다. 그래서 `/`는
`app/(entry)/page.tsx`가 렌더링하는 얇은 전달 페이지다. 이 페이지는:

1. `localStorage`에 저장된 선택을 먼저 본다 (헤더의 언어 전환 버튼이 기록한다)
2. 없으면 `navigator.languages`를 본다
3. 어느 쪽도 아니면 한국어로 보낸다. 교회가 예배드리는 언어이기 때문이다

리다이렉트 스크립트는 `useEffect`가 아니라 인라인으로 넣는다. 문서를 파싱하는 동안,
React가 hydrate하기 전에 실행되어야 방문자가 전환을 눈치채지 못한다.

JavaScript가 꺼져 있으면 두 언어 링크가 보인다.

### 루트 레이아웃이 둘인 이유

`app/`에는 루트 레이아웃이 두 개 있고, 라우트 그룹으로 나뉘어 있다.

| 그룹 | 담당 | 이유 |
|---|---|---|
| `app/(site)/[lang]/layout.tsx` | 언어 트리 전체 | `<html lang>`을 언어별로 설정해야 한다 |
| `app/(entry)/layout.tsx` | `/` 하나 | 전달 페이지는 헤더·푸터·폰트가 필요 없다 |

공용 루트 레이아웃 하나로는 `<html lang>`을 언어마다 다르게 줄 수 없다.
라우트 그룹은 URL에 나타나지 않으므로 경로는 `/ko`, `/en`, `/` 그대로다.

전달 페이지를 `public/index.html`로 두지 않는 이유는 두 가지다.
`public/` 파일은 **dev 서버의 `/`에서 서빙되지 않아** `npm run dev`가 404가 나고,
Next가 `basePath`를 적용해주지 않아 링크를 상대 경로로 손수 써야 한다.
실제 페이지로 두면 둘 다 자동으로 해결된다.

### `[lang]`은 아무 세그먼트나 잡는다

`app/(site)/[lang]/layout.tsx`에 `dynamicParams = false`가 있다.
없으면 `/visit` 같은 옛 링크가 `lang="visit"`으로 해석되어,
404가 아니라 빌드 실패나 500으로 이어진다.

### 어디에 무엇을 넣는가

| | 무엇 | 어디 |
|---|---|---|
| 교회가 관리 | 예배 시간, 주소, 교회 소개 문구 | `content/` — 값 자체가 `{ "ko": …, "en": … }` |
| 개발자가 관리 | 버튼·메뉴·섹션 제목 | `lib/ui.ts` |

교회 콘텐츠는 한 파일 안에 두 언어를 나란히 둔다. 주소나 시각처럼 언어와 무관한 값은
하나만 두어, 한쪽만 고쳐서 어긋나는 일이 없게 한다.

**설교 제목은 영어 페이지에서도 한국어로 나온다.** 유튜브 업로드 제목이 원본이고,
번역할 대상이 없다.

## 설교 영상 자동 갱신

설교 목록은 채널의 Atom 피드에서 **빌드 시점에** 읽는다.

```
https://www.youtube.com/feeds/videos.xml?channel_id=UC9lLWrlCsGxivAgiSZwb0ag
```

API 키도 할당량도 필요 없다. 넘겨줄 비밀값이 생기지 않는다는 뜻이기도 하다.

- 새 영상은 **다시 빌드해야** 사이트에 나타난다.
  `.github/workflows/deploy.yml`이 **매일 06:00과 18:00 UTC**에 재빌드하므로,
  업로드 후 **최대 12시간** 안에 반영된다.
- 즉시 반영하려면 Actions 탭에서 **Run workflow**를 누른다.

  주기를 이렇게 정한 근거는 실제 업로드 기록이다. 주일예배는 오후 2시(ET)지만
  영상은 정해진 시각에 올라오지 않는다. 피드에 있는 설교 14개를 보면 업로드가
  예배 후 **5.6시간에서 34시간 사이**에 이루어졌고, 시각은 일요일 23시 UTC부터
  화요일 04시 UTC까지 흩어져 있다. 주 1회 실행이었다면 14개 중 4개를 놓쳐
  일주일씩 늦게 반영됐을 것이다. 하루 두 번이면 업로드 습관이 바뀌어도 놓치지 않는다.
- 피드는 **최근 15개**만 준다. 전체 아카이브는 유튜브 채널에 그대로 둔다.
- 제목에서 날짜·제목·설교자를 뽑아내지만, 제목은 사람이 손으로 쓰므로
  **모든 필드가 선택적이다.** 형식이 다른 영상은 원본 제목 그대로 보여준다.
- 제목에 `주일예배 말씀`이 있으면 설교, 없으면 '교회 영상'으로 분류한다.
- 피드 요청이 실패하면 **빌드가 중단된다.** 빈 목록을 올리는 대신
  직전에 배포된 사이트가 그대로 남는다.

> **주의:** GitHub은 60일간 활동이 없는 저장소의 예약 워크플로를 자동으로 끈다.
> 사이트가 오래 방치되면 설교 목록 갱신이 멈출 수 있다.

## 배포

`main`에 푸시하면 `.github/workflows/deploy.yml`이 lint → build → 배포까지 수행한다.
손으로 실행할 것은 없다.

저장소에 적어두지 않고 환경에서 받는 값이 둘 있다.

| 변수 | 용도 |
| --- | --- |
| `NEXT_PUBLIC_BASE_PATH` | 사이트가 서비스되는 하위 경로. 조직의 프로젝트 저장소는 `/<repo>`에서 서비스되므로 이 값이 맞지 않으면 모든 에셋이 404가 난다 |
| `NEXT_PUBLIC_SITE_URL` | `sitemap.xml`과 Open Graph 태그의 정식 주소 |

둘 다 `actions/configure-pages`가 채우므로 저장소에 중복해 적지 않는다.
나중에 교회 도메인으로 옮길 때도 저장소 Pages 설정만 바꾸면 되고 코드는 그대로다.

배포된 빌드를 로컬에서 재현하려면:

```bash
NEXT_PUBLIC_BASE_PATH=/evergreenboston \
NEXT_PUBLIC_SITE_URL=https://studio-hylbert.github.io/evergreenboston \
  npm run build
npx serve out
```

`npm run dev`는 두 변수 없이 `/`에서 서비스한다.

정적 export가 기대는 두 가지:

- `public/.nojekyll` — GitHub Pages가 출력물을 Jekyll로 처리하지 않게 한다.
  없으면 밑줄로 시작하는 `_next` 디렉토리가 통째로 사라진다.
- `trailingSlash: true` — `worship.html`이 아니라 `worship/index.html`을 만들어,
  라우팅이 확장자 폴백에 의존하지 않게 한다.

## 이미지

정적 export에는 이미지 최적화기가 없다(`images.unoptimized`). 따라서 이미지는
**서비스되는 크기로 미리 만들어** 저장한다. 히어로와 건물 사진은 `next/image`가 아니라
`<picture>`로 작성했다. 뷰포트마다 정확히 한 파일만 내려받게 하기 위함이다.

유튜브 썸네일은 저장소에 복사하지 않고 `i.ytimg.com`에서 바로 가져온다.
영상이 교체되어도 썸네일이 낡지 않는다.

현재 이미지는 전부 임시다. 출처와 라이선스, 교체 대상은 `IMAGE-CREDITS.md`에 있다.
`church-*.jpg` 두 장은 **CC BY-SA 4.0**이라 `/visit` 페이지에 출처를 표기하고 있다.
교회에서 직접 찍은 사진으로 바꾸면 이 표기는 지워도 된다.

## 개인정보

방문자가 아무것도 누르지 않으면 외부로 나가는 요청이 없도록 했다.

- 웹폰트는 빌드 시점에 내려받아 **자체 호스팅**한다. 구글로 요청이 가지 않는다.
- 설교 영상은 **클릭해야** 재생된다. 재생 시에도 `youtube-nocookie.com`을 쓴다.
- 페이스북 타임라인은 임베드하지 않고 링크만 둔다.

## 남은 일

`CONTENT-CHECKLIST.md` 참고. 요약하면:

1. 미검증 문구 확인 (0번 항목) — 공개 전 필수
2. 교회 실물 사진으로 교체
3. 교역자 정보 추가 (`content/staff.json`)
4. 교통편·주차 안내 확정
5. 도메인과 콘텐츠 관리 주체 결정
