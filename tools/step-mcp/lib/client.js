/**
 * STEP REST API v2 client.
 * Uses native fetch (Node 22+). Auth: Basic (username + password).
 */

const HOSTS = {
  dev: 'stitchfix-dev.mdm.stibosystems.com',
  preprod: 'stitchfix-preprod.mdm.stibosystems.com',
};

const DEFAULT_USERNAME = 'br_test_user';

export class StepClient {
  constructor(env) {
    this.env = env || process.env.STEP_ENV || 'preprod';
    const host = HOSTS[this.env];
    if (!host) {
      throw new Error(`Unknown STEP env "${this.env}". Valid: ${Object.keys(HOSTS).join(', ')}`);
    }
    this.baseUrl = `https://${host}/restapiv2`;
    this.host = host;

    const username = process.env.STEP_USERNAME || DEFAULT_USERNAME;
    const password = process.env.STEP_PASSWORD || '';
    if (!password) {
      throw new Error(
        'STEP_PASSWORD is not set. Export it in your shell or add to .env.\n' +
        'The MCP server uses Basic auth with the same credentials as step-deploy.'
      );
    }
    this.authHeader = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
  }

  async _fetch(path, params) {
    const url = new URL(path, this.baseUrl);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v != null) url.searchParams.set(k, v);
      }
    }

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: this.authHeader,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`STEP API ${res.status} ${res.statusText} — ${url.pathname}: ${body.slice(0, 400)}`);
    }

    return res.json();
  }

  async getNode(nodeId) {
    return this._fetch(`/restapiv2/nodes/${encodeURIComponent(nodeId)}`, {
      'include-attributes': 'true',
      'include-references': 'true',
    });
  }

  async searchNodes(query, objectTypeId, maxResults) {
    return this._fetch('/restapiv2/nodes', {
      query,
      'object-type-id': objectTypeId,
      'max-results': maxResults || '25',
    });
  }

  async getWorkflowInstances(nodeId) {
    return this._fetch(`/restapiv2/nodes/${encodeURIComponent(nodeId)}/workflow-instances`);
  }

  async getAttributeDefinition(attrId) {
    return this._fetch(`/restapiv2/attribute-definitions/${encodeURIComponent(attrId)}`);
  }

  async healthCheck() {
    const start = Date.now();
    try {
      const data = await this._fetch('/restapiv2/system/info');
      return {
        status: 'ok',
        env: this.env,
        host: this.host,
        responseTimeMs: Date.now() - start,
        info: data,
      };
    } catch (err) {
      return {
        status: 'error',
        env: this.env,
        host: this.host,
        responseTimeMs: Date.now() - start,
        error: err.message,
      };
    }
  }
}
