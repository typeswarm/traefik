import { ComposeSpecification, DefinitionsService } from '@typeswarm/cli';
import { publishToTraefik } from '../publishToTraefik';

const conf = {
    dbHost: 'db',
    dbUser: 'exampleuser',
    dbPass: 'wyv9whew79etvg89JOI023gfbF',
    dbName: 'exampledb',
    domain: 'wp.example.com',
};

let wordpress: DefinitionsService = {
    image: 'wordpress',
    environment: {
        WORDPRESS_DB_HOST: conf.dbHost,
        WORDPRESS_DB_USER: conf.dbUser,
        WORDPRESS_DB_PASSWORD: conf.dbPass,
        WORDPRESS_DB_NAME: conf.dbName,
    },
    volumes: ['wordpress:/var/www/html'],
};

wordpress = publishToTraefik({
    host: conf.domain,
    port: 80,
    serviceName: 'wordpress',
    externalHttps: true,
    externalNetwork: 'shared_proxy',
})(wordpress);

const db: DefinitionsService = {
    image: 'mysql:5.7',
    restart: 'always',
    environment: {
        MYSQL_DATABASE: conf.dbName,
        MYSQL_USER: conf.dbUser,
        MYSQL_PASSWORD: conf.dbPass,
        MYSQL_RANDOM_ROOT_PASSWORD: '1',
    },
    volumes: ['db:/var/lib/mysql'],
};

const spec: ComposeSpecification = {
    version: '3.7',
    services: {
        wordpress,
        db,
    },
};

export { spec };
