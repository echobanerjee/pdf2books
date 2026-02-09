export class AppError extends Error {
  constructor(public errorCode: string, message: string, public status = 400) {
    super(message);
  }
}
