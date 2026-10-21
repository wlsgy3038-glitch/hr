const STORAGE_KEY = "personality_test_creator";
const QUESTION_STORAGE_KEY = "personality_test_questions";
const QUESTION_REVISION_KEY = "personality_test_questions_revision";
const QUESTION_REVISION = "egogram_v1";
const PAGE_SIZE = 20;
const TEST_DURATION_SECONDS = 25 * 60;
const MIN_VALID_RESPONSE_SECONDS = 5 * 60;
const MAX_ACCESS_COUNT = 5;
const TARGET_QUESTION_COUNT = 50;
const QUESTION_ORDER_VERSION = 3;
const EGOGRAM_ITEMS = [
  ["CP", [
    "남이 말하는 도중이라도 자신의 생각을 이야기하는 편이다.", "타인의 행동이나 실수에 대해서 엄하게 비판하는 편이다.", "시간이나 금전에 대한 약속을 소홀히 하는 것을 싫어한다.", "사회의 규칙, 윤리, 도덕을 지키는 것을 중시한다.", "예절이나 규범에 까다로운 편이다.", "'해야 한다. 하지 않으면 안 된다.'는 말을 자주 쓴다.", "작은 잘못이라도 흐지부지 지나치지 않는 편이다.", "옳고 그름이 분명하고 흑백을 명확히 한다.", "남에게 책임감을 강하게 요구하는 편이다.", "아이들이나 부하를 엄격히 교육시킨다.",
  ]],
  ["NP", [
    "다른 사람에 대해 헤아려 주는 마음이 강하다.", "상대방의 장점을 잘 파악하여 지지하는 편이다.", "남이 부탁하면 거절 못하는 편이다.", "아이들이나 남의 일을 돌봐주는 것을 좋아한다.", "타인에 대하여 긍정적이며 수용적이다.", "아이들이나 부하의 잘못에 대해 관대하다.", "상대방의 말에 귀를 기울여 공감하는 편이다.", "다른 사람이 물어오면 친절하게 대답해준다.", "친구나 가족들에게 무엇이든 주는 것을 좋아한다.", "동정심이 많아 불쌍한 사람을 보면 지나치지 못한다.",
  ]],
  ["A", [
    "상호 이해관계를 생각하고 행동하는 편이다.", "대화 중에 감정적으로 흥분하는 일이 적다.", "사물을 분석적으로 깊게 생각한 다음에 결정한다.", "감정보다는 이성적인 편이다.", "의견이 서로 다를 때는 양쪽 의견을 모두 듣고 결정한다.", "잘 모르는 것은 질문이나 상의해서 처리한다.", "무슨 일이나 사실에 입각해서 판단한다.", "치밀한 계획 및 예산을 세워 행동한다.", "앞으로의 일을 냉정하게 생각하고 행동한다.", "몸이 좋지 않을 때는 자중해서 무리를 피한다.",
  ]],
  ["FC", [
    "자신을 자유롭게 행동하는 사람이라고 생각한다.", "매사에 강한 호기심을 느끼는 편이다.", "오락, 음식 등을 만족할 때까지 즐기는 편이다.", "말하고자 하는 것을 서슴없이 말해 버리는 편이다.", "원하는 것을 손에 넣지 않으면 못 견디는 편이다.", "'야', '멋있다', '와' 등 감탄사를 자주 쓴다.", "유머러스하고 농담을 잘 하는 편이다.", "충동적으로 화내는 일이 많은 편이다.", "흥에 취하면 도가 지나치는 행동을 할 때가 있다.", "감정이 풍부하면 희로애락이 잘 드러난다.",
  ]],
  ["AC", [
    "생각하고 있는 바를 겉으로 말하지 못하는 경우가 많다.", "사람들로부터 좋은 인상을 받고 싶어한다.", "나서는 것을 어려워하며 타인에게 양보할 때가 많다.", "싫은 일은 이유를 붙여 뒤로 미루는 경향이 있다.", "자기 생각을 주장하기보다 타협하는 일이 많다.", "불만이 있더라도 참는 편이다.", "남의 기대에 어긋나지 않도록 노력을 많이 한다.", "남의 안색이나 말에 신경을 쓰게 된다.", "자신이 없고 열등감을 느낄 때가 많다.", "자기 감정을 억누르는 편이다.",
  ]],
].flatMap(([factor, items], groupIndex) => items.map((text, index) => ({
  id: `Q${String(groupIndex * 10 + index + 1).padStart(3, "0")}`,
  text,
  category: "에고그램",
  factor,
  reverse: false,
  validation: false,
  bestAxis: "",
  enabled: true,
})));

const EGOGRAM_PROFILES = {
  AAAAB: {
    title: "공적, 사적으로 에너지가 과잉인 타입",
    text: "다섯 성향 점수를 바탕으로 산출된 에고그램 유형입니다.",
  },
};
const EGOGRAM_LABELS = {
  CP: "1번 항목 · CP / 비판적 부모",
  NP: "2번 항목 · NP / 양육적 부모",
  A: "3번 항목 · A / 성인",
  FC: "4번 항목 · FC / 자유로운 어린이",
  AC: "5번 항목 · AC / 순응하는 어린이",
};
const DISC_TYPES = ["D", "I", "S", "C"];
const DISC_TYPE_LABELS = { D: "주도형", I: "사교형", S: "안정형", C: "신중형" };
const DISC_QUESTIONS = [
  { D: "단호한", I: "열정적인", S: "충실한", C: "신중한" },
  { D: "자주적인", I: "사교적인", S: "순종적인", C: "주의 깊은" },
  { D: "적극적인", I: "호감주는", S: "동의하는", C: "정확한" },
  { D: "직접적인", I: "낙천적인", S: "배려하는", C: "분석적인" },
  { D: "주장강한", I: "말 많은", S: "우유부단", C: "비판적인" },
  { D: "대담한", I: "친근한", S: "너그러움", C: "자제하는" },
  { D: "즉시하는", I: "자신있는", S: "변함없는", C: "논리적인" },
  { D: "굳건한", I: "재미있는", S: "양보하는", C: "내성적인" },
];

const SCORING_RULES = {
  talent: {
    도전: ["Q001", "Q002", "Q003", "Q004", "Q005", "Q006"],
    신뢰: ["Q007", "Q008", "Q009", "Q010", "Q011", "Q012"],
    Integrity: ["Q013", "Q014", "Q015", "Q016", "Q017", "Q018"],
    협력: ["Q019", "Q020", "Q021", "Q022", "Q023", "Q024"],
    창의: ["Q025", "Q026", "Q027", "Q028", "Q029", "Q030"],
    전문성: ["Q031", "Q032", "Q033", "Q034", "Q035", "Q036"],
    글로벌마인드: ["Q037", "Q038", "Q039", "Q040", "Q041", "Q042"],
  },
  workstyle: {
    성취지향성: ["Q043", "Q044", "Q045", "Q046", "Q047"],
    인내: ["Q048", "Q049", "Q050", "Q051", "Q052"],
    자발성: ["Q053", "Q054", "Q055", "Q056", "Q057"],
    리더십: ["Q058", "Q059", "Q060", "Q061", "Q062"],
    팀워크: ["Q063", "Q064", "Q065", "Q066", "Q067"],
    대인이해: ["Q068", "Q069", "Q070", "Q071", "Q072"],
    사교성: ["Q073", "Q074", "Q075", "Q076", "Q077"],
    자기통제: ["Q078", "Q079", "Q080", "Q081", "Q082"],
    스트레스내성: ["Q083", "Q084", "Q085", "Q086", "Q087", "Q088"],
    "적응성/융통성": ["Q089", "Q090", "Q091", "Q092", "Q093"],
    책임감: ["Q094", "Q095", "Q096", "Q097", "Q098"],
    꼼꼼함: ["Q099", "Q100", "Q101", "Q102", "Q103"],
    윤리: ["Q104", "Q105", "Q106", "Q107", "Q108"],
    독립: ["Q109", "Q110", "Q111", "Q112", "Q113"],
    혁신: ["Q114", "Q115", "Q116", "Q117", "Q118"],
    분석적사고: ["Q119", "Q120", "Q121", "Q122", "Q123"],
  },
  cwb: {
    충동성: ["Q124", "Q125", "Q126", "Q127"],
    반사회성: ["Q128", "Q129", "Q130", "Q131"],
    무책임: ["Q132", "Q133", "Q134", "Q135"],
  },
  reliability: {
    응답솔직성: ["Q136", "Q137", "Q138", "Q139", "Q140"],
    응답성실성: ["Q141", "Q142"],
    주의확인: ["Q143", "Q144"],
  },
};

const BEST_TYPE_RULES = {
  T: ["도전", "창의", "혁신", "적응성/융통성"],
  C: ["신뢰", "윤리", "책임감", "꼼꼼함"],
  A: ["성취지향성", "자발성", "리더십", "도전"],
  P: [],
  O: ["사교성", "대인이해", "팀워크", "협력"],
  I: ["독립", "분석적사고"],
  E: ["충동성", "사교성"],
  R: ["자기통제", "스트레스내성", "윤리", "책임감"],
};

const INTERPRETATION_DB = {
  "적응성/융통성": {
    HIGH: "환경 변화에 빠르게 적응하며 새로운 상황에서도 유연하게 대응하는 경향이 있습니다.",
    AVERAGE: "대부분의 변화 상황에 무난하게 적응하는 편입니다.",
    LOW: "예상하지 못한 변화에 부담을 느낄 수 있으며 적응 시간이 다소 필요한 편입니다.",
  },
  스트레스내성: {
    HIGH: "압박 상황에서도 침착함을 유지하며 감정의 영향을 비교적 적게 받습니다.",
    AVERAGE: "일반적인 수준의 스트레스 관리 능력을 보유하고 있습니다.",
    LOW: "업무 압박이나 대인 갈등 상황에서 심리적 영향을 받을 가능성이 있습니다.",
  },
  대인이해: {
    HIGH: "타인의 감정과 요구를 잘 이해하며 관계 형성 능력이 우수합니다.",
    AVERAGE: "일반적인 수준의 공감 능력과 대인 이해 능력을 보유하고 있습니다.",
    LOW: "상대방의 감정이나 의도를 파악하는 데 어려움을 겪을 수 있습니다.",
  },
};

