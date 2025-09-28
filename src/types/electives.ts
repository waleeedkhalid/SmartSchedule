export interface PlanCourse {
    id: string; // unique per section within plan (courseCode + index)
    code: string; // e.g. "103 PHY"
    hours: number;
    title?: string; // optional Arabic title
    notes?: string; // any extra meta (exam icons etc.)
    locked?: boolean; // when true cannot be dragged (future)
    prerequisites?: string[]; // متطلبات سابقة (يجب أن تكون في مستوى أسبق)
    corequisites?: string[]; // متطلبات متزامنة (يمكن أن تكون في نفس أو مستوى أسبق)
}

export interface ElectivePackage {
    id: string;
    label: string; // label
    rangeLabel: string; // e.g. (0-6)
    minHours: number;
    maxHours: number;
    courses: PlanCourse[];
  }
  
  export const electivePackages: ElectivePackage[] = [
    {
      id: "Islamic",
      label: "متطلبات إسلامية",
      rangeLabel: "(0-4)",
      minHours: 0,
      maxHours: 4,
      courses: [
        {
          id: "سلم-100",
          code: "سلم 100",
          hours: 2,
          title: "سلم 100",
        },
        {
          id: "سلم-101",
          code: "سلم 101",
          hours: 2,
          title: "سلم 101",
        },
        {
          id: "سلم-102",
          code: "سلم 102",
          hours: 2,
          title: "سلم 102",
        },
        {
          id: "سلم-103",
          code: "سلم 103",
          hours: 2,
          title: "سلم 103",
        },
        {
          id: "سلم-104",
          code: "سلم 104",
          hours: 2,
          title: "سلم 104",
        },
        {
          id: "سلم-105",
          code: "سلم 105",
          hours: 2,
          title: "سلم 105",
        },
      ],
    },
    {
      id: "mathStats",
      label: "متطلبات رياضية واحصائية",
      rangeLabel: "(0-6)",
      minHours: 0,
      maxHours: 6,
      courses: [
        {
          id: "122-بحث",
          code: "122 بحث",
          hours: 3,
          title: "مقدمة في بحوث العمليات",
        },
        {
          id: "203-ريض",
          code: "203 ريض",
          hours: 3,
          title: "حساب التفاضل والتكامل",
        },
        {
          id: "254-ريض",
          code: "254 ريض",
          hours: 3,
          title: "المعادلات العددية",
          prerequisites: ["244 ريض"],
        },
      ],
    },
    {
      id: "generalScience",
      label: "متطلبات علمية عامة في العلوم",
      rangeLabel: "(0-3)",
      minHours: 0,
      maxHours: 3,
      courses: [
        { id: "101-كيمج", code: "101 كيمج", hours: 4, title: "كيمياء عامة" },
        {
          id: "140-حثق",
          code: "140 حتق",
          hours: 3,
          title: "علم الأرض/الجيولوجيا",
        },
        { id: "145-حين", code: "145 حين", hours: 3, title: "علم الأحياء" },
        { id: "201-جاف", code: "201 جاف", hours: 3, title: "أسس الجيوفيزياء" },
        { id: "201-فيز", code: "201 فيز", hours: 3, title: "فيزياء رياضية (2)" },
      ],
    },
    {
      id: "departmentElectives",
      label: "متطلبات القسم",
      rangeLabel: "(0-9)",
      minHours: 0,
      maxHours: 9,
      courses: [
        {
          id: "215-عال",
          code: "215 عال",
          hours: 3,
          title: "الهندسة الإنشائية بلغة C",
        },
        {
          id: "311-عال",
          code: "311 عال",
          hours: 3,
          title: "تصميم وتحليل الخوارزميات",
          prerequisites: ["212 عال"],
        },
        {
          id: "316-عال",
          code: "316 عال",
          hours: 3,
          title: "عمارة الحاسبات وبناء التجمع",
          prerequisites: ["212 عال"],
        },
        {
          id: "318-هال",
          code: "318 هال",
          hours: 4,
          title: "نظم التشغيل",
          prerequisites: ["212 عال"],
        },
        {
          id: "361-عال",
          code: "361 عال",
          hours: 3,
          title: "الذكاء الاصطناعي",
          prerequisites: ["212 عال"],
        },
        {
          id: "385-عال",
          code: "385 عال",
          hours: 3,
          title: "نظم تخطيط موارد المؤسسات",
        },
        {
          id: "445-هاب",
          code: "445 هاب",
          hours: 3,
          title: "موثوقية وأمن البرمجيات",
          prerequisites: ["381 هاب"],
        },
        {
          id: "476-عال",
          code: "476 عال",
          hours: 3,
          title: "الرسومات واستخدام الحاسب",
        },
        {
          id: "478-عال",
          code: "478 عال",
          hours: 3,
          title: "لغات البرمجة الصورية",
          prerequisites: ["311 عال"],
        },
        {
          id: "481-هاب",
          code: "481 هاب",
          hours: 3,
          title: "هندسة تطبيقات الشبكة العنكبوتية المطورة",
        },
        {
          id: "483-هاب",
          code: "483 هاب",
          hours: 3,
          title: "تطوير تطبيقات الجوال",
          prerequisites: ["381 هاب"],
        },
        {
          id: "484-هاب",
          code: "484 هاب",
          hours: 3,
          title: "هندسة الوسائط المتعددة",
        },
        {
          id: "485-هاب",
          code: "485 هاب",
          hours: 3,
          title: "موضوعات خاصة في الحوسبة",
        },
        {
          id: "486-هاب",
          code: "486 هاب",
          hours: 3,
          title: "الحوسبة السحابية",
        },
        {
          id: "488-هاب",
          code: "488 هاب",
          hours: 3,
          title: "موضوعات أمن المعلومات",
          prerequisites: ["381 هاب"],
        },
      ],
    },
  ];
  
  export interface ElectiveStatus {
    id: string;
    selectedHours: number;
    minHours: number;
    maxHours: number;
    satisfied: boolean;
    over: boolean;
  }
  
  export function computeElectiveStatus(
    allSelectedCodes: string[]
  ): ElectiveStatus[] {
    return electivePackages.map((p) => {
      const selectedHours = p.courses
        .filter((c) => allSelectedCodes.includes(c.code))
        .reduce((a, c) => a + c.hours, 0);
      return {
        id: p.id,
        selectedHours,
        minHours: p.minHours,
        maxHours: p.maxHours,
        satisfied: selectedHours >= p.minHours && selectedHours <= p.maxHours,
        over: selectedHours > p.maxHours,
      };
    });
  }
  