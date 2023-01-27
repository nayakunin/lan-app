/* eslint-disable no-console */
import { promises as dns } from 'node:dns';
import os from 'node:os';

import type { Express } from 'express';
import colors from 'picocolors';

import { wildcardHosts } from '../constants/index.js';

/**
 * Returns resolved localhost address when `dns.lookup` result differs from DNS
 *
 * `dns.lookup` result is same when defaultResultOrder is `verbatim`.
 * Even if defaultResultOrder is `ipv4first`, `dns.lookup` result maybe same.
 * For example, when IPv6 is not supported on that machine/network.
 */
export async function getLocalhostAddressIfDiffersFromDNS(): Promise<string | undefined> {
  const [nodeResult, dnsResult] = await Promise.all([
    dns.lookup('localhost'),
    dns.lookup('localhost', { verbatim: true }),
  ]);
  const isSame = nodeResult.family === dnsResult.family && nodeResult.address === dnsResult.address;
  return isSame ? undefined : nodeResult.address;
}

export interface Hostname {
  /** undefined sets the default behaviour of server.listen */
  host: string | undefined;
  /** resolve to localhost when possible */
  name: string;
}

export async function resolveHostname(optionsHost?: string | boolean): Promise<Hostname> {
  let host: string | undefined;
  if (optionsHost === undefined || optionsHost === false) {
    // Use a secure default
    host = 'localhost';
  } else if (optionsHost === true) {
    // If passed --host in the CLI without arguments
    host = undefined; // undefined typically means 0.0.0.0 or :: (listen on all IPs)
  } else {
    host = optionsHost;
  }

  // Set host name to localhost when possible
  let name = host === undefined || wildcardHosts.has(host) ? 'localhost' : host;

  if (host === 'localhost') {
    // See #8647 for more details.
    const localhostAddr = await getLocalhostAddressIfDiffersFromDNS();
    if (localhostAddr) {
      name = localhostAddr;
    }
  }

  return { host, name };
}

export interface ResolvedServerUrls {
  local: string[];
  network: string[];
}

export const getNetworkInterfaces = async (
  optionsHost: string | boolean | undefined
): Promise<ResolvedServerUrls> => {
  const local: string[] = [];
  const network: string[] = [];
  const hostname = await resolveHostname(optionsHost);

  Object.values(os.networkInterfaces())
    .flatMap((nInterface) => nInterface ?? [])
    .filter(
      (detail) =>
        detail &&
        detail.address &&
        ((typeof detail.family === 'string' && detail.family === 'IPv4') ||
          // @ts-expect-error Node 18.0 - 18.3 returns number
          (typeof detail.family === 'number' && detail.family === 4))
    )
    .forEach((detail) => {
      let host = detail.address.replace('127.0.0.1', hostname.name);
      // ipv6 host
      if (host.includes(':')) {
        host = `[${host}]`;
      }
      if (detail.address.includes('127.0.0.1')) {
        local.push(host);
      } else {
        network.push(host);
      }
    });

  return { local, network };
};

type UrlOptions = {
  protocol?: string;
  host: string;
  port: number;
  base?: string;
};

export const createUrl = ({ protocol = 'http', host, port, base = '/' }: UrlOptions) => {
  return `${protocol}://${host}:${port}${base}`;
};

const colorUrl = (url: string) =>
  colors.cyan(url.replace(/:(\d+)\//, (_, port) => `:${colors.bold(port)}/`));

const log = (name: string, { protocol = 'http', host, port, base = '/' }: UrlOptions) => {
  console.info(
    `  ${colors.green('➜')} ${colors.bold(name)}:   ${colorUrl(
      createUrl({ protocol, host, port, base })
    )}`
  );
};

export const startServer = async (
  app: Express,
  port: number,
  host: string | undefined | boolean
) => {
  const { local, network } = await getNetworkInterfaces(host);
  const protocol = 'http';
  const base = '/';

  if (local.length > 0) {
    return app.listen(port, local[0], () => log('Local', { protocol, host: local[0], port, base }));
  }

  if (network.length > 0) {
    return app.listen(port, network[0], () => log('Network', { protocol, host: network[0], port, base }));
  }
};