const JUDGMENT_TEXT_OVERRIDES = {
  Q001: "새로운 업무가 주어지면 충분히 분석하기보다 먼저 작은 시도를 해보는 편이다",
  Q002: "실패 가능성이 있어도 학습 효과가 크다면 시도해볼 가치가 있다고 본다",
  Q004: "익숙하지 않은 과제를 맡을 때 부담과 기대가 함께 생기는 편이다",
  Q005: "성공 가능성이 낮아 보이면 검증된 방식부터 확인하는 편이다",
  Q006: "새로운 업무보다 이미 절차가 정리된 업무에서 더 안정감을 느낀다",
  Q007: "일정을 지키기 어렵다고 판단되면 결과물 완성도와 일정 중 무엇을 우선할지 고민한다",
  Q008: "업무 진행 상황은 필요할 때 공유하는 것이 효율적이라고 생각한다",
  Q010: "업무상 실수가 생기면 먼저 해결책을 정리한 뒤 공유하는 편이다",
  Q011: "상황이 급하면 사전에 설명하고 일정 조정을 요청하는 것이 현실적이라고 본다",
  Q012: "내 담당 범위가 명확하지 않은 일은 우선순위를 낮게 두는 편이다",
  Q013: "상황에 따라 원칙 적용과 현실적 조정 사이에서 균형이 필요하다고 본다",
  Q014: "불리한 사실을 말할 때는 전달 시점과 방식을 신중하게 선택한다",
  Q016: "성과와 절차가 충돌할 때는 장기적인 신뢰 손실을 함께 고려한다",
  Q017: "규정이 현실과 맞지 않는다고 느끼면 예외 적용 가능성을 먼저 확인한다",
  Q018: "규정이나 법적 기준은 상황 맥락과 함께 해석해야 한다고 느낄 때가 있다",
  Q019: "팀 목표가 중요해도 내 업무 방식의 장점은 유지하려는 편이다",
  Q020: "의견이 다를 때 상대 입장을 듣되 최종 판단은 기준에 따라 하려 한다",
  Q021: "팀에 필요한 일이라도 내 핵심 업무에 영향이 크면 조정이 필요하다고 본다",
  Q023: "속도가 중요한 업무는 협업보다 혼자 처리하는 방식이 더 효율적일 때가 있다",
  Q024: "다른 사람의 업무 문제는 요청이 있을 때 돕는 것이 적절하다고 생각한다",
  Q025: "기존 방식이 안정적이어도 더 나은 대안이 있는지 가끔 검토한다",
  Q026: "문제 해결 시 여러 대안을 넓게 보기보다 실행 가능한 안을 빨리 좁히는 편이다",
  Q029: "이미 잘 작동하는 방식은 크게 바꾸지 않는 것이 낫다고 생각한다",
  Q030: "새로운 아이디어는 실행 조건이 맞아야 의미가 있다고 보는 편이다",
  Q031: "맡은 분야의 학습은 업무 필요성이 분명할 때 집중하는 편이다",
  Q033: "모르는 업무는 직접 탐색하되 일정이 촉박하면 주변 도움을 먼저 구한다",
  Q035: "현재 지식으로 처리 가능한 업무라면 추가 학습보다 실행을 우선한다",
  Q036: "업무 관련 학습은 필요성이 생겼을 때 해도 충분하다고 느낀다",
  Q043: "목표 달성 과정에서 속도와 완성도 중 무엇을 우선할지 자주 판단한다",
  Q045: "어려운 목표가 주어지면 의욕과 부담을 동시에 느끼는 편이다",
  Q047: "목표가 지나치게 높으면 달성 가능성을 먼저 따져보는 편이다",
  Q048: "반복 업무는 효율적인 처리 기준이 있을 때 꾸준히 수행하기 쉽다",
  Q049: "성과가 바로 보이지 않는 일은 중간 점검 기준이 있어야 지속하기 편하다",
  Q052: "결과가 늦게 보이는 일은 우선순위를 낮추고 싶을 때가 있다",
  Q053: "지시가 없을 때는 먼저 움직이기보다 기대 범위를 확인하는 편이다",
  Q055: "업무 범위가 불명확하면 먼저 필요한 부분을 정리하고 확인한다",
  Q057: "지시받지 않은 일은 책임 범위가 분명할 때 진행하는 편이다",
  Q058: "여러 사람이 함께 일할 때 상황에 따라 주도하거나 따르는 역할을 선택한다",
  Q062: "앞에 나서기보다 필요한 의견만 명확히 전달하는 방식이 편하다",
  Q063: "팀 분위기를 고려하되 업무 기준이 더 중요할 때가 있다고 본다",
  Q064: "팀 결과와 개인 역할 성과 중 상황에 따라 더 중요한 쪽이 달라진다고 생각한다",
  Q067: "개인 성과가 명확해야 팀 성과에도 기여할 수 있다고 본다",
  Q068: "상대 감정보다는 말로 표현된 내용과 사실을 우선 확인하는 편이다",
  Q070: "대화할 때 상대 기분을 고려하되 핵심 내용은 분명히 말하려 한다",
  Q072: "감정적 반응은 직접 설명을 듣기 전까지 판단하기 어렵다고 느낀다",
  Q073: "처음 만나는 사람과는 필요한 대화부터 시작하는 편이다",
  Q077: "새로운 사람과의 대화는 상황과 목적이 분명할 때 편하다",
  Q078: "감정적으로 불편할 때도 표현을 줄일지 분명히 말할지 상황에 따라 판단한다",
  Q080: "화가 날 때 바로 반응하지 않으려 하지만 때로는 즉시 말해야 한다고 느낀다",
  Q082: "기분이 좋지 않을 때 표정이나 말투를 완전히 숨기기는 어렵다",
  Q083: "압박이 큰 상황에서는 침착함과 빠른 결정을 함께 요구받는다고 느낀다",
  Q084: "여러 업무가 동시에 생기면 우선순위가 정리될 때까지 긴장감이 높아진다",
  Q087: "스트레스가 누적되면 평소보다 예민해질 수 있다",
  Q088: "걱정이 많을 때는 업무 집중 방식을 따로 조정해야 한다",
  Q094: "맡은 일을 끝까지 처리하되, 상황이 바뀌면 범위 조정도 필요하다고 본다",
  Q098: "업무가 어려워지면 도움 요청이나 역할 조정을 고려하는 편이다",
  Q104: "정해진 절차와 빠른 실행이 충돌하면 상황별 판단이 필요하다고 본다",
  Q105: "규정이 불편할 때는 취지를 확인한 뒤 따르는 편이다",
  Q108: "조직 규정이 업무 현실과 맞지 않으면 개선 의견이 필요하다고 본다",
  Q124: "감정이 올라오면 바로 표현할지 잠시 정리할지 상황에 따라 달라진다",
};

const EXTRA_VALIDATION_QUESTIONS = [
  { id: "V001", sourceId: "Q094", factor: "책임감", text: "맡은 업무는 중간에 어려움이 있어도 끝까지 처리하려고 한다.", reverse: false },
  { id: "V002", sourceId: "Q095", factor: "책임감", text: "실수가 확인되면 책임 범위를 인정하고 수정하려 한다.", reverse: false },
  { id: "V003", sourceId: "Q096", factor: "책임감", text: "결과가 기대에 못 미치면 내가 보완할 부분을 먼저 살핀다.", reverse: false },
  { id: "V004", sourceId: "Q097", factor: "책임감", text: "마감이 가까워지면 중요한 일부터 정리해 완수하려 한다.", reverse: false },
  { id: "V005", sourceId: "Q098", factor: "책임감", text: "업무가 까다로워지면 다른 사람에게 넘기고 싶어지는 편이다.", reverse: true },
  { id: "V006", sourceId: "Q094", factor: "책임감", text: "내가 맡기로 한 일은 끝까지 책임지는 것이 중요하다고 생각한다.", reverse: false },
  { id: "V007", sourceId: "Q096", factor: "책임감", text: "좋지 않은 결과가 생기면 원인을 확인하고 바로잡으려 한다.", reverse: false },
  { id: "V008", sourceId: "Q078", factor: "자기통제", text: "불편한 감정이 들어도 상황에 맞게 표현을 조절한다.", reverse: false },
  { id: "V009", sourceId: "Q079", factor: "자기통제", text: "하고 싶은 말이 있어도 때와 장소를 고려해 말한다.", reverse: false },
  { id: "V010", sourceId: "Q080", factor: "자기통제", text: "화가 날 때도 즉시 반응하기보다 잠시 생각하려 한다.", reverse: false },
  { id: "V011", sourceId: "Q081", factor: "자기통제", text: "중요한 판단은 기분보다 기준과 원칙에 따라 하려 한다.", reverse: false },
  { id: "V012", sourceId: "Q082", factor: "자기통제", text: "기분이 나쁘면 말투나 행동에 바로 드러나는 편이다.", reverse: true },
  { id: "V013", sourceId: "Q079", factor: "자기통제", text: "상황이 좋지 않아도 감정적으로 말하지 않으려 노력한다.", reverse: false },
  { id: "V014", sourceId: "Q081", factor: "자기통제", text: "순간적인 감정보다는 합리적인 기준을 우선하려 한다.", reverse: false },
  { id: "V015", sourceId: "Q083", factor: "스트레스내성", text: "압박이 큰 상황에서도 필요한 일을 차분히 처리하려 한다.", reverse: false },
  { id: "V016", sourceId: "Q084", factor: "스트레스내성", text: "여러 일이 동시에 생겨도 우선순위를 잡아 대응할 수 있다.", reverse: false },
  { id: "V017", sourceId: "Q085", factor: "스트레스내성", text: "예상 밖의 문제가 생겨도 감정을 크게 흔들리지 않게 관리한다.", reverse: false },
  { id: "V018", sourceId: "Q086", factor: "스트레스내성", text: "스트레스를 받아도 해야 할 업무는 계속 진행하는 편이다.", reverse: false },
  { id: "V019", sourceId: "Q087", factor: "스트레스내성", text: "스트레스가 쌓이면 쉽게 예민해지는 편이다.", reverse: true },
  { id: "V020", sourceId: "Q088", factor: "스트레스내성", text: "걱정이 많아지면 업무 집중이 어려워질 때가 있다.", reverse: true },
  { id: "V021", sourceId: "Q085", factor: "스트레스내성", text: "갑작스러운 문제에도 침착하게 해결책을 찾으려 한다.", reverse: false },
  { id: "V022", sourceId: "Q104", factor: "윤리", text: "업무를 할 때 편법보다 정당한 절차를 따르는 편이다.", reverse: false },
  { id: "V023", sourceId: "Q105", factor: "윤리", text: "규정이 번거롭더라도 지켜야 한다고 생각한다.", reverse: false },
  { id: "V024", sourceId: "Q106", factor: "윤리", text: "사회적 의무와 책임은 구성원으로서 필요하다고 생각한다.", reverse: false },
  { id: "V025", sourceId: "Q107", factor: "윤리", text: "공적 의무를 지키는 것이 아깝다고 느낄 때가 많다.", reverse: true },
  { id: "V026", sourceId: "Q108", factor: "윤리", text: "조직의 규정보다 개인 편의가 우선이라고 생각할 때가 많다.", reverse: true },
  { id: "V027", sourceId: "Q104", factor: "윤리", text: "성과가 중요해도 부적절한 방식은 피해야 한다고 생각한다.", reverse: false },
  { id: "V028", sourceId: "Q105", factor: "윤리", text: "기준과 원칙은 상황이 불리해도 지키려는 편이다.", reverse: false },
  { id: "V029", sourceId: "Q019", factor: "협력", text: "팀 목표를 위해 내 방식이나 일정을 조정할 수 있다.", reverse: false },
  { id: "V030", sourceId: "Q020", factor: "협력", text: "의견 차이가 있어도 상대의 생각을 먼저 들어보려 한다.", reverse: false },
  { id: "V031", sourceId: "Q021", factor: "협력", text: "팀에 필요하다면 내 담당이 아니어도 도울 수 있다.", reverse: false },
  { id: "V032", sourceId: "Q022", factor: "협력", text: "공동 성과를 위해 필요한 정보를 공유하는 편이다.", reverse: false },
  { id: "V033", sourceId: "Q023", factor: "협력", text: "협업보다 혼자 처리하는 방식이 늘 더 낫다고 생각한다.", reverse: true },
  { id: "V034", sourceId: "Q024", factor: "협력", text: "다른 사람의 업무 어려움은 나와 크게 관련 없다고 느낀다.", reverse: true },
  { id: "V035", sourceId: "Q020", factor: "협력", text: "갈등이 있어도 함께 일할 방법을 찾으려 한다.", reverse: false },
  { id: "V036", sourceId: "Q124", factor: "충동성", text: "감정이 올라오면 생각보다 말이나 행동이 먼저 나가는 편이다.", reverse: false },
  { id: "V037", sourceId: "Q125", factor: "충동성", text: "순간적인 기분에 따라 결정을 내릴 때가 있다.", reverse: false },
  { id: "V038", sourceId: "Q126", factor: "충동성", text: "화가 나면 말이 날카로워지는 경우가 있다.", reverse: false },
  { id: "V039", sourceId: "Q127", factor: "충동성", text: "충동적으로 행동한 뒤 후회하는 일이 있다.", reverse: false },
  { id: "V040", sourceId: "Q124", factor: "충동성", text: "감정이 강해지면 바로 표현해야 마음이 편하다.", reverse: false },
  { id: "V041", sourceId: "Q125", factor: "충동성", text: "충분히 생각하기 전에 결정을 해버리는 경우가 있다.", reverse: false },
  { id: "V042", sourceId: "Q126", factor: "충동성", text: "기분이 상하면 표현이 거칠어질 때가 있다.", reverse: false },
  { id: "V043", sourceId: "Q007", factor: "신뢰", text: "약속한 일정은 가능한 한 지키려고 노력한다.", reverse: false },
  { id: "V044", sourceId: "Q008", factor: "신뢰", text: "맡은 일의 상황을 주변에 투명하게 공유하는 편이다.", reverse: false },
  { id: "V045", sourceId: "Q009", factor: "신뢰", text: "다른 사람이 내게 일을 맡겨도 책임 있게 처리하려 한다.", reverse: false },
  { id: "V046", sourceId: "Q010", factor: "신뢰", text: "실수가 생기면 숨기기보다 빠르게 알리고 조치하려 한다.", reverse: false },
  { id: "V047", sourceId: "Q011", factor: "신뢰", text: "바쁜 상황에서는 약속한 일정이 조금 늦어져도 괜찮다고 느낀다.", reverse: true },
  { id: "V048", sourceId: "Q012", factor: "신뢰", text: "내 담당이 아니면 최종 결과에는 크게 신경 쓰지 않는 편이다.", reverse: true },
];

const app = document.querySelector("#app");
const appMode = new URLSearchParams(location.search).get("page") || document.body.dataset.page || "admin";

let questions = loadQuestions();
let tests = loadTests();
let route = parseRoute();
let questionManagementTab = "egogram";
let selectedParticipants = new Set();
let modalMode = null;
let candidateSession = null;
let candidateStep = 0;
let candidatePhase = "egogram";
let candidateAnswers = {};
let candidateDiscAnswers = {};
let candidateTimer = null;

saveTests();

window.addEventListener("hashchange", () => {
  route = parseRoute();
  selectedParticipants = new Set();
  modalMode = null;
  render();
});

function parseRoute() {
  const hash = location.hash || "#main";
  if (hash === "#create") return { tab: "create", testId: null, page: 1 };
  if (hash === "#questions") return { tab: "questions", testId: null, page: 1 };
  if (hash.startsWith("#detail:")) {
    const [, testId, page = "1"] = hash.split(":");
    return { tab: "detail", testId, page: Math.max(1, Number(page) || 1) };
  }
  return { tab: "main", testId: null, page: 1 };
}

function loadTests() {
  const saved = localStorage.getItem(STORAGE_KEY);
  const loaded = saved ? JSON.parse(saved) : [];
  return loaded.map((test) => ({
    ...test,
    participants: (test.participants || []).map(normalizeParticipant),
  }));
}

