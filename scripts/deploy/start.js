// Production entry on Hostinger (Passenger / LiteSpeed Node): run the Next standalone server from its own
// folder, with the site's data (database, uploads, leads copy) kept outside the app so deploys never touch it.
const path = require("node:path");
const os = require("node:os");
process.chdir(__dirname);
process.env.DATA_DIR = process.env.DATA_DIR || path.join(os.homedir(), "baikal-data");
process.env.NODE_ENV = "production";
// which look this site serves: the pages read NEXT_PUBLIC_HOME at run time, so the deploy writes it here
process.env.NEXT_PUBLIC_HOME = process.env.NEXT_PUBLIC_HOME || "__HOME__";
require("./server.js");
