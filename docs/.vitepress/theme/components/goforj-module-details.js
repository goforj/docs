import * as THREE from 'three'

// buildModuleDetail makes each building block recognizable through a small physical mechanism.
export function buildModuleDetail(id, parent, kit) {
  const { box, mesh, tube, steel, graphite, copperBright, inlay, pigment, engraveSymbol } = kit
  const disc = (radius, height, material, position) => mesh(new THREE.CylinderGeometry(radius, radius, height, 40), material, parent, position)
  const trace = points => tube(points, .009, inlay, parent)
  switch (id) {
    case 'database':
      for (const y of [.237, .292, .347]) {
        disc(.265, .043, steel, [0, y, -.02])
        disc(.265, .008, inlay, [0, y - .025, -.02])
      }
      break
    case 'cache':
      for (const z of [-.15, .15]) {
        box(.81, .21, .035, pigment, [0, .325, z], parent, .009)
        for (const x of [-.26, 0, .26]) {
          box(.19, .14, .045, graphite, [x, .342, z + .025], parent, .009)
          box(.17, .012, .045, inlay, [x, .410, z + .025], parent, .004)
        }
        for (const x of [-.30, -.15, 0, .15, .30]) box(.060, .035, .040, copperBright, [x, .235, z], parent, .003)
      }
      break
    case 'storage':
      disc(.265, .037, steel, [0, .238, -.025])
      disc(.065, .045, inlay, [0, .260, -.025])
      disc(.025, .048, copperBright, [0, .274, -.025])
      tube([[.31, .270, .20], [.16, .285, -.10], [.015, .285, -.12]], .018, inlay, parent)
      disc(.045, .037, steel, [.31, .252, .20])
      break
    case 'events': {
      const nodes = [[-.25, .238, .17], [0, .238, -.23], [.25, .238, .17]]
      for (const node of nodes) {
        trace([[0, .225, .055], [node[0], .225, node[2]]])
        disc(.060, .038, steel, node)
        disc(.036, .007, pigment, [node[0], node[1] + .024, node[2]])
      }
      disc(.082, .048, inlay, [0, .239, .055])
      break
    }
    case 'queue':
      for (let i = 0; i < 3; i++) {
        const z = (i - 1) * .19
        box(.58, .031, .12, steel, [0, .235, z], parent, .007)
        box(.51, .007, .014, pigment, [0, .253, z + .045], parent, .003)
      }
      break
    case 'mail':
      box(.65, .034, .43, steel, [0, .240, -.025], parent, .015)
      trace([[-.29, .260, -.20], [0, .261, .055], [.29, .260, -.20]])
      trace([[-.29, .260, .16], [-.11, .260, -.02]])
      trace([[.29, .260, .16], [.11, .260, -.02]])
      break
    case 'frontend': {
      box(.34, .022, .29, steel, [0, .220, -.015], parent, .008)
      box(.045, .20, .045, steel, [0, .324, -.08], parent, .006)
      box(.85, .47, .055, steel, [0, .479, -.08], parent, .022)
      box(.77, .39, .012, graphite, [0, .484, -.042], parent, .012)
      box(.68, .012, .007, inlay, [0, .619, -.030], parent, .003)
      for (const x of [-.31, -.265, -.22]) disc(.010, .008, pigment, [x, .652, -.025]).rotation.x = Math.PI / 2
      box(.115, .24, .008, inlay, [-.26, .457, -.027], parent, .007)
      box(.43, .055, .008, pigment, [.06, .546, -.027], parent, .006)
      for (const x of [-.06, .18]) box(.19, .15, .008, inlay, [x, .429, -.027], parent, .006)
      break
    }
    case 'atlas': {
      box(.72, .028, .57, graphite, [0, .225, -.025], parent, .012)
      box(.62, .13, .08, graphite, [0, .286, -.235], parent, .008)
      const panel = new THREE.Group()
      panel.position.set(0, .309, -.025)
      panel.rotation.x = .25
      parent.add(panel)
      box(.77, .038, .64, steel, [0, 0, 0], panel, .015)
      box(.69, .008, .56, pigment, [0, .022, 0], panel, .012)
      for (const x of [-.27, -.135, 0, .135, .27]) for (const z of [-.325, .325]) box(.043, .016, .065, copperBright, [x, -.005, z], panel, .004)
      engraveSymbol('brain-circuit', panel, -.181, .55)
      break
    }
    case 'libraries':
      for (let i = 0; i < 3; i++) {
        const x = (i - 1) * .235, height = [.35, .43, .38][i], y = .211 + height / 2
        box(.155, height - .027, .35, steel, [x, y, -.025], parent, .008)
        for (const edge of [-.093, .093]) box(.018, height, .40, pigment, [x + edge, y, -.025], parent, .005)
        box(.20, height, .032, pigment, [x, y, .185], parent, .007)
        for (const position of [.28, .76]) box(.13, .012, .008, copperBright, [x, .211 + height * position, .205], parent, .003)
      }
      break
  }
}