function normalizeParticipant(participant) {
  return {
    accessCount: 0,
    progressStep: 0,
    progressAnswers: {},
    timerStartedAt: null,
    timerEndsAt: null,
    elapsedSeconds: 0,
    questionOrder: [],
    questionOrderVersion: 0,
    ...participant,
    password: participant.password || participant.userId || "",
  };
}

function saveTests() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
}

function loadQuestions() {
  const saved = localStorage.getItem(QUESTION_STORAGE_KEY);
  const revision = localStorage.getItem(QUESTION_REVISION_KEY);
  if (saved && revision === QUESTION_REVISION) {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed) && parsed.length) {
      return parsed;
    }
  }
  const parsed = EGOGRAM_ITEMS.map((question) => ({ ...question }));
  localStorage.setItem(QUESTION_STORAGE_KEY, JSON.stringify(parsed));
  localStorage.setItem(QUESTION_REVISION_KEY, QUESTION_REVISION);
  return parsed;
}

function saveQuestions() {
  localStorage.setItem(QUESTION_STORAGE_KEY, JSON.stringify(questions));
  localStorage.setItem(QUESTION_REVISION_KEY, QUESTION_REVISION);
}

function defaultQuestionCsv() {
  const source = window.DEFAULT_QUESTIONS_CSV;
  if (typeof source === "string") return source;
  if (source && typeof source.value === "string") return source.value;
  return "";
}

function parseQuestionCsv(csv) {
  return csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("id,"))
    .map((line) => {
      const [id, text, category, factor, reverse, validation, bestAxis] = line.split(",");
      return {
        id,
        text,
        category,
        factor,
        reverse: reverse === "true",
        validation: validation === "true",
        bestAxis: bestAxis || "",
        enabled: true,
      };
    });
}

function applyJudgmentTextOverrides(questionItems) {
  return questionItems.map((question) => ({
    ...question,
    text: JUDGMENT_TEXT_OVERRIDES[question.id] || question.text,
  }));
}

function makeId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function nowText() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replaceAll("-", ".");
  const time = now.toTimeString().slice(0, 8);
  return `${date} ${time}`;
}

function clean(value) {
  return String(value || "").trim().toLowerCase();
}

function samePassword(participant, inputPassword) {
  const entered = String(inputPassword || "").trim();
  const savedPassword = String(participant.password || "").trim();
  const temporaryPassword = String(participant.userId || "").trim();
  return entered === savedPassword || (!savedPassword && entered === temporaryPassword);
}

function baseQuestionList() {
  return questions.filter((question) => question.id?.startsWith("Q"));
}

function validationQuestionList() {
  return [];
}

function allCandidateQuestionBank() {
  return EGOGRAM_ITEMS;
}

function questionById(id) {
  return allCandidateQuestionBank().find((question) => question.id === id);
}

function candidateQuestionList(participant = {}) {
  if (participant.questionOrder?.length) {
    return participant.questionOrder.map(questionById).filter(Boolean);
  }
  return EGOGRAM_ITEMS;
}

function ensureQuestionOrder(participant) {
  const expectedCount = EGOGRAM_ITEMS.length;
  if (participant.questionOrder?.length === expectedCount && participant.questionOrderVersion === QUESTION_ORDER_VERSION) return;
  participant.progressAnswers = {};
  if (!isClosedResult(participant)) participant.answers = {};
  participant.assessment = null;
  participant.questionOrder = buildQuestionOrder();
  participant.questionOrderVersion = QUESTION_ORDER_VERSION;
}

function buildQuestionOrder() {
  const order = EGOGRAM_ITEMS.map((question) => question.id);
  for (let index = order.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [order[index], order[swapIndex]] = [order[swapIndex], order[index]];
  }
  return order;
}

function enforceAttentionQuestionZone(sequence) {
  ["Q143", "Q144"].forEach((id) => {
    const currentIndex = sequence.indexOf(id);
    if (currentIndex >= 0) sequence.splice(currentIndex, 1);
  });

  ["Q143", "Q144"].forEach((id) => {
    const min = Math.floor(TARGET_QUESTION_COUNT * 0.3);
    const max = Math.floor(TARGET_QUESTION_COUNT * 0.7);
    const positions = [];
    for (let position = min; position <= Math.min(max, sequence.length); position += 1) {
      const before = questionById(sequence[position - 1]);
      const after = questionById(sequence[position]);
      if (before?.factor !== "주의확인" && after?.factor !== "주의확인") positions.push(position);
    }
    const insertAt = positions[Math.floor(Math.random() * positions.length)] ?? min;
    sequence.splice(insertAt, 0, id);
  });
}

function repairAdjacentFactors(sequence) {
  for (let index = 1; index < sequence.length; index += 1) {
    if (!hasSameFactorNeighbor(sequence, index)) continue;
    const swapIndex = findSafeSwapIndex(sequence, index);
    if (swapIndex > -1) {
      [sequence[index], sequence[swapIndex]] = [sequence[swapIndex], sequence[index]];
    }
  }
}

function hasSameFactorNeighbor(sequence, index) {
  const current = questionById(sequence[index]);
  const before = questionById(sequence[index - 1]);
  if (!current?.factor || !before?.factor) return false;
  return current.factor === before.factor;
}

function findSafeSwapIndex(sequence, conflictIndex) {
  for (let index = conflictIndex + 1; index < sequence.length; index += 1) {
    if (isProtectedPosition(sequence[index], index)) continue;
    if (isProtectedPosition(sequence[conflictIndex], conflictIndex)) continue;
    const copy = [...sequence];
    [copy[conflictIndex], copy[index]] = [copy[index], copy[conflictIndex]];
    if (localFactorOk(copy, conflictIndex) && localFactorOk(copy, index) && validationDistanceOk(copy)) return index;
  }
  return -1;
}

function isProtectedPosition(id, index) {
  if (id !== "Q143" && id !== "Q144") return false;
  const ratio = index / TARGET_QUESTION_COUNT;
  return ratio >= 0.3 && ratio <= 0.7;
}

function localFactorOk(sequence, index) {
  const current = questionById(sequence[index]);
  const before = questionById(sequence[index - 1]);
  const after = questionById(sequence[index + 1]);
  if (!current?.factor) return true;
  return current.factor !== before?.factor && current.factor !== after?.factor;
}

function validationDistanceOk(sequence) {
  return validationQuestionList().every((question) => Math.abs(sequence.indexOf(question.id) - sequence.indexOf(question.sourceId)) >= 20);
}

function spreadQuestions(items) {
  const buckets = items.reduce((acc, question) => {
    const key = question.factor || question.category || "기타";
    acc[key] = acc[key] || [];
    acc[key].push(question);
    return acc;
  }, {});

  Object.values(buckets).forEach(shuffle);

  const result = [];
  let previousKey = "";
  while (Object.values(buckets).some((bucket) => bucket.length)) {
    const availableKeys = Object.keys(buckets).filter((key) => buckets[key].length && key !== previousKey);
    const keys = availableKeys.length ? availableKeys : Object.keys(buckets).filter((key) => buckets[key].length);
    const maxLength = Math.max(...keys.map((key) => buckets[key].length));
    const candidateKeys = keys.filter((key) => buckets[key].length === maxLength);
    const selectedKey = candidateKeys[Math.floor(Math.random() * candidateKeys.length)];
    result.push(buckets[selectedKey].pop());
    previousKey = selectedKey;
  }

  return result;
}

function shuffle(items) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[randomIndex]] = [items[randomIndex], items[index]];
  }
  return items;
}

function render() {
  if (appMode === "candidate") return renderCandidate();
  renderAdmin();
}

function renderAdmin() {
  const selectedTest = tests.find((test) => test.id === route.testId);
  const visibleTab = route.tab === "detail" && !selectedTest ? "main" : route.tab;

  app.innerHTML = `
    <div class="admin-shell">
      <header class="topbar">
        <div class="logo">RSUPPORT</div>
        <div class="account">
          <span>석효진님 로그인</span>
          <button type="button">로그아웃</button>
        </div>
      </header>
      <div class="body-layout">
        <aside class="sidebar">
          <a class="side-tab ${visibleTab === "main" ? "active" : ""}" href="#main">
            <span class="tab-icon">▦</span>
            <span>메인</span>
          </a>
          <a class="side-tab ${visibleTab === "create" ? "active" : ""}" href="#create">
            <span class="tab-icon">▤</span>
            <span>검사 생성</span>
          </a>
          <a class="side-tab ${visibleTab === "questions" ? "active" : ""}" href="#questions">
            <span class="tab-icon">▧</span>
            <span>검사 문항 관리</span>
          </a>
          ${
            selectedTest
              ? `<a class="side-tab ${visibleTab === "detail" ? "active" : ""}" href="#detail:${selectedTest.id}:1">
                  <span class="tab-icon">▥</span>
                  <span>검사대상자 관리</span>
                </a>`
              : ""
          }
        </aside>
        <main class="content">
          ${adminViewFor(visibleTab, selectedTest)}
        </main>
      </div>
      ${modalMode && selectedTest ? modalView(selectedTest, modalMode) : ""}
    </div>
  `;

  bindAdminEvents(visibleTab, selectedTest);
}

function bindAdminEvents(visibleTab, selectedTest) {
  if (visibleTab === "questions") {
    document.querySelectorAll("[data-question-tab]").forEach((button) => {
      button.addEventListener("click", () => {
        questionManagementTab = button.dataset.questionTab;
        render();
      });
    });
  }

  if (visibleTab === "create") {
    document.querySelector("#testForm").addEventListener("submit", createTest);
    document.querySelectorAll(".date-input").forEach((input) => {
      input.addEventListener("input", formatDateInput);
    });
  }

  document.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => deleteTest(button.dataset.delete));
  });

  if (visibleTab === "detail" && selectedTest) {
    document.querySelectorAll("[data-participant-check]").forEach((checkbox) => {
      checkbox.addEventListener("change", () => toggleParticipant(checkbox));
    });
    document.querySelector("#registerParticipant").addEventListener("click", () => {
      modalMode = "create";
      render();
    });
    document.querySelector("#editParticipant").addEventListener("click", () => editSelectedParticipant());
    document.querySelector("#deleteParticipants").addEventListener("click", () => deleteSelectedParticipants(selectedTest));
    document.querySelector("#printResult").addEventListener("click", () => openResultReport());
    document.querySelector("#copyCandidateLink").addEventListener("click", () => copyCandidateLink());
    document.querySelector("#checkAll").addEventListener("change", (event) => toggleCurrentPage(selectedTest, event.currentTarget.checked));
  }

  if ((modalMode === "create" || modalMode === "edit") && selectedTest) {
    document.querySelector("#participantForm").addEventListener("submit", (event) => saveParticipant(event, selectedTest, modalMode));
    document.querySelectorAll("[data-close-modal]").forEach((button) => {
      button.addEventListener("click", () => {
        modalMode = null;
        render();
      });
    });
  }

  if (modalMode === "report" && selectedTest) {
    document.querySelector("#printReport").addEventListener("click", () => window.print());
    document.querySelector("#pdfReport").addEventListener("click", () => window.print());
    document.querySelectorAll("[data-close-modal]").forEach((button) => {
      button.addEventListener("click", () => {
        modalMode = null;
        render();
      });
    });
  }
}

function adminViewFor(tab, selectedTest) {
  if (tab === "create") return createView();
  if (tab === "questions") return questionsView();
  if (tab === "detail" && selectedTest) return detailView(selectedTest);
  return mainView();
}

function mainView() {
  const today = new Date().toISOString().slice(0, 10);
  const activeCount = tests.filter((test) => statusOf(test, today).key === "active").length;
  const pendingCount = tests.filter((test) => statusOf(test, today).key === "pending").length;
  const closedCount = tests.filter((test) => statusOf(test, today).key === "closed").length;

  return `
    <section class="page-section">
      <h1>검사 현황</h1>
      <div class="status-line"></div>
      <div class="summary">
        <div class="stat"><b>${tests.length}</b><span>전체 검사</span></div>
        <div class="stat"><b>${activeCount}</b><span>진행중</span></div>
        <div class="stat"><b>${pendingCount}</b><span>시작전</span></div>
        <div class="stat"><b>${closedCount}</b><span>마감</span></div>
      </div>
      <div class="table-panel">
        <div class="table-toolbar">
          <div></div>
          <div class="total">총 ${tests.length}건</div>
        </div>
        ${
          tests.length
            ? `<table class="main-table">
                <thead>
                  <tr>
                    <th>NO</th>
                    <th>검사명</th>
                    <th>검사일시</th>
                    <th>진행상태</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>${tests.map(testRow).join("")}</tbody>
              </table>`
            : `<div class="empty">생성된 인성검사가 없습니다. 좌측의 검사 생성 탭에서 새 검사를 만들어주세요.</div>`
        }
      </div>
    </section>
  `;
}

