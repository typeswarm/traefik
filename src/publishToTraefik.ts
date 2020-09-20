import { DefinitionsService } from '@typeswarm/cli';
import { parseService, StrictService } from '@typeswarm/cli/lib/normalize';
import immer from 'immer';
import { CERT_RESOLVER } from './constants';

export interface PublishToTraefikOptions {
    serviceName: string;
    host: string;
    port: number;
    externalNetwork?: string;
    externalHttps?: boolean;
    internalHttps?: boolean;
}

export const publishToTraefik = ({
    host,
    port,
    serviceName,
    externalHttps = true,
    externalNetwork,
    internalHttps = false,
}: PublishToTraefikOptions) => (service: StrictService): StrictService => {
    return immer(parseService(service), (service: StrictService) => {
        if (!service.deploy) {
            service.deploy = {};
        }
        if (!service.deploy.labels) {
            service.deploy.labels = {};
        }

        service.deploy.labels = {
            ...service.deploy.labels,
            'traefik.enable': 'true',
            [`traefik.http.services.${serviceName}.loadbalancer.server.port`]: port,
            [`traefik.http.services.${serviceName}.loadbalancer.server.scheme`]: internalHttps
                ? 'https'
                : 'http',
            [`traefik.http.routers.${serviceName}.rule`]: `Host(\`${host}\`)`,
            [`traefik.http.routers.${serviceName}.entrypoints`]: externalHttps
                ? 'websecure'
                : 'web',
            [`traefik.http.routers.${serviceName}.tls.certresolver`]: CERT_RESOLVER,
        };
        if (externalNetwork) {
            service.deploy.labels['traefik.docker.network'] = externalNetwork;
        }

        if (!service.networks) {
            service.networks = {};
        }

        if (externalNetwork) {
            service.networks[externalNetwork] =
                service.networks[externalNetwork] ?? null;
        }
    });
};
