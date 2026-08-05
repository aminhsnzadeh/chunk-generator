import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { VegetationInstance, VegType } from '../../worldgen/chunk/vegetation.ts';

// shared geometries/materials, created once for all chunks
const trunkGeo = new THREE.CylinderGeometry(0.12, 0.2, 1, 5);
trunkGeo.translate(0, 0.5, 0); // pivot at base so it grows upward
const broadleafGeo = new THREE.IcosahedronGeometry(1, 0);
const coniferGeo = new THREE.ConeGeometry(1, 2, 6);
const bushGeo = new THREE.IcosahedronGeometry(1, 0);
const cactusGeo = new THREE.CylinderGeometry(0.22, 0.26, 1, 6);
cactusGeo.translate(0, 0.5, 0);

const trunkMat = new THREE.MeshStandardMaterial({ color: '#6b4a2f', roughness: 1 });
const broadleafMat = new THREE.MeshStandardMaterial({ color: '#3f7d33', roughness: 1 });
const coniferMat = new THREE.MeshStandardMaterial({ color: '#2d5a3d', roughness: 1 });
const bushMat = new THREE.MeshStandardMaterial({ color: '#557d3a', roughness: 1 });
const cactusMat = new THREE.MeshStandardMaterial({ color: '#4d7c4f', roughness: 1 });

interface PartDef {
    key: string;
    geo: THREE.BufferGeometry;
    mat: THREE.Material;
    y: number;                    // offset in units of instance scale
    scale: [number, number, number];
}

// how each vegetation type is assembled from primitive parts
const PARTS: Record<VegType, PartDef[]> = {
    broadleaf: [
        { key: 'trunk', geo: trunkGeo, mat: trunkMat, y: 0, scale: [1, 2.2, 1] },
        { key: 'broadleaf', geo: broadleafGeo, mat: broadleafMat, y: 2.7, scale: [1.5, 1.4, 1.5] },
    ],
    conifer: [
        { key: 'trunk', geo: trunkGeo, mat: trunkMat, y: 0, scale: [0.8, 1.4, 0.8] },
        { key: 'conifer', geo: coniferGeo, mat: coniferMat, y: 2.4, scale: [1.2, 1.7, 1.2] },
    ],
    bush: [
        { key: 'bush', geo: bushGeo, mat: bushMat, y: 0.35, scale: [1, 0.7, 1] },
    ],
    cactus: [
        { key: 'cactus', geo: cactusGeo, mat: cactusMat, y: 0, scale: [1, 2.4, 1] },
    ],
};

const dummy = new THREE.Object3D();

function buildInstancedMeshes(instances: VegetationInstance[]): THREE.InstancedMesh[] {
    const buckets = new Map<string, { geo: THREE.BufferGeometry; mat: THREE.Material; matrices: THREE.Matrix4[] }>();

    for (const inst of instances) {
        for (const part of PARTS[inst.type]) {
            let bucket = buckets.get(part.key);
            if (!bucket) {
                bucket = { geo: part.geo, mat: part.mat, matrices: [] };
                buckets.set(part.key, bucket);
            }

            dummy.position.set(inst.x, inst.y + part.y * inst.scale, inst.z);
            dummy.rotation.set(0, inst.rotation, 0);
            dummy.scale.set(
                part.scale[0] * inst.scale,
                part.scale[1] * inst.scale,
                part.scale[2] * inst.scale
            );
            dummy.updateMatrix();
            bucket.matrices.push(dummy.matrix.clone());
        }
    }

    return Array.from(buckets.values()).map(({ geo, mat, matrices }) => {
        const mesh = new THREE.InstancedMesh(geo, mat, matrices.length);
        matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
        mesh.instanceMatrix.needsUpdate = true;
        mesh.castShadow = true;
        mesh.frustumCulled = false; // instance bounds aren't tracked by the base geometry
        return mesh;
    });
}

export default function Vegetation({ instances }: { instances: VegetationInstance[] }) {
    const meshes = useMemo(() => buildInstancedMeshes(instances), [instances]);

    // free instance buffers when the chunk unloads (shared geos/materials are untouched)
    useEffect(() => () => meshes.forEach((m) => m.dispose()), [meshes]);

    return (
        <group>
            {meshes.map((mesh, i) => (
                <primitive key={i} object={mesh} />
            ))}
        </group>
    );
}
