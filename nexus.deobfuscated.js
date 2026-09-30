/*
 * nexus.js — reconstructed / deobfuscated source (READABLE EDITION)
 *
 * Original: Nexus Anticheat (Minecraft Bedrock, @minecraft/server script module)
 * Original obfuscation: javascript-obfuscator.io (RC4/base64 string array with
 *   rotation, control-flow flattening, dead-code injection, CJK unicode
 *   identifier mangling, self-defending checks) wrapped around an ES module.
 *
 * Reconstruction pipeline:
 *   1. webcrack (string-array + wrapper removal, first pass)
 *   2. custom @babel/traverse pass: scope-correct decoder-wrapper inlining,
 *      constant folding, 6,192 string evaluations via sandboxed original decoder
 *   3. dead-code elimination (529 wrapper fns, 850 lookup objects)
 *   4. identifier + property-name de-mangling, unminification
 *   5. readability pass: semantic renaming of all recoverable bindings and
 *      properties, inline object-builder statements, section banners
 *
 * NAMING NOTES
 *   - Original identifiers are unrecoverable (mangled). All names below are
 *     inferred from behavior; the only machine leftovers are `tmpN` locals.
 *   - HOOKS.*  : event-hook registry arrays filled by detection modules and
 *                consumed by the event/tick wiring further below.
 *   - Database : KV store persisted to world dynamic properties; every value is
 *                ChaCha20-encrypted (hardcoded CHACHA_KEY), base64-encoded and
 *                chunked into 30000-char slices (see DB_CHUNK_SIZE/saveDbValue).
 *   - protectedStorageDb's original DB name is base64 for
 *     "exactlyjudgedoorflowercannotduringthreadpricecurve".
 *   - Config objects carry schema metadata suffixes:
 *     $T title, $D description, $B body text, $V allowed values, $P premium flag.
 *
 * The software remains (c) its authors (see EULA in the original file).
 */
