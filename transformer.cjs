/**
 * Custom Metro transformer — obfuscates all manager entry modules in release.
 * Convention: files named like PIN_MANAGER_*.tsx | RD_MANAGER_*.tsx (any suffix).
 * Compatible with RN 0.81+ / Metro 0.83+
 */
const path = require("path");
// Expo SDK 54+ does not ship `@react-native/metro-babel-transformer`; chain off Expo's Babel transformer.
const expoRoot = path.dirname(require.resolve("expo/package.json"));
const upstreamTransformer = require(
  require.resolve("@expo/metro-config/build/babel-transformer", {
    paths: [expoRoot],
  }),
);
const JavaScriptObfuscator = require("javascript-obfuscator");

// Metro's collectDependencies only accepts static require specifiers: require("pkg").
// - splitStrings / stringArray on those literals → require("a"+"b") → Invalid call (build fails).
// - Catching errors and continuing used to ship an unobfuscated bundle (looked like "obfuscation off").
// Keep every module specifier out of the string array by listing them in reservedStrings (exact strings).
function collectRequireSpecifiers(code) {
  const set = new Set();
  const re = /require\(\s*["']([^"']+)["']\s*\)/g;
  let m;
  while ((m = re.exec(code))) {
    set.add(m[1]);
  }
  return [...set];
}

const OBFUSCATION_OPTIONS_BASE = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.5,
  numbersToExpressions: true,
  simplify: true,
  splitStrings: false,
  identifierNamesGenerator: "hexadecimal",
  renameGlobals: false,
  selfDefending: false,
  debugProtection: false,
  disableConsoleOutput: false,
  stringArray: true,
  stringArrayThreshold: 1,
  // base64 hides literals in the source text; avoid "rc4" here — can break RN/Metro in some setups.
  stringArrayEncoding: ["base64"],
  stringArrayShuffle: true,
};

// PIN_MANAGER_IOS_NO_SDK, PIN_MANAGER_ANDROID_BLACK, RD_MANAGER_*, etc.
// Use one segment: PIN_MANAGER_* or RD_MANAGER_* with extension ts/tsx/js/jsx (no spaces in filename).
const MANAGER_MODULE_RE =
  /(^|[\\/])(PIN|RD)_MANAGER_[^\\/]+\.(tsx|ts|jsx|js)$/i;

function shouldObfuscate(filename) {
  if (!filename) return false;
  return MANAGER_MODULE_RE.test(filename.replace(/\\/g, "/"));
}

function isManagerObfuscationDisabled() {
  const v =
    process.env.DISABLE_MANAGER_OBFUSCATION ||
    process.env.DISABLE_PIN_MANAGER_OBFUSCATION ||
    process.env.DISABLE_MASTER_OBFUSCATION;
  return v === "1" || v === "true";
}

module.exports.transform = async function (params) {
  // First, run the default RN babel transform
  const result = await upstreamTransformer.transform(params);

  // Release only. Skip all manager obfuscation: DISABLE_MANAGER_OBFUSCATION=1 (legacy: DISABLE_PIN_MANAGER_OBFUSCATION, DISABLE_MASTER_OBFUSCATION)
  if (
    shouldObfuscate(params.filename) &&
    !params.options.dev &&
    !isManagerObfuscationDisabled()
  ) {
    console.log(`[OBFUSCATOR] Obfuscating: ${params.filename}`);

    try {
      let code = result.output?.[0]?.data?.code || result.code;
      
      // If code is not present, we must generate it from the AST (React Native 0.81 behavior)
      if (!code && result.ast) {
        const generate = require("@babel/generator").default;
        // generate() returns an object with a .code string
        code = generate(result.ast, { filename: params.filename }).code;
      }

      if (code) {
        const obfuscationOptions = {
          ...OBFUSCATION_OPTIONS_BASE,
          reservedStrings: collectRequireSpecifiers(code),
        };
        const obfuscated = JavaScriptObfuscator.obfuscate(
          code,
          obfuscationOptions
        ).getObfuscatedCode();

        // 1. Replace code in text form if it exists
        if (result.output?.[0]?.data?.code) {
          result.output[0].data.code = obfuscated;
        } else if (typeof result.code === "string") {
          result.code = obfuscated;
        }

        // 2. CRITICAL: Metro uses `result.ast` to build the bundle, so we MUST 
        // replace the AST with an AST generated from the obfuscated code.
        const babel = require("@babel/core");
        result.ast = babel.parseSync(obfuscated, {
          filename: params.filename,
          sourceType: "module",
        });

        console.log(`[OBFUSCATOR] ✅ Successfully obfuscated: ${params.filename}`);
      } else {
        console.warn(`[OBFUSCATOR] ⚠️ Skipped: Unable to extract code for ${params.filename}`);
      }
    } catch (err) {
      console.error(`[OBFUSCATOR] ❌ Error obfuscating ${params.filename}:`, err);
      throw err;
    }
  } else if (
    shouldObfuscate(params.filename) &&
    !params.options.dev &&
    isManagerObfuscationDisabled()
  ) {
    console.log(
      `[OBFUSCATOR] Skipped (DISABLE_MANAGER_OBFUSCATION): ${params.filename}`,
    );
  }

  return result;
};
