import { EventEmitter } from '@angular/core';

export interface ISuscriptionObservable {
  config: IConfigSuscribe;
  suscription: any;
  event: EventEmitter<any>;
}

export interface IConfigSuscribe {
  nameSubscribe: string;
  nameCollection: string;
  id?: string;
  params?: any;
  scope?: object;
  extraData?: any;
  loginRequired?: boolean;
  selector?: any;
  filter?: () => any;
  reverse?: boolean;
  notifyEvents?:boolean;
}

export interface IConfigLogin {
  usernameOrEmail:string;
  password:string;
}
