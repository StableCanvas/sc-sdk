import type { SDC_SDK } from "./types/sdk.js";

class EnvInvoker {
  static instance = new EnvInvoker();

  invoke<RET = any>(path: string[], ...args: any[]) {
    const code = `(__env__,...args)=>__env__.${path.join(".")}(...args)`;
    const uid = Math.random().toString(36).substr(2);
    const do_send = () => {
      window.parent.postMessage(
        {
          type: "sdc-sdk.evaluate",
          body: code,
          args,
          uid,
        },
        "*"
      );
    };
    return new Promise<Awaited<RET>>((resolve, reject) => {
      const handler = (ev: MessageEvent) => {
        const { data } = ev;
        if (!data || data.type !== "sdc-sdk.evaluate_return") return;
        if (data.uid !== uid) return;

        if (data.error) {
          reject(data.error);
        } else {
          resolve(data.result);
        }
        window.removeEventListener("message", handler);
      };
      window.addEventListener("message", handler);

      do_send();
    });
  }
}

const createProxyFn = (path: string[]): any => {
  return new Proxy(
    (...args: any[]) => {
      // invoke
      return EnvInvoker.instance.invoke(path, ...args);
    },
    {
      get: (target, prop) => {
        if (typeof prop === "string") {
          return createProxyFn([...path, prop]);
        }
        return EnvInvoker.instance.invoke(path);
      },
    }
  );
};

export const env = new Proxy(
  {},
  {
    get: (target, prop) => {
      return createProxyFn([String(prop)]);
    },
  }
  // FIXME: types
) as Record<keyof SDC_SDK, any>;
