export default class Entity {
  constructor(payload = {}) {
    this.componentsByType = {}
    this.dirty = false;
    this.id = payload.id;
    this.key = payload.key;
    this.type = payload.type;
    this.destroy = false;
  }

  getComponent(componentType) {
    return this.componentsByType[componentType];
  }

  hasChanged() {
    return this.dirty;
  }

  markChanged(isDirty) {
    this.dirty = isDirty;
  }

  setId(newId) {
    this.id = newId;
  }

  getId() {
    return this.id;
  }

  getKey() {
    return this.key;
  }

  getType() {
    return this.type;
  }

  setType(type) {
    this.type = type;
  }

  listComponents() {
    return Object.keys(this.componentsByType);
  }

  hasComponent(componentType) {
    return this.componentsByType[componentType];
  }

  addComponent(component) {
    this.componentsByType[component.getComponentType()] = component;
    this.markChanged(true);
  }

  removeComponent(componentName) {
    this.componentsByType[componentName] = undefined;
    delete this.componentsByType[componentName]
    this.markChanged(true);
  }

  removeAllComponents() {
    this.componentsByType = {};
    this.markChanged(true);
  }

  markDestroy() {
    this.destroy = true;
  }
}