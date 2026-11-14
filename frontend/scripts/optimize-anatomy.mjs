import { NodeIO } from '@gltf-transform/core'
import { KHRONOS_EXTENSIONS } from '@gltf-transform/extensions'
import { dedup, meshopt, prune, simplify, weld } from '@gltf-transform/functions'
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer'

const [input, output] = process.argv.slice(2)

if (!input || !output) {
  throw new Error('Usage: node scripts/optimize-anatomy.mjs <input.glb> <output.glb>')
}

await MeshoptEncoder.ready

const io = new NodeIO()
  .registerExtensions(KHRONOS_EXTENSIONS)
  .registerDependencies({ 'meshopt.encoder': MeshoptEncoder })
const document = await io.read(input)

// The dashboard supplies its own holographic materials. Removing source maps
// avoids downloading and allocating thirteen unused 2048px PNG textures.
for (const material of document.getRoot().listMaterials()) {
  material
    .setBaseColorTexture(null)
    .setMetallicRoughnessTexture(null)
    .setNormalTexture(null)
    .setOcclusionTexture(null)
    .setEmissiveTexture(null)
}

await document.transform(
  weld(),
  simplify({ simplifier: MeshoptSimplifier, ratio: 0.8, error: 0.001 }),
  dedup(),
  prune(),
  meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
)

await io.write(output, document)
