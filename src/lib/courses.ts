export type CourseModule = {
  week: string;
  title: string;
  lessons: string[];
};

export type Course = {
  slug: string;
  title: string;
  category: string;
  price: number;
  image: string;
  summary: string;
  outcomes: string[];
  modules: CourseModule[];
};

export const coursePrice = 200000;

export const courses: Course[] = [
  {
    slug: "excel-course",
    title: "Excel Course",
    category: "Learning",
    price: coursePrice,
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
    summary: "A practical one-month Excel course for office work, business tracking, reports, and everyday data confidence.",
    outcomes: ["Build clean worksheets", "Use formulas and functions", "Create charts and reports", "Prepare business-ready dashboards"],
    modules: [
      {
        week: "Week 1",
        title: "Excel foundations",
        lessons: ["Workbook setup", "Tables and formatting", "Data entry shortcuts", "Cleaning common spreadsheet mistakes"],
      },
      {
        week: "Week 2",
        title: "Formulas and analysis",
        lessons: ["SUM, AVERAGE, COUNT, IF", "VLOOKUP/XLOOKUP basics", "Sorting and filtering", "Working with dates and percentages"],
      },
      {
        week: "Week 3",
        title: "Reports and dashboards",
        lessons: ["Charts", "Pivot tables", "Dashboard layout", "Monthly sales and expense reports"],
      },
      {
        week: "Week 4",
        title: "Real business project",
        lessons: ["Build a complete tracker", "Prepare a printable report", "Review and correct errors", "Final presentation and feedback"],
      },
    ],
  },
  {
    slug: "digital-marketing-course",
    title: "Digital Marketing Course",
    category: "Learning",
    price: coursePrice,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    summary: "A one-month digital marketing course for social media, content, ads, WhatsApp selling, and customer growth.",
    outcomes: ["Plan content calendars", "Create better social posts", "Understand paid ads", "Use WhatsApp and analytics for selling"],
    modules: [
      {
        week: "Week 1",
        title: "Marketing foundations",
        lessons: ["Customer targeting", "Brand message", "Offer creation", "Content goals"],
      },
      {
        week: "Week 2",
        title: "Social media content",
        lessons: ["Instagram and Facebook basics", "Post formats", "Copywriting", "Content calendar planning"],
      },
      {
        week: "Week 3",
        title: "Ads and conversion",
        lessons: ["Ad campaign structure", "Budgeting", "Landing pages", "WhatsApp sales flow"],
      },
      {
        week: "Week 4",
        title: "Analytics and campaign project",
        lessons: ["Tracking performance", "Improving weak posts", "Reporting results", "Final campaign plan"],
      },
    ],
  },
  {
    slug: "full-stack-development-course",
    title: "Full Stack Development Course",
    category: "Learning",
    price: coursePrice,
    image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
    summary: "A one-month introduction to full stack development: frontend, backend, databases, and deploying a real web app.",
    outcomes: ["Build responsive pages", "Understand React/Next.js basics", "Create APIs", "Connect a database and deploy"],
    modules: [
      {
        week: "Week 1",
        title: "Frontend foundations",
        lessons: ["HTML and CSS structure", "Responsive layouts", "JavaScript basics", "Building reusable sections"],
      },
      {
        week: "Week 2",
        title: "React and app structure",
        lessons: ["Components", "Props and state", "Forms", "Routing and page structure"],
      },
      {
        week: "Week 3",
        title: "Backend and database",
        lessons: ["API routes", "CRUD logic", "MongoDB/Postgres concepts", "Authentication basics"],
      },
      {
        week: "Week 4",
        title: "Final full stack project",
        lessons: ["Build a small app", "Connect frontend to backend", "Deploy online", "Portfolio review"],
      },
    ],
  },
  {
    slug: "ai-course",
    title: "AI Course",
    category: "Learning",
    price: coursePrice,
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
    summary: "A practical one-month AI course for using modern AI tools to work faster, create content, analyze information, and automate daily tasks.",
    outcomes: ["Write stronger AI prompts", "Use AI for business and content", "Build simple automations", "Work safely with AI tools"],
    modules: [
      {
        week: "Week 1",
        title: "AI foundations",
        lessons: ["What AI can and cannot do", "Prompt writing basics", "Choosing the right AI tool", "Safe and responsible AI use"],
      },
      {
        week: "Week 2",
        title: "AI for productivity",
        lessons: ["Research and summaries", "Email and document drafting", "Spreadsheet and data help", "Personal workflow templates"],
      },
      {
        week: "Week 3",
        title: "AI for business and marketing",
        lessons: ["Content ideas and captions", "Customer support replies", "Product descriptions", "Simple brand and campaign planning"],
      },
      {
        week: "Week 4",
        title: "Automation project",
        lessons: ["Build reusable prompt systems", "Connect AI into daily tasks", "Create a business use-case workflow", "Final project review"],
      },
    ],
  },
];

export function getCourse(slug: string) {
  return courses.find((course) => course.slug === slug);
}