function createView() {
  return `
    <section class="page-section narrow">
      <h1>검사 생성</h1>
      <div class="status-line"></div>
      <div class="form-panel">
        <h2>새 인성검사 만들기</h2>
        <p class="hint">검사명, 검사 시작일, 마감일을 입력하면 메인 탭의 검사 현황에 추가됩니다.</p>
        <form id="testForm">
          <div class="field">
            <label for="title">검사명</label>
            <input id="title" required placeholder="예: 2026년 인성검사" />
          </div>
          <div class="field">
            <label for="startDate">검사 시작일</label>
            <input id="startDate" class="date-input" inputmode="numeric" maxlength="10" required placeholder="연도-월-일" />
          </div>
          <div class="field">
            <label for="endDate">마감일</label>
            <input id="endDate" class="date-input" inputmode="numeric" maxlength="10" required placeholder="연도-월-일" />
          </div>
          <p id="error" class="error" hidden></p>
          <button class="primary-button" type="submit">인성검사 생성</button>
        </form>
      </div>
    </section>
  `;
}

function questionsView() {
  return `
    <section class="page-section">
      <h1>검사 문항 관리</h1>
      <div class="status-line"></div>
      <div class="question-tabs" role="tablist" aria-label="검사 선택">
        <button type="button" role="tab" id="egogramTab" aria-controls="egogramQuestions" aria-selected="${questionManagementTab === "egogram"}" class="${questionManagementTab === "egogram" ? "active" : ""}" data-question-tab="egogram">에고그램 <span>50문항</span></button>
        <button type="button" role="tab" id="discTab" aria-controls="discQuestions" aria-selected="${questionManagementTab === "disc"}" class="${questionManagementTab === "disc" ? "active" : ""}" data-question-tab="disc">DISC <span>8문항</span></button>
      </div>
      <section class="table-panel question-table-panel" id="egogramQuestions" role="tabpanel" aria-labelledby="egogramTab" ${questionManagementTab === "egogram" ? "" : "hidden"}>
          <div class="table-toolbar">
            <div class="total">에고그램 검사 · ${EGOGRAM_ITEMS.length}문항</div>
          </div>
          <table class="question-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>질문</th>
                <th>항목</th>
              </tr>
            </thead>
            <tbody>${questions.map(questionRow).join("")}</tbody>
          </table>
      </section>
      <section class="table-panel question-table-panel" id="discQuestions" role="tabpanel" aria-labelledby="discTab" ${questionManagementTab === "disc" ? "" : "hidden"}>
          <div class="table-toolbar">
            <div class="total">DISC 검사 · ${DISC_QUESTIONS.length}문항</div>
          </div>
          <p class="disc-question-guide">각 문항에서 D·I·S·C 항목에 1~4점을 중복 없이 한 번씩 배정합니다.</p>
          <table class="question-table disc-question-table">
            <thead><tr><th>문항</th><th>D형 · 주도형</th><th>I형 · 사교형</th><th>S형 · 안정형</th><th>C형 · 신중형</th></tr></thead>
            <tbody>${DISC_QUESTIONS.map((item, index) => `<tr><td>${index + 1}번</td>${DISC_TYPES.map((type) => `<td>${escapeAttr(item[type])}</td>`).join("")}</tr>`).join("")}</tbody>
          </table>
      </section>
    </section>
  `;
}

function questionRow(question) {
  return `
    <tr>
      <td>${escapeAttr(question.id)}</td>
      <td>${escapeAttr(question.text)}</td>
      <td>${escapeAttr(question.factor)}</td>
    </tr>
  `;
}

function escapeAttr(value) {
  return String(value || "").replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
}

function detailView(test) {
  const pageCount = Math.max(1, Math.ceil(test.participants.length / PAGE_SIZE));
  const currentPage = Math.min(route.page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageParticipants = test.participants.slice(start, start + PAGE_SIZE);
  const runningCount = test.participants.filter((participant) => participant.result === "진행중").length;
  const doneCount = test.participants.filter((participant) => isClosedResult(participant)).length;

  return `
    <section class="page-section">
      <div class="detail-title"><span>${test.title}</span></div>
      <h1>검사대상자 관리</h1>
      <div class="status-line"></div>
      <div class="summary detail-summary">
        <div class="stat"><b>${test.participants.length}</b><span>전체 대상자</span></div>
        <div class="stat"><b>${runningCount}</b><span>진행중</span></div>
        <div class="stat"><b>${doneCount}</b><span>검사완료</span></div>
        <div class="stat"><b>${test.participants.length - runningCount - doneCount}</b><span>시작전</span></div>
      </div>
      <div class="table-panel detail-table-panel">
        <div class="table-toolbar">
          <div></div>
          <div class="total">총 ${test.participants.length}건</div>
        </div>
        <table class="detail-table">
          <thead>
            <tr>
              <th><input id="checkAll" type="checkbox" aria-label="현재 페이지 전체 선택" /> 선택</th>
              <th>NO</th>
              <th>아이디</th>
              <th>이름</th>
              <th>성별</th>
              <th>직종</th>
              <th>회사</th>
              <th>검사 시작시간</th>
              <th>종료시간</th>
              <th>접속 횟수</th>
              <th>작성 문항<br><small>에고그램 / DISC</small></th>
              <th>검사 결과</th>
            </tr>
          </thead>
          <tbody>${pageParticipants.map((participant, index) => participantRow(participant, start + index)).join("")}</tbody>
        </table>
        <div class="detail-footer">
          ${pagination(test, currentPage, pageCount)}
          <div class="report-actions">
            <button class="action-button print" id="printResult" type="button">검사결과표 인쇄</button>
            <button class="action-button copy" id="copyCandidateLink" type="button">접속링크 복사</button>
          </div>
          <div class="bottom-actions">
            <button class="action-button primary" id="registerParticipant" type="button">+ 등록</button>
            <button class="action-button success" id="editParticipant" type="button">✓ 수정</button>
            <button class="action-button danger" id="deleteParticipants" type="button">× 삭제</button>
          </div>
        </div>
      </div>
    </section>
  `;
}

function testRow(test, index) {
  const status = statusOf(test);
  return `
    <tr>
      <td>${index + 1}</td>
      <td><a class="test-link" href="#detail:${test.id}:1">${test.title}</a></td>
      <td>${formatDate(test.startDate)} 00:00 ~ ${formatDate(test.endDate)} 23:59</td>
      <td><span class="badge ${status.key}">${status.label}</span></td>
      <td><button class="ghost-button" data-delete="${test.id}">삭제</button></td>
    </tr>
  `;
}

function participantRow(participant, index) {
  return `
    <tr>
      <td><input type="checkbox" data-participant-check="${participant.id}" ${selectedParticipants.has(participant.id) ? "checked" : ""} aria-label="${participant.name} 선택" /></td>
      <td>${index + 1}</td>
      <td>${participant.userId}</td>
      <td>${participant.name}</td>
      <td>${participant.gender || "-"}</td>
      <td>${participant.job}</td>
      <td>${participant.company}</td>
      <td>${participant.startedAt}</td>
      <td>${participant.endedAt}</td>
      <td>${participant.accessCount || 0} / 5</td>
      <td>${assessmentProgressText(participant)}</td>
      <td><span class="badge ${isClosedResult(participant) ? "done" : "pending"}">${participant.result}</span></td>
    </tr>
  `;
}

function answeredQuestionCount(participant) {
  const answers = participant.answers || participant.progressAnswers || {};
  const egogramIds = new Set(EGOGRAM_ITEMS.map((question) => question.id));
  return Object.keys(answers).filter((id) => egogramIds.has(id)).length;
}

function answeredDiscQuestionCount(participant) {
  const answers = participant.discAnswers || participant.progressDiscAnswers || {};
  return DISC_QUESTIONS.filter((_question, index) => {
    const row = answers[index + 1] || {};
    const values = DISC_TYPES.map((type) => Number(row[type]));
    return values.every((value) => Number.isInteger(value) && value >= 1 && value <= 4) && new Set(values).size === 4;
  }).length;
}

function assessmentProgressText(participant) {
  return `에고그램 ${answeredQuestionCount(participant)} / ${EGOGRAM_ITEMS.length}<br>DISC ${answeredDiscQuestionCount(participant)} / ${DISC_QUESTIONS.length}`;
}

function pagination(test, currentPage, pageCount) {
  if (pageCount <= 1) return `<div class="pager"></div>`;
  return `
    <div class="pager">
      ${Array.from({ length: pageCount }, (_, index) => {
        const pageNumber = index + 1;
        return `<a class="${pageNumber === currentPage ? "active" : ""}" href="#detail:${test.id}:${pageNumber}">${pageNumber}</a>`;
      }).join("")}
    </div>
  `;
}

function modalView(test, mode) {
  if (mode === "report") return resultReportModal(test);
  return participantModal(test, mode);
}

function participantModal(test, mode) {
  const participant = mode === "edit" ? selectedParticipant(test) : null;
  const title = mode === "edit" ? "검사대상자 수정" : "검사대상자 등록";
  const submitText = mode === "edit" ? "수정" : "등록";

  return `
    <div class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <div class="modal">
        <div class="modal-head">
          <h2 id="modalTitle">${title}</h2>
          <button type="button" data-close-modal>×</button>
        </div>
        <form id="participantForm">
          <div class="modal-grid">
            <div class="field compact">
              <label for="userId">아이디 <span class="required">*</span></label>
              <input id="userId" required placeholder="예: r26070001" value="${participant?.userId || ""}" />
            </div>
            <div class="field compact">
              <label for="name">이름 <span class="required">*</span></label>
              <input id="name" required placeholder="예: 김지원" value="${participant?.name || ""}" />
            </div>
            <div class="field compact">
              <label for="password">비밀번호 <span class="required">*</span></label>
              <input id="password" required placeholder="예: 1234" value="${participant?.password || ""}" />
            </div>
            <div class="field compact">
              <label for="gender">성별</label>
              <select id="gender">
                <option value="">선택</option>
                <option value="남" ${participant?.gender === "남" ? "selected" : ""}>남</option>
                <option value="여" ${participant?.gender === "여" ? "selected" : ""}>여</option>
              </select>
            </div>
            <div class="field compact">
              <label for="job">직종 <span class="required">*</span></label>
              <input id="job" required placeholder="예: 영업" value="${participant?.job || ""}" />
            </div>
            <div class="field compact">
              <label for="company">회사</label>
              <input id="company" required value="${participant?.company || "알서포트"}" />
            </div>
          </div>
          <div class="modal-actions">
            <button class="action-button outline" type="button" data-close-modal>취소</button>
            <button class="action-button ${mode === "edit" ? "success" : "primary"}" type="submit">${submitText}</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function resultReportModal(test) {
  const participants = selectedParticipantList(test);
  return `
    <div class="modal-backdrop report-backdrop" role="dialog" aria-modal="true" aria-labelledby="reportTitle">
      <div class="modal report-modal">
        <div class="modal-head no-print">
          <h2 id="reportTitle">검사 결과표</h2>
          <button type="button" data-close-modal>×</button>
        </div>
        <div class="report-tools no-print">
          <button class="action-button primary" id="printReport" type="button">인쇄</button>
          <button class="action-button success" id="pdfReport" type="button">다운로드</button>
        </div>
        <div class="print-area">
          ${participants.map((participant) => reportSheet(test, participant)).join("")}
        </div>
      </div>
    </div>
  `;
}

function reportSheet(test, participant) {
  {
    const assessment = participant.answers ? calculateAssessment(participant.answers, participant) : participant.assessment || calculateAssessment({}, participant);
    const disc = calculateDiscAssessment(participant.discAnswers || {});
    const profile = assessment.profile || EGOGRAM_PROFILES[assessment.profileCode] || { title: "결과 설명 없음", text: "결과 설명을 찾을 수 없습니다." };
    return `
      <section class="result-sheet">
        <header class="result-sheet-head">
          <div><h1>에고그램 진단 결과</h1><p>${test.title} · ${formatDate(test.startDate)} ~ ${formatDate(test.endDate)}</p></div>
          <div class="result-identity"><strong>${participant.name}</strong><span>${participant.userId} · ${participant.company} · ${participant.job}</span></div>
        </header>
        <div class="result-summary-row compact">
          <div><b>진단 유형 코드</b><span>${assessment.profileCode || assessment.bestType || "-"}</span></div>
          <div><b>DISC 결과</b><span>${disc.isComplete ? `1위 ${disc.ranked[0].type}형 ${disc.ranked[0].score}점 · 2위 ${disc.ranked[1].type}형 ${disc.ranked[1].score}점` : "응답 미완료"}</span></div>
        </div>
        <section class="best-panel"><div class="best-type"><small>에고그램 유형</small><strong>${assessment.profileCode || "-"}</strong></div>
          <div><h2>${profile.title}</h2><p>${profile.text}</p></div></section>
        <section class="report-block"><h3>5개 성향 점수</h3><table class="score-table"><thead><tr><th>영역</th><th>문항별 계산</th><th>합산 점수</th><th>유형 문자</th></tr></thead><tbody>
          ${assessment.factorScores.map((item) => `<tr><td>${EGOGRAM_LABELS[item.factor] || item.factor}</td><td>${(item.itemScores || []).map((score) => score === null ? "-" : score).join(" + ")} = ${item.score}</td><td>${item.score} / 20</td><td>${item.grade}</td></tr>`).join("")}
        </tbody></table></section>
        <section class="report-block disc-report"><h3>DiSC 검사 결과</h3>
          ${disc.isComplete ? `
            <table class="score-table"><thead><tr><th>유형</th><th>합계 점수</th></tr></thead><tbody>
              ${disc.typeScores.map((item) => `<tr><td>${item.type}형 (${DISC_TYPE_LABELS[item.type]})</td><td>${item.score}점</td></tr>`).join("")}
            </tbody></table>
          <div class="disc-rank-cards">
            ${disc.ranked.slice(0, 2).map((item, index) => `<div class="disc-rank-card rank-${index + 1}"><small>${index + 1}위 유형</small><strong>${item.type}형</strong><span>${DISC_TYPE_LABELS[item.type]} · ${item.score}점</span></div>`).join("")}
          </div>
            ${disc.tieNote ? `<p class="disc-tie-note">${disc.tieNote}</p>` : ""}
          <div class="disc-detail-slots">
            ${disc.ranked.slice(0, 2).map((item, index) => `<section class="disc-detail-slot"><h4>${index + 1}위 ${item.type}형 (${DISC_TYPE_LABELS[item.type]}) 상세 설명</h4><p>상세 설명을 추가할 영역입니다.</p></section>`).join("")}
          </div>
          ` : `<p>DiSC 문항 응답이 완료되지 않았습니다.</p>`}
        </section>
      </section>
    `;
  }
  const assessment = participant.answers ? calculateAssessment(participant.answers, participant) : participant.assessment || calculateAssessment({}, participant);
  const reliabilityScores = reliabilityScoreRows(assessment.reliability);
  const bestDescription = bestTypeDescription(assessment.bestType);
  return `
    <section class="result-sheet">
      <header class="result-sheet-head">
        <div>
          <h1>온라인 인성검사 결과표</h1>
          <p>검사명 ${test.title} · 검사기간 ${formatDate(test.startDate)} ~ ${formatDate(test.endDate)}</p>
        </div>
        <div class="result-identity">
          <strong>${participant.name}</strong>
          <span>${participant.userId} · ${participant.company} · ${participant.job}</span>
        </div>
      </header>
      ${assessment.invalid ? `<div class="result-alert danger">응답 신뢰도가 매우 낮아 결과를 해석할 수 없습니다.</div>` : ""}
      ${assessment.unansweredWarning ? `<div class="result-alert">일부 문항이 응답되지 않아 결과 해석의 정확도가 다소 제한될 수 있습니다.</div>` : ""}
      ${assessment.invalidByUnanswered ? `<div class="result-alert danger">미응답 문항이 과도하게 많아 결과를 산출할 수 없습니다.</div>` : ""}
      <div class="result-summary-row compact">
        <div><b>응답 신뢰도 수준</b><span>${assessment.reliability?.grade || "-"}</span></div>
        <div><b>조직 공격성 수준</b><span>${assessment.cwbRiskLevel || "-"} · ${formatScore(assessment.cwbRisk)}</span></div>
        <div><b>인성 종합 점수</b><span>${formatScore(assessment.personalityScore)}</span></div>
        <div><b>인성 레벨</b><span>${assessment.level || "-"}</span></div>
      </div>
      <section class="best-panel">
        <div class="best-type">
          <small>BEST 유형</small>
          <strong>${assessment.bestType || "-"}</strong>
        </div>
        <div>
          <h2>${bestDescription.title}</h2>
          <p>${bestDescription.text}</p>
        </div>
      </section>
      <div class="result-section-grid">
        ${resultSection("신뢰도 영역", reliabilityScores, "reliability")}
        ${resultSection("CWB 영역", assessment.cwbScores, "cwb")}
      </div>
      ${resultSection("인재상 영역", assessment.talentScores, "talent")}
      ${resultSection("Workstyle 영역", assessment.workstyleScores, "workstyle")}
      <div class="result-section-grid">
        ${summaryList("강점 3개", assessment.strengths)}
        ${summaryList("약점 2개", assessment.weaknesses)}
      </div>
      <section class="report-block">
        <h3>미응답 문항</h3>
        <table class="result-table">
          <tbody>
            <tr><th>미응답 수</th><td>${assessment.unansweredCount} / ${assessment.totalQuestions} (${Math.round(assessment.unansweredRate * 100)}%)</td></tr>
            <tr><th>문항</th><td>${assessment.unansweredIds.length ? assessment.unansweredIds.join(", ") : "없음"}</td></tr>
          </tbody>
        </table>
      </section>
      <section class="report-block">
        <h3>종합 분석</h3>
        <div class="analysis-box">${assessment.aiAnalysis || "종합 분석을 생성할 수 없습니다."}</div>
      </section>
    </section>
  `;
}

function calculateDiscAssessment(discAnswers = {}) {
  const isComplete = DISC_QUESTIONS.every((_question, index) => {
    const row = discAnswers[index + 1] || {};
    const values = DISC_TYPES.map((type) => Number(row[type]));
    return values.every((value) => Number.isInteger(value) && value >= 1 && value <= 4) && new Set(values).size === 4;
  });
  const typeScores = DISC_TYPES.map((type) => ({
    type,
    score: DISC_QUESTIONS.reduce((sum, _question, index) => sum + (Number(discAnswers[index + 1]?.[type]) || 0), 0),
  }));
  const ranked = [...typeScores].sort((left, right) => right.score - left.score || DISC_TYPES.indexOf(left.type) - DISC_TYPES.indexOf(right.type));
  const topTwo = ranked.slice(0, 2);
  const topTie = ranked.filter((item) => item.score === ranked[0].score);
  const secondTie = ranked.filter((item) => item.score === ranked[1].score);
  let tieNote = "";
  if (topTie.length > 1) {
    tieNote = `공동 1위: ${topTie.map((item) => `${item.type}형`).join(", ")}.`;
  } else if (secondTie.length > 1) {
    tieNote = `공동 2위: ${secondTie.map((item) => `${item.type}형`).join(", ")}.`;
  }
  const representativeType = topTwo.map((item) => item.type).join("");
  const primary = topTwo[0].type;
  const secondary = topTwo[1].type;
  const traits = {
    D: "결단력 있고 목표를 주도하는",
    I: "열정적이고 사람들과 활발히 소통하는",
    S: "협조적이고 안정적인 관계를 중시하는",
    C: "분석적이고 정확성과 기준을 중시하는",
  };
  const description = `${primary}형의 ${traits[primary]} 특성이 중심이 되고, ${secondary}형의 ${traits[secondary]} 특성이 보완적으로 함께 나타나는 조합입니다.`;
  return { typeScores, ranked, representativeType, tieNote, description, isComplete };
}

function resultSection(title, items, tone = "") {
  return `
    <section class="report-block ${tone}">
      <h3>${title}</h3>
      <table class="score-table">
        <thead>
          <tr>
            <th>항목</th>
            <th>점수</th>
            <th>등급</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item) => `
            <tr>
              <td>${item.factor}</td>
              <td>
                <div class="score-cell">
                  <span class="score-bar"><i style="width:${Math.max(0, Math.min(100, item.score * 10))}%"></i></span>
                  <b>${formatScore(item.score)}</b>
                </div>
              </td>
              <td>${item.level}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </section>
  `;
}

function summaryList(title, items = []) {
  return `
    <section class="report-block">
      <h3>${title}</h3>
      <div class="summary-list">
        ${items.map((item) => `
          <div>
            <strong>${item.factor}</strong>
            <span>${formatScore(item.score)} · ${item.level}</span>
            <p>${buildInterpretations([item])[0].text}</p>
          </div>
        `).join("") || "<p>표시할 항목이 없습니다.</p>"}
      </div>
    </section>
  `;
}

function reliabilityScoreRows(reliability) {
  const honestyRiskCount = reliability?.honestyRiskIds?.length || 0;
  const consistencyErrorCount = reliability?.consistencyErrors?.length || 0;
  const attentionPassed = !(reliability?.attentionErrors?.length);
  return [
    {
      factor: "응답 솔직성",
      score: Math.max(1, 10 - honestyRiskCount * 2),
      level: honestyRiskCount <= 2 ? "HIGH" : honestyRiskCount <= 4 ? "AVERAGE" : "LOW",
    },
    {
      factor: "응답 성실성",
      score: Math.max(1, 10 - consistencyErrorCount * 2),
      level: consistencyErrorCount <= 2 ? "HIGH" : consistencyErrorCount <= 4 ? "AVERAGE" : "LOW",
    },
    {
      factor: "주의확인",
      score: attentionPassed ? 10 : 2,
      level: attentionPassed ? "HIGH" : "LOW",
    },
  ];
}

function bestTypeDescription(type = "") {
  if (!type) {
    return {
      title: "BEST 유형 미산출",
      text: "응답 신뢰도 기준을 충족하지 않아 BEST 유형을 산출하지 않습니다.",
    };
  }

  const first = type[0] === "T"
    ? "변화와 도전을 선호하며 새로운 방식으로 문제를 풀려는 경향"
    : "안정성과 책임을 중시하며 신뢰 가능한 방식으로 일하려는 경향";
  const second = type[1] === "A"
    ? "목표 달성과 주도적 실행에 강점"
    : "상황을 관찰하고 신중하게 속도를 조절하는 편";
  const third = type[2] === "O"
    ? "관계와 협업을 통해 성과를 만드는 편"
    : "독립적으로 분석하고 판단하는 편";
  const fourth = type[3] === "E"
    ? "에너지가 외부로 드러나고 표현이 비교적 활발한 편"
    : "자기통제와 안정적인 대응을 중시하는 편";

  return {
    title: `${type || "-"} 유형 설명`,
    text: `${first}이 있으며, ${second}입니다. 또한 ${third}이고, ${fourth}으로 해석됩니다.`,
  };
}

function formatScore(score) {
  if (score === undefined || score === null || Number.isNaN(Number(score))) return "-";
  return `${Number(score).toFixed(Number(score) % 1 === 0 ? 0 : 1)} / 10`;
}

function renderCandidate() {
  if (!candidateSession) return renderCandidateLogin();
  renderCandidateTest();
}

function renderCandidateLogin() {
  app.innerHTML = `
    <div class="candidate-shell">
      <div class="candidate-login-layout">
        <section class="candidate-info-panel">
          <div class="candidate-logo mark">RSUPPORT</div>
          <div class="candidate-info-divider"></div>
          <div class="candidate-info-text">
            <span class="notice-chip">안내</span>
            <p class="info-lead"><strong>본 사이트는 크롬에 최적화되어 있습니다.</strong></p>
            <p>회사에서 안내 받으신 대로 인적사항을 공백 없이 입력해주세요.</p>
            <p>인적사항이 정확하지 않으면 검사에 응시하실 수 없습니다.</p>
            <div class="login-assessment-guide egogram-login-guide">
              <h3>에고그램 검사 · ${EGOGRAM_ITEMS.length}문항</h3>
              <p>업무 환경에서 보여주는 자신의 모습을 생각하며 각 문항에 솔직하게 응답해 주세요.</p>
              <p>평소 모습과 비슷하면 O(2점), 다르면 X(0점)를 선택하고, 판단하기 어려운 경우에만 △(1점)를 선택해 주세요.</p>
              <div class="egogram-score-key"><span>X : 0점</span><span>△ : 1점</span><span>O : 2점</span></div>
            </div>
            <div class="login-assessment-guide disc-login-guide">
              <h3>DISC 검사 · ${DISC_QUESTIONS.length}문항</h3>
              <p>각 문항의 네 항목에 1, 2, 3, 4점을 중복 없이 하나씩 선택해 주세요.</p>
              <p>가장 본인에게 해당된다고 판단되는 항목에 4를, 해당되지 않는다고 판단되는 항목에 1을 기재합니다.</p>
            </div>
            <p class="info-gap">정확하게 입력하셨는데도 검사 진행이 되지 않을 경우, 담당자에게 문의해주시기 바랍니다.</p>
          </div>
          <div class="candidate-contact">
            <span>채용관련 문의</span>
            <b>☎ 070-7011-0514</b>
            <b>✉ recruit@rsupport.com</b>
          </div>
        </section>

        <section class="candidate-login-panel">
          <form id="candidateLogin" class="candidate-login-form">
            <select id="examTitle" required>
              <option value="">선택</option>
              ${tests.map((test) => `<option value="${escapeAttr(test.title)}">${test.title}</option>`).join("")}
            </select>
            <input id="candidateName" required placeholder="이름" />
            <input id="candidateId" required placeholder="아이디" />
            <input id="candidatePassword" required placeholder="비밀번호" type="password" />
            <label class="agree-row">
              <input required type="checkbox" />
              <span>개인정보 수집 및 보안 유지 관련하여 동의합니다.</span>
            </label>
            <div class="privacy-row">
              <span></span>
              <button type="button">원문보기</button>
            </div>
            <button class="login-button" type="submit">로그인</button>
        </section>
      </div>
    </div>
  `;
  document.querySelector("#candidateLogin").addEventListener("submit", loginCandidate);
}

