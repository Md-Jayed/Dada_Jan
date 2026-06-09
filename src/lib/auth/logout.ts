import { supabase } from '../../supabaseClient';

/**
 * Robust, reusable logout utility.
 * Handles complete clearing of:
 * - Supabase session via signOut()
 * - LocalStorage auth keys
 * - SessionStorage keys
 * - Standard auth cookies
 * - Custom Zustand/React Query caches if applicable
 */
export async function performSystemLogout(): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Call Supabase SignOut
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.warn("Supabase auth.signOut() returned warning or error:", error.message);
      // We still proceed to enforce client-side cookie/storage cleanup
    }
  } catch (err: any) {
    console.error("Critical error during Supabase signOut:", err);
    // Continue cleanup even if network fails to guarantee client side isolation
  }

  try {
    // 2. Clear known LocalStorage authentication items
    const authKeys = [
      'currentCustomer',
      'currentPartner',
      'isAdminLoggedIn',
      'supabase.auth.token'
    ];
    authKeys.forEach(k => localStorage.removeItem(k));

    // Wildcard sweep for any supabase/auth/token related local storage items
    const keysToToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('supabase') || 
        key.includes('auth') || 
        key.includes('token') || 
        key.includes('user') || 
        key.includes('session')
      )) {
        keysToToRemove.push(key);
      }
    }
    keysToToRemove.forEach(k => localStorage.removeItem(k));

    // 3. Clear SessionStorage completely
    sessionStorage.clear();

    // 4. Exterminate Cookies
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
        // Clear cookie for major path / domain bounds
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname};`;
      }
    }

    // 5. Clear dynamic memory caches
    if (typeof window !== 'undefined') {
      // Clear Zustand global stores if attached
      if ((window as any).__ZUSTAND_STORE__) {
        try {
          (window as any).__ZUSTAND_STORE__.getState().reset();
        } catch (e) {}
      }
      
      // Clear React Query cache if attached
      if ((window as any).__reactQueryClient) {
        try {
          (window as any).__reactQueryClient.clear();
        } catch (e) {}
      }
    }

    return { success: true };
  } catch (cleanupDevError: any) {
    console.error("Cleanup process error:", cleanupDevError);
    return { success: false, error: cleanupDevError.message || "Logout cleanup failed" };
  }
}
