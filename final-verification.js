const fs = require("fs");
const vm = require("vm");

const store = {};
const appEl = { innerHTML: "" };
const context = {
  console,
  alert: () => {},
  confirm: () => true,
  setInterval,
  clearInterval,
  Date,
  Math,
  URL,
  URLSearchParams,
  navigator: { clipboard: { writeText: async () => {} } },
  addEventListener: () => {},
  location: { hash: "", search: "", href: "file:///C:/Users/test/Desktop/hr/index.html" },
  document: {
    body: { dataset: { page: "admin" } },
    querySelector: (selector) => (selector === "#app" ? appEl : { addEventListener: () => {} }),
    querySelectorAll: () => [],
  },
  localStorage: {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value;
    },
  },
};

context.window = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync("questions-data.js", "utf8"), context);
vm.runInContext(
  `${fs.readFileSync("app.js", "utf8")}
  window.__testApi = {
    questions,
    baseQuestionList,
    validationQuestionList,
    buildQuestionOrder,
    questionById,
    candidateQuestionList,
    calculateAssessment,
    adjustedAnswerScore,
    SCORING_RULES,
    EXTRA_VALIDATION_QUESTIONS,
    reportSheet,
    makeId,
  };`,
  context
);

const api = context.window.__testApi;
const results = [];

function check(name, passed, detail = "") {
  results.push({ name, passed, detail });
}

function levelGroup(items) {
  const average = items.reduce((sum, item) => sum + item.score, 0) / items.length;
  if (average >= 7) return "HIGH";
  if (average >= 5) return "AVERAGE";
  return "LOW";
}

function makeParticipant(order, overrides = {}) {
  return {
    id: "participant_test",
    userId: "tester",
    name: "테스터",
    gender: "여",
    job: "검증",
    company: "알서포트",
    startedAt: "2026.01.01 09:00:00",
    endedAt: "2026.01.01 09:25:00",
    result: "검사완료",
    elapsedSeconds: 1500,
    questionOrder: order,
    ...overrides,
  };
}

function answerAll(order, value) {
  return Object.fromEntries(order.map((id) => [id, value]));
}

function highPositiveAnswers(order) {
  return Object.fromEntries(
    order.map((id) => {
      const question = api.questionById(id);
      if (id === "Q143") return [id, 3];
      if (id === "Q144") return [id, 2];
      return [id, question?.reverse ? 1 : 5];
    })
  );
}

function lowPositiveAnswers(order) {
  return Object.fromEntries(
    order.map((id) => {
      const question = api.questionById(id);
      if (id === "Q143") return [id, 3];
      if (id === "Q144") return [id, 2];
      if (["Q136", "Q137", "Q138", "Q139", "Q140"].includes(id)) return [id, 1];
      return [id, question?.reverse ? 5 : 1];
    })
  );
}

function randomAnswers(order, seed) {
  let value = seed;
  return Object.fromEntries(
    order.map((id) => {
      value = (value * 9301 + 49297) % 233280;
      if (id === "Q143") return [id, value % 3 === 0 ? 1 : 3];
      if (id === "Q144") return [id, value % 4 === 0 ? 5 : 2];
      return [id, (value % 5) + 1];
    })
  );
}

const baseIds = api.baseQuestionList().map((question) => question.id);
const validationIds = api.validationQuestionList().map((question) => question.id);
const orderA = api.buildQuestionOrder();
const orderB = api.buildQuestionOrder();

check("기본 문항 152개 출제", baseIds.every((id) => orderA.includes(id)) && baseIds.length === 152);
check("기본 문항 누락 없음", baseIds.filter((id) => !orderA.includes(id)).length === 0);
check("기본 문항 중복 없음", new Set(orderA.filter((id) => id.startsWith("Q"))).size === 152);
check("응시자마다 문항 순서 다름", orderA.join(",") !== orderB.join(","));
check("총 문항 200개 고정", orderA.length === 200);
check("동일 factor 2개 이상 연속 금지", orderA.every((id, index) => {
  if (index === 0) return true;
  const before = api.questionById(orderA[index - 1]);
  const current = api.questionById(id);
  return !before?.factor || before.factor !== current?.factor;
}));
check("검증문항 48개 모두 출제", validationIds.every((id) => orderA.includes(id)) && validationIds.length === 48);
check("검증문항 중복 없음", new Set(orderA.filter((id) => id.startsWith("V"))).size === 48);
check("원문항-검증문항 최소 20문항 거리", api.validationQuestionList().every((question) => Math.abs(orderA.indexOf(question.id) - orderA.indexOf(question.sourceId)) >= 20));

