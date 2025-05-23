export default class Colors {
    constructor() {
        this.colorConversionCache = {}
    }
    hexToRgb(hex) {
        hex = hex.replace('#', '');
        if (hex.length === 3) {
            hex = hex.split('').map(c => c + c).join('');
        }
        const bigint = parseInt(hex, 16);
        return {
            r: (bigint >> 16) & 255,
            g: (bigint >> 8) & 255,
            b: bigint & 255
        };
    }

    rgbToHex({ r, g, b }) {
        return '#' + [r, g, b].map(c => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')).join('');
    }

    lighten(baseRgb, factor) {
        const { r, g, b } = baseRgb;
        return this.rgbToHex({
            r: r + (255 - r) * factor,
            g: g + (255 - g) * factor,
            b: b + (255 - b) * factor
        });
    }

    darken(baseRgb, factor) {
        const { r, g, b } = baseRgb;
        return this.rgbToHex({
            r: r * (1 - factor),
            g: g * (1 - factor),
            b: b * (1 - factor)
        });

    }

    getShades(baseHex) {
        return [
            this.lighten(this.hexToRgb(baseHex), 0.2),   // lighter shade
            this.lighten(this.hexToRgb(baseHex), 0.1),    // slightly lighter
            baseHex,         // original
            this.darken(this.hexToRgb(baseHex), 0.1),    // slightly darker
            this.darken(this.hexToRgb(baseHex), 0.2)      // darker
        ];
    }

    random(baseHex) {
        let collection = this.getShades(baseHex);
        return this._randomFrom(collection);
    }


    _randomFrom(array) {
        return array[Math.floor(Math.random() * array.length)];
    }



  colorToRaw(colorString, normalizeTo = 1) {
    if (this.colorConversionCache[colorString]) {
      return this.colorConversionCache[colorString]
    }

    let rgbaString = colorString;
    if (!colorString) {
      rgbaString = 'rgba(0,0,0,0)'
    }
    else if (colorString.indexOf('#') != -1) {
      rgbaString = this.hexToRgbaString(colorString);
    }
    else if (colorString.indexOf('rgb(') != -1) {
      rgbaString = this.rgbToRgbaString(colorString);
    }

    let result = this.rgbaStringToRaw(rgbaString, normalizeTo);
    this.colorConversionCache[colorString] = result
    return result;
  }
  
  hexToRgbaString(hex) {
    // Remove leading #
    hex = hex.replace(/^#/, '');
  
    if (hex.length !== 6 && hex.length !== 8) {
      throw new Error('Invalid hex color. Use #RRGGBB or #RRGGBBAA.');
    }
  
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
  
    return `rgba(${r},${g},${b},${a})`;
  }

  rgbToRgbaString(rgbString) {
    const values = rgbString.slice(4, -1).split(',').map(v => parseFloat(v.trim()));
    const [r, g, b] = values;
    return `rgba(${r},${g},${b},1)`;
  }

  rgbaStringToRaw(string, normalizeTo = 1) {
    let parts = `${string}`.split('rgba(')[1].split(',');
    let result = {
      r: parseFloat(parts[0]) / normalizeTo,
      g: parseFloat(parts[1]) / normalizeTo,
      b: parseFloat(parts[2]) / normalizeTo,
      a: parseFloat(parts[3].split(')')[0])
    };
    return result;
  }

  parseGradientStops(fillArray) {
    const stops = [];
    const colors = [];

    for (const [offset, colorStr] of fillArray) {
      const rgba = this.colorToRaw(colorStr, 255); // returns {r, g, b, a}
      stops.push(offset);
      colors.push(rgba.r, rgba.g, rgba.b, rgba.a);
    }

    return {
      stopCount: fillArray.length,
      stops: new Float32Array(stops),
      colors: new Float32Array(colors)
    };
  }
}