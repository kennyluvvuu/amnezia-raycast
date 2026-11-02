/** Prefers the stderr text of a failed child process over Node's generic message. */
export function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    const stderr = (error as { stderr?: string }).stderr?.trim();
    return stderr || error.message;
  }

  return String(error);
}
