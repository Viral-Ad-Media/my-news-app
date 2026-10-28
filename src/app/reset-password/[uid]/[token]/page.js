import ResetPassword from '../../../../components/ResetPassword';
export const metadata = { title: 'Reset password | AbokiNews', robots: { index: false, follow: false }, referrer: 'no-referrer' };
export default async function Page({ params }) { const { uid, token } = await params; return <ResetPassword uid={uid} token={token} />; }
