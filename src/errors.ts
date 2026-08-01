export class SorolensError extends Error {
  readonly code: string;
  readonly requestId: string;

  constructor(code: string, message: string, requestId: string) {
    super(message);
    this.name = "SorolensError";
    this.code = code;
    this.requestId = requestId;
    Object.setPrototypeOf(this, SorolensError.prototype);
  }

  static async fromResponse(response: Response): Promise<SorolensError> {
    const requestId =
      response.headers.get("x-request-id") ??
      response.headers.get("request-id") ??
      "";
    let code = `HTTP_${response.status}`;
    let message = response.statusText || `Request failed with status ${response.status}`;

    try {
      const body = (await response.json()) as {
        error?: { code?: string; message?: string; request_id?: string };
      };
      if (body.error) {
        code = body.error.code ?? code;
        message = body.error.message ?? message;
        const bodyRequestId = body.error.request_id;
        return new SorolensError(code, message, bodyRequestId ?? requestId);
      }
    } catch {
      // body was not JSON; use header-derived values
    }

    return new SorolensError(code, message, requestId);
  }
}
