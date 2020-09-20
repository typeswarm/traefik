import {
    StrictPortMapping,
    StrictSpecification,
} from '@typeswarm/cli/lib/normalize';
import { CERT_RESOLVER } from './constants';

export interface TraefikOptions {
    debug?: boolean;
    serviceName?: string;
    image?: string;
    tag?: string;
    https?: boolean;
    letsencryptEmail?: string;
    exposeDashboard?: boolean;
    externalNetwork?: string;
    letsencryptVolume?: string;
}

export const Traefik = ({
    debug = false,
    serviceName = 'traefik',
    image = 'traefik',
    tag = 'v2.2',
    https = true,
    letsencryptEmail,
    exposeDashboard = false,
    externalNetwork,
    letsencryptVolume = 'traefik_letsencrypt_data',
}: TraefikOptions): StrictSpecification => {
    const command = [
        '--api.insecure=true',
        '--providers.docker=true',
        '--providers.docker.swarmMode=true',
        '--providers.docker.watch=true',
        '--providers.docker.exposedbydefault=false',
        '--entrypoints.web.address=:80',
    ];

    if (debug) {
        command.push('--log.level=DEBUG');
    }
    if (https) {
        command.push(
            '--entrypoints.websecure.address=:443',
            `--certificatesresolvers.${CERT_RESOLVER}.acme.httpchallenge=true`,
            `--certificatesresolvers.${CERT_RESOLVER}.acme.httpchallenge.entrypoint=web`,
            `--certificatesresolvers.${CERT_RESOLVER}.acme.caserver=https://acme-v02.api.letsencrypt.org/directory`,
            `--certificatesresolvers.${CERT_RESOLVER}.acme.storage=/letsencrypt/acme.json`
        );
        if (letsencryptEmail) {
            command.push(
                `--certificatesresolvers.${CERT_RESOLVER}.acme.email=${letsencryptEmail}`
            );
        } else {
            throw new Error('letsencryptEmail is required when https is true');
        }
    }

    const ports: StrictPortMapping[] = [{ published: 80, target: 80 }];
    if (https) {
        ports.push({ published: 443, target: 443 });
    }
    if (exposeDashboard) {
        ports.push({ published: 8080, target: 8080 });
    }

    const spec: StrictSpecification = {
        services: {
            [serviceName]: {
                image: `${image}:${tag}`,
                command,
                ports,
                volumes: [
                    {
                        type: 'volume',
                        source: letsencryptVolume,
                        target: '/letsencrypt',
                    },
                ],
                deploy: {
                    placement: {
                        constraints: ['node.role == manager'],
                    },
                },
                networks: externalNetwork ? { externalNetwork: null } : {},
            },
        },
        networks: externalNetwork
            ? {
                  [externalNetwork]: {
                      external: true,
                  },
              }
            : {},
        volumes: {
            [letsencryptVolume]: null,
        },
    };

    return spec;
};
