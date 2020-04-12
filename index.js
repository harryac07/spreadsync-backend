const app = require("./server.js");
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});
