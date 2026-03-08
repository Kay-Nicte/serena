import * as WebBrowser from 'expo-web-browser';

// Signal to openAuthSessionAsync that the redirect was received.
// This MUST be called at module level so it runs when the route loads.
WebBrowser.maybeCompleteAuthSession();

// This screen only exists to handle the OAuth redirect URL (serenade://google-auth).
// Token extraction is handled by:
// 1. openAuthSessionAsync in signInWithGoogle (captures redirect URL with tokens)
// 2. extractSessionFromUrl in _layout.tsx (deep link handler backup)
// This component just needs to call maybeCompleteAuthSession above.
export default function GoogleAuthRedirect() {
  return null;
}
