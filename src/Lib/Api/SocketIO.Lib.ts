export class SocketIOLib {
  static GetSpocketHost(): string {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
      return "http://85.214.47.99:26080/";
    }
    return "/";
  }
}
