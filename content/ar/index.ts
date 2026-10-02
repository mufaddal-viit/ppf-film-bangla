import type { LocaleContentInput } from '../../src/lib/content/schema';
import { faqs } from './faqs';
import { sections } from './sections';
import { services } from './services';

/** SAMPLE CONTENT: replace testimonials and portfolio with real data before launch. */
export const content: LocaleContentInput = {
  common: {
    tagline: 'حماية الطلاء والطلاء السيراميكي وتظليل النوافذ في دبي',
    businessDescription:
      'PPF Phantom استوديو للعناية بالسيارات في دبي متخصص في أفلام حماية الطلاء والطلاء السيراميكي وتظليل النوافذ وتغليف السيارات والتنظيف التفصيلي.',
    whatsappMessage: 'مرحباً PPF Phantom، أرغب في عرض سعر لسيارتي.',
  },
  pages: {
    home: {
      title: 'أفلام حماية الطلاء والطلاء السيراميكي في دبي',
      seo: {
        title: 'أفلام PPF والطلاء السيراميكي والتظليل في دبي',
        description:
          'أفلام حماية الطلاء والطلاء السيراميكي وتظليل النوافذ والتغليف في دبي بأيدٍ معتمدة. اطلب عرض سعر مجاني.',
      },
    },
    services: {
      title: 'خدمات حماية السيارات',
      intro: 'اختر الحماية المناسبة لطريقة ومكان قيادتك.',
      seo: {
        title: 'الخدمات',
        description: 'أفلام PPF والطلاء السيراميكي وتظليل النوافذ والتغليف والتنظيف التفصيلي في دبي.',
      },
    },
    gallery: {
      title: 'معرض الأعمال',
      intro: 'سيارات قمنا بحمايتها وتغليفها وتنظيفها.',
      seo: { title: 'معرض الأعمال', description: 'صور وفيديوهات لمشاريع PPF والسيراميك والتظليل والتغليف.' },
    },
    prices: {
      title: 'الأسعار',
      intro: 'أسعار تبدأ من لأكثر خدماتنا طلباً.',
      seo: { title: 'الأسعار', description: 'أسعار تبدأ من لأفلام PPF والسيراميك والتظليل والتغليف والتنظيف في دبي.' },
    },
    about: {
      title: 'عن PPF Phantom',
      intro: 'استوديو في دبي مكرّس لحماية السيارات وإتقان مظهرها.',
      seo: { title: 'من نحن', description: 'تعرّف على الفريق المعتمد والاستوديو وراء PPF Phantom في دبي.' },
    },
    contact: {
      title: 'تواصل معنا',
      intro: 'اتصل أو راسلنا عبر واتساب أو أرسل النموذج. نرد عادةً خلال ساعة عمل واحدة.',
      seo: { title: 'تواصل معنا', description: 'اتصل أو راسل PPF Phantom في دبي عبر واتساب أو اطلب عرض سعر.' },
      whatsappMessage: 'مرحباً PPF Phantom، لدي سؤال.',
    },
    blog: {
      title: 'المدونة',
      intro: 'أدلة ونصائح لحماية سيارتك في الإمارات.',
      seo: { title: 'المدونة', description: 'أدلة العناية بالسيارات لسائقي الإمارات: PPF والسيراميك والتظليل وغيرها.' },
    },
    privacyPolicy: {
      title: 'سياسة الخصوصية',
      seo: { title: 'سياسة الخصوصية', description: 'كيف تجمع PPF Phantom بياناتك الشخصية وتستخدمها وتحميها.' },
    },
    terms: {
      title: 'الشروط والأحكام',
      seo: { title: 'الشروط والأحكام', description: 'الشروط المطبقة على الخدمات التي تقدمها PPF Phantom.' },
    },
    notFound: {
      title: 'الصفحة غير موجودة',
      intro: 'الصفحة التي تبحث عنها غير موجودة أو تم نقلها.',
      seo: { title: 'الصفحة غير موجودة', description: 'الصفحة التي تبحث عنها غير موجودة.' },
    },
  },
  services,
  packages: [
    {
      id: 'front-protection',
      name: 'حماية الواجهة',
      description: 'فيلم PPF على المناطق الأكثر تعرضاً للحصى.',
      includes: ['غطاء المحرك كاملاً', 'الصدام الأمامي', 'الرفارف الأمامية', 'المرايا'],
    },
    {
      id: 'full-body-ppf',
      name: 'PPF للهيكل كاملاً',
      description: 'تغطية كل الألواح المطلية لحماية شاملة.',
      includes: ['جميع الألواح المطلية', 'حواف الأبواب ومقابضها', 'تصحيح الطلاء', 'طبقة سيراميك علوية'],
    },
    {
      id: 'ceramic-pro',
      name: 'سيراميك برو',
      description: 'طلاء سيراميكي متعدد الطبقات مع تصحيح الطلاء.',
      includes: ['تصحيح الطلاء على مرحلتين', 'طلاء سيراميكي للهيكل', 'طلاء للجنوط والزجاج'],
    },
  ],
  faqs,
  testimonials: [
    {
      id: 'sample-1',
      author: 'عميل تجريبي',
      rating: 5,
      text: 'مراجعة تجريبية. استبدلها بمراجعة حقيقية قبل الإطلاق.',
      date: '2026-09-01',
      source: 'Google',
      vehicle: 'سيارة تجريبية',
    },
    {
      id: 'sample-2',
      author: 'عميل تجريبي',
      rating: 5,
      text: 'مراجعة تجريبية. استبدلها بمراجعة حقيقية قبل الإطلاق.',
      date: '2026-08-15',
      source: 'Google',
    },
  ],
  portfolio: [
    {
      id: 'project-1',
      title: 'PPF للهيكل كاملاً',
      serviceSlug: 'paint-protection-film',
      vehicle: 'كوبيه رياضية',
      image: { src: '/images/portfolio/1.jpg', alt: 'كوبيه رياضية بعد تركيب PPF كامل', width: 1200, height: 800 },
    },
    {
      id: 'project-2',
      title: 'طلاء سيراميكي',
      serviceSlug: 'ceramic-coating',
      vehicle: 'SUV فاخرة',
      image: { src: '/images/portfolio/2.jpg', alt: 'سيارة SUV بطلاء سيراميكي جديد', width: 1200, height: 800 },
    },
    {
      id: 'project-3',
      title: 'تغليف رمادي ساتان',
      serviceSlug: 'car-wrapping',
      vehicle: 'سيدان',
      image: { src: '/images/portfolio/3.jpg', alt: 'سيدان مغلفة بالرمادي الساتان', width: 1200, height: 800 },
    },
    {
      id: 'project-4',
      title: 'تظليل نانو سيراميك',
      serviceSlug: 'window-tinting',
      vehicle: 'بيك أب',
      image: { src: '/images/portfolio/4.jpg', alt: 'بيك أب بنوافذ مظللة', width: 1200, height: 800 },
    },
    {
      id: 'project-5',
      title: 'حماية الواجهة',
      serviceSlug: 'paint-protection-film',
      vehicle: 'هاتشباك',
      image: { src: '/images/portfolio/5.jpg', alt: 'هاتشباك مع PPF للواجهة', width: 1200, height: 800 },
    },
    {
      id: 'project-6',
      title: 'تصحيح الطلاء',
      serviceSlug: 'detailing',
      vehicle: 'سيارة كلاسيكية',
      image: { src: '/images/portfolio/6.jpg', alt: 'سيارة كلاسيكية بعد تصحيح الطلاء', width: 1200, height: 800 },
    },
  ],
  sections,
};
