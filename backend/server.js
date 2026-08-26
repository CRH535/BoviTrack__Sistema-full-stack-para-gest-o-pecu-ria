const { app, pool } = require("./app");

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor esta em http://localhost:${PORT}`);
  });
}

module.exports = { app, pool };
