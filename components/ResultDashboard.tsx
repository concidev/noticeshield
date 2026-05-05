"use client";

import { useState, useEffect } from "react";
import type { NoticeAnalysis } from "@/lib/types";

const TRANSLATE_LANGUAGES = [
  { code: "es", label: "Español (Spanish)" },
  { code: "fr", label: "Français (French)" },
  { code: "zh", label: "中文 (Chinese)" },
  { code: "ar", label: "العربية (Arabic)" },
  { code: "pt", label: "Português (Portuguese)" },
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "ru", label: "Русский (Russian)" },
  { code: "vi", label: "Tiếng Việt (Vietnamese)" },
  { code: "ko", label: "한국어 (Korean)" },
  { code: "tl", label: "Filipino (Tagalog)" },
  { code: "so", label: "Somali" },
];
import { UrgencyBadge } from "./UrgencyBadge";
import { ModeIndicator } from "./ModeIndicator";
import { DisclaimerCard } from "./DisclaimerCard";
import { downloadActionPlan } from "@/lib/generatePdf";

interface Props {
  analysis: NoticeAnalysis;
  onReset: () => void;
}

const EN_UI_LABELS = {
  deadline: "Deadline",
  noticeType: "Notice Type",
  seeNotice: "See notice",
  locationContext: "Location context",
  locationTailored: "Resources and next steps are tailored for",
  whatThisMeans: "What this means",
  riskOfIgnoring: "Risk of Ignoring",
  requiredSteps: "Required Steps",
  beforeYouAct: "Before you act",
  beforeYouActBody: "Verify the deadline, sender, case number, and amount directly in the notice. For eviction, court, immigration, benefits, or shutoff notices, contact legal aid or the issuing office as soon as possible.",
  communicationAssistant: "Communication Assistant",
  communicationBody: "Use this generated message to contact the relevant office. Replace [brackets] before sending.",
  draftEmail: "Draft Email",
  draftText: "Draft Text",
  translation: "Translation",
  humanHelp: "Human Help",
  visitSite: "Visit site",
  askAbout: "Ask about this notice",
  questionPlaceholder: "e.g. What if I miss the deadline?",
  qaNote: "Answers are based on this analysis only. Not legal advice.",
  translateReport: "Translate this report",
  backToEnglish: "Back to English",
  viewingIn: "Viewing in",
  translate: "Translate",
  translating: "Translating...",
  shareQr: "Share with Advocate (QR)",
  share: "Share",
  downloadPdf: "Download PDF",
  downloading: "Preparing PDF...",
  analyzeAnother: "Analyze another notice",
  copy: "Copy",
  copied: "Copied",
};

type UiLabels = typeof EN_UI_LABELS;

