const fs = require('fs');
const path = require('path');
const { Buffer } = require('buffer');

const OleCompoundDoc = require('../lib/ole-compound-doc');

const files = fs.readdirSync(path.resolve(__dirname, "data"));
describe.each(files.filter((f) => f.match(/test(\d+)\.doc$/)).map((x) => [x]))(
  `Word file %s`, (file) => {
    it('can be opened correctly', () => {
      const filename = path.resolve(__dirname, `data/${file}`);
      const doc = new OleCompoundDoc(filename);
      return doc.read();
    });

    it('generates a valid Word stream', () => {
      const filename = path.resolve(__dirname, `data/${file}`);
      const doc = new OleCompoundDoc(filename);

      return doc.read()
        .then(() => {
          return new Promise((resolve, reject) => {
            const chunks = [];
            const stream = doc.stream('WordDocument');
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('error', (error) => reject(error));
            stream.on('end', () => resolve(Buffer.concat(chunks)));
          });
        })
        .then((buffer) => {
          const magicNumber = buffer.readUInt16LE(0);
          expect(magicNumber.toString(16)).toBe("a5ec");
        });
    });
  }
);