import { world, system, GameMode, EquipmentSlot, EnchantmentTypes, ItemStack, BlockComponentTypes, EntityComponentTypes, Player, EntityDamageCause, Direction, InputMode } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
// ==== 1. CRYPTOGRAPHY ============================================================
//   ChaCha20 stream cipher (8-byte nonce) + base64 transport encoding.
//   Everything persisted to world dynamic properties passes through here.
function createChaCha20(e, t) {
  if (e.byteLength < 32) {
    throw new Error("key too short");
  }
  if (t.byteLength < 8) {
    throw new Error("IV too short");
  }
  const n = new Uint32Array(16);
  let a = new DataView(e);
  n[0] = 1634760805;
  n[1] = 857760878;
  n[2] = 2036477234;
  n[3] = 1797285236;
  n[4] = a.getUint32(0, true);
  n[5] = a.getUint32(4, true);
  n[6] = a.getUint32(8, true);
  n[7] = a.getUint32(12, true);
  n[8] = a.getUint32(16, true);
  n[9] = a.getUint32(20, true);
  n[10] = a.getUint32(24, true);
  n[11] = a.getUint32(28, true);
  a = new DataView(t);
  n[14] = a.getUint32(0, true);
  n[15] = a.getUint32(4, true);
  const o = new Uint32Array(16);
  const i = new DataView(o.buffer);
  return function () {
    function e(e, t, n, a, o) {
      function i(e, t) {
        return e << t | e >>> 32 - t;
      }
      e[t] += e[n];
      e[o] = i(e[o] ^ e[t], 16);
      e[a] += e[o];
      e[n] = i(e[n] ^ e[a], 12);
      e[t] += e[n];
      e[o] = i(e[o] ^ e[t], 8);
      e[a] += e[o];
      e[n] = i(e[n] ^ e[a], 7);
    }
    o.set(n);
    for (let t = 0; t < 4; t += 2) {
      e(o, 0, 4, 8, 12);
      e(o, 1, 5, 9, 13);
      e(o, 2, 6, 10, 14);
      e(o, 3, 7, 11, 15);
      e(o, 0, 5, 10, 15);
      e(o, 1, 6, 11, 12);
      e(o, 2, 7, 8, 13);
      e(o, 3, 4, 9, 14);
    }
    for (let e = 0; e < 16; e++) {
      i.setUint32(e * 4, o[e] + n[e], true);
    }
    n[12]++;
    if (n[12] == 0 && (n[13]++, n[13] == 0)) {
      throw new Error("output exhausted");
    }
    return o.buffer;
  };
}
function chacha20Encrypt(e) {
  const t = function () {
    const e = new Uint8Array(8);
    const t = new DataView(e.buffer);
    const n = Date.now();
    t.setUint32(0, n / 4294967296 | 0, true);
    t.setUint32(4, n >>> 0, true);
    const a = Math.random() * 4294967296;
    e[4] ^= a & 255;
    e[5] ^= a >> 8 & 255;
    return e;
  }();
  const n = createChaCha20(CHACHA_KEY.buffer, t.buffer);
  const a = new Uint8Array(e.length);
  let o = 0;
  while (o < a.length) {
    const t = new Uint8Array(n());
    const i = Math.min(t.length, a.length - o);
    for (let n = 0; n < i; n++) {
      a[o + n] = e[o + n] ^ t[n];
    }
    o += i;
  }
  const i = new Uint8Array(t.length + a.length);
  i.set(t);
  i.set(a, t.length);
  return i;
}
const BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const BASE64_INDEX = new Uint8Array(256);
for (let e = 0; e < 64; e++) {
  BASE64_INDEX[BASE64_CHARS.charCodeAt(e)] = e;
}
function encryptToBase64(e) {
  const t = function (e) {
    const t = [];
    for (let n = 0; n < e.length; n++) {
      let a = e.charCodeAt(n);
      if (a < 128) {
        t.push(a);
      } else if (a < 2048) {
        t.push(a >> 6 | 192, a & 63 | 128);
      } else if (a < 55296 || a >= 57344) {
        t.push(a >> 12 | 224, a >> 6 & 63 | 128, a & 63 | 128);
      } else {
        n++;
        a = 65536 + ((a & 1023) << 10 | e.charCodeAt(n) & 1023);
        t.push(a >> 18 | 240, a >> 12 & 63 | 128, a >> 6 & 63 | 128, a & 63 | 128);
      }
    }
    return new Uint8Array(t);
  }(e);
  return function (e) {
    let t = "";
    const n = e.length;
    for (let a = 0; a < n; a += 3) {
      t += BASE64_CHARS[e[a] >> 2];
      t += BASE64_CHARS[(e[a] & 3) << 4 | e[a + 1] >> 4];
      t += BASE64_CHARS[(e[a + 1] & 15) << 2 | e[a + 2] >> 6];
      t += BASE64_CHARS[e[a + 2] & 63];
    }
    if (n % 3 == 2) {
      t = t.substring(0, t.length - 1) + "=";
    } else if (n % 3 == 1) {
      t = t.substring(0, t.length - 2) + "==";
    }
    return t;
  }(chacha20Encrypt(t));
}
function decryptFromBase64(e) {
  const t = function (e) {
    let t = e.length * 0.75;
    if (e[e.length - 1] === "=") {
      t--;
    }
    if (e[e.length - 2] === "=") {
      t--;
    }
    const n = new Uint8Array(t);
    let a = 0;
    for (let t = 0; t < e.length; t += 4) {
      const o = BASE64_INDEX[e.charCodeAt(t)];
      const i = BASE64_INDEX[e.charCodeAt(t + 1)];
      const r = BASE64_INDEX[e.charCodeAt(t + 2)];
      const s = BASE64_INDEX[e.charCodeAt(t + 3)];
      n[a++] = o << 2 | i >> 4;
      n[a++] = (i & 15) << 4 | r >> 2;
      n[a++] = (r & 3) << 6 | s & 63;
    }
    return n;
  }(e);
  return function (e) {
    let t = "";
    let n = 0;
    while (n < e.length) {
      let a = e[n++];
      if (a < 128) {
        t += String.fromCharCode(a);
      } else if (a > 191 && a < 224) {
        let o = e[n++];
        t += String.fromCharCode((a & 31) << 6 | o & 63);
      } else if (a > 223 && a < 240) {
        let o = e[n++];
        let i = e[n++];
        t += String.fromCharCode((a & 15) << 12 | (o & 63) << 6 | i & 63);
      } else {
        let o = (a & 7) << 18 | (e[n++] & 63) << 12 | (e[n++] & 63) << 6 | e[n++] & 63;
        o -= 65536;
        t += String.fromCharCode(o >> 10 | 55296, o & 1023 | 56320);
      }
    }
    return t;
  }(function (e) {
    if (e.length < 8) {
      throw new Error("Too short");
    }
    const t = e.subarray(0, 8);
    const n = e.subarray(8);
    const a = createChaCha20(CHACHA_KEY.buffer, t.buffer);
    const o = new Uint8Array(n.length);
    let i = 0;
    while (i < o.length) {
      const e = new Uint8Array(a());
      const t = Math.min(e.length, o.length - i);
      for (let a = 0; a < t; a++) {
        o[i + a] = n[i + a] ^ e[a];
      }
      i += t;
    }
    return o;
  }(t));
}
const CHACHA_KEY = function (e) {
  const t = new Uint8Array(e.length / 2);
  for (let n = 0; n < e.length; n += 2) {
    t[n / 2] = parseInt(e.slice(n, n + 2), 16);
  }
  return t;
}("f7d850f05a995e2d3a5cebb84c106725af0b7fa13e1297cb2821001cdc44e23e");
// ==== 2. WORLD DATABASE ==========================================================
//   Encrypted, chunked key/value store on world dynamic properties.
//   Static Database.loadAll()/saveAll() sync every live instance.
class Database {
  static instances = [];
  static loadAll() {
    Database.instances.forEach(t => {
      t.data = function (t) {
        let n;
        let a = "";
        let o = 1;
        for (let n = 0; n < o; n++) {
          let i = world.getDynamicProperty("" + t + n);
          if (i === undefined) {
            break;
          }
          if (n === 0) {
            o = Number(i.split("!")[0]);
            i = i.replace(/^[0-9]+\//, "");
          }
          a += i;
        }
        try {
          const e = decryptFromBase64(a);
          n = JSON.parse(e);
        } catch {
          n = {};
        }
        return n;
      }(t.id);
    });
  }
  static saveAll() {
    Database.instances.forEach(e => {
      saveDbValue(e.id, e.data);
    });
  }
  unusedField = "";
  size = 0;
  data = {};
  constructor(e) {
    this.id = "db:" + function (e, t = 114514) {
      const [n, a] = function (e, t) {
        let n = t ^ -559038737;
        let a = t ^ 1103547991;
        for (let t, o = 0; o < e.length; o++) {
          t = e.charCodeAt(o);
          n = Math.imul(n ^ t, 2654435761);
          a = Math.imul(a ^ t, 1597334677);
        }
        n = Math.imul(n ^ n >>> 16, 2246822507);
        n ^= Math.imul(a ^ a >>> 13, 3266489909);
        a = Math.imul(a ^ a >>> 16, 2246822507);
        a ^= Math.imul(n ^ n >>> 13, 3266489909);
        return [a >>> 0, n >>> 0];
      }(e, t);
      return n.toString(36).padStart(7, "0") + a.toString(36).padStart(7, "0");
    }(e);
    Database.instances.push(this);
  }
  getAll() {
    return this.data;
  }
  get(e) {
    return this.data?.[e];
  }
  set(e, t = undefined) {
    if (t === undefined) {
      delete this.data[e];
    } else {
      this.data[e] = t;
    }
    this.size = Object.keys(this.data).length;
    saveDbValue(this.id, this.data);
  }
  has(e) {
    return e in this.data;
  }
}
const centreDb = new Database("centre");
const DB_CHUNK_SIZE = 30000;
function saveDbValue(t, n) {
  const a = function (e) {
    let t = [];
    for (let n = 0; n < e.length; n += DB_CHUNK_SIZE) {
      t.push(e.slice(n, n + DB_CHUNK_SIZE));
    }
    t[0] = t.length + "/" + (t[0] ?? "");
    return t;
  }(encryptToBase64(JSON.stringify(n)));
  const o = {};
  a.forEach((e, n) => {
    o[t + n] = e;
  });
  world.setDynamicProperties(o);
}
const dbKeyIds = {
  admins: "526b4f5e-8c42-484a-8bd0-fa5d83c3a2b4",
  license: "89fe4b6b-19b0-4b98-a15c-8fcc371e675e",
  server: "e3b189ec-1272-4ca6-be58-3686fc58727f",
  reconnect: "78111220-53fd-4080-af3d-9799403f705e",
  config: "ddebdc3c-dbca-4fde-a08d-2e0b00d57f5c",
  timeline: "5bf6b4fe-d265-4212-9b7e-1ff6fd333cb7",
  bans: "d953f9d8-5a33-49be-bc1c-38c079dc12d6",
  bansByName: "ce523e34-8638-42e7-b578-bc2651ebea16",
  freezes: "f1eaf092-73ce-4d89-9043-98bf5f91c74e"
};
var DB_KEYS = Object.freeze(dbKeyIds);
const DEFAULT_TRUE = true;
// ==== 3. DEFAULT CONFIGURATION SCHEMA ============================================
//   Plain objects with $T/$D/$B/$V/$P metadata; user overrides are stored in
//   configDb and merged into CONFIG at world load.
const DEFAULT_ALERT_CONFIG = {};
DEFAULT_ALERT_CONFIG.target = "all";
DEFAULT_ALERT_CONFIG.target$T = "Alert Target";
DEFAULT_ALERT_CONFIG.target$D = "The target that will receive alert when a player get flagged or there is other alert.";
DEFAULT_ALERT_CONFIG.target$B = "Select the target that will receive alerts when a player is flagged or other alerts occur.\n- all: All players will receive alert.\n- tag: Only player with specific tag will receive alert.\n- tag-and-op: Player with specific tag and operator will receive alert.\n- tag-and-admin: Player with specific tag and admin permission will receive alert.\n- op: Only operator will receive alert.\n- admin: Only player with admin permission will receive alert.\n- none: No one will receive alert. (i.e. Disable alert)";
DEFAULT_ALERT_CONFIG.target$V = ["all", "exclude", "tag", "tag-and-op", "tag-and-admin", "op", "admin", "none"];
DEFAULT_ALERT_CONFIG.tag = "anticheat_alert";
DEFAULT_ALERT_CONFIG.tag$T = "Alert Tag";
DEFAULT_ALERT_CONFIG.tag$D = "The defined alert tag.";
DEFAULT_ALERT_CONFIG.tag$B = "Only work when Alert Target is tag, tag-and-op or tag-and-admin. This is the tag that will be used to send alert.";
DEFAULT_ALERT_CONFIG.showSilentFlag = false;
DEFAULT_ALERT_CONFIG.showSilentFlag$T = "Show Silent Flag";
DEFAULT_ALERT_CONFIG.showSilentFlag$D = "If this option is true, the plugin will show the potential flag behavior found by Nexus Heat Engine. Not surely.";
const DEFAULT_SPECIFIC_PUNISHMENTS = {
  aim: "kick",
  aim$T: "Anti Aim",
  aim$D: "Punishment for Aim.",
  autoclicker: "kick",
  autoclicker$T: "Anti AutoClicker",
  autoclicker$D: "Punishment for AutoClicker.",
  reach_g1: "kick",
  reach_g1$T: "Anti Reach (Generation 1)",
  reach_g1$D: "Punishment for Reach (Generation 1).",
  reach_g2: "kick",
  reach_g2$T: "Anti Reach (Generation 2)",
  reach_g2$D: "Punishment for Reach (Generation 2).",
  hitbox: "kick",
  hitbox$T: "Anti HitBox",
  hitbox$D: "Punishment for HitBox.",
  killaura: "kick",
  killaura$T: "Anti KillAura",
  killaura$D: "Punishment for KillAura.",
  xray: "ban",
  xray$T: "Anti Xray",
  xray$D: "Punishment for Xray.",
  offhand: "none",
  offhand$T: "Anti Offhand",
  offhand$D: "Punishment for Offhand.",
  forceOp: "none",
  forceOp$T: "Anti ForceOp",
  forceOp$D: "Punishment for ForceOp.",
  ghost: "ban",
  ghost$T: "Anti Ghost",
  ghost$D: "Punishment for Ghost.",
  groundSpoof: "kick",
  groundSpoof$T: "Anti Ground Spoof",
  groundSpoof$D: "Punishment for Ground Spoof.",
  noClip: "none",
  noClip$T: "Anti NoClip",
  noClip$D: "Punishment for NoClip.",
  noSlow: "kick",
  noSlow$T: "Anti NoSlow",
  noSlow$D: "Punishment for NoSlow.",
  scaffold: "none",
  scaffold$T: "Anti Scaffold",
  scaffold$D: "Punishment for Scaffold.",
  durabilityEdit: "kick",
  durabilityEdit$T: "Anti Durability Edit",
  durabilityEdit$D: "Punishment for durability edit.",
  blockAura: "kick",
  blockAura$T: "Anti BlockAura",
  blockAura$D: "Punishment for Block aura.",
  invalidPlace: "kick",
  invalidPlace$T: "Anti Invalid Place",
  invalidPlace$D: "Punishment for Invalid Place.",
  dupe: "ban",
  dupe$T: "Anti Dupe",
  dupe$D: "Punishment for Dupe.",
  nameSpoof: "ban",
  nameSpoof$T: "Anti Name Spoof",
  nameSpoof$D: "Punishment for Name Spoof.",
  blockReach: "kick",
  blockReach$T: "Anti Block Reach",
  blockReach$D: "Punishment for Block Reach.",
  chestAura: "kick",
  chestAura$T: "Anti ChestAura",
  chestAura$D: "Punishment for ChestAura.",
  chestStealer: "kick",
  chestStealer$T: "Anti Chest Stealer",
  chestStealer$D: "Punishment for Chest Stealer.",
  interactReach: "kick",
  interactReach$T: "Anti Interact Reach",
  interactReach$D: "Punishment for Interact Reach.",
  invalidBreak: "kick",
  invalidBreak$T: "Invalid Break",
  invalidBreak$D: "Punishment for Invalid Break.",
  nuker: "ban",
  nuker$T: "Anti Nuker",
  nuker$D: "Punishment for Nuker.",
  placeAutoClicker: "kick",
  placeAutoClicker$T: "Anti Place auto clicker.",
  placeAutoClicker$D: "Punishment for Place auto clicker.",
  crystalAura: "none",
  crystalAura$T: "Anti Crystal Aura.",
  crystalAura$D: "Punishment for Crystal Aura",
  ghostHand: "none",
  ghostHand$T: "Ghost Hand",
  ghostHand$D: "Punishment for Ghost Hand."
};
const DEFAULT_BAN_CONFIG = {
  duration: 86400000
};
DEFAULT_BAN_CONFIG.duration$T = "Ban Duration";
DEFAULT_BAN_CONFIG.duration$D = "Duration of the ban in milliseconds. -1 for permanent bans.";
DEFAULT_BAN_CONFIG.appealAt = "Please contact the server owner if you think this is a mistake.";
DEFAULT_BAN_CONFIG.appealAt$T = "Appeal Message.";
DEFAULT_BAN_CONFIG.appealAt$D = "Message displayed to banned players, usually containing appeal instructions.";
const DEFAULT_PUNISHMENT_CONFIG = {
  debugMode: false
};
DEFAULT_PUNISHMENT_CONFIG.debugMode$T = "Debug Mode";
DEFAULT_PUNISHMENT_CONFIG.debugMode$D = "If this option is true, the plugin will no longer execute punishments on flagged player.";
DEFAULT_PUNISHMENT_CONFIG.defaultPunishment = "none";
DEFAULT_PUNISHMENT_CONFIG.defaultPunishment$T = "Default Punishment";
DEFAULT_PUNISHMENT_CONFIG.defaultPunishment$D = "The default punishment when a player is flagged. Options: none, none, none, freeze";
DEFAULT_PUNISHMENT_CONFIG.defaultPunishment$V = ["none", "none", "none", "freeze"];
DEFAULT_PUNISHMENT_CONFIG.specfic$T = "Specific Punishment";
DEFAULT_PUNISHMENT_CONFIG.specfic$D = "Settings for specific punishments.";
DEFAULT_PUNISHMENT_CONFIG.specfic$B = "You can set specific punishment for different type of flags. If the specific punishment is set to default, the default punishment will be applied.";
DEFAULT_PUNISHMENT_CONFIG.specfic = DEFAULT_SPECIFIC_PUNISHMENTS;
DEFAULT_PUNISHMENT_CONFIG.disconnectReason = "Unfair advantage";
DEFAULT_PUNISHMENT_CONFIG.disconnectReason$T = "Disconnect Reason";
DEFAULT_PUNISHMENT_CONFIG.disconnectReason$D = "Reason shown when a player is frozen or disconnected by the anticheat for being suspected to be cheating.";
DEFAULT_PUNISHMENT_CONFIG.ban$T = "Ban Settings";
DEFAULT_PUNISHMENT_CONFIG.ban$D = "Settings related to banning players.";
DEFAULT_PUNISHMENT_CONFIG.ban = DEFAULT_BAN_CONFIG;
DEFAULT_PUNISHMENT_CONFIG.freezeDuration = 3600000;
DEFAULT_PUNISHMENT_CONFIG.freezeDuration$T = "Freeze Duration";
DEFAULT_PUNISHMENT_CONFIG.freezeDuration$D = "Duration of the freeze punishment in milliseconds. -1 for no expiry.";
const DEFAULT_COMBAT_MODULES = {
  aim: DEFAULT_TRUE
};
DEFAULT_COMBAT_MODULES.aim$T = "Aim Detection (Premium)";
DEFAULT_COMBAT_MODULES.aim$D = "Enables detection of automated/perfect rotation.";
DEFAULT_COMBAT_MODULES.aim$P = true;
DEFAULT_COMBAT_MODULES.autoclicker = true;
DEFAULT_COMBAT_MODULES.autoclicker$T = "AutoClicker Detection";
DEFAULT_COMBAT_MODULES.autoclicker$D = "Detects illegal auto-clicking behavior.";
DEFAULT_COMBAT_MODULES.reach_g1 = false;
DEFAULT_COMBAT_MODULES.reach_g1$T = "Reach Detection (Gen 1)";
DEFAULT_COMBAT_MODULES.reach_g1$D = "Detects reach hacks using a fast 2D algorithm.";
DEFAULT_COMBAT_MODULES.reach_g2 = DEFAULT_TRUE;
DEFAULT_COMBAT_MODULES.reach_g2$T = "Reach Detection (Gen 2, Premium)";
DEFAULT_COMBAT_MODULES.reach_g2$D = "Advanced reach detection with improved precision.";
DEFAULT_COMBAT_MODULES.reach_g2$P = true;
DEFAULT_COMBAT_MODULES.hitbox = DEFAULT_TRUE;
DEFAULT_COMBAT_MODULES.hitbox$T = "HitBox Detection (Premium)";
DEFAULT_COMBAT_MODULES.hitbox$D = "Flags attacks that hit an entity without the player facing the hitbox.";
DEFAULT_COMBAT_MODULES.hitbox$P = true;
DEFAULT_COMBAT_MODULES.crystalAura = true;
DEFAULT_COMBAT_MODULES.crystalAura$P = DEFAULT_TRUE;
DEFAULT_COMBAT_MODULES.crystalAura$T = "Crystal Aura Detection (Premium)";
DEFAULT_COMBAT_MODULES.crystalAura$D = "Detects Crystal Aura cheat that spams crystals automatically.";
DEFAULT_COMBAT_MODULES.ghostHand = true;
DEFAULT_COMBAT_MODULES.ghostHand$P = DEFAULT_TRUE;
DEFAULT_COMBAT_MODULES.ghostHand$T = "Ghost Hand Detection (Premium)";
DEFAULT_COMBAT_MODULES.ghostHand$D = "Detects Ghost Hand cheat that hit entities through blocks.";
DEFAULT_COMBAT_MODULES.killaura = true;
DEFAULT_COMBAT_MODULES.killaura$T = "KillAura Detection";
DEFAULT_COMBAT_MODULES.killaura$D = "Detects common kill-aura behaviors.";
const DEFAULT_MOVEMENT_MODULES = {
  groundSpoof: true
};
DEFAULT_MOVEMENT_MODULES.groundSpoof$T = "Ground Spoof Detection";
DEFAULT_MOVEMENT_MODULES.groundSpoof$D = "Detects players spoofing their on-ground status to bypass server-side rewind. (i.e. AirJump)";
DEFAULT_MOVEMENT_MODULES.noClip = true;
DEFAULT_MOVEMENT_MODULES.noClip$T = "NoClip Detection (Phase)";
DEFAULT_MOVEMENT_MODULES.noClip$D = "Detects players moving through solid blocks illegitimately.";
DEFAULT_MOVEMENT_MODULES.noSlow = true;
DEFAULT_MOVEMENT_MODULES.noSlow$T = "NoSlow Detection";
DEFAULT_MOVEMENT_MODULES.noSlow$D = "Detects players avoiding movement slowdown from using items.";
const DEFAULT_WORLD_MODULES = {
  scaffold: false
};
DEFAULT_WORLD_MODULES.scaffold$T = "Scaffold Detection";
DEFAULT_WORLD_MODULES.scaffold$D = "Detects unnatural block placements that indicate scaffold hacks.";
DEFAULT_WORLD_MODULES.blockAura = true;
DEFAULT_WORLD_MODULES.blockAura$T = "BlockAura Detection";
DEFAULT_WORLD_MODULES.blockAura$D = "Detects players interacting with blocks from an illegitimate angle.";
DEFAULT_WORLD_MODULES.blockReach = true;
DEFAULT_WORLD_MODULES.blockReach$T = "Block Reach Detection";
DEFAULT_WORLD_MODULES.blockReach$D = "Detects players interacting with blocks from an illegitimate distance.";
DEFAULT_WORLD_MODULES.chestAura = true;
DEFAULT_WORLD_MODULES.chestAura$T = "ChestAura Detection";
DEFAULT_WORLD_MODULES.chestAura$D = "Detects players interacting with chests in an illegitimate manner.";
DEFAULT_WORLD_MODULES.chestStealer = false;
DEFAULT_WORLD_MODULES.chestStealer$T = "Chest Stealer Detection (Premmium)";
DEFAULT_WORLD_MODULES.chestStealer$D = "Detects players stealing items from containers in an illegitimate manner.";
DEFAULT_WORLD_MODULES.interactReach = true;
DEFAULT_WORLD_MODULES.interactReach$T = "Interact Reach Detection";
DEFAULT_WORLD_MODULES.interactReach$D = "Detects players interacting with blocks and entities from an illegitimate distance.";
DEFAULT_WORLD_MODULES.invalidBreak = true;
DEFAULT_WORLD_MODULES.invalidBreak$T = "Invalid Break Detection";
DEFAULT_WORLD_MODULES.invalidBreak$D = "Detects players breaking blocks that are not reachable (i.e. fully surrounded by solid blocks).";
DEFAULT_WORLD_MODULES.invalidPlace = true;
DEFAULT_WORLD_MODULES.invalidPlace$T = "Invalid Place Detection (Premmium)";
DEFAULT_WORLD_MODULES.invalidPlace$D = "Detects players placing blocks in a way that indicates the use of automated building tools.";
DEFAULT_WORLD_MODULES.invalidPlace$P = true;
DEFAULT_WORLD_MODULES.nuker = true;
DEFAULT_WORLD_MODULES.nuker$T = "Nuker Detection";
DEFAULT_WORLD_MODULES.nuker$D = "Detects players breaking multiple blocks in a very short time frame, which is indicative of nuker hacks.";
DEFAULT_WORLD_MODULES.placeAutoClicker = true;
DEFAULT_WORLD_MODULES.placeAutoClicker$T = "Auto-Clicker (Place)";
DEFAULT_WORLD_MODULES.placeAutoClicker$D = "Detects automated block placement by monitoring block placement CPS. (Possible to false)";
const DEFAULT_PLAYER_MODULES = {
  offhand: false
};
DEFAULT_PLAYER_MODULES.offhand$T = "Offhand Detection";
DEFAULT_PLAYER_MODULES.offhand$D = "Detects unnaturally fast offhand equipment swapping.";
const DEFAULT_EXPLOIT_MODULES = {
  forceOp: false
};
DEFAULT_EXPLOIT_MODULES.forceOp$T = "ForceOp Detection";
DEFAULT_EXPLOIT_MODULES.forceOp$D = "Prevent forceOp from working.";
DEFAULT_EXPLOIT_MODULES.ghost = false;
DEFAULT_EXPLOIT_MODULES.ghost$T = "Ghost Detection (Premium)";
DEFAULT_EXPLOIT_MODULES.ghost$D = "Prevents players from becoming invisible without a proper effect.";
DEFAULT_EXPLOIT_MODULES.ghost$P = true;
DEFAULT_EXPLOIT_MODULES.durabilityEdit = true;
DEFAULT_EXPLOIT_MODULES.durabilityEdit$T = "Anti Durability-Edit (Premium)";
DEFAULT_EXPLOIT_MODULES.durabilityEdit$D = "Check if player edit their item's durability.";
DEFAULT_EXPLOIT_MODULES.durabilityEdit$P = true;
DEFAULT_EXPLOIT_MODULES.dupeA = true;
DEFAULT_EXPLOIT_MODULES.dupeA$T = "Dupe A";
DEFAULT_EXPLOIT_MODULES.dupeA$D = "Check if the player attempts to duplicate items through bundle usage.";
DEFAULT_EXPLOIT_MODULES.dupeB = true;
DEFAULT_EXPLOIT_MODULES.dupeB$T = "Dupe B (Premium)";
DEFAULT_EXPLOIT_MODULES.dupeB$D = "Check if the player attempts to duplicate items through duplicating accounts.";
DEFAULT_EXPLOIT_MODULES.dupeB$P = DEFAULT_TRUE;
DEFAULT_EXPLOIT_MODULES.dupeC = true;
DEFAULT_EXPLOIT_MODULES.dupeC$T = "Dupe C (Premium)";
DEFAULT_EXPLOIT_MODULES.dupeC$D = "Check inventory on rejoin against stored snapshot.";
DEFAULT_EXPLOIT_MODULES.dupeC$P = DEFAULT_TRUE;
DEFAULT_EXPLOIT_MODULES.dupeD = true;
DEFAULT_EXPLOIT_MODULES.dupeD$T = "Dupe D (Premium)";
DEFAULT_EXPLOIT_MODULES.dupeD$D = "Detect item duplication attempts through hopper stimulation exploits.";
DEFAULT_EXPLOIT_MODULES.dupeD$P = DEFAULT_TRUE;
DEFAULT_EXPLOIT_MODULES.nameSpoof = true;
DEFAULT_EXPLOIT_MODULES.nameSpoof$T = "Name Spoof Detection";
DEFAULT_EXPLOIT_MODULES.nameSpoof$D = "Detects players changing their names to impersonate others.";
const DEFAULT_VISUAL_MODULES = {
  xray: false
};
DEFAULT_VISUAL_MODULES.xray$T = "Xray Detection";
DEFAULT_VISUAL_MODULES.xray$D = "Catch the pattern of xray user.";
const DEFAULT_DETECTION_CATEGORIES = {
  combat$T: "Combat Modules",
  combat$D: "Modules for detecting combat-related cheats.",
  combat: DEFAULT_COMBAT_MODULES,
  movement$T: "Movement Modules",
  movement$D: "Modules for detecting movement-related cheats.",
  movement: DEFAULT_MOVEMENT_MODULES,
  world$T: "World Modules",
  world$D: "Modules for detecting cheats that interact with the world in illegitimate ways.",
  world: DEFAULT_WORLD_MODULES,
  player$T: "Player Modules",
  player$D: "Modules for detecting player-related cheats and exploits.",
  player: DEFAULT_PLAYER_MODULES,
  exploit$T: "Exploit Modules",
  exploit$D: "Modules for preventing various exploits that can give players an unfair advantage.",
  exploit: DEFAULT_EXPLOIT_MODULES,
  visual$T: "Visual Modules",
  visual$D: "Modules for detecting visual-related cheats.",
  visual: DEFAULT_VISUAL_MODULES
};
const DEFAULT_MODERATION_MODULES = {
  antiBreachSwap: true
};
DEFAULT_MODERATION_MODULES.antiBreachSwap$T = "Anti Breach-Swap";
DEFAULT_MODERATION_MODULES.antiBreachSwap$D = "Adds an attack cooldown to the mace to prevent breach-swap exploits.";
DEFAULT_MODERATION_MODULES.worldBorder = false;
DEFAULT_MODERATION_MODULES.worldBorder$T = "World Border";
DEFAULT_MODERATION_MODULES.worldBorder$D = "Prevents players from moving beyond the defined world border. (-> Advanced Settings)";
const DEFAULT_MISC_MODULES = {
  ghostMode: false
};
DEFAULT_MISC_MODULES.ghostMode$T = "Ghost Mode (Premium)";
DEFAULT_MISC_MODULES.ghostMode$D = "Hides the anticheat from normal players; takes effect after restart.";
DEFAULT_MISC_MODULES.ghostMode$P = true;
const DEFAULT_TOGGLE_CONFIG = {
  timeline: false
};
DEFAULT_TOGGLE_CONFIG.timeline$T = "Timeline System";
DEFAULT_TOGGLE_CONFIG.timeline$D = "Enables the timeline system for tracking player actions and events. (It might bring a very little performance impact)";
DEFAULT_TOGGLE_CONFIG.detection$T = "Detection Modules";
DEFAULT_TOGGLE_CONFIG.detection$D = "Modules for detecting various types of cheating behavior.";
DEFAULT_TOGGLE_CONFIG.detection = DEFAULT_DETECTION_CATEGORIES;
DEFAULT_TOGGLE_CONFIG.moderation$T = "Moderation Modules";
DEFAULT_TOGGLE_CONFIG.moderation$D = "Modules for modifying server rules to promote fair gameplay.";
DEFAULT_TOGGLE_CONFIG.moderation = DEFAULT_MODERATION_MODULES;
DEFAULT_TOGGLE_CONFIG.misc$T = "Misc Modules";
DEFAULT_TOGGLE_CONFIG.misc$D = "Miscellaneous modules that provide extra features for your server.";
DEFAULT_TOGGLE_CONFIG.misc = DEFAULT_MISC_MODULES;
const DEFAULT_LOG_CONFIG = {
  onJoin: true
};
DEFAULT_LOG_CONFIG.onJoin$T = "Log Player Join";
DEFAULT_LOG_CONFIG.onLeave = true;
DEFAULT_LOG_CONFIG.onLeave$T = "Log Player Leave";
DEFAULT_LOG_CONFIG.onFlag = true;
DEFAULT_LOG_CONFIG.onFlag$T = "Log AntiCheat Flags";
DEFAULT_LOG_CONFIG.onChatcmd = true;
DEFAULT_LOG_CONFIG.onChatcmd$T = "Log Chat Commands";
const DEFAULT_BORDER_CENTRE = {
  x$T: "X coordinates",
  x: 0,
  z$T: "Z coordinates",
  z: 0
};
const DEFAULT_BORDER_CONFIG = {};
DEFAULT_BORDER_CONFIG.maxAxisDiff$T = "Maximum Axis Difference";
DEFAULT_BORDER_CONFIG.maxAxisDiff$D = "Maximum x and z difference from the centre. i.e. if you want to set up a 500x500 border, set this to 250.";
DEFAULT_BORDER_CONFIG.maxAxisDiff = 100000;
DEFAULT_BORDER_CONFIG.centreFromSpawn$T = "Set centre to world spawn";
DEFAULT_BORDER_CONFIG.centreFromSpawn = true;
DEFAULT_BORDER_CONFIG.defaultCentre$T = "Default Border Centre (X,Z)";
DEFAULT_BORDER_CONFIG.defaultCentre = DEFAULT_BORDER_CENTRE;
DEFAULT_BORDER_CONFIG.borderMode = "teleport";
DEFAULT_BORDER_CONFIG.borderMode$T = "Border Mode";
DEFAULT_BORDER_CONFIG.borderMode$D = "Choose how the world border is enforced.\n- Teleport: Teleport player back away from the border.\n- Count-down: Count down before killing the player.\n- Void: Do void damage (20%%) to the player.\n- Deterioration: Do void damage (20%%) that will increase over time (+1%%).";
DEFAULT_BORDER_CONFIG.borderMode$V = ["teleport", "count-down", "void", "deterioration"];
DEFAULT_BORDER_CONFIG.timeToKill = 10000;
DEFAULT_BORDER_CONFIG.timeToKill$T = "Time to Kill (Count-down)";
DEFAULT_BORDER_CONFIG.timeToKill$D = "Time (in ms) before the player is killed in count-down mode.";
const DEFAULT_MODULE_SETTINGS = {
  worldBorder$T: "World Border",
  worldBorder$D: "Settings for world border.",
  worldBorder: DEFAULT_BORDER_CONFIG
};
const AIM_CONSTANTS = {
  trackDuration: 5000
};
AIM_CONSTANTS.trackDuration$T = "Track Duration";
AIM_CONSTANTS.trackDuration$D = "How long (in ticks) Anti Aim monitors combat.";
AIM_CONSTANTS.maxFlag = 5;
AIM_CONSTANTS.maxFlag$T = "Max Flag Count";
AIM_CONSTANTS.maxFlag$D = "Number of suspicious aim checks before a player is flagged (or 'heated').";
const ANTI_BREACH_SWAP_CONSTANTS = {
  maceItem: ["minecraft:mace"],
  maceItem$T: "Mace Items",
  maceItem$D: "Items that receive the attack cooldown.",
  cooldown: 600,
  cooldown$T: "Cooldown",
  cooldown$D: "Attack cooldown in milliseconds.",
  sendMsg: true,
  sendMsg$T: "Send Message",
  sendMsg$D: "Sends a message to players who attack during the cooldown."
};
const AUTOCLICKER_CONSTANTS = {
  maxHps: 24
};
AUTOCLICKER_CONSTANTS.maxHps$T = "Max Hits per Second";
AUTOCLICKER_CONSTANTS.maxHps$D = "Maximum allowed clicks per second before flagging.";
AUTOCLICKER_CONSTANTS.resetCombatTimerAt = 10000;
AUTOCLICKER_CONSTANTS.resetCombatTimerAt$T = "Reset Combat Timer";
AUTOCLICKER_CONSTANTS.resetCombatTimerAt$D = "Inactivity time (ms) after which CPS resets to 0.";
AUTOCLICKER_CONSTANTS.naturalCombatInterval = 250;
AUTOCLICKER_CONSTANTS.naturalCombatInterval$T = "Natural Combat Interval";
AUTOCLICKER_CONSTANTS.naturalCombatInterval$D = "Inactivity interval (ms) after which total combat time is reduced.";
AUTOCLICKER_CONSTANTS.minFlagInterval = 1000;
AUTOCLICKER_CONSTANTS.minFlagInterval$T = "Minimum Flag Interval.";
AUTOCLICKER_CONSTANTS.minFlagInterval$D = "Minimum time (ms) between consecutive AutoClicker flags.";
AUTOCLICKER_CONSTANTS.stopInteractWithin = 1000;
AUTOCLICKER_CONSTANTS.stopInteractWithin$T = "Stop Interact Within";
AUTOCLICKER_CONSTANTS.stopInteractWithin$D = "Duration (ms) for which combat and placement are blocked after illegal CPS detection.";
AUTOCLICKER_CONSTANTS.placeWindowLength = 500;
AUTOCLICKER_CONSTANTS.placeWindowLength$T = "Place Window Length";
AUTOCLICKER_CONSTANTS.placeWindowLength$D = "Time window (ms) for tracking block placements.";
AUTOCLICKER_CONSTANTS.maxPlaceInWindow = 4;
AUTOCLICKER_CONSTANTS.maxPlaceInWindow$T = "Max Place in Window";
AUTOCLICKER_CONSTANTS.maxPlaceInWindow$D = "Maximum block placements allowed within the window.";
const REACH_G1_CONSTANTS = {
  heatGain: 10
};
REACH_G1_CONSTANTS.heatGain$T = "Heat Gain (Reach G1)";
REACH_G1_CONSTANTS.heatGain$D = "Heat added per reach flag (Gen 1).";
REACH_G1_CONSTANTS.heatLoss = 1.6;
REACH_G1_CONSTANTS.heatLoss$T = "Heat Loss (Reach G1)";
REACH_G1_CONSTANTS.heatLoss$D = "Heat lost per second for Reach Gen 1.";
const REACH_G2_CONSTANTS = {
  maxFlag: 5,
  normalReachSq: 9.610000000000001
};
REACH_G2_CONSTANTS.normalReachSq$T = "Max Reach Squared";
REACH_G2_CONSTANTS.normalReachSq$D = "Max Reach distance in blocks (it is squared so square root to get normal value)";
REACH_G2_CONSTANTS.spearReachSq = 22.5625;
REACH_G2_CONSTANTS.spearReachSq$T = "Max Reach Squared For Spear";
REACH_G2_CONSTANTS.spearReachSq$D = "Max Reach distance in blocks (it is squared so square root to get normal value)";
REACH_G2_CONSTANTS.maxFlag$T = "Max Flag (Reach)";
REACH_G2_CONSTANTS.maxFlag$D = "Max flag in the window that lead to a flag.";
const HITBOX_CONSTANTS = {
  maxOffsetH: 2
};
HITBOX_CONSTANTS.maxOffsetH$T = "Max Horizontal Offset (Squared)";
HITBOX_CONSTANTS.maxOffsetH$D = "Maximum allowed horizontal offset for a valid hit.";
HITBOX_CONSTANTS.maxOffsetV = 1.8;
HITBOX_CONSTANTS.maxOffsetV$T = "Max Vertical Offset";
HITBOX_CONSTANTS.maxOffsetV$D = "Maximum allowed vertical offset for a valid hit.";
HITBOX_CONSTANTS.checkDuration = 16000;
HITBOX_CONSTANTS.checkDuration$T = "Buffer Reset At";
HITBOX_CONSTANTS.checkDuration$D = "In ms, define when buffer reset.";
HITBOX_CONSTANTS.maxFlag = 4;
HITBOX_CONSTANTS.maxFlag$T = "Max Flag";
HITBOX_CONSTANTS.maxFlag$D = "Maximum flag in a buffer window lead to a flag.";
const CRYSTAL_AURA_CONSTANTS = {
  flags: 5
};
CRYSTAL_AURA_CONSTANTS.flags$T = "Max Flags";
CRYSTAL_AURA_CONSTANTS.flags$D = "Max Crystals exploding before the flag.";
const GHOST_HAND_CONSTANTS = {
  flags: 4
};
GHOST_HAND_CONSTANTS.flags$T = "Max Flags";
GHOST_HAND_CONSTANTS.flags$D = "Max Ghost hand hits before the flag.";
const KILLAURA_CONSTANTS = {
  heatGain: 19
};
KILLAURA_CONSTANTS.heatGain$T = "Heat Gain (KillAura)";
KILLAURA_CONSTANTS.heatGain$D = "Heat added per kill-aura flag.";
KILLAURA_CONSTANTS.heatLoss = 3;
KILLAURA_CONSTANTS.heatLoss$T = "Heat Loss (KillAura)";
KILLAURA_CONSTANTS.heatLoss$D = "Heat lost per second for KillAura.";
const XRAY_CONSTANTS = {
  k: 3
};
XRAY_CONSTANTS.k$T = "Strict Constant (k)";
XRAY_CONSTANTS.k$D = "Xray strictness constant. Range: 2.5-5. Higher = fewer false positives.";
XRAY_CONSTANTS.foundValid = 5000;
XRAY_CONSTANTS.foundValid$T = "Found Valid Duration";
XRAY_CONSTANTS.foundValid$D = "Duration, in ms, valid for counting a new ore is found from deep mining. Lower value = lower false positive.";
XRAY_CONSTANTS.experimental = false;
XRAY_CONSTANTS.experimental$T = "Experimental Mode (Developer)";
XRAY_CONSTANTS.experimental$D = "Send data to the player for analysis.";
XRAY_CONSTANTS.experimental$P = true;
const OFFHAND_CONSTANTS = {
  minReactionTime: 75
};
OFFHAND_CONSTANTS.minReactionTime$T = "Min Reaction Time";
OFFHAND_CONSTANTS.minReactionTime$D = "Minimum time (ms) allowed for offhand equip; faster swaps flag the player.";
OFFHAND_CONSTANTS.heatGain = 30;
OFFHAND_CONSTANTS.heatGain$T = "Heat Gain (Offhand)";
OFFHAND_CONSTANTS.heatGain$D = "Heat added per offhand flag.";
OFFHAND_CONSTANTS.heatLoss = 1;
OFFHAND_CONSTANTS.heatLoss$T = "Heat Loss (Offhand)";
OFFHAND_CONSTANTS.heatLoss$D = "Heat lost per second for Offhand detection.";
const FORCEOP_CONSTANTS = {
  onlyCheckForcedHost: true
};
FORCEOP_CONSTANTS.onlyCheckForcedHost$T = "Check Forced Host Only";
FORCEOP_CONSTANTS.onlyCheckForcedHost$D = "Only monitors highest-level permission changes to avoid false positives.";
const DUPE_A_CONSTANTS = {
  containerDistance: 10
};
DUPE_A_CONSTANTS.containerDistance$T = "Container Distance";
DUPE_A_CONSTANTS.containerDistance$D = "Maximum distance from a container to not trigger the check.";
DUPE_A_CONSTANTS.dupeContainers = ["minecraft:hopper", "minecraft:dropper", "minecraft:dispenser"];
DUPE_A_CONSTANTS.dupeContainers$T = "Dupe Containers";
DUPE_A_CONSTANTS.dupeContainers$D = "List of container block types that are monitored for duplication attempts.";
DUPE_A_CONSTANTS.rot = 10;
DUPE_A_CONSTANTS.rot$T = "Rotation Threshold";
DUPE_A_CONSTANTS.rot$D = "Maximum allowed rotation difference to make sure the player didnt close the chest.";
const DUPE_B_CONSTANTS = {
  strikes: 3
};
DUPE_B_CONSTANTS.strikes$T = "Strikes";
DUPE_B_CONSTANTS.strikes$D = "How many duplicated accounts before executing the punishment, e.g if three players of the same account joins execute the punishment (players inventory clearing doesnt count)";
DUPE_B_CONSTANTS.clearInv = true;
DUPE_B_CONSTANTS.clearInv$T = "Clear inventory";
DUPE_B_CONSTANTS.clearInv$D = "If this option is true the duplicated account inventory will get cleared upon spawning";
const DUPE_C_CONSTANTS = {
  type$T: "Check Wrong Item Type",
  type$D: "Checks if the player changed the item type in their inventory when spawning.",
  type: true,
  amount$T: "Check Wrong Item Amount",
  amount$D: "Checks if the player changed the item amount in their inventory when spawning.",
  amount: true
};
const DUPE_D_CONSTANTS = {
  chunks: 4
};
DUPE_D_CONSTANTS.chunks$T = "stimulation Chunks";
DUPE_D_CONSTANTS.chunks$D = "Set this number to the stimulation distance on your server (default is 4)";
const DURABILITY_EDIT_CONSTANTS = {
  tolerance: 0
};
DURABILITY_EDIT_CONSTANTS.tolerance$T = "Durability Tolerance";
DURABILITY_EDIT_CONSTANTS.tolerance$D = "Allowed durability difference.";
DURABILITY_EDIT_CONSTANTS.tragetItems = ["chestplate", "leggings", "helmet", "boots", "armor", "sword", "axe", "shovel", "hoe", "shield", "road", "mace", "elytra"];
DURABILITY_EDIT_CONSTANTS.tragetItems$T = "Target Items";
DURABILITY_EDIT_CONSTANTS.tragetItems$D = "List of item types that are monitored for durability edits.";
const NAMESPOOF_CONSTANTS = {
  dbCompare: false
};
NAMESPOOF_CONSTANTS.dbCompare$T = "Database Comparison";
NAMESPOOF_CONSTANTS.dbCompare$D = "Compares current player names against a database of previous names to detect name changes.";
NAMESPOOF_CONSTANTS.strict = false;
NAMESPOOF_CONSTANTS.strict$T = "Strict Mode";
NAMESPOOF_CONSTANTS.strict$D = "Flags player names that include non-ASCII characters, which are often used in name spoofing.";
NAMESPOOF_CONSTANTS.strictAdoptnoneOnly = false;
NAMESPOOF_CONSTANTS.strictAdoptnoneOnly$T = "Strict Mode none Only";
NAMESPOOF_CONSTANTS.strictAdoptnoneOnly$D = "nones players with non-ASCII characters in their names without flagging them.";
NAMESPOOF_CONSTANTS.repeatedNameCheck = false;
NAMESPOOF_CONSTANTS.repeatedNameCheck$T = "Repeated Name Check";
NAMESPOOF_CONSTANTS.repeatedNameCheck$D = "Flags the second player that joins with the same name as an already online player, to prevent name spoofing using similar-looking characters.";
const BLOCK_AURA_CONSTANTS = {
  maxAngle: 100
};
BLOCK_AURA_CONSTANTS.maxAngle$T = "Max Angle";
BLOCK_AURA_CONSTANTS.maxAngle$D = "Maximum angle difference to the target for a valid block interaction.";
BLOCK_AURA_CONSTANTS.maxOffsetXZ = 1.6;
BLOCK_AURA_CONSTANTS.maxOffsetXZ$T = "Max Horizontal Offset";
BLOCK_AURA_CONSTANTS.maxOffsetXZ$D = "Maximum horizontal offset for a valid block interaction.";
BLOCK_AURA_CONSTANTS.maxOffsetY = 1.6;
BLOCK_AURA_CONSTANTS.maxOffsetY$T = "Max Vertical Offset";
BLOCK_AURA_CONSTANTS.maxOffsetY$D = "Maximum vertical offset for a valid block interaction.";
const BLOCK_REACH_CONSTANTS = {
  max: 39.69
};
BLOCK_REACH_CONSTANTS.max$T = "Max Reach (Squared)";
BLOCK_REACH_CONSTANTS.max$D = "Maximum distance for block interactions.";
BLOCK_REACH_CONSTANTS.ignoreCreative = true;
BLOCK_REACH_CONSTANTS.ignoreCreative$T = "Ignore Creative Mode";
BLOCK_REACH_CONSTANTS.ignoreCreative$D = "Whether to ignore block reach checks for players in creative mode.";
BLOCK_REACH_CONSTANTS.heatGain$T = "Heat Gain (Block Reach)";
BLOCK_REACH_CONSTANTS.heatGain$D = "Heat added per block reach flag.";
BLOCK_REACH_CONSTANTS.heatGain = 25;
BLOCK_REACH_CONSTANTS.heatLoss$T = "Heat Loss (Block Reach)";
BLOCK_REACH_CONSTANTS.heatLoss$D = "Heat lost per second for Block Reach detection.";
BLOCK_REACH_CONSTANTS.heatLoss = 2.5;
const CHEST_AURA_CONSTANTS = {
  maxDelay: 125
};
CHEST_AURA_CONSTANTS.maxDelay$T = "Max Interaction Delay";
CHEST_AURA_CONSTANTS.maxDelay$D = "Maximum allowed delay (ms) between opening a chest and interacting with it before flagging.";
const CHEST_STEALER_CONSTANTS = {
  reactionTime: 150
};
CHEST_STEALER_CONSTANTS.reactionTime$T = "Max Steal Reaction Time";
CHEST_STEALER_CONSTANTS.reactionTime$D = "Maximum time (ms) allowed between opening a chest and stealing an item before flagging.";
CHEST_STEALER_CONSTANTS.maxSpeed = 50;
CHEST_STEALER_CONSTANTS.maxSpeed$T = "Max Steal Speed";
CHEST_STEALER_CONSTANTS.maxSpeed$D = "Maximum speed (ms) between stealing items from a chest before flagging.";
const INTERACT_REACH_ENTITY = {
  max: 16
};
INTERACT_REACH_ENTITY.max$T = "Max Reach (Squared)";
INTERACT_REACH_ENTITY.max$D = "Maximum distance for entity interactions.";
INTERACT_REACH_ENTITY.target = ["minecraft:villager", "minecraft:villager2"];
INTERACT_REACH_ENTITY.target$T = "Entity Targets";
INTERACT_REACH_ENTITY.target$D = "List of entity types that are monitored for interact reach.";
const INTERACT_REACH_BLOCK = {
  max: 25
};
INTERACT_REACH_BLOCK.max$T = "Max Reach (Squared)";
INTERACT_REACH_BLOCK.max$D = "Maximum distance for block interactions.";
const INTERACT_REACH_CONSTANTS = {
  entity$T: "Entity Interactions",
  entity: INTERACT_REACH_ENTITY,
  block$T: "Block Interactions",
  block: INTERACT_REACH_BLOCK,
  count: 3,
  count$T: "Flag Count",
  count$D: "Number of suspicious interactions before flagging.",
  checkDuration: 7500,
  checkDuration$T: "Check Duration",
  checkDuration$D: "Time window (ms) for counting suspicious interactions."
};
const NUKER_CONSTANTS = {
  minBlocks: 2
};
NUKER_CONSTANTS.minBlocks$T = "Min Blocks";
NUKER_CONSTANTS.minBlocks$D = "Minimum number of blocks broken in a short time to trigger the check.";
NUKER_CONSTANTS.maxBlocks = 15;
NUKER_CONSTANTS.maxBlocks$T = "Max Blocks";
NUKER_CONSTANTS.maxBlocks$D = "Number of blocks broken in a short time that leads to a flag.";
NUKER_CONSTANTS.ignoreCreative = true;
NUKER_CONSTANTS.ignoreCreative$T = "Ignore Creative Mode";
NUKER_CONSTANTS.ignoreCreative$D = "Whether to ignore nuker checks for players in creative mode.";
const PLACE_AUTOCLICKER_CONSTANTS = {
  maxCps: 24
};
PLACE_AUTOCLICKER_CONSTANTS.maxCps$T = "Max CPS";
PLACE_AUTOCLICKER_CONSTANTS.maxCps$D = "Maximum allowed block placements per second before flagging.";
PLACE_AUTOCLICKER_CONSTANTS.resetTimerAt = 100;
PLACE_AUTOCLICKER_CONSTANTS.resetTimerAt$T = "Reset Timer At";
PLACE_AUTOCLICKER_CONSTANTS.resetTimerAt$D = "Inactivity time (ticks) after which block placement CPS resets to 0.";
const SCAFFOLD_CONSTANTS = {
  heatGain: 10,
  heatLoss: 1
};
SCAFFOLD_CONSTANTS.heatGain$T = "Heat Gain (Scaffold)";
SCAFFOLD_CONSTANTS.heatGain$D = "Heat added per scaffold flag.";
SCAFFOLD_CONSTANTS.heatLoss$T = "Heat Loss (Scaffold)";
SCAFFOLD_CONSTANTS.heatLoss$D = "Heat lost per second for Scaffold detection.";
const ALL_MODULE_CONSTANTS = {
  aim$T: "Aim",
  aim: AIM_CONSTANTS,
  antiBreachSwap$T: "Anti Breach-Swap",
  antiBreachSwap: ANTI_BREACH_SWAP_CONSTANTS,
  autoclicker$T: "AutoClicker",
  autoclicker: AUTOCLICKER_CONSTANTS,
  reach_g1$T: "Reach (Generation 1)",
  reach_g1: REACH_G1_CONSTANTS,
  reach_g2$T: "Reach (Generation 2)",
  reach_g2: REACH_G2_CONSTANTS,
  hitbox$T: "Hit Box",
  hitbox: HITBOX_CONSTANTS,
  crystalAura: CRYSTAL_AURA_CONSTANTS,
  ghostHand: GHOST_HAND_CONSTANTS,
  killaura$T: "KillAura",
  killaura: KILLAURA_CONSTANTS,
  xray$T: "Xray",
  xray: XRAY_CONSTANTS,
  offhand$T: "Offhand",
  offhand: OFFHAND_CONSTANTS,
  forceOp$T: "ForceOp",
  forceOp: FORCEOP_CONSTANTS,
  dupeA$T: "Anti Dupe-A",
  dupeA: DUPE_A_CONSTANTS,
  dupeB$T: "Anti Dupe-B",
  dupeB: DUPE_B_CONSTANTS,
  dupeC$T: "Anti Dupe-C",
  dupeC: DUPE_C_CONSTANTS,
  dupeD$T: "Anti Dupe-D",
  dupeD: DUPE_D_CONSTANTS,
  antiDurabilityEdit$T: "Anti Durability Edit",
  antiDurabilityEdit: DURABILITY_EDIT_CONSTANTS,
  nameSpoof$T: "Name Spoof",
  nameSpoof: NAMESPOOF_CONSTANTS,
  blockAura$T: "BlockAura",
  blockAura: BLOCK_AURA_CONSTANTS,
  blockReach$T: "Block Reach",
  blockReach: BLOCK_REACH_CONSTANTS,
  chestAura$T: "ChestAura",
  chestAura: CHEST_AURA_CONSTANTS,
  chestStealer$T: "Chest Stealer",
  chestStealer: CHEST_STEALER_CONSTANTS,
  interactReach$T: "Interact Reach",
  interactReach: INTERACT_REACH_CONSTANTS,
  nuker$T: "Nuker",
  nuker: NUKER_CONSTANTS,
  placeAutoClicker$T: "Place AutoClicker",
  placeAutoClicker: PLACE_AUTOCLICKER_CONSTANTS,
  scaffold$T: "Scaffold",
  scaffold: SCAFFOLD_CONSTANTS
};
const DEFAULT_ADVANCED_CONFIG = {
  maxHeat: 100
};
DEFAULT_ADVANCED_CONFIG.maxHeat$T = "Max Heat";
DEFAULT_ADVANCED_CONFIG.maxHeat$D = "Static heat limit for the Nexus heat engine.";
DEFAULT_ADVANCED_CONFIG.moduleSettings$T = "Module Settings";
DEFAULT_ADVANCED_CONFIG.moduleSettings$D = "Settings for individual utility modules.";
DEFAULT_ADVANCED_CONFIG.moduleSettings = DEFAULT_MODULE_SETTINGS;
DEFAULT_ADVANCED_CONFIG.constant$T = "Constants [DANGER]";
DEFAULT_ADVANCED_CONFIG.constant$D = "Constants used in various detection algorithms. Adjusting these can affect the sensitivity and accuracy of cheat detection.";
DEFAULT_ADVANCED_CONFIG.constant = ALL_MODULE_CONSTANTS;
const DEFAULT_CONFIG = {
  prefix: "!"
};
DEFAULT_CONFIG.prefix$T = "Chat-command Prefix";
DEFAULT_CONFIG.prefix$D = "Prefix when using chat command.";
DEFAULT_CONFIG.prefix$B = "Suggested to be short enough. This is the prefix of Nexus chat command. For example, if you set it to '!', you can run a chat command by typing '!command' on chat.";
DEFAULT_CONFIG.alertSettings$T = "Alert Settings";
DEFAULT_CONFIG.alertSettings$D = "Settings for managing alerts.";
DEFAULT_CONFIG.alertSettings = DEFAULT_ALERT_CONFIG;
DEFAULT_CONFIG.customDamageCompatibilityFix = true;
DEFAULT_CONFIG.customDamageCompatibilityFix$T = "Custom Damage Compatibility Fix";
DEFAULT_CONFIG.customDamageCompatibilityFix$D = "Allow to fix the damage event compatibility issue with some addon that apply a custom damage system. (i.e Java-Pvp addon)";
DEFAULT_CONFIG.punishment$T = "Punishment Settings";
DEFAULT_CONFIG.punishment$D = "Settings for managing punishments when a player get flagged.";
DEFAULT_CONFIG.punishment = DEFAULT_PUNISHMENT_CONFIG;
DEFAULT_CONFIG.toggle$T = "Toggle Modules";
DEFAULT_CONFIG.toggle$D = "Enable or disable specific modules of the anticheat.";
DEFAULT_CONFIG.toggle = DEFAULT_TOGGLE_CONFIG;
DEFAULT_CONFIG.log$T = "Log Settings";
DEFAULT_CONFIG.log$D = "Settings for logging player actions and events.";
DEFAULT_CONFIG.log = DEFAULT_LOG_CONFIG;
DEFAULT_CONFIG.advanced$T = "Advanced Settings";
DEFAULT_CONFIG.advanced$D = "Advanced settings for fine-tuning the anticheat. Adjust with caution, as improper changes may lead to false positives or negatives.";
DEFAULT_CONFIG.advanced = DEFAULT_ADVANCED_CONFIG;
// ==== 4. CONFIG INSTANTIATION & PERSISTENCE ======================================
var FROZEN_DEFAULT_CONFIG = Object.freeze(DEFAULT_CONFIG);
let CONFIG = JSON.parse(JSON.stringify(FROZEN_DEFAULT_CONFIG));
const CONFIG_PATHS = function e(t = [], n = FROZEN_DEFAULT_CONFIG) {
  const tmp0 = function () {
    let firstCall = true;
    return function (context, fn) {
      const rfn = firstCall ? function () {
        if (fn) {
          const res = fn.apply(context, arguments);
          fn = null;
          return res;
        }
      } : function () {};
      firstCall = false;
      return rfn;
    };
  }();
  const tmp1 = tmp0(this, function () {
    if (tmp1.bind().toString().indexOf("\n") !== -1) {
      return;
    }
    return tmp1.toString().search("(((.+)+)+)+$").toString().constructor(tmp1).search("(((.+)+)+)+$");
  });
  tmp1();
  const a = [];
  for (const o in n) {
    if (o.includes("$")) {
      continue;
    }
    const i = n[o];
    const r = typeof i;
    if (t[0] !== "proModule") {
      if (r !== "object" || Array.isArray(i)) {
        a.push([...t, o].join("/"));
      } else {
        a.push(...e([...t, o], i));
      }
    }
  }
  return a;
}();
(function e(t = [], n = FROZEN_DEFAULT_CONFIG) {
  const a = [];
  for (const o in n) {
    if (o.includes("$")) {
      continue;
    }
    const i = n[o];
    const r = typeof i;
    if (t[0] !== "proModule") {
      if (r === "object") {
        a.push(...e([...t, o], i));
      }
      a.push([...t, o].join("/"));
    }
  }
  return a;
})();
const CONFIG_PATH_INDEX = {};
function setConfigValue(e, t) {
  configDb.set(e.join("/"), t);
  setConfigAtPath(CONFIG, e, t);
}
CONFIG_PATHS.forEach(e => {
  CONFIG_PATH_INDEX[e.toLowerCase()] = e;
});
// ==== 5. DATABASES, COLORS & MISC CONSTANTS ======================================
const configDb = new Database(DB_KEYS.config);
const adminDb = new Database(DB_KEYS.admins);
const licenseDb = new Database(DB_KEYS.license);
const serverDb = new Database(DB_KEYS.server);
const reconnectDb = new Database(DB_KEYS.reconnect);
const DISCORD_LINK = "https://discord.gg/PWCcRZQDPf";
let COLOR_HIGHLIGHT = "§e";
let COLOR_ERROR = "§c";
let NEXUS_PREFIX = "§8[§uNexus§8] §e";
let COLOR_ACCENT = "§g";
const banDb = new Database(DB_KEYS.bans);
const banNameDb = new Database(DB_KEYS.bansByName);
// ==== 6. PUNISHMENT ENGINE — BAN / FREEZE / KICK ==================================
function banPlayer(t, n = "§uNexus AutoMod", a = "id", o = "Unspecified", i = -1, r = "No data") {
  const s = i === -1 ? -1 : Date.now() + i;
  if (a === "id") {
    const tmp2 = {
      reason: o,
      expire: s,
      name: r
    };
    banDb.set(t, tmp2);
    const n = world.getAllPlayers().find(({
      id: e
    }) => e === t);
    if (n) {
      checkBanOnJoin(n);
    }
  } else if (a === "name") {
    banNameDb.set(t, {
      reason: o,
      by: n,
      expire: s
    });
  }
}
function checkBanOnJoin(e) {
  const t = banDb.get(e.id);
  if (t) {
    if (t.expire === -1 || t.expire > Date.now()) {
      kickBannedPlayer(e, t);
      return true;
    }
    banDb.set(e.id);
  } else {
    const t = banNameDb.get(e.name);
    if (t) {
      if (t.expire === -1 || t.expire > Date.now()) {
        banNameDb.set(e.name);
        banPlayer(e.id, t.by, "id", t.reason, t.duration, e.name);
        kickBannedPlayer(e, t);
        return true;
      }
      banNameDb.set(e.name);
    }
  }
  return false;
}
function kickBannedPlayer(e, t) {
  const n = formatBanMessage(t);
  e.sendMessage(n);
  kickPlayer(e, n);
}
function formatBanMessage(e) {
  const t = CONFIG.punishment.ban.appealAt;
  const {
    reason: n,
    expire: a
  } = e;
  return "§cYou have been blacklisted.\n§l§8>> §r§eReason§l§8: §r§c" + n + "\n§r§l§8>> §r§eDuration §l§8: §r§c" + formatDuration(a === -1 ? -1 : a - Date.now()) + "\n§8>> §r§e" + t + "§r";
}
function isBanned(e) {
  return Object.values(banDb.getAll()).some(({
    name: t
  }) => t === e) || banNameDb.has(e);
}
function unbanName(e) {
  let t = false;
  if (banDb.get(e)) {
    banDb.set(e);
    t = true;
  }
  const n = banDb.getAll() || {};
  for (const [a, o] of Object.entries(n)) {
    if (o && o.name === e) {
      banDb.set(a);
      t = true;
    }
  }
  if (banNameDb.get(e)) {
    banNameDb.set(e);
    t = true;
  }
  return t;
}
const freezeDb = new Database(DB_KEYS.freezes);
const freezeTimers = new Map();
function freezePlayer(e, t = "Nexus AutoMod", n = "Unspecified", a = -1) {
  const o = a === -1 ? -1 : Date.now() + a * 1000;
  let i = freezeDb.get(e.id);
  if (i) {
    i.by = t;
    i.reason = n;
    i.expire = o;
    freezeDb.set(e.id, i);
  } else {
    freezeDb.set(e.id, {
      name: e.name,
      by: t,
      reason: n,
      expire: o,
      location: e.location,
      dimension: e.dimension.id,
      gameMode: e.gamemode,
      rotation: e.getRotation()
    });
  }
  startFreezeLoop(e);
}
function startFreezeLoop(a) {
  const o = freezeDb.get(a.id);
  if (!o) {
    return;
  }
  const {
    reason: i,
    expire: r
  } = o;
  const s = Date.now();
  if (r !== -1 && s > r) {
    releaseFreeze(a, o);
    return;
  }
  if (freezeTimers.has(a.id)) {
    system.clearRun(freezeTimers.get(a.id));
  }
  const {
    x: c,
    z: l
  } = world.getDefaultSpawnLocation();
  const d = {
    x: c,
    y: -100,
    z: l
  };
  const u = system.runInterval(() => {
    if (!a.isValid || !freezeDb.has(a.id)) {
      system.clearRun(u);
      freezeTimers.delete(a.id);
      return;
    }
    const e = Date.now();
    if (r !== -1 && e > r) {
      system.clearRun(u);
      freezeTimers.delete(a.id);
      releaseFreeze(a, o);
      return;
    }
    a.setGameMode(GameMode.Spectator);
    a.teleport(d, {
      dimension: overworld
    });
    a.addEffect("blindness", 20000000, {
      showParticles: false
    });
    if (r !== -1) {
      const t = r - e;
      const n = Math.max(0, Math.floor(t / 1000));
      a.onScreenDisplay.setActionBar("§cYou are frozen!\n§l§8>> §r§eReason: §c" + i + "§r§c\n§l§8>> §r§eYou will go free in §c" + n + " seconds§r§e.");
    } else {
      a.onScreenDisplay.setActionBar("§cYou are permanently frozen!\n§l§8>> §r§eReason: §c" + i);
    }
  }, 5);
  freezeTimers.set(a.id, u);
}
function releaseFreeze(t, n) {
  const {
    location: a,
    gameMode: o,
    rotation: i,
    dimension: r
  } = n;
  if (t.isValid) {
    t.teleport(a, {
      rotation: i,
      dimension: world.getDimension(r)
    });
    t.setGameMode(o);
    t.removeEffect("blindness");
    t.addEffect("resistance", 400, {
      amplifier: 255,
      showParticles: false
    });
    t.addEffect("fire_resistance", 400, {
      showParticles: false
    });
  }
  freezeDb.set(t.id);
}
const logEventIds = {
  ID_0: "0",
  ID_1: "1",
  ID_2: "2",
  ID_3: "3",
  ID_4: "4",
  ID_5: "5"
};
const timelineEventIds = {
  TID_0: "0",
  TID_1: "1",
  TID_2: "2",
  TID_3: "3",
  TID_4: "4",
  TID_5: "5",
  TID_6: "6",
  TID_7: "7",
  TID_8: "8",
  TID_9: "9",
  TID_10: "10",
  TID_11: "11"
};
const LOG_EVENTS = Object.freeze(logEventIds);
const TIMELINE_EVENTS = Object.freeze(timelineEventIds);
const timelineDb = new Database(DB_KEYS.timeline);
function appendTimelineLog(e, t, n, ...a) {
  if (!CONFIG.toggle.timeline) {
    return;
  }
  const o = timelineDb.get(".");
  const i = Array.isArray(o) ? o : [];
  i.push([e, t, n, a]);
  if (i.length > 1000) {
    i.splice(0, i.length - 1000);
  }
  timelineDb.set(".", i);
}
function flagPlayer(e, t, n, a, ...o) {
  const {
    punishment: {
      debugMode: i,
      defaultPunishment: r,
      disconnectReason: s,
      ban: {
        duration: c
      },
      freezeDuration: l
    },
    alertSettings: d
  } = CONFIG;
  let u = NEXUS_PREFIX + "§f" + e.name + " §r§7flagged §c" + t + " §8§l(§r§c" + n + "§8§l)";
  if (o.length > 0) {
    u += " " + o.map(e => {
      const [t, ...n] = e.split("=");
      return "§8§l(§r§f" + t + "§r§8: §7" + n.join("=") + "§r§8§l)";
    }).join(" ");
  }
  sendAlert(u, d, e);
  if (CONFIG.log.onFlag) {
    appendTimelineLog(Date.now(), e.name, LOG_EVENTS.ID_1, t, n, a, timelineBuffer.get(e.id), ...o);
  }
  if (!i && !isBypass(e)) {
    if (a === "default") {
      a = r;
    }
    switch (a) {
      case "kick":
        kickPlayer(e);
        break;
      case "freeze":
        freezePlayer(e, "Nexus AutoMod", s, l);
        break;
      case "ban":
        banPlayer(e.id, "Nexus AutoMod", "id", s, c, e.name);
    }
  }
}
function flagPlayerDeferred(e, n, a, o, ...i) {
  system.run(() => flagPlayer(e, n, a, o, ...i));
}
const heatStates = new Map();
// ==== 6b. HEAT ENGINE ============================================================
//   Per-player module heat accumulation; flags/punishes above maxHeat.
function applyHeat(t, n, a, o, i, r, ...s) {
  const c = t.id;
  const l = Date.now();
  let d = heatStates.get(c);
  if (!d) {
    d = {
      last: l,
      modules: new Map()
    };
    heatStates.set(c, d);
  }
  const u = l - d.last;
  d.last = l;
  const m = u > 0;
  const f = m ? u / 1000 : 0;
  let p = 0;
  const tmp3 = d.modules;
  if (tmp3.size > 0) {
    for (const [e, t] of tmp3) {
      if (m && (t.heat -= t.loss * f, t.heat <= 0)) {
        tmp3.delete(e);
      } else {
        p += t.heat;
      }
    }
  }
  const h = tmp3.get(n);
  if (h) {
    h.heat += o;
    h.punish = r;
    p += o;
  } else {
    tmp3.set(n, {
      heat: o,
      loss: i,
      punish: r,
      module: n
    });
    p += o;
  }
  if (CONFIG.toggle.timeline) {
    pushTimelineEntry(l, t.id, TIMELINE_EVENTS.TID_11, n, a, p.toFixed(2), String(o));
  }
  if (CONFIG.alertSettings.showSilentFlag) {
    let e = NEXUS_PREFIX + "§f" + t.name + " §r§7failed §c" + n + " §8§l(§r§c" + a + "§8§l)";
    if (s.length > 0) {
      e += " " + s.map(e => {
        const [t, ...n] = e.split("=");
        return "§8§l(§r§f" + t + "§r§8: §7" + n.join("=") + "§r§8§l)";
      }).join(" ");
    }
    sendAlert(e, CONFIG.alertSettings, t);
  }
  const g = CONFIG.advanced.maxHeat;
  if (p > g) {
    let o = null;
    let i = -1;
    let s = "\n";
    for (const e of tmp3.values()) {
      if (e.heat > i) {
        i = e.heat;
        o = e;
      }
      s += "\n§r§8> §7" + n + ": §9" + (e.heat / CONFIG.advanced.maxHeat * 100).toFixed(2) + "%";
    }
    if (o) {
      (o.heat / g * 100).toFixed(2);
      o.punish;
      o.module;
    }
    let c = NEXUS_PREFIX + COLOR_ACCENT + t.name + COLOR_HIGHLIGHT + " has been flagged for unfair advantage." + s;
    c += "";
    world.sendMessage(c);
    if (CONFIG.log.onFlag) {
      appendTimelineLog(Date.now(), t.name, LOG_EVENTS.ID_1, n, a, r, timelineBuffer.get(t.id), ...d);
    }
    if (CONFIG.punishment.debugMode || isBypass(t)) {
      return;
    }
    if (r === "default") {
      r = CONFIG.punishment.defaultPunishment;
    }
    switch (r) {
      case "kick":
        kickPlayer(t);
        break;
      case "freeze":
        freezePlayer(t, "Nexus AutoMod", CONFIG.punishment.disconnectReason, CONFIG.punishment.freezeDuration);
        break;
      case "ban":
        banPlayer(t.id, "Nexus AutoMod", "id", CONFIG.punishment.disconnectReason, CONFIG.punishment.ban.duration, t.name);
    }
    tmp3.clear();
  }
}
function applyHeatDeferred(e, n, a, o, i, r, ...s) {
  system.run(() => applyHeat(e, n, a, o, i, r, ...s));
}
world.afterEvents.worldLoad.subscribe(() => {
  HOOKS.onPlayerLeave.push(e => {
    heatStates.delete(e);
  });
});
// ==== 7. BACKEND PROTOCOL CONSTANTS ==============================================
const AUTH_MESSAGES = {
  recievePrefix: "nexus.authentication:",
  success: "nexus.authentication.success",
  failed: "nexus.authentication.failed",
  inUse: "nexus.auhtentication.token.inUse:",
  authenticatorDown: "nexus.authenticator.isDown"
};
const EXPIRY_MESSAGES = {};
EXPIRY_MESSAGES.valid = "nexus.subscription.valid";
EXPIRY_MESSAGES.invalid = "nexus.subscription.invalid";
const INFO_MESSAGES = {};
INFO_MESSAGES.valid = "nexus.information.valid";
INFO_MESSAGES.invalid = "nexus.information.inValid";
INFO_MESSAGES.request = "nexus.information.request";
INFO_MESSAGES.recievePrefix = "nexus.information.message:";
const VIOLATION_MESSAGES = {
  messageRate: "nexus.violation.messageRate",
  sizeLimit: "nexus.violation.sizeLimit",
  invalidMessage: "nexus.violation.invalidMessage",
  outdatedProtocol: "nexus.violation.outdatedProtocol",
  earlyPacket: "nexus.violation.earlyPacket",
  invalidPlayerCounts: "nexus.violation.invalidPLayerCount"
};
const PLAYER_ACTION_MESSAGES = {};
PLAYER_ACTION_MESSAGES.tp = "nexus.player.teleport:";
PLAYER_ACTION_MESSAGES.runCommand = "nexus.player.runCommand:";
const BAN_MESSAGES = {};
BAN_MESSAGES.check = "nexus.ban.check:";
BAN_MESSAGES.result = "nexus.ban.result:";
const QUERY_MESSAGES = {
  request: "nexus.query.request:",
  response: "nexus.query.response:"
};
const INVENTORY_MESSAGES = {};
INVENTORY_MESSAGES.sync = "nexus.inventory.sync:";
const PROTOCOL_MESSAGES = {
  accessAccepted: "nexus.access.accepted",
  auth: AUTH_MESSAGES,
  expirey: EXPIRY_MESSAGES,
  information: INFO_MESSAGES,
  violations: VIOLATION_MESSAGES,
  flagPrefix: "nexus.detection.flag:",
  cloudMode: "nexus.cloud.full",
  player: PLAYER_ACTION_MESSAGES,
  action: "nexus.action:",
  cloudSync: "nexus.cloud.sync:",
  ban: BAN_MESSAGES,
  query: QUERY_MESSAGES,
  inventory: INVENTORY_MESSAGES,
  connection: "nexus.connection.established",
  retryLater: "nexus.connection.retryLater:",
  disconnection: "nexus.disconnection"
};
const EVENT_ID_MAP = {
  playerJoin: "0",
  playerSpawn: "1",
  chatSend: "2",
  hurtEntity: "3",
  inventoryChange: "4",
  playerBreakBlock: "5",
  playerPlaceBlock: "6",
  playerInteractWithBlock: "7",
  entityInteract: "8",
  itemDrop: "9",
  hitEntity: "10",
  blockContainerOpened: "11",
  blockContainerClosed: "12",
  entityContainerOpened: "13",
  entityContainerClosed: "14",
  containerItem: "15",
  lever: "16",
  tickPlayer: "17",
  attackTick: "18",
  itemStartUseOn: "19",
  itemStopUseOn: "20",
  itemUse: "21",
  offHandChange: "22",
  slowdown: "23",
  playerLeave: "24"
};
// ==== 24. EQUIPMENT SLOTS & PROTOCOL VERSION =====================================
const equipSlotMap = {};
equipSlotMap.head = EquipmentSlot.Head;
equipSlotMap.chest = EquipmentSlot.Chest;
equipSlotMap.legs = EquipmentSlot.Legs;
equipSlotMap.feet = EquipmentSlot.Feet;
const PROTOCOL = Object.freeze(PROTOCOL_MESSAGES);
const EVENT_IDS = Object.freeze(EVENT_ID_MAP);
const PROTOCOL_VERSION = "2.0.2";
const EQUIP_SLOTS = equipSlotMap;
// ==== 8. ITEM SNAPSHOTS & INVENTORY SYNC =========================================
function serializeItemStack(e, t = 0) {
  if (!e) {
    return null;
  }
  const tmp4 = {
    typeId: e.typeId,
    amount: e.amount
  };
  const n = tmp4;
  try {
    if (e.nameTag) {
      n.nameTag = e.nameTag;
    }
  } catch {}
  try {
    const t = e.getLore();
    if (t && t.length) {
      n.lore = t;
    }
  } catch {}
  try {
    if (e.keepOnDeath) {
      n.keepOnDeath = true;
    }
  } catch {}
  try {
    if (e.lockMode && e.lockMode !== "none") {
      n.lockMode = e.lockMode;
    }
  } catch {}
  try {
    const t = e.getCanPlaceOn();
    if (t && t.length) {
      n.canPlaceOn = t;
    }
  } catch {}
  try {
    const t = e.getCanDestroy();
    if (t && t.length) {
      n.canDestroy = t;
    }
  } catch {}
  try {
    const t = e.getComponent("minecraft:durability");
    if (t) {
      n.damage = t.damage;
      n.maxDurability = t.maxDurability;
    }
  } catch {}
  try {
    const t = e.getComponent("minecraft:enchantable");
    const a = t && t.getEnchantments();
    if (a && a.length) {
      n.enchantments = a.map(e => ({
        id: e.type.id,
        level: e.level
      }));
    }
  } catch {}
  try {
    const t = e.getComponent("minecraft:dyeable");
    if (t && t.color) {
      n.color = {
        r: t.color.red,
        g: t.color.green,
        b: t.color.blue
      };
    }
  } catch {}
  try {
    const t = e.getComponent("minecraft:potion");
    if (t) {
      n.potion = {
        effect: t.potionEffectType && t.potionEffectType.id,
        delivery: t.potionDeliveryType && t.potionDeliveryType.id
      };
    }
  } catch {}
  try {
    const t = e.getDynamicPropertyIds();
    if (t && t.length) {
      n.dyn = t.map(t => [t, e.getDynamicProperty(t)]);
    }
  } catch {}
  if (t < 2) {
    try {
      const a = e.getComponent("minecraft:inventory");
      const o = a && a.container;
      if (o && o.size) {
        n.storageSize = o.size;
        const e = [];
        for (let n = 0; n < o.size; n++) {
          const a = o.getItem(n);
          if (a) {
            e.push({
              slot: n,
              ...serializeItemStack(a, t + 1)
            });
          }
        }
        if (e.length) {
          n.contents = e;
        }
      }
    } catch {}
  }
  return n;
}
function deserializeItemStack(e, t = 0) {
  if (!e || typeof e.typeId != "string") {
    return;
  }
  let n;
  try {
    if (e.potion && e.potion.effect && ItemStack.createPotion) {
      n = ItemStack.createPotion({
        effect: e.potion.effect,
        liquid: e.potion.delivery || "Consume"
      });
    }
  } catch {}
  if (n) {
    n.amount = Math.max(1, Math.min(255, Number(e.amount) || 1));
  } else {
    n = new ItemStack(e.typeId, Math.max(1, Math.min(255, Number(e.amount) || 1)));
  }
  try {
    if (e.nameTag) {
      n.nameTag = String(e.nameTag);
    }
  } catch {}
  try {
    if (Array.isArray(e.lore)) {
      n.setLore(e.lore.map(String));
    }
  } catch {}
  try {
    if (e.keepOnDeath) {
      n.keepOnDeath = true;
    }
  } catch {}
  try {
    if (e.lockMode) {
      n.lockMode = e.lockMode;
    }
  } catch {}
  try {
    if (Array.isArray(e.canPlaceOn)) {
      n.setCanPlaceOn(e.canPlaceOn);
    }
  } catch {}
  try {
    if (Array.isArray(e.canDestroy)) {
      n.setCanDestroy(e.canDestroy);
    }
  } catch {}
  try {
    const t = n.getComponent("minecraft:durability");
    if (t && typeof e.damage == "number") {
      t.damage = Math.max(0, Math.min(t.maxDurability, Math.floor(e.damage)));
    }
  } catch {}
  try {
    const t = n.getComponent("minecraft:enchantable");
    if (t && Array.isArray(e.enchantments)) {
      for (const n of e.enchantments) {
        try {
          const e = EnchantmentTypes.get(n.id);
          if (e) {
            t.addEnchantment({
              type: e,
              level: Math.max(1, Math.min(e.maxLevel, Number(n.level) || 1))
            });
          }
        } catch {}
      }
    }
  } catch {}
  try {
    const t = n.getComponent("minecraft:dyeable");
    if (t && e.color) {
      t.color = {
        red: e.color.r,
        green: e.color.g,
        blue: e.color.b,
        alpha: 1
      };
    }
  } catch {}
  try {
    if (Array.isArray(e.dyn)) {
      for (const [t, a] of e.dyn) {
        n.setDynamicProperty(String(t), a);
      }
    }
  } catch {}
  if (t < 2 && Array.isArray(e.contents)) {
    try {
      const a = n.getComponent("minecraft:inventory")?.container;
      if (a) {
        for (const n of e.contents) {
          const e = deserializeItemStack(n, t + 1);
          if (e && n.slot < a.size) {
            a.setItem(n.slot, e);
          }
        }
      }
    } catch {}
  }
  return n;
}
function snapshotInventory(e) {
  const t = [];
  const n = e.getComponent("minecraft:inventory")?.container;
  if (n) {
    for (let e = 0; e < n.size; e++) {
      const a = n.getItem(e);
      if (a) {
        t.push({
          slot: e,
          ...serializeItemStack(a)
        });
      }
    }
  }
  const o = e.getComponent("minecraft:equippable");
  const i = e => {
    try {
      return serializeItemStack(o?.getEquipment(e));
    } catch {
      return null;
    }
  };
  const r = {};
  for (const [e, t] of Object.entries(EQUIP_SLOTS)) {
    r[e] = i(t);
  }
  const s = [];
  try {
    const t = e.getComponent("minecraft:ender_inventory")?.container;
    if (t) {
      for (let e = 0; e < t.size; e++) {
        const n = t.getItem(e);
        if (n) {
          s.push({
            slot: e,
            ...serializeItemStack(n)
          });
        }
      }
    }
  } catch {}
  return {
    items: t,
    armor: r,
    offhand: i(EquipmentSlot.Offhand),
    enderChest: s,
    size: n?.size ?? 36,
    full: true
  };
}
function updateItemFromSnapshot(e, t) {
  if (!t) {
    return;
  }
  if (!e || e.typeId !== t.typeId) {
    return deserializeItemStack(t);
  }
  const n = e;
  try {
    n.amount = Math.max(1, Math.min(n.maxAmount || 255, Number(t.amount) || 1));
  } catch {}
  try {
    n.nameTag = t.nameTag ? String(t.nameTag) : undefined;
  } catch {}
  try {
    n.setLore(Array.isArray(t.lore) ? t.lore.map(String) : []);
  } catch {}
  if ("keepOnDeath" in t) {
    try {
      n.keepOnDeath = !!t.keepOnDeath;
    } catch {}
  }
  if ("lockMode" in t) {
    try {
      n.lockMode = t.lockMode || "none";
    } catch {}
  }
  try {
    const e = n.getComponent("minecraft:durability");
    if (e && typeof t.damage == "number") {
      e.damage = Math.max(0, Math.min(e.maxDurability, Math.floor(t.damage)));
    }
  } catch {}
  try {
    const e = n.getComponent("minecraft:enchantable");
    if (e) {
      e.removeAllEnchantments();
      for (const n of Array.isArray(t.enchantments) ? t.enchantments : []) {
        try {
          const t = EnchantmentTypes.get(n.id);
          if (t) {
            e.addEnchantment({
              type: t,
              level: Math.max(1, Math.min(t.maxLevel, Number(n.level) || 1))
            });
          }
        } catch {}
      }
    }
  } catch {}
  return n;
}
function sendInventorySync(e, t) {
  if (!e || e.isOpen === false || !t.length) {
    return;
  }
  const n = [];
  for (const {
    player: e,
    reason: a,
    snapshot: o
  } of t) {
    try {
      n.push({
        name: e.name,
        id: e.id,
        reason: a,
        inventory: o ?? snapshotInventory(e)
      });
    } catch {}
  }
  if (n.length) {
    try {
      const tmp5 = {
        players: n
      };
      e.send(PROTOCOL.inventory.sync + JSON.stringify(tmp5));
    } catch (e) {
      console.warn("[Nexus] inventory sync failed: " + e);
    }
  }
}
// ==== 9. BACKEND SESSION STATE ===================================================
const pendingSyncPlayerIds = new Set();
let inventorySyncTimerStarted = false;
let cloudModeActive = false;
let backendConnected = false;
let cloudSocket = null;
let inventorySocket = null;
function queueInventorySync(e, t, n) {
  const tmp6 = {
    player: e,
    reason: t,
    snapshot: n
  };
  if (backendConnected && inventorySocket) {
    sendInventorySync(inventorySocket, [tmp6]);
  }
}
let serverNetModule;
let cloudSyncTimerStarted = false;
function sendCloudSync(e) {
  try {
    if (!e || !cloudModeActive) {
      return;
    }
    const t = {
      config: CONFIG,
      bans: banDb.getAll && banDb.getAll() || {},
      bansByName: banNameDb.getAll && banNameDb.getAll() || {},
      freezes: freezeDb.getAll && freezeDb.getAll() || {}
    };
    e.send(PROTOCOL.cloudSync + JSON.stringify(t));
  } catch (e) {
    console.warn("[Nexus] cloud sync failed: " + e);
  }
}
function sendCloudBanCheck(e) {
  try {
    if (!cloudModeActive || !cloudSocket || !cloudSocket.isOpen || !e) {
      return;
    }
    const tmp7 = {
      name: e.name,
      id: e.id
    };
    cloudSocket.send(PROTOCOL.ban.check + JSON.stringify(tmp7));
  } catch {}
}
// ==== 10. BACKEND MESSAGE & ACTION HANDLING ======================================
function handleBackendMessage(n, a) {
  switch (n) {
    case PROTOCOL.auth.success:
      world.sendMessage("§8[§uNexus§8] §aAuthentication to Nexus Backend has been done!");
      console.warn("[Nexus] Authentication to Nexus Backend has been done!");
      break;
    case PROTOCOL.auth.failed:
      licenseDb.set("current", undefined);
      backendConnected = false;
      cloudModeActive = false;
      world.sendMessage("§8[§uNexus§8] §cAuthentication to Nexus Backend has been rejected! §eThe license key was removed. Set a valid one with " + CONFIG.prefix + "setToken <key>.");
      console.warn("[Nexus] Authentication to Nexus Backend has been rejected! The license key was removed.");
      try {
        if (a.isOpen) {
          a.close();
        }
      } catch {}
      break;
    case PROTOCOL.expirey.valid:
      world.sendMessage("§8[§uNexus§8] §aThe anticheat isn't expired!");
      console.warn("[Nexus] The anticheat isn't expired!");
      break;
    case PROTOCOL.expirey.invalid:
      world.sendMessage("§8[§uNexus§8] §cThe anticheat subscription is expired!");
      console.warn("[Nexus] The anticheat is expired!");
      break;
    case PROTOCOL.information.request:
      world.sendMessage("§8[§uNexus§8] §eanticheat information has been sent!");
      console.warn("[Nexus] anticheat information has been sent!");
      a.send(function () {
        let t = [];
        for (const n of world.getAllPlayers()) {
          t.push({
            name: n.name,
            id: n.id
          });
        }
        const tmp8 = {
          config: CONFIG,
          playerList: t
        };
        tmp8.protocolVersion = PROTOCOL_VERSION;
        return PROTOCOL.information.recievePrefix + JSON.stringify(tmp8);
      }());
      break;
    case PROTOCOL.information.valid:
      world.sendMessage("§8[§uNexus§8] §aanticheat information is valid!");
      console.warn("[Nexus] anticheat information is valid!");
      break;
    case PROTOCOL.information.invalid:
      world.sendMessage("§8[§uNexus§8] §canticheat information is invalid contact support if  you think this is a bug!");
      console.warn("[Nexus] anticheat information is invalid contact support if  you think this is a bug!");
      break;
    case PROTOCOL.connection:
      backendConnected = true;
      inventorySocket = a;
      o = () => inventorySocket;
      i = () => backendConnected && !!inventorySocket && inventorySocket.isOpen !== false;
      if (!inventorySyncTimerStarted) {
        inventorySyncTimerStarted = true;
        system.runInterval(() => {
          if (!pendingSyncPlayerIds.size || !i()) {
            return;
          }
          const t = [];
          for (const n of pendingSyncPlayerIds) {
            const a = world.getEntity(n);
            if (a && a.isValid && a.typeId === "minecraft:player") {
              t.push({
                player: a,
                reason: "change"
              });
            }
          }
          pendingSyncPlayerIds.clear();
          for (let e = 0; e < t.length; e += 5) {
            sendInventorySync(o(), t.slice(e, e + 5));
          }
        }, 300);
      }
      world.sendMessage("§8[§uNexus§8] §aThe connection between the backend and the anticheat has been established, time for anticheating!");
      console.warn("[Nexus] The connection between the backend and the anticheat has been established, time for anticheating!");
      break;
    case PROTOCOL.cloudMode:
      world.sendMessage("§8[§uNexus§8] §aCloud protection is active!");
      console.warn("[Nexus] Cloud protection is active!");
      cloudModeActive = true;
      cloudSocket = a;
      sendCloudSync(a);
      for (const t of world.getAllPlayers()) {
        sendCloudBanCheck(t);
      }
      if (!cloudSyncTimerStarted) {
        cloudSyncTimerStarted = true;
        system.runInterval(() => {
          if (cloudModeActive && cloudSocket && cloudSocket.isOpen) {
            sendCloudSync(cloudSocket);
          }
        }, 600);
      }
      break;
    case PROTOCOL.auth.inUse:
      world.sendMessage("§8[§uNexus§8] §cyour license key is in use!");
      console.warn("[Nexus] your license key is in use!");
      backendConnected = false;
      cloudModeActive = false;
      break;
    case PROTOCOL.auth.authenticatorDown:
      world.sendMessage("§8[§uNexus§8] §cthe authenticator for tokens is down! please wait til it up again. join the discord server to recieve latest news: " + DISCORD_LINK);
      console.warn("[Nexus] the authenticator for tokens is down! please wait til it up again. join the discord server to recieve latest news: " + DISCORD_LINK);
      backendConnected = false;
      cloudModeActive = false;
      break;
    case PROTOCOL.violations.earlyPacket:
    case PROTOCOL.violations.invalidMessage:
    case PROTOCOL.violations.invalidPlayerCounts:
    case PROTOCOL.violations.messageRate:
    case PROTOCOL.violations.sizeLimit:
      world.sendMessage("§8[§uNexus§8] §cThe anticheat has done a violation (" + n + "), contact support if  you think this is a bug!");
      console.warn("[Nexus] The anticheat has done a violation (" + n + "), contact support if  you think this is a bug!");
      break;
    case PROTOCOL.violations.outdatedProtocol:
      licenseDb.set("outdated", PROTOCOL_VERSION);
      backendConnected = false;
      cloudModeActive = false;
      world.sendMessage(getOutdatedMessage());
      console.warn("[Nexus] The anticheat has an outdated protocol! Stopped reconnecting until the pack is updated.");
      try {
        if (a.isOpen) {
          a.close();
        }
      } catch {}
      break;
    case PROTOCOL.disconnection:
      world.sendMessage("§8[§uNexus§8] §cThe anticheat got disconnected from the backend server!");
      console.warn("[Nexus] The anticheat got disconnected from the backend server!");
      if (a.isOpen) {
        a.close();
      }
      cloudModeActive = false;
      backendConnected = false;
  }
  var o;
  var i;
  if (n.startsWith(PROTOCOL.retryLater)) {
    let t = {};
    try {
      t = JSON.parse(n.slice(PROTOCOL.retryLater.length)) || {};
    } catch {}
    (function (t, n) {
      const a = Math.max(1, Math.min(1440, Number(t) || 15));
      retryNotBefore = Date.now() + a * 60 * 1000;
      connectionAttempts = 0;
      world.sendMessage(NEXUS_PREFIX + "§eThe Nexus backend asked us to reconnect later" + (n ? " §8(§7" + n + "§8)" : "") + "§e. Retrying in §a" + a + " §eminute" + (a === 1 ? "" : "s") + "§e.");
      console.warn("[Nexus] backend asked to reconnect later (" + (n || "no reason") + "), retrying in " + a + " min");
    })(t.minutes, t.reason);
    return;
  }
  if (n.startsWith(PROTOCOL.flagPrefix)) {
    const e = JSON.parse(n.replace(PROTOCOL.flagPrefix, ""));
    for (const t of e) {
      flagPlayer(t.player, t.module, t.type, t.punishment);
    }
  }
  if (n.startsWith(PROTOCOL.player.tp)) {
    const t = JSON.parse(n.replace(PROTOCOL.player.tp, ""));
    for (const n of t) {
      const {
        player: t,
        location: a,
        dimension: o
      } = n;
      const i = world.getPlayers({
        name: t.name
      })[0];
      i.teleport(a, {
        dimension: world.getDimension(o ?? i.dimension.id)
      });
    }
  }
  if (n.startsWith(PROTOCOL.player.runCommand)) {
    const t = JSON.parse(n.replace(PROTOCOL.player.runCommand, ""));
    for (const n of t) {
      const {
        player: t,
        command: a
      } = n;
      const o = world.getPlayers({
        name: t.name
      })[0];
      if (o && o.isValid) {
        o.runCommand(a);
      }
    }
  }
  if (n.startsWith(PROTOCOL.action)) {
    let e;
    try {
      e = JSON.parse(n.replace(PROTOCOL.action, ""));
    } catch {
      e = [];
    }
    for (const t of e) {
      try {
        handleBackendAction(t, a);
      } catch (e) {
        console.warn("[Nexus] action failed: " + e);
      }
    }
  }
  if (n.startsWith(PROTOCOL.ban.result)) {
    let t;
    try {
      t = JSON.parse(n.replace(PROTOCOL.ban.result, ""));
    } catch {
      t = null;
    }
    if (t && t.banned) {
      const n = t.id && world.getEntity(t.id) || getPlayerByName(t.name);
      if (n && n.isValid) {
        const tmp9 = {
          reason: t.reason ?? "Unspecified",
          expire: t.expire ?? -1
        };
        const e = formatBanMessage(tmp9);
        try {
          n.sendMessage(e);
        } catch {}
        kickPlayer(n, e);
      }
    }
  }
  if (n.startsWith(PROTOCOL.query.request)) {
    let e;
    try {
      e = JSON.parse(n.replace(PROTOCOL.query.request, ""));
    } catch {
      e = [];
    }
    const t = [];
    for (const n of e) {
      let e = null;
      try {
        e = handleBackendQuery(n);
      } catch (e) {
        console.warn("[Nexus] query failed: " + e);
      }
      const tmp10 = {
        id: n.id
      };
      tmp10.kind = n.kind;
      tmp10.data = e;
      t.push(tmp10);
    }
    try {
      a.send(PROTOCOL.query.response + JSON.stringify(t));
    } catch {}
  }
}
function getPlayerByName(t) {
  if (t) {
    return world.getPlayers({
      name: t
    })[0];
  } else {
    return undefined;
  }
}
function handleBackendAction(t, n) {
  switch (t.kind) {
    case "kick":
      {
        const e = getPlayerByName(t.player?.name);
        if (e && e.isValid) {
          kickPlayer(e, t.reason ?? "");
        }
        break;
      }
    case "ban":
      {
        const e = getPlayerByName(t.player?.name);
        if (e) {
          banPlayer(e.id, "§uNexus", "id", t.reason ?? "Unspecified", t.duration ?? -1, e.name);
        } else if (t.player?.name) {
          banPlayer(t.player.name, "§uNexus", "name", t.reason ?? "Unspecified", t.duration ?? -1, t.player.name);
        }
        sendCloudSync(n);
        break;
      }
    case "freeze":
      {
        const e = getPlayerByName(t.player?.name);
        if (e && e.isValid) {
          freezePlayer(e, "§uNexus", t.reason ?? "Unspecified", t.duration ?? -1);
        }
        sendCloudSync(n);
        break;
      }
    case "unban":
      if (t.target) {
        unbanName(String(t.target));
      }
      sendCloudSync(n);
      break;
    case "unfreeze":
      {
        const e = getPlayerByName(t.player?.name);
        if (e && e.isValid) {
          const t = freezeDb.get(e.id);
          if (t) {
            releaseFreeze(e, t);
          } else {
            freezeDb.set(e.id);
          }
        } else if (t.player?.name) {
          const e = freezeDb.getAll && freezeDb.getAll() || {};
          for (const [n, a] of Object.entries(e)) {
            if (a && a.name === t.player.name) {
              freezeDb.set(n);
            }
          }
        }
        sendCloudSync(n);
        break;
      }
    case "op":
      {
        const e = getPlayerByName(t.player?.name);
        if (e && e.isValid) {
          setAdmin(e, true);
        }
        break;
      }
    case "deop":
      {
        const e = getPlayerByName(t.player?.name);
        if (e && e.isValid) {
          setAdmin(e, false);
        }
        break;
      }
    case "announce":
      world.sendMessage(String(t.message ?? ""));
      break;
    case "tell":
      {
        const n = function (t) {
          if (!t) {
            return [];
          }
          if (t.all) {
            return world.getAllPlayers();
          }
          if (t.name) {
            const e = getPlayerByName(t.name);
            if (e) {
              return [e];
            } else {
              return [];
            }
          }
          if (Array.isArray(t.names)) {
            return t.names.map(getPlayerByName).filter(Boolean);
          } else if (t.tag) {
            return world.getPlayers({
              tags: [t.tag]
            });
          } else if (t.op) {
            return world.getAllPlayers().filter(e => isOperator(e));
          } else if (t.admin) {
            return world.getAllPlayers().filter(e => e.isAdmin);
          } else {
            return [];
          }
        }(t.target);
        if (n.length) {
          sendMessageToPlayers(n, String(t.message ?? ""));
        }
        break;
      }
    case "run":
      if (t.player?.name) {
        const e = getPlayerByName(t.player.name);
        if (e && e.isValid) {
          e.runCommand(String(t.command));
        }
      } else {
        (t.dimension ? world.getDimension(t.dimension) : overworld).runCommand(String(t.command));
      }
      break;
    case "tp":
      {
        const n = getPlayerByName(t.player?.name);
        if (!n || !n.isValid) {
          break;
        }
        const a = t.destination ?? {};
        if (a.player) {
          const e = getPlayerByName(a.player);
          if (e && e.isValid) {
            n.teleport(e.location, {
              dimension: e.dimension
            });
          }
        } else if (typeof a.x == "number") {
          n.teleport(a, {
            dimension: world.getDimension(t.dimension ?? n.dimension.id)
          });
        }
        break;
      }
    case "setInventory":
      {
        const e = getPlayerByName(t.player?.name);
        if (!e || !e.isValid) {
          break;
        }
        (function (e, t) {
          if (!Array.isArray(t)) {
            return 0;
          }
          e.inventoryEditGraceUntil = Date.now() + 3000;
          const tmp11 = {
            ok: false
          };
          const n = e.getComponent("minecraft:inventory")?.container;
          const o = e.getComponent("minecraft:ender_inventory")?.container;
          const i = e.getComponent("minecraft:equippable");
          const r = e => e.section === "items" && n && e.slot >= 0 && e.slot < n.size ? {
            ok: true,
            item: n.getItem(e.slot)
          } : e.section === "enderChest" && o && e.slot >= 0 && e.slot < o.size ? {
            ok: true,
            item: o.getItem(e.slot)
          } : e.section === "armor" && i && EQUIP_SLOTS[e.slot] ? {
            ok: true,
            item: i.getEquipment(EQUIP_SLOTS[e.slot])
          } : e.section === "offhand" && i ? {
            ok: true,
            item: i.getEquipment(EquipmentSlot.Offhand)
          } : tmp11;
          const s = (e, t) => {
            if (e.section === "items") {
              n.setItem(e.slot, t);
            } else if (e.section === "enderChest") {
              o.setItem(e.slot, t);
            } else if (e.section === "armor") {
              i.setEquipment(EQUIP_SLOTS[e.slot], t);
            } else if (e.section === "offhand") {
              i.setEquipment(EquipmentSlot.Offhand, t);
            }
          };
          let c = 0;
          for (const e of t) {
            if (e) {
              try {
                const t = r(e);
                if (!t.ok) {
                  continue;
                }
                if (typeof e.sub == "number") {
                  const n = t.item;
                  const a = n && n.getComponent("minecraft:inventory")?.container;
                  if (!a || e.sub < 0 || e.sub >= a.size) {
                    console.warn("[Nexus] no storage item at " + e.section + ":" + e.slot);
                    continue;
                  }
                  a.setItem(e.sub, e.item ? updateItemFromSnapshot(a.getItem(e.sub), e.item) : undefined);
                  s(e, n);
                } else {
                  s(e, e.item ? updateItemFromSnapshot(t.item, e.item) : undefined);
                }
                c++;
              } catch (t) {
                console.warn("[Nexus] inventory edit failed (" + e.section + ":" + e.slot + (typeof e.sub == "number" ? "/" + e.sub : "") + "): " + t);
              }
            }
          }
        })(e, t.changes);
        sendInventorySync(n, [{
          player: e,
          reason: "edit"
        }]);
        break;
      }
    case "setConfig":
      {
        const e = Array.isArray(t.updates) ? t.updates : [];
        for (const t of e) {
          if (t && Array.isArray(t.path) && t.path.length) {
            try {
              setConfigValue(t.path, t.value);
            } catch (e) {
              console.warn("[Nexus] setConfig failed for " + t.path.join("/") + ": " + e);
            }
          }
        }
        sendCloudSync(n);
        break;
      }
  }
}
function handleBackendQuery(e) {
  const t = getPlayerByName(e.player?.name);
  if (!t || !t.isValid) {
    return null;
  }
  if (e.kind === "location") {
    const e = t.getRotation();
    const tmp12 = {
      x: e.x,
      y: e.y
    };
    const tmp13 = {
      name: t.name,
      location: {},
      dimension: t.dimension.id,
      rotation: tmp12
    };
    tmp13.location.x = t.location.x;
    tmp13.location.y = t.location.y;
    tmp13.location.z = t.location.z;
    return tmp13;
  }
  if (e.kind === "inventory") {
    return snapshotInventory(t);
  } else {
    return null;
  }
}
import("@minecraft/server-net").then(e => {
  serverNetModule = e.websocket;
}).catch(e => {});
// ==== 11. BACKEND ENDPOINTS & CONNECTION =========================================
const SERVER_NA = {
  id: "NA"
};
SERVER_NA.addresse = "ws://104.243.47.204:25768";
const SERVER_AS = {
  id: "AS"
};
SERVER_AS.addresse = "ws://160.187.210.56:25574";
const SERVER_EU = {
  id: "EU"
};
SERVER_EU.addresse = "ws://95.214.55.72:25591";
const SERVER_LOCAL = {
  id: "LOCAL",
  addresse: "ws://127.0.0.1:19165"
};
const BACKEND_SERVERS = [SERVER_NA, SERVER_AS, SERVER_EU, SERVER_LOCAL];
let backendSocket;
let connecting = false;
let connectionAttempts = 0;
let retryNotBefore = 0;
function isOutdatedProtocol() {
  return licenseDb.get("outdated") === PROTOCOL_VERSION;
}
function getOutdatedMessage() {
  return NEXUS_PREFIX + "§cNexus is outdated and has stopped connecting to the backend. §eUpdate the pack from the Nexus Discord: §b" + DISCORD_LINK;
}
function handleConnectFailure(t) {
  connectionAttempts++;
  console.warn("[Nexus] connection attempt " + connectionAttempts + "/5 failed (" + t + ")");
  if (connectionAttempts >= 5) {
    connectionAttempts = 0;
    retryNotBefore = Date.now() + 900000;
    console.warn("[Nexus] backend unreachable after 5 attempts, retrying in 15 minutes");
    world.sendMessage(NEXUS_PREFIX + "§cCouldn't reach the Nexus backend after 5 attempts. §eTrying again in 15 minutes.");
  }
}
async function connectToBackend() {
  if (isOutdatedProtocol()) {
    return;
  }
  if (Date.now() < retryNotBefore) {
    return;
  }
  if (connecting) {
    return;
  }
  const n = licenseDb.get("current");
  if (!n) {
    return;
  }
  const a = serverDb.get("current");
  if (a) {
    if (serverNetModule) {
      if (!backendSocket?.isOpen) {
        connecting = true;
        try {
          let o;
          console.warn("[Nexus] the anticheat isnt connected, trying to connect to " + a.id + " server...");
          world.sendMessage(NEXUS_PREFIX + ("§ethe anticheat §cisnt connected§8,§e trying to connect to §a" + a.id + " §eserver§8..."));
          try {
            o = await serverNetModule.connect(a.addresse);
          } catch (e) {
            handleConnectFailure("connect error");
            return;
          }
          backendSocket = o;
          if (!o.isOpen) {
            try {
              o.close();
            } catch {}
            handleConnectFailure("socket didn't open");
            return;
          }
          console.warn("[Nexus] Connected sucessfully");
          world.sendMessage(NEXUS_PREFIX + "§aConnected sucessfully");
          let i = false;
          o.afterEvents.message.subscribe(e => {
            if (!i) {
              i = true;
              connectionAttempts = 0;
            }
            handleBackendMessage(e.message, o);
          });
          o.send(PROTOCOL.auth.recievePrefix + n);
          system.runTimeout(() => {
            if (!i) {
              try {
                o.close();
              } catch {}
              handleConnectFailure("no response");
            }
          }, 200);
        } finally {
          connecting = false;
        }
      }
    } else {
      console.warn("[Nexus] Server net is disabled. Unable to connect to server.");
    }
  }
}
// ==== 12. HOOK REGISTRY, TICK LOOP & EVENT WIRING ================================
//   HOOKS.<event> arrays are filled by the detection modules below and
//   invoked from the world event subscriptions further down.
const HOOK_SETS = {
  onAttack: [],
  onPlayerHurt: [],
  onPlayerJoin: [],
  onPlayerFirstSpawn: [],
  onPlayerLeave: [],
  onPlaceBlock: [],
  onPlaceBlockAlways: [],
  onBreakBlock: [],
  onBreakBlockAlways: [],
  onEntityHit: [],
  onInventoryChange: [],
  onItemDrop: [],
  onInteractBlock: [],
  onInteractEntity: [],
  onInteractBlockAlways: [],
  onInteractEntityAlways: [],
  onTickTasks: [],
  onPlayerTick: [],
  onFocusedPlayerTick: [],
  onWorldReady: []
};
const HOOKS = HOOK_SETS;
let overworld;
const timelineBuffer = new Map();
function pushTimelineEntry(e, t, n, ...a) {
  timelineBuffer.get(t)?.push([e, n, ...a]);
}
let focusedPlayer;
let cachedPlayerList = [];
let roundRobinIndex = 0;
function refreshPlayerList() {
  cachedPlayerList = world.getAllPlayers();
}
let outboundQueue = [];
function resetOutboundQueue() {
  outboundQueue = [];
}
const recentCustomDamage = new Map();
// ==== 13. ADMIN UI (forms / config editor) =======================================
async function promptNumberInput(e, t, n, a, o = "") {
  const i = new ModalFormData();
  i.title(t);
  const r = o ? "§c" + o + "\n§r" + n : n || t;
  i.textField(r, "Enter a number", {
    defaultValue: a.toString()
  });
  const s = await i.show(e);
  if (s.canceled) {
    return null;
  }
  const c = s.formValues?.[0];
  if (typeof c != "string") {
    return null;
  }
  const l = parseFloat(c);
  if (isNaN(l)) {
    return promptNumberInput(e, t, n, a, "You should input a number");
  } else {
    return l;
  }
}
async function promptValueEdit(e, t, n, a) {
  const o = [...t, n];
  const i = getConfigValue(CONFIG, metaPath(o, "T")) ?? n;
  const r = getConfigValue(CONFIG, metaPath(o, "B")) ?? getConfigValue(CONFIG, metaPath(o, "D")) ?? "";
  if (Array.isArray(a)) {
    const t = new ModalFormData().title("Edit " + i).textField(r || "Enter values separated by commas (e.g., \"value1,value2,value3\")", "Enter values separated by commas", {
      defaultValue: a.join(",")
    });
    const n = await t.show(e);
    if (n.canceled) {
      return;
    }
    const s = n.formValues?.[0];
    if (typeof s == "string") {
      setConfigValue(o, s.split(",").map(e => e.trim()).filter(e => e.length > 0));
    }
  } else if (typeof a == "number") {
    const t = await promptNumberInput(e, "Edit " + i, r || i, a);
    if (t !== null) {
      setConfigValue(o, t);
    }
  } else if (typeof a == "string") {
    const tmp14 = {
      defaultValue: a
    };
    const t = new ModalFormData().title("Edit " + i).textField(r || "Enter new value", "Enter new value", tmp14);
    const n = await t.show(e);
    if (n.canceled) {
      return;
    }
    const s = n.formValues?.[0];
    if (typeof s == "string" && s !== a) {
      setConfigValue(o, s);
    }
  }
}
async function openConfigMenu(e, t = [], n = "") {
  const a = new ActionFormData();
  const o = getConfigValue(CONFIG, t);
  if (!o) {
    e.sendMessage("§cError: Configuration path not found.");
    return;
  }
  const i = Object.keys(o).filter(e => !e.includes("$"));
  let r = "";
  if (t.length === 0) {
    r += "This is the root of the configuration. Click the property to change them.";
  } else {
    r += getConfigValue(CONFIG, metaPath(t, "D")) ?? "";
  }
  a.button("§c§lBack!");
  for (const e of i) {
    const n = getConfigValue(CONFIG, metaPath([...t, e], "T")) ?? "§4§lTITLE NOT FOUND (bug)";
    const o = getConfigValue(CONFIG, metaPath([...t, e], "D")) ?? "";
    if (o) {
      r += o ? "\n§n" + n + ": §7" + o : "";
    }
    let i = getConfigValue(CONFIG, [...t, e]);
    const s = typeof i;
    let c = "";
    getConfigValue(CONFIG, metaPath([...t, e], "P"));
    if (Array.isArray(i)) {
      i = "[" + i.map(e => "'" + e + "'").join(",") + "]";
      if (i.length > 15) {
        i = i.slice(0, 13) + "..";
      }
    } else if (s === "object" && i !== null) {
      if (typeof i.enabled == "boolean") {
        c = i.enabled ? "§2" : "§4";
      }
      i = "Object";
    } else if (s === "string") {
      i = "\"" + i + "\"";
      if (i.length > 15) {
        i = i.slice(1, 13) + "..\"";
      }
    } else if (s === "boolean") {
      c = i ? "§2" : "§4";
    }
    let l = n + "\n§8" + i;
    l = c ? c + l : "§1" + l;
    a.button(l);
  }
  const s = t.length === 0 ? "Configuration" : getConfigValue(CONFIG, metaPath(t, "T")) ?? t.join("/");
  a.title(s);
  a.body(n + r.replace(/^\n/, ""));
  const c = await a.show(e);
  if (c.canceled) {
    return;
  }
  const l = c.selection;
  if (l === undefined) {
    return;
  }
  if (l === 0) {
    if (t.length === 0) {
      openMainUi(e);
    } else {
      const n = [...t];
      n.pop();
      openConfigMenu(e, n);
    }
    return;
  }
  const d = i[l - 1];
  const u = getConfigValue(CONFIG, [...t, d]);
  const p = typeof u;
  getConfigValue(CONFIG, metaPath([...t, d], "P"));
  const tmp15 = getConfigValue(CONFIG, metaPath([...t, d], "V"));
  if (tmp15 && Array.isArray(tmp15)) {
    const n = await function (e, t, n, a, o) {
      const i = getConfigValue(CONFIG, metaPath([...t, n], "T")) ?? n;
      const r = getConfigValue(CONFIG, metaPath([...t, n], "B")) ?? getConfigValue(CONFIG, metaPath([...t, n], "D")) ?? n;
      return new ModalFormData().title("Edit " + i).dropdown(r, o, {
        defaultValueIndex: Math.max(0, o.indexOf(a))
      }).show(e);
    }(e, t, d, u, tmp15);
    if (!n.canceled) {
      const e = n.formValues?.[0];
      if (typeof e == "number" && e >= 0 && e < tmp15.length) {
        const n = tmp15[e];
        setConfigValue([...t, d], n);
      }
    }
    openConfigMenu(e, t);
    return;
  }
  if (Array.isArray(u)) {
    await promptValueEdit(e, t, d, u);
    openConfigMenu(e, t);
    return;
  }
  switch (p) {
    case "object":
      openConfigMenu(e, [...t, d]);
      break;
    case "boolean":
      setConfigValue([...t, d], !u);
      openConfigMenu(e, t);
      break;
    case "string":
      {
        const n = t.join("/");
        if (n === "punishment/specfic" || n === "punishment/defaultPunishment") {
          const n = ["default", "kick", "ban", "freeze", "none"];
          const a = n.indexOf(u);
          const o = a !== -1 ? n[(a + 1) % n.length] : "default";
          setConfigValue([...t, d], o);
          openConfigMenu(e, t);
          break;
        }
        await promptValueEdit(e, t, d, u);
        openConfigMenu(e, t);
        break;
      }
    case "number":
      await promptValueEdit(e, t, d, u);
      openConfigMenu(e, t);
      break;
    default:
      openConfigMenu(e, t);
  }
}
function openMainUi(e) {
  const n = new ActionFormData().title("Nexus UI").body("Hello, §e" + e.name + "§r§f, thanks for choosing §uNexus Anticheat§r. You can join our support server at §ehttps://discord.gg/CqZGXeRKPJ").button("Chat command help", "textures/items/book_written.png").button("Get ui item", "textures/items/diamond.png").button("Configuration", "textures/ui/gear.png");
  (async function (e, n) {
    while (e.isValid) {
      const a = await n.show(e);
      if (!a.canceled || a.cancelationReason !== "UserBusy") {
        return a;
      }
      await system.waitTicks(5);
    }
    return;
  })(e, n).then(t => {
    if (t && !t.canceled) {
      switch (t.selection) {
        case 0:
          Command.dispatch(e, "nexus.help");
          break;
        case 1:
          giveItem(e, new ItemStack("nexus:ui", 1));
          e.sendMessage(NEXUS_PREFIX + "You have been given the ui item. Hold the item and use it to open the same ui again.");
          break;
        case 2:
          openConfigMenu(e);
      }
    }
  });
}
// ==== 14. CONTAINER & INVENTORY TRACKING =========================================
const openedContainerStates = new Map();
function syncContainerChange(e, n, a, o, i) {
  const s = [];
  const c = e.dimension.getBlock(n.location);
  if (!c) {
    return;
  }
  const l = c.getComponent(BlockComponentTypes.Inventory).container;
  const d = n.inventory;
  for (let n = 0; n < l.size; n++) {
    const r = d[n];
    const u = l.getItem(n);
    const tmp16 = {
      typeId: u?.typeId,
      amount: u?.amount,
      i: n
    };
    s.push(tmp16);
    if (r.typeId == u?.typeId && r.amount == u?.amount) {
      continue;
    }
    const m = (r?.amount ?? 0) - (u?.amount ?? 0);
    if (m !== o.amount - a.amount) {
      continue;
    }
    const f = {};
    const tmp17 = {
      typeId: u?.typeId,
      amount: u?.amount
    };
    const tmp18 = {
      slot: n,
      beforeItem: r,
      afterItem: tmp17
    };
    if (a.typeId != o.typeId && a.typeId && o.typeId) {
      f.type = "swap";
    } else {
      f.type = m > 0 ? "took" : "put";
    }
    f.chest = tmp18;
    f.player = {
      slot: i,
      beforeItem: a,
      afterItem: o,
      name: e.name,
      id: e.id,
      bypass: isBypass(e) || undefined
    };
    f.block = {
      typeId: c.typeId,
      location: vec3ToFixed(c.location)
    };
    f.date = Date.now();
    const tmp19 = {
      id: EVENT_IDS.containerItem,
      data: f
    };
    const p = tmp19;
    system.run(() => {
      p.data.player.ping = e?.getPing() ?? 0;
      queueEvent(p);
    });
  }
  n.inventory = s;
  openedContainerStates.set(e.id, n);
}
let smoothedTps = 20;
let lastTickSample = system.currentTick;
let lastTimeSample = Date.now();
system.runInterval(() => {
  const e = Date.now();
  const n = e - lastTimeSample;
  if (n <= 0) {
    return;
  }
  const a = Math.min(20, (system.currentTick - lastTickSample) * 1000 / n);
  smoothedTps = smoothedTps * 0.5 + a * 0.5;
  lastTickSample = system.currentTick;
  lastTimeSample = e;
}, 20);
// ==== 15. GENERIC UTILITIES ======================================================
const isPlainObject = e => e !== null && typeof e == "object" && !Array.isArray(e);
function deepEqual(e, t) {
  if (e === t) {
    return true;
  }
  if (e === null || t === null || typeof e != "object" || typeof t != "object") {
    return false;
  }
  if (Array.isArray(e) !== Array.isArray(t)) {
    return false;
  }
  if (Array.isArray(e)) {
    if (e.length !== t.length) {
      return false;
    }
    for (let n = 0; n < e.length; n++) {
      if (!deepEqual(e[n], t[n])) {
        return false;
      }
    }
    return true;
  }
  const n = Object.keys(e);
  if (n.length !== Object.keys(t).length) {
    return false;
  }
  for (const a of n) {
    if (!(a in t) || !deepEqual(e[a], t[a])) {
      return false;
    }
  }
  return true;
}
function commonRecords(e) {
  const t = {};
  const n = e[0];
  for (const a of Object.keys(n)) {
    if (n[a] === undefined) {
      continue;
    }
    let o = true;
    let i = true;
    let r = isPlainObject(n[a]);
    for (let t = 1; t < e.length; t++) {
      const s = e[t];
      if (!(a in s) || s[a] === undefined) {
        o = false;
        break;
      }
      if (i && !deepEqual(n[a], s[a])) {
        i = false;
      }
      if (r && !isPlainObject(s[a])) {
        r = false;
      }
    }
    if (o) {
      if (i) {
        t[a] = n[a];
      } else if (r) {
        const n = commonRecords(e.map(e => e[a]));
        if (Object.keys(n).length) {
          t[a] = n;
        }
      }
    }
  }
  return t;
}
function diffRecords(e, t) {
  const n = {};
  for (const a of Object.keys(e)) {
    const o = e[a];
    if (o !== undefined) {
      if (a in t) {
        if (deepEqual(o, t[a])) {
          continue;
        }
        if (isPlainObject(o) && isPlainObject(t[a])) {
          n[a] = diffRecords(o, t[a]);
        } else {
          n[a] = o;
        }
      } else {
        n[a] = o;
      }
    }
  }
  return n;
}
function buildPacket(e, t, n) {
  const a = new Map();
  const o = [];
  for (const t of e) {
    const e = t && t.i != null ? String(t.i) : "_";
    const n = t ? t.d : undefined;
    const i = n && n.p && n.p.n != null ? String(n.p.n) : "";
    let r = a.get(e);
    if (!r) {
      a.set(e, r = new Map());
    }
    let s = r.get(i);
    if (!s) {
      r.set(i, s = []);
    }
    s.push(n === undefined ? null : n);
    o.push([e, i]);
  }
  const i = {};
  for (const [e, t] of a) {
    i[e] = [];
    for (const n of t.values()) {
      if (n.length === 1) {
        i[e].push([n[0]]);
        continue;
      }
      if (n.some(e => !isPlainObject(e))) {
        i[e].push([null, n]);
        continue;
      }
      const t = commonRecords(n);
      i[e].push([t, n.map(e => {
        const n = diffRecords(e, t);
        if (Object.keys(n).length) {
          return n;
        } else {
          return 0;
        }
      })]);
    }
  }
  const r = new Map();
  let s = 0;
  for (const e of Object.keys(i)) {
    const t = a.get(e);
    for (const n of t.keys()) {
      r.set(e + "\0" + n, s++);
    }
  }
  const c = o.map(([e, t]) => r.get(e + "\0" + t));
  let l = true;
  for (let e = 1; e < c.length; e++) {
    if (c[e] < c[e - 1]) {
      l = false;
      break;
    }
  }
  const tmp20 = {
    t: t,
    la: n,
    e: i
  };
  const d = tmp20;
  if (!l) {
    d.o = c;
  }
  return d;
}
function startPlayerTickLoop() {
  system.runInterval(() => {
    if (cachedPlayerList.length !== 0) {
      if (roundRobinIndex >= cachedPlayerList.length) {
        roundRobinIndex = 0;
      }
      focusedPlayer = cachedPlayerList[roundRobinIndex];
      roundRobinIndex++;
    }
    const e = Date.now();
    for (const e of HOOKS.onTickTasks) {
      e();
    }
    const n = (focusedPlayer || (refreshPlayerList(), focusedPlayer = cachedPlayerList[roundRobinIndex], focusedPlayer))?.id;
    const a = system.currentTick % 2 == 0;
    for (const t of cachedPlayerList) {
      const o = t.isValid;
      if (!o || isBypass(t)) {
        continue;
      }
      const i = {
        dimension: t.dimension,
        isSwimming: t.isSwimming,
        date: e,
        name: t.name,
        velocity: t.getVelocity(),
        location: t.location,
        id: t.id,
        isJumping: t.isJumping,
        isOnGround: t.isOnGround,
        isFalling: t.isFalling,
        isGliding: t.isGliding,
        bypass: isBypass(t),
        commandPermissionLevel: t.commandPermissionLevel,
        isValid: o.isValid,
        isSecondTick: a
      };
      if (i.id !== n) {
        for (const e of HOOKS.onPlayerTick) {
          e(t, i);
        }
        continue;
      }
      const r = openedContainerStates.get(n);
      if (r) {
        const e = t.getComponent(EntityComponentTypes.CursorInventory).item;
        const n = {
          typeId: e?.typeId,
          amount: e?.amount ?? 0
        };
        const a = r.lastCursor;
        if (e?.typeId || a?.typeId) {
          syncContainerChange(t, r, a, n, "cursor");
        }
        r.lastCursor = n;
        openedContainerStates.set(t.id, r);
      }
      for (const e of HOOKS.onFocusedPlayerTick) {
        e(t, i);
      }
      for (const e of HOOKS.onPlayerTick) {
        e(t, i);
      }
    }
  }, 3);
}
function distance3d(e, t) {
  return Math.sqrt(function (e, t) {
    const {
      x: n,
      y: a,
      z: o
    } = e;
    const {
      x: i,
      y: r,
      z: s
    } = t;
    const c = n - i;
    const l = a - r;
    const d = o - s;
    return c * c + l * l + d * d;
  }(e, t));
}
function sqDistToAABB(e, {
  center: t,
  extent: n
}) {
  const a = Math.max(0, Math.abs(e.x - t.x) - n.x);
  const o = Math.max(0, Math.abs(e.y - t.y) - n.y);
  return a * a + o * o;
}
function floorVector({
  x: e,
  y: t,
  z: n
}) {
  return {
    x: Math.floor(e),
    y: Math.round(t),
    z: Math.floor(n)
  };
}
const COS_120 = Math.cos(Math.PI * 120 / 180);
const COS_120_SQ = COS_120 * COS_120;
const COS_60 = Math.cos(Math.PI * 60 / 180);
const COS_60_SQ = COS_60 * COS_60;
function registerContainerEvents() {
  world.afterEvents.blockContainerOpened.subscribe(e => {
    const {
      openSource: n,
      block: a,
      dimension: o
    } = e;
    const i = Date.now();
    const r = n.entity;
    const l = {
      id: EVENT_IDS.blockContainerOpened,
      data: {
        player: {
          name: r?.name,
          id: r?.id,
          location: vec3ToFixed(r?.location),
          headLoc: vec3ToFixed(r?.getHeadLocation()),
          bypass: isBypass(r) || undefined
        },
        block: {
          typeId: a.typeId,
          location: vec3ToFixed(a.location)
        },
        dimension: o.id,
        date: i
      }
    };
    const d = [];
    const u = a.getComponent("minecraft:inventory")?.container;
    for (let e = 0; e < u?.size; e++) {
      const t = u?.getItem(e);
      const tmp22 = {
        typeId: t?.typeId,
        amount: t?.amount,
        slot: e
      };
      d.push(tmp22);
    }
    const m = r?.getComponent(EntityComponentTypes.CursorInventory)?.item;
    const f = {
      typeId: m?.typeId,
      amount: m?.amount ?? 0
    };
    const tmp21 = {
      inventory: d,
      location: a.location,
      lastCursor: f
    };
    openedContainerStates.set(r?.id, tmp21);
    system.run(() => {
      l.data.player.ping = r instanceof Player ? r.getPing() : 0;
      queueEvent(l);
    });
  });
  world.afterEvents.playerInventoryItemChange.subscribe(e => {
    const {
      player: t,
      beforeItemStack: n,
      itemStack: a,
      inventoryType: o,
      slot: i
    } = e;
    const r = n?.getComponent("durability");
    const s = a?.getComponent("durability");
    const c = openedChestLocations.get(t.id);
    let l;
    let d;
    let u = [];
    if (c) {
      d = t.dimension.getBlock(c.location);
    }
    if (cloudModeActive && c?.location && (l = d?.getComponent("minecraft:inventory"), l)) {
      const e = l.container;
      for (let t = 0; t < e.size; t++) {
        const n = e?.getItem(t);
        const tmp30 = {
          typeId: n?.typeId,
          amount: n?.amount
        };
        u.push(tmp30);
      }
    }
    var m;
    m = t.id;
    pendingSyncPlayerIds.add(m);
    const tmp23 = {
      valid: r?.isValid,
      max: r?.maxDurability,
      current: r?.damage
    };
    const tmp24 = {};
    tmp24.typeId = n?.typeId;
    tmp24.amount = n?.amount ?? 0;
    tmp24.durability = tmp23;
    const tmp25 = {
      max: s?.maxDurability,
      current: s?.damage
    };
    const tmp26 = {};
    tmp26.typeId = a?.typeId;
    tmp26.amount = a?.amount ?? 0;
    tmp26.durability = tmp25;
    const tmp27 = {
      type: o,
      slot: i
    };
    const tmp28 = {
      isContainer: l,
      container: u,
      typeId: d?.typeId
    };
    const f = isBypass(t) || t.inventoryEditGraceUntil && Date.now() < t.inventoryEditGraceUntil;
    const p = {
      id: EVENT_IDS.inventoryChange,
      data: {
        beforeItem: tmp24,
        item: tmp26,
        player: {
          name: t.name,
          id: t.id,
          rotation: vec2ToFixed(t.getRotation()),
          bypass: f || undefined,
          location: vec3ToFixed(t.location)
        },
        inventory: tmp27,
        openedChest: tmp28,
        date: Date.now()
      }
    };
    queueEvent(p);
    const tmp29 = openedContainerStates.get(t.id);
    if (tmp29) {
      syncContainerChange(t, tmp29, p.data.beforeItem, p.data.item);
    }
    if (!f) {
      for (const i of HOOKS.onInventoryChange) {
        i(t, n, a, o, e);
      }
    }
  });
  world.afterEvents.blockContainerClosed.subscribe(e => {
    const {
      closeSource: n,
      block: a,
      dimension: o
    } = e;
    const i = Date.now();
    const r = n.entity;
    const s = {
      id: EVENT_IDS.blockContainerClosed,
      data: {
        player: {
          name: r?.name,
          id: r?.id,
          location: vec3ToFixed(r?.location),
          headLoc: vec3ToFixed(r?.getHeadLocation()),
          bypass: isBypass(r) || undefined
        },
        block: {
          typeId: a.typeId,
          location: vec3ToFixed(a.location)
        },
        dimension: o.id
      },
      date: i
    };
    openedContainerStates.delete(r.id);
    system.run(() => {
      s.data.player.ping = r instanceof Player ? r.getPing() : 0;
      queueEvent(s);
    });
  });
}
system.beforeEvents.startup.subscribe(e => {
  e.itemComponentRegistry.registerCustomComponent("nexus:ui", {
    onUse: e => {
      if (!e.source.isAdmin) {
        return e.source.sendMessage("§8[§uNexus§8] §cNo permission! (A cute uwu's cat is looking at you >w<)");
      }
      openMainUi(e.source);
    }
  });
});
world.afterEvents.worldLoad.subscribe(() => {
  var n;
  refreshPlayerList();
  n = world.getDimension("overworld");
  overworld = n;
  Database.loadAll();
  if (centreDb.has("at")) {
    centreDb.get("at");
  } else {
    const e = Date.now();
    centreDb.set("at", e);
  }
  (function () {
    const e = configDb.getAll();
    Object.entries(e).forEach(([e, t]) => {
      const n = e.split("/");
      if (getConfigValue(CONFIG, n) === undefined) {
        configDb.set(e);
      } else {
        setConfigAtPath(CONFIG, n, t);
      }
    });
  })();
  (function () {
    const e = licenseDb.get("outdated");
    if (e !== undefined && e !== PROTOCOL_VERSION) {
      licenseDb.set("outdated", undefined);
    }
  })();
  if (isOutdatedProtocol()) {
    world.sendMessage(getOutdatedMessage());
  }
  if (!licenseDb.get("current")) {
    world.sendMessage(NEXUS_PREFIX + "§cTheres no license key set! Set it with §e" + CONFIG.prefix + "setToken <key>§c. Get a free key with /token free in our Discord: §u" + DISCORD_LINK);
    if (!serverDb.get("current")) {
      world.sendMessage(NEXUS_PREFIX + "§cThe AntiCheat doesnt have a target server. §eChoose one with " + CONFIG.prefix + "setServer <NA|EU|AS>§e.");
    }
  }
  for (const e of cachedPlayerList) {
    if (adminDb.get(e.id)) {
      e.isAdmin = true;
    }
    for (const t of HOOKS.onPlayerJoin) {
      t(e);
    }
  }
  startPlayerTickLoop();
  for (const e of HOOKS.onWorldReady) {
    e();
  }
  system.runInterval(async () => {
    const e = reconnectDb.get("current");
    if (e || e == null) {
      connectToBackend();
    }
  }, 200);
  system.runInterval(() => {
    if (!backendConnected) {
      resetOutboundQueue();
      return;
    }
    if (outboundQueue.length === 0) {
      return;
    }
    const e = [[]];
    let n = 0;
    let a = 0;
    for (const t of outboundQueue) {
      const o = JSON.stringify(t).length;
      if (a + o < 524288) {
        e[n].push(t);
        a += o;
      } else {
        n++;
        e[n] = [];
        e[n].push(t);
        a = o;
      }
    }
    for (let n = 0; n < e.length; n++) {
      const a = e[n];
      system.runTimeout(() => {
        if (backendSocket.isOpen) {
          backendSocket.send(JSON.stringify(buildPacket(a, Math.round(smoothedTps * 10) / 10, Date.now())));
        }
      }, n);
    }
    resetOutboundQueue();
  }, 5);
  system.runInterval(() => {
    const tmp31 = {};
    tmp31.d = {};
    if (backendConnected) {
      outboundQueue.push(tmp31);
    }
  }, 100);
  world.afterEvents.entityRemove.subscribe(e => {
    recentCustomDamage.delete(e.removedEntityId);
  });
  world.beforeEvents.entityHurt.subscribe(e => {
    const {
      damageSource: n,
      hurtEntity: a
    } = e;
    const o = n.damagingEntity;
    if (a instanceof Player) {
      CONFIG.toggle.timeline;
      if (CONFIG.customDamageCompatibilityFix && n.cause === "none") {
        const t = recentCustomDamage.get(a.id);
        if (t && Date.now() - t < 150) {
          e.cancel = true;
          return;
        }
      }
      for (const e of HOOKS.onPlayerHurt) {
        e(a);
      }
    }
    if (e.cancel) {
      return;
    }
    if (n.cause !== "entityAttack") {
      return;
    }
    if (!o) {
      return;
    }
    if (n.damagingProjectile) {
      return;
    }
    if (!(o instanceof Player)) {
      return;
    }
    if (isBypass(o)) {
      return;
    }
    const i = a.getAABB();
    const r = o.getHeadLocation();
    const s = {
      name: o.name,
      targetTypeId: a.typeId,
      rotation: roundVector(o.getRotation(), 4),
      viewDir: roundVector(o.getViewDirection(), 4),
      id: o.id,
      targetVelocity: roundVector(a.getVelocity(), 4),
      targetId: a.id,
      date: Date.now(),
      targetAABB: i,
      headLoc: r,
      sqDist: roundVector(sqDistToAABB(r, i), 4),
      attackerVelocity: roundVector(o.getVelocity(), 4)
    };
    const l = r.y;
    let d;
    let u;
    let m;
    if (l >= -64 && l <= 320) {
      const tmp36 = {
        maxDistance: 7
      };
      const e = o?.getBlockFromViewDirection(tmp36);
      d = e?.block;
      u = d?.below();
      m = d?.above();
    }
    const tmp32 = {
      maxDistance: 7
    };
    const tmp33 = {
      isAir: u?.isAir,
      isLiquid: u?.isLiquid
    };
    const tmp34 = {};
    tmp34.isAir = m?.isAir;
    tmp34.isLiquid = m?.isLiquid;
    const tmp35 = {
      faceLocation: blockFromView?.faceLocation,
      face: blockFromView?.face,
      typeId: d?.typeId,
      location: d?.location,
      below: tmp33,
      above: tmp34
    };
    const f = {
      id: EVENT_IDS.hurtEntity,
      data: {
        player: {
          name: s.name,
          id: s.id,
          viewDir: vec3ToFixed(s.viewDir),
          headLoc: vec3ToFixed(r),
          velocity: vec3ToFixed(s.attackerVelocity),
          rot: vec2ToFixed(s.rotation),
          gamemode: o.gamemode,
          hasSpear: isSpear(getMainhandItem(o)?.typeId) || undefined,
          hasCrosshair: hasCrosshair(o),
          isLookingAtTheTarget: o.getEntitiesFromViewDirection(tmp32)[0]?.entity?.id != a.id || undefined,
          bypass: isBypass(o) || undefined,
          viewBlock: tmp35
        },
        target: {
          typeId: s.targetTypeId,
          AABB: aabbToFixed(s.targetAABB),
          id: s.targetId,
          velocity: vec3ToFixed(s.targetVelocity)
        },
        date: Date.now()
      }
    };
    system.run(() => {
      f.data.player.ping = o?.getPing() ?? 0;
      f.data.target.ping = a instanceof Player ? a.getPing() : 0;
      queueEvent(f);
    });
    for (const t of HOOKS.onAttack) {
      t(o, a, e, s);
    }
    if (CONFIG.customDamageCompatibilityFix && e.cancel) {
      recentCustomDamage.set(s.targetId, s.date);
    }
  });
  world.afterEvents.entityHitEntity.subscribe(e => {
    const t = e.damagingEntity;
    const n = e.hitEntity;
    if (!(t instanceof Player)) {
      return;
    }
    if (isBypass(t)) {
      return;
    }
    const a = Date.now();
    const tmp37 = {
      id: n.id
    };
    queueEventWithPing({
      id: EVENT_IDS.hitEntity,
      data: {
        target: tmp37,
        player: {
          name: t.name,
          id: t.id,
          bypass: isBypass(t) || undefined
        },
        date: a
      }
    }, t);
    const tmp38 = {
      id: t.id,
      date: a,
      targetId: n.id
    };
    const o = tmp38;
    for (const e of HOOKS.onEntityHit) {
      e(t, n, o);
    }
  });
  world.beforeEvents.chatSend.subscribe(e => {
    const {
      sender: t,
      message: n
    } = e;
    queueEventWithPing({
      id: EVENT_IDS.chatSend,
      data: {
        message: n,
        player: {
          name: t.name,
          id: t.id,
          bypass: isBypass(t) || undefined
        },
        date: Date.now()
      }
    }, t);
  });
  world.afterEvents.playerJoin.subscribe(t => {
    const {
      playerId: n,
      playerName: a
    } = t;
    const o = world.getEntity(n);
    queueEvent({
      id: EVENT_IDS.playerJoin,
      data: {
        player: {
          name: a,
          id: n,
          bypass: isBypass(o) || undefined
        }
      },
      date: Date.now()
    });
  });
  world.afterEvents.playerSpawn.subscribe(({
    player: e,
    initialSpawn: n
  }) => {
    if (!n) {
      return;
    }
    if (isOutdatedProtocol()) {
      e.sendMessage(getOutdatedMessage());
    }
    const a = Date.now();
    timelineBuffer.set(e.id, []);
    if (CONFIG.toggle.timeline) {
      pushTimelineEntry(a, e.id, TIMELINE_EVENTS.TID_10);
    }
    try {
      if (CONFIG.log.onJoin) {
        appendTimelineLog(a, e.name, LOG_EVENTS.ID_3);
      }
    } catch {}
    e.gamemode = e.getGameMode();
    refreshPlayerList();
    if (adminDb.get(e.id)) {
      e.isAdmin = true;
    } else if (cloudModeActive) {
      sendCloudBanCheck(e);
      startFreezeLoop(e);
    } else if (!checkBanOnJoin(e)) {
      startFreezeLoop(e);
    }
    const o = [];
    const i = e.getComponent("minecraft:inventory")?.container;
    for (let e = 0; e < i?.size; e++) {
      const t = i?.getItem(e);
      const tmp39 = {
        typeId: t?.typeId,
        amount: t?.amount,
        slot: e
      };
      o.push(tmp39);
    }
    const r = {
      id: EVENT_IDS.playerSpawn,
      data: {
        player: {
          name: e.name,
          id: e.id,
          dbName: nameSpoofDb.get(e.id),
          canBypass: isBypass(e),
          container: o
        }
      },
      date: a
    };
    nameSpoofDb.set(e.id, stripNameCounter(r.data.player.name));
    system.run(() => {
      if (e.isValid) {
        try {
          r.data.player.ping = e.getPing();
        } catch {}
      }
      queueEvent(r);
      if (e.isValid) {
        queueInventorySync(e, "join");
      }
    });
    const s = serverDb.get("current");
    if (!licenseDb.get("current")) {
      e.sendMessage(NEXUS_PREFIX + "§cTheres no license key set! Set it with §e" + CONFIG.prefix + "setToken <key>§c. Get a free key with /token free in our Discord: §u" + DISCORD_LINK);
      if (s) {
        return undefined;
      } else {
        e.sendMessage(NEXUS_PREFIX + "§cThe AntiCheat doesnt have a target server. §eChoose one with " + CONFIG.prefix + "setServer <NA|EU|AS>§e.");
        return;
      }
    }
    for (const t of HOOKS.onPlayerJoin) {
      t(e);
    }
    if (!isBypass(e)) {
      for (const t of HOOKS.onPlayerFirstSpawn) {
        t(e);
      }
    }
  });
  world.beforeEvents.playerLeave.subscribe(e => {
    const n = e.player;
    let a = null;
    try {
      a = snapshotInventory(n);
    } catch {}
    const tmp40 = {
      name: n.name,
      id: n.id
    };
    const o = tmp40;
    let i;
    let r;
    let s;
    if (a) {
      system.run(() => queueInventorySync(o, "leave", a));
    }
    try {
      const e = n.getRotation();
      const tmp41 = {
        x: n.location.x,
        y: n.location.y,
        z: n.location.z
      };
      const tmp42 = {
        x: e.x,
        y: e.y
      };
      i = tmp41;
      r = tmp42;
      s = n.dimension?.id;
    } catch {}
    queueEvent({
      id: EVENT_IDS.playerLeave,
      data: {
        player: {
          name: n.name,
          id: n.id,
          location: i,
          rotation: r,
          dimension: s,
          bypass: isBypass(n) || undefined
        }
      },
      date: Date.now()
    });
  });
  world.afterEvents.playerLeave.subscribe(({
    playerId: e,
    playerName: t
  }) => {
    timelineBuffer.delete(e);
    if (CONFIG.log.onLeave) {
      appendTimelineLog(Date.now(), t, LOG_EVENTS.ID_4);
    }
    refreshPlayerList();
    for (const t of HOOKS.onPlayerLeave) {
      t(e);
    }
  });
  world.beforeEvents.playerPlaceBlock.subscribe(e => {
    const {
      block: t,
      player: n
    } = e;
    const a = t.location;
    const o = n.location;
    const i = {
      blockLoc: roundVector(a, 4),
      name: n?.name,
      date: Date.now(),
      id: n.id,
      playerLoc: roundVector(o, 4),
      headLoc: roundVector(n.getHeadLocation(), 4),
      playerVelocity: roundVector(n.getVelocity(), 4),
      viewDir: roundVector(n.getViewDirection(), 4),
      distance: Number(distance3d(o, a).toFixed(4)),
      blockTypeId: t.typeId,
      isSolid: t.isSolid,
      isContainer: t.hasComponent("minecraft:inventory")
    };
    const r = isBypass(n);
    const s = t.below();
    queueEventWithPing({
      id: EVENT_IDS.playerPlaceBlock,
      data: {
        player: {
          id: i.id,
          location: vec3ToFixed(o),
          name: i.name,
          headLoc: vec3ToFixed(i.headLoc),
          viewDir: vec3ToFixed(i.viewDir),
          velocity: vec3ToFixed(i.playerVelocity),
          rotation: vec2ToFixed(n.getRotation()),
          bypass: r || undefined,
          gamemode: n.gamemode,
          isFlying: n.isFlying || undefined,
          hasCrosshair: hasCrosshair(n),
          isInWater: n.isInWater || undefined,
          isJumping: n.isJumping || undefined
        },
        block: {
          location: vec3ToFixed(a),
          typeId: i.blockTypeId,
          isSolid: i.isSolid,
          isContainer: i.isContainer,
          below: s ? {
            location: vec3ToFixed(s.location),
            typeId: s.typeId,
            isLiquid: s.isLiquid,
            isAir: s.isAir
          } : undefined,
          center: vec3ToFixed(t.center())
        },
        eventCanceled: e.cancel,
        face: e.face,
        faceLocation: vec3ToFixed(e.faceLocation),
        distance: i.distance,
        date: i.date
      }
    }, n);
    for (const a of HOOKS.onPlaceBlockAlways) {
      a(n, t, e, i);
    }
    if (!r) {
      for (const a of HOOKS.onPlaceBlock) {
        a(n, t, e, i);
      }
    }
  });
  world.beforeEvents.playerBreakBlock.subscribe(e => {
    const {
      block: t,
      player: n
    } = e;
    const a = t.location;
    const o = n.location;
    const i = {
      blockLoc: roundVector(a, 4),
      name: n?.name,
      date: Date.now(),
      id: n.id,
      playerLoc: roundVector(o, 4),
      headLoc: roundVector(n.getHeadLocation(), 4),
      playerVelocity: roundVector(n.getVelocity(), 4),
      viewDir: roundVector(n.getViewDirection(), 4),
      distance: Number(distance3d(o, a).toFixed(4)),
      blockTypeId: t.typeId,
      isSolid: t.isSolid,
      isContainer: t.hasComponent("minecraft:inventory")
    };
    const r = isBypass(n);
    queueEventWithPing({
      id: EVENT_IDS.playerBreakBlock,
      data: {
        player: {
          id: i.id,
          location: vec3ToFixed(i.playerLoc),
          name: i.name,
          headLoc: vec3ToFixed(i.headLoc),
          viewDir: vec3ToFixed(i.viewDir),
          velocity: vec3ToFixed(i.playerVelocity),
          bypass: r || undefined
        },
        block: {
          location: vec3ToFixed(i.blockLoc),
          typeId: i.blockTypeId,
          isSolid: i.isSolid,
          isContainer: i.isContainer
        },
        date: i.date
      }
    }, n);
    for (const a of HOOKS.onBreakBlockAlways) {
      a(n, t, e, i);
    }
    if (!isBypass(n)) {
      for (const a of HOOKS.onBreakBlock) {
        a(n, t, e, i);
      }
    }
  });
  world.beforeEvents.playerInteractWithBlock.subscribe(e => {
    const {
      block: t,
      player: n
    } = e;
    const a = t.location;
    const o = n.location;
    const i = t.above();
    const r = {
      blockLoc: roundVector(a, 4),
      name: n?.name,
      date: Date.now(),
      id: n.id,
      playerLoc: roundVector(o, 4),
      headLoc: roundVector(n.getHeadLocation(), 4),
      playerVelocity: roundVector(n.getVelocity(), 4),
      viewDir: roundVector(n.getViewDirection(), 4),
      distance: Number(distance3d(o, a).toFixed(4)),
      blockTypeId: t.typeId,
      isSolid: t.isSolid,
      isContainer: t.hasComponent("minecraft:inventory"),
      blockAbove: i,
      gamemode: n.gamemode
    };
    const s = [];
    if (r.isContainer) {
      const e = t?.getComponent("minecraft:inventory")?.container;
      for (let t = 0; t < e?.size; t++) {
        const n = e?.getItem(t);
        const tmp43 = {
          typeId: n?.typeId,
          amount: n?.amount
        };
        const tmp44 = {
          item: tmp43,
          slot: t
        };
        s.push(tmp44);
      }
    }
    const c = isBypass(n);
    queueEventWithPing({
      id: EVENT_IDS.playerInteractWithBlock,
      data: {
        player: {
          id: r.id,
          location: vec3ToFixed(o),
          name: r.name,
          headLoc: vec3ToFixed(r.headLoc),
          viewDir: vec3ToFixed(r.viewDir),
          velocity: vec3ToFixed(r.playerVelocity),
          bypass: c || undefined,
          rotation: vec2ToFixed(n.getRotation()),
          gamemode: r.gamemode
        },
        block: {
          location: vec3ToFixed(a),
          typeId: r.blockTypeId,
          isSolid: r.isSolid,
          isContainer: r.isContainer,
          container: s,
          above: i ? {
            isAir: i.isAir,
            typeId: i.typeId
          } : undefined
        },
        distance: r.distance,
        date: r.date
      }
    }, n);
    for (const a of HOOKS.onInteractBlockAlways) {
      a(n, t, e);
    }
    if (!isBypass(n)) {
      for (const a of HOOKS.onInteractBlock) {
        a(n, t, e, r);
      }
    }
  });
  world.beforeEvents.playerInteractWithEntity.subscribe(e => {
    const {
      player: t,
      target: n
    } = e;
    const a = Date.now();
    for (const a of HOOKS.onInteractEntityAlways) {
      a(t, n, e);
    }
    const o = {
      attackerVelocity: roundVector(t.getVelocity(), 4),
      playerLoc: roundVector(t.location, 4),
      id: t.id,
      name: t.name,
      targetId: n.id,
      targetVelocity: roundVector(n.getVelocity(), 4),
      headLoc: roundVector(t.getHeadLocation(), 4),
      targetLoc: roundVector(n.location, 4),
      targetAABB: n.getAABB(),
      viewDir: roundVector(t.getViewDirection(), 4),
      date: a,
      hasContainer: n.hasComponent(EntityComponentTypes.Inventory),
      gamemode: t.gamemode
    };
    const i = isBypass(t);
    queueEventWithPing({
      id: EVENT_IDS.entityInteract,
      data: {
        player: {
          location: vec3ToFixed(o.playerLoc),
          name: o.name,
          velocity: vec3ToFixed(o.attackerVelocity),
          id: o.id,
          headLoc: vec3ToFixed(o.headLoc),
          viewDir: vec3ToFixed(o.viewDir),
          bypass: isBypass(t) || undefined,
          hasCrosshair: hasCrosshair(t),
          gamemode: o.gamemode
        },
        target: {
          id: o.targetId,
          location: vec3ToFixed(o.targetLoc),
          AABB: aabbToFixed(o.targetAABB),
          velocity: vec3ToFixed(o.targetVelocity),
          hasContainer: o.hasContainer
        },
        date: a
      }
    }, t);
    if (!i) {
      for (const a of HOOKS.onInteractEntity) {
        a(t, n, e, o);
      }
    }
  });
  world.afterEvents.entityContainerOpened.subscribe(e => {
    const {
      openSource: t,
      entity: n
    } = e;
    const a = Date.now();
    const o = t.entity;
    queueEventWithPing({
      id: EVENT_IDS.entityContainerOpened,
      data: {
        player: {
          name: o?.name,
          id: o?.id,
          location: vec3ToFixed(o?.location),
          headLoc: vec3ToFixed(o?.getHeadLocation()),
          bypass: isBypass(o) || undefined
        },
        entity: {
          typeId: n.typeId,
          location: vec3ToFixed(n.location)
        },
        date: a
      }
    }, o);
  });
  world.afterEvents.entityContainerClosed.subscribe(e => {
    const {
      closeSource: t,
      entity: n
    } = e;
    const a = Date.now();
    const o = t.entity;
    queueEventWithPing({
      id: EVENT_IDS.entityContainerOpened,
      data: {
        player: {
          name: o?.name,
          id: o?.id,
          location: vec3ToFixed(o?.location),
          headLoc: vec3ToFixed(o?.getHeadLocation()),
          bypass: isBypass(o) || undefined
        },
        entity: {
          typeId: n.typeId,
          location: vec3ToFixed(n.location)
        },
        date: a
      }
    }, o);
  });
  registerContainerEvents();
  world.afterEvents.entityItemDrop.subscribe(e => {
    const {
      entity: t,
      items: n
    } = e;
    if (!(t instanceof Player)) {
      return;
    }
    if (isBypass(t)) {
      return;
    }
    const a = [];
    for (let e = 0; e < n.length; e++) {
      const t = n[e].getComponent("minecraft:item")?.itemStack.clone();
      const o = t?.getComponent("minecraft:durability");
      const tmp45 = {
        hasDurability: o?.isValid,
        damage: o?.damage,
        maxDurability: o?.maxDurability
      };
      const tmp46 = {};
      tmp46.typeId = t?.typeId;
      tmp46.amount = t?.amount;
      tmp46.durability = tmp45;
      a.push(tmp46);
    }
    queueEventWithPing({
      id: EVENT_IDS.itemDrop,
      data: {
        itemList: a,
        player: {
          name: t.name,
          id: t.id,
          bypass: isBypass(t) || undefined
        }
      },
      date: Date.now()
    }, t);
    const o = n.map(e => e.getComponent("item")?.itemStack).filter(e => !!e);
    const i = {};
    for (const e of HOOKS.onItemDrop) {
      e(t, o, i);
    }
  });
  world.afterEvents.itemStartUseOn.subscribe(e => {
    const {
      source: t,
      itemStack: n,
      block: a
    } = e;
    const o = Date.now();
    const tmp47 = {};
    tmp47.typeId = n?.typeId;
    const tmp48 = {};
    tmp48.typeId = a.typeId;
    queueEventWithPing({
      id: EVENT_IDS.itemStartUseOn,
      data: {
        player: {
          name: t?.name,
          id: t?.id,
          location: vec3ToFixed(t?.location),
          headLoc: vec3ToFixed(t?.getHeadLocation()),
          bypass: isBypass(t) || undefined,
          hasCrosshair: hasCrosshair(t)
        },
        item: tmp47,
        block: tmp48
      },
      date: o
    }, t);
  });
  world.afterEvents.itemStopUseOn.subscribe(e => {
    const {
      source: t,
      block: n
    } = e;
    const a = Date.now();
    queueEventWithPing({
      id: EVENT_IDS.itemStopUseOn,
      data: {
        player: {
          name: t?.name,
          id: t?.id,
          location: vec3ToFixed(t?.location),
          headLoc: vec3ToFixed(t?.getHeadLocation()),
          bypass: isBypass(t) || undefined,
          hasCrosshair: hasCrosshair(t)
        },
        block: {
          typeId: n.typeId,
          location: vec3ToFixed(n.location)
        }
      },
      date: a
    }, t);
  });
  world.beforeEvents.itemUse.subscribe(e => {
    const {
      source: t,
      itemStack: n
    } = e;
    const a = Date.now();
    const tmp49 = {
      typeId: n.typeId,
      amount: n.amount
    };
    queueEventWithPing({
      id: EVENT_IDS.itemUse,
      data: {
        player: {
          name: t?.name,
          id: t?.id,
          location: vec3ToFixed(t?.location),
          headLoc: vec3ToFixed(t?.getHeadLocation()),
          bypass: isBypass(t) || undefined,
          hasCrosshair: hasCrosshair(t)
        },
        item: tmp49
      },
      date: a
    }, t);
  });
});
world.afterEvents.playerGameModeChange.subscribe(({
  player: e,
  toGameMode: t
}) => {
  e.gamemode = t;
});
system.run(() => {
  for (const t of world.getPlayers()) {
    t.gamemode = t.getGameMode();
  }
});
// ==== 15b. WIRE-FORMAT KEY COMPRESSION ===========================================
const shortKeyMap = {
  i: "id"
};
shortKeyMap.d = "data";
shortKeyMap.p = "player";
shortKeyMap.n = "name";
shortKeyMap.l = "location";
shortKeyMap.j = "isJumping";
shortKeyMap.f = "isFalling";
shortKeyMap.s = "isSwimming";
shortKeyMap.g = "isOnGround";
shortKeyMap.v = "velocity";
shortKeyMap.di = "dimension";
shortKeyMap.b = "bypass";
shortKeyMap.iv = "isValid";
shortKeyMap.cp = "commandPermissionLevel";
shortKeyMap.pi = "ping";
shortKeyMap.is = "isSecondTick";
shortKeyMap.da = "date";
shortKeyMap.t = "target";
shortKeyMap.ti = "typeId";
shortKeyMap.a = "AABB";
shortKeyMap.vd = "viewDir";
shortKeyMap.hl = "headLoc";
shortKeyMap.r = "rotation";
shortKeyMap.gm = "gamemode";
shortKeyMap.hc = "hasCrosshair";
shortKeyMap.lt = "isLookingAtTheTarget";
shortKeyMap.hs = "hasSpear";
shortKeyMap.db = "dbName";
shortKeyMap.cb = "canBypass";
shortKeyMap.c = "container";
shortKeyMap.am = "amount";
shortKeyMap.sl = "slot";
shortKeyMap.bo = "block";
shortKeyMap.bl = "below";
shortKeyMap.ab = "above";
shortKeyMap.so = "isSolid";
shortKeyMap.ic = "isContainer";
shortKeyMap.ce = "center";
shortKeyMap.ec = "eventCanceled";
shortKeyMap.fa = "face";
shortKeyMap.fl = "faceLocation";
shortKeyMap.ds = "distance";
shortKeyMap.li = "isLiquid";
shortKeyMap.ia = "isAir";
shortKeyMap.if = "isFlying";
shortKeyMap.iw = "isInWater";
shortKeyMap.il = "itemList";
shortKeyMap.du = "durability";
shortKeyMap.hd = "hasDurability";
shortKeyMap.dm = "damage";
shortKeyMap.md = "maxDurability";
shortKeyMap.bi = "beforeItem";
shortKeyMap.ai = "afterItem";
shortKeyMap.ch = "chest";
shortKeyMap.ty = "type";
shortKeyMap.it = "inventory";
shortKeyMap.os = "openedChest";
shortKeyMap.en = "entity";
shortKeyMap.hv = "hasContainer";
shortKeyMap.me = "message";
shortKeyMap.la = "latency";
shortKeyMap.ed = "ended";
shortKeyMap.d2 = "distance2dSq";
shortKeyMap.im = "item";
shortKeyMap.va = "valid";
shortKeyMap.ma = "max";
shortKeyMap.cu = "current";
shortKeyMap.vb = "viewBlock";
const SHORT_TO_FULL = shortKeyMap;
const FULL_TO_SHORT = Object.create(null);
for (const [e, t] of Object.entries(SHORT_TO_FULL)) {
  FULL_TO_SHORT[t] = e;
}
function At(e) {
  if (e === null || typeof e != "object") {
    return e;
  }
  if (Array.isArray(e)) {
    return e.map(e => At(e));
  }
  const t = {};
  for (const n of Object.keys(e)) {
    t[FULL_TO_SHORT[n] ?? n] = At(e[n]);
  }
  return t;
}
function isBypass(e) {
  return !!e.isAdmin || !!e.cloudAdmin;
}
function setAdmin(e, t = true) {
  if (t) {
    e.isAdmin = true;
    adminDb.set(e.id, e.name);
  } else {
    delete e.isAdmin;
    adminDb.set(e.id);
  }
}
function isOperator(e) {
  return e.commandPermissionLevel > 0;
}
function getConfigValue(e, t) {
  return t.reduce((e, t) => e != null ? e[t] : undefined, e);
}
function setConfigAtPath(e, t, n) {
  if (e && Array.isArray(t) && t.length !== 0) {
    t.reduce((e, a, o) => {
      if (o === t.length - 1) {
        e[a] = n;
      } else if (e[a] === null || e[a] === undefined || typeof e[a] != "object") {
        e[a] = {};
      }
      return e[a];
    }, e);
    return e;
  } else {
    return e;
  }
}
function kickPlayer(e, t = "") {
  try {
    overworld.runCommand("kick \"" + e.name.replaceAll("\"", "\\\"") + "\" " + t);
  } catch {
    try {
      e.runCommand("kick @s " + t);
    } catch {
      console.warn("[Nexus] Failed to kick player due to unexpected reason " + e.name + "§r (" + e.id + ")");
    }
  } finally {
    try {
      e.remove();
    } catch {}
  }
}
function sendAlert(t, n, a = undefined) {
  const {
    target: o,
    tag: i
  } = n;
  switch (o) {
    case "exclude":
      if (a) {
        sendMessageToPlayers(world.getPlayers({
          excludeNames: [a.name]
        }), t);
      } else {
        world.sendMessage(t);
      }
      break;
    case "tag-and-admin":
    case "tag-and-op":
    case "tag":
      {
        const tmp50 = {
          tags: [i]
        };
        const n = world.getPlayers(tmp50);
        const tmp51 = {
          excludeTags: [i]
        };
        const tmp52 = {
          excludeTags: [i]
        };
        if (o === "tag-and-admin") {
          n.push(...world.getPlayers(tmp51).filter(e => e.isAdmin));
        } else {
          n.push(...world.getPlayers(tmp52).filter(e => isOperator(e)));
        }
        sendMessageToPlayers(n, t);
        break;
      }
    case "op":
      sendMessageToPlayers(world.getAllPlayers().filter(e => isOperator(e)), t);
    case "admin":
      sendMessageToPlayers(world.getAllPlayers().filter(e => e.isAdmin), t);
      break;
    default:
      world.sendMessage(t);
  }
}
function sendMessageToPlayers(e, t) {
  new Set(e).forEach(e => e.sendMessage(t));
}
function formatDuration(e) {
  if (!e) {
    return "Permanent";
  }
  const tmp53 = {
    unit: "century",
    ms: 3155760000000
  };
  const tmp54 = {};
  tmp54.unit = "year";
  tmp54.ms = 31557600000;
  const tmp55 = {
    unit: "month",
    ms: 2630016000
  };
  const tmp56 = {};
  tmp56.unit = "day";
  tmp56.ms = 86400000;
  const tmp57 = {
    unit: "hour",
    ms: 3600000
  };
  const tmp58 = {};
  tmp58.unit = "minute";
  tmp58.ms = 60000;
  const tmp59 = {
    unit: "second",
    ms: 1000
  };
  const t = [tmp53, tmp54, tmp55, tmp56, tmp57, tmp58, tmp59];
  let n = [];
  let a = e;
  for (const {
    unit: e,
    ms: o
  } of t) {
    const t = Math.floor(a / o);
    if (t > 0) {
      let i = e;
      if (t > 1) {
        i = e === "century" ? "centuries" : e + "s";
      }
      n.push(t + " " + i);
      a -= t * o;
    }
  }
  if (n.length > 0) {
    return n.join(" ");
  } else {
    return "0 seconds";
  }
}
function getMainhandItem(e) {
  return e.getComponent("equippable")?.getEquipment(EquipmentSlot.Mainhand);
}
function giveItem(e, t) {
  e.getComponent("inventory")?.container?.addItem(t);
}
function isSpear(e = "") {
  return e.startsWith("minecraft:") && e.endsWith("_spear");
}
function vec3ToFixed(e, t = 4) {
  if (e) {
    return [Number(e.x.toFixed(t)), Number(e.y.toFixed(t)), Number(e.z.toFixed(t))];
  }
}
function vec2ToFixed(e, t = 4) {
  if (e) {
    return [Number(e.x.toFixed(t)), Number(e.y.toFixed(t))];
  }
}
function aabbToFixed(e, t = 4) {
  if (!e) {
    return;
  }
  const n = e.center ?? e;
  const a = e.extent ?? {
    x: e.dx,
    y: e.dy,
    z: e.dz
  };
  return [Number(n.x.toFixed(t)), Number(n.y.toFixed(t)), Number(n.z.toFixed(t)), Number(a.x.toFixed(t)), Number(a.y.toFixed(t)), Number(a.z.toFixed(t))];
}
function samePosition(e, t) {
  return e.x === t.x && e.y === t.y && e.z === t.z;
}
function hasCrosshair(e) {
  const t = e.inputInfo;
  return t.lastInputModeUsed != "Touch" || t.touchOnlyAffectsHotbar;
}
function metaPath(e, t) {
  if (e.length === 0) {
    return [...e];
  }
  const n = [...e];
  const a = n.length - 1;
  n[a] = n[a] + "$" + t;
  return n;
}
function roundVector(e, t) {
  for (let n in e) {
    if (typeof e[n] == "number") {
      e[n] = Number(e[n].toFixed(t));
    }
  }
  return e;
}
function stripNameCounter(e) {
  return e.replace(/\([0-9]+\)$/, "");
}
function queueEvent(e) {
  outboundQueue.push(At(e));
}
function queueEventWithPing(e, n) {
  system.run(() => {
    if (e.data?.player) {
      e.data.player.ping = n instanceof Player ? n.getPing() : 0;
    }
    queueEvent(e);
  });
}
const nameSpoofDb = new Database("antiNamespoofNameData");
const openedChestLocations = new Map();
// ==== 16. CHAT COMMAND FRAMEWORK =================================================
const BASE_COMMAND_META = {
  description: "Test command",
  usage: "",
  category: "General"
};
class Command {
  static allCommands = [];
  static dispatch(n, a) {
    const o = CONFIG.prefix;
    if (a.startsWith("nexus.")) {
      a = a.replace("nexus.", "");
    } else {
      if (!a.startsWith(o)) {
        return false;
      }
      a = a.replace(o, "");
    }
    const i = function (e) {
      const t = [];
      let n = [];
      const tmp60 = {
        NORMAL: "NORMAL",
        IN_QUOTE: "IN_QUOTE"
      };
      const a = tmp60;
      let o = a.NORMAL;
      let i = false;
      for (let r = 0; r < e.length; r++) {
        const s = e[r];
        const c = e[r + 1];
        switch (o) {
          case a.NORMAL:
            if (s === "\\") {
              if (c !== undefined) {
                n.push(c);
                r++;
              } else {
                n.push(s);
              }
            } else if (/\s/.test(s)) {
              if (n.length > 0) {
                t.push(n.join(""));
                n = [];
              }
            } else if (s === "@" && n.length === 0 && c === "\"") {
              o = a.IN_QUOTE;
              r++;
            } else if (s === "\"") {
              o = a.IN_QUOTE;
            } else {
              n.push(s);
            }
            break;
          case a.IN_QUOTE:
            if (s === "\"") {
              if (c !== undefined && c !== " ") {
                i = true;
              }
              t.push(n.join(""));
              n = [];
              o = a.NORMAL;
            } else if (s === "\\" && c !== undefined) {
              n.push(c);
              r++;
            } else {
              n.push(s);
            }
        }
      }
      if (o === a.IN_QUOTE || i) {
        return null;
      }
      if (n.length > 0) {
        t.push(n.join(""));
      }
      return t;
    }(a.trim());
    if (i === null) {
      n.sendMessage(NEXUS_PREFIX + COLOR_ERROR + "Syntax Error: Unclosed quotation mark is not supported.");
      return true;
    }
    if (i.length === 0) {
      n.sendMessage(NEXUS_PREFIX + COLOR_ERROR + "Syntax Error: Empty command can't be handled correctly.");
      return true;
    }
    const r = Command.allCommands;
    const s = i.shift();
    const c = String(s).toLowerCase();
    const l = r.find(({
      name: e,
      aliases: t
    }) => e.toLowerCase() === c || t && t.some(e => e.toLowerCase() === c));
    if (!l) {
      n.sendMessage(NEXUS_PREFIX + COLOR_ERROR + "Unknown command: " + s + "§c, use " + COLOR_ACCENT + o + "help §cto get the command that is available.");
      return true;
    }
    if (l.adminOnly && !n.isAdmin) {
      n.sendMessage(NEXUS_PREFIX + COLOR_ERROR + "You don't have permission to use that command.");
      return true;
    }
    const d = l.params;
    if (i.length > d.length) {
      n.sendMessage(NEXUS_PREFIX + COLOR_ERROR + "Too many parameters provided. Expected at most " + d.length + ", but received " + i.length + ".");
      return true;
    }
    for (let t = 0; t < d.length; t++) {
      const a = d[t];
      const o = i[t];
      if (o === undefined) {
        if (a.optional) {
          break;
        }
        n.sendMessage(NEXUS_PREFIX + COLOR_ERROR + "Missing parameter: " + a.name);
        return true;
      }
      switch (a.type) {
        case "int":
        case "float":
          {
            const e = Number(o);
            if (isNaN(e)) {
              n.sendMessage(NEXUS_PREFIX + COLOR_ERROR + "You must enter a number for parameter: " + a.name);
              return true;
            }
            if (a.type === "int" && e % 1 == 0) {
              n.sendMessage(NEXUS_PREFIX + COLOR_ERROR + "You must enter an interger for parameter: " + a.name);
              return true;
            }
            if (a.lengthRange?.[0] && e < a.lengthRange[0] || a.lengthRange?.[1] && e < a.lengthRange[1]) {
              n.sendMessage(NEXUS_PREFIX + COLOR_ERROR + "Your string is too long for parameter: " + a.name + ". Range accepted: " + ((a.lengthRange[0] ?? "x") + "-" + (a.lengthRange[1] ?? "x")));
              return true;
            }
            i[t] = e;
            break;
          }
        case "bool":
          switch (o) {
            case "true":
            case "on":
            case "enable":
            case "1":
              i[t] = true;
              break;
            case "false":
            case "off":
            case "disable":
            case "0":
              i[t] = false;
              break;
            default:
              n.sendMessage(NEXUS_PREFIX + COLOR_ERROR + "You must enter §gtrue §cor §gfalse§c for parameter: " + a.name);
              return true;
          }
          break;
        case "player":
        case "op":
        case "non-op":
          {
            const r = o.replace(/^@/, "");
            const s = world.getPlayers({
              name: r
            })[0];
            if (!s) {
              n.sendMessage(NEXUS_PREFIX + COLOR_ERROR + "Unknown player: " + r);
              return true;
            }
            if (a.type === "op" && !s.isAdmin && !isOperator(n)) {
              n.sendMessage(NEXUS_PREFIX + COLOR_ERROR + "An operator is required in paramter: " + a.name);
              return true;
            }
            if (a.type === "non-op" && s.isAdmin) {
              n.sendMessage(NEXUS_PREFIX + COLOR_ERROR + "You can't target an admin.");
              return true;
            }
            if (!a.allowSelf && s.id === n.id) {
              n.sendMessage(NEXUS_PREFIX + COLOR_ERROR + "You can't target yourself.");
              return true;
            }
            i[t] = s;
            break;
          }
        case "name":
        case "opName":
        case "non-opName":
          {
            const r = o.replace(/^@/, "");
            if (a.type === "name") {
              i[t] = r;
              break;
            }
            const tmp61 = {
              name: r
            };
            const s = world.getPlayers(tmp61)[0];
            if (s) {
              const e = s.isAdmin;
              if (a.type === "opName") {
                if (!e) {
                  n.sendMessage(NEXUS_PREFIX + COLOR_ERROR + "An operator is required in paramter: " + a.name);
                  return true;
                }
              } else {
                if (e) {
                  n.sendMessage(NEXUS_PREFIX + COLOR_ERROR + "You can't target an admin.");
                  return true;
                }
                i[t] = s;
              }
            } else {
              const e = Object.values(adminDb.getAll()).find(e => e === r);
              if (a.type === "opName") {
                if (!e) {
                  n.sendMessage(NEXUS_PREFIX + COLOR_ERROR + "An operator is required in paramter: " + a.name);
                  return true;
                }
              } else {
                if (e) {
                  n.sendMessage(NEXUS_PREFIX + COLOR_ERROR + "You can't target an admin.");
                  return true;
                }
                i[t] = r;
              }
            }
            break;
          }
        case "duration":
          {
            let e = 0;
            if (!/^([1-9][0-9]*(ms|mm|s|m|h|d|w|y|c))+$/.test(o)) {
              n.sendMessage("Invalid duration format in parameter: " + a.name + ", correct format: <integer><ms/s/m/h/d/w/mm/y/c>[integer][unit]...");
              return true;
            }
            const r = o.match(/[0-9]+(ms|mm|s|m|j|d|w|y|c)/g);
            if (r === null) {
              return true;
            }
            r.forEach(t => {
              if (t.endsWith("ms")) {
                const n = Number(t.slice(0, -2));
                e += n;
                return;
              }
              if (t.endsWith("mm")) {
                const n = Number(t.slice(0, -2));
                e += n * 2630016000;
                return;
              }
              const n = t.charAt(t.length - 1);
              const a = Number(t.slice(0, -1));
              switch (n) {
                case "s":
                  e += a * 1000;
                  return;
                case "m":
                  e += a * 60000;
                  return;
                case "h":
                  e += a * 3600000;
                  return;
                case "d":
                  e += a * 86400000;
                  return;
                case "w":
                  e += a * 604800000;
                  return;
                case "y":
                  e += a * 31557600000;
                  return;
                case "c":
                  e += a * 3155760000000;
                  return;
              }
            });
            if (e === 0) {
              n.sendMessage(NEXUS_PREFIX + COLOR_ERROR + "Unexpected duration parsing error.");
              return true;
            }
            i[t] = e;
          }
        default:
          {
            const e = o.length;
            if (a.lengthRange?.[0] && e < a.lengthRange[0] || a.lengthRange?.[1] && e < a.lengthRange[1]) {
              n.sendMessage(NEXUS_PREFIX + COLOR_ERROR + "Your string is too long for parameter: " + a.name + ". Range accepted: " + ((a.lengthRange[0] ?? "x") + "-" + (a.lengthRange[1] ?? "x")));
              return true;
            }
          }
      }
    }
    system.run(() => {
      try {
        const e = l.execute(n, i);
        if (typeof e == "string") {
          n.sendMessage(e);
        }
      } catch (e) {
        console.error(e);
        n.sendMessage(NEXUS_PREFIX + COLOR_ERROR + "An error occurred while executing the command.");
      }
    });
    return true;
  }
  name = "";
  aliases = [];
  constructor() {
    Command.allCommands.push(this);
  }
  params = [];
  adminOnly = false;
  execute(e, t) {}
  meta = BASE_COMMAND_META;
}
world.beforeEvents.chatSend.subscribe(e => {
  const n = e.sender;
  const a = system.currentTick;
  if (n.lastChatTick && a - n.lastChatTick <= 4) {
    e.cancel = true;
    return;
  }
  const o = e.message;
  n.lastChatTick = a;
  if ((!CONFIG.toggle.misc.ghostMode || isOperator(n)) && Command.dispatch(n, o)) {
    e.cancel = true;
  }
});
const COMMAND_CATEGORIES = ["Information", "Setup", "Moderation", "Utility"];
function formatSectionHeader(e, t = 60) {
  const n = "§e" + e + "§r";
  const a = t - e.length;
  const o = Math.floor(a / 2);
  const i = a - o;
  return "§8" + "=".repeat(o) + " " + n + " §8" + "=".repeat(i);
}
// ==== 17. CHAT COMMANDS (registration) ===========================================
const HELP_META = {
  description: "Show all available commands.",
  usage: "",
  category: "information"
};
new class extends Command {
  name = "help";
  aliases = ["commandlist"];
  meta = HELP_META;
  adminOnly = false;
  execute(e) {
    const t = e.isAdmin;
    const n = Command.allCommands.filter(({
      adminOnly: e
    }) => !e || t);
    if (n.length === 0) {
      return NEXUS_PREFIX + COLOR_ERROR + "No command is available for you.";
    }
    const a = CONFIG.prefix;
    const o = ["§8[§uNexus§8] §eAvailable commands§8:", "§8<§cRequired parameter§8> §8[§aOptional parameter§8]"];
    const i = n.reduce((e, t) => {
      const n = t.meta.category.toLowerCase();
      e[n] ||= [];
      e[n].push(t);
      return e;
    }, {});
    for (const e of COMMAND_CATEGORIES) {
      const t = i[e.toLowerCase()];
      if (t) {
        o.push(formatSectionHeader(e));
        for (const {
          name: e,
          meta: {
            usage: n,
            description: i
          }
        } of t) {
          let t = "§8" + a + "§f" + e + "§r";
          if (n) {
            t += " " + n.replaceAll("<", "§8<§f").replaceAll(">", "§8>").replaceAll("[", "§8[§f").replaceAll("]", "§8]");
          }
          t += "§8 - §7" + i;
          o.push(t);
        }
      }
    }
    return o.join("\n");
  }
}();
new class extends Command {
  name = "oplist";
  adminOnly = true;
  meta = {
    description: "List all nexus admins.",
    usage: "",
    category: "information"
  };
  execute() {
    const e = Object.entries(adminDb.getAll());
    if (e.length === 0) {
      return NEXUS_PREFIX + "There are no nexus admins.";
    }
    const t = [NEXUS_PREFIX + "Nexus Admins:"];
    for (const [n, a] of e) {
      t.push("§l§8>> §r§g" + a + "§r §8(§fid: " + n + "§8)");
    }
    return t.join("\n");
  }
}();
new class extends Command {
  name = "banlist";
  meta = {
    description: "Show a list of banned players.",
    usage: "",
    category: "information"
  };
  adminOnly = true;
  execute(e) {
    const t = Object.values(banDb.getAll()).map(({
      name: e
    }) => e).concat(Object.keys(banNameDb.getAll()));
    if (t.length === 0) {
      return NEXUS_PREFIX + "No one is banned.";
    } else {
      return NEXUS_PREFIX + "Banned players:" + t.map(e => e.includes(" ") ? "§r\"" + e + "§r\"" : "§r" + e + "§r").reverse().join(", ");
    }
  }
}();
new class extends Command {
  name = "freezelist";
  meta = {
    description: "Show a list of frozen players.",
    usage: "",
    category: "information"
  };
  adminOnly = true;
  execute(e) {
    const t = Object.values(freezeDb.getAll()).map(({
      name: e
    }) => e);
    if (t.length === 0) {
      return NEXUS_PREFIX + "No one is frozen.";
    } else {
      return NEXUS_PREFIX + "Frozen players:" + t.map(e => e.includes(" ") ? "§r\"" + e + "§r\"" : "§r" + e + "§r").reverse().join(", ");
    }
  }
}();
const productInfoData = {
  name: "Nexus AntiCheat",
  version: "Nexus V2 A2.0.0",
  cloudStatus: serverNetModule ? backendSocket?.isOpen ? "§aConnected" : "§cDisconnected" : "§cNot supported",
  discord: "discord.gg/CqZGXeRKPJ",
  owners: "jasonlaubb (dc: @uwn_the_great) & Dr. Hex (dc: @_dr_hex_)"
};
const PRODUCT_INFO = productInfoData;
const INFO_META = {};
INFO_META.description = "Show information about Nexus Anticheat.";
INFO_META.usage = "";
INFO_META.category = "information";
new class extends Command {
  name = "info";
  aliases = ["download", "about", "acinfo", "status"];
  meta = INFO_META;
  adminOnly = false;
  execute(e) {
    PRODUCT_INFO.cloudStatus = serverNetModule ? backendSocket?.isOpen ? "§aConnected" : "§cDisconnected" : "§cNot supported";
    return NEXUS_PREFIX + COLOR_HIGHLIGHT + "Product information:§r\n§fProduct Name §l§8:§r §7" + PRODUCT_INFO.name + "\n§fVersion §l§8:§r §7" + PRODUCT_INFO.version + "\n§fCloud Service §l§8:§r §7" + PRODUCT_INFO.cloudStatus + "\n§fDiscord Link §l§8:§r §7" + PRODUCT_INFO.discord + "\n§fOwner(s) §l§8:§r §7" + PRODUCT_INFO.owners;
  }
}();
new class extends Command {
  name = "password";
  adminOnly = true;
  meta = {
    description: "Set or change the admin password. If you set a password, only those who know the password can use admin commands.",
    usage: "<set|remove|forget> [new password|current password] [confirm password] [previous password]",
    category: "setup"
  };
  params = [{
    name: "action",
    type: "any"
  }, {
    name: "newPassword",
    type: "any",
    optional: true
  }, {
    name: "confirmPassword",
    type: "any",
    optional: true
  }, {
    name: "previousPassword",
    type: "any",
    optional: true
  }];
  execute(e, t) {
    const [n, a, o, r] = t;
    const s = centreDb.get("adminPassword");
    switch (n) {
      case "set":
        if (a && a !== o) {
          return NEXUS_PREFIX + COLOR_ERROR + "New password and confirm password do not match.";
        } else if (a) {
          if (o) {
            if (s && !r) {
              return NEXUS_PREFIX + COLOR_ERROR + "You must provide the previous password to change it.";
            } else if (s && r !== s) {
              return NEXUS_PREFIX + COLOR_ERROR + "The provided previous password is incorrect.";
            } else if (a.length < 8) {
              return NEXUS_PREFIX + COLOR_ERROR + "The new password must be at least 8 characters long to ensure security.";
            } else {
              centreDb.set("adminPassword", a);
              if (s) {
                return NEXUS_PREFIX + "Admin password has been changed successfully.";
              } else {
                return NEXUS_PREFIX + "Admin password has been set successfully.";
              }
            }
          } else {
            return NEXUS_PREFIX + COLOR_ERROR + "You must confirm the new password to prevent typos.";
          }
        } else {
          return NEXUS_PREFIX + COLOR_ERROR + "You must provide a new password.";
        }
      case "remove":
        if (s) {
          if (a) {
            if (a !== s) {
              return NEXUS_PREFIX + COLOR_ERROR + "The provided password is incorrect.";
            } else {
              centreDb.set("adminPassword");
              return NEXUS_PREFIX + "Admin password has been removed successfully.";
            }
          } else {
            return NEXUS_PREFIX + COLOR_ERROR + "You must provide the current password to remove it.";
          }
        } else {
          return NEXUS_PREFIX + COLOR_ERROR + "There is no admin password set.";
        }
      case "forget":
        if (function () {
          try {
            new ItemStack("nexus:rescue_tool_enabled");
            return true;
          } catch {
            return false;
          }
        }()) {
          centreDb.set("adminPassword");
          return NEXUS_PREFIX + "Admin password has been forgotten. You can now set a new password without providing the old one.";
        } else {
          return NEXUS_PREFIX + COLOR_ERROR + "You must have the §gNexus Rescue Tool§c installed in this world to use this action.";
        }
    }
  }
}();
new class extends Command {
  name = "op";
  aliases = ["setadmin"];
  meta = {
    description: "Set a player as nexus opped.",
    usage: "[player] [password]",
    category: "moderation"
  };
  params = [{
    name: "player",
    type: "non-op",
    optional: true
  }, {
    name: "password",
    type: "any",
    optional: true
  }];
  execute(e, t) {
    if (!isOperator(e)) {
      return NEXUS_PREFIX + COLOR_ERROR + "You must be a server operator to use this command.";
    }
    const [n, a] = t;
    if (e.isAdmin && !n) {
      return NEXUS_PREFIX + COLOR_ERROR + "You have already been a nexus admin.";
    }
    const o = centreDb.get("adminPassword");
    if (o) {
      if (!a) {
        return NEXUS_PREFIX + COLOR_ERROR + "You must provide the admin password to use this command.";
      }
      if (a !== o) {
        return NEXUS_PREFIX + COLOR_ERROR + "Incorrect password.";
      }
    }
    setAdmin(n || e);
    return NEXUS_PREFIX + (n ? "Player " + COLOR_ACCENT + n.name + " " + COLOR_HIGHLIGHT + "is now a nexus admin." : "You are now a nexus admin.");
  }
}();
new class extends Command {
  name = "deop";
  aliases = ["deladmin"];
  adminOnly = true;
  meta = {
    description: "Remove admin status from a player.",
    usage: "[player] [password]",
    category: "moderation"
  };
  params = [{
    name: "player",
    type: "player",
    optional: true
  }, {
    name: "password",
    type: "any",
    optional: true
  }];
  execute(e, [t, n]) {
    const a = centreDb.get("adminPassword");
    if (a) {
      if (!n) {
        return NEXUS_PREFIX + COLOR_ERROR + "You must provide the admin password to use this command.";
      }
      if (n !== a) {
        return NEXUS_PREFIX + COLOR_ERROR + "Incorrect password.";
      }
    }
    if (!t || t instanceof Player) {
      setAdmin(t || e, false);
    } else {
      adminDb.set(adminDb.getAll().find(e => e === t));
    }
    return NEXUS_PREFIX + (t ? "Player " + COLOR_ACCENT + t.name + " " + COLOR_HIGHLIGHT + "is no longer a nexus admin." : "You are no longer a nexus admin.");
  }
}();
new class extends Command {
  name = "ban";
  adminOnly = true;
  meta = {
    description: "Ban a player.",
    usage: "<player> [reason] [duration]",
    category: "moderation"
  };
  params = [{
    name: "player",
    type: "non-opName"
  }, {
    name: "reason",
    type: "any",
    optional: true
  }, {
    name: "duration",
    type: "duration",
    optional: true
  }];
  execute(e, [t, n, a]) {
    const o = isBanned(t.name ?? t);
    if (isBanned(t.name ?? t)) {
      e.sendMessage(NEXUS_PREFIX + "Updated ban data of " + (t.name ?? t));
    }
    if (typeof t == "string") {
      banPlayer(t, e.name, "name", n, a);
    } else {
      banPlayer(t.id, e.name, "id", n, a, t.name);
    }
    if (!o) {
      if (a) {
        return NEXUS_PREFIX + "Banned " + COLOR_ACCENT + (t?.name ?? t) + "§e for " + COLOR_ACCENT + formatDuration(a) + "§e.";
      } else {
        return NEXUS_PREFIX + "Banned " + COLOR_ACCENT + (t?.name ?? t) + "§e forever. Use /unban if you want to unban him.";
      }
    }
  }
}();
new class extends Command {
  name = "unban";
  adminOnly = true;
  meta = {
    description: "Unban a player.",
    usage: "<player>",
    category: "moderation"
  };
  params = [{
    name: "player",
    type: "name"
  }];
  execute(e, [t]) {
    if (unbanName(t)) {
      return NEXUS_PREFIX + "Unbanned " + COLOR_ACCENT + t + "§e successfully.";
    } else {
      return NEXUS_PREFIX + COLOR_ERROR + t + "§r§c is not banned. Use §g/banlist§c to check banned players.";
    }
  }
}();
new class extends Command {
  name = "freeze";
  adminOnly = true;
  meta = {
    description: "Freeze a player.",
    usage: "<player> [reason] [duration]",
    category: "moderation"
  };
  params = [{
    name: "player",
    type: "non-op"
  }, {
    name: "reason",
    type: "any",
    optional: true
  }, {
    name: "duration",
    type: "duration",
    optional: true
  }];
  execute(e, [t, n, a]) {
    freezePlayer(t, e.name, n, a);
    return NEXUS_PREFIX + (freezeDb.has(t) ? "Updated freeze data for §g" + t.name : "Freezed §g" + t.name + "§e for " + COLOR_ACCENT + formatDuration(a));
  }
}();
new class extends Command {
  name = "unfreeze";
  aliases = ["unfroze"];
  adminOnly = true;
  meta = {
    description: "Unfreeze a player.",
    usage: "<player>",
    category: "moderation"
  };
  params = [{
    name: "player",
    type: "name"
  }];
  execute(e, [t]) {
    const n = Object.entries(freezeDb.getAll()).find(([e, n]) => n.name === t)?.[0];
    if (n) {
      releaseFreeze(e, freezeDb.get(n));
      freezeDb.set(n);
      return NEXUS_PREFIX + "Unfroze " + COLOR_ACCENT + t + "§e successfully.";
    } else {
      return NEXUS_PREFIX + COLOR_ACCENT + t + COLOR_ERROR + " is not frozen. Use §g/freezelist§c to check frozen players.";
    }
  }
}();
new class extends Command {
  name = "invcopy";
  meta = {
    description: "Copy a player's inventory.",
    usage: "<player>",
    category: "moderation"
  };
  params = [{
    name: "player",
    type: "player",
    allowSelf: false
  }];
  adminOnly = true;
  execute(e, [t]) {
    const n = e.getComponent("inventory")?.container;
    const a = t.getComponent("inventory").container;
    if (!n) {
      return;
    }
    for (let e = 0; e < 36; e++) {
      n.setItem(e, a.getItem(e));
    }
    const o = t.getComponent("equippable");
    const i = e.getComponent("equippable");
    if (i) {
      ["Head", "Chest", "Legs", "Feet", "Offhand"].forEach(e => {
        i.setEquipment(e, o.getEquipment(e));
      });
      return NEXUS_PREFIX + "Inventory copied!";
    } else {
      return undefined;
    }
  }
}();
// ==== 18. PROTECTED STORAGE (invsee / echest / chest / barrel) ===================
const protectedStorageDb = new Database("ZXhhY3RseWp1ZGdlZG9vcmZsb3dlcmNhbm5vdGR1cmluZ3RocmVhZHByaWNlY3VydmU=");
function storageKey(e, t) {
  return e + ":" + t.x + "," + t.y + "," + t.z;
}
function spawnProtectedChest(e, n, a) {
  n = floorVector(n);
  const o = a.id;
  const i = storageKey(o, n);
  const r = {
    x: n.x + 1,
    y: n.y,
    z: n.z
  };
  const s = storageKey(o, r);
  const c = a.getBlock(n);
  const l = a.getBlock(r);
  if (c && c.isAir && l && l.isAir && !protectedStorageDb.get(i) && !protectedStorageDb.get(s)) {
    c.setType("minecraft:chest");
    l.setType("minecraft:chest");
    system.runTimeout(() => {
      const t = c.getComponent("inventory")?.container;
      if (t) {
        protectedStorageDb.set(i, r.x + "," + r.y + "," + r.z);
        protectedStorageDb.set(s, n.x + "," + n.y + "," + n.z);
        for (let n = 0; n < 54; n++) {
          const a = e[n];
          if (a) {
            t.setItem(n, a);
          }
        }
      }
    }, 1);
    return c;
  }
}
function spawnProtectedBarrel(e, n, a) {
  n = floorVector(n);
  const o = storageKey(a.id, n);
  const i = a.getBlock(n);
  if (i && i.isAir && !protectedStorageDb.has(o)) {
    i.setType("minecraft:barrel");
    system.runTimeout(() => {
      const t = i.getComponent("inventory")?.container;
      if (t) {
        protectedStorageDb.set(o, "barrel");
        for (let n = 0; n < 27; n++) {
          const a = e[n];
          if (a) {
            t.setItem(n, a);
          }
        }
      }
    }, 1);
    return i;
  }
}
HOOKS.onBreakBlockAlways.push((e, n, a) => {
  const o = n.dimension.id;
  const i = n.typeId;
  if (e.isAdmin) {
    if (i === "minecraft:chest") {
      const i = floorVector(n.location);
      const r = protectedStorageDb.get(storageKey(o, i));
      if (!r) {
        return;
      }
      const s = r.split(",").map(Number);
      const c = {
        x: s[0],
        y: s[1],
        z: s[2]
      };
      protectedStorageDb.set(storageKey(o, i));
      protectedStorageDb.set(storageKey(o, c));
      a.cancel = true;
      system.run(() => {
        n.setType("minecraft:air");
        n.dimension.getBlock(c)?.setType("minecraft:air");
        system.runTimeout(() => {
          const tmp62 = {
            x: (i.x + c.x) / 2,
            y: (i.y + c.y) / 2
          };
          tmp62.z = (i.z + c.z) / 2;
          const tmp63 = {
            location: tmp62,
            maxDistance: 3
          };
          tmp63.type = "minecraft:item";
          n.dimension.getEntities(tmp63).forEach(e => e.remove());
        }, 1);
      });
      e.sendMessage(NEXUS_PREFIX + "Protected large chest removed.");
    } else if (i === "minecraft:barrel") {
      const i = floorVector(n.location);
      protectedStorageDb.set(storageKey(o, i));
      a.cancel = true;
      system.run(() => {
        n.setType("minecraft:air");
        system.runTimeout(() => {
          const tmp64 = {
            location: i,
            maxDistance: 3,
            type: "minecraft:item"
          };
          n.dimension.getEntities(tmp64).forEach(e => e.remove());
        }, 1);
      });
      e.sendMessage(NEXUS_PREFIX + "Protected barrel removed.");
    }
    return;
  }
  const r = floorVector(n.location);
  const s = {
    x: r.x,
    y: r.y + 1,
    z: r.z
  };
  if (i === "minecraft:chest") {
    if (protectedStorageDb.has(storageKey(o, r)) || protectedStorageDb.has(storageKey(o, s))) {
      a.cancel = true;
      e.sendMessage(NEXUS_PREFIX + "That location is protected.");
    }
  } else if (i === "minecraft:barrel" && protectedStorageDb.has(storageKey(o, r))) {
    a.cancel = true;
    e.sendMessage(NEXUS_PREFIX + "That location is protected.");
  }
});
HOOKS.onPlaceBlock.push((e, t, n) => {
  const a = t.typeId;
  if (a !== "minecraft:chest" && a !== "minecraft:barrel") {
    return;
  }
  const o = t.dimension.id;
  const i = {
    x: t.location.x,
    y: t.location.y + 1,
    z: t.location.z
  };
  if (protectedStorageDb.has(storageKey(o, i))) {
    n.cancel = true;
    e.sendMessage(NEXUS_PREFIX + "That location is protected.");
  }
});
HOOKS.onInteractBlock.push((e, t, n) => {
  const a = t.typeId;
  if (a !== "minecraft:chest" && a !== "minecraft:barrel") {
    return;
  }
  const o = t.dimension.id;
  if (protectedStorageDb.has(storageKey(o, floorVector(t.location)))) {
    n.cancel = true;
    e.sendMessage(NEXUS_PREFIX + "That location is protected.");
  }
});
new class extends Command {
  name = "invsee";
  meta = {
    category: "moderation",
    description: "Copy another player's inventory into a protected large chest for you to view.",
    usage: "<player>"
  };
  adminOnly = true;
  params = [{
    name: "player",
    type: "player"
  }];
  execute(e, [n]) {
    const o = n.getComponent("minecraft:inventory").container;
    const i = [];
    for (let e = 9; e < 36; e++) {
      i.push(o.getItem(e));
    }
    i.push(...new Array(9).fill(undefined));
    for (let e = 0; e < 9; e++) {
      i.push(o.getItem(e));
    }
    const r = n.getComponent("minecraft:equippable");
    i[50] = r.getEquipment(EquipmentSlot.Head);
    i[51] = r.getEquipment(EquipmentSlot.Chest);
    i[52] = r.getEquipment(EquipmentSlot.Legs);
    i[53] = r.getEquipment(EquipmentSlot.Feet);
    i[45] = r.getEquipment(EquipmentSlot.Offhand);
    i.map(e => e === null ? undefined : e);
    system.run(() => {
      const tmp65 = {
        x: e.location.x,
        y: e.location.y + 3,
        z: e.location.z
      };
      spawnProtectedChest(i, tmp65, e.dimension);
      e.teleport({
        x: Math.floor(e.location.x) + 0.5,
        y: e.location.y,
        z: Math.floor(e.location.z) + 0.5
      }, {
        rotation: {
          x: -85,
          y: e.getRotation().y
        }
      });
    });
    return NEXUS_PREFIX + "Open chest (above your head) to take a look on " + n.name + "'s inventory. Break it to remove it safely when you are done.";
  }
}();
new class extends Command {
  name = "echestwipe";
  meta = {
    description: "Wipe enderchest of a player.",
    usage: "<player> [itemType]",
    category: "moderation"
  };
  params = [{
    name: "player",
    type: "player"
  }];
  adminOnly = true;
  execute(e, [n]) {
    system.run(() => {
      n.getComponent("minecraft:ender_inventory").container.clearAll();
    });
    return NEXUS_PREFIX + "Removed all enderchest item of " + n.name;
  }
}();
new class extends Command {
  name = "echestcopy";
  meta = {
    description: "Copy all enderchest item of a player to your inventory.",
    usage: "<player>",
    category: "moderation"
  };
  params = [{
    name: "player",
    type: "player"
  }];
  adminOnly = true;
  execute(e, [n]) {
    system.run(() => {
      const t = n.getComponent("minecraft:ender_inventory").container;
      const a = e.getComponent("inventory")?.container;
      if (a) {
        for (let e = 0; e < 27; e++) {
          const n = t.getItem(e);
          if (n) {
            a.setItem(e + 9, n);
          }
        }
      }
    });
    return NEXUS_PREFIX + "All enderchest item of " + COLOR_ACCENT + n.name + "§e has been copied to your inventory.";
  }
}();
new class extends Command {
  name = "echestsee";
  meta = {
    description: "View a player's enderchest.",
    usage: "<player>",
    category: "moderation"
  };
  params = [{
    name: "player",
    type: "player"
  }];
  adminOnly = true;
  execute(e, [n]) {
    const a = n.getComponent("minecraft:ender_inventory")?.container;
    if (!a) {
      return;
    }
    const o = [];
    for (let e = 0; e < 27; e++) {
      const t = a.getItem(e);
      o.push(t);
    }
    system.run(() => {
      const tmp66 = {
        x: e.location.x,
        y: e.location.y,
        z: e.location.z
      };
      const t = spawnProtectedBarrel(o, tmp66, e.dimension);
      if (t) {
        e.tryTeleport({
          x: t.location.x + 0.5,
          y: t.location.y + 1,
          z: t.location.z + 0.5
        }, {
          rotation: {
            x: 87,
            y: e.getRotation().y
          }
        });
      }
    });
    return NEXUS_PREFIX + "All enderchest item has been generated to the barrel.\n§a- Open it to view the enderchest's item\n- Break it to remove the barrel safely.";
  }
}();
new class extends Command {
  name = "despawn";
  adminOnly = true;
  meta = {
    description: "Remove specfic type of entities in all dimensions without dropping loot.",
    usage: "[entityId|!entityId|all] [skipNamed]",
    category: "moderation"
  };
  params = [{
    name: "depsawnTarget",
    type: "any",
    optional: true
  }, {
    name: "skipNamed",
    type: "bool",
    optional: true
  }];
  execute(n, [a, o]) {
    let i = false;
    if (a.startsWith("!")) {
      i = true;
      a = a.slice(1);
    }
    if (a === "all") {
      a = undefined;
    } else if (!a.startsWith("minecraft:")) {
      a = "minecraft:" + a;
    }
    const r = [];
    ["minecraft:overworld", "minecraft:the_end", "minecraft:nether"].map(t => world.getDimension(t)).forEach(e => {
      const tmp67 = {
        excludeTypes: a
      };
      const tmp68 = {
        type: a
      };
      const tmp69 = {
        excludeTypes: a
      };
      const tmp70 = {};
      tmp70.type = a;
      if (o) {
        if (i) {
          r.push(...e.getEntities(tmp67).filter(({
            nameTag: e
          }) => !e));
        } else {
          r.push(...e.getEntities(tmp68).filter(({
            nameTag: e
          }) => !e));
        }
      } else if (i) {
        r.push(...e.getEntities(tmp69));
      } else {
        r.push(...e.getEntities(tmp70));
      }
    });
    system.run(() => {
      r.forEach(e => e.remove());
    });
    return NEXUS_PREFIX + "Removed " + r.length + (r.length === 1 ? " entity" : " entities");
  }
}();
new class extends Command {
  name = "setToken";
  adminOnly = true;
  meta = {
    description: "set the token that the anticheat will use to verify and authenticate to the backend",
    usage: "<token>",
    category: "moderation"
  };
  params = [{
    name: "key",
    type: "any"
  }];
  execute(e, [t]) {
    e.sendMessage(NEXUS_PREFIX + "§ethe license key has been set to be " + t);
    licenseDb.set("current", t);
    connectionAttempts = 0;
    retryNotBefore = 0;
  }
}();
new class extends Command {
  name = "deleteToken";
  adminOnly = true;
  meta = {
    description: "delete the current token causing the anticheat that it will not try connect to backend server of nexus.",
    usage: "",
    category: "moderation"
  };
  params = [];
  execute(e, []) {
    e.sendMessage(NEXUS_PREFIX + "§cthe license key has been deleted!");
    licenseDb.set("current", false);
  }
}();
new class extends Command {
  name = "disconnect";
  adminOnly = true;
  meta = {
    description: "disconnects from the nexus backend server.",
    usage: "",
    category: "moderation"
  };
  params = [];
  execute(e, []) {
    if (backendSocket?.isOpen) {
      backendSocket.close();
      e.sendMessage(NEXUS_PREFIX + "§edisconnected from the backend");
      return;
    }
    e.sendMessage(NEXUS_PREFIX + "§cthe anticheat already isnt connected yet!");
  }
}();
new class extends Command {
  name = "setServer";
  adminOnly = true;
  meta = {
    description: "set the default server that the anticheat will try to connect to.",
    usage: "<server: NA/AS/EU>",
    category: "moderation"
  };
  params = [{
    name: "targetedServer",
    type: "any"
  }];
  execute(e, [t]) {
    const n = String(t || "").toUpperCase();
    const a = BACKEND_SERVERS.find(e => e.id === n);
    if (a) {
      serverDb.set("current", a);
      e.sendMessage(NEXUS_PREFIX + "§atarget server has been changed to §e" + a.id + "§a. If Nexus is already connected, use §edisconnect §aand it reconnects to the new server within about 10 seconds.");
    } else {
      e.sendMessage(NEXUS_PREFIX + "§cUnknown server §e" + t + "§c. Choose one of: §e" + BACKEND_SERVERS.filter(e => e.id !== "LOCAL").map(e => e.id).join("§7, §e") + "§c (pick the closest to your server).");
    }
  }
}();
new class extends Command {
  name = "autoReconnect";
  adminOnly = true;
  meta = {
    description: "Change wether the pack should auto reconnect or no.",
    usage: "<boolean: true/false>",
    category: "moderation"
  };
  params = [{
    name: "status",
    type: "boolean"
  }];
  execute(e, [t]) {
    if (t.toLowerCase() == "true") {
      reconnectDb.set("current", true);
    } else {
      if (t.toLowerCase() != "false") {
        e.sendMessage(NEXUS_PREFIX + "§cThe value entred isnt a boolean! please use true/false");
        return;
      }
      reconnectDb.set("current", false);
    }
    e.sendMessage(NEXUS_PREFIX + "§eAuto reconnect has been set to " + t);
  }
}();
new class extends Command {
  name = "connect";
  adminOnly = true;
  meta = {
    description: "Use this command to connect to the backend server.",
    usage: "",
    category: "moderation"
  };
  params = [];
  execute(e, [t]) {
    if (backendSocket?.isOpen) {
      e.sendMessage(NEXUS_PREFIX + "§cThe anticheat is already connected");
      return;
    }
    const n = serverDb.get("current");
    if (!licenseDb.get("current")) {
      e.sendMessage(NEXUS_PREFIX + "§cTheres no license key set! Set it with §e" + CONFIG.prefix + "setToken <key>§c. Get a free key with /token free in our Discord: §u" + DISCORD_LINK);
      if (n) {
        e.sendMessage(NEXUS_PREFIX + "§cThe AntiCheat doesnt have a target server. §eChoose one with " + CONFIG.prefix + "setServer <NA|EU|AS>§e.");
        return;
      } else {
        return undefined;
      }
    }
    connectToBackend();
  }
}();
new class extends Command {
  name = "ui";
  aliases = ["commandlist"];
  meta = {
    description: "Open nexus admin ui",
    usage: "",
    category: "utility"
  };
  adminOnly = true;
  execute(e) {
    system.run(() => openMainUi(e));
    return NEXUS_PREFIX + "Close the chat screen to view the Admin UI.";
  }
}();
new class extends Command {
  name = "uiitem";
  aliases = ["itemui"];
  meta = {
    description: "Get nexus admin ui item.",
    usage: "",
    category: "utility"
  };
  adminOnly = true;
  execute(e) {
    system.run(() => {
      giveItem(e, new ItemStack("nexus:ui", 1));
    });
    return e.sendMessage(NEXUS_PREFIX + "You have been given the ui item. Hold the item and use it to open nexus admin ui.");
  }
}();
new class extends Command {
  name = "gma";
  adminOnly = true;
  meta = {
    description: "Change your gamemode to advanture.",
    category: "utility",
    usage: ""
  };
  execute(e) {
    system.run(() => e.setGameMode(GameMode.Adventure));
    return NEXUS_PREFIX + "Your gamemode is changed to Adventure.";
  }
}();
new class extends Command {
  name = "gmc";
  adminOnly = true;
  meta = {
    description: "Change your gamemode to creative.",
    category: "utility",
    usage: ""
  };
  execute(e) {
    system.run(() => e.setGameMode(GameMode.Creative));
    return NEXUS_PREFIX + "Your gamemode is changed to Creative";
  }
}();
new class extends Command {
  name = "gms";
  adminOnly = true;
  meta = {
    description: "Change your gamemode to survival",
    category: "utility",
    usage: ""
  };
  execute(e) {
    system.run(() => e.setGameMode(GameMode.Survival));
    return NEXUS_PREFIX + "Your gamemode is changed to Survival.";
  }
}();
new class extends Command {
  name = "gmsp";
  adminOnly = true;
  meta = {
    description: "Change your gamemode to spectator.",
    category: "utility",
    usage: ""
  };
  execute(e) {
    system.run(() => e.setGameMode(GameMode.Spectator));
    return NEXUS_PREFIX + "Your gamemode is changed to Spectator.";
  }
}();
new class extends Command {
  name = "fakeleave";
  meta = {
    category: "utility",
    description: "Send a translated fake leave message (only).",
    usage: "[isRealmMessage (Default: false)]"
  };
  params = [{
    name: "isRealmMessage",
    type: "bool",
    optional: true
  }];
  adminOnly = true;
  execute(t, n) {
    const tmp71 = {
      text: "§e"
    };
    const tmp72 = {
      translate: n[0] ? "multiplayer.player.left.realms" : "multiplayer.player.left",
      with: [t.name]
    };
    const tmp73 = {
      rawtext: [tmp71, tmp72]
    };
    world.sendMessage(tmp73);
    return NEXUS_PREFIX + "Success!";
  }
}();
new class extends Command {
  name = "chest";
  adminOnly = true;
  meta = {
    description: "Create a protected large chest (north-to-east) in current location that only verified admin can open.",
    category: "utility",
    usage: ""
  };
  execute(e) {
    system.run(() => {
      spawnProtectedChest([], e.location, e.dimension);
    });
    return NEXUS_PREFIX + "A protected large chest has been created at your location.";
  }
}();
new class extends Command {
  name = "barrel";
  adminOnly = true;
  meta = {
    description: "Create a protected barrel in current location that only verified admin can open.",
    category: "utility",
    usage: ""
  };
  execute(e) {
    system.run(() => {
      spawnProtectedBarrel([], e.location, e.dimension);
    });
    return NEXUS_PREFIX + "A protected barrel has been created at your location.";
  }
}();
// ==== 19. DETECTION — COMBAT (aim, breach-swap, autoclicker, reach, killaura) ====
const activeAimTrackKeys = new Set();
HOOKS.onAttack.push(function (e, t, n, a) {
  if (!CONFIG.toggle.detection.combat.aim$P) {
    return;
  }
  const o = a.id + ":" + a.targetId;
  if (activeAimTrackKeys.has(o)) {
    return;
  }
  activeAimTrackKeys.add(o);
  const tmp74 = {};
  tmp74.startDate = a.date;
  const i = CONFIG.advanced.constant.aim;
  const r = tmp74;
  HOOKS.onTickTasks.push(function n() {
    const a = Date.now();
    if (!e.isValid || !t.isValid || a - r.startDate > i.trackDuration) {
      activeAimTrackKeys.delete(o);
      const i = HOOKS.onTickTasks.indexOf(n);
      if (i !== -1) {
        HOOKS.onTickTasks.splice(i, 1);
      }
      queueEvent({
        id: EVENT_IDS.attackTick,
        data: {
          player: {
            name: e?.name,
            id: e?.id
          },
          target: {
            id: t?.id
          },
          ended: true,
          date: a
        }
      });
      return;
    }
    queueEvent({
      id: EVENT_IDS.attackTick,
      data: {
        player: {
          name: e.name,
          id: e.id,
          rotation: vec2ToFixed(e.getRotation()),
          velocity: vec3ToFixed(e.getVelocity()),
          viewDir: vec3ToFixed(e.getViewDirection()),
          headLoc: vec3ToFixed(e.getHeadLocation())
        },
        target: {
          id: t.id,
          typeId: t.typeId,
          location: vec3ToFixed(t.location),
          velocity: vec3ToFixed(t.getVelocity()),
          AABB: aabbToFixed(t.getAABB())
        },
        date: a
      }
    });
  });
});
const breachSwapLastUse = new Map();
HOOKS.onAttack.push((e, t, n, a) => {
  if (!CONFIG.toggle.moderation.antiBreachSwap || !CONFIG.advanced.constant.antiBreachSwap.maceItem.includes(getMainhandItem(e)?.typeId ?? "minecraft:air")) {
    return;
  }
  const o = breachSwapLastUse.get(a.id) ?? 0;
  if (o) {
    const t = a.date - o;
    if (t < CONFIG.advanced.constant.antiBreachSwap.cooldown) {
      n.cancel = true;
      e.sendMessage(NEXUS_PREFIX + "§cBreach item is currently in cooldown, please wait §g" + (CONFIG.advanced.constant.antiBreachSwap.cooldown - t) / 1000 + " §cseconds.");
      return;
    }
  }
  breachSwapLastUse.set(a.id, a.date);
});
HOOKS.onPlayerTick.push((n, a) => {
  if (!CONFIG.toggle.moderation.worldBorder) {
    return;
  }
  const {
    x: o,
    z: i
  } = a.location;
  const r = CONFIG.advanced.moduleSettings.worldBorder.centreFromSpawn ? a.spawnCentre : CONFIG.advanced.moduleSettings.worldBorder.defaultCentre;
  const s = CONFIG.advanced.moduleSettings.worldBorder.maxAxisDiff;
  const c = o - r.x;
  const d = i - r.z;
  const u = Math.abs(c);
  const m = Math.abs(d);
  const f = u > s;
  const p = m > s;
  if (f || p) {
    const o = n.getComponent("health");
    if (!o || o.currentValue <= 0) {
      return;
    }
    switch (CONFIG.advanced.moduleSettings.worldBorder.borderMode) {
      case "teleport":
        {
          const e = f ? a.location.x - Math.sign(c) * (u - s + 0.01) : a.location.x;
          const t = p ? a.location.z - Math.sign(d) * (m - s + 0.01) : a.location.z;
          const tmp79 = {
            x: e
          };
          tmp79.y = a.location.y;
          tmp79.z = t;
          n.teleport(tmp79);
          n.lastWarnDate ??= 0;
          if (a.date - n.lastWarnDate > 1000) {
            n.sendMessage("§c§lHey! §r§7You have reached the world boundary.");
            n.lastWarnDate = a.date;
          }
          break;
        }
      case "void":
        const tmp75 = {
          stayDuration: 10,
          fadeInDuration: 0,
          fadeOutDuration: 0
        };
        tmp75.subtitle = "§e§kNEXUSONTHETOP";
        n.onScreenDisplay.setTitle("§c§lBack to Safe Zone", tmp75);
        if (system.currentTick % 10 != 0) {
          break;
        }
        const tmp76 = {};
        tmp76.cause = EntityDamageCause.void;
        n.applyDamage((o.effectiveMax ?? 20) * 0.2, tmp76);
        break;
      case "deterioration":
        const tmp77 = {
          stayDuration: 10,
          fadeInDuration: 0,
          fadeOutDuration: 0
        };
        tmp77.subtitle = "§e§kNEXUSONTHETOP";
        n.deterioration ??= 0;
        n.onScreenDisplay.setTitle("§c§lBack to Safe Zone", tmp77);
        if (system.currentTick % 10 != 0) {
          break;
        }
        const tmp78 = {};
        tmp78.cause = EntityDamageCause.void;
        if (n.applyDamage(o.effectiveMax * (0.1 + n.deterioration), tmp78)) {
          n.deterioration += 0.05;
        }
        break;
      case "count-down":
        {
          n.countdownStart ??= a.date;
          const t = a.date - n.countdownStart;
          const o = CONFIG.advanced.moduleSettings.worldBorder.timeToKill - t;
          if (o <= 0) {
            const t = n.getSpawnPoint();
            if (!n.kill()) {
              n.teleport(t ?? world.getDefaultSpawnLocation(), {
                dimension: t?.dimension ?? overworld
              });
            }
          } else {
            n.onScreenDisplay.setTitle("§c§lBack to Safe Zone", {
              stayDuration: 10,
              fadeInDuration: 0,
              fadeOutDuration: 0,
              subtitle: "§e" + (o / 1000).toFixed(3)
            });
          }
          break;
        }
    }
  } else {
    if (n.deterioration) {
      n.deterioration = 0;
    }
    if (n.countdownStart) {
      delete n.countdownStart;
    }
  }
});
const autoclickerState = new Map();
HOOKS.onAttack.push((e, t, n, a) => {
  if (cloudModeActive) {
    return;
  }
  if (!CONFIG.toggle.detection.combat.autoclicker) {
    return;
  }
  const o = autoclickerState.get(a.id);
  if (o && a.date - o.lastFlagDate < CONFIG.advanced.constant.autoclicker.stopInteractWithin) {
    n.cancel = true;
  }
});
HOOKS.onEntityHit.push((e, t, n) => {
  if (cloudModeActive) {
    return;
  }
  if (!CONFIG.toggle.detection.combat.autoclicker) {
    return;
  }
  const a = autoclickerState.get(e.id);
  if (!a) {
    return;
  }
  const o = n - a.lastHitDate;
  if (o > CONFIG.advanced.constant.autoclicker.resetCombatTimerAt) {
    a.hitCount = 0;
    a.combatTime = 0;
  } else if (o > CONFIG.advanced.constant.autoclicker.naturalCombatInterval) {
    a.combatTime += CONFIG.advanced.constant.autoclicker.naturalCombatInterval;
  } else {
    a.combatTime += o;
  }
  a.lastHitDate = n;
  a.hitCount++;
  if (a.hitPast > 1000) {
    const t = a.hitCount / a.combatTime * 1000;
    if (t > CONFIG.advanced.constant.autoclicker.maxHps) {
      if (n - a.lastFlagDate > CONFIG.advanced.constant.autoclicker.minFlagInterval) {
        a.lastFlagDate = n;
        flagPlayerDeferred(e, "AutoClicker", "Hit", CONFIG.punishment.specfic.autoclicker, "avg. Hit/s=" + t.toFixed(2));
      }
      a.lastFlagDate = n;
    }
  }
});
HOOKS.onPlaceBlock.push((e, t, n, a) => {});
HOOKS.onPlayerJoin.push(e => {
  const tmp80 = {
    hitCount: 0,
    lastHitDate: 0,
    combatTime: 0,
    unused3: 0,
    unused4: 0,
    lastFlagDate: 0
  };
  tmp80.lastFlagDate = 0;
  autoclickerState.set(e.id, tmp80);
});
HOOKS.onPlayerLeave.push(e => {
  autoclickerState.delete(e);
});
HOOKS.onAttack.push((e, t, n, a) => {
  if (cloudModeActive) {
    return;
  }
  if (!CONFIG.toggle.detection.combat.reach_g1 || a.sqDist < 1 || e.getGameMode() === "Creative") {
    return;
  }
  const o = sqDistToAABB(a.headLoc, a.targetAABB);
  const i = isSpear(getMainhandItem(e)?.typeId) ? 32.49 : 17.64;
  if (o > i) {
    n.cancel = true;
    applyHeatDeferred(e, "Reach-G1", "General", CONFIG.advanced.constant.reach_g1.heatGain, CONFIG.advanced.constant.reach_g1.heatLoss, CONFIG.punishment.specfic.reach_g1, "distanceXZ²=" + o.toFixed(3) + "/" + i.toFixed(3));
  }
});
const killauraState = new Map();
HOOKS.onAttack.push((e, t, n, a) => {
  if (cloudModeActive) {
    return;
  }
  if (!CONFIG.toggle.detection.combat.killaura) {
    return;
  }
  const o = killauraState.get(a.id);
  if (o) {
    if (a.date - o.lastFlagDate > 4000) {
      o.count = 0;
    }
    o.lastHitTarget = a.targetId;
    if (a.sqDist > 2.5) {
      const t = hasCrosshair(e);
      const i = function ({
        x: e,
        z: t
      }, n, a, o) {
        const i = a.x - n.x;
        const r = a.z - n.z;
        const s = e * i + t * r;
        if (o) {
          return s < 0 || s * s < COS_60_SQ * ((e * e + t * t) * (i * i + r * r));
        }
        return !(s >= 0) && s * s > COS_120_SQ * ((e * e + t * t) * (i * i + r * r));
      }(a.viewDir, a.headLoc, a.targetAABB.center, t);
      o.count += 1;
      o.lastFlagDate = a.date;
      n.cancel = true;
      if (i && o.count >= 6) {
        applyHeat(e, "KillAura", "B", CONFIG.advanced.constant.killaura.heatGain, CONFIG.advanced.constant.killaura.heatLoss, CONFIG.punishment.specfic.killaura);
        o.count = 0;
      }
    }
  } else {
    killauraState.set(e.id, {
      lastHitDate: 0,
      lastTargetId: a.targetId,
      count: 0,
      lastFlagDate: a.date
    });
  }
});
HOOKS.onEntityHit.push((e, t, n) => {
  if (cloudModeActive) {
    return;
  }
  if (!CONFIG.toggle.detection.combat.killaura) {
    return;
  }
  const a = killauraState.get(n.id);
  if (!a) {
    killauraState.set(n.id, {
      lastHitDate: 0,
      lastTargetId: n.targetId,
      count: 0,
      lastFlagDate: n.date
    });
    return;
  }
  if (n.date - a.lastFlagDate > 4000) {
    a.count = 0;
  }
  const o = n.date - a.lastHitDate < 50;
  a.lastHitDate = n.date;
  if (o && n.targetId !== a.lastTargetId && n.date - a.lastFlagDate >= 250) {
    a.count += 1;
    a.lastFlagDate = n.date;
    if (a.count >= 6) {
      applyHeat(e, "KillAura", "A", CONFIG.advanced.constant.killaura.heatGain, CONFIG.advanced.constant.killaura.heatLoss, CONFIG.punishment.specfic.killaura, "interval=" + o);
      a.count = 0;
    }
  }
  a.lastTargetId = n.targetId;
});
HOOKS.onPlayerLeave.push(e => {
  if (!cloudModeActive) {
    killauraState.delete(e);
  }
});
// ==== 19b. DETECTION — PLAYER (offhand swap speed) ===============================
const lastOffhandItem = new Map();
const offhandEquipTime = new Map();
HOOKS.onPlayerTick.push((e, t) => {
  const n = e.getComponent("equippable");
  const o = n?.getEquipment(EquipmentSlot.Offhand);
  const i = t.id;
  const r = {
    typeId: o?.typeId,
    amount: o?.amount
  };
  const s = lastOffhandItem.get(i) ?? {
    typeId: o?.typeId,
    amount: o?.amount
  };
  const c = s.typeId != o?.typeId || s.amount != o?.amount;
  const tmp81 = {
    typeId: o?.typeId,
    amount: o?.amount
  };
  lastOffhandItem.set(i, tmp81);
  if (!c) {
    return;
  }
  const tmp82 = {
    name: t.name,
    id: t.id
  };
  const tmp83 = {
    player: tmp82,
    beforeItem: s,
    afterItem: r
  };
  tmp83.date = t.date;
  const tmp84 = {
    id: EVENT_IDS.offHandChange,
    data: tmp83
  };
  queueEvent(tmp84);
  if (!CONFIG.toggle.detection.player.offhand) {
    return;
  }
  if (cloudModeActive) {
    return;
  }
  if (!r.typeId) {
    offhandEquipTime.set(i, t.date);
  }
  const l = offhandEquipTime.get(i) ?? t.date - (CONFIG.advanced.constant.offhand.minReactionTime + 1);
  if (o) {
    const r = t.date - l;
    if (r < CONFIG.advanced.constant.offhand.minReactionTime) {
      n?.setEquipment(EquipmentSlot.Offhand);
      giveItem(e, o);
      applyHeat(e, "Offhand", "General", CONFIG.advanced.constant.offhand.heatGain, CONFIG.advanced.constant.offhand.heatLoss, "Reaction=" + r);
    } else {
      offhandEquipTime.delete(i);
    }
  }
});
HOOKS.onPlayerLeave.push(e => {
  lastOffhandItem.delete(e);
  offhandEquipTime.delete(e);
});
// ==== 20. DETECTION — VISUAL (xray heuristics) ===================================
const ORE_WEIGHT_TABLE = {
  ["minecraft:coal_ore"]: 33,
  ["minecraft:iron_ore"]: 54,
  ["minecraft:gold_ore"]: 60,
  ["minecraft:lapis_ore"]: 48,
  ["minecraft:redstone_ore"]: 53,
  ["minecraft:diamond_ore"]: 47,
  ["minecraft:emerald_ore"]: 47,
  ["minecraft:ancient_debris"]: 200
};
const ORE_STREAK_TABLE = {
  ["minecraft:diamond_ore"]: 12,
  ["minecraft:redstone_ore"]: 16,
  ["minecraft:iron_ore"]: 35,
  ["minecraft:gold_ore"]: 25,
  ["minecraft:copper_ore"]: 40,
  ["minecraft:coal_ore"]: 128,
  ["minecraft:lapis_ore"]: 20,
  ["minecraft:emerald_ore"]: 12
};
const ORE_BLOCK_SET = new Set(["minecraft:iron_ore", "minecraft:deepslate_iron_ore", "minecraft:gold_ore", "minecraft:deepslate_gold_ore", "minecraft:lapis_ore", "minecraft:deepslate_lapis_ore", "minecraft:redstone_ore", "minecraft:deepslate_redstone_ore", "minecraft:diamond_ore", "minecraft:deepslate_diamond_ore", "minecraft:emerald_ore", "minecraft:deepslate_emerald_ore", "minecraft:ancient_debris"]);
const COMMON_BLOCK_SET = new Set(["minecraft:stone", "minecraft:deepslate", "minecraft:tuff", "minecraft:granite", "minecraft:diorite", "minecraft:andesite", "minecraft:coal_ore"]);
const TRACKED_BLOCK_SET = new Set([...ORE_BLOCK_SET, ...COMMON_BLOCK_SET]);
const ORE_WEIGHTS = ORE_WEIGHT_TABLE;
const ORE_STREAKS = ORE_STREAK_TABLE;
function normalizeOreId(e) {
  if (e.startsWith("minecraft:deepslate_")) {
    return e.replace("deepslate_", "");
  } else {
    return e;
  }
}
const xrayState = new Map();
HOOKS.onBreakBlock.push((e, t, n, a) => {
  const o = t.typeId.replace("deepslate_", "");
  if (!CONFIG.toggle.detection.visual.xray) {
    return;
  }
  const i = CONFIG.advanced.constant.xray;
  if (!TRACKED_BLOCK_SET.has(o)) {
    return;
  }
  let r = xrayState.get(e.id);
  if (!r) {
    r = {
      dimension: e.dimension.id,
      lastDate: Date.now(),
      count: 0,
      weightedSum: 0,
      mineLocations: [],
      lastOre: "",
      streak: 0,
      unused1: 0,
      lastCommonDate: 0
    };
    xrayState.set(e.id, r);
  }
  if (e.dimension.id !== r.dimension || a.date - r.lastDate > 300000) {
    (function (e, t) {
      if (t.count !== 0) {
        Object.assign(t, {
          dimension: e.dimension.id,
          lastDate: Date.now(),
          count: 0,
          weightedSum: 0,
          mineLocations: [],
          lastOre: "",
          streak: 0,
          unused2: 0,
          unused1: 0,
          lastCommonDate: 0
        });
        xrayState.set(e.id, t);
      }
    })(e, r);
  }
  r.lastDate = a.date;
  r.count++;
  r.mineLocations.push(t.location);
  if (COMMON_BLOCK_SET.has(o)) {
    r.lastCommonDate = a.date;
  }
  const s = ORE_BLOCK_SET.has(o);
  r.lastCommonDate ??= 0;
  if (s && a.date - r.lastCommonDate < i.foundValid) {
    r.lastCommonDate = a.date;
    const t = normalizeOreId(o);
    const n = ORE_STREAKS[t];
    if (n && (r.lastOre === t ? r.streak++ : (r.streak = 1, r.lastOre = t), i.experimental && e.sendMessage("§c[Experimental] §7Xray Consecutive Mining: " + r.streak + "/" + n + " (" + t + ")"), r.streak >= n)) {
      flagPlayerDeferred(e, "Xray", "Consecutive", CONFIG.punishment.specfic.xray, "consecutive=" + r.streak, "threshold=" + n, "ore=" + t);
      if (!i.experimental) {
        xrayState.delete(e.id);
      }
      return;
    }
  }
  if (s) {
    r.weightedSum += function (e) {
      const t = normalizeOreId(e);
      return ORE_WEIGHTS[t] || 0;
    }(o);
  }
  if (r.count >= 64) {
    const t = r.weightedSum / r.count;
    const n = function (e, t = 3) {
      if (e < 64) {
        return Infinity;
      }
      const n = 342 / e;
      return 7 + t * Math.sqrt(n);
    }(r.count, i.k);
    if (i.experimental) {
      e.sendMessage("§c[Experimental] §7Xray Weighted Score: " + t.toFixed(3) + "/" + n.toFixed(3) + " (count: " + r.count + ")");
    }
    if (t > n) {
      flagPlayerDeferred(e, "Xray", "Score", CONFIG.punishment.specfic.xray, "score=" + t.toFixed(5), "threshold=" + n.toFixed(5), "mined=" + r.count, "weightedSum=" + r.weightedSum);
      if (!i.experimental) {
        xrayState.delete(e.id);
      }
      return;
    }
  }
});
world.afterEvents.playerSpawn.subscribe(e => {
  if (!e.initialSpawn) {
    return;
  }
  const t = e.player;
  let n = xrayState.get(t.id);
  if (!n) {
    n = {
      dimension: t.dimension.id,
      lastDate: Date.now(),
      count: 0,
      weightedSum: 0,
      mineLocations: [],
      lastOre: "minecraft:air",
      streak: 0,
      unused1: 0,
      lastCommonDate: 0
    };
    xrayState.set(t.id, n);
  }
});
HOOKS.onPlayerTick.push(e => {
  if (cloudModeActive) {
    return;
  }
  if (!CONFIG.toggle.detection.exploit.forceOp) {
    return;
  }
  const t = e.commandPermissionLevel;
  if (CONFIG.advanced.constant.forceOp.onlyCheckForcedHost ? t === 4 : t >= 1) {
    e.commandPermissionLevel = 0;
    flagPlayer(e, "ForceOp", "General", CONFIG.punishment.specfic.forceOp);
  }
});
HOOKS.onPlayerTick.push(t => {
  if (!cloudModeActive && !t.name) {
    const n = t.id;
    if (!world.getAllPlayers().some(({
      id: e
    }) => e === n)) {
      flagPlayer(t, "Ghost", "General", CONFIG.punishment.specfic.ghost);
    }
  }
});
// ==== 21. DETECTION — EXPLOIT (forceOp, ghost, namespoof) ========================
const NAME_SPOOF_CHARS = /[\uFF21-\uFF3A\uFF41-\uFF5A]|\u00A7|(?![0-9_ A-Za-z])[\u0000-\u00FF]/;
const SAFE_NAME_PATTERN = /^[a-zA-Z0-9_ ]+$/;
HOOKS.onPlayerJoin.push(e => {
  if (cloudModeActive) {
    return;
  }
  if (!CONFIG.toggle.detection.exploit.nameSpoof) {
    return;
  }
  const t = stripNameCounter(e.name);
  if (t.length < 3 || t.length > 16) {
    flagPlayer(e, "NameSpoof", "A", CONFIG.punishment.specfic.nameSpoof);
  } else if (CONFIG.advanced.constant.nameSpoof.repeatedNameCheck && t !== e.name) {
    flagPlayer(e, "NameSpoof", "B", CONFIG.punishment.specfic.nameSpoof);
  } else if (CONFIG.advanced.constant.nameSpoof.strict && !CONFIG.advanced.constant.nameSpoof.strictAdoptKickOnly || !NAME_SPOOF_CHARS.test(t)) {
    if (!CONFIG.advanced.constant.nameSpoof.strict || SAFE_NAME_PATTERN.test(t)) {
      if (CONFIG.advanced.constant.nameSpoof.dbCompare) {
        const n = nameSpoofDb.get(e.id);
        nameSpoofDb.set(e.id, t);
        if (n && n !== t) {
          flagPlayer(e, "NameSpoof", "E", CONFIG.punishment.specfic.nameSpoof);
        }
      }
    } else if (CONFIG.advanced.constant.nameSpoof.strictAdoptKickOnly) {
      kickPlayer(e, "Your name contains illegal character");
    } else {
      flagPlayer(e, "NameSpoof", "D", CONFIG.punishment.specfic.nameSpoof);
    }
  } else {
    flagPlayer(e, "NameSpoof", "C", CONFIG.punishment.specfic.nameSpoof);
  }
});
// ==== 21b. DETECTION — EXPLOIT (dupe A: bundles, dupe D: hoppers) ================
const bundleInteractState = new Map();
HOOKS.onInventoryChange.push((e, t, n, a, o) => {
  if (cloudModeActive) {
    return;
  }
  const i = CONFIG.toggle.detection.exploit.dupeA;
  const r = CONFIG.advanced.constant.dupeA;
  if (!i) {
    return;
  }
  const s = o.slot;
  const c = bundleInteractState.get(e.id);
  const {
    x: l,
    y: d
  } = e.getRotation();
  if (t && t.typeId.includes("bundle") && c) {
    const a = e.dimension.getBlock(c.location);
    if (a && distance3d(e.location, a.location) < r.containerDistance && (Math.abs(Math.abs(l) - Math.abs(c.rot.x)) < r.rot || Math.abs(Math.abs(d) - Math.abs(c.rot.y)) < r.rot * 2) && a.getComponent("minecraft:inventory") && r.dupeContainers.includes(a.typeId)) {
      const o = a.getComponent("minecraft:inventory")?.container;
      if (!o) {
        return;
      }
      for (let a = 0; a < o.size; a++) {
        const i = o.getItem(a);
        if (i) {
          if (i.typeId === t.typeId) {
            if (n) {
              o.setItem(a, n.clone());
            } else {
              o.setItem(a);
            }
            e.getComponent("minecraft:inventory")?.container.setItem(s, t.clone());
            flagPlayer(e, "Dupe", "A", CONFIG.punishment.specfic.dupe);
          }
        }
      }
    }
  }
});
HOOKS.onInteractBlockAlways.push((e, n, a) => {
  if (cloudModeActive) {
    return;
  }
  if (!n.getComponent("inventory") || !CONFIG.toggle.detection.exploit.dupeA) {
    return;
  }
  const o = n.getComponent("inventory")?.container;
  if (o) {
    for (let n = 0; n < o.size; n++) {
      const a = o.getItem(n);
      if (a) {
        if (a.typeId.includes("bundle")) {
          system.run(() => {
            e.dimension.spawnItem(a.clone(), e.location);
            o.setItem(n, undefined);
          });
        }
      }
    }
    bundleInteractState.set(e.id, {
      rot: e.getRotation(),
      location: n.location
    });
  }
});
HOOKS.onPlayerLeave.push(e => {
  if (!cloudModeActive) {
    bundleInteractState.delete(e);
  }
});
const dupeDHopperDb = new Database("antiDupeD");
function trackHopper(e, t) {
  let n = dupeDHopperDb.get(t) ?? [];
  if (e.typeId == "minecraft:hopper") {
    let a = false;
    for (const t of n) {
      if (samePosition(t.location, e.location)) {
        a = true;
      }
    }
    if (a) {
      return;
    }
    const tmp85 = {};
    tmp85.location = e.location;
    n.push(tmp85);
    dupeDHopperDb.set(t, n);
  }
}
function untrackHopper(e, t) {
  let n = dupeDHopperDb.get(t) ?? [];
  for (const a of n) {
    if (samePosition(a.location, e)) {
      let e = n.indexOf(a);
      if (e !== -1) {
        n.splice(e, 1);
        dupeDHopperDb.set(t, n);
      }
      break;
    }
  }
}
function breakHopperBlock(e, t) {
  t.setBlockType(e, "minecraft:air");
  t.spawnItem(new ItemStack("minecraft:hopper", 1), e);
}
world.afterEvents.playerPlaceBlock.subscribe(({
  player: e,
  block: t
}) => {
  if (CONFIG.toggle.detection.exploit.dupeD) {
    trackHopper(t, t.dimension.id);
  }
});
world.afterEvents.playerInteractWithBlock.subscribe(({
  player: e,
  block: t
}) => {
  if (CONFIG.toggle.detection.exploit.dupeD) {
    trackHopper(t, e.dimension.id);
  }
});
world.afterEvents.playerBreakBlock.subscribe(({
  player: e,
  block: t
}) => {
  if (CONFIG.toggle.detection.exploit.dupeD && t.typeId == "minecraft:hopper") {
    untrackHopper(t.location, t.dimension.id);
  }
});
world.afterEvents.blockExplode.subscribe(e => {
  const t = e.explodedBlockPermutation;
  if (CONFIG.toggle.detection.exploit.dupeD && t.type.id == "minecraft:hopper") {
    untrackHopper(e.block.location, e.dimension.id);
  }
});
world.afterEvents.pistonActivate.subscribe(e => {
  const {
    block: t,
    isExpanding: n,
    dimension: a
  } = e;
  if (!CONFIG.toggle.detection.exploit.dupeD) {
    return;
  }
  if (n) {
    return;
  }
  const {
    x: o,
    y: i,
    z: r
  } = t.location;
  const s = [{
    x: o + 2,
    y: i,
    z: r
  }, {
    x: o,
    y: i,
    z: r + 2
  }, {
    x: o - 2,
    y: i,
    z: r
  }, {
    x: o,
    y: i,
    z: r - 2
  }, {
    x: o,
    y: i - 2,
    z: r
  }, {
    x: o,
    y: i + 2,
    z: r
  }];
  for (const e of s) {
    const t = a.getBlock(e);
    if (t?.typeId === "minecraft:hopper") {
      untrackHopper(t.location, a.id);
      breakHopperBlock(t.location, a);
    }
  }
});
world.afterEvents.leverAction.subscribe(function (e) {
  if (e.isPowered) {
    return;
  }
  const t = e.player;
  if (!CONFIG.toggle.detection.exploit.dupeD) {
    return;
  }
  const n = t.dimension.id;
  const a = e.block;
  const o = dupeDHopperDb.get(n) ?? [];
  const i = a.location;
  const {
    x: r,
    y: s,
    z: c
  } = i;
  const l = [{
    x: r + 64,
    y: s,
    z: c
  }, {
    x: r,
    y: s,
    z: c + 64
  }, {
    x: r - 64,
    y: s,
    z: c
  }, {
    x: r,
    y: s,
    z: c - 64
  }];
  const d = [];
  for (const e of l) {
    const n = t.dimension.getBlock(e);
    const a = t.dimension.getBlock({
      x: e.x,
      y: e.y + 1,
      z: e.z
    });
    const o = t.dimension.getBlock({
      x: e.x,
      y: e.y - 1,
      z: e.z
    });
    const tmp89 = {
      location: e
    };
    tmp89.block = n ? {
      typeId: n.typeId,
      location: {
        ...n.location
      }
    } : null;
    tmp89.above = a ? {
      typeId: a.typeId,
      location: {
        ...a.location
      }
    } : null;
    tmp89.below = o ? {
      typeId: o.typeId,
      location: {
        ...o.location
      }
    } : null;
    d.push(tmp89);
  }
  const tmp86 = {
    x: i.x,
    y: i.y,
    z: i.z
  };
  const tmp87 = {
    location: tmp86
  };
  tmp87.powered = e.isPowered;
  const tmp88 = {
    chunks: CONFIG.advanced.constant.dupeD.chunks,
    radius: 64,
    results: d
  };
  queueEvent({
    id: EVENT_IDS.lever,
    data: {
      player: {
        name: t.name,
        id: t.id,
        location: {
          x: t.location.x,
          y: t.location.y,
          z: t.location.z
        },
        dimension: n,
        bypass: isBypass(t)
      },
      lever: tmp87,
      scan: tmp88,
      mapHoppers: o.map(e => ({
        location: e.location
      }))
    },
    date: Date.now()
  });
});
// ==== 22. DETECTION — MOVEMENT (ground spoof, noclip, noslow) ====================
const groundSpoofState = new Map();
HOOKS.onFocusedPlayerTick.push((e, t) => {
  if (!CONFIG.toggle.detection.movement.groundSpoof) {
    return;
  }
  if (!t.isFalling && (t.isJumping || !t.isOnGround)) {
    return;
  }
  const n = groundSpoofState.get(t.id) ?? {
    loc: t.location,
    last: t.date,
    count: 0,
    lastPlacePos: {}
  };
  n.loc = t.location;
  groundSpoofState.set(t.id, n);
});
HOOKS.onPlaceBlock.push((e, t, n, a) => {
  const o = groundSpoofState.get(a.id) ?? {
    loc: a.playerLoc,
    last: a.date,
    count: 0,
    lastPlacePos: {}
  };
  if (!(distance3d(o.lastPlacePos, a.playerLoc) < a.distance)) {
    o.lastPlacePos = a.blockLoc;
    o.lastPlacePos.y += 1;
    groundSpoofState.set(a.id, o);
  }
});
HOOKS.onPlayerTick.push((e, t) => {
  if (!CONFIG.toggle.detection.movement.groundSpoof) {
    return;
  }
  if (!t.isJumping || !t.isOnGround || t.bypass) {
    return;
  }
  const n = groundSpoofState.get(t.id) ?? {
    loc: t.location,
    last: t.date,
    count: 0,
    lastPlacePos: {}
  };
  if (distance3d(n.lastPlacePos, t.location) < 5 && Math.abs(n.lastPlacePos.y - t.location.y) < 1) {
    if (n.count > 0) {
      n.count--;
    }
    groundSpoofState.set(t.id, n);
    return;
  }
  let a;
  let o = t.location;
  o.y = Math.ceil(o.y) - 0.5;
  const i = t.dimension.getBlock(t.location);
  if (!i?.isAir || !t.dimension.getBlock(o)?.isAir) {
    a = true;
  }
  if (!a) {
    const tmp90 = {
      x: o.x + 1,
      y: o.y,
      z: o.z
    };
    const tmp91 = {
      x: o.x - 1,
      y: o.y,
      z: o.z
    };
    const tmp92 = {
      x: o.x,
      y: o.y,
      z: o.z + 1
    };
    const tmp93 = {
      x: o.x,
      y: o.y,
      z: o.z - 1
    };
    const tmp94 = {
      x: o.x - 1,
      y: o.y,
      z: o.z + 1
    };
    const tmp95 = {
      x: o.x - 1,
      y: o.y,
      z: o.z - 1
    };
    const tmp96 = {
      x: o.x + 1,
      y: o.y,
      z: o.z + 1
    };
    const tmp97 = {
      x: o.x + 1,
      y: o.y,
      z: o.z - 1
    };
    const e = [tmp90, tmp91, tmp92, tmp93, tmp94, tmp95, tmp96, tmp97];
    for (const n of e) {
      const e = t.dimension.getBlock(n);
      if (!e?.isAir) {
        let e = n;
        e.y++;
        const o = t.dimension.getBlock(e);
        if (o?.isAir || !o?.isSolid) {
          a = true;
          break;
        }
      }
    }
  }
  if (a || n?.flagged) {
    if (t.date - n.last > 10000) {
      n.last = t.date;
      n.count = 0;
      const e = t.velocity;
      if (e.x != 0 || e.z != 0) {
        n.loc = t.location;
      }
    }
  } else {
    if (t.date - n.last < 200) {
      return;
    }
    e.teleport(n.loc);
    n.last = t.date;
    n.count++;
    if (n.count >= 3) {
      flagPlayer(e, "GroundSpoof", "General", CONFIG.punishment.specfic.groundSpoof);
      n.count = 0;
    }
  }
  groundSpoofState.set(t.id, n);
});
HOOKS.onPlayerLeave.push(e => {
  groundSpoofState.delete(e);
});
const noClipState = new Map();
HOOKS.onFocusedPlayerTick.push((e, t) => {
  if (!CONFIG.toggle.detection.movement.noClip) {
    return;
  }
  if (!t.isFalling || t.isSwimming || t.isGliding || !t.dimension.getBlock({
    x: t.location.x,
    y: t.location.y + 1,
    z: t.location.z
  })?.isSolid && !t.dimension.getBlock(e.getHeadLocation())?.isSolid) {
    return;
  }
  let n = noClipState.get(t.id) ?? {
    count: 0,
    last: t.date
  };
  const a = t.location;
  const o = {
    x: a.x,
    y: a.y + 1.4,
    z: a.z
  };
  n.count++;
  n.last = t.date;
  if (n.count >= 5) {
    flagPlayer(e, "NoClip", "A", CONFIG.punishment.specfic.noClip);
    n.count = 0;
  }
  e.teleport(o);
  noClipState.set(t.id, n);
});
HOOKS.onPlayerTick.push((e, t) => {
  if (!CONFIG.toggle.detection.movement.noClip) {
    return;
  }
  const n = t.location;
  const a = t.id;
  const tmp98 = {};
  tmp98.last = t.date;
  const tmp99 = {
    x: n.x,
    y: n.y + 1,
    z: n.z
  };
  if (!((noClipState.get(a) ?? tmp98).last - t.date <= 1500) && !t.bypass && (!t.isFalling || !!t.dimension.getBlock(tmp99)?.isSolid && !!t.dimension.getBlock(e.getHeadLocation())?.isSolid)) {
    noClipState.set(a, {
      count: 0,
      last: t.date
    });
  }
});
HOOKS.onPlayerLeave.push(e => {
  noClipState.delete(e);
});
let noSlowTrackers = [];
const noSlowFlags = new Map();
const recentHurtTime = new Map();
HOOKS.onPlayerLeave.push(e => {
  if (!CONFIG.toggle.detection.movement.noSlow) {
    return;
  }
  const n = noSlowTrackers.findIndex(t => t.id == e);
  if (n !== -1) {
    system.clearRun(noSlowTrackers[n].run);
    noSlowTrackers.splice(n, 1);
  }
});
world.afterEvents.itemStartUse.subscribe(function (e) {
  if (!CONFIG.toggle.detection.movement.noSlow) {
    return;
  }
  const n = e.source;
  const a = e.itemStack;
  if (a.typeId.includes("spear") || !a.typeId.startsWith("minecraft:")) {
    return;
  }
  if (isBypass(n)) {
    return;
  }
  let o = false;
  for (const e of noSlowTrackers) {
    if (n.id == e.id) {
      o = true;
    }
  }
  if (o) {
    return;
  }
  const i = n.getVelocity();
  const {
    x: r,
    z: s
  } = i;
  let c = 0;
  const l = n.id;
  const d = n.name;
  const u = n.location;
  const m = system.runInterval(() => {
    const e = Date.now();
    if (e - recentHurtTime.get(l) < 1500) {
      return;
    }
    const t = n.getEffect("speed");
    const a = n.getVelocity();
    const tmp101 = {
      valid: t
    };
    tmp101.amplifier = t?.amplifier;
    const tmp102 = {};
    tmp102.speed = tmp101;
    const tmp103 = {
      name: d,
      id: l,
      effects: tmp102,
      initialVelocity: i,
      velocity: a,
      location: u
    };
    const tmp104 = {
      player: tmp103,
      date: e
    };
    const tmp105 = {
      id: EVENT_IDS.slowdown,
      data: tmp104
    };
    queueEvent(tmp105);
    if (cloudModeActive) {
      return;
    }
    const {
      x: o,
      z: r
    } = a;
    let s = 1;
    if (t) {
      s = 1 + t.amplifier * 0.2;
    }
    const m = Math.sqrt(o * o + r * r);
    if (m >= s * 0.04 && m >= a) {
      c++;
      if (c >= 14) {
        n.teleport(u);
        c = 0;
        let t = noSlowFlags.get(l);
        const tmp106 = {
          flags: 0,
          last: 0
        };
        t ||= tmp106;
        if (e - t.last > 3000) {
          t.flags = 0;
        }
        t.flags++;
        t.last = e;
        noSlowFlags.set(l, t);
        if (t.flags >= 3) {
          flagPlayer(n, "NoSlow", "General", CONFIG.punishment.specfic.noSlow);
          t.flags = 0;
          noSlowFlags.set(l, t);
        }
      }
    } else if (m < a && m >= 0.04) {
      a = m;
    }
  }, 2);
  const tmp100 = {
    id: n.id,
    run: m
  };
  noSlowTrackers.push(tmp100);
});
world.afterEvents.itemStopUse.subscribe(function (e) {
  if (!CONFIG.toggle.detection.movement.noSlow) {
    return;
  }
  const n = e.source;
  n.name;
  n.id;
  const a = noSlowTrackers.findIndex(e => e.id == n.id);
  if (a !== -1) {
    system.clearRun(noSlowTrackers[a].run);
    noSlowTrackers.splice(a, 1);
  }
  EVENT_IDS.slowdown;
});
HOOKS.onPlayerHurt.push(e => {
  recentHurtTime.set(e.id, Date.now());
});
// ==== 23. DETECTION — WORLD (scaffold, reach, CPS, nuker, chestaura, invalid break) ===
const scaffoldState = new Map();
HOOKS.onPlaceBlock.push((e, t, a, o) => {
  if (cloudModeActive) {
    return;
  }
  if (!CONFIG.toggle.detection.world.scaffold) {
    return;
  }
  const {
    face: i,
    faceLocation: r
  } = a;
  const s = e.getGameMode();
  if ([GameMode.Creative, GameMode.Spectator].includes(s) || e.isFlying) {
    return;
  }
  const c = e.location.y - t.location.y;
  const {
    x: l,
    y: m
  } = e.getRotation();
  const f = scaffoldState.get(e);
  if (!f) {
    return;
  }
  const p = c >= 0.98 && c < 2.5;
  const tmp107 = !!f.lastPlaceDate && o.date - f.lastPlaceDate < 350;
  const h = function (e, t) {
    const {
      x: n,
      z: a
    } = e.center();
    switch (t) {
      case Direction.North:
        const tmp109 = {
          x: n,
          z: a - 0.5
        };
        return tmp109;
      case Direction.South:
        const tmp110 = {
          x: n,
          z: a + 0.5
        };
        return tmp110;
      case Direction.East:
        const tmp111 = {
          x: n + 0.5,
          z: a
        };
        return tmp111;
      case Direction.West:
        const tmp112 = {
          x: n - 0.5,
          z: a
        };
        return tmp112;
    }
    const tmp108 = {
      x: n,
      z: a
    };
    return tmp108;
  }(t, i);
  const g = function (e, {
    x: t,
    z: n
  }, {
    x: a,
    z: o
  }) {
    switch (e) {
      case Direction.East:
      case Direction.West:
        return Math.abs(t - a);
      default:
        return Math.abs(n - o);
    }
  }(i, e.location, h);
  const y = function ({
    x: e,
    y: t,
    z: n
  }) {
    return e === 0 && t === 0 && n === 0;
  }(r);
  const b = f.lastPlaceLoc?.y === t.location.y;
  const v = i === Direction.Up && f.lastPlaceLoc?.y && t.location.y > f.lastPlaceLoc.y;
  if (b && function ({
    x: e,
    y: t,
    z: n
  }, {
    x: a,
    y: o,
    z: i
  }) {
    const r = Math.abs(e - a);
    const s = Math.abs(n - i);
    const c = Math.abs(t - o);
    return r + s + c === 1;
  }(t.location, f.lastPlaceLoc) && p) {
    const e = function (e) {
      if (e.location.y === 64) {
        return undefined;
      } else {
        return e.below();
      }
    }(t);
    if (e && !e.isLiquid && !e.isAir) {
      f.extended = false;
    } else if (!y && !f.extended) {
      f.extended = true;
    }
  }
  if (!tmp107 || !p || f.lastBackwardDate && o.date - f.lastBackwardDate > 2000 && g > 2) {
    f.placeCount = 0;
    f.steerCount = 0;
  } else {
    f.placeCount++;
    if (f.lastFace !== i && (i !== Direction.Up || !!v)) {
      f.steerCount++;
    }
  }
  const w = function (e, t, n) {
    const a = t.x - e.x;
    const o = t.z - e.z;
    switch (n) {
      case Direction.North:
        return o > 0;
      case Direction.South:
        return o < 0;
      case Direction.East:
        return a < 0;
      case Direction.West:
        return a > 0;
      default:
        return false;
    }
  }(h, e.location, i);
  if (w) {
    f.lastBackwardDate = o.date;
  }
  if (f.placeCount > 7) {
    const t = f.steerCount / f.placeCount;
    if (t > 0.4 || t > 0.25 && y) {
      a.cancel = true;
      applyHeatDeferred(e, "Scaffold", "A", CONFIG.advanced.constant.scaffold.heatGain, CONFIG.advanced.constant.scaffold.heatLoss, "steeringRate=" + t.toFixed(2));
    }
  }
  const x = e.inputInfo;
  const k = x.lastInputModeUsed !== InputMode.Touch || x.touchOnlyAffectsHotbar;
  if (y) {
    if (p && k && l < 0 || f.lastDir !== i && (i !== Direction.Up || v)) {
      applyHeatDeferred(e, "Scaffold", "C", CONFIG.advanced.constant.scaffold.heatGain, CONFIG.advanced.constant.scaffold.heatLoss, "pitch=" + l + ", lastDir=" + f.lastDir, "face=" + i);
    }
  } else {
    f.lastDir = i;
    if (p && k && l < 17 && f.placeCount >= 3) {
      a.cancel = true;
      applyHeatDeferred(e, "Scaffold", "B", CONFIG.advanced.constant.scaffold.heatGain, CONFIG.advanced.constant.scaffold.heatLoss, "pitch=" + l);
    }
  }
  if (p) {
    if (!y && w && f.extended) {
      if (l < (k ? 44 : 30) && f.placeCount >= 3) {
        a.cancel = true;
        applyHeatDeferred(e, "Scaffold", "D", CONFIG.advanced.constant.scaffold.heatGain, CONFIG.advanced.constant.scaffold.heatLoss, "pitch=" + l);
      }
      if (f.wasExtend && b && (l > 60 && g >= 2 || g >= 2.5)) {
        a.cancel = true;
        applyHeatDeferred(e, "Scaffold", "E", CONFIG.advanced.constant.scaffold.heatGain, CONFIG.advanced.constant.scaffold.heatLoss, "pitch=" + l, "extender=" + g);
      }
    }
    const n = e.location.y - f.lastPlaceLoc?.y;
    if (!e.isInWater && i === Direction.Up && f.lastPlaceLoc && f.lastPlaceLoc.x === t.location.x && f.lastPlaceLoc.z === t.location.z && t.location.y - f.lastPlaceLoc.y === 1 && c >= 0.98 && c < 1.5 && n >= 0.98 && n < 1.5 && tmp107 && e.isJumping) {
      a.cancel = true;
      applyHeatDeferred(e, "Scaffold", "G", CONFIG.advanced.constant.scaffold.heatGain, CONFIG.advanced.constant.scaffold.heatLoss, "height=" + c, "lastHeight=" + n);
    }
  }
  if (Math.abs(l) > 89.91 || l % 1 == 0 && l !== 0 || m % 1 == 0 && m !== 0) {
    a.cancel = true;
    applyHeatDeferred(e, "Scaffold", "F", CONFIG.advanced.constant.scaffold.heatGain, CONFIG.advanced.constant.scaffold.heatLoss, "pitch=" + l);
  }
  if (!a.cancel) {
    f.lastPlaceDate = o.date;
    f.lastPitch = l;
    f.lastFace = i;
    f.lastPlaceLoc = t.location;
    f.wasExtend = b;
  }
});
HOOKS.onPlayerJoin.push(e => {
  const tmp113 = {
    placeCount: 0,
    steerCount: 0,
    unused5: 0,
    lastPlaceDate: undefined,
    lastFace: undefined
  };
  tmp113.lastPlaceLoc = undefined;
  tmp113.wasExtend = undefined;
  tmp113.lastBackwardDate = undefined;
  tmp113.extended = false;
  tmp113.lastDir = undefined;
  tmp113.lastPitch = undefined;
  const t = tmp113;
  scaffoldState.set(e, t);
});
HOOKS.onPlayerLeave.push(e => {
  scaffoldState.delete(e);
});
const blockReachBreakState = new Map();
HOOKS.onBreakBlock.push((e, t, n, a) => {
  if (cloudModeActive) {
    return;
  }
  const o = CONFIG.advanced.constant.blockReach;
  if (!CONFIG.toggle.detection.world.blockReach || !e.isValid) {
    return;
  }
  const tmp114 = {
    x: t.location.x + 0.5,
    y: t.location.y + 0.5,
    z: t.location.z + 0.5
  };
  const tmp115 = {
    center: tmp114
  };
  const i = tmp115;
  const r = distance3d(e.getHeadLocation(), i.center);
  const tmp116 = {
    count: 0,
    last: a
  };
  let s = blockReachBreakState.get(e.id) ?? tmp116;
  if (!(r < o.max)) {
    if (a - s.last > o.checkDuration) {
      s.count = 0;
      s.last = a;
    }
    s.count++;
    n.cancel = true;
    if (s.count >= o.count) {
      s.count = 0;
      s.last = a;
      flagPlayerDeferred(e, "BlockReach", "Break", CONFIG.punishment.specfic.blockReach);
    }
    blockReachBreakState.set(e.id, s);
  }
});
HOOKS.onPlayerLeave.push(e => {
  blockReachBreakState.delete(e);
});
const blockReachPlaceState = new Map();
HOOKS.onPlaceBlock.push((e, t, n, a) => {
  if (cloudModeActive) {
    return;
  }
  const o = CONFIG.advanced.constant.blockReach;
  if (!CONFIG.toggle.detection.world.blockReach || !e.isValid) {
    return;
  }
  const tmp117 = {
    x: t.location.x + 0.5,
    y: t.location.y + 0.5,
    z: t.location.z + 0.5
  };
  const tmp118 = {
    center: tmp117
  };
  const i = tmp118;
  const r = distance3d(e.getHeadLocation(), i.center);
  const tmp119 = {
    count: 0,
    last: a
  };
  let s = blockReachPlaceState.get(e.id) ?? tmp119;
  if (!(r < o.max)) {
    if (a - s.last > o.checkDuration) {
      s.count = 0;
      s.last = a;
    }
    s.count++;
    n.cancel = true;
    if (s.count >= o.count) {
      s.count = 0;
      flagPlayerDeferred(e, "BlockReach", "Place", CONFIG.punishment.specfic.blockReach);
    }
    blockReachPlaceState.set(e.id, s);
  }
});
HOOKS.onPlayerLeave.push(e => {
  blockReachPlaceState.delete(e);
});
const interactReachState = new Map();
HOOKS.onInteractBlock.push((e, t, a, o) => {
  if (cloudModeActive) {
    return;
  }
  const i = CONFIG.advanced.constant.interactReach;
  if (!CONFIG.toggle.detection.world.interactReach || o.gamemode == GameMode.Creative || !e.isValid || !t.hasComponent("minecraft:inventory")) {
    return;
  }
  const tmp120 = {
    x: t.location.x + 0.5,
    y: t.location.y + 0.5,
    z: t.location.z + 0.5
  };
  const tmp121 = {
    center: tmp120
  };
  const r = tmp121;
  const s = distance3d(e.getHeadLocation(), r.center);
  const c = Date.now();
  const tmp122 = {
    count: 0,
    last: c
  };
  const tmp123 = {
    count: 0,
    last: c
  };
  const tmp124 = {
    block: tmp122,
    entity: tmp123
  };
  let l = interactReachState.get(e.id) ?? tmp124;
  let d = l.block;
  if (!(s < i.block.max)) {
    if (c - d.last > i.checkDuration) {
      d.count = 0;
      d.last = c;
    }
    d.count++;
    a.cancel = true;
    if (d.count >= i.count) {
      d.count = 0;
      d.last = c;
      flagPlayerDeferred(e, "InteractReach", "Block", CONFIG.punishment.specfic.interactReach);
    }
    interactReachState.set(e.id, l);
  }
});
HOOKS.onInteractEntity.push((e, t, a, o) => {
  if (cloudModeActive) {
    return;
  }
  const i = CONFIG.advanced.constant.interactReach;
  if (!CONFIG.toggle.detection.world.interactReach || o.gamemode == GameMode.Creative || !i.entity.target.includes(t.typeId) && !t.hasComponent("minecraft:inventory") || !e.isValid) {
    return;
  }
  const r = distance3d(e.getHeadLocation(), box.center);
  const s = Date.now();
  const tmp125 = {
    count: 0,
    last: s
  };
  const tmp126 = {
    count: 0,
    last: s
  };
  const tmp127 = {
    block: tmp125,
    entity: tmp126
  };
  let c = interactReachState.get(e.id) ?? tmp127;
  let l = c.entity;
  if (!(r < i.entity.max)) {
    if (s - l.last > i.checkDuration) {
      l.count = 0;
      l.last = s;
    }
    l.count++;
    a.cancel = true;
    if (l.count >= i.count) {
      l.count = 0;
      l.last = s;
      flagPlayerDeferred(e, "InteractReach", "Entity", CONFIG.punishment.specfic.interactReach);
    }
    interactReachState.set(e.id, c);
  }
});
HOOKS.onPlayerLeave.push(e => {
  interactReachState.delete(e);
});
let placeCpsState = new Map();
HOOKS.onPlaceBlock.push((e, n, a, o) => {
  if (cloudModeActive) {
    return;
  }
  const i = CONFIG.advanced.constant.placeAutoClicker;
  if (!e || !CONFIG.toggle.detection.world.placeAutoClicker || !e.isValid) {
    return;
  }
  let r = placeCpsState.get(o.id);
  const tmp128 = {
    count: 0,
    lastPlace: o.date,
    place: true
  };
  if (!r) {
    r = tmp128;
    placeCpsState.set(o.id, r);
  }
  if (r.place) {
    if (o.date - r.lastPlace >= 1000) {
      r.lastPlace = o.date;
      r.count = 0;
    }
    r.count++;
    if (r.count > i.maxCps) {
      a.cancel = true;
      r.place = false;
      flagPlayerDeferred(e, "BlockAutoClicker", "A", CONFIG.punishment.specfic.placeAutoClicker);
      system.runTimeout(() => {
        r.place = true;
        placeCpsState.set(o.id, r);
      }, i.resetTimerAt);
      r.count = 0;
    }
    placeCpsState.set(o.id, r);
  } else {
    a.cancel = true;
  }
});
HOOKS.onPlayerLeave.push(e => {
  placeCpsState.delete(e);
});
const nukerState = new Map();
HOOKS.onBreakBlock.push((e, t, n, a) => {
  if (cloudModeActive) {
    return;
  }
  const o = CONFIG.advanced.constant.nuker;
  if (!CONFIG.toggle.detection.world.nuker || !e.isValid) {
    return;
  }
  const tmp129 = {
    lastBreak: a - 76
  };
  tmp129.breakCount = 0;
  tmp129.banned = false;
  let i = nukerState.get(e.id) ?? tmp129;
  if (a - i.lastBreak <= 76) {
    i.breakCount++;
    if (i.breakCount >= o.minBlocks) {
      n.cancel = true;
    }
    if (i.breakCount >= o.maxBlocks && !i.banned) {
      i.banned = true;
      flagPlayerDeferred(e, "Nuker", "A", CONFIG.punishment.specfic.nuker);
    }
  } else {
    i.breakCount = 0;
    i.lastBreak = a;
    i.banned = false;
  }
  nukerState.set(e.id, i);
});
HOOKS.onPlayerLeave.push(e => {
  nukerState.delete(e);
});
const chestAuraState = new Map();
const chestAuraLastBlock = new Map();
HOOKS.onInteractBlock.push((e, n, a, o) => {
  if (cloudModeActive) {
    return;
  }
  if (!CONFIG.toggle.detection.world.chestAura || !n.hasComponent("inventory") || !e.isValid) {
    return;
  }
  if (n.typeId === "minecraft:chest" && !o.blockAbove?.isAir && o.blockAbove?.typeId != "minecraft:chest") {
    return;
  }
  const i = Date.now();
  const tmp130 = {
    last: i - 126,
    count: 0
  };
  tmp130.flags = 0;
  tmp130.closed = false;
  let r = chestAuraState.get(e.id) ?? tmp130;
  const s = chestAuraLastBlock.get(e.id);
  if (i - r.last <= 125 && (!s || distance3d(s, o.blockLoc) > 0)) {
    a.cancel = true;
    r.count++;
    if (r.count >= 2) {
      r.flags++;
      (function (e) {
        system.runTimeout(() => {
          let n = chestAuraState.get(e.id);
          if (!CONFIG.toggle.detection.world.chestAura || !e.isValid || !n || n.closed) {
            return;
          }
          n.closed = true;
          chestAuraState.set(e.id, n);
          let a = e.location;
          a.y += 10;
          e.teleport(a);
          system.run(() => {
            a.y -= 10;
            e.teleport(a);
            n.closed = false;
            chestAuraState.set(e.id, n);
          });
        }, 2);
      })(e);
      if (r.flags >= 2) {
        flagPlayerDeferred(e, "ChestAura", "A", CONFIG.punishment.specfic.chestAura);
      }
    }
  } else {
    r.count = 0;
  }
  if (i - r.last >= 5000) {
    r.flags = 0;
  }
  r.last = i;
  chestAuraState.set(e.id, r);
  chestAuraLastBlock.set(e.id, o.blockLoc);
});
HOOKS.onPlayerLeave.push(e => {
  chestAuraState.delete(e);
  chestAuraLastBlock.delete(e);
});
const invalidBreakState = new Map();
HOOKS.onBreakBlock.push((e, t, n, a) => {
  if (!CONFIG.toggle.detection.world.invalidBreak) {
    return;
  }
  if (distance3d(a.headLoc, {
    x: a.blockLoc.x + 0.5,
    y: a.blockLoc.y + 0.5,
    z: a.blockLoc.z + 0.5
  }) <= 0.5) {
    return;
  }
  const o = a.id;
  let i = a.blockLoc;
  i.x = i.x + 0.5;
  i.y = i.y + 0.5;
  i.z = i.z + 0.5;
  const tmp131 = {
    count: 0,
    loc: i
  };
  tmp131.last = a.date;
  let r = invalidBreakState.get(o) ?? tmp131;
  const s = distance3d(i, r.loc);
  if (s === 1 && a.date - r.last <= 100) {
    r.loc = i;
    r.last = a.date;
    r.count = 0;
    return;
  }
  if (a.date - r.last >= 5000) {
    r.count = 0;
  }
  if (a.blockTypeId !== "minecraft:bed") {
    const t = function (e, t) {
      const tmp132 = {
        x: e.x,
        y: e.y + 1,
        z: e.z
      };
      const tmp133 = {
        x: e.x,
        y: e.y - 1,
        z: e.z
      };
      const tmp134 = {
        x: e.x,
        y: e.y,
        z: e.z + 1
      };
      const tmp135 = {
        x: e.x + 1,
        y: e.y,
        z: e.z
      };
      const tmp136 = {
        x: e.x,
        y: e.y,
        z: e.z - 1
      };
      const tmp137 = {
        x: e.x - 1,
        y: e.y,
        z: e.z
      };
      const n = [tmp132, tmp133, tmp134, tmp135, tmp136, tmp137];
      let a = false;
      for (const e of n) {
        const n = t.dimension.getBlock(e);
        if (n && (n.isAir || !n.isSolid || n.isLiquid)) {
          a = true;
          break;
        }
      }
      return a;
    }(i, e);
    if (!t) {
      n.cancel = true;
      if (s === 0) {
        r.count++;
      }
      if (r.count >= 3) {
        r.count = 0;
        flagPlayerDeferred(e, "InvalidBreak", "A", CONFIG.punishment.specfic.invalidBreak);
      }
    }
  } else {
    const t = function (e, t) {
      const tmp138 = {
        x: e.x,
        y: e.y + 1,
        z: e.z
      };
      const tmp139 = {
        x: e.x,
        y: e.y - 1,
        z: e.z
      };
      const tmp140 = {
        x: e.x
      };
      tmp140.y = e.y;
      tmp140.z = e.z + 1;
      const tmp141 = {
        x: e.x + 1,
        y: e.y,
        z: e.z
      };
      const tmp142 = {
        x: e.x,
        y: e.y
      };
      tmp142.z = e.z - 1;
      const tmp143 = {
        x: e.x - 1,
        y: e.y,
        z: e.z
      };
      const n = [tmp138, tmp139, tmp140, tmp141, tmp142, tmp143];
      let a = false;
      let o = 0;
      for (const e of n) {
        const n = t.dimension.getBlock(e);
        if (n?.typeId === "minecraft:bed") {
          o++;
        }
        if (n && (n.isAir || !n.isSolid || n.isLiquid) && (n?.typeId === "minecraft:bed" && o > 1 || n?.typeId !== "minecraft:bed")) {
          a = true;
          break;
        }
      }
      return a;
    }(i, e);
    if (!t) {
      if (s === 0) {
        r.count++;
      }
      n.cancel = true;
      if (r.count >= 3) {
        r.count = 0;
        flagPlayerDeferred(e, "InvalidBreak", "B", CONFIG.punishment.specfic.invalidBreak);
      }
    }
  }
  r.loc = i;
  r.last = a.date;
  invalidBreakState.set(o, r);
});
HOOKS.onPlayerLeave.push(e => {
  invalidBreakState.delete(e);
});
