class Core {
  constructor() {
    this.clear();
    window.jgefrohCore = this;
  }

  addEntity(entity) {
    if (!entity || this.isTracked(entity)) {
      return;
    }

    if (!entity.getId()) {
      entity.setId(this.generateId());
    }

    this.entities.push(entity)
    this.entitiesById[entity.getId()] = entity;
    this.entitiesByKey[entity.getKey()] = entity;
    this.updateTags(entity);
    this.send("DEBUG_DATA", {type: 'entity_added', entity: entity})
  }

  isTracked(entity) {
    return entity && entity.getId() && this.entitiesById[entity.getId()];
  }

  generateId() {
    return ++this.lastAssignedId;
  }

  getEntityWithId(id) {
    return this.entitiesById[id]
  }

  getEntityWithKey(key) {
    return this.entitiesByKey[key]
  }

  updateTags(entity) {
    if (!entity) {
      return;
    }
 
    for (const tag of Object.values(this.knownTags)) {
      if (tag.isAssignableTo(entity)) {
        this.assignTag(entity, tag);
      } else {
        this.unassignTag(entity, tag);
      }
    }
  }

  assignTag(entity, tag) {
    let entities = this.entitiesByTag[tag.getTagType()] ||= new Set();
    entities.add(entity);
  }

  unassignTag(entity, tag) {
    let entities = this.entitiesByTag[tag.getTagType()] ||= new Set();
    entities.delete(entity);
  }

  markRemoveEntity(entityId) {
    if (this.entitiesById[entityId]) {
      this.entitiesById[entityId].destroy = true;
    }
  }

  removeEntity(entity) {
    if (!entity) {
      return;
    }

    if (typeof entity === 'number' || typeof entity == 'string') {
      entity = this.entitiesById[entity]
    }
    if (!entity) {
      return;
    }

    entity.removeAllComponents();
    this.updateTags(entity);
    delete this.entitiesById[entity.getId()]
    delete this.entitiesByKey[entity.getKey()]
    const i = this.entities.indexOf(entity);
    if (i !== -1) this.entities.splice(i, 1);
    this.syncChanged(entity);
    entity.setId(null)
  }

  addSystem(system) {
    this.systems.push(system);
    system.lastRanTimestamp = Date.now();
    system.initialize();
  }

  removeSystem(system) {
    this.systems.splice(this.systems.indexOf(system), 1);
  }

  work() {
    this.tick++
    this.t1 = performance.now();
    let slowestSystem = {system: 'Unknown', time: 0}
    this.updateTimer();
    this.syncChanged();
    for (let i = 0; i < this.systems.length; i++) {
      let t3 = performance.now()
      let systemLastRanTimestamp = this.systems[i].lastRanTimestamp
      let systemDesiredWaitTime = this.systems[i].wait
      if (!systemLastRanTimestamp || !systemDesiredWaitTime || (Date.now() - systemLastRanTimestamp > systemDesiredWaitTime)) {
        let skippedRun = this.systems[i].work();
        if (!skippedRun) {
          this.systems[i].postWork();
        }
        let t4 = performance.now()
        if (t4 - t3 > slowestSystem.time) {
          slowestSystem = {system: this.systems[i], time: t4-t3}
        }
      }
    }
    this.t2 = performance.now();
    this.send("DEBUG_DATA", {type: 'timing', workTime: this.t2 - this.t1, slowestSystem: slowestSystem.system.constructor.name, slowestSystemTime: slowestSystem.time, lastAssignedId: this.lastAssignedId})
    
    this.entities.forEach((entity) => {
      if (entity.destroy) {
        this.removeEntity(entity)
      }
    });
  }

  syncChanged(entity = null) {
    if (entity && entity.hasChanged()) {
      this.updateTags(entity);
      entity.markChanged(false);
      return;
    }
    else {
      for (let index = 0; index < this.entities.length; index++) {
        let entity = this.entities[index];
        if (entity && entity.hasChanged()) {
          this.updateTags(entity);
          entity.markChanged(false);
        }
      }
    }
  }

  getTag(tagType) {
    let tag = this.knownTags[tagType]
    if (tag) {
      return new tag();
    }
    else {
      console.warn(`Acces attempted for ${tagType}, not yet registered`)
      return null;
    }
  }

  now() {
    return this.timer / 1000000;
  }

  updateTimer() {
    this.now = performance.now();
    if (!this.isPaused) {
      this.timePassed =  this.now - this.timeLastChecked;
      this.timer += this.timePassed;
    }
    this.timeLastChecked = this.now;
  }

  start() {
    this.workInterval = window.setInterval(() => {
      this.work();
    }, 1000 / this.desiredFPS);
  }

  stop() {
    clearInterval(this.workInterval);
  }

  getTaggedAs(tag) {
    return Array.from(this.entitiesByTag[tag] || []);
  }

  getKeyedAs(key) {
    return this.entitiesByKey[key];
  }

  addTag(tag) {
    if (tag && !this.knownTags[tag.getTagType()]) {
      this.knownTags[tag.getTagType()] = tag;
    }
  }

  send(messageType, payload) {
    let handlersForMessage = this.handlersByMessageType[messageType];
    if (handlersForMessage) {
      for (let index = 0; index < handlersForMessage.length; index++) {
        try {
          handlersForMessage[index](payload);
        }
        catch(error) {
          console.error(`Core.send | Error sending ${messageType} to ${handlersForMessage[index]} - ${error} ${error.stack}.`)
        }
      }
    }
  }

  publishData(dataKey, payload) {
    this.publishedData[dataKey] = payload;
  }

  getData(dataKey) {
    return this.publishedData[dataKey];
  }

  addHandler(messageType, handler) {
    let handlersForMessage = this.handlersByMessageType[messageType];
    if (!handlersForMessage) {
      this.handlersByMessageType[messageType] = [];
      handlersForMessage = this.handlersByMessageType[messageType];
    }
    if (handlersForMessage.indexOf(handler) === -1) {
      handlersForMessage.push(handler);
    }
  }

  getTick() {
    return this.tick;
  }

  clear() {
    this.timer = 0;
    this.timeLastChecked = null;
    this.workInterval = null;
    this.isPaused = false;
    this.desiredFPS = 60;
    this.tick = 0;

    this.systems = [];
    this.entities = [];
    this.entitiesById = {};
    this.entitiesByTag = {};
    this.entitiesByKey = {};
    this.lastAssignedId = 0;
    this.knownTags = {};
    this.handlersByMessageType = {};
    this.publishedData = {}
  }
}

export default new Core()