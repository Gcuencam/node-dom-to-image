/** Error name used when a capture is cancelled through an `AbortSignal`. */
export const ABORT_ERROR = 'AbortError'

/**
 * Throws an `AbortError` `DOMException` if the signal has been aborted. Called
 * between the async stages of a capture so a cancelled render stops promptly
 * instead of finishing wasted work.
 */
export const throwIfAborted = (signal?: AbortSignal): void => {
  if (signal?.aborted) {
    throw new DOMException('The capture was aborted.', ABORT_ERROR)
  }
}
