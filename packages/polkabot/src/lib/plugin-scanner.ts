import * as path from "path";
import * as fs from "fs";
import findNodeModules from "find-node-modules";
import { PluginModule } from "../../../polkabot-api/src/plugin.interface";

export default class PluginScanner {
  private name: string;

  public constructor(name) {
    this.name = name;
  }

  public scanold(cb, done): void {
    // console.log('dbg', path.dirname(process.argv0), __filename, __dirname)
    const scriptLocation = path.join(path.dirname(process.argv[1]), "..");
    console.log("script loc", scriptLocation);
    const searchPaths: string[] = findNodeModules({ cwd: scriptLocation, relative: false });
    // path.join(scriptLocation, "../lib/node_modules"),
    // path.join(__dirname, '../../../node_modules')

    console.log("PluginScanner scanning searchPaths for Polkabot plugins: ", searchPaths);
    const modules = [];

    searchPaths.map(p => {
      // const p = searchPaths[0]
      fs.readdir(p, (err, items) => {
        if (err) console.error(err);
        done(
          null,
          items
            .filter(i => i.indexOf(this.name) === 0)
            .map(plugin => {
              console.log("Plugin detected:", plugin);
              const mod = {
                name: plugin,
                path: path.join(p, plugin)
              };
              modules.push(mod);
              cb(null, mod);
            })
        );
      });
    });
  }

  public async scan() {
    return new Promise<PluginModule[]>(resolve => {
      // console.log('dbg', path.dirname(process.argv0), __filename, __dirname)
      const scriptLocation = path.join(path.dirname(process.argv[1]), "..");
      console.log("script loc", scriptLocation);
      const searchPaths: string[] = findNodeModules({ cwd: scriptLocation, relative: false });
      // path.join(scriptLocation, "../lib/node_modules"),
      // path.join(__dirname, '../../../node_modules')

      console.log("PluginScanner scanning searchPaths for Polkabot plugins: ", searchPaths);
      const modules = [];

      searchPaths.map(p => {
        // const p = searchPaths[0]
        fs.readdirSync(p)
          .filter(f => f.indexOf(this.name) === 0)
          .map(plugin => {
            // console.log('Plugin detected:', plugin);
            const mod = {
              name: plugin,
              path: path.join(p, plugin)
            };
            modules.push(mod);
          });
      });

      resolve(modules);
    });
  }
}
