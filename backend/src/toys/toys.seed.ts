import type { Toy } from '@kristy/shared';

const items: Array<[name: string, model: string, description: string, price: number]> = [
  ['Teddy Bear', 'Classic 30cm', 'Soft brown teddy bear with a red ribbon.', 20],
  ['Wooden Train', 'Choo-Choo 12', 'Hand-painted wooden train with six wagons.', 35],
  ['Rubber Duck', 'Sunny Deluxe', 'Giant yellow rubber duck, bath-ready.', 5],
  ['Building Blocks', 'BlockMaster 500', '500 colourful blocks in a storage tub.', 40],
  ['Robot Dog', 'Robo-Rex', 'Walks, barks and wags its tail.', 55],
  ['Doll House', 'Dream Villa', 'Three-storey house with furniture included.', 80],
  ['Toy Piano', 'Mini Grand', 'Little piano with 25 keys and 3 songs.', 30],
  ['Puzzle Castle', '3D Castle 200', '200-piece 3D puzzle of a fairy-tale castle.', 25],
  ['Kite', 'Rainbow Wind', 'Light rainbow kite with a long tail.', 10],
  ['Space Rocket', 'Galaxy One', 'Plastic rocket with lights and sound.', 45],
  ['Fairy Wings', 'Sparkle Set', 'Glittery wings with a matching wand.', 15],
  ['Toy Kitchen', 'Little Chef', 'Kitchen with stove, sink and pots.', 70],
  ['Spinning Top', 'Whirl Master', 'Metal spinning top with launcher.', 8],
  ['Plush Unicorn', 'Dreamy Horn', 'Pastel plush unicorn with a golden horn.', 22],
  ['Race Car', 'Speedster R2', 'Remote-controlled red race car.', 60],
  ['Tea Set', 'Garden Party', 'Porcelain-look tea set for four.', 28],
  ['Magic Kit', 'Abra 40', '40 easy magic tricks with a hat and wand.', 32],
  ['Board Game', 'Treasure Island', 'Family board game for 2 to 6 players.', 18],
  ['Jump Rope', 'Hop Hop', 'Pink jump rope with wooden handles.', 6],
  ['Toy Telephone', 'Retro Ring', 'Pull-along phone with moving eyes.', 12],
  ['Music Box', 'Moonlight', 'Wind-up music box with a ballerina.', 38],
  ['Dinosaur', 'T-Rex Roar', 'Big green dinosaur that roars.', 42],
  ['Drawing Easel', 'Little Artist', 'Double-sided easel with chalk and markers.', 50],
  ['Marbles', 'Glass Galaxy', 'Bag of 100 glass marbles.', 7],
];

export const seedToys = (): Toy[] =>
  items.map(([name, model, description, startPrice], i) => ({
    id: `toy-${String(i + 1).padStart(2, '0')}`,
    name,
    photo: null,
    description,
    model,
    startPrice,
  }));
