export const CROPS = [
  { key: 'cropApple', value: 'Apple', icon: '🍎', modelNames: ['Apple'] },
  { key: 'cropBlueberry', value: 'Blueberry', icon: '🫐', modelNames: ['Blueberry'] },
  { key: 'cropCherry', value: 'Cherry', icon: '🍒', modelNames: ['Cherry_(including_sour)', 'Cherry'] },
  { key: 'cropCorn', value: 'Corn (Maize)', icon: '🌽', modelNames: ['Corn_(maize)', 'Corn'] },
  { key: 'cropGrape', value: 'Grape', icon: '🍇', modelNames: ['Grape'] },
  { key: 'cropOrange', value: 'Orange', icon: '🍊', modelNames: ['Orange'] },
  { key: 'cropPeach', value: 'Peach', icon: '🍑', modelNames: ['Peach'] },
  { key: 'cropPepper', value: 'Bell Pepper', icon: '🫑', modelNames: ['Pepper,_bell', 'Pepper'] },
  { key: 'cropPotato', value: 'Potato', icon: '🥔', modelNames: ['Potato'] },
  { key: 'cropRaspberry', value: 'Raspberry', icon: '🫐', modelNames: ['Raspberry'] },
  { key: 'cropSoybean', value: 'Soybean', icon: '🫘', modelNames: ['Soybean'] },
  { key: 'cropSquash', value: 'Squash', icon: '🎃', modelNames: ['Squash'] },
  { key: 'cropStrawberry', value: 'Strawberry', icon: '🍓', modelNames: ['Strawberry'] },
  { key: 'cropTomato', value: 'Tomato', icon: '🍅', modelNames: ['Tomato'] },
];

export const CROP_EMOJI_MAP = {
  'Apple': '🍎',
  'Blueberry': '🫐',
  'Cherry': '🍒',
  'Cherry_(including_sour)': '🍒',
  'Corn': '🌽',
  'Corn (Maize)': '🌽',
  'Corn_(maize)': '🌽',
  'Grape': '🍇',
  'Orange': '🍊',
  'Peach': '🍑',
  'Bell Pepper': '🫑',
  'Pepper': '🫑',
  'Pepper,_bell': '🫑',
  'Potato': '🥔',
  'Raspberry': '🫐',
  'Soybean': '🫘',
  'Squash': '🎃',
  'Strawberry': '🍓',
  'Tomato': '🍅',
};

export const getCropEmoji = (cropName) => {
  if (!cropName) return '🌱';
  
  // Direct exact match
  if (CROP_EMOJI_MAP[cropName]) {
    return CROP_EMOJI_MAP[cropName];
  }
  
  // Check if any crop value contains the provided name (case insensitive)
  const lowerName = cropName.toLowerCase();
  for (const crop of CROPS) {
    if (crop.value.toLowerCase().includes(lowerName)) {
      return crop.icon;
    }
    for (const modelName of crop.modelNames) {
      if (modelName.toLowerCase().includes(lowerName)) {
        return crop.icon;
      }
    }
  }

  return '🌱';
};
