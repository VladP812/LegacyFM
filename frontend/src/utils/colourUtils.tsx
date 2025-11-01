import { 
  accentApricot, 
  accentCarnation, 
  accentFountain, 
  accentAstra, 
  accentRose, 
  accentHaze, 
  accentPowder 
} from '../assets/COLOURS';

export const accentColors = [
  accentApricot,
  accentCarnation,
  accentFountain,
  accentAstra,
  accentRose,
  accentHaze,
  accentPowder
];

export const getRandomAccent = () => {
  return accentColors[Math.floor(Math.random() * accentColors.length)];
};

export const getAccentByIndex = (index: number) => {
  return accentColors[index % accentColors.length];
};