function loginCandidate(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const test = tests.find((item) => clean(item.title) === clean(form.examTitle.value));
  const participant = test?.participants.find(
    (item) =>
      clean(item.userId) === clean(form.candidateId.value) &&
      clean(item.name) === clean(form.candidateName.value) &&
      samePassword(item, form.candidatePassword.value)
  );

  if (!test || !participant) {
    alert("등록된 정보와 일치하지 않습니다.");
    return;
  }

  if (isClosedResult(participant)) {
    alert("이미 검사가 완료된 대상자입니다. 관리자에게 문의해주세요.");
    return;
  }

  if ((participant.accessCount || 0) >= MAX_ACCESS_COUNT) {
    alert("접속 횟수 5회를 초과하여 더 이상 접속할 수 없습니다. 관리자에게 문의해주세요.");
    return;
  }

  participant.accessCount = (participant.accessCount || 0) + 1;
  ensureQuestionOrder(participant);
  candidateSession = { testId: test.id, participantId: participant.id };
  candidateAnswers = { ...(participant.progressAnswers || {}) };
  candidateDiscAnswers = { ...(participant.progressDiscAnswers || participant.discAnswers || {}) };
  candidatePhase = participant.progressPhase === "disc" ? "disc" : "egogram";
  candidateStep = candidatePhase === "disc" ? resumeDiscStep(candidateDiscAnswers) : resumeStep(participant, candidateAnswers);

  if (participant.result === "시작전") {
    participant.result = "진행중";
    participant.startedAt = nowText();
  }
  if (!participant.timerStartedAt) {
    participant.timerStartedAt = Date.now();
    participant.timerEndsAt = participant.timerStartedAt + TEST_DURATION_SECONDS * 1000;
  }
  participant.progressStep = candidateStep;
  participant.progressPhase = candidatePhase;
  saveTests();

  renderCandidateTest();
}

function resumeStep(participant, answers) {
  const activeQuestions = candidateQuestionList(participant);
  const savedStep = Number(participant.progressStep) || 0;
  const firstUnanswered = activeQuestions.findIndex((question) => answers[question.id] === undefined);
  if (firstUnanswered === -1) return Math.min(savedStep, Math.max(0, activeQuestions.length - 1));
  return Math.max(0, Math.min(savedStep, firstUnanswered, activeQuestions.length - 1));
}

function renderCandidateTest() {
  const test = tests.find((item) => item.id === candidateSession.testId);
  const participant = test.participants.find((item) => item.id === candidateSession.participantId);
  if (isClosedResult(participant)) {
    renderCandidateComplete();
    return;
  }
  if (remainingSeconds(participant) <= 0) {
    submitCandidateTest({ auto: true });
    return;
  }

  if (candidatePhase === "disc") {
    renderCandidateDiscQuestion(test, participant);
    return;
  }

  const activeQuestions = candidateQuestionList(participant);
  const question = activeQuestions[candidateStep];
  const answeredCount = Object.keys(candidateAnswers).length;
  const currentNumber = candidateStep + 1;
  startCandidateTimer();

  app.innerHTML = `
    <div class="candidate-shell">
      <section class="candidate-test">
        <header class="candidate-test-head">
          <div>
            <div class="candidate-logo">RSUPPORT</div>
            <h1>${test.title}</h1>
            <p>${participant.name} · ${participant.userId}</p>
            <div class="candidate-guide">
              <ol>
                <li>설문지 각 문항에 대해 업무 환경에서 보여주는 자신의 모습을 생각하면서 솔직하게 응답합니다.</li>
                <li>평소의 모습과 비슷하다고 생각하면 O(2점), 다르다고 생각하시면 X(0점)를 선택합니다.</li>
                <li>될 수 있으면 O(2점) 혹은 X(0점)를 선택하되, 판단하기 어려운 경우에 한해서 예외적으로 △(1점)를 선택합니다.</li>
              </ol>
              <div class="egogram-score-key"><span>X : 0점</span><span>△ : 1점</span><span>O : 2점</span></div>
            </div>
            ${candidateStageIndicator("egogram")}
          </div>
          <div class="candidate-status">
            <div class="candidate-time">남은 시간 <strong id="remainingTime">${formatTime(remainingSeconds(participant))}</strong></div>
            <div class="candidate-progress">에고그램 ${currentNumber} / ${activeQuestions.length}</div>
          </div>
        </header>
          <div class="candidate-question">
          <h2>${question.text}</h2>
          <div class="candidate-scale">
            ${[0, 1, 2].map((value) => `
              <button class="${candidateAnswers[question.id] === value ? "selected" : ""}" data-answer="${value}" type="button">
                <span>${egogramChoiceLabel(value)}</span>
              </button>
            `).join("")}
          </div>
          <div class="candidate-actions">
            <span></span>
            <button class="action-button primary" id="nextQuestion" type="button">${candidateStep === activeQuestions.length - 1 ? "제출" : "다음"}</button>
          </div>
        </div>
      </section>
    </div>
  `;

  document.querySelectorAll("[data-answer]").forEach((button) => {
    button.addEventListener("click", () => {
      candidateAnswers[question.id] = Number(button.dataset.answer);
      saveCandidateProgress();
      renderCandidateTest();
    });
  });
  document.querySelector("#nextQuestion").addEventListener("click", nextCandidateQuestion);
}

function scaleLabel(value) {
  return ["", "전혀 아니다", "아니다", "보통이다", "그렇다", "매우 그렇다"][value];
}

function egogramChoiceLabel(value) {
  const symbols = { 0: "X", 1: "△", 2: "O" };
  return `${symbols[value]} : ${value}점`;
}

function scaleNumber(value) {
  return ["", "①", "②", "③", "④", "⑤"][value];
}

function resumeDiscStep(answers) {
  const firstIncomplete = DISC_QUESTIONS.findIndex((_question, index) => {
    const row = answers[index + 1] || {};
    const values = DISC_TYPES.map((type) => Number(row[type])).filter((value) => Number.isInteger(value));
    return values.length !== 4 || new Set(values).size !== 4 || values.some((value) => value < 1 || value > 4);
  });
  return firstIncomplete < 0 ? 7 : firstIncomplete;
}

function renderCandidateDiscQuestion(test, participant) {
  const questionNumber = candidateStep + 1;
  const row = candidateDiscAnswers[questionNumber] || {};
  startCandidateTimer();
  app.innerHTML = `
    <div class="candidate-shell">
      <section class="candidate-test candidate-disc-test">
        <header class="candidate-test-head">
          <div>
            <div class="candidate-logo">RSUPPORT</div>
            <h1>${test.title}</h1>
            <p>${participant.name} · ${participant.userId}</p>
            <p class="candidate-guide">각 문항에서 네 항목에 1, 2, 3, 4점을 하나씩 중복 없이 선택해 주세요.<br />가장 본인에게 해당된다고 판단되는 항목에 4를, 해당되지 않는다고 판단되는 항목에 1을 기재합니다.</p>
            ${candidateStageIndicator("disc")}
          </div>
          <div class="candidate-status">
            <div class="candidate-time">남은 시간 <strong id="remainingTime">${formatTime(remainingSeconds(participant))}</strong></div>
            <div class="candidate-progress">DISC ${questionNumber} / ${DISC_QUESTIONS.length}</div>
          </div>
        </header>
        <div class="candidate-question">
          <h2>문항 ${questionNumber}</h2>
          <div class="disc-choice-list">
            ${DISC_TYPES.map((type) => `<label class="disc-choice"><span class="disc-word">${DISC_QUESTIONS[candidateStep][type]}</span><select data-disc-factor="${type}" aria-label="${DISC_QUESTIONS[candidateStep][type]} 점수"><option value="">점수 선택</option>${[1, 2, 3, 4].map((value) => `<option value="${value}" ${Number(row[type]) === value ? "selected" : ""}>${value}점</option>`).join("")}</select></label>`).join("")}
          </div>
          <p id="discValidationMessage" class="disc-validation-message" aria-live="polite">${discRowValidationMessage(row)}</p>
          <div class="candidate-actions">
            <button class="action-button" id="previousDisc" type="button" ${candidateStep === 0 ? "disabled" : ""}>이전</button>
            <button class="action-button primary" id="nextDisc" type="button">${candidateStep === DISC_QUESTIONS.length - 1 ? "DiSC 제출" : "다음"}</button>
          </div>
        </div>
      </section>
    </div>
  `;
  document.querySelectorAll("[data-disc-factor]").forEach((select) => {
    select.addEventListener("change", () => {
      candidateDiscAnswers[questionNumber] = { ...(candidateDiscAnswers[questionNumber] || {}), [select.dataset.discFactor]: Number(select.value) || null };
      document.querySelector("#discValidationMessage").textContent = discRowValidationMessage(candidateDiscAnswers[questionNumber]);
      saveCandidateProgress();
    });
  });
  document.querySelector("#previousDisc").addEventListener("click", () => {
    if (candidateStep > 0) {
      candidateStep -= 1;
      saveCandidateProgress();
      renderCandidateTest();
    }
  });
  document.querySelector("#nextDisc").addEventListener("click", nextDiscQuestion);
}

function candidateStageIndicator(activeStage) {
  const egogramClass = activeStage === "egogram" ? "active" : "complete";
  const discClass = activeStage === "disc" ? "active" : "pending";
  return `
    <div class="candidate-stage-indicator" aria-label="검사 진행 단계">
      <span class="${egogramClass}">1. 에고그램 <small>50문항</small></span>
      <b aria-hidden="true">→</b>
      <span class="${discClass}">2. DISC <small>8문항</small></span>
    </div>
  `;
}

function isValidDiscRow(row = {}) {
  const values = DISC_TYPES.map((type) => Number(row[type]));
  return values.every((value) => Number.isInteger(value) && value >= 1 && value <= 4)
    && new Set(values).size === 4;
}

function discRowValidationMessage(row = {}, showIncomplete = false) {
  const values = DISC_TYPES.map((type) => Number(row[type]));
  const selectedValues = values.filter((value) => Number.isInteger(value) && value >= 1 && value <= 4);
  if (new Set(selectedValues).size !== selectedValues.length) {
    return "점수가 중복되어 다음 문항으로 넘어갈 수 없습니다. 점수가 중복되지 않도록 수정해 주세요.";
  }
  if (showIncomplete && !isValidDiscRow(row)) {
    return "네 항목의 점수를 모두 선택해 주세요. 점수는 1, 2, 3, 4를 한 번씩 사용해야 합니다.";
  }
  return "";
}

function nextDiscQuestion() {
  const row = candidateDiscAnswers[candidateStep + 1] || {};
  if (!isValidDiscRow(row)) {
    document.querySelector("#discValidationMessage").textContent = discRowValidationMessage(row, true);
    return;
  }
  if (candidateStep < DISC_QUESTIONS.length - 1) {
    candidateStep += 1;
    saveCandidateProgress();
    renderCandidateTest();
    return;
  }
  submitCandidateTest();
}

function nextCandidateQuestion() {
  const test = tests.find((item) => item.id === candidateSession.testId);
  const participant = test.participants.find((item) => item.id === candidateSession.participantId);
  const activeQuestions = candidateQuestionList(participant);
  const question = activeQuestions[candidateStep];
  if (candidateAnswers[question.id] === undefined) {
    alert("계속하려면 0점, 1점, 2점 중 하나를 선택해 주세요.");
    return;
  }
  if (candidateStep < activeQuestions.length - 1) {
    candidateStep += 1;
    saveCandidateProgress();
    renderCandidateTest();
    return;
  }
  candidatePhase = "disc";
  candidateStep = 0;
  saveCandidateProgress();
  renderCandidateTest();
}

function startCandidateTimer() {
  clearInterval(candidateTimer);
  candidateTimer = setInterval(() => {
    const test = tests.find((item) => item.id === candidateSession?.testId);
    const participant = test?.participants.find((item) => item.id === candidateSession?.participantId);
    if (!participant) {
      clearInterval(candidateTimer);
      return;
    }
    const seconds = remainingSeconds(participant);
    const timerElement = document.querySelector("#remainingTime");
    if (timerElement) timerElement.textContent = formatTime(seconds);
    if (seconds <= 0) {
      clearInterval(candidateTimer);
      submitCandidateTest({ auto: true });
    }
  }, 1000);
}

function remainingSeconds(participant) {
  if (!participant.timerEndsAt) return TEST_DURATION_SECONDS;
  return Math.max(0, Math.ceil((participant.timerEndsAt - Date.now()) / 1000));
}

function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function saveCandidateProgress() {
  if (!candidateSession) return;
  const test = tests.find((item) => item.id === candidateSession.testId);
  const participant = test?.participants.find((item) => item.id === candidateSession.participantId);
  if (!participant) return;
  participant.progressStep = candidateStep;
  participant.progressAnswers = { ...candidateAnswers };
  participant.progressDiscAnswers = { ...candidateDiscAnswers };
  participant.progressPhase = candidatePhase;
  saveTests();
}

function submitCandidateTest(options = {}) {
  const test = tests.find((item) => item.id === candidateSession.testId);
  const participant = test.participants.find((item) => item.id === candidateSession.participantId);
  if (isClosedResult(participant)) {
    alert("이미 검사가 완료되어 다시 진행할 수 없습니다.");
    renderCandidateComplete();
    return;
  }

  participant.endedAt = nowText();
  participant.answers = { ...candidateAnswers };
  participant.progressAnswers = { ...candidateAnswers };
  participant.discAnswers = { ...candidateDiscAnswers };
  participant.progressDiscAnswers = { ...candidateDiscAnswers };
  participant.progressPhase = "complete";
  participant.progressStep = 0;
  participant.elapsedSeconds = elapsedSeconds(participant);
  participant.autoSubmitted = Boolean(options.auto);
  participant.assessment = calculateAssessment(candidateAnswers, participant);
  participant.discAssessment = calculateDiscAssessment(candidateDiscAnswers);
  participant.result = participant.assessment.invalid ? "결과무효" : "검사완료";
  participant.score = participant.assessment.totalScore;
  saveTests();
  clearInterval(candidateTimer);
  candidateSession = null;

  renderCandidateComplete();
}

