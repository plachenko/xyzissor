import * as THREE from 'three';

export class LineBetween {
  constructor(p1, p2, color = 0x00ff00) {
    // Create geometry with 2 points
    this.geometry = new THREE.BufferGeometry().setFromPoints([p1, p2]);

    // Create material
    this.material = new THREE.LineBasicMaterial({ color });

    // Create line
    this.line = new THREE.Line(this.geometry, this.material);
  }

  // Get the THREE.Line object
  get object() {
    return this.line;
  }

  // Update endpoints dynamically
  update(p1, p2) {
    this.geometry.setFromPoints([p1, p2]);
    this.geometry.attributes.position.needsUpdate = true;
  }

  // Dispose cleanup
  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}

