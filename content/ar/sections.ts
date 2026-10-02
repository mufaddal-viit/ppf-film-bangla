import type { LocaleContentInput } from '../../src/lib/content/schema';

/** Section copy, keyed by the contentRef used in config/pages.ts. */
export const sections: LocaleContentInput['sections'] = {
  'home-hero': {
    key: 'hero',
    eyebrow: 'استوديو العناية بالسيارات في دبي',
    heading: 'احمِ طلاء سيارتك من شمس الإمارات ورمالها وطرقها',
    subheading: 'أفلام حماية الطلاء والطلاء السيراميكي وتظليل النوافذ والتغليف، بأيدي فنيين معتمدين.',
    primaryCta: { action: 'route', label: 'احصل على عرض سعر مجاني', href: '/contact' },
    secondaryCta: { action: 'whatsapp', label: 'تواصل عبر واتساب' },
    media: {
      type: 'image',
      image: { src: '/images/hero.jpg', alt: 'سيارة رياضية سوداء بلمسة فيلم حماية لامعة', width: 1920, height: 1080 },
    },
    serviceChips: ['paint-protection-film', 'ceramic-coating', 'window-tinting', 'car-wrapping'],
  },
  'home-trust': {
    key: 'trustStrip',
    heading: 'لماذا يثق بنا السائقون',
    ratingLabel: 'متوسط التقييم',
    warrantyLabel: 'سنوات ضمان',
    jobsLabel: 'سيارة محمية',
    partnersLabel: 'مركّب معتمد لدى',
    partners: [{ name: 'Partner Brand A' }, { name: 'Partner Brand B' }, { name: 'Partner Brand C' }],
  },
  'home-services': {
    key: 'servicesGrid',
    heading: 'خدماتنا',
    intro: 'كل ما تحتاجه سيارتك لتبدو جديدة وتبقى محمية.',
    serviceSlugs: [],
  },
  'home-climate': {
    key: 'climate',
    heading: 'مصممة لظروف الإمارات',
    intro: 'حرارة الصحراء والرمال والرحلات الطويلة على الطرق السريعة قاسية على الطلاء والزجاج والمقصورة.',
    points: [
      { icon: 'sun', title: 'أشعة وحرارة شديدة', body: 'حرارة الصيف تُبهت الطلاء وتُشقق المقصورة دون حماية.' },
      {
        icon: 'wind',
        title: 'الرمال والغبار',
        body: 'الرمال التي تحملها الرياح تعمل كورق الصنفرة على الطلاء والزجاج.',
      },
      {
        icon: 'road',
        title: 'مخلفات الطرق السريعة',
        body: 'القيادة السريعة على E11 وE311 تقذف الحصى على غطاء المحرك والصدام.',
      },
    ],
  },
  'home-why': {
    key: 'whyChooseUs',
    heading: 'لماذا PPF Phantom',
    points: [
      {
        icon: 'badge-check',
        title: 'فنيون معتمدون',
        body: 'كل فني مدرَّب ومعتمد من الشركة المصنعة للفيلم.',
        proof: 'اعتماد الشركة المصنعة',
      },
      { icon: 'shield-check', title: 'ضمان مكتوب', body: 'الفيلم والعمل مشمولان بضمان مسجل.' },
      { icon: 'warehouse', title: 'غرف خالية من الغبار', body: 'غرف تركيب نظيفة ومكيفة لنتيجة مثالية.' },
    ],
  },
  'home-packages': {
    key: 'packages',
    heading: 'الباقات الأكثر طلباً',
    intro: 'أسعار تبدأ من. يعتمد السعر النهائي على حجم السيارة وحالتها.',
    packageIds: [],
    cta: { action: 'route', label: 'اطلب السعر الدقيق', href: '/contact' },
  },
  'home-portfolio': {
    key: 'portfolio',
    heading: 'أعمالنا الأخيرة',
    intro: 'مجموعة من السيارات التي حميناها وغيّرنا مظهرها.',
    showFilters: true,
    reels: [],
  },
  'home-facility': {
    key: 'facility',
    heading: 'الاستوديو',
    intro: 'منشأة مخصصة ومكيفة مصممة لأعمال الأفلام والطلاء.',
    photos: [
      { src: '/images/facility/1.jpg', alt: 'غرفة تركيب فيها سيارة تحت أضواء فحص ساطعة', width: 1200, height: 800 },
      { src: '/images/facility/2.jpg', alt: 'صالة استقبال العملاء في الاستوديو', width: 1200, height: 800 },
      { src: '/images/facility/3.jpg', alt: 'آلة قص تقطع نموذج فيلم PPF', width: 1200, height: 800 },
    ],
    stats: [
      { label: 'سيارة محمية', value: { fact: 'jobsCompleted' }, suffix: '+' },
      { label: 'سنوات ضمان', value: { fact: 'warrantyYearsMax' } },
      { label: 'غرف تركيب', value: { number: 6 } },
    ],
  },
  'home-process': {
    key: 'process',
    heading: 'كيف نعمل',
    steps: [
      { title: 'الاستشارة', body: 'أخبرنا عن سيارتك وطريقة قيادتك، ونرشح لك الحماية المناسبة.' },
      { title: 'التحضير', body: 'نغسل السيارة ونزيل الشوائب ونصحح الطلاء قبل أي فيلم أو طلاء.' },
      { title: 'التركيب', body: 'يركّب فنيون معتمدون في غرفة خالية من الغبار.' },
      { title: 'الفحص والتسليم', body: 'نفحص السيارة تحت إضاءة الاستوديو ونسجل ضمانك.' },
    ],
  },
  'home-reviews': {
    key: 'reviews',
    heading: 'آراء العملاء',
  },
  'home-faq': {
    key: 'faq',
    heading: 'الأسئلة الشائعة',
    faqIds: [],
  },
  'home-contact': {
    key: 'contactCta',
    heading: 'احصل على عرض سعر مجاني',
    intro: 'أرسل بيانات سيارتك وسنرد عليك بالسعر، عادةً خلال ساعة عمل واحدة.',
    formVariant: 'quote',
    showMap: true,
  },
  'contact-form': {
    key: 'contactCta',
    heading: 'أرسل لنا رسالة',
    intro: 'أسئلة أو حجوزات أو عروض أسعار: نرد خلال ساعة عمل واحدة.',
    formVariant: 'contact',
    showMap: true,
  },
};
