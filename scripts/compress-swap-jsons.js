const fs = require('fs');
const path = require('path');
const fg = require('fast-glob');


(async () => {
  const jsonFiles = await fg(['src/assets/swaps/*.json']);

  for (let jsonFile of jsonFiles) {
    const jsonFilePath = path.join('../', jsonFile);
    const data = require(jsonFilePath);
    data.faces.forEach((face) => {
      face.points = face.points.map(([ x, y ]) => {
        return [
          parseFloat(x.toFixed(2)),
          parseFloat(y.toFixed(2))
        ];
      });
    });

    const newData = JSON.stringify(data);

    await new Promise((resolve, reject) => {
      const dirName = path.dirname(jsonFile);
      const baseFileName = path.basename(jsonFile, '.json');
      const newPath = path.join(dirName, `${baseFileName}.min.json`);
      fs.writeFile(newPath, newData, 'utf8', (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
})();