const UI_LABELS: Record<string, UiLabels> = {
  en: EN_UI_LABELS,
  es: {
    deadline: "Fecha límite",
    noticeType: "Tipo de aviso",
    seeNotice: "Ver aviso",
    locationContext: "Contexto de ubicación",
    locationTailored: "Los recursos y los próximos pasos están adaptados para",
    whatThisMeans: "Qué significa esto",
    riskOfIgnoring: "Riesgo de ignorarlo",
    requiredSteps: "Pasos requeridos",
    beforeYouAct: "Antes de actuar",
    beforeYouActBody: "Verifique la fecha límite, el remitente, el número de caso y el monto directamente en el aviso. Para avisos de desalojo, corte, inmigración, beneficios o servicios públicos, comuníquese con asistencia legal o con la oficina emisora lo antes posible.",
    communicationAssistant: "Asistente de comunicación",
    communicationBody: "Use este mensaje generado para contactar a la oficina correspondiente. Reemplace los [corchetes] antes de enviarlo.",
    draftEmail: "Redactar correo",
    draftText: "Redactar texto",
    translation: "Traducción",
    humanHelp: "Ayuda humana",
    visitSite: "Visitar sitio",
    askAbout: "Preguntar sobre este aviso",
    questionPlaceholder: "p. ej., ¿Qué pasa si pierdo la fecha límite?",
    qaNote: "Las respuestas se basan solo en este análisis. No es asesoría legal.",
    translateReport: "Traducir este informe",
    backToEnglish: "Volver al inglés",
    viewingIn: "Viendo en",
    translate: "Traducir",
    translating: "Traduciendo...",
    shareQr: "Compartir con un defensor (QR)",
    share: "Compartir",
    downloadPdf: "Descargar PDF",
    downloading: "Preparando PDF...",
    analyzeAnother: "Analizar otro aviso",
    copy: "Copiar",
    copied: "Copiado",
  },
  fr: {
    deadline: "Date limite",
    noticeType: "Type d'avis",
    seeNotice: "Voir l'avis",
    locationContext: "Contexte local",
    locationTailored: "Les ressources et les prochaines étapes sont adaptées pour",
    whatThisMeans: "Ce que cela signifie",
    riskOfIgnoring: "Risque si vous ignorez",
    requiredSteps: "Étapes requises",
    beforeYouAct: "Avant d'agir",
    beforeYouActBody: "Vérifiez la date limite, l'expéditeur, le numéro de dossier et le montant directement dans l'avis. Pour les avis d'expulsion, de tribunal, d'immigration, de prestations ou de coupure de service, contactez l'aide juridique ou le bureau émetteur dès que possible.",
    communicationAssistant: "Assistant de communication",
    communicationBody: "Utilisez ce message généré pour contacter le bureau concerné. Remplacez les [crochets] avant l'envoi.",
    draftEmail: "Rédiger un courriel",
    draftText: "Rédiger un texto",
    translation: "Traduction",
    humanHelp: "Aide humaine",
    visitSite: "Visiter le site",
    askAbout: "Poser une question sur cet avis",
    questionPlaceholder: "p. ex. Que se passe-t-il si je manque la date limite?",
    qaNote: "Les réponses sont basées uniquement sur cette analyse. Ce n'est pas un avis juridique.",
    translateReport: "Traduire ce rapport",
    backToEnglish: "Retour à l'anglais",
    viewingIn: "Affichage en",
    translate: "Traduire",
    translating: "Traduction...",
    shareQr: "Partager avec un intervenant (QR)",
    share: "Partager",
    downloadPdf: "Télécharger le PDF",
    downloading: "Préparation du PDF...",
    analyzeAnother: "Analyser un autre avis",
    copy: "Copier",
    copied: "Copié",
  },
  zh: {
    deadline: "截止日期",
    noticeType: "通知类型",
    seeNotice: "查看通知",
    locationContext: "所在地信息",
    locationTailored: "资源和下一步建议已根据此地调整：",
    whatThisMeans: "这是什么意思",
    riskOfIgnoring: "忽视的风险",
    requiredSteps: "需要采取的步骤",
    beforeYouAct: "行动之前",
    beforeYouActBody: "请直接核对通知上的截止日期、发件方、案件编号和金额。对于驱逐、法院、移民、福利或停水停电等通知，请尽快联系法律援助或发通知的机构。",
    communicationAssistant: "沟通助手",
    communicationBody: "使用这段生成的信息联系相关办公室。发送前请替换[括号]中的内容。",
    draftEmail: "起草邮件",
    draftText: "起草短信",
    translation: "翻译",
    humanHelp: "人工帮助",
    visitSite: "访问网站",
    askAbout: "询问此通知",
    questionPlaceholder: "例如：如果我错过截止日期会怎样？",
    qaNote: "回答仅基于此分析，不是法律建议。",
    translateReport: "翻译此报告",
    backToEnglish: "返回英语",
    viewingIn: "正在查看：",
    translate: "翻译",
    translating: "正在翻译...",
    shareQr: "与协助人员分享（QR）",
    share: "分享",
    downloadPdf: "下载 PDF",
    downloading: "正在准备 PDF...",
    analyzeAnother: "分析另一份通知",
    copy: "复制",
    copied: "已复制",
  },
  ar: {
    deadline: "الموعد النهائي",
    noticeType: "نوع الإشعار",
    seeNotice: "راجع الإشعار",
    locationContext: "سياق الموقع",
    locationTailored: "تم تخصيص الموارد والخطوات التالية لـ",
    whatThisMeans: "ماذا يعني هذا",
    riskOfIgnoring: "خطر التجاهل",
    requiredSteps: "الخطوات المطلوبة",
    beforeYouAct: "قبل أن تتصرف",
    beforeYouActBody: "تحقق من الموعد النهائي والمرسل ورقم القضية والمبلغ مباشرة من الإشعار. في إشعارات الإخلاء أو المحكمة أو الهجرة أو المزايا أو قطع الخدمة، اتصل بالمساعدة القانونية أو الجهة المصدرة في أقرب وقت ممكن.",
    communicationAssistant: "مساعد التواصل",
    communicationBody: "استخدم هذه الرسالة الجاهزة للتواصل مع المكتب المناسب. استبدل ما بين [الأقواس] قبل الإرسال.",
    draftEmail: "صياغة بريد إلكتروني",
    draftText: "صياغة رسالة نصية",
    translation: "الترجمة",
    humanHelp: "مساعدة بشرية",
    visitSite: "زيارة الموقع",
    askAbout: "اسأل عن هذا الإشعار",
    questionPlaceholder: "مثال: ماذا يحدث إذا فاتني الموعد النهائي؟",
    qaNote: "تستند الإجابات إلى هذا التحليل فقط. ليست نصيحة قانونية.",
    translateReport: "ترجمة هذا التقرير",
    backToEnglish: "العودة إلى الإنجليزية",
    viewingIn: "العرض باللغة",
    translate: "ترجمة",
    translating: "جارٍ الترجمة...",
    shareQr: "مشاركة مع مناصر (QR)",
    share: "مشاركة",
    downloadPdf: "تنزيل PDF",
    downloading: "جارٍ إعداد PDF...",
    analyzeAnother: "تحليل إشعار آخر",
    copy: "نسخ",
    copied: "تم النسخ",
  },
  pt: {
    deadline: "Prazo",
    noticeType: "Tipo de aviso",
    seeNotice: "Ver aviso",
    locationContext: "Contexto de localização",
    locationTailored: "Os recursos e próximos passos foram adaptados para",
    whatThisMeans: "O que isso significa",
    riskOfIgnoring: "Risco de ignorar",
    requiredSteps: "Passos necessários",
    beforeYouAct: "Antes de agir",
    beforeYouActBody: "Verifique o prazo, o remetente, o número do caso e o valor diretamente no aviso. Para avisos de despejo, tribunal, imigração, benefícios ou corte de serviço, contate assistência jurídica ou o órgão emissor o quanto antes.",
    communicationAssistant: "Assistente de comunicação",
    communicationBody: "Use esta mensagem gerada para contatar o órgão responsável. Substitua os [colchetes] antes de enviar.",
    draftEmail: "Criar e-mail",
    draftText: "Criar mensagem",
    translation: "Tradução",
    humanHelp: "Ajuda humana",
    visitSite: "Visitar site",
    askAbout: "Perguntar sobre este aviso",
    questionPlaceholder: "ex.: O que acontece se eu perder o prazo?",
    qaNote: "As respostas se baseiam apenas nesta análise. Não é aconselhamento jurídico.",
    translateReport: "Traduzir este relatório",
    backToEnglish: "Voltar ao inglês",
    viewingIn: "Visualizando em",
    translate: "Traduzir",
    translating: "Traduzindo...",
    shareQr: "Compartilhar com um defensor (QR)",
    share: "Compartilhar",
    downloadPdf: "Baixar PDF",
    downloading: "Preparando PDF...",
    analyzeAnother: "Analisar outro aviso",
    copy: "Copiar",
    copied: "Copiado",
  },
  hi: {
    deadline: "अंतिम तारीख",
    noticeType: "नोटिस का प्रकार",
    seeNotice: "नोटिस देखें",
    locationContext: "स्थान संदर्भ",
    locationTailored: "संसाधन और अगले कदम इस स्थान के लिए बनाए गए हैं:",
    whatThisMeans: "इसका मतलब क्या है",
    riskOfIgnoring: "नज़रअंदाज़ करने का जोखिम",
    requiredSteps: "ज़रूरी कदम",
    beforeYouAct: "कार्रवाई करने से पहले",
    beforeYouActBody: "नोटिस में दी गई अंतिम तारीख, भेजने वाले, केस नंबर और राशि को सीधे जांचें। बेदखली, अदालत, इमिग्रेशन, लाभ या सेवा बंद होने के नोटिस के लिए जल्द से जल्द कानूनी सहायता या जारी करने वाले कार्यालय से संपर्क करें।",
    communicationAssistant: "संपर्क सहायक",
    communicationBody: "संबंधित कार्यालय से संपर्क करने के लिए इस तैयार संदेश का उपयोग करें। भेजने से पहले [ब्रैकेट] बदलें।",
    draftEmail: "ईमेल लिखें",
    draftText: "टेक्स्ट लिखें",
    translation: "अनुवाद",
    humanHelp: "मानवीय सहायता",
    visitSite: "साइट खोलें",
    askAbout: "इस नोटिस के बारे में पूछें",
    questionPlaceholder: "जैसे: अगर मैं अंतिम तारीख चूक जाऊं तो क्या होगा?",
    qaNote: "जवाब केवल इस विश्लेषण पर आधारित हैं। यह कानूनी सलाह नहीं है।",
    translateReport: "इस रिपोर्ट का अनुवाद करें",
    backToEnglish: "अंग्रेज़ी पर वापस जाएं",
    viewingIn: "इस भाषा में देख रहे हैं",
    translate: "अनुवाद करें",
    translating: "अनुवाद हो रहा है...",
    shareQr: "सहायता व्यक्ति से साझा करें (QR)",
    share: "साझा करें",
    downloadPdf: "PDF डाउनलोड करें",
    downloading: "PDF तैयार हो रहा है...",
    analyzeAnother: "दूसरा नोटिस विश्लेषित करें",
    copy: "कॉपी करें",
    copied: "कॉपी हो गया",
  },
  ru: {
    deadline: "Срок",
    noticeType: "Тип уведомления",
    seeNotice: "См. уведомление",
    locationContext: "Местный контекст",
    locationTailored: "Ресурсы и следующие шаги подобраны для",
    whatThisMeans: "Что это означает",
    riskOfIgnoring: "Риск, если игнорировать",
    requiredSteps: "Необходимые шаги",
    beforeYouAct: "Перед действием",
    beforeYouActBody: "Проверьте срок, отправителя, номер дела и сумму прямо в уведомлении. Для уведомлений о выселении, суде, иммиграции, пособиях или отключении услуг как можно скорее обратитесь в юридическую помощь или в выдавший орган.",
    communicationAssistant: "Помощник по обращению",
    communicationBody: "Используйте это сообщение, чтобы связаться с нужным офисом. Замените [скобки] перед отправкой.",
    draftEmail: "Написать email",
    draftText: "Написать SMS",
    translation: "Перевод",
    humanHelp: "Помощь человека",
    visitSite: "Открыть сайт",
    askAbout: "Спросить об этом уведомлении",
    questionPlaceholder: "например: Что будет, если я пропущу срок?",
    qaNote: "Ответы основаны только на этом анализе. Это не юридическая консультация.",
    translateReport: "Перевести этот отчет",
    backToEnglish: "Вернуться к английскому",
    viewingIn: "Просмотр на",
    translate: "Перевести",
    translating: "Перевод...",
    shareQr: "Поделиться с помощником (QR)",
    share: "Поделиться",
    downloadPdf: "Скачать PDF",
    downloading: "Подготовка PDF...",
    analyzeAnother: "Проанализировать другое уведомление",
    copy: "Копировать",
    copied: "Скопировано",
  },
  vi: {
    deadline: "Hạn chót",
    noticeType: "Loại thông báo",
    seeNotice: "Xem thông báo",
    locationContext: "Bối cảnh địa phương",
    locationTailored: "Nguồn hỗ trợ và các bước tiếp theo được điều chỉnh cho",
    whatThisMeans: "Điều này có nghĩa là gì",
    riskOfIgnoring: "Rủi ro nếu bỏ qua",
    requiredSteps: "Các bước cần làm",
    beforeYouAct: "Trước khi hành động",
    beforeYouActBody: "Kiểm tra hạn chót, người gửi, số hồ sơ và số tiền trực tiếp trên thông báo. Với thông báo trục xuất, tòa án, nhập cư, phúc lợi hoặc cắt dịch vụ, hãy liên hệ trợ giúp pháp lý hoặc văn phòng phát hành càng sớm càng tốt.",
    communicationAssistant: "Trợ lý liên lạc",
    communicationBody: "Dùng tin nhắn được tạo này để liên hệ văn phòng phù hợp. Thay nội dung trong [ngoặc] trước khi gửi.",
    draftEmail: "Soạn email",
    draftText: "Soạn tin nhắn",
    translation: "Bản dịch",
    humanHelp: "Hỗ trợ từ người thật",
    visitSite: "Truy cập trang",
    askAbout: "Hỏi về thông báo này",
    questionPlaceholder: "ví dụ: Nếu tôi lỡ hạn chót thì sao?",
    qaNote: "Câu trả lời chỉ dựa trên phân tích này. Không phải tư vấn pháp lý.",
    translateReport: "Dịch báo cáo này",
    backToEnglish: "Quay lại tiếng Anh",
    viewingIn: "Đang xem bằng",
    translate: "Dịch",
    translating: "Đang dịch...",
    shareQr: "Chia sẻ với người hỗ trợ (QR)",
    share: "Chia sẻ",
    downloadPdf: "Tải PDF",
    downloading: "Đang chuẩn bị PDF...",
    analyzeAnother: "Phân tích thông báo khác",
    copy: "Sao chép",
    copied: "Đã sao chép",
  },
  ko: {
    deadline: "마감일",
    noticeType: "통지 유형",
    seeNotice: "통지 확인",
    locationContext: "지역 정보",
    locationTailored: "자료와 다음 단계는 다음 지역에 맞춰졌습니다:",
    whatThisMeans: "이것의 의미",
    riskOfIgnoring: "무시할 경우 위험",
    requiredSteps: "필요한 단계",
    beforeYouAct: "행동하기 전에",
    beforeYouActBody: "통지서에서 마감일, 발신자, 사건 번호, 금액을 직접 확인하세요. 퇴거, 법원, 이민, 복지, 서비스 중단 통지의 경우 가능한 한 빨리 법률 지원 기관이나 발급 기관에 연락하세요.",
    communicationAssistant: "연락 도우미",
    communicationBody: "관련 사무실에 연락할 때 이 생성된 메시지를 사용하세요. 보내기 전에 [괄호] 내용을 바꾸세요.",
    draftEmail: "이메일 작성",
    draftText: "문자 작성",
    translation: "번역",
    humanHelp: "사람의 도움",
    visitSite: "사이트 방문",
    askAbout: "이 통지에 대해 질문",
    questionPlaceholder: "예: 마감일을 놓치면 어떻게 되나요?",
    qaNote: "답변은 이 분석에만 근거합니다. 법률 조언이 아닙니다.",
    translateReport: "이 보고서 번역",
    backToEnglish: "영어로 돌아가기",
    viewingIn: "보는 언어",
    translate: "번역",
    translating: "번역 중...",
    shareQr: "도움 주는 사람과 공유 (QR)",
    share: "공유",
    downloadPdf: "PDF 다운로드",
    downloading: "PDF 준비 중...",
    analyzeAnother: "다른 통지 분석",
    copy: "복사",
    copied: "복사됨",
  },
  tl: {
    deadline: "Deadline",
    noticeType: "Uri ng paunawa",
    seeNotice: "Tingnan ang paunawa",
    locationContext: "Konteksto ng lokasyon",
    locationTailored: "Ang mga resource at susunod na hakbang ay iniangkop para sa",
    whatThisMeans: "Ano ang ibig sabihin nito",
    riskOfIgnoring: "Panganib kung babalewalain",
    requiredSteps: "Mga kailangang hakbang",
    beforeYouAct: "Bago ka kumilos",
    beforeYouActBody: "Suriin ang deadline, nagpadala, case number, at halaga direkta sa paunawa. Para sa eviction, korte, immigration, benepisyo, o shutoff notice, makipag-ugnayan agad sa legal aid o sa opisina na nagpadala.",
    communicationAssistant: "Katulong sa pakikipag-ugnayan",
    communicationBody: "Gamitin ang nabuong mensaheng ito para kontakin ang tamang opisina. Palitan ang nasa [brackets] bago ipadala.",
    draftEmail: "Gumawa ng email",
    draftText: "Gumawa ng text",
    translation: "Salin",
    humanHelp: "Tulong ng tao",
    visitSite: "Bisitahin ang site",
    askAbout: "Magtanong tungkol sa paunawang ito",
    questionPlaceholder: "hal. Ano ang mangyayari kung malampasan ko ang deadline?",
    qaNote: "Ang mga sagot ay batay lamang sa pagsusuring ito. Hindi ito legal advice.",
    translateReport: "Isalin ang ulat na ito",
    backToEnglish: "Bumalik sa English",
    viewingIn: "Tinitingnan sa",
    translate: "Isalin",
    translating: "Isinasalin...",
    shareQr: "Ibahagi sa advocate (QR)",
    share: "Ibahagi",
    downloadPdf: "I-download ang PDF",
    downloading: "Inihahanda ang PDF...",
    analyzeAnother: "Suriin ang ibang paunawa",
    copy: "Kopyahin",
    copied: "Nakopya",
  },
  so: {
    deadline: "Waqtiga kama dambaysta ah",
    noticeType: "Nooca ogeysiiska",
    seeNotice: "Eeg ogeysiiska",
    locationContext: "Xogta goobta",
    locationTailored: "Khayraadka iyo tallaabooyinka xiga waxaa loogu habeeyay",
    whatThisMeans: "Waxa tani ka dhigan tahay",
    riskOfIgnoring: "Khatarta haddii la iska indho tiro",
    requiredSteps: "Tallaabooyinka loo baahan yahay",
    beforeYouAct: "Kahor intaadan tallaabo qaadin",
    beforeYouActBody: "Ka hubi ogeysiiska waqtiga kama dambaysta ah, cidda dirtay, lambarka kiiska, iyo lacagta. Ogeysiisyada guri ka saarid, maxkamad, socdaal, gunnooyin, ama adeeg joojin, la xiriir gargaar sharci ama xafiiska soo saaray sida ugu dhakhsaha badan.",
    communicationAssistant: "Kaaliyaha xiriirka",
    communicationBody: "Isticmaal fariintan la diyaariyay si aad ula xiriirto xafiiska ku habboon. Beddel waxa ku jira [qaansooyinka] ka hor dirista.",
    draftEmail: "Qor iimayl",
    draftText: "Qor fariin",
    translation: "Tarjumid",
    humanHelp: "Caawimo qof bini'aadam ah",
    visitSite: "Booqo bogga",
    askAbout: "Weydii ogeysiiskan",
    questionPlaceholder: "tusaale: Maxaa dhacaya haddii aan seego waqtiga kama dambaysta ah?",
    qaNote: "Jawaabuhu waxay ku salaysan yihiin falanqayntan oo keliya. Ma aha talo sharci.",
    translateReport: "Turjun warbixintan",
    backToEnglish: "Ku noqo Ingiriisi",
    viewingIn: "Waxaa lagu arkayaa",
    translate: "Turjun",
    translating: "Turjumid...",
    shareQr: "La wadaag taageere (QR)",
    share: "La wadaag",
    downloadPdf: "Soo dejiso PDF",
    downloading: "PDF ayaa la diyaarinayaa...",
    analyzeAnother: "Falanqee ogeysiis kale",
    copy: "Nuqul",
    copied: "Waa la nuqulay",
  },
};