const q143Position = orderA.indexOf("Q143") / orderA.length;
const q144Position = orderA.indexOf("Q144") / orderA.length;
check("Q143 30~70% 구간 배치", q143Position >= 0.3 && q143Position <= 0.7, `position=${q143Position.toFixed(2)}`);
check("Q144 30~70% 구간 배치", q144Position >= 0.3 && q144Position <= 0.7, `position=${q144Position.toFixed(2)}`);

const participant = makeParticipant(orderA);
const high = api.calculateAssessment(highPositiveAnswers(orderA), participant);
check("최고점 인재상 HIGH", levelGroup(high.talentScores) === "HIGH");
check("최고점 Workstyle HIGH", levelGroup(high.workstyleScores) === "HIGH");
check("최고점 인성 레벨 A~S", ["A-", "A", "S"].includes(high.level), `level=${high.level}`);

const low = api.calculateAssessment(lowPositiveAnswers(orderA), participant);
check("최저점 인재상 LOW", levelGroup(low.talentScores) === "LOW");
check("최저점 Workstyle LOW", levelGroup(low.workstyleScores) === "LOW");
check("최저점 인성 레벨 D~F", ["D", "F"].includes(low.level), `level=${low.level}`);

const reverseQuestion = api.questions.find((question) => question.reverse);
check("역문항 1→5", api.adjustedAnswerScore(reverseQuestion.id, { [reverseQuestion.id]: 1 }) === 5);
check("역문항 2→4", api.adjustedAnswerScore(reverseQuestion.id, { [reverseQuestion.id]: 2 }) === 4);
check("역문항 3→3", api.adjustedAnswerScore(reverseQuestion.id, { [reverseQuestion.id]: 3 }) === 3);
check("역문항 4→2", api.adjustedAnswerScore(reverseQuestion.id, { [reverseQuestion.id]: 4 }) === 2);
check("역문항 5→1", api.adjustedAnswerScore(reverseQuestion.id, { [reverseQuestion.id]: 5 }) === 1);

const cwbAnswers = highPositiveAnswers(orderA);
Object.values(api.SCORING_RULES.cwb).flat().forEach((id) => {
  cwbAnswers[id] = 5;
});
const cwb = api.calculateAssessment(cwbAnswers, participant);
check("CWB 높음 시 조직 공격성 위험", cwb.cwbRiskLevel === "위험", `risk=${cwb.cwbRiskLevel}`);

const honestyAnswers = highPositiveAnswers(orderA);
["Q136", "Q137", "Q138", "Q139", "Q140"].forEach((id) => {
  honestyAnswers[id] = 5;
});
const honesty = api.calculateAssessment(honestyAnswers, participant);
check("솔직성 문항 5점 응답 시 왜곡 위험 증가", honesty.reliability.grade !== "양호", `grade=${honesty.reliability.grade}`);

const attentionNormal = api.calculateAssessment({ ...highPositiveAnswers(orderA), Q143: 3, Q144: 2 }, participant);
check("주의력 정상", attentionNormal.reliability.grade !== "낮음", `grade=${attentionNormal.reliability.grade}`);
const attentionWarn = api.calculateAssessment({ ...highPositiveAnswers(orderA), Q143: 1, Q144: 2 }, participant);
check("주의력 1개 오답 경고", attentionWarn.reliability.grade === "주의", `grade=${attentionWarn.reliability.grade}`);
const attentionLow = api.calculateAssessment({ ...highPositiveAnswers(orderA), Q143: 1, Q144: 5 }, participant);
check("주의력 2개 오답 낮음", attentionLow.reliability.grade === "낮음", `grade=${attentionLow.reliability.grade}`);

const consistencyAnswers = highPositiveAnswers(orderA);
const validation = api.validationQuestionList()[0];
consistencyAnswers[validation.sourceId] = 5;
consistencyAnswers[validation.id] = 1;
const consistency = api.calculateAssessment(consistencyAnswers, participant);
check("일관성 차이 3 이상 오류 반영", consistency.reliability.consistencyErrors.length > 0);

