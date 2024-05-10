# sc-sdk
StableCanvas sdk

# usage

```ts
import { evaluate } from "@stable-canvas/sdk";

const all_lcm_presets = await evaluate(async (sdk, key) => {
  /** parent.window code zone */
  const presets_ext = await sdk.extensions.presets().instance();
  const all_presets = await presets_ext.list_presets();
  return all_presets.filter(p => p.name.includes(key));
}, '-lcm')
console.log (all_lcm_presets);

```

# about `sdk.d.ts`
bundle on StableCanvas-Studio project.

# License
MIT