const del = require("del");

(async () => {
  const deletedDirectoryPaths = await del('./dist');
  console.log('Удаляется папка:\n', deletedDirectoryPaths.join('\n'));
})();
