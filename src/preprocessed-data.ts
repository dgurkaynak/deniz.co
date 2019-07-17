import find from 'lodash/find';
import shuffle from 'lodash/shuffle';


const images = [
  {
    id: 'abraham-lincoln',
    resolutions: [512, 1024, 1536],
    headingText: `Give me six hours to chop down a tree and I will spend the first four sharpening the axe. — Abraham Lincoln`
  },
  {
    id: 'acdc',
    resolutions: [512, 1024, 1536],
    headingText: `He believes in simplicity, like AC/DC.`
  },
  {
    id: 'apollo11',
    resolutions: [512, 1024],
    headingText: `He wanted to be an astronaut, but things didn't go well.`
  },
  {
    id: 'claude-shannon',
    resolutions: [512, 1024],
    headingText: 'His favorite genious: Claude Shannon'
  },
  {
    id: 'cosmos',
    resolutions: [512, 1024, 1536, 2048],
    headingText: 'He has watched "Cosmos" 19 times.'
  },
  {
    id: 'david-hockney',
    resolutions: [512, 1024, 1536],
    headingText: 'Anything simple always interests me. — David Hockney'
  },
  {
    id: 'friends',
    resolutions: [512, 1024, 1536],
    headingText: 'He thinks Monica > Rachel > Phoebe.'
  },
  {
    id: 'gnr',
    resolutions: [512, 1024, 1536],
    headingText: `TODO`
  },
  {
    id: 'grace-hopper',
    resolutions: [512, 1024, 1536],
    headingText: `TODO`
  },
  {
    id: 'john-carmack',
    resolutions: [512, 1024],
    headingText: `The speed of light sucks. - John Carmack`
  },
  {
    id: 'lena',
    resolutions: [512, 1024],
    headingText: `TODO`
  },
  {
    id: 'matrix2',
    resolutions: [512, 1024, 1536],
    headingText: `He should have choosen blue pill.`
  },
  {
    id: 'paul-leary',
    resolutions: [512, 1024],
    headingText: `That’s what’s cool about working with computers. They don’t argue, they remember everything and they don’t drink all your beer. - Paul Leary`
  },
  {
    id: 'seinfeld',
    resolutions: [512, 1024, 1536],
    headingText: 'He loves watching Seinfeld while eating.'
  },
  {
    id: 'zeki-muren',
    resolutions: [512, 1024, 1536, 2048],
    headingText: 'Gitme sana muhtacım - Zeki Müren'
  },
];

const imageIds = images.map(i => i.id);
const queue = shuffle(imageIds);


export async function getNext(res: number) {
  const imageId = queue.shift();
  if (queue.length == 0) queue.push(...shuffle(imageIds));

  const data = find(images, { id: imageId });

  // Get maximum resolution
  res = Math.max(...data.resolutions.filter(r => r <= res));

  const [
    {default: baseImagePath},
    {default: faceData},
    {default: overlayImagePath}
  ] = await Promise.all([
    import(/* webpackMode: "eager" */ `./assets/preprocessed/${imageId}/${res}x${res}/base.jpg`),
    import(`./assets/preprocessed/${imageId}/${res}x${res}/data.json`),
    import(/* webpackMode: "eager" */ `./assets/preprocessed/${imageId}/${res}x${res}/overlay.png`),
  ]);
  return {
    ...data,
    baseImagePath,
    faceData,
    overlayImagePath
  };
}
