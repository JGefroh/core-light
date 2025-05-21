export default class Tag {
  constructor() {
    this.id;
    this.entity;
    this.tagType;
  }
  getId() {
    return this.entity.id;
  }

  setId(id) { 
    this.entity.id = id;
  }

  static isAssignableTo(entity) {
  }

  setEntity(entity) {
    this.entity = entity;
  }

  getEntity() {
    return this.entity;
  }

  isInactive(){ 
    return !this.entity?.id;
  }

  static getTagType() {
    return this.tagType;
  }
}
