import { Redirect } from 'expo-router';

// This screen only exists to handle the OAuth redirect URL (serenade://google-auth).
// The actual token exchange happens in lib/auth.ts before this screen renders.
export default function GoogleAuthRedirect() {
  return <Redirect href="/" />;
}
