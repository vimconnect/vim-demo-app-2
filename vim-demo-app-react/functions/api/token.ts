import { parseJwt } from "@cfworker/jwt";
import { Env } from "../context-env";

/**
 * The JWKS is not served from the issuer's host, so `parseJwt` cannot discover
 * it from `iss`. It is fetched here and handed over explicitly. Staging serves
 * its own keys, so set `VIM_JWKS_URL` when pointing at the staging backend.
 */
const VIM_JWKS_URL = "https://api.getvim.ai/app-auth/.well-known/jwks.json";

async function getToken(context, code: string, client_secret: string) {
  return fetch(
    context.env.VIM_TOKEN_ENDPOINT ?? "https://api.getvim.ai/app-auth/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: context.env.CLIENT_ID,
        code,
        client_secret,
        grant_type: "authorization_code",
      }),
    }
  );
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { code } = await context.request.json<{ code: string }>();
    let vimResponse = await getToken(context, code, context.env.CLIENT_SECRET);
    if (
      vimResponse.status >= 400 &&
      vimResponse.status < 500 &&
      context.env.CLIENT_SECRET_FALLBACK
    ) {
      vimResponse = await getToken(
        context,
        code,
        context.env.CLIENT_SECRET_FALLBACK
      );
    }
    const tokenData = await vimResponse.json();
    if (
      !(await isAuthorized(
        tokenData,
        context.env.CLIENT_ID,
        context.env.VIM_ISSUER,
        context.env.VIM_JWKS_URL
      ))
    ) {
      return new Response("", {
        status: 403,
        statusText: "Forbidden: You do not have access to this resource.",
      });
    }
    return Response.json(tokenData);
  } catch (error) {
    console.log("Error verifying token", { context });
    throw error;
  }
};

async function isAuthorized(
  vimTokenData,
  clientId: string,
  vimIssuer = "https://connect.getvim.ai",
  jwksUrl = VIM_JWKS_URL
) {
  try {
    const decodedIdToken = await parseJwt({
      jwt: vimTokenData.id_token,
      issuer: vimIssuer,
      audience: clientId,
      resolveKey: async ({ header }) => {
        const jwks = await fetch(jwksUrl).then(
          (response) => response.json() as Promise<{ keys: JsonWebKey[] }>
        );
        const jwk = jwks.keys.find(
          (candidate) => (candidate as { kid?: string }).kid === header.kid
        );
        if (!jwk) throw new Error(`No JWKS key for kid ${header.kid}`);
        return crypto.subtle.importKey(
          "jwk",
          jwk,
          { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
          false,
          ["verify"]
        );
      },
    });
    if (decodedIdToken.valid) {
      // If identification data on token is not sufficient userinfo endpoint can be used...
      return await isUserEligibleToMyApp({
        email: decodedIdToken.payload["email"],
        vimUserId: decodedIdToken.payload["sub"],
      });
    } else if (decodedIdToken.valid === false) {
      console.error(
        `Failed to parse jwt ${decodedIdToken.reason} [${decodedIdToken.reasonCode}]`,
        {
          vimTokenData,
          vimIssuer,
          clientId,
        }
      );
      return false;
    }
  } catch (error) {
    console.error("Error verifying token", error);
    return false;
  }
}

async function isUserEligibleToMyApp({ email, vimUserId }) {
  console.info(`User ${email}, ${vimUserId} is eligible to my app.`);
  return true;
}
