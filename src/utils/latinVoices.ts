
export interface LatinVoice {
  id: string;
  name: string;
  gender: 'male' | 'female';
  country: string;
  accent: string;
  description: string;
  flag: string;
}

export const LATIN_VOICES: LatinVoice[] = [
  // México
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', gender: 'male', country: 'México', accent: 'Mexicano', description: 'Voz masculina mexicana profesional', flag: '🇲🇽' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', gender: 'female', country: 'México', accent: 'Mexicana', description: 'Voz femenina mexicana cálida', flag: '🇲🇽' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', gender: 'male', country: 'México', accent: 'Mexicano', description: 'Voz masculina mexicana versátil', flag: '🇲🇽' },
  
  // Colombia
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', gender: 'male', country: 'Colombia', accent: 'Colombiano', description: 'Voz masculina colombiana natural', flag: '🇨🇴' },
  { id: 'SAz9YHcvj6GT2YYXdXww', name: 'River', gender: 'female', country: 'Colombia', accent: 'Colombiana', description: 'Voz femenina colombiana elegante', flag: '🇨🇴' },
  { id: 'pqHfZKP75CvOlQylNhV4', name: 'Bill', gender: 'male', country: 'Colombia', accent: 'Medellín', description: 'Voz masculina paisa de Medellín', flag: '🇨🇴' },
  { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', gender: 'female', country: 'Colombia', accent: 'Bogotá', description: 'Voz femenina bogotana profesional', flag: '🇨🇴' },
  
  // Argentina
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', gender: 'male', country: 'Argentina', accent: 'Argentino', description: 'Voz masculina argentina con carisma', flag: '🇦🇷' },
  { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', gender: 'female', country: 'Argentina', accent: 'Porteña', description: 'Voz femenina porteña sofisticada', flag: '🇦🇷' },
  { id: 'bIHbv24MWmeRgasZH58o', name: 'Will', gender: 'male', country: 'Argentina', accent: 'Cordobés', description: 'Voz masculina cordobesa amigable', flag: '🇦🇷' },
  
  // Chile
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', gender: 'male', country: 'Chile', accent: 'Chileno', description: 'Voz masculina chilena moderna', flag: '🇨🇱' },
  { id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica', gender: 'female', country: 'Chile', accent: 'Chilena', description: 'Voz femenina chilena dulce', flag: '🇨🇱' },
  
  // Perú
  { id: 'cjVigY5qzO86Huf0OWal', name: 'Eric', gender: 'male', country: 'Perú', accent: 'Peruano', description: 'Voz masculina peruana clara', flag: '🇵🇪' },
  { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', gender: 'female', country: 'Perú', accent: 'Limeña', description: 'Voz femenina limeña profesional', flag: '🇵🇪' },
  
  // Venezuela
  { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum', gender: 'male', country: 'Venezuela', accent: 'Venezolano', description: 'Voz masculina venezolana enérgica', flag: '🇻🇪' },
  { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura', gender: 'female', country: 'Venezuela', accent: 'Caraqueña', description: 'Voz femenina caraqueña vibrante', flag: '🇻🇪' },
  
  // Ecuador
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', gender: 'male', country: 'Ecuador', accent: 'Ecuatoriano', description: 'Voz masculina ecuatoriana serena', flag: '🇪🇨' },
  { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice', gender: 'female', country: 'Ecuador', accent: 'Quiteña', description: 'Voz femenina quiteña elegante', flag: '🇪🇨' },
  
  // Uruguay
  { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian', gender: 'male', country: 'Uruguay', accent: 'Uruguayo', description: 'Voz masculina uruguaya cálida', flag: '🇺🇾' },
  
  // Paraguay
  { id: 'iP95p4xoKVk53GoZ742B', name: 'Chris', gender: 'male', country: 'Paraguay', accent: 'Paraguayo', description: 'Voz masculina paraguaya amable', flag: '🇵🇾' },
  
  // Bolivia
  { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria', gender: 'female', country: 'Bolivia', accent: 'Boliviana', description: 'Voz femenina boliviana natural', flag: '🇧🇴' },
  
  // República Dominicana
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', gender: 'male', country: 'República Dominicana', accent: 'Dominicano', description: 'Voz masculina dominicana alegre', flag: '🇩🇴' },
];

export const getVoicesByCountry = () => {
  const voicesByCountry: Record<string, LatinVoice[]> = {};
  
  LATIN_VOICES.forEach(voice => {
    if (!voicesByCountry[voice.country]) {
      voicesByCountry[voice.country] = [];
    }
    voicesByCountry[voice.country].push(voice);
  });
  
  return voicesByCountry;
};

export const getVoiceById = (id: string): LatinVoice | undefined => {
  return LATIN_VOICES.find(voice => voice.id === id);
};

export const getVoiceByName = (name: string): LatinVoice | undefined => {
  return LATIN_VOICES.find(voice => voice.name === name);
};
