const TEAM = [
  { name: 'Ibrahim Alhalaki', studentId: 'TODO-STUDENT-ID', role: 'Frontend & architecture', placeholder: true },
  { name: 'Muhammad Abanmi', studentId: '222110412', role: 'Frontend' },
  { name: 'Team member 3', studentId: 'TODO-STUDENT-ID', role: 'To be confirmed', placeholder: true },
];

const initials = (name) =>
  name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

export function AboutPage() {
  return (
    <>
      <div className="page-header">
        <div>
          <h1>About</h1>
          <p>SE411 Software Construction · Fall 2026/2027 · Section 1383</p>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Team</h2>
        <div className="team-grid">
          {TEAM.map((member) => (
            <div className="team-card" key={member.name}>
              <div className="team-avatar" aria-hidden="true">{initials(member.name)}</div>
              <h3>{member.name}</h3>
              <div className="team-id">{member.studentId}</div>
              <p className="asset-name">{member.role}</p>
              {member.placeholder && (
                <p className="placeholder-note">Placeholder — replace before submission</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">The project</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 12 }}>
          AssetVault manages a portfolio of financial assets — equities, bonds, funds, crypto and
          cash. Part 1 is a React frontend only: the portfolio lives as an in-memory collection of
          objects, with no database behind it. Part 2 adds the backend.
        </p>
        <ul className="spec-list">
          <li>Add, update, delete, search and display assets</li>
          <li>Dashboard with portfolio totals and allocation by category</li>
          <li>Client-side validation with per-field error messages</li>
          <li>React 19, React Router, Vite, Vitest and React Testing Library</li>
        </ul>
      </div>
    </>
  );
}
