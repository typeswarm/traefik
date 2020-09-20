import {
    ComposeSpecification,
    mergeComposeConfigurations,
} from '@typeswarm/cli';
import { Traefik } from '../Traefik';

const spec = mergeComposeConfigurations(
    {
        version: '3.7',
    },
    Traefik({
        debug: true,
        https: true,
        letsencryptEmail: 'example@example.com',
    })
);

export { spec };
