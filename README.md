# @typeswarm/traefik

Traefik package for TypeSwarm

## Installation

In your TypeSwarm project:

```
npm i @typeswarm/traefik
```

## Usage

The package has two parts: `Traefik` package and `publishToTraefik` service plugin.


### Traefik

`Traefik` creates an instance of Traefik router on manager node with pre-configured Letsencrypt provider.


```ts
import {
    ComposeSpecification,
    mergeComposeConfigurations,
} from '@typeswarm/cli';
import { Traefik } from '@typeswarm/traefik';

//This is your stack
let spec: ComposeSpecification = {
    version: '3.7',
    services: {
       //...
    },
    volumes: {
       //...
    },
    //...etc
};

//This is how you add Traefik instance
spec = mergeComposeConfigurations(
    spec,
    Traefik({
        debug: true,
        https: true,
        letsencryptEmail: 'example@example.com',
    })
);

export { spec };

```


### publishToTraefik

`publishToTraefik` publishes a service through http(s) using labels.

```ts
import {
    ComposeSpecification,
    DefinitionsService,
} from '@typeswarm/cli';

import { publishToTraefik } from '@typeswarm/traefik';


//This is a service, which you want to publish to world
let wordpress: DefinitionsService = {
    image: 'wordpress:latest',
    environment: {
        WORDPRESS_DB_HOST: conf.dbHost,
        WORDPRESS_DB_USER: conf.dbUser,
        WORDPRESS_DB_PASSWORD: conf.dbPass,
        WORDPRESS_DB_NAME: conf.dbName,
    },
    volumes: ['wordpress:/var/www/html'],
};

//This is how you show it to Traefik router
wordpress = publishToTraefik({
    host: conf.domain,
    port: 80,
    serviceName: 'wordpress',
    externalHttps: true,
    externalNetwork: 'shared_proxy',
})(wordpress);
```
