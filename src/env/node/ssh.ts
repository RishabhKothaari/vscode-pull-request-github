import { readFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import Logger from '../../common/logger';
import { baseResolver, chainResolvers, Config, ConfigResolver, resolverFromConfig } from '../browser/ssh';

const SSH_URL_RE = /^(?:([^@:]+)@)?([^:/]+):?(.+)$/;
const URL_SCHEME_RE = /^([a-z-]+):\/\//;

/**
 * Parse and resolve an SSH url. Resolves host aliases using the configuration
 * specified by ~/.ssh/config, if present.
 *
 * Examples:
 *
 *    resolve("git@github.com:Microsoft/vscode")
 *      {
 *        Host: 'github.com',
 *        HostName: 'github.com',
 *        User: 'git',
 *        path: 'Microsoft/vscode',
 *      }
 *
 *    resolve("hub:queerviolet/vscode", resolverFromConfig("Host hub\n  HostName github.com\n  User git\n"))
 *      {
 *        Host: 'hub',
 *        HostName: 'github.com',
 *        User: 'git',
 *        path: 'queerviolet/vscode',
 *      }
 *
 * @param {string} url the url to parse
 * @param {ConfigResolver?} resolveConfig ssh config resolver (default: from ~/.ssh/config)
 * @returns {Config}
 */
export const resolve = (url: string, resolveConfig = Resolvers.current) => {
	const config = parse(url);
	return config && resolveConfig(config);
};

export class Resolvers {
	static default = chainResolvers(baseResolver, resolverFromConfigFile());

	static fromConfig(conf: string) {
		return chainResolvers(baseResolver, resolverFromConfig(conf));
	}

	static current = Resolvers.default;
}

const parse = (url: string): Config | undefined => {
	const urlMatch = URL_SCHEME_RE.exec(url);
	if (urlMatch) {
		const [fullSchemePrefix, scheme] = urlMatch;
		if (scheme === 'ssh') {
			url = url.slice(fullSchemePrefix.length);
		} else {
			return;
		}
	}
	const match = SSH_URL_RE.exec(url);
	if (!match) {
		return;
	}
	const [, User, Host, path] = match;
	return { User, Host, path };
};

function resolverFromConfigFile(configPath = join(homedir(), '.ssh', 'config')): ConfigResolver | undefined {
	try {
		const config = readFileSync(configPath).toString();
		return resolverFromConfig(config);
	} catch (error) {
		Logger.appendLine(`${configPath}: ${error.message}`);
	}
}
