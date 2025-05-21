import { default as System } from '@core/system';

export default class AudioSystem extends System {
    constructor() {
      super()

      this.exclusiveGroups = {}
      this.audioState = {
      }
      this.audioCache = {}

      this.addHandler('PLAY_AUDIO', (payload) => {
        const {
          audioKey,
          exclusive,
          exclusiveGroup,
          loop,
          volume = 1,
          startAt = 0,
          endAt,
          listenerXPosition, // Optional
          listenerYPosition, // Optional
          sourceXPosition, // Optional
          sourceYPosition, // Optional
          decibels // Optional
        } = payload;
      
        const group = exclusiveGroup || (exclusive ? audioKey : null);
        
        // Skip if already playing in group
        if (exclusive && group && this.exclusiveGroups[group]) {
          return;
        }
      
        try {
          const audio = this._getAudioFromPool(audioKey);
          audio.currentTime = startAt;
          audio.loop = loop;
          audio.volume = payload.decibels > 0 ? this.getVolume(sourceXPosition, sourceYPosition, decibels) : volume;

          this.audioState[audioKey] = audio;
          if (exclusive && group) {
            this.exclusiveGroups[group] = audioKey;
          }
          audio.play().then(() => {
          }).catch(() => {});

          audio.addEventListener('ended', () => {
            delete this.audioState[audioKey];
            delete this.exclusiveGroups[group];
          });
          
          if (endAt) {
            audio.addEventListener('timeupdate', () => {
              if (audio.currentTime >= endAt) {
                audio.pause();
                delete this.audioState[audioKey];
                delete this.exclusiveGroups[group];
              }
            });
          }
        } catch (e) {
          console.error(`Audio error: ${e}`);
        }
      });

      this.addHandler('STOP_AUDIO', (payload) => {
        const { audioKey, group } = payload;
        if (!this.audioState[audioKey]) return;
      
        this.audioState[audioKey].pause();
        delete this.audioState[audioKey];
        if (group) {
          delete this.exclusiveGroups[group];
        }
      });
    }
  
    work() {
    };

    _getAudioFromPool(audioKey) {
      this.audioCache[audioKey] ||= [];
      const pool = this.audioCache[audioKey];
      let audio = pool.find(a => a.paused || a.ended);
      if (!audio) {
        audio = new Audio(`assets/audio/${audioKey}`);
        pool.push(audio);
      }
      return audio;
    }

    _getAudioListenerPosition() {
      let position = null;

      this.workForTag('AudioListener', (tag) => {
        position = {xPosition: tag.getXPosition(), yPosition: tag.getYPosition()}
      });

      return position;
    }

    getVolume(sourceX, sourceY, sourceDb) {
      let listenerPosition = this._getAudioListenerPosition();

      if (!listenerPosition) {
        return 1; // Use basic audio system;
      }

      const maxDistance = 300;
    
      // Compute distance
      const dx = sourceX - listenerPosition.xPosition;
      const dy = sourceY - listenerPosition.yPosition;
      const distance = Math.sqrt(dx * dx + dy * dy);
    
      // Clamp and normalize distance
      const normalizedDistance = Math.min(distance / maxDistance, 1);
    
      // Apply quadratic falloff (ease-out)
      const volume = 1 - Math.pow(normalizedDistance, 2);
   
      return volume;
    }
  }
  