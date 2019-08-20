import process = require("process");
import dotenv from "dotenv";
import * as path from "path";
import { IPolkabotConfig, EnvDictionnary } from "./types";
import { assert } from '@polkadot/util';

const PREFIX = "POLKABOT_";

export const ConfigFields: EnvDictionnary = {
  POLKADOT_NODE_NAME: { name: PREFIX + "POLKADOT_NODE_NAME", description: "The name of the node we connect to" },
  POLKADOT_URL: { name: PREFIX + "POLKADOT_WS_HOST", description: "The Polkadot WS url" },

  MATRIX_ROOM: { name: PREFIX + "MATRIX_ROOM_ID", description: "", regexp: /^.*$/ },
  MATRIX_TOKEN: { name: PREFIX + "MATRIX_TOKEN", description: "", masked: true, regexp: /^.{3,}/ },
  MATRIX_BOTMASTER_ID: { name: PREFIX + "MATRIX_BOTMASTER_ID", description: "" },
  MATRIX_BOTUSER_ID:  { name: PREFIX + "MATRIX_BOTUSER_ID", description: "" } ,
  MATRIX_BASEURL: { name: PREFIX + "MATRIX_BASE_URL", description: "" },
  MATRIX_LOGIN_USER_ID: { name: PREFIX + "MATRIX_LOGIN_USER_ID", description: "" },
  MATRIX_LOGIN_USER_PASSWORD: { name: PREFIX + "MATRIX_LOGIN_USER_PASSWORD", description: "", masked: true, regexp: /^.{3,}/ },
};

export class ConfigSingleton  {
  private static instance: IPolkabotConfig | null;

  private constructor() {
    ConfigSingleton.refresh();
  }

  /** If you need to access the config, use this method */
  public static getInstance(): IPolkabotConfig {
    console.log('ConfigSingleton.getInstance()')
    if (!ConfigSingleton.instance) {
      new ConfigSingleton();
    }
    return ConfigSingleton.instance;
  }

  /** You likely will never have to use this function which
   * is mostly use for the tests. If you don't know, do NOT call
   * this function, it would take time and likely do nothing
   * interesting for you.
   */
  public static refresh(): void {
    const profile = process.env.NODE_ENV || "production";
    console.log('NODE_ENV profile: ', profile)
    const envfile =
      profile == "production"
        ? path.resolve(process.cwd(), ".env")
        : path.resolve(process.cwd(), ".env." + profile.toLowerCase());
    console.log('ENV file:', envfile)
    dotenv.config({ path: envfile });
    const ENV = process.env;
    console.log('process.env', ENV)
    console.log('configFields', ConfigFields)
    ConfigSingleton.instance = {
      polkadot: {
        nodeName: ENV[ConfigFields.POLKADOT_NODE_NAME.name],
        host: ENV[ConfigFields.POLKADOT_URL.name],

      },
      matrix: {
        botMasterId: ENV[ConfigFields.MATRIX_BOTMASTER_ID.name],   // Who is managing the bot. i.e. '@you:matrix.org'
        roomId: ENV[ConfigFields.MATRIX_ROOM.name],    
        botUserId: ENV[ConfigFields.MATRIX_BOTUSER_ID.name],    
        token: ENV[ConfigFields.MATRIX_TOKEN.name],    
        baseUrl: ENV[ConfigFields.MATRIX_BASEURL.name],
        loginUserId: ENV[ConfigFields.MATRIX_LOGIN_USER_ID.name],
        loginUserPassword: ENV[ConfigFields.MATRIX_LOGIN_USER_PASSWORD.name],
      }
    };

    console.log(ConfigSingleton.instance)
    assert((ConfigSingleton.instance.polkadot.nodeName || '').length > 0, "The extracted config does not look OK") 
  }

  /** Calling this function will get an instance of the Config and attach it
   * to the global scope.
   */
  public static loadToGlobal(): void {
    global["Config"] = ConfigSingleton.getInstance();
  }

  /** Validate the config and return wheather it is valid or not */
  public static Validate(): boolean {
    let result = true;
    console.log("Validating process.env variables:");
    Object.entries(ConfigFields).map(([_key, env]) => {
      if (env.regexp != undefined) {
        const value = process.env[env.name] || "";
        const regex = RegExp(env.regexp);
        const testResult = regex.test(value);
        // console.log(`Checking ${env.name} =\t${value} with ${env.regexp} => ${testResult?"OK":"FAIL"}`)
        console.log(
          `  - Checking ${env.name} \t=> ${testResult ? "OK  " : "FAIL"}\t${env.masked ? "*****" : process.env[env.name]}`
        );
        result = result && testResult;
      }
    });
    return result;
  }

  /** Show the ENV variables this application cares about */
  public static getSupportedEnv(): EnvDictionnary {
    return ConfigFields;
  }

  /**
   * Display the current ENV to ensure everything that is used matches
   * the expectations.
   */
  public static dumpEnv(): void {
    console.log("================== ENV ==================");
    Object.entries(ConfigFields).map(([_key, env]) => {
      console.log(
        `- ${env.name}: ${env.description}\n  value: ${
          env.masked ? (process.env[env.name] ? "*****" : "empty") : process.env[env.name]
        }`
      );
    });

    console.log("================== === ==================");
  }
}
