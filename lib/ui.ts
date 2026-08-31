import type { Locale, Localized } from "./i18n";

/**
 * Interface chrome: button labels, section headings, and the like.
 *
 * These live in code rather than in `content/`, because they belong to the
 * template rather than to the church. What the church maintains — service
 * times, the address, the copy on /about — is in `content/`, and a CMS pointed
 * there should not be able to rename a button.
 */
type UiStrings = {
  nav: { about: string; worship: string; sermons: string; community: string; visit: string };
  header: { openMenu: string; closeMenu: string; mainMenu: string };
  home: {
    visitCta: string;
    sermonsCta: string;
    sundayLabel: string;
    locationLabel: string;
    firstTimeLabel: string;
    firstTimeCta: string;
    sermonsEyebrow: string;
    sermonsTitle: string;
    sermonsDescription: string;
    viewAll: string;
    gatherEyebrow: string;
    gatherTitle: string;
    gatherDescription: string;
    followHere: string;
  };
  worship: {
    title: string;
    description: string;
    recordedBadge: string;
    watchPast: string;
    joinZoom: string;
    askHowToJoin: string;
  };
  sermons: {
    title: string;
    description: string;
    latest: string;
    past: string;
    other: string;
    archivePrefix: string;
    archiveLink: string;
    archiveSuffix: string;
    play: string;
  };
  community: {
    title: string;
    description: string;
    followTitle: string;
    followDescription: string;
    kakaoName: string;
    kakaoMeta: (code: string) => string;
    kakaoDescription: string;
    kakaoCta: string;
    stravaName: string;
    stravaDescription: string;
    stravaCta: string;
    calendarName: string;
    calendarDescription: string;
    calendarCta: string;
    dawnCta: string;
    dawnAskCta: string;
  };
  visit: {
    title: string;
    description: string;
    addressLabel: string;
    mapCta: string;
    timeLabel: string;
    placeLabel: string;
    phoneLabel: string;
    buildingAlt: string;
  };
  footer: { visit: string; times: string; browse: string; mapLink: string };
  switcher: { label: string };
};