function getUiLabels(language: string | null) {
  return UI_LABELS[language ?? "en"] ?? UI_LABELS.en;
}

function DeadlineCountdown({ deadlineDate }: { deadlineDate: string | null }) {
  if (!deadlineDate) return null;
  // Parse as local noon to avoid UTC-offset shifting the date by a day
  const [y, m, d] = deadlineDate.split("-").map(Number);
  const target = new Date(y, (m ?? 1) - 1, d ?? 1, 12, 0, 0);
  const diffMs = target.getTime() - Date.now();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const [label, color, bg] =
    days < 0   ? ["OVERDUE",       "#dc2626", "#fee2e2"] :
    days === 0 ? ["Due today",     "#dc2626", "#fee2e2"] :
    days <= 3  ? [`${days}d left`, "#dc2626", "#fee2e2"] :
    days <= 7  ? [`${days}d left`, "#854d0e", "#fef9c3"] :
                 [`${days}d left`, "var(--secondary)", "var(--secondary-container)"];
  return (
    <span style={{
      display: "inline-block", background: bg, color,
      fontWeight: 800, fontSize: 12,
      padding: "3px 10px", borderRadius: 9999,
      letterSpacing: "0.04em", textTransform: "uppercase", marginTop: 6,
    }}>
      {label}
    </span>
  );
}

