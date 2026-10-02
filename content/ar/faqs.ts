import type { LocaleContentInput } from '../../src/lib/content/schema';

/** Answers open with a direct, self-contained sentence. FAQs with a serviceSlug appear on that service page. */
export const faqs: LocaleContentInput['faqs'] = [
  {
    id: 'ppf-vs-ceramic',
    question: 'هل أختار PPF أم الطلاء السيراميكي؟',
    answer:
      'اختر PPF إذا أردت حماية مادية من الحصى والخدوش، واختر الطلاء السيراميكي إذا كان هدفك اللمعة وسهولة التنظيف. كثير من الملاك يجمعون بينهما: PPF على المناطق الأكثر تعرضاً، والسيراميك فوقه.',
  },
  {
    id: 'how-long-ppf',
    question: 'كم يدوم فيلم حماية الطلاء؟',
    answer:
      'يدوم فيلم PPF عالي الجودة سنوات طويلة في أجواء الإمارات، ويأتي فيلمنا بضمان يصل إلى {warrantyYearsMax}. الغسيل اليدوي المنتظم يحافظ على شفافيته ولمعته.',
  },
  {
    id: 'where-located',
    question: 'أين يقع {businessName}؟',
    answer: 'يقع {businessName} في {area}، {city}. نخدم العملاء في {areaServed}.',
  },
  {
    id: 'opening-hours',
    question: 'ما هي ساعات العمل؟',
    answer: 'نعمل {hours}.',
  },
  {
    id: 'ppf-damage-paint',
    question: 'هل يتلف فيلم PPF الطلاء عند إزالته؟',
    answer:
      'لا. فيلم PPF المركّب باحتراف يُزال عن طلاء المصنع بشكل نظيف. نزيل الأفلام القديمة بالحرارة ومواد فك اللاصق المناسبة لحماية الطبقة الشفافة.',
    serviceSlug: 'paint-protection-film',
  },
  {
    id: 'ceramic-wash',
    question: 'متى يمكنني غسل سيارتي بعد الطلاء السيراميكي؟',
    answer: 'انتظر 7 أيام قبل أول غسلة حتى يجف الطلاء تماماً، ثم اغسلها يدوياً بشامبو متعادل الحموضة.',
    serviceSlug: 'ceramic-coating',
  },
  {
    id: 'tint-legal',
    question: 'ما نسبة التظليل المسموحة في الإمارات؟',
    answer:
      'تسمح قوانين الإمارات بتظليل يصل إلى 50% على النوافذ الجانبية والخلفية، ويجب أن يبقى الزجاج الأمامي شفافاً. نساعدك في اختيار فيلم مطابق قبل التركيب.',
    serviceSlug: 'window-tinting',
  },
];
