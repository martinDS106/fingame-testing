import type { Locale } from '@/lib/i18n';
import {
  BUSINESS_STEP_CONFIGS,
  type BusinessStepConfig,
  type BusinessStepOption,
} from '@/lib/businessSteps';
import type { BusinessStepId } from '@/stores';

type StepText = {
  question: string;
  options: Record<string, { label: string; description: string }>;
};

const AR_STEPS: Record<BusinessStepId, StepText> = {
  idea: {
    question: 'إيه نوع البيزنس اللي عايز تبدأه؟',
    options: {
      coffee: {
        label: 'كافيه قهوة متخصصة',
        description: 'تكلفة أولية أعلى، عملاء مخلصين',
      },
      ecommerce: {
        label: 'متجر أونلاين',
        description: 'مصاريف تشغيل قليلة، منافسة قوية',
      },
      services: {
        label: 'خدمات حرة (فريلانس)',
        description: 'تكلفة بسيطة، السمعة بتكبر ببطء',
      },
    },
  },
  market_research: {
    question: 'إزاي هتدرس السوق؟',
    options: {
      agency: {
        label: 'وكالة أبحاث سوق',
        description: 'بيانات احترافية، لكن غالية',
      },
      diy_surveys: {
        label: 'استبيانات بنفسك',
        description: 'رخيص، ياخد وقت أكتر',
      },
      gut_feeling: {
        label: 'تخطى البحث واعتمد على حدسك',
        description: 'يوفر فلوس، محفوف',
      },
    },
  },
  business_plan: {
    question: 'ابنِ خطة عملك:',
    options: {
      detailed: {
        label: 'خطة تفصيلية ٣ سنوات',
        description: 'مع استشارة',
      },
      lean: {
        label: 'خطة صفحة واحدة',
        description: 'سريعة ومرنة',
      },
    },
  },
  legal_setup: {
    question: 'الشكل القانوني؟',
    options: {
      llc: {
        label: 'تسجيل شركة ذات مسؤولية محدودة',
        description: 'يحمي أصولك الشخصية',
      },
      sole: {
        label: 'مؤسسة فردية',
        description: 'أرخص وأبسط',
      },
      skip: {
        label: 'تأجيل التسجيل دلوقتي',
        description: 'يوفر كاش، محفوف',
      },
    },
  },
  funding: {
    question: 'إزاي هتمول البيزنس؟',
    options: {
      bootstrap: {
        label: 'تمويل ذاتي من المدخرات',
        description: 'بدون ديون، مدى محدود',
      },
      loan: {
        label: 'قرض بنك (٢٠ ألف جنيه)',
        description: 'نمو أسرع، فوائد',
      },
      investor: {
        label: 'مستثمر ملائكي',
        description: 'رأس مال + إرشاد، تخسر حصة',
      },
    },
  },
  location: {
    question: 'اختار الموقع:',
    options: {
      premium: {
        label: 'موقع شارع مميز',
        description: 'زحام عالي، إيجار غالي',
      },
      suburb: {
        label: 'موقع ضاحية',
        description: 'توازن تكلفة وزوار',
      },
      online: {
        label: 'أونلاين فقط',
        description: 'بدون إيجار، بدون زيارات مباشرة',
      },
    },
  },
  hiring: {
    question: 'مين أول توظيف؟',
    options: {
      team: {
        label: 'فريق صغير (٣ أشخاص)',
        description: 'تنفيذ أسرع، رواتب أعلى',
      },
      one: {
        label: 'موظف أساسي واحد',
        description: 'بداية متوازنة',
      },
      solo: {
        label: 'اشتغل لوحدك دلوقتي',
        description: 'وفر كاش، نمو أبطأ',
      },
    },
  },
  marketing: {
    question: 'استراتيجية التسويق:',
    options: {
      campaign: {
        label: 'حملة إعلانات مدفوعة',
        description: 'وصول سريع، بتكلف',
      },
      social: {
        label: 'سوشيال ميديا عضوي',
        description: 'بطيء لكن مستدام',
      },
      influencer: {
        label: 'شراكة مؤثرين',
        description: 'قفزة كبيرة لو نجحت',
      },
    },
  },
  launch: {
    question: 'خطة الإطلاق:',
    options: {
      event: {
        label: 'حفل افتتاح كبير',
        description: 'غالي، لا يُنسى',
      },
      soft: {
        label: 'إطلاق هادئ',
        description: 'جمع ملاحظات بهدوء',
      },
    },
  },
  scale: {
    question: 'إزاي تكبر؟',
    options: {
      second_location: {
        label: 'فرع تاني',
        description: 'استثمار كبير، عائد كبير',
      },
      online_expand: {
        label: 'توسع تجارة إلكترونية',
        description: 'تكلفة أقل، جمهور جديد',
      },
      optimize: {
        label: 'تحسين العمليات',
        description: 'حسّن الهوامش الأول',
      },
    },
  },
};

export const BUSINESS_STEP_META_AR: Record<
  BusinessStepId,
  { title: string; description: string }
> = {
  idea: { title: 'فكرة البيزنس', description: 'اختار تخصص وتحقق منه' },
  market_research: {
    title: 'دراسة السوق',
    description: 'افهم العملاء والمنافسين',
  },
  business_plan: {
    title: 'خطة العمل',
    description: 'نموذج إيرادات وتكاليف ومعالم',
  },
  legal_setup: {
    title: 'الإعداد القانوني',
    description: 'سجّل الشركة والتراخيص',
  },
  funding: { title: 'التمويل', description: 'ذاتي، قرض، أو رأس مال' },
  location: { title: 'الموقع', description: 'مكان فعلي أو أونلاين' },
  hiring: { title: 'التوظيف', description: 'كوّن أول فريق' },
  marketing: { title: 'التسويق', description: 'ابنِ العلامة وجيب أول عملاء' },
  launch: { title: 'الإطلاق', description: 'افتح واستقبل أول طلبات' },
  scale: { title: 'التوسع', description: 'كبّر الإيراد وحسّن العمليات' },
};

function localizeOption(
  o: BusinessStepOption,
  tr?: { label: string; description: string }
): BusinessStepOption {
  if (!tr) return o;
  return { ...o, label: tr.label, description: tr.description };
}

export function localizeBusinessStepConfig(
  config: BusinessStepConfig,
  locale: Locale
): BusinessStepConfig {
  if (locale !== 'ar') return config;
  const tr = AR_STEPS[config.id];
  if (!tr) return config;
  return {
    ...config,
    question: tr.question,
    options: config.options.map((o) =>
      localizeOption(o, tr.options[o.id])
    ),
  };
}

export function getLocalizedBusinessStepConfig(
  stepId: BusinessStepId,
  locale: Locale
): BusinessStepConfig {
  return localizeBusinessStepConfig(BUSINESS_STEP_CONFIGS[stepId], locale);
}

export function localizeStepTitle(
  stepId: BusinessStepId,
  enTitle: string,
  locale: Locale
): string {
  if (locale !== 'ar') return enTitle;
  return BUSINESS_STEP_META_AR[stepId]?.title ?? enTitle;
}

export function localizeStepDescription(
  stepId: BusinessStepId,
  enDesc: string,
  locale: Locale
): string {
  if (locale !== 'ar') return enDesc;
  return BUSINESS_STEP_META_AR[stepId]?.description ?? enDesc;
}