function elapsedSeconds(participant) {
  if (!participant.timerStartedAt) return 0;
  return Math.max(0, Math.round(((participant.endedAt === "-" ? Date.now() : Date.now()) - participant.timerStartedAt) / 1000));
}

function renderCandidateComplete() {
  app.innerHTML = `
    <div class="candidate-shell">
      <section class="candidate-card complete">
        <div class="candidate-logo">RSUPPORT</div>
        <h1>인성검사를 완료해 주셔서 감사합니다.</h1>
        <p>소중한 시간을 내어 응답해 주신 내용은 정상적으로 접수되었습니다.</p>
      </section>
    </div>
  `;
}

function isClosedResult(participant) {
  return participant.result === "검사완료" || participant.result === "결과무효";
}

function calculateAssessment(answers, participant = {}) {
  {
    const activeQuestions = EGOGRAM_ITEMS;
    const unansweredIds = activeQuestions.filter((question) => answers[question.id] === undefined).map((question) => question.id);
    const factorScores = ["CP", "NP", "A", "FC", "AC"].map((factor) => {
      const items = activeQuestions.filter((question) => question.factor === factor);
      const itemScores = items.map((question) => answers[question.id] === undefined ? null : Number(answers[question.id]) || 0);
      const score = itemScores.reduce((sum, value) => sum + (value ?? 0), 0);
      const grade = score < 10 ? "C" : score < 15 ? "B" : "A";
      return { factor, category: "에고그램", score, grade, level: grade, itemCount: items.length, itemScores };
    });
    const profileCode = factorScores.map((item) => item.grade).join("");
    const profile = EGOGRAM_PROFILES[profileCode] || {
      title: `${profileCode} 유형`,
      text: "첨부된 결과지에서 이 유형의 설명을 찾을 수 없습니다.",
    };
    const totalScore = factorScores.reduce((sum, item) => sum + item.score, 0);
    return {
      totalScore,
      personalityScore: totalScore,
      level: profileCode,
      invalid: false,
      invalidByUnanswered: unansweredIds.length > 0,
      unansweredWarning: unansweredIds.length > 0,
      unansweredIds,
      unansweredCount: unansweredIds.length,
      unansweredRate: unansweredIds.length / activeQuestions.length,
      totalQuestions: activeQuestions.length,
      factorScores,
      talentScores: factorScores,
      workstyleScores: [],
      cwbScores: [],
      reliability: { grade: "해당 없음" },
      cwbRisk: null,
      cwbRiskLevel: "해당 없음",
      bestType: profileCode,
      profileCode,
      profile,
      strengths: [],
      weaknesses: [],
      interpretations: [],
      aiAnalysis: profile.text,
    };
  }
  const activeQuestions = candidateQuestionList(participant);
  const unansweredIds = activeQuestions.filter((question) => answers[question.id] === undefined).map((question) => question.id);
  const totalQuestions = activeQuestions.length;
  const answeredValues = activeQuestions.map((question) => answers[question.id]).filter((value) => value !== undefined);
  const unansweredRate = totalQuestions ? unansweredIds.length / totalQuestions : 0;
  const elapsed = Number(participant.elapsedSeconds) || 0;
  const repeatRate = mostRepeatedRate(answeredValues);
  const questionMap = Object.fromEntries(allCandidateQuestionBank().map((question) => [question.id, question]));
  const scoreQuestion = (id) => {
    const rawScore = answers[id];
    const question = questionMap[id];
    if (rawScore === undefined || !question) return null;
    return question.reverse ? 6 - rawScore : rawScore;
  };
  const scoreFactor = (category, factor, ids) => {
    const values = ids.map(scoreQuestion).filter((score) => score !== null);
    const rawAverage = values.length ? values.reduce((sum, score) => sum + score, 0) / values.length : 0;
    const score10 = Math.round(rawAverage * 2);
    return {
      category,
      factor,
      score: score10,
      level: scoreLevel(score10),
      rawAverage: Number(rawAverage.toFixed(2)),
      risk: category === "CWB",
    };
  };

  const talentScores = Object.entries(SCORING_RULES.talent).map(([factor, ids]) => scoreFactor("인재상", factor, ids));
  const workstyleScores = Object.entries(SCORING_RULES.workstyle).map(([factor, ids]) => scoreFactor("Workstyle", factor, ids));
  const cwbScores = Object.entries(SCORING_RULES.cwb).map(([factor, ids]) => scoreFactor("CWB", factor, ids));
  const factorScores = [...talentScores, ...workstyleScores, ...cwbScores];

  const reliability = calculateReliability(answers, { unansweredRate, elapsedSeconds: elapsed, repeatRate, questionMap });
  const invalidByUnanswered = unansweredRate > 0.1;
  const invalidByAttention = reliability.attentionErrors.length >= 2;
  const invalidByTime = elapsed > 0 && elapsed < MIN_VALID_RESPONSE_SECONDS;
  const invalidByRepeat = repeatRate >= 0.9;
  const invalid = invalidByUnanswered || invalidByAttention || invalidByTime || invalidByRepeat;
  const talentAverage = averageScore(talentScores);
  const workstyleAverage = averageScore(workstyleScores);
  const cwbAverage = averageScore(cwbScores);
  const reliabilityScore = reliability.grade === "양호" ? 10 : reliability.grade === "주의" ? 6 : 2;
  let personalityScore = Number(
    (talentAverage * 0.35 + workstyleAverage * 0.35 + (10 - cwbAverage) * 0.2 + reliabilityScore * 0.1).toFixed(2)
  );
  if (talentAverage <= 4 && workstyleAverage <= 4) {
    personalityScore = Math.min(personalityScore, 3.9);
  }
  const level = reliability.grade === "낮음" ? "I" : personalityLevel(personalityScore);
  const bestType = calculateBestType([...talentScores, ...workstyleScores, ...cwbScores]);
  const strengths = [...workstyleScores].sort((a, b) => b.score - a.score).slice(0, 3);
  const weaknesses = [...workstyleScores].sort((a, b) => a.score - b.score).slice(0, 2);

  return {
    totalScore: Math.round(personalityScore * 10),
    personalityScore,
    level,
    invalid,
    invalidByUnanswered,
    invalidByAttention,
    invalidByTime,
    invalidByRepeat,
    unansweredWarning: unansweredRate > 0.05,
    unansweredIds,
    unansweredCount: unansweredIds.length,
    unansweredRate,
    totalQuestions,
    elapsedSeconds: elapsed,
    repeatRate,
    talentAverage,
    workstyleAverage,
    cwbRisk: cwbAverage,
    cwbRiskLevel: cwbRiskLevel(cwbAverage),
    factorScores,
    talentScores,
    workstyleScores,
    cwbScores,
    reliability,
    validationItems: reliability.validationItems,
    attentionErrors: reliability.attentionErrors,
    attentionWarning: reliability.attentionErrors.length > 0,
    bestType,
    strengths,
    weaknesses,
    interpretations: buildInterpretations([...strengths, ...weaknesses]),
    aiAnalysis: buildAiAnalysis({
      bestType,
      level,
      talentAverage,
      workstyleAverage,
      strengths,
      weaknesses,
      cwbRiskLevel: cwbRiskLevel(cwbAverage),
      reliabilityGrade: reliability.grade,
    }),
  };
}

