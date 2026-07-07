/**
 * Engine-agnostic handle so the Zustand store (which can't call useRouter) can
 * navigate the app. Mirrors `mapRegistry`: whichever NavBridge mounts registers
 * its `router.push`. The assistant's action matcher uses this for "take me to
 * Proposals / MPLADS / …" commands.
 */
export const navRegistry: { go: ((path: string) => void) | null } = {
  go: null,
};

export function navigateTo(path: string) {
  navRegistry.go?.(path);
}
