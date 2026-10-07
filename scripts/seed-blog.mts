/**
 * Adds starter blog posts (English and Arabic): `pnpm blog:seed`.
 * Safe to run again: a post whose web address already exists is left untouched.
 * The posts are general guides; edit or delete them in the admin panel under Blog.
 */
import { loadEnv } from './load-env.mts';

loadEnv();

const { getDb, closeDb } = await import('../src/lib/db/client');
const { ensureSchema } = await import('../src/lib/db/collections');
const { postRepository } = await import('../src/lib/db/repositories/post.repository');

const author = 'Phantom PPF team';
const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000);

const posts = [
  {
    slug: 'ppf-vs-ceramic-coating',
    cover: '/images/showcase/1.jpg',
    tags: ['ppf', 'ceramic coating'],
    publishedAt: daysAgo(2),
    translations: {
      en: {
        title: 'PPF vs ceramic coating: which does your car need?',
        excerpt:
          'Paint protection film and ceramic coating solve different problems. Here is what each one does, and how to choose.',
        body: `Paint protection film stops physical damage such as stone chips. Ceramic coating adds gloss and makes the car easier to clean. They solve different problems, which is why many owners use both.

## What paint protection film does

PPF is a thick, clear urethane layer applied over the paint. It absorbs the impact of gravel and sand on the highway, so the chip lands in the film and not in your paint. Light scratches in a self-healing film close up again with heat from the sun or warm water.

- Protects against stone chips, sand and light scratches
- Can be removed later, leaving the original paint underneath
- Best on the areas that take the most impact: bumper, bonnet, mirrors and door edges

## What ceramic coating does

A ceramic coating is a thin, hard layer that bonds to the paint. Water and dust slide off it, so washing takes less effort and the gloss lasts longer. **It does not stop stone chips**: the layer is far too thin to absorb an impact.

## Which should you choose?

1. Mostly highway driving: start with PPF on the front of the car.
2. Mostly city driving and you want easy cleaning: ceramic coating.
3. A new car you plan to keep: PPF on the high-impact areas, with a ceramic coating over everything.

> A simple rule: film protects the paint from damage, coating protects the shine.

Not sure which fits your car? [Send us the details](/contact) and we will recommend a setup for how you drive.`,
      },
      ar: {
        title: 'فيلم حماية الطلاء أم السيراميك: ما الذي تحتاجه سيارتك؟',
        excerpt: 'فيلم حماية الطلاء وطلاء السيراميك يحلّان مشكلتين مختلفتين. إليك وظيفة كل منهما وكيف تختار.',
        body: `فيلم حماية الطلاء يمنع الأضرار المادية مثل ضربات الحصى. أما طلاء السيراميك فيزيد اللمعان ويسهّل تنظيف السيارة. كل منهما يحل مشكلة مختلفة، ولهذا يجمع كثير من الملّاك بينهما.

## ماذا يفعل فيلم حماية الطلاء

الفيلم طبقة شفافة سميكة من اليوريثان تُركّب فوق الطلاء. تمتص صدمة الحصى والرمل على الطرق السريعة، فتقع الضربة على الفيلم لا على الطلاء. والخدوش الخفيفة في الأفلام ذاتية المعالجة تختفي بحرارة الشمس أو الماء الدافئ.

- يحمي من ضربات الحصى والرمل والخدوش الخفيفة
- يمكن إزالته لاحقاً ليبقى الطلاء الأصلي كما هو
- الأفضل للمناطق الأكثر تعرضاً: الصدّام وغطاء المحرك والمرايا وحواف الأبواب

## ماذا يفعل طلاء السيراميك

طلاء السيراميك طبقة رقيقة صلبة ترتبط بالطلاء. ينزلق عنها الماء والغبار، فيصبح الغسيل أسهل ويدوم اللمعان أطول. **لكنه لا يمنع ضربات الحصى**، فالطبقة أرق من أن تمتص الصدمة.

## أيهما تختار؟

1. قيادة أغلبها على الطرق السريعة: ابدأ بالفيلم على مقدمة السيارة.
2. قيادة داخل المدينة وتريد تنظيفاً سهلاً: طلاء السيراميك.
3. سيارة جديدة تنوي الاحتفاظ بها: الفيلم على المناطق المعرّضة، والسيراميك فوق الجميع.

> قاعدة بسيطة: الفيلم يحمي الطلاء من الضرر، والسيراميك يحمي اللمعان.

لست متأكداً مما يناسب سيارتك؟ [أرسل لنا التفاصيل](/contact) وسنرشّح لك ما يناسب طريقة قيادتك.`,
      },
    },
  },
  {
    slug: 'how-to-wash-a-car-with-ppf',
    cover: '/images/facility/2.jpg',
    tags: ['ppf', 'maintenance'],
    publishedAt: daysAgo(9),
    translations: {
      en: {
        title: 'How to wash a car with paint protection film',
        excerpt:
          'Film is tough, but the wrong wash can lift an edge or dull the finish. A short routine keeps it clear for years.',
        body: `Paint protection film needs less care than bare paint, not none. The routine below takes about the same time as a normal wash.

## Wait before the first wash

Fresh film needs time for the moisture underneath to dry out and the adhesive to settle. Ask your installer how long to wait before the first wash, and avoid pressure washers during that time.

## The safe wash routine

1. Rinse the car first to remove loose sand, so you do not drag it across the film.
2. Wash with a pH-neutral shampoo and a soft microfibre mitt.
3. Rinse again and dry with a clean microfibre towel.

## What to avoid

- **Pressure washer close to the edges.** Keep the nozzle well back and never aim it at a film edge.
- Abrasive polishes and rough brushes, which can mark the top coat.
- Leaving bird droppings, bug splatter or tree sap to bake in the sun. Remove them soon with water and a soft cloth.

## Matte and satin films

Matte film must not be polished or waxed: polish fills the texture and leaves shiny patches. Use products made for matte finishes only.

> If an edge starts to lift, do not pull it. Bring the car in and it can usually be fixed.`,
      },
      ar: {
        title: 'كيف تغسل سيارة عليها فيلم حماية الطلاء',
        excerpt: 'الفيلم متين، لكن الغسيل الخاطئ قد يرفع حافته أو يُبهت سطحه. روتين قصير يبقيه صافياً لسنوات.',
        body: `فيلم حماية الطلاء يحتاج عناية أقل من الطلاء المكشوف، لكنه لا يستغني عنها. الروتين التالي يأخذ وقت الغسيل العادي تقريباً.

## انتظر قبل الغسلة الأولى

الفيلم الجديد يحتاج وقتاً لتجف الرطوبة تحته ويثبت اللاصق. اسأل الفني عن مدة الانتظار قبل الغسلة الأولى، وتجنّب مضخات الضغط خلالها.

## روتين الغسيل الآمن

1. اشطف السيارة أولاً لإزالة الرمل حتى لا تسحبه على الفيلم.
2. اغسل بشامبو متعادل الحموضة وقفاز مايكروفايبر ناعم.
3. اشطف مرة أخرى وجفّف بمنشفة مايكروفايبر نظيفة.

## ما يجب تجنّبه

- **مضخة الضغط قرب الحواف.** أبعد الفوهة ولا توجهها نحو حافة الفيلم.
- مواد التلميع الكاشطة والفرش الخشنة، فقد تترك أثراً على الطبقة العليا.
- ترك فضلات الطيور أو آثار الحشرات أو صمغ الأشجار تحت الشمس. أزلها سريعاً بالماء وقطعة قماش ناعمة.

## الأفلام المطفية والساتان

الفيلم المطفي لا يُلمَّع ولا يُشمَّع، فالتلميع يملأ ملمسه ويترك بقعاً لامعة. استخدم منتجات مخصصة للأسطح المطفية فقط.

> إذا بدأت حافة بالارتفاع فلا تسحبها. أحضر السيارة وغالباً يمكن إصلاحها.`,
      },
    },
  },
  {
    slug: 'full-front-or-full-body-ppf',
    cover: '/images/showcase/3.jpg',
    tags: ['ppf', 'buying guide'],
    publishedAt: daysAgo(20),
    translations: {
      en: {
        title: 'Full front or full body: how much of the car should you wrap?',
        excerpt:
          'You do not have to cover every panel. Here is where damage really happens, and three common ways to cover it.',
        body: `Most paint damage happens in the same few places. Knowing where lets you spend on film where it does the most good.

## Where cars get damaged

- **Front bumper and bonnet:** stone chips from the vehicle ahead
- **Mirrors and front wings:** sand and gravel thrown up at speed
- **Door edges, handles and sills:** rings, keys, shoes and bags
- **Rear bumper top:** loading and unloading the boot

## Three common packages

### Partial front

The bumper, part of the bonnet and the mirrors. The lowest cost, but the film edge is visible across the bonnet.

### Full front

The whole bumper, bonnet, front wings and mirrors. No line across the bonnet, and it covers nearly all highway damage. This is the choice most owners make.

### Full body

Every painted panel. It protects against parking marks and scratches as well as chips, and it suits new cars, dark colours and cars you plan to keep.

## How to decide

1. How long will you keep the car? The longer you keep it, the more a full wrap pays back.
2. Where do you drive? Highway kilometres mean more chips on the front.
3. What colour is it? Dark and solid colours show every mark.

[Tell us about your car](/contact) and we will suggest the coverage that fits.`,
      },
      ar: {
        title: 'المقدمة كاملة أم السيارة كاملة: كم تغطي من سيارتك؟',
        excerpt: 'لا يلزم تغطية كل لوح. إليك أين يحدث الضرر فعلاً، وثلاث طرق شائعة لتغطيته.',
        body: `أغلب أضرار الطلاء تقع في الأماكن نفسها. معرفة هذه الأماكن تجعلك تنفق على الفيلم حيث ينفع أكثر.

## أين تتضرر السيارات

- **الصدّام الأمامي وغطاء المحرك:** ضربات الحصى من السيارة التي أمامك
- **المرايا والرفارف الأمامية:** الرمل والحصى المتطاير عند السرعة
- **حواف الأبواب والمقابض والعتبات:** الخواتم والمفاتيح والأحذية والحقائب
- **أعلى الصدّام الخلفي:** تحميل الأغراض وتنزيلها

## ثلاث باقات شائعة

### مقدمة جزئية

الصدّام وجزء من غطاء المحرك والمرايا. الأقل تكلفة، لكن حافة الفيلم تظهر على غطاء المحرك.

### مقدمة كاملة

الصدّام كاملاً وغطاء المحرك والرفارف الأمامية والمرايا. لا خط على غطاء المحرك، وتغطي معظم أضرار الطرق السريعة. وهي اختيار أغلب الملّاك.

### السيارة كاملة

كل الألواح المطلية. تحمي من آثار المواقف والخدوش إضافة إلى ضربات الحصى، وتناسب السيارات الجديدة والألوان الداكنة والسيارات التي تنوي الاحتفاظ بها.

## كيف تقرر

1. كم ستحتفظ بالسيارة؟ كلما طالت المدة زادت فائدة التغطية الكاملة.
2. أين تقود؟ كثرة الطرق السريعة تعني ضربات أكثر على المقدمة.
3. ما لونها؟ الألوان الداكنة والسادة تُظهر كل أثر.

[أخبرنا عن سيارتك](/contact) وسنقترح التغطية المناسبة.`,
      },
    },
  },
];

await ensureSchema(await getDb());
for (const post of posts) {
  if (await postRepository.findBySlug(post.slug)) {
    console.log(`Kept existing post /blog/${post.slug}`);
    continue;
  }
  await postRepository.create({ ...post, status: 'published', author });
  console.log(`Added post /blog/${post.slug}`);
}
await closeDb();
