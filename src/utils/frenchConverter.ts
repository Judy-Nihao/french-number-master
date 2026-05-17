import { BASE_FRENCH_NUMBERS } from '../constants/frenchNumbers';

/**
 * Converts a number to its French word representation (0-999,999,999,999,999).
 * Includes IPA phonetic notation (best effort for large numbers).
 */
export const getFrenchRepresentation = (n: number, isFinal: boolean = true): { word: string; ipa: string } => {
  // Handle basic cases 0-100
  if (n <= 100) {
    const result = { ...BASE_FRENCH_NUMBERS[n] };
    // Rule: 'cents' and 'vingts' lose 's' if followed by something else
    // In our BASE_FRENCH_NUMBERS, only 80 (quatre-vingts) is plurallized.
    if (!isFinal && n === 80) {
      return { word: "quatre-vingt", ipa: "/ka.tʁə.vɛ̃/" };
    }
    return result;
  }

  // Universal unit converter
  const convertUnit = (value: number, unitName: string, unitIpa: string, divisor: number, pluralUnitName?: string) => {
    const count = Math.floor(value / divisor);
    const remainder = value % divisor;
    
    let word = "";
    let ipa = "";

    if (count === 1 && unitName === "mille") {
      word = "mille";
      ipa = "/mil/";
    } else {
      // For million/milliard: they are nouns, they don't prevent pluralization of preceding words
      // Actually, rule is simpler: if it's the multiplication factor for 'cent' or 'vingt', 
      // they only get 's' if they are at the very end.
      // Adjectives like 'mille' don't count as words, so 'cent' stays singular before 'mille'.
      // But 'million' is a noun, so 'cent' gets 's' before 'million'.
      const countsAsFinal = unitName !== "mille";
      const countRep = getFrenchRepresentation(count, countsAsFinal && remainder === 0);
      
      const actualUnitName = (count > 1 && pluralUnitName) ? pluralUnitName : unitName;
      word = `${countRep.word} ${actualUnitName}`;
      ipa = `${countRep.ipa} ${unitIpa}`;
    }

    if (remainder > 0) {
      const remainderRep = getFrenchRepresentation(remainder, isFinal);
      return {
        word: `${word} ${remainderRep.word}`,
        ipa: `${ipa} ${remainderRep.ipa}`.replace(/\//g, "").trim().split(" ").map(s => `/${s}/`).join(" ")
      };
    }
    
    return { word, ipa };
  };

  // Logic blocks for different scales
  if (n < 1000) {
    const hundreds = Math.floor(n / 100);
    const remainder = n % 100;
    
    let headWord = "";
    let headIpa = "";

    if (hundreds === 1) {
      headWord = "cent";
      headIpa = "/sɑ̃/";
    } else {
      const hBase = getFrenchRepresentation(hundreds, remainder === 0 && isFinal);
      headWord = (remainder === 0 && isFinal) ? `${hBase.word} cents` : `${hBase.word} cent`;
      headIpa = `${hBase.ipa} /sɑ̃/`;
    }

    if (remainder > 0) {
      const rRep = getFrenchRepresentation(remainder, isFinal);
      return {
        word: `${headWord} ${rRep.word}`,
        ipa: `${headIpa} ${rRep.ipa}`.replace(/\//g, "").trim().split(" ").map(s => `/${s}/`).join(" ")
      };
    }
    return { word: headWord, ipa: headIpa };
  }

  if (n < 1000000) return convertUnit(n, "mille", "/mil/", 1000);
  if (n < 1000000000) return convertUnit(n, "million", "/mi.ljɔ̃/", 1000000, "millions");
  if (n < 1000000000000) return convertUnit(n, "milliard", "/mi.ljaʁ/", 1000000000, "milliards");
  if (n < 1000000000000000) return convertUnit(n, "billion", "/bi.ljɔ̃/", 1000000000000, "billions");

  return { word: "Nombre trop grand", ipa: "" };
};