function mostRepeatedRate(values) {
  if (!values.length) return 0;
  const counts = values.reduce((acc, value) => {
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
  return Math.max(...Object.values(counts)) / values.length;
}

function averageScore(items) {
  if (!items.length) return 0;
  return Number((items.reduce((sum, item) => sum + item.score, 0) / items.length).toFixed(2));
}

function scoreLevel(score) {
  if (score <= 2) return "VERY LOW";
  if (score <= 4) return "LOW";
  if (score <= 6) return "AVERAGE";
  if (score <= 8) return "HIGH";
  return "VERY HIGH";
}

function interpretationLevel(level) {
  if (level === "VERY HIGH" || level === "HIGH") return "HIGH";
  if (level === "LOW" || level === "VERY LOW") return "LOW";
  return "AVERAGE";
}

function personalityLevel(score) {
  if (score >= 9) return "S";
  if (score >= 8) return "A";
  if (score >= 7) return "A-";
  if (score >= 6) return "B";
  if (score >= 5) return "B-";
  if (score >= 4) return "C";
  if (score >= 3) return "D";
  return "F";
}

function cwbRiskLevel(score) {
  if (score <= 4) return "양호";
  if (score <= 6) return "주의";
  return "위험";
}

function calculateReliability(answers, context = {}) {
  const honestyRiskIds = SCORING_RULES.reliability.응답솔직성.filter((id) => (answers[id] || 0) >= 4);
  const attentionErrors = [];
  if (answers.Q143 !== 3) attentionErrors.push("Q143");
  if (answers.Q144 !== 2) attentionErrors.push("Q144");

  const consistencyPairs = [
    ["Q094", "Q098"],
    ...EXTRA_VALIDATION_QUESTIONS.map((question) => [question.sourceId, question.id]),
  ];
  const consistencyErrors = consistencyPairs.filter(([left, right]) => {
    const leftScore = adjustedAnswerScore(left, answers, context.questionMap);
    const rightScore = adjustedAnswerScore(right, answers, context.questionMap);
    if (leftScore === null || rightScore === null) return false;
    return Math.abs(leftScore - rightScore) >= 3;
  });

  let grade = "양호";
  if (
    honestyRiskIds.length >= 5 ||
    consistencyErrors.length >= 5 ||
    attentionErrors.length >= 2 ||
    context.unansweredRate > 0.1 ||
    (context.elapsedSeconds > 0 && context.elapsedSeconds < MIN_VALID_RESPONSE_SECONDS) ||
    context.repeatRate >= 0.9
  ) {
    grade = "낮음";
  } else if (honestyRiskIds.length >= 3 || consistencyErrors.length >= 3 || attentionErrors.length === 1 || context.unansweredRate > 0.05) {
    grade = "주의";
  }

  return {
    grade,
    honestyRiskIds,
    consistencyErrors,
    attentionErrors,
    validationItems: [...honestyRiskIds, ...attentionErrors, ...consistencyErrors.flat()].map((id) => ({ id })),
  };
}

function adjustedAnswerScore(id, answers, questionMap = {}) {
  const rawScore = answers[id];
  const question = questionMap[id] || questionById(id);
  if (rawScore === undefined || !question) return null;
  return question.reverse ? 6 - rawScore : rawScore;
}

function factorLookup(scores) {
  return Object.fromEntries(scores.map((item) => [item.factor, item.score]));
}

function axisAverage(axis, lookup) {
  const factors = BEST_TYPE_RULES[axis].filter((factor) => lookup[factor] !== undefined);
  if (!factors.length) return 0;
  return factors.reduce((sum, factor) => sum + lookup[factor], 0) / factors.length;
}

function calculateBestType(scores) {
  const lookup = factorLookup(scores);
  const t = axisAverage("T", lookup);
  const c = axisAverage("C", lookup);
  const a = axisAverage("A", lookup);
  const p = 10 - a;
  const o = axisAverage("O", lookup);
  const i = axisAverage("I", lookup);
  const e = axisAverage("E", lookup);
  const r = axisAverage("R", lookup);
  return `${t >= c ? "T" : "C"}${p >= a ? "P" : "A"}${i >= o ? "I" : "O"}${e >= r ? "E" : "R"}`;
}

function buildInterpretations(items) {
  return items.map((item) => {
    const db = INTERPRETATION_DB[item.factor];
    const key = interpretationLevel(item.level);
    return {
      factor: item.factor,
      level: item.level,
      text: db?.[key] || `${item.factor} 항목은 ${item.level} 수준으로 나타났습니다.`,
    };
  });
}

function buildAiAnalysis({ bestType, level, talentAverage, workstyleAverage, strengths, weaknesses, cwbRiskLevel, reliabilityGrade }) {
  const strengthNames = strengths.map((item) => item.factor).join(", ");
  const weaknessNames = weaknesses.map((item) => item.factor).join(", ");
  const workTone = workstyleAverage >= 7
    ? "업무를 주도적으로 정리하고 실행 속도를 유지하려는 경향이 있습니다"
    : workstyleAverage >= 5
      ? "업무 상황에 따라 신중하게 속도를 조절하며 안정적인 수행을 선호합니다"
      : "업무 추진 과정에서 명확한 기준과 외부 점검이 있을 때 더 안정적으로 움직일 수 있습니다";
  const relationTone = strengths.some((item) => ["협력", "팀워크", "대인이해", "사교성"].includes(item.factor))
    ? "타인과의 상호작용에서 정보를 나누고 관계 흐름을 고려하는 편입니다"
    : "대인관계에서는 넓은 교류보다 역할과 기준이 분명한 소통을 선호할 가능성이 있습니다";
  const adaptTone = talentAverage >= 7
    ? "조직의 목표와 변화 요구를 비교적 빠르게 받아들이며 역할 확장에도 대응할 수 있습니다"
    : "조직 적응에는 큰 무리가 없으나 변화가 잦은 환경에서는 우선순위 정리가 필요합니다";
  const riskTone = cwbRiskLevel === "위험"
    ? "다만 감정적 반응이나 조직 규범과의 충돌 가능성은 관리가 필요합니다"
    : cwbRiskLevel === "주의"
      ? "일부 상황에서는 긴장이나 불편감이 행동으로 드러날 수 있어 점검이 필요합니다"
      : "조직 내 부적응 위험은 비교적 낮은 편으로 해석됩니다";
  const reliabilityTone = reliabilityGrade === "양호"
    ? "응답 신뢰도는 해석 가능한 수준입니다"
    : "응답 신뢰도에 일부 유의점이 있어 결과 해석 시 보수적인 확인이 필요합니다";

  return `
    <p><strong>[업무 스타일]</strong><br />BEST ${bestType} 유형과 인성 레벨 ${level}을 종합하면, ${workTone}.</p>
    <p><strong>[대인관계]</strong><br />${relationTone}. ${adaptTone}.</p>
    <p><strong>[강점]</strong><br />상대적으로 두드러지는 영역은 ${strengthNames || "확인되지 않음"}이며, 주어진 환경에서 이 특성이 성과의 기반이 될 수 있습니다.</p>
    <p><strong>[주의점]</strong><br />보완이 필요한 영역은 ${weaknessNames || "확인되지 않음"}입니다. ${riskTone}.</p>
    <p><strong>[종합 의견]</strong><br />${reliabilityTone}. 강점이 발휘될 수 있는 명확한 역할과 피드백 구조가 있는 환경에서 안정적으로 성과를 낼 가능성이 있습니다.</p>
  `;
}

function invalidAnalysis() {
  return `
    <p><strong>[업무 스타일]</strong><br />응답 신뢰도가 낮아 업무 스타일을 단정적으로 해석하기 어렵습니다.</p>
    <p><strong>[대인관계]</strong><br />대인관계 특성 역시 추가 확인이 필요합니다.</p>
    <p><strong>[강점]</strong><br />결과 무효 조건에 해당하여 강점을 산출하지 않습니다.</p>
    <p><strong>[주의점]</strong><br />미응답, 주의력 검증, 응답 시간 또는 반복 응답 여부를 확인해야 합니다.</p>
    <p><strong>[종합 의견]</strong><br />현재 결과만으로 채용 판단에 활용하기 어렵습니다.</p>
  `;
}

function toggleParticipant(checkbox) {
  if (checkbox.checked) selectedParticipants.add(checkbox.dataset.participantCheck);
  else selectedParticipants.delete(checkbox.dataset.participantCheck);
}

function toggleCurrentPage(test, checked) {
  const pageCount = Math.max(1, Math.ceil(test.participants.length / PAGE_SIZE));
  const currentPage = Math.min(route.page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  test.participants.slice(start, start + PAGE_SIZE).forEach((participant) => {
    if (checked) selectedParticipants.add(participant.id);
    else selectedParticipants.delete(participant.id);
  });
  render();
}

function editSelectedParticipant() {
  if (!selectedParticipants.size) {
    alert("수정할 검사대상자를 선택해주세요.");
    return;
  }
  if (selectedParticipants.size > 1) {
    alert("수정은 한 명만 선택해주세요.");
    return;
  }
  modalMode = "edit";
  render();
}

function openResultReport() {
  if (!selectedParticipants.size) {
    alert("검사결과표를 인쇄할 대상자를 선택해주세요.");
    return;
  }
  modalMode = "report";
  render();
}

async function copyCandidateLink() {
  const link = new URL("index.html?page=candidate", location.href).href;

  try {
    await navigator.clipboard.writeText(link);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = link;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }

  alert("지원자 링크가 복사되었습니다.");
}

function selectedParticipant(test) {
  const [selectedId] = Array.from(selectedParticipants);
  return test.participants.find((participant) => participant.id === selectedId);
}

function selectedParticipantList(test) {
  return test.participants.filter((participant) => selectedParticipants.has(participant.id));
}

function saveParticipant(event, test, mode) {
  event.preventDefault();
  const form = event.currentTarget;
  const participantData = {
    userId: form.userId.value.trim(),
    name: form.name.value.trim(),
    password: form.password.value.trim(),
    gender: form.gender.value.trim(),
    job: form.job.value.trim(),
    company: form.company.value.trim(),
  };

  if (mode === "edit") {
    const participant = selectedParticipant(test);
    Object.assign(participant, participantData);
  } else {
    test.participants.push({
      id: makeId("participant"),
      ...participantData,
      startedAt: "-",
      endedAt: "-",
      result: "시작전",
      accessCount: 0,
      progressStep: 0,
      progressAnswers: {},
    });
  }

  saveTests();
  modalMode = null;
  if (mode === "create") {
    location.hash = `#detail:${test.id}:${Math.ceil(test.participants.length / PAGE_SIZE)}`;
  }
  route = parseRoute();
  render();
}

function deleteSelectedParticipants(test) {
  if (!selectedParticipants.size) {
    alert("삭제할 검사대상자를 선택해주세요.");
    return;
  }
  test.participants = test.participants.filter((participant) => !selectedParticipants.has(participant.id));
  selectedParticipants = new Set();
  saveTests();
  const pageCount = Math.max(1, Math.ceil(test.participants.length / PAGE_SIZE));
  if (route.page > pageCount) {
    location.hash = `#detail:${test.id}:${pageCount}`;
    route = parseRoute();
  }
  render();
}

function ensureDemoResultParticipants(participants, test) {
  if (participants.some((participant) => String(participant.userId || "").startsWith("demo"))) return participants;

  const demos = [
    { name: "성실형", job: "운영", high: ["책임감", "꼼꼼함", "윤리", "신뢰", "인내"], low: ["충동성"] },
    { name: "리더형", job: "영업관리", high: ["리더십", "성취지향성", "도전", "자발성"], low: ["무책임"] },
    { name: "협업형", job: "고객지원", high: ["협력", "팀워크", "대인이해", "사교성"], low: ["독립"] },
    { name: "분석형", job: "기획", high: ["분석적사고", "전문성", "꼼꼼함", "자기통제"], low: ["충동성", "사교성"] },
    { name: "창의형", job: "마케팅", high: ["창의", "혁신", "도전", "적응성/융통성"], low: ["꼼꼼함"] },
    { name: "안정형", job: "재무", high: ["신뢰", "윤리", "자기통제", "스트레스내성"], low: ["도전", "혁신"] },
    { name: "충동형", job: "영업", high: ["사교성", "도전", "충동성"], low: ["자기통제", "꼼꼼함"] },
    { name: "스트레스취약형", job: "CS", high: ["대인이해", "협력"], low: ["스트레스내성", "자기통제"] },
    { name: "독립형", job: "개발", high: ["독립", "분석적사고", "전문성"], low: ["팀워크", "사교성"] },
    { name: "외향형", job: "해외영업", high: ["사교성", "대인이해", "글로벌마인드", "협력"], low: ["독립"] },
    { name: "내향형", job: "리서치", high: ["독립", "분석적사고", "인내", "전문성"], low: ["사교성", "리더십"] },
    { name: "균형형", job: "인사", high: ["신뢰", "협력", "책임감"], low: [] },
  ];

  const added = demos.map((demo, index) => makeDemoParticipant(test, demo, index));
  return [...participants, ...added];
}

function makeDemoParticipant(test, demo, index) {
  const participant = {
    id: makeId("demo"),
    userId: `demo${String(index + 1).padStart(3, "0")}`,
    password: "1234",
    name: demo.name,
    gender: index % 2 === 0 ? "여" : "남",
    job: demo.job,
    company: "알서포트",
    startedAt: `${formatDate(test.startDate)} 09:${String(index).padStart(2, "0")}:00`,
    endedAt: `${formatDate(test.startDate)} 09:${String(index + 25).padStart(2, "0")}:00`,
    result: "검사완료",
    accessCount: 1,
    progressStep: 0,
    progressAnswers: {},
    timerStartedAt: Date.now() - 1500 * 1000,
    timerEndsAt: Date.now(),
    elapsedSeconds: 1500,
    questionOrder: [],
    questionOrderVersion: QUESTION_ORDER_VERSION,
  };
  ensureQuestionOrder(participant);
  participant.answers = makeDemoAnswers(participant.questionOrder, demo);
  participant.progressAnswers = { ...participant.answers };
  participant.assessment = calculateAssessment(participant.answers, participant);
  participant.score = participant.assessment.totalScore;
  return participant;
}

function makeDemoAnswers(order, demo) {
  return Object.fromEntries(order.map((id) => {
    const question = questionById(id);
    if (id === "Q143") return [id, 3];
    if (id === "Q144") return [id, 2];
    const factor = question?.factor || "";
    let desiredScore = 3;
    if (demo.high.includes(factor)) desiredScore = 5;
    if (demo.low.includes(factor)) desiredScore = 2;
    if (question?.category === "CWB" && !demo.high.includes(factor)) desiredScore = 2;
    if (question?.category === "신뢰도") desiredScore = 2;
    const rawScore = question?.reverse ? 6 - desiredScore : desiredScore;
    return [id, Math.max(1, Math.min(5, rawScore))];
  }));
}

function makeSampleParticipants(test) {
  const names = ["최선영", "김근우", "조혜식", "송슬혜", "이현기", "이기욱", "장혜인", "박종훈", "이우현", "유지훈", "정의준", "김민성", "김수연", "원지수", "이혜진", "김유진", "김경규", "연미령", "이두역", "김경원", "백소희", "이아름", "박준호", "한지민", "서민재", "강다은", "정우진", "오세린", "문하늘", "임도윤", "최윤아", "박시현", "류지호", "권나래", "홍유찬", "신예린", "배건우", "윤서진", "하민준", "차소율", "남도현", "안지우", "전해린"];
  const jobs = ["CBOX영업", "제품 기술 영업", "기술지원 엔지니어", "Flutter 개발", "UX 기획", "마케팅 전략 실장", "SaaS 영업", "프론트 개발", "갱신 영업", "해외영업"];
  const status = statusOf(test).label;

  return names.map((name, index) => {
    const done = status === "마감" || index % 4 !== 0;
    const result = status === "시작전" ? "시작전" : done ? "검사완료" : "진행중";
    return {
      id: makeId("participant"),
      userId: `r26${String(index + 100122).padStart(6, "0")}`,
      password: `pw${String(index + 1).padStart(4, "0")}`,
      name,
      gender: index % 3 === 0 ? "남" : "여",
      job: jobs[index % jobs.length],
      company: "알서포트",
      startedAt: result === "시작전" ? "-" : `${test.startDate.replaceAll("-", ".")} ${String(8 + (index % 10)).padStart(2, "0")}:${String(10 + index).padStart(2, "0")}:18`,
      endedAt: result === "검사완료" ? `${test.endDate.replaceAll("-", ".")} ${String(9 + (index % 9)).padStart(2, "0")}:${String(20 + index).padStart(2, "0")}:52` : "-",
      result,
      accessCount: result === "시작전" ? 0 : 1 + (index % 3),
      progressStep: 0,
      progressAnswers: {},
    };
  });
}

function formatDateInput(event) {
  const input = event.currentTarget;
  const numbers = input.value.replace(/\D/g, "").slice(0, 8);
  const year = numbers.slice(0, 4);
  const month = numbers.slice(4, 6);
  const day = numbers.slice(6, 8);
  input.value = [year, month, day].filter(Boolean).join("-");
}

function createTest(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const title = form.title.value.trim();
  const startDate = form.startDate.value;
  const endDate = form.endDate.value;
  const error = document.querySelector("#error");

  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    error.textContent = "날짜는 2026-01-01 형식으로 정확히 입력해주세요.";
    error.hidden = false;
    return;
  }

  if (endDate < startDate) {
    error.textContent = "마감일은 검사 시작일보다 빠를 수 없습니다.";
    error.hidden = false;
    return;
  }

  tests.unshift({
    id: makeId("test"),
    title,
    startDate,
    endDate,
    createdAt: new Date().toLocaleDateString("ko-KR"),
    participants: [],
  });

  saveTests();
  location.hash = "#main";
  route = { tab: "main", testId: null, page: 1 };
  render();
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return false;
  const [year, month, day] = value.split("-").map(Number);
  return date.getFullYear() === year && date.getMonth() + 1 === month && date.getDate() === day;
}

function deleteTest(id) {
  tests = tests.filter((test) => test.id !== id);
  saveTests();
  if (route.testId === id) {
    location.hash = "#main";
    route = { tab: "main", testId: null, page: 1 };
  }
  render();
}

function statusOf(test, today = new Date().toISOString().slice(0, 10)) {
  if (today < test.startDate) return { key: "pending", label: "시작전" };
  if (today > test.endDate) return { key: "closed", label: "마감" };
  return { key: "active", label: "진행중" };
}

function formatDate(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("ko-KR");
}

saveTests();
render();
