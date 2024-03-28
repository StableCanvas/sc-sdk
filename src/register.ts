/**
 * Registers a callback function to handle specific types of messages.
 *
 * @param {string} type - the type of message to handle
 * @param {(...args: any[]) => any} callback - the callback function to execute
 * @return {() => void} a function to unregister the callback
 */
export const register = (type: string, callback: (...args: any[]) => any) => {
  const handler = async (ev: MessageEvent) => {
    const { data, source } = ev;
    if (!data || data.type !== `sdc-sdk.${type}`) return;
    const { args, uid } = data;
    let result: any;
    let error: any;
    try {
      result = await callback(...args);
      source!.postMessage({
        type: `sdc-sdk.${type}_return`,
        result,
        uid,
      });
    } catch (e) {
      error = e;
      source!.postMessage({
        type: `sdc-sdk.${type}_return`,
        error,
        uid,
      });
    }
  };
  window.addEventListener("message", handler);
  return () => {
    window.removeEventListener("message", handler);
  };
};
