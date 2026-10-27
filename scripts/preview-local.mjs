// A loopback-only preview with delivery keys removed, for local UI review.
const port = Number(process.env.PORT || 4180);
for (const key of Object.keys(process.env)) if (key.startsWith('SENDGRID_')) delete process.env[key];
// Suppress app.ts's automatic listener. This does not invoke a test runner.
process.env.NODE_ENV = 'test';
process.env.PUBLIC_ORIGIN = `http://127.0.0.1:${port}`;
const { app } = await import('../server/app.ts');
app.listen(port, '127.0.0.1', () => console.log(`Local UI review: http://127.0.0.1:${port}/en/ (mock mail delivery)`));
