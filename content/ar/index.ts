import type { LocaleContentInput } from '../../src/lib/content/schema';
import { faqs } from './faqs';
import { sections } from './sections';
import { services } from './services';

/** Arabic translation of content/en/index.ts (source: getfossil.com). */
export const content: LocaleContentInput = {
  common: {
    tagline: 'قوة لا تخطئها العين. وضوح استثنائي.',
    businessDescription:
      'Fossil علامة أمريكية لأفلام حماية الطلاء وأفلام النوافذ مقرها أبيلين، تكساس. طُوّر Fossil PPF ليقدم حماية موثوقة للطلاء بوضوح وقوة استثنائيين وأداء طويل الأمد.',
    whatsappMessage: 'مرحباً Fossil، أود معرفة المزيد عن أفلامكم.',
  },
  pages: {
    home: {
      title: 'Fossil لأفلام حماية الطلاء',
      seo: {
        title: 'Fossil لأفلام حماية الطلاء وأفلام النوافذ',
        description: 'يقدم Fossil PPF حماية موثوقة للطلاء بوضوح وقوة استثنائيين وأداء طويل الأمد.',
      },
    },
    services: {
      title: 'منتجاتنا',
      intro:
        'أفلام حماية طلاء شفافة وساتان ومطفية، وأفلام نوافذ سيراميك. حماية متينة ذاتية الإصلاح تُبقي سيارتك كأنها جديدة.',
      seo: {
        title: 'المنتجات',
        description:
          'أفلام Fossil الشفافة (Apex و Sapphire و Opal) و Stealth الساتان و Frozen المطفي وأفلام النوافذ Solaris و Luminox.',
      },
    },
    gallery: {
      title: 'مصمم ليحفظ',
      intro: 'فيلم حماية طلاء يحافظ على ما يميّز سيارتك.',
      seo: { title: 'مصمم ليحفظ', description: 'أفلام Fossil لحماية الطلاء وأفلام النوافذ بالصور.' },
    },
    prices: {
      title: 'منتجاتنا',
      intro: 'تواصل معنا أو مع فني التركيب المحلي لمعرفة أسعار أي فيلم من Fossil.',
      seo: {
        title: 'مجموعة المنتجات',
        description: 'مجموعة Fossil من أفلام حماية الطلاء وأفلام النوافذ السيراميكية. تواصل معنا لمعرفة الأسعار.',
      },
    },
    about: {
      title: 'عن Fossil',
      intro:
        'تلك الرؤية أدّت إلى ولادة FOSSIL، علامة أمريكية لأفلام حماية الطلاء وأفلام النوافذ مقرها أبيلين، تكساس، صُممت لتعيد تعريف معايير الصناعة.',
      seo: {
        title: 'من نحن',
        description:
          'Fossil علامة أمريكية لأفلام حماية الطلاء وأفلام النوافذ من أبيلين، تكساس، مبنية على أكثر من عقدين من الخبرة.',
      },
    },
    contact: {
      title: 'تواصل معنا',
      intro: 'يسعدنا أن نسمع منك.',
      seo: { title: 'تواصل معنا', description: 'اتصل أو راسل Fossil في أبيلين، تكساس.' },
    },
    blog: {
      title: 'المدونة',
      seo: { title: 'المدونة', description: 'أخبار وإرشادات من Fossil لأفلام حماية الطلاء.' },
    },
    privacyPolicy: {
      title: 'سياسة الخصوصية',
      seo: { title: 'سياسة الخصوصية', description: 'كيف تجمع Fossil بياناتك الشخصية وتستخدمها وتحميها.' },
    },
    terms: {
      title: 'الشروط والأحكام',
      seo: { title: 'الشروط والأحكام', description: 'الشروط التي تنطبق على هذا الموقع.' },
    },
    notFound: {
      title: 'الصفحة غير موجودة',
      intro: 'الصفحة التي تبحث عنها غير موجودة أو تم نقلها.',
      seo: { title: 'الصفحة غير موجودة', description: 'الصفحة التي تبحث عنها غير موجودة.' },
    },
  },
  services,
  packages: [],
  faqs,
  testimonials: [],
  portfolio: [],
  sections,
};
