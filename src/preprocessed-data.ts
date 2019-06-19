import find from 'lodash/find';
import shuffle from 'lodash/shuffle';


const images = [
  {
    id: 'acdc',
    resolutions: [512, 1024, 1536],
    headingText: ''
  },
  {
    id: 'apollo11',
    resolutions: [512, 1024],
    headingText: ''
  },
  {
    id: 'bsg',
    resolutions: [512, 1024, 1536],
    headingText: ''
  },
  {
    id: 'friends',
    resolutions: [512, 1024, 1536],
    headingText: ''
  },
  {
    id: 'gnr',
    resolutions: [512, 1024, 1536],
    headingText: ''
  },
  {
    id: 'hitman',
    resolutions: [512, 1024, 1536],
    headingText: ''
  },
  {
    id: 'matrix',
    resolutions: [512, 1024, 1536, 2048],
    headingText: ''
  },
  {
    id: 'seinfeld',
    resolutions: [512, 1024, 1536],
    headingText: ''
  },
  {
    id: 'shannon',
    resolutions: [512, 1024, 1536],
    headingText: ''
  }
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
    import(/* webpackMode: "eager" */ `./assets/preprocessed/${imageId}/${res}x${res}/base.png`),
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
