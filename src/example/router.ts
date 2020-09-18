import {
    ComposeSpecification,
    mergeComposeConfigurations,
} from '@typeswarm/cli';
import { Traefik } from '../Traefik';

let spec: ComposeSpecification = {
    version: '3.7',
};

spec = mergeComposeConfigurations(
    spec,
    Traefik({
        debug: true,
        https: true,
        letsencryptEmail: 'example@example.com',
    })
);

export { spec };
