interface FinanceLink {
  label: string;
  url: string;
}

interface FinanceItem {
  title: string;
  links: FinanceLink[];
}

const ITEMS: FinanceItem[] = [
  {
    title: '청년안심주택 금융지원',
    links: [{ label: '바로가기', url: 'https://soco.seoul.go.kr/youth/main/contents.do?menuNo=400021' }],
  },
  {
    title: '청년전용 보증부월세대출',
    links: [{ label: '바로가기', url: 'https://nhuf.molit.go.kr/FP/FP05/FP0502/FP05020701.jsp' }],
  },
  {
    title: '주택전세자금 대출',
    links: [
      { label: '청년전용 버팀목전세자금', url: 'https://nhuf.molit.go.kr/FP/FP05/FP0502/FP05020301.jsp' },
      { label: '신혼부부전용 전세자금', url: 'https://nhuf.molit.go.kr/FP/FP05/FP0502/FP05020401.jsp' },
    ],
  },
];

function ExternalIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M14 4h6v6" />
      <path d="M20 4 11 13" />
      <path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
    </svg>
  );
}

export default function FinancePanel() {
  return (
    <div className="h-full overflow-y-auto p-3">
      <h2 className="mb-2 px-1 text-sm font-semibold text-gray-800">금융 지원</h2>
      <ul className="flex flex-col gap-2">
        {ITEMS.map((item) => (
          <li key={item.title} className="rounded-lg border border-gray-100 p-3">
            <div className="text-sm font-medium text-gray-800">{item.title}</div>
            <div className="mt-2 flex flex-col gap-1.5">
              {item.links.map((l) => (
                <a
                  key={l.url}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
                >
                  <ExternalIcon />
                  {l.label}
                </a>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
