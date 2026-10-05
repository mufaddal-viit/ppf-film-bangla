import type { LocaleContentInput } from '../../src/lib/content/schema';

/** Arabic translation of content/en/sections.ts (source: getfossil.com). */
export const sections: LocaleContentInput['sections'] = {
  'home-hero': {
    key: 'hero',
    eyebrow: 'Fossil لأفلام حماية الطلاء · الولايات المتحدة',
    wordmark: 'FOSSIL',
    heading: 'قوة لا تخطئها العين، وضوح استثنائي',
    headingHighlight: 'وضوح استثنائي',
    subheading: 'حماية موثوقة للطلاء دون تغيير شخصية سيارتك',
    stats: [
      { icon: 'shield-check', value: '{warrantyYearsMaxNumber}', label: 'سنوات ضمان كحد أقصى' },
      { icon: 'shield', value: '7.5 mil', label: 'سماكة الفيلم' },
      { icon: 'sparkles', value: '99 GU', label: 'اللمعان (Apex)' },
      { icon: 'sun', value: '99%', label: 'حجب الأشعة فوق البنفسجية' },
      { icon: 'badge-check', value: '∆E < 1', label: 'مقاومة الاصفرار' },
    ],
    primaryCta: { action: 'route', label: 'اكتشف Fossil PPF', href: '/services' },
    secondaryCta: { action: 'route', label: 'تواصل معنا', href: '/contact' },
    media: {
      type: 'image',
      image: {
        src: '/images/hero/car.webp',
        alt: 'سيارة كوبيه رياضية بيضاء محمية بفيلم حماية الطلاء الشفاف، منظر جانبي',
        width: 2049,
        height: 606,
      },
    },
    serviceChips: [],
  },
  'home-trust': {
    key: 'trustStrip',
    heading: 'مصمم لتحمّل قسوة الواقع',
    intro:
      'كل رحلة تترك أثرها: صدمات وحصى وملوثات وتعرّض مستمر لعوامل البيئة. يعمل Fossil PPF كطبقة دفاعية عالية القوة تمتص إجهاد السطح قبل أن يصل إلى طلائك.',
    stats: [
      { label: 'سنوات ضمان كحد أقصى', value: { fact: 'warrantyYearsMax' } },
      { label: 'عاماً من الخبرة في الصناعة', value: { number: 20 }, suffix: '+' },
      { label: 'خطوط أفلام', value: { number: 7 } },
      { label: 'حجب الأشعة فوق البنفسجية، أفلام النوافذ', value: { number: 99 }, suffix: '%' },
    ],
  },
  'home-services': {
    key: 'servicesGrid',
    heading: 'منتجات Fossil لحماية السيارات',
    intro: 'الزمن يغيّر كل شيء، إلا ما هو محمي.',
    serviceSlugs: [],
  },
  'home-features': {
    key: 'climate',
    heading: 'فيلم Fossil لحماية الطلاء',
    intro: 'بتوازن بين الصلابة والرقي، يحافظ فيلم Fossil لحماية الطلاء على ما يميّز سيارتك، اليوم ولسنوات قادمة.',
    points: [
      {
        icon: 'sparkles',
        title: 'وضوح فائق',
        body: 'شفافية لا مثيل لها تحافظ على لمسة الطلاء الأصلية دون تشويه، وتعزز اللمعان وتحافظ على مظهر المصنع.',
      },
      {
        icon: 'spray-can',
        title: 'مقاومة البقع',
        body: 'يحمي من بقع الماء وبقايا الحشرات وأوساخ الطريق والبقع الكيميائية الخفيفة لصيانة أسهل.',
      },
      {
        icon: 'shield-check',
        title: 'سطح ذاتي الإصلاح',
        body: 'تختفي الخدوش البسيطة وآثار التلميع عند التعرض للحرارة، فيبقى السطح ناعماً ونظيفاً.',
      },
      {
        icon: 'badge-check',
        title: 'التصاق موثوق',
        body: 'مصمم لالتصاق ثابت بالأسطح المطلية، بما يضمن أداءً مستقراً وإزالة نظيفة عند الحاجة.',
      },
    ],
  },
  'home-why': {
    key: 'whyChooseUs',
    heading: 'لماذا Fossil',
    points: [
      {
        icon: 'clock',
        title: 'مبني على الخبرة',
        body: 'يستند إلى عقود من الريادة في الصناعة وتطوير الأسواق على أرض الواقع.',
      },
      {
        icon: 'shield',
        title: 'مصمم ليدوم',
        body: 'مصمم لمقاومة التقادم وتغيّر اللون والبقع وفقدان اللمعان.',
      },
      {
        icon: 'star',
        title: 'أداء ممتاز',
        body: 'وضوح عالٍ وحماية متينة وتميّز بصري طويل الأمد.',
      },
      {
        icon: 'badge-check',
        title: 'موثوق من المحترفين',
        body: 'طُوّر مع مراعاة فنيي التركيب، وأصحاب السيارات في القلب.',
      },
    ],
  },
  'home-technology': {
    key: 'climate',
    heading: 'تقنية متقدمة',
    intro: 'حماية تعمل بهدوء في الخلفية وتدعم الحفاظ على اللمسة النهائية على المدى الطويل دون عناية مستمرة.',
    points: [
      {
        icon: 'wind',
        title: 'طبقة طاردة للماء',
        body: 'طبقة علوية نانوية طاردة للماء تصدّ الماء والأوساخ والملوثات بزيادة زاوية تماس السطح، فيسهل التنظيف وتقل بقع الماء.',
      },
      {
        icon: 'shield-check',
        title: 'تقنية اللاصق',
        body: 'لاصق أكريليك هندسي يضمن التصاقاً متجانساً دون أثر، ويقلل أخطاء التركيب وارتفاع الحواف.',
      },
      {
        icon: 'sun',
        title: 'مقاومة الاصفرار',
        body: 'مثبتات الأشعة فوق البنفسجية ومضادات الأكسدة تمنع تغيّر اللون وتحافظ على الوضوح طوال عمر المنتج.',
      },
    ],
  },
  'home-about': {
    key: 'facility',
    heading: 'وعدنا',
    intro:
      'في FOSSIL نلتزم بتقديم حلول حماية الطلاء وأفلام النوافذ التي تحفظ القيمة وتعزز المظهر وتتجاوز التوقعات. كل منتج نصنعه يعكس تفانينا في الجودة والابتكار والحماية الدائمة لما هو أهم.',
    photos: [
      { src: '/images/facility/1.jpg', alt: 'شيفروليه كورفيت سوداء وحمراء من الأعلى', width: 1600, height: 1067 },
      {
        src: '/images/facility/2.jpg',
        alt: 'سيارة خارقة حمراء تحت عبارة Engineered to preserve',
        width: 1200,
        height: 800,
      },
      {
        src: '/images/facility/3.jpg',
        alt: 'سيارة SUV مرسوم على هيكلها خطوط ألواح فيلم حماية الطلاء',
        width: 1200,
        height: 800,
      },
    ],
    stats: [],
  },
  'about-story': {
    key: 'climate',
    heading: 'عن Fossil',
    intro: 'علامة أمريكية لأفلام حماية الطلاء وأفلام النوافذ مقرها أبيلين، تكساس، صُممت لتعيد تعريف معايير الصناعة.',
    points: [
      {
        icon: 'clock',
        title: 'القصة',
        body: 'بخبرة تتجاوز عقدين في تأسيس وتنمية أسواق بعض أكثر الأسماء احتراماً في الصناعة، Solar Gard و Eastman و 3M، أدّت قيادتنا دوراً محورياً في تطور حلول حماية الطلاء وأفلام النوافذ حول العالم. ومن هذه الخلفية الواسعة انطلقت إدارتنا لإنشاء علامة تعكس جودة لا تقبل المساومة وابتكاراً وأداءً طويل الأمد.',
      },
      {
        icon: 'shield',
        title: 'مستوحاة من الحفظ',
        body: 'تبقى الأحافير قروناً لأنها تحمي ما تحت السطح وتحفظ التاريخ في أنقى صوره. وبالطريقة نفسها صُمم فيلم FOSSIL لحماية الطلاء ليحفظ الطلاء الأصلي للسيارة ويقيه من أضرار البيئة وحصى الطريق والاستهلاك اليومي. اسمنا يرمز إلى طول العمر والقوة والالتزام بالحفاظ على لمسة المصنع كما أُريد لها.',
      },
      {
        icon: 'sparkles',
        title: 'مصمم ليبقى',
        body: 'كثيراً ما تعاني حلول PPF التقليدية من التقادم والبقع والاصفرار وفقدان اللمعان، وهي مشكلات تنقص المظهر والقيمة مع الوقت. عبر علم مواد متقدم وتصنيع دقيق ومراقبة جودة صارمة، صُممت أفلام FOSSIL لتقاوم التدهور وتحافظ على الوضوح البصري وتمنح لمعاناً يدوم. والنتيجة حل حماية يعمل بثبات ويُركّب بثقة ويصمد أمام الزمن.',
      },
    ],
  },
  'home-contact': {
    key: 'contactCta',
    heading: 'يسعدنا أن نسمع منك',
    intro: 'أرسل لنا رسالة وسيتواصل معك فريق Fossil.',
    formVariant: 'contact',
    showMap: true,
  },
  'contact-form': {
    key: 'contactCta',
    heading: 'أرسل لنا رسالة',
    intro: 'ابقَ على تواصل: اتصل أو راسلنا أو استخدم النموذج.',
    formVariant: 'contact',
    showMap: true,
  },
};
