export default function NotFound() {
  return (
    <main style={{maxWidth: 720, margin: '4rem auto', padding: '1rem', textAlign: 'center'}}>
      <h1 style={{fontSize: 28, marginBottom: 8}}>Page not found</h1>
      <p style={{opacity: 0.8, marginBottom: 16}}>
        The page you’re looking for doesn’t exist. Try going back to the dashboard.
      </p>
      <a href="/" style={{textDecoration: 'underline'}}>Go to dashboard</a>
    </main>
  );
}
