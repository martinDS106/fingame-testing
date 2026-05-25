import type { Locale } from '@/lib/i18n';
import type {
  ChallengeId,
  ChallengeOption,
  ChallengeScenario,
} from '@/stores/useChallengesStore';

type ChallengeText = {
  title: string;
  description: string;
  situation: string;
  options: Record<string, { label: string; explanation: string }>;
};

const AR: Record<ChallengeId, ChallengeText> = {
  'emergency-fund': {
    title: 'صندوق الطوارئ',
    description: 'مصروف مفاجئ يضغط على ميزانيتك.',
    situation:
      'موبايلك اتكسر والإصلاح يكلف ٣٬٠٠٠ جنيه. عندك ١٬٥٠٠ جنيه مدخرات وصفر في صندوق الطوارئ.',
    options: {
      'save-first': {
        label: 'ادفع من المدخرات وقلّل مصروفات الشهر الجاي',
        explanation:
          'خطوة كويسة. تجنبت الديون. الخطوة الجاية: ابنِ صندوق طوارئ صغير.',
      },
      'credit-card': {
        label: 'حطها على كارت ائتمان وادفع بعدين',
        explanation:
          'مش مثالي. الديون بتكبر بسرعة. استخدم الائتمان بس لو هتسدد كامل.',
      },
      'borrow-friend': {
        label: 'استلف من صاحب بخطة سداد واضحة',
        explanation:
          'أحسن من ديون بفايدة عالية، بس اتفقوا على السداد عشان العلاقة.',
      },
    },
  },
  'salary-split': {
    title: 'تقسيم المرتب',
    description: 'قرر إزاي تقسّم مرتبك الشهري.',
    situation:
      'مرتبك ١٥٬٠٠٠ جنيه/شهر. عايز توفّر وتستثمر وتعيش برضه. هتعمل إيه؟',
    options: {
      '50-30-20': {
        label: 'قاعدة ٥٠/٣٠/٢٠ (احتياجات/رغبات/توفير)',
        explanation: 'هيكل ممتاز. بسيط ومستدام لمعظم الناس.',
      },
      'save-70': {
        label: 'وفر ٧٠٪ وعيش بشدة',
        explanation: 'التوفير كويس، بس القسوة ممكن تخليك تمل وتوقف.',
      },
      'spend-now': {
        label: 'صرف دلوقتي و«وفر بعدين»',
        explanation: 'كده الناس بتفضل فقيرة. ادفع لنفسك الأول حتى لو بمبلغ صغير.',
      },
    },
  },
  'credit-mistake': {
    title: 'غلطة في التصنيف الائتماني',
    description: 'قسط مستحق والكاش ضيق.',
    situation:
      'الحد الأدنى لكارت الائتمان مستحق بكرة. ناقصك ٥٠٠ جنيه.',
    options: {
      'sell-something': {
        label: 'بيع حاجة صغيرة / شغل سريع لـ ٥٠٠ جنيه',
        explanation: 'ممتاز. السداد في المعاد مهم. دور على كاش سريع.',
      },
      'miss-payment': {
        label: 'سيبه وادفع الشهر الجاي',
        explanation: 'تأخير السداد يضر التصنيف ويزود الرسوم. تجنبه لو تقدر.',
      },
      'borrow-short': {
        label: 'استلف ٥٠٠ لأسبوع واسدد في المعاد',
        explanation: 'مش مثالي، بس يحمي تاريخك الائتماني.',
      },
    },
  },
  'installment-trap': {
    title: 'فخ التقسيط',
    description: 'عرض مغر يظهر قدامك.',
    situation:
      'محل يعرض موبايل «تقسيط ٠٪» لـ ٢٤ شهر. دخلك ١٢٬٠٠٠ وعندك تقسيطين أصلاً.',
    options: {
      'wait-cash': {
        label: 'استنى ووفر كاش الأول',
        explanation: 'الأفضل. حتى ٠٪ ممكن تضغط التدفق النقدي. قلّل الالتزامات قبل ما تزود.',
      },
      'take-it': {
        label: 'خده دلوقتي (٠٪ يبان حلو)',
        explanation: 'محفوف. تقسيطات أكتر = مرونة أقل وضغط أكتر.',
      },
      'cheaper-model': {
        label: 'اشتري موديل أرخص بأشهر أقل',
        explanation: 'حل وسط كويس. التزام أقل = أمان أكتر.',
      },
    },
  },
  'stock-panic': {
    title: 'ذعر السوق',
    description: 'السوق ينهار فجأة.',
    situation:
      'سهم اشتريته نزل ١٢٪ في يوم واحد بعد أخبار مخيفة. هتعمل إيه؟',
    options: {
      'panic-sell': {
        label: 'بيع كل حاجة فوراً',
        explanation: 'البيع بالذعر يثبّت الخسارة. الأفضل خطة وحدود مخاطرة.',
      },
      'review-plan': {
        label: 'راجع الأساسيات + حط خطة وقف خسارة',
        explanation: 'ممتاز. قرارات على معلومات مش على عاطفة.',
      },
      'average-down': {
        label: 'اشتري أكتر فوراً للمتوسط',
        explanation: 'أحياناً مقبول، بس خطر بدون تحليل وضبط مخاطرة.',
      },
    },
  },
  'gold-or-cash': {
    title: 'ذهب ولا كاش؟',
    description: 'اختار إزاي تحافظ على القيمة.',
    situation:
      'عندك ٢٠٬٠٠٠ جنيه مدخرات. التضخم بيزيد. إزاي تحمي فلوسك؟',
    options: {
      mix: {
        label: 'قسّم: كاش + ذهب + استثمارات صغيرة',
        explanation: 'الأفضل. التنويع يحميك من نتيجة وحدة سيئة.',
      },
      'all-cash': {
        label: 'خلّي كل حاجة كاش',
        explanation: 'الكاش يفقد قيمة مع التضخم. احتفظ ببعضه، مش كله.',
      },
      'all-gold': {
        label: 'حط كل حاجة في الذهب',
        explanation: 'الذهب يتحوط ضد التضخم، بس كل الأصول في أصل واحد خطر.',
      },
    },
  },
};

export function localizeChallenge(
  seed: ChallengeScenario,
  locale: Locale
): ChallengeScenario {
  if (locale !== 'ar') return seed;
  const tr = AR[seed.id];
  if (!tr) return seed;
  return {
    ...seed,
    title: tr.title,
    description: tr.description,
    situation: tr.situation,
    options: seed.options.map((o) => localizeOption(o, tr.options[o.id])),
  };
}

function localizeOption(
  o: ChallengeOption,
  tr?: { label: string; explanation: string }
): ChallengeOption {
  if (!tr) return o;
  return { ...o, label: tr.label, explanation: tr.explanation };
}

export function localizeChallenges(
  seeds: ChallengeScenario[],
  locale: Locale
): ChallengeScenario[] {
  return seeds.map((c) => localizeChallenge(c, locale));
}
