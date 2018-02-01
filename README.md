# virtualbeams-angular-asteroid-v2

The Virtual Beams Asteroid library for Angular.

* [Installation](#installation)
* [Usage](#usage)
* [API](#api)


## Installation

First you need to install the npm module:

```sh
npm install virtualbeams-angular-asteroid-v2 --save
```

---

## Usage

#### 1. Import the `VbaAsteroidModule`:

Finally, you can use virtualbeams-angular-asteroid-v2 in your Angular project. You have to import `VbaAsteroidModule.forRoot()` in the root NgModule of your application.

The [`forRoot`](https://angular.io/docs/ts/latest/guide/ngmodule.html#!#core-for-root) static method is a convention that provides and configures services at the same time.
Make sure you only call this method in the root module of your application, most of the time called `AppModule`.
This method allows you to configure the `VbaAsteroidModule` by specifying a host and other config.

```ts
import { NgModule } from '@angular/core';
import { VbaAsteroidModule } from 'virtualbeams-angular-asteroid-v2';

const config: VbaConfigConst = {
  host: 'host.url',
  log: true,
  logError: true,
  ssl: false,
};

@NgModule({
    imports: [
        VbaAsteroidModule.forRoot(config)
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
```

#### 2. Init the `VbaService` for your application:

```ts
import { Component } from '@angular/core';
import { VbaService } from 'virtualbeams-angular-asteroid-v2';

@Component()
export class AppComponent {

    constructor(private vbaService: VbaService) {
        // init the vbaAsteroid and get instance
        vbaService.get();
    }
}
```

#### 3. Call methods:

Once you've imported the `VbaAsteroidModule` and  `VbaService`, you can put call methods of the ddp backend.

```ts
import { Injectable } from '@angular/core';
import { VbaService } from 'virtualbeams-angular-asteroid-v2';

@Injectable()
export class AppCustomService {

    constructor(private vbaService: VbaService) {
    }

    public exampleCall(objectParams: any): Promise<any> {
      return this.vbaService.call('nameOfMethod', objectParams);
    }

    public exampleCallMultiParams(...args): Promise<any> {
      return this.vbaService.call('nameOfMethod', ..args);
    } 
}
```

#### 4. Use Subscriptions:

You can subscribe a publish.

This is a exaple service 
```ts
import { Injectable } from '@angular/core';
import { VbaService } from 'virtualbeams-angular-asteroid-v2';

@Injectable()
export class CustomService {

    constructor(private vbaService: VbaService) {
    }

    public getChats(): EventEmitter<Array<any>> {
      return this.vbaService.subscribe({
        nameSubscribe: 'chats',
        nameCollection: 'chats'
      });
    }
}
```

This is example component

```ts
import { Component } from '@angular/core';
import { CustomService } from '../providers/customService';

@Component()
export class CustomComponent {

    public chats: Array<any>;
    private chatsEventEmitter: EventEmitter<Array<any>>;

    constructor(private customService: CustomService) {
      this.getChats();
    }

    private getChats(): void {
      this.chatsEventEmitter = this.customService.getChats();
      this.chatsEventEmitter.subscribe(chats => {
        this.chats = chats;
      });
    }
}
```


## API

### TODO