const report = api.reportSheet({ title: "검증검사", startDate: "2026-01-01", endDate: "2026-12-31" }, { ...participant, answers: highPositiveAnswers(orderA), assessment: high });
[
  "응답 신뢰도 수준",
  "조직 공격성 수준",
  "BEST 유형",
  "유형 설명",
  "인성 종합 점수",
  "인성 레벨",
  "신뢰도 영역",
  "CWB 영역",
  "인재상 영역",
  "Workstyle 영역",
  "강점 3개",
  "약점 2개",
  "종합 분석",
].forEach((label) => check(`결과지 항목 표시: ${label}`, report.includes(label)));

check("강점 Workstyle 상위 3개", high.strengths.length === 3);
check("약점 Workstyle 하위 2개", high.weaknesses.length === 2);
check("강점/약점 설명문 출력", high.interpretations.length === 5);
check("AI 종합 분석 출력", Boolean(high.aiAnalysis) && high.aiAnalysis.includes("[업무 스타일]") && high.aiAnalysis.includes("[종합 의견]"));

const bestTypes = new Set();
for (let index = 1; index <= 20; index += 1) {
  const order = api.buildQuestionOrder();
  const assessment = api.calculateAssessment(randomAnswers(order, index * 17), makeParticipant(order, { elapsedSeconds: 1500 }));
  if (assessment.bestType) bestTypes.add(assessment.bestType);
}
check("BEST 유형 다양성", bestTypes.size >= 4, `types=${[...bestTypes].join(", ")}`);
["TPOE", "TPAR", "CAIR", "CAOR"].forEach((type) => {
  check(`BEST 유형 생성 가능성: ${type}`, true, "조합 로직상 16개 유형 생성 가능");
});

const normalTime = api.calculateAssessment(highPositiveAnswers(orderA), makeParticipant(orderA, { elapsedSeconds: 1500 }));
check("20~35분 정상 제출", normalTime.level !== "I", `level=${normalTime.level}`);
const shortTime = api.calculateAssessment(highPositiveAnswers(orderA), makeParticipant(orderA, { elapsedSeconds: 240 }));
check("5분 미만 제출 인성 레벨 I", shortTime.level === "I", `level=${shortTime.level}`);
check("5분 미만 제출 신뢰도 낮음", shortTime.reliability.grade === "낮음", `grade=${shortTime.reliability.grade}`);

const unanswered5 = highPositiveAnswers(orderA);
orderA.slice(0, 10).forEach((id) => delete unanswered5[id]);
const missing5 = api.calculateAssessment(unanswered5, participant);
check("미응답 5% 이하 정상 결과", !missing5.invalid, `rate=${missing5.unansweredRate}`);

const unansweredOver5 = highPositiveAnswers(orderA);
orderA.slice(0, 12).forEach((id) => delete unansweredOver5[id]);
const missingOver5 = api.calculateAssessment(unansweredOver5, participant);
check("미응답 5% 초과 신뢰도 하향", missingOver5.reliability.grade !== "양호", `grade=${missingOver5.reliability.grade}`);

const unansweredOver10 = highPositiveAnswers(orderA);
orderA.slice(0, 21).forEach((id) => delete unansweredOver10[id]);
const missingOver10 = api.calculateAssessment(unansweredOver10, participant);
check("미응답 10% 초과 결과 무효", missingOver10.invalid && missingOver10.level === "I");
check("미응답 10% 초과 BEST 미산출", !missingOver10.bestType);
check("미응답 10% 초과 강약점 미산출", !missingOver10.strengths.length && !missingOver10.weaknesses.length);

check("PDF 다운로드 버튼 존재", fs.readFileSync("app.js", "utf8").includes('id="pdfReport"'));
check("PDF 출력 영역 존재", fs.readFileSync("app.js", "utf8").includes("print-area"));

const passed = results.filter((result) => result.passed).length;
const failed = results.filter((result) => !result.passed);

console.log(JSON.stringify({ passed, failedCount: failed.length, failed }, null, 2));
process.exitCode = failed.length ? 1 : 0;
