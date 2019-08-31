import find from 'lodash/find';
import shuffle from 'lodash/shuffle';


const images = [
  {
    id: 'abraham-lincoln',
    resolutions: [512, 1024, 1536],
    headingText: `"Give me six hours to chop down a tree and I will spend the first four sharpening the axe." — Abraham Lincoln`
  },
  {
    id: 'acdc',
    resolutions: [512, 1024, 1536],
    headingText: `Critics like to say every AC/DC record sounds the same, but he doesn't agree.`
  },
  {
    id: 'adam',
    resolutions: [512, 1024],
    headingText: `He likes people-watching, or rather observing complex-systems.`
  },
  {
    id: 'apollo11',
    resolutions: [512, 1024],
    headingText: `He wanted to be an astronaut, but things didn't go well.`
  },
  {
    id: 'claude-shannon',
    resolutions: [512, 1024],
    headingText: 'He thinks that Claude Shannon is the most under-appreciated genius ever.'
  },
  {
    id: 'cosmos',
    resolutions: [512, 1024, 1536, 2048],
    headingText: 'He has watched "Cosmos" 19 times.'
  },
  {
    id: 'david-hockney',
    resolutions: [512, 1024, 1536],
    headingText: '"Anything simple always interests me." — David Hockney'
  },
  {
    id: 'deniz-baby-steps',
    resolutions: [512, 1024, 1536],
    headingText: 'He learns by failing, grows with baby-step iterations.'
  },
  {
    id: 'deniz-first-pc',
    resolutions: [512, 1024, 1536],
    headingText: 'He got his first PC when he was six. It was IBM 486 and blew his mind.'
  },
  {
    id: 'friends',
    resolutions: [512, 1024, 1536],
    headingText: 'He thinks that Monica > Rachel > Phoebe.'
  },
  {
    id: 'gnr',
    resolutions: [512, 1024, 1536],
    headingText: `He and his friends have a WhatsApp group named "Rockstars", but none of them are even close.`
  },
  {
    id: 'grace-hopper',
    resolutions: [512, 1024, 1536],
    headingText: `He has a clock on his wall running counter-clockwise, reminding him that humans are allergic to change.`
  },
  {
    id: 'john-carmack',
    resolutions: [512, 1024],
    headingText: `"The speed of light sucks." — John Carmack`
  },
  {
    id: 'lena',
    resolutions: [512, 1024],
    headingText: `He has a copy of November 1972 issue of Playboy.`
  },
  {
    id: 'matrix2',
    resolutions: [512, 1024, 1536],
    headingText: `Neo should have chosen the blue pill.`
  },
  {
    id: 'paul-leary',
    resolutions: [512, 1024],
    headingText: `"That’s what’s cool about working with computers. They don’t argue, they remember everything and they don’t drink all your beer." — Paul Leary`
  },
  {
    id: 'seinfeld',
    resolutions: [512, 1024, 1536],
    headingText: 'He deeply appreciates nothingness. One of his favorite tv shows is about nothing. Because nothing is a prerequisite for something.'
  },
  {
    id: 'tia-toomey',
    resolutions: [512, 1024, 1536, 2048],
    headingText: `He likes pushing himself to his limits, at least in a CrossFit box.`
  },
  {
    id: 'zeki-muren',
    resolutions: [512, 1024, 1536, 2048],
    headingText: `He feels that he's (emotionally) old enough to love Zeki Müren, one of the pillars of Turkish raki culture.`
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