export const ui: Record<Locale, UiStrings> = {
  ko: {
    nav: { about: "교회 소개", worship: "예배", sermons: "설교 영상", community: "공동체", visit: "찾아오시는 길" },
    header: { openMenu: "메뉴 열기", closeMenu: "메뉴 닫기", mainMenu: "주 메뉴" },
    home: {
      visitCta: "찾아오시는 길",
      sermonsCta: "설교 영상 보기",
      sundayLabel: "주일예배",
      locationLabel: "장소",
      firstTimeLabel: "처음 오시나요",
      firstTimeCta: "오시는 길 안내",
      sermonsEyebrow: "말씀",
      sermonsTitle: "최근 설교",
      sermonsDescription: "주일예배 말씀을 유튜브로 다시 들으실 수 있습니다.",
      viewAll: "전체 보기",
      gatherEyebrow: "함께",
      gatherTitle: "이번 주 함께하는 자리",
      gatherDescription: "주일 외에도 한 주간 함께 모입니다.",
      followHere: "교회 소식은 이곳에서",
    },
    worship: {
      title: "예배",
      description: "온 세대가 함께 예배합니다.",
      recordedBadge: "영상 제공",
      watchPast: "지난 예배 영상 보기",
      joinZoom: "Zoom으로 참여하기",
      askHowToJoin: "참여 방법 문의하기",
    },
    sermons: {
      title: "설교 영상",
      description: "주일예배 말씀은 예배 후 유튜브에 올라옵니다. 여기에서 다시 들으실 수 있습니다.",
      latest: "가장 최근 말씀",
      past: "지난 말씀",
      other: "교회 영상",
      archivePrefix: "더 지난 말씀은 ",
      archiveLink: "유튜브 채널",
      archiveSuffix: "에서 보실 수 있습니다.",
      play: "재생",
    },
    community: {
      title: "공동체",
      description: "주일 외에도 한 주간 함께 모입니다.",
      followTitle: "소식 받아보기",
      followDescription: "교회의 주간 소식과 사진은 인스타그램과 페이스북에도 올라옵니다.",
      kakaoName: "새가족 오픈카톡",
      kakaoMeta: (code) => `참여코드 ${code}`,
      kakaoDescription: "주간 교회 소식을 나누고 궁금한 점을 물어보실 수 있습니다.",
      kakaoCta: "오픈카톡 참여하기",
      stravaName: "늘푸른 Runner's Club",
      stravaDescription: "함께 걷고 달립니다.",
      stravaCta: "클럽 보기",
      calendarName: "사역 캘린더",
      calendarDescription: "한 해의 예배와 행사 일정을 보실 수 있습니다.",
      calendarCta: "캘린더 보기",
      dawnCta: "Zoom으로 참여하기",
      dawnAskCta: "참여 방법 문의하기",
    },
    visit: {
      title: "찾아오시는 길",
      description: "브루클라인 Beacon Street에 있는 All Saints Parish 예배당에서 모입니다.",
      addressLabel: "주소",
      mapCta: "구글 지도에서 길찾기",
      timeLabel: "예배 시간",
      placeLabel: "예배 장소",
      phoneLabel: "연락처",
      buildingAlt: "All Saints Parish 예배당 외관. 아치형 창이 있는 석조 건물이다.",
    },
    footer: { visit: "찾아오시는 길", times: "예배 시간", browse: "둘러보기", mapLink: "지도에서 보기" },
    switcher: { label: "언어" },
  },
  en: {
    nav: { about: "About", worship: "Worship", sermons: "Sermons", community: "Community", visit: "Visit" },
    header: { openMenu: "Open menu", closeMenu: "Close menu", mainMenu: "Main menu" },
    home: {
      visitCta: "How to find us",
      sermonsCta: "Watch sermons",
      sundayLabel: "Sunday worship",
      locationLabel: "Where",
      firstTimeLabel: "First time here",
      firstTimeCta: "How to find us",
      sermonsEyebrow: "Preaching",
      sermonsTitle: "Recent sermons",
      sermonsDescription: "Sunday sermons are posted to YouTube after the service.",
      viewAll: "See all",
      gatherEyebrow: "Together",
      gatherTitle: "Through the week",
      gatherDescription: "We gather during the week as well as on Sunday.",
      followHere: "Where the church posts",
    },
    worship: {
      title: "Worship",
      description: "We worship together as one congregation, all ages in the same room.",
      recordedBadge: "Recorded",
      watchPast: "Watch past services",
      joinZoom: "Join on Zoom",
      askHowToJoin: "Ask how to join",
    },
    sermons: {
      title: "Sermons",
      description:
        "Sunday sermons are uploaded to YouTube after the service. They are preached in Korean.",
      latest: "Most recent",
      past: "Earlier sermons",
      other: "Other videos",
      archivePrefix: "Older sermons are on the ",
      archiveLink: "YouTube channel",
      archiveSuffix: ".",
      play: "Play",
    },
    community: {
      title: "Community",
      description: "We gather during the week as well as on Sunday.",
      followTitle: "Keep in touch",
      followDescription: "Weekly news and photographs are posted to Instagram and Facebook.",
      kakaoName: "Newcomers' KakaoTalk",
      kakaoMeta: (code) => `Join code ${code}`,
      kakaoDescription: "Weekly news, and somewhere to ask a question before you come.",
      kakaoCta: "Join the chat",
      stravaName: "Evergreen Runner's Club",
      stravaDescription: "Walking and running together.",
      stravaCta: "See the club",
      calendarName: "Ministry calendar",
      calendarDescription: "Services and events for the year.",
      calendarCta: "Open the calendar",
      dawnCta: "Join on Zoom",
      dawnAskCta: "Ask how to join",
    },
    visit: {
      title: "Visit",
      description: "We meet at All Saints Parish on Beacon Street in Brookline.",
      addressLabel: "Address",
      mapCta: "Open in Google Maps",
      timeLabel: "Service time",
      placeLabel: "Room",
      phoneLabel: "Phone",
      buildingAlt: "The All Saints Parish building, a stone church with arched windows.",
    },
    footer: { visit: "Visit", times: "Service times", browse: "Pages", mapLink: "View on map" },
    switcher: { label: "Language" },
  },
};

export type { Localized };
