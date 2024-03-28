import type { SDC_SDK } from "./sdk.d.ts";

/**
 * Evaluates the given callback function with the provided arguments and returns a promise that resolves to the result of the evaluation.
 *
 * @param {function} callback - The callback function to evaluate.
 * @param {...any} args - The arguments to pass to the callback function.
 * @return {Promise<any>} A promise that resolves to the result of the evaluation.
 */
export const evaluate = async <ARGS extends any[], RET extends any>(
  callback: (sdk: SDC_SDK, ...args: ARGS) => RET,
  ...args: ARGS
): Promise<Awaited<RET>> => {
  const uid = Math.random().toString(36).substr(2);
  const do_send = () => {
    window.parent.postMessage(
      {
        type: "sdc-sdk.evaluate",
        body: callback.toString(),
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
};