function CopyButton({ text, labels }: { text: string; labels: ReturnType<typeof getUiLabels> }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      style={{
        display: "flex", alignItems: "center", gap: 4,
        background: copied ? "var(--secondary-container)" : "var(--surface-variant)",
        color: copied ? "var(--secondary)" : "var(--primary)",
        border: "none", borderRadius: 6,
        padding: "6px 12px", cursor: "pointer",
        fontSize: 13, fontWeight: 600, fontFamily: "inherit",
        transition: "all 0.15s",
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
        {copied ? "check" : "content_copy"}
      </span>
      {copied ? labels.copied : labels.copy}
    </button>
  );
}

const SUGGESTED_QUESTIONS: Partial<Record<string, string[]>> = {
  eviction:       ["Do I have to leave immediately?",           "Can I negotiate with my landlord?",        "What are my rights as a tenant?"],
  rent_arrears:   ["Can I set up a payment plan?",              "What if I can only pay part of the amount?","Who can help me find emergency rent assistance?"],
  utility_shutoff:["Can they disconnect without more notice?",  "What if I have medical equipment at home?", "Are there emergency assistance programs?"],
  court_hearing:  ["What if I can't appear on that date?",      "Do I need a lawyer for this?",              "What happens if I don't show up?"],
  benefits:       ["Can I keep my benefits while I appeal?",    "How long does an appeal take?",             "What documents do I need for my appeal?"],
  immigration:    ["Should I get a lawyer right away?",         "What happens if I miss the 60-day window?", "Can I stay in the US while I appeal?"],
  healthcare:     ["How do I write an appeal letter?",          "What if the first appeal is denied?",       "Are there free patient advocates?"],
  boil_water:     ["How long will this advisory last?",         "Is it safe to shower or bathe?",            "What about my pets and plants?"],
  evacuation:     ["Where should I go right now?",              "What if I have no transportation?",         "Can I bring my pets?"],
};
const DEFAULT_QUESTIONS = ["What should I do first?", "Can I appeal this decision?", "Where can I get free help?"];

const URGENCY_LABELS: Record<string, string> = {
  critical: "CRITICAL",
  high: "HIGH RISK",
  medium: "IMPORTANT",
  low: "LOW PRIORITY",
};

const BORDER_COLORS: Record<string, string> = {
  critical: "var(--urgent)",
  high:     "var(--warning)",
  medium:   "var(--notice)",
  low:      "var(--safe)",
};

const STEP_TAGS: Array<{ label: string; color: string; bg: string }> = [
  { label: "Document Prep", color: "var(--primary)", bg: "var(--surface-variant)" },
  { label: "Communication", color: "var(--primary)", bg: "var(--surface-variant)" },
  { label: "High Priority", color: "var(--on-error-container)", bg: "var(--error-container)" },
  { label: "Legal Step", color: "var(--primary)", bg: "var(--surface-variant)" },
  { label: "Financial", color: "var(--warning)", bg: "#fef9c3" },
];

export function ResultDashboard({ analysis, onReset }: Props) {
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [downloading, setDownloading] = useState(false);
  const [translateLang, setTranslateLang] = useState("es");
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState<string | null>(null);
  const [translated, setTranslated] = useState<NoticeAnalysis | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const display = translated ?? analysis;
  const ui = getUiLabels(display.translationLanguage);

  useEffect(() => {
    if (!showQR || qrDataUrl) return;
    const text = [
      `NoticeShield Action Plan`,
      `${"─".repeat(28)}`,
      `${display.noticeTypeLabel.toUpperCase()}`,
      `Urgency: ${display.urgency.toUpperCase()}`,
      display.deadline ? `Deadline: ${display.deadline}` : "",
      ``,
      `WHAT THIS MEANS:`,
      display.summary.slice(0, 200) + (display.summary.length > 200 ? "…" : ""),
      ``,
      `STEPS:`,
      ...display.nextSteps.slice(0, 5).map((s, i) => `${i + 1}. ${s.slice(0, 100)}`),
      ``,
      `Free help: Call or text 211`,
    ].filter((l) => l !== undefined).join("\n");

    import("qrcode").then((QRCode) => {
      QRCode.toDataURL(text, { width: 280, margin: 2, color: { dark: "#1e3a5f", light: "#ffffff" } })
        .then((url) => setQrDataUrl(url))
        .catch(() => setQrDataUrl(null));
    }).catch(() => setQrDataUrl(null));
  }, [showQR, qrDataUrl, display]);

  const [qaHistory, setQaHistory] = useState<Array<{ question: string; answer: string }>>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [answering, setAnswering] = useState(false);
  const [streamingAnswer, setStreamingAnswer] = useState("");
  const [qaError, setQaError] = useState<string | null>(null);

  const handleTranslate = async () => {
    setTranslating(true);
    setTranslateError(null);
    try {
      const res = await fetch("/api/translate-notice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis, targetLanguage: translateLang }),
      });
      const json = await res.json() as { success: boolean; analysis?: NoticeAnalysis; error?: string };
      if (!json.success || !json.analysis) {
        setTranslateError(json.error ?? "Translation failed. Please try again.");
      } else {
        setTranslated(json.analysis);
      }
    } catch {
      setTranslateError("Could not connect. Please check your connection and try again.");
    } finally {
      setTranslating(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadActionPlan(display);
    } finally {
      setDownloading(false);
    }
  };

  const canShare = typeof navigator !== "undefined" && "share" in navigator;
  const handleShare = async () => {
    const lines = [
      `${display.noticeTypeLabel} — ${URGENCY_LABELS[display.urgency] ?? "ACTION REQUIRED"}`,
      display.deadline ? `Deadline: ${display.deadline}` : "",
      "",
      display.summary,
      "",
      "Next steps:",
      ...display.nextSteps.map((s, i) => `${i + 1}. ${s}`),
    ].filter(Boolean);
    try {
      await navigator.share({ title: `NoticeShield: ${display.noticeTypeLabel}`, text: lines.join("\n") });
    } catch { /* user cancelled */ }
  };
  const handleAsk = async () => {
    const question = currentQuestion.trim();
    if (!question || answering) return;
    setCurrentQuestion("");
    setAnswering(true);
    setStreamingAnswer("");
    setQaError(null);
    try {
      const res = await fetch("/api/follow-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis, question }),
      });
      if (!res.ok || !res.body) {
        setQaError("Could not get an answer. Please try again.");
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let finalAnswer = "";
      outer: while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          let evt: { type: string; text?: string; answer?: string; error?: string };
          try { evt = JSON.parse(raw); } catch { continue; }
          if (evt.type === "token" && evt.text) {
            finalAnswer += evt.text;
            setStreamingAnswer(finalAnswer);
          } else if (evt.type === "result" && evt.answer) {
            finalAnswer = evt.answer;
            setQaHistory((prev) => [...prev, { question, answer: finalAnswer }]);
            setStreamingAnswer("");
            break outer;
          } else if (evt.type === "error") {
            setQaError(evt.error ?? "Answer failed.");
            break outer;
          }
        }
      }
    } catch {
      setQaError("Could not connect. Please check your connection and try again.");
    } finally {
      setAnswering(false);
      setStreamingAnswer("");
    }
  };

  const isCanada = display.locationLabel?.includes(", Canada") ?? false;
  const borderColor = BORDER_COLORS[display.urgency] ?? "var(--primary)";
  const legalUrl = isCanada ? "https://justicenet.ca" : "https://www.lawhelp.org";
  const legalLabel = isCanada ? "Find Legal Aid (JusticeNet)" : "Find Legal Aid (LawHelp.org)";
  const helpUrl = isCanada ? "https://211canada.ca" : "https://www.211.org";
  const helpLabel = isCanada ? "Search 211 Canada for Local Help" : "Search 211 for Local Help";

  const toggleStep = (i: number) => {
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(i)) {
        next.delete(i);
      } else {
        next.add(i);
      }
      return next;
    });
  };

  return (
    <div className="result-dashboard" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {showQR && (
        <div
          onClick={() => setShowQR(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff", borderRadius: 16,
              padding: 28, maxWidth: 340, width: "100%",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
              boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "var(--primary)" }}>Share with an Advocate</h2>
              <p style={{ margin: 0, fontSize: 13, color: "var(--on-surface-variant)", lineHeight: 1.4 }}>
                Show this QR code to a legal aid worker, housing advocate, or family member so they can read your action plan.
              </p>
            </div>
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR code for action plan" style={{ width: 240, height: 240, borderRadius: 8, border: "1px solid var(--outline-variant)" }} />
            ) : (
              <div style={{ width: 240, height: 240, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 36, animation: "spin 1.2s linear infinite", color: "var(--primary)" }}>progress_activity</span>
              </div>
            )}
            <div style={{ background: "var(--surface-low)", borderRadius: 8, padding: "10px 14px", width: "100%", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {display.noticeTypeLabel}
              </p>
              {display.deadline && (
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--error)", fontWeight: 600 }}>
                  Deadline: {display.deadline}
                </p>
              )}
            </div>
            <button
              onClick={() => setShowQR(false)}
              style={{
                width: "100%", height: 44,
                background: "var(--primary)", color: "var(--on-primary)",
                border: "none", borderRadius: 8,
                fontSize: 14, fontWeight: 600, fontFamily: "inherit",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {display.urgency === "critical" && (
        <div style={{
          background: "linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)",
          borderRadius: 12,
          padding: 20,
          display: "flex", flexDirection: "column", gap: 14,
          boxShadow: "0 4px 24px rgba(153,27,27,0.35)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="material-symbols-outlined" style={{
              fontSize: 28, color: "#fca5a5", fontVariationSettings: "'FILL' 1",
              animation: "pulse 1.8s ease-in-out infinite",
            }}>emergency_home</span>
            <div>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#fca5a5", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Critical Notice — Immediate Action Required
              </p>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#ffffff", lineHeight: 1.3 }}>
                Free help is one call away
              </p>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: "#fecaca", lineHeight: 1.5 }}>
            {isCanada
              ? "Call or text 211 for free, confidential support — housing, legal aid, utilities, and benefits. Available 24/7 across Canada."
              : "Call or text 211 for free, confidential help — housing, legal aid, utility assistance, and benefits. Available 24/7 in most of the US."}
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <a
              href="tel:211"
              style={{
                flex: 1, height: 48,
                background: "#ffffff", color: "#991b1b",
                borderRadius: 8, border: "none",
                fontSize: 15, fontWeight: 800, fontFamily: "inherit",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                textDecoration: "none", boxSizing: "border-box",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>call</span>
              Call 211 Now
            </a>
            <a
              href={isCanada ? "https://211canada.ca" : "https://www.211.org"}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                height: 48, padding: "0 16px",
                background: "rgba(255,255,255,0.15)", color: "#ffffff",
                borderRadius: 8, border: "1px solid rgba(255,255,255,0.3)",
                fontSize: 14, fontWeight: 600, fontFamily: "inherit",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                textDecoration: "none", boxSizing: "border-box", whiteSpace: "nowrap",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>open_in_new</span>
              Find Online
            </a>
          </div>
        </div>
      )}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        background: "var(--error-container)",
        border: `1px solid ${borderColor}`,
        borderRadius: 9999,
        padding: "10px 20px",
        width: "100%",
      }}>
        <span className="material-symbols-outlined" style={{ color: "var(--on-error-container)", fontVariationSettings: "'FILL' 1", fontSize: 20 }}>
          warning
        </span>
        <span className="text-label-md" style={{ color: "var(--on-error-container)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {URGENCY_LABELS[display.urgency] ?? "ACTION REQUIRED"}
          {display.deadline ? ` · ${display.deadline}` : ""}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <UrgencyBadge urgency={display.urgency} />
          <h1 className="text-h1" style={{ color: "var(--primary)", margin: 0 }}>{display.noticeTypeLabel}</h1>
        </div>
        <ModeIndicator mode={analysis.analysisMode} />
      </div>
      <div className="result-details-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{
          background: "var(--surface)", border: "1px solid var(--outline-variant)",
          borderRadius: 8, padding: 16, display: "flex", flexDirection: "column", gap: 4,
          boxShadow: "0 1px 4px rgba(0,53,95,0.05)",
        }}>
          <span className="text-label-sm" style={{ color: "var(--on-surface-variant)", textTransform: "uppercase" }}>{ui.deadline}</span>
          <span className="text-body-lg" style={{ color: "var(--on-surface)", fontWeight: 600 }}>
            {display.deadline ?? ui.seeNotice}
          </span>
          <DeadlineCountdown deadlineDate={display.deadlineDate} />
        </div>
        <div style={{
          background: "var(--surface)", border: "1px solid var(--outline-variant)",
          borderRadius: 8, padding: 16, display: "flex", flexDirection: "column", gap: 4,
          boxShadow: "0 1px 4px rgba(0,53,95,0.05)",
        }}>
          <span className="text-label-sm" style={{ color: "var(--on-surface-variant)", textTransform: "uppercase" }}>{ui.noticeType}</span>
          <span className="text-body-lg" style={{ color: "var(--on-surface)", fontWeight: 600 }}>
            {display.noticeTypeLabel}
          </span>
        </div>
      </div>

      {display.locationLabel && (
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--outline-variant)",
          borderRadius: 8,
          padding: 16,
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
          boxShadow: "0 1px 4px rgba(0,53,95,0.05)",
        }}>
          <span className="material-symbols-outlined" style={{ color: "var(--primary)", fontSize: 22, flexShrink: 0 }}>location_on</span>
          <div>
            <span className="text-label-sm" style={{ color: "var(--on-surface-variant)", textTransform: "uppercase" }}>{ui.locationContext}</span>
            <p className="text-body-md" style={{ color: "var(--on-surface)", margin: "2px 0 0" }}>
              {ui.locationTailored} {display.locationLabel}.
            </p>
          </div>
        </div>
      )}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--outline-variant)",
        borderLeft: `4px solid var(--primary)`,
        borderRadius: 8, padding: 20,
        boxShadow: "0 1px 4px rgba(0,53,95,0.05)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: 0, right: 0, padding: 16, opacity: 0.08 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 64, fontVariationSettings: "'FILL' 1" }}>translate</span>
        </div>
        <h2 className="text-h2" style={{ color: "var(--primary)", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 8 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>lightbulb</span>
          {ui.whatThisMeans}
        </h2>
        <p className="text-body-md" style={{ color: "var(--on-surface-variant)", margin: 0, lineHeight: "1.6", position: "relative", zIndex: 1 }}>
          {display.summary}
        </p>
      </div>
      <div style={{
        background: "var(--surface)", border: "1px solid var(--error)",
        borderLeft: `4px solid var(--error)`,
        borderRadius: 8, padding: 20,
        boxShadow: "0 1px 4px rgba(0,53,95,0.05)",
      }}>
        <h2 className="text-h2" style={{ color: "var(--error)", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>security_update_warning</span>
          {ui.riskOfIgnoring}
        </h2>
        <p className="text-body-md" style={{ color: "var(--on-surface-variant)", margin: 0, lineHeight: "1.6" }}>
          {display.riskIfIgnored}
        </p>
      </div>
      <div
        role="region"
        aria-label="Required action steps"
        style={{
          background: "var(--surface)", border: "1px solid var(--outline-variant)",
          borderLeft: `4px solid var(--secondary)`,
          borderRadius: 8, overflow: "hidden",
          boxShadow: "0 1px 4px rgba(0,53,95,0.05)",
        }}>
        <div style={{ padding: "14px 20px", background: "var(--surface-low)", borderBottom: "1px solid var(--outline-variant)", display: "flex", alignItems: "center", gap: 8 }}>
          <span className="material-symbols-outlined" style={{ color: "var(--secondary)", fontVariationSettings: "'FILL' 1", fontSize: 20 }}>checklist</span>
          <h2 className="text-h2" style={{ margin: 0 }}>{ui.requiredSteps}</h2>
        </div>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
          {display.nextSteps.map((step, i) => {
            const tag = STEP_TAGS[i % STEP_TAGS.length];
            const done = checkedSteps.has(i);
            return (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{ flexShrink: 0, height: 48, display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    checked={done}
                    onChange={() => toggleStep(i)}
                    aria-label={`Step ${i + 1}: ${step}`}
                    style={{ width: 22, height: 22, cursor: "pointer", accentColor: "var(--primary)" }}
                  />
                </div>
                <div style={{ paddingTop: 6 }}>
                  <span className="text-label-sm" style={{
                    color: tag.color, background: tag.bg,
                    padding: "2px 8px", borderRadius: 9999,
                    display: "inline-block", marginBottom: 6,
                  }}>
                    {tag.label}
                  </span>
                  <p className="text-body-md" style={{ color: "var(--on-surface)", margin: 0, lineHeight: "1.5", textDecoration: done ? "line-through" : "none", opacity: done ? 0.5 : 1 }}>
                    {step}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{
        background: "var(--surface-container)",
        border: "1px solid var(--outline-variant)",
        borderLeft: "4px solid var(--primary)",
        borderRadius: 8,
        padding: 16,
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
      }}>
        <span className="material-symbols-outlined" style={{ color: "var(--primary)", fontSize: 22, flexShrink: 0 }}>verified_user</span>
        <div>
          <h2 className="text-label-md" style={{ color: "var(--on-surface)", margin: "0 0 4px" }}>{ui.beforeYouAct}</h2>
          <p className="text-body-md" style={{ color: "var(--on-surface-variant)", margin: 0 }}>
            {ui.beforeYouActBody}
          </p>
        </div>
      </div>
      {display.suggestedMessage && (
        <div style={{
          background: "var(--surface-low)", border: "1px solid var(--outline-variant)",
          borderRadius: 8, padding: 20,
          boxShadow: "0 1px 4px rgba(0,53,95,0.05)",
        }}>
          <h2 className="text-h2" style={{ margin: "0 0 8px", display: "flex", alignItems: "center", gap: 8 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 22, color: "var(--primary)" }}>chat_bubble</span>
            {ui.communicationAssistant}
          </h2>
          <p className="text-label-sm" style={{ color: "var(--on-surface-variant)", margin: "0 0 12px" }}>
            {ui.communicationBody}
          </p>
          <div style={{
            background: "var(--surface)", border: "1px solid var(--outline-variant)",
            borderRadius: 8, padding: 16,
          }}>
            <pre className="text-body-md" style={{
              color: "var(--on-surface)", whiteSpace: "pre-wrap",
              fontFamily: "inherit", lineHeight: "1.6", margin: 0,
            }}>
              {display.suggestedMessage}
            </pre>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <CopyButton text={display.suggestedMessage} labels={ui} />
            <a
              href={`mailto:?subject=${encodeURIComponent(`Re: ${display.noticeTypeLabel}`)}&body=${encodeURIComponent(display.suggestedMessage)}`}
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                background: "var(--surface-variant)", color: "var(--primary)",
                border: "none", borderRadius: 6,
                padding: "6px 12px", cursor: "pointer",
                fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                textDecoration: "none",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>mail</span>
              {ui.draftEmail}
            </a>
            <a
              href={`sms:?body=${encodeURIComponent(display.suggestedMessage)}`}
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                background: "var(--surface-variant)", color: "var(--primary)",
                border: "none", borderRadius: 6,
                padding: "6px 12px", cursor: "pointer",
                fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                textDecoration: "none",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>sms</span>
              {ui.draftText}
            </a>
          </div>
        </div>
      )}
      {display.translation && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--outline-variant)", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", background: "var(--surface-low)", borderBottom: "1px solid var(--outline-variant)", display: "flex", alignItems: "center", gap: 8 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--secondary)" }}>translate</span>
            <h3 className="text-label-md" style={{ margin: 0, color: "var(--on-surface)" }}>
              {ui.translation} — {display.translationLanguage?.toUpperCase() ?? ""}
            </h3>
          </div>
          <div style={{ padding: 16 }}>
            <p className="text-body-md" style={{ color: "var(--on-surface)", margin: 0, lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{display.translation}</p>
          </div>
        </div>
      )}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--outline-variant)",
        borderRadius: 8, padding: 20,
        boxShadow: "0 1px 4px rgba(0,53,95,0.05)",
      }}>
        <h2 className="text-h2" style={{ margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 22, color: "var(--primary)", fontVariationSettings: "'FILL' 1" }}>support_agent</span>
          {ui.humanHelp}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
          {((display.localResources?.length ?? 0) > 0 ? display.localResources : [
            { label: isCanada ? "JusticeNet — Legal Aid Finder" : "Legal Aid Finder", detail: isCanada ? "justicenet.ca — free or low-cost legal help by province" : "lawhelp.org — free or low-cost legal help by state", category: "legal" as const, url: legalUrl },
            { label: isCanada ? "211 Canada" : "211 Helpline", detail: isCanada ? "Call or search 211Canada — housing, utilities, local services" : "Call or text 211 — housing, utilities, local services", category: "general" as const, url: helpUrl },
            { label: "National Housing Hotline", detail: "HUD-approved housing counseling, 1-800-569-4287", category: "housing" as const },
            { label: isCanada ? "Canada.ca — Benefits" : "Benefits.gov", detail: isCanada ? "canada.ca/en/services/benefits — government benefit programs" : "benefits.gov — find government benefit programs", category: "benefits" as const, url: isCanada ? "https://www.canada.ca/en/services/benefits.html" : "https://www.benefits.gov" },
          ]).map((r) => (
            <div key={r.label} style={{ paddingBottom: 12, borderBottom: "1px solid var(--outline-variant)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <span className="text-label-md" style={{ color: "var(--primary)", display: "block" }}>{r.label}</span>
                <span className="text-label-sm" style={{
                  color: "var(--on-surface-variant)",
                  background: "var(--surface-low)",
                  borderRadius: 9999,
                  padding: "1px 7px",
                  textTransform: "uppercase",
                }}>
                  {r.category}
                </span>
              </div>
              <span className="text-body-md" style={{ color: "var(--on-surface-variant)" }}>{r.detail}</span>
              {r.url && (
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-label-sm" style={{
                  color: "var(--secondary)", display: "inline-flex", alignItems: "center", gap: 4,
                  textDecoration: "none", marginTop: 4,
                }}>
                  {ui.visitSite}
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>open_in_new</span>
                </a>
              )}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <a
            href={legalUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              width: "100%", height: 48, border: "1px solid var(--primary)",
              background: "transparent", color: "var(--primary)",
              borderRadius: 8, fontSize: 14, fontWeight: 600, fontFamily: "inherit",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              textDecoration: "none", boxSizing: "border-box",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>gavel</span>
            {legalLabel}
          </a>
          <a
            href={helpUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              width: "100%", height: 48,
              background: "var(--primary)", color: "var(--on-primary)",
              border: "none", borderRadius: 8,
              fontSize: 14, fontWeight: 600, fontFamily: "inherit",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 4px 12px rgba(0,53,95,0.2)", textDecoration: "none", boxSizing: "border-box",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>support_agent</span>
            {helpLabel}
          </a>
        </div>
      </div>
      <div style={{
        background: "var(--surface)", border: "1px solid var(--outline-variant)",
        borderLeft: "4px solid var(--primary)",
        borderRadius: 8, overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,53,95,0.05)",
      }}>
        <div style={{ padding: "14px 20px", background: "var(--surface-low)", borderBottom: "1px solid var(--outline-variant)", display: "flex", alignItems: "center", gap: 8 }}>
          <span className="material-symbols-outlined" style={{ color: "var(--primary)", fontVariationSettings: "'FILL' 1", fontSize: 20 }}>forum</span>
          <h2 className="text-h2" style={{ margin: 0 }}>{ui.askAbout}</h2>
        </div>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          {qaHistory.length === 0 && !answering && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(SUGGESTED_QUESTIONS[analysis.noticeType] ?? DEFAULT_QUESTIONS).map((q) => (
                <button
                  key={q}
                  onClick={() => { setCurrentQuestion(q); }}
                  style={{
                    background: "var(--surface-variant)", border: "1px solid var(--outline-variant)",
                    borderRadius: 9999, padding: "6px 12px",
                    fontSize: 12, fontWeight: 500, fontFamily: "inherit",
                    color: "var(--primary)", cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}
          {qaHistory.map((item, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  background: "var(--primary)", color: "var(--on-primary)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, marginTop: 2,
                }}>Q</div>
                <p className="text-body-md" style={{ color: "var(--on-surface)", margin: 0, fontWeight: 600, lineHeight: "1.5" }}>{item.question}</p>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  background: "var(--secondary-container)", color: "var(--on-secondary-container)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, marginTop: 2,
                }}>A</div>
                <p className="text-body-md" style={{ color: "var(--on-surface-variant)", margin: 0, lineHeight: "1.6" }}>{item.answer}</p>
              </div>
              {i < qaHistory.length - 1 && <div style={{ borderTop: "1px solid var(--outline-variant)", margin: "4px 0" }} />}
            </div>
          ))}
          {answering && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {qaHistory.length > 0 && <div style={{ borderTop: "1px solid var(--outline-variant)", margin: "4px 0" }} />}
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  background: "var(--secondary-container)", color: "var(--on-secondary-container)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, marginTop: 2,
                }}>A</div>
                <p className="text-body-md" style={{ color: "var(--on-surface-variant)", margin: 0, lineHeight: "1.6" }}>
                  {streamingAnswer || (
                    <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16, animation: "spin 1.2s linear infinite", color: "var(--secondary)" }}>progress_activity</span>
                      Gemma is thinking…
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {qaError && (
            <p className="text-body-md" style={{ color: "var(--error)", margin: 0 }}>{qaError}</p>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <input
              type="text"
              value={currentQuestion}
              onChange={(e) => setCurrentQuestion(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") void handleAsk(); }}
              placeholder={ui.questionPlaceholder}
              disabled={answering}
              aria-label="Ask a follow-up question about this notice"
              style={{
                flex: 1, height: 44, borderRadius: 8,
                border: "1px solid var(--outline-variant)",
                background: answering ? "var(--surface-low)" : "var(--surface)",
                color: "var(--on-surface)",
                fontSize: 15, fontFamily: "inherit", padding: "0 12px",
                outline: "none",
              }}
            />
            <button
              onClick={() => void handleAsk()}
              disabled={answering || !currentQuestion.trim()}
              aria-label="Send question"
              style={{
                width: 44, height: 44, flexShrink: 0,
                background: (answering || !currentQuestion.trim()) ? "var(--outline-variant)" : "var(--primary)",
                color: (answering || !currentQuestion.trim()) ? "var(--on-surface-variant)" : "var(--on-primary)",
                border: "none", borderRadius: 8, cursor: (answering || !currentQuestion.trim()) ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>send</span>
            </button>
          </div>
          <p className="text-label-sm" style={{ color: "var(--outline)", margin: 0 }}>
            {ui.qaNote}
          </p>
        </div>
      </div>
      <DisclaimerCard text={display.disclaimer} />
      <div style={{
        background: "var(--surface)", border: "1px solid var(--outline-variant)",
        borderRadius: 8, padding: 20,
        boxShadow: "0 1px 4px rgba(0,53,95,0.05)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--secondary)", fontVariationSettings: "'FILL' 1" }}>translate</span>
          <h2 className="text-h2" style={{ margin: 0 }}>{ui.translateReport}</h2>
          {translated && (
            <button
              onClick={() => setTranslated(null)}
              className="text-label-sm"
              style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--outline)", cursor: "pointer", fontFamily: "inherit" }}
            >
              {ui.backToEnglish}
            </button>
          )}
        </div>

        {translated ? (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "var(--secondary-container)", color: "var(--on-secondary-container)",
            borderRadius: 9999, padding: "4px 12px", fontSize: 12, fontWeight: 700,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            {ui.viewingIn} {TRANSLATE_LANGUAGES.find(l => l.code === translateLang)?.label ?? translateLang}
          </div>
        ) : (
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <select
              value={translateLang}
              onChange={(e) => setTranslateLang(e.target.value)}
              style={{
                flex: 1, height: 44, borderRadius: 8,
                border: "1px solid var(--outline-variant)",
                background: "var(--surface)", color: "var(--on-surface)",
                fontSize: 15, fontFamily: "inherit", padding: "0 12px",
                outline: "none",
              }}
            >
              {TRANSLATE_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
            <button
              onClick={handleTranslate}
              disabled={translating}
              style={{
                height: 44, padding: "0 20px",
                background: "var(--secondary)",
                color: "var(--on-secondary)",
                border: "none", borderRadius: 8,
                fontSize: 14, fontWeight: 600, fontFamily: "inherit",
                cursor: translating ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 8,
                whiteSpace: "nowrap", flexShrink: 0,
                position: "relative", overflow: "hidden",
              }}
            >
              {translating && (
                <span style={{
                  position: "absolute", bottom: 0, left: 0, height: 3,
                  width: "40%", borderRadius: 9999,
                  background: "rgba(255,255,255,0.7)",
                  animation: "translateBar 1.4s ease-in-out infinite",
                }} />
              )}
              {translating ? (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, animation: "spin 1.2s linear infinite" }}>progress_activity</span>
                  {ui.translating}
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>translate</span>
                  {ui.translate}
                </>
              )}
            </button>
            <style>{`
              @keyframes translateBar {
                0%   { left: -40%; }
                100% { left: 140%; }
              }
            `}</style>
          </div>
        )}

        {translateError && (
          <p className="text-body-md" style={{ color: "var(--error)", margin: "10px 0 0" }}>{translateError}</p>
        )}
      </div>
      <button
        onClick={() => { setShowQR(true); setQrDataUrl(null); }}
        aria-label="Show QR code to share action plan with an advocate"
        style={{
          width: "100%", height: 52,
          background: "var(--surface)", color: "var(--primary)",
          border: "1px solid var(--primary)",
          borderRadius: 8,
          fontSize: 14, fontWeight: 600, fontFamily: "inherit",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          transition: "all 0.15s",
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>qr_code_2</span>
        {ui.shareQr}
      </button>

      {canShare && (
        <button
          onClick={handleShare}
          aria-label="Share action plan via system share sheet"
          style={{
            width: "100%", height: 52,
            background: "var(--surface)", color: "var(--primary)",
            border: "1px solid var(--primary)",
            borderRadius: 8,
            fontSize: 14, fontWeight: 600, fontFamily: "inherit",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            transition: "all 0.15s",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>share</span>
          {ui.share}
        </button>
      )}
      <button
        onClick={handleDownload}
        disabled={downloading}
        aria-label="Download action plan as PDF"
        style={{
          width: "100%", height: 52,
          background: downloading ? "var(--outline-variant)" : "var(--secondary)",
          color: downloading ? "var(--on-surface-variant)" : "var(--on-secondary)",
          border: "none", borderRadius: 8,
          fontSize: 14, fontWeight: 600, fontFamily: "inherit",
          cursor: downloading ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          boxShadow: downloading ? "none" : "0 4px 16px rgba(0,105,113,0.25)",
          transition: "all 0.15s",
        }}
      >
        {downloading ? (
          <>
            <span style={{
              display: "inline-block", width: 18, height: 18,
              border: "2.5px solid rgba(255,255,255,0.4)",
              borderTopColor: "var(--on-surface-variant)", borderRadius: "50%",
              animation: "spin 0.7s linear infinite",
            }} />
            {ui.downloading}
          </>
        ) : (
          <>
            <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>download</span>
            {ui.downloadPdf}
          </>
        )}
      </button>
      <button
        onClick={onReset}
        className="btn-secondary"
        aria-label="Go back and analyze another notice"
        style={{ width: "100%", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
        {ui.analyzeAnother}
      </button>
    </div>
  );
}
