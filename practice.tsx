type Claim = {
  id: string;
  provider: string;
  service: string;
  date: string;
  amount: number;
  status: "approved" | "pending" | "denied";
};

const claims: Claim[] = [
  {
    id: "c1",
    provider: "Swedish Medical Center",
    service: "Office Visit",
    date: "2026-07-14",
    amount: 240.0,
    status: "approved",
  },
  {
    id: "c2",
    provider: "Northwest Radiology",
    service: "MRI Scan",
    date: "2026-06-02",
    amount: 1850.5,
    status: "pending",
  },
  {
    id: "c3",
    provider: "Swedish Medical Center",
    service: "Lab Work",
    date: "2026-08-01",
    amount: 95.25,
    status: "denied",
  },
  {
    id: "c4",
    provider: "Kirkland Family Care",
    service: "Annual Physical",
    date: "2026-05-20",
    amount: 0.0,
    status: "approved",
  },
  {
    id: "c5",
    provider: "Northwest Radiology",
    service: "X-Ray",
    date: "2026-07-28",
    amount: 320.75,
    status: "approved",
  },
  {
    id: "c6",
    provider: "Evergreen Health",
    service: "Urgent Care",
    date: "2026-08-11",
    amount: 475.0,
    status: "pending",
  },
];

export function App({ claims }: { claims: Claim[] }) {
  return (
    <div>
      <h1>Claims</h1>
      <ul>
        {claims.map((claim) => {
          const { id, provider, service } = claim;
          return (
            <li key={id}>
              {provider} {service}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
