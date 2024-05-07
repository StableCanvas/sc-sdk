/**
 * Invoke a function with the given type and arguments.
 *
 * @param {string} type - The type of function to invoke.
 * @param {...any[]} args - The arguments to pass to the function.
 * @return {Promise<any>} A promise that resolves with the result of the function.
 */
export const invoke = (type: string, ...args: any[]) => {
  return new Promise((resolve, reject) => {
    const uid = Math.random().toString(36).substr(2);
    const handler = (ev: MessageEvent) => {
      const { data } = ev;
      if (!data || data.type !== `sdc-sdk.${type}_return` || data.uid !== uid)
        return;
      window.removeEventListener("message", handler);
      if (data.error) {
        reject(data.error);
      } else {
        resolve(data.result);
      }
    };
    window.addEventListener("message", handler);
    window.parent.postMessage({ type: `sdc-sdk.${type}`, args, uid }, "*");
  });
};
