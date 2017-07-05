export class VbaConfig {

  public _logPrefix: string = 'vba->';
  public _host: string = '';
  public _log: boolean = false;
  public _logError: boolean = false;
  public _loginRequiredInCalls: boolean = false;
  public _loginRequiredInSubscribes: boolean = false;
  public _ssl: boolean = false;
  public _extraData: boolean = false;
  public _stopSubscriptionsOnLogout: boolean = false;
  public _loginMethod: string = 'login';
  public _resumeMethod: string = 'login';
  public _logoutMethod: string = 'logout';
  public _runData = [];

  constructor() {
  }

  public logPrefix(prefix: string) {
    this._logPrefix = prefix;
  }

  public host(host: string) {
    this._host = host;
  }

  public log(log: boolean) {
    this._log = log;
  }

  public logError(logError: boolean) {
    this._logError = logError;
  }

  public loginRequiredInCalls(loginRequiredInCalls: boolean) {
    this._loginRequiredInCalls = loginRequiredInCalls;
  }

  public loginRequiredInSubscribes(loginRequiredInSubscribes: boolean) {
    this._loginRequiredInSubscribes = loginRequiredInSubscribes;
  }

  public ssl(ssl: boolean) {
    this._ssl = ssl;
  }

  public extraData(extraData: boolean) {
    this._extraData = extraData;
  }

  public stopSubscriptionsOnLogout(stopSubscriptionsOnLogout: boolean) {
    this._stopSubscriptionsOnLogout = stopSubscriptionsOnLogout;
  }

  public loginMethod(loginMethod: string) {
    this._loginMethod = loginMethod;
  }

  public resumeMethod(resumeMethod: string) {
    this._resumeMethod = resumeMethod;
  }

  public logoutMethod(logoutMethod: string) {
    this._logoutMethod = logoutMethod;
  }

  public runData(runData: Array<any>) {
    this._runData = runData;
  }

  $get() {
    return this;
  }

}
