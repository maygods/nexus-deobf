/*
 * nexus.js — reconstructed / deobfuscated source
 *
 * Original: Nexus Anticheat (Minecraft Bedrock @minecraft/server script)
 * Original obfuscation: javascript-obfuscator.io (string-array + RC4/base64,
 *   rotation, control-flow flattening, dead-code injection, CJK unicode
 *   identifier mangling, self-defending checks) wrapped around an ES module.
 *
 * Reconstruction pipeline:
 *   1. webcrack (string-array + wrapper removal, first pass)
 *   2. custom @babel/traverse pass: scope-correct decoder-wrapper inlining,
 *      constant folding, 6,192 string evaluations via sandboxed original decoder
 *   3. dead-code elimination (529 wrapper fns, 850 lookup objects)
 *   4. identifier + property-name de-mangling, unminification
 *
 * NOTE: 100% semantic fidelity is not guaranteed; machine names (funcN/localN/
 *       paramN/propN) are reconstruction artifacts — the original identifiers
 *       are not recoverable from the obfuscated file.
 * The software remains (c) its authors (see EULA in the original file).
 */
import { world as e, system as t, GameMode as n, EquipmentSlot as a, EnchantmentTypes as o, ItemStack as i, BlockComponentTypes as r, EntityComponentTypes as s, Player as c, EntityDamageCause as l, Direction as d, InputMode as u } from "@minecraft/server";
import { ActionFormData as m, ModalFormData as f } from "@minecraft/server-ui";
function p(e, t) {
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
function func144(e) {
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
  const n = p(v.buffer, t.buffer);
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
const h = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const g = new Uint8Array(256);
for (let e = 0; e < 64; e++) {
  g[h.charCodeAt(e)] = e;
}
function y(e) {
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
      t += h[e[a] >> 2];
      t += h[(e[a] & 3) << 4 | e[a + 1] >> 4];
      t += h[(e[a + 1] & 15) << 2 | e[a + 2] >> 6];
      t += h[e[a + 2] & 63];
    }
    if (n % 3 == 2) {
      t = t.substring(0, t.length - 1) + "=";
    } else if (n % 3 == 1) {
      t = t.substring(0, t.length - 2) + "==";
    }
    return t;
  }(func144(t));
}
function b(e) {
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
      const o = g[e.charCodeAt(t)];
      const i = g[e.charCodeAt(t + 1)];
      const r = g[e.charCodeAt(t + 2)];
      const s = g[e.charCodeAt(t + 3)];
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
    const a = p(v.buffer, t.buffer);
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
const v = function (e) {
  const t = new Uint8Array(e.length / 2);
  for (let n = 0; n < e.length; n += 2) {
    t[n / 2] = parseInt(e.slice(n, n + 2), 16);
  }
  return t;
}("f7d850f05a995e2d3a5cebb84c106725af0b7fa13e1297cb2821001cdc44e23e");
class w {
  static prop61 = [];
  static prop62() {
    w.prop61.forEach(t => {
      t.prop63 = function (t) {
        let n;
        let a = "";
        let o = 1;
        for (let n = 0; n < o; n++) {
          let i = e.getDynamicProperty("" + t + n);
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
          const e = b(a);
          n = JSON.parse(e);
        } catch {
          n = {};
        }
        return n;
      }(t.id);
    });
  }
  static prop64() {
    w.prop61.forEach(e => {
      C(e.id, e.prop63);
    });
  }
  prop6 = "";
  prop65 = 0;
  prop63 = {};
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
    w.prop61.push(this);
  }
  prop66() {
    return this.prop63;
  }
  prop67(e) {
    return this.prop63?.[e];
  }
  prop68(e, t = undefined) {
    if (t === undefined) {
      delete this.prop63[e];
    } else {
      this.prop63[e] = t;
    }
    this.prop65 = Object.keys(this.prop63).length;
    C(this.id, this.prop63);
  }
  prop69(e) {
    return e in this.prop63;
  }
}
const x = new w("centre");
const k = 30000;
function C(t, n) {
  const a = function (e) {
    let t = [];
    for (let n = 0; n < e.length; n += k) {
      t.push(e.slice(n, n + k));
    }
    t[0] = t.length + "/" + (t[0] ?? "");
    return t;
  }(y(JSON.stringify(n)));
  const o = {};
  a.forEach((e, n) => {
    o[t + n] = e;
  });
  e.setDynamicProperties(o);
}
const local145 = {};
local145.prop70 = "526b4f5e-8c42-484a-8bd0-fa5d83c3a2b4";
local145.prop71 = "89fe4b6b-19b0-4b98-a15c-8fcc371e675e";
local145.prop72 = "e3b189ec-1272-4ca6-be58-3686fc58727f";
local145.prop73 = "78111220-53fd-4080-af3d-9799403f705e";
local145.prop74 = "ddebdc3c-dbca-4fde-a08d-2e0b00d57f5c";
local145.prop75 = "5bf6b4fe-d265-4212-9b7e-1ff6fd333cb7";
local145.prop76 = "d953f9d8-5a33-49be-bc1c-38c079dc12d6";
local145.prop77 = "ce523e34-8638-42e7-b578-bc2651ebea16";
local145.prop78 = "f1eaf092-73ce-4d89-9043-98bf5f91c74e";
var A = Object.freeze(local145);
const D = true;
const local146 = {};
local146.target = "all";
local146.target$T = "Alert Target";
local146.target$D = "The target that will receive alert when a player get flagged or there is other alert.";
local146.target$B = "Select the target that will receive alerts when a player is flagged or other alerts occur.\n- all: All players will receive alert.\n- tag: Only player with specific tag will receive alert.\n- tag-and-op: Player with specific tag and operator will receive alert.\n- tag-and-admin: Player with specific tag and admin permission will receive alert.\n- op: Only operator will receive alert.\n- admin: Only player with admin permission will receive alert.\n- none: No one will receive alert. (i.e. Disable alert)";
local146.target$V = ["all", "exclude", "tag", "tag-and-op", "tag-and-admin", "op", "admin", "none"];
local146.tag = "anticheat_alert";
local146.tag$T = "Alert Tag";
local146.tag$D = "The defined alert tag.";
local146.tag$B = "Only work when Alert Target is tag, tag-and-op or tag-and-admin. This is the tag that will be used to send alert.";
local146.showSilentFlag = false;
local146.showSilentFlag$T = "Show Silent Flag";
local146.showSilentFlag$D = "If this option is true, the plugin will show the potential flag behavior found by Nexus Heat Engine. Not surely.";
const local147 = {};
local147.aim = "kick";
local147.aim$T = "Anti Aim";
local147.aim$D = "Punishment for Aim.";
local147.autoclicker = "kick";
local147.autoclicker$T = "Anti AutoClicker";
local147.autoclicker$D = "Punishment for AutoClicker.";
local147.reach_g1 = "kick";
local147.reach_g1$T = "Anti Reach (Generation 1)";
local147.reach_g1$D = "Punishment for Reach (Generation 1).";
local147.reach_g2 = "kick";
local147.reach_g2$T = "Anti Reach (Generation 2)";
local147.reach_g2$D = "Punishment for Reach (Generation 2).";
local147.hitbox = "kick";
local147.hitbox$T = "Anti HitBox";
local147.hitbox$D = "Punishment for HitBox.";
local147.killaura = "kick";
local147.killaura$T = "Anti KillAura";
local147.killaura$D = "Punishment for KillAura.";
local147.xray = "ban";
local147.xray$T = "Anti Xray";
local147.xray$D = "Punishment for Xray.";
local147.offhand = "none";
local147.offhand$T = "Anti Offhand";
local147.offhand$D = "Punishment for Offhand.";
local147.forceOp = "none";
local147.forceOp$T = "Anti ForceOp";
local147.forceOp$D = "Punishment for ForceOp.";
local147.ghost = "ban";
local147.ghost$T = "Anti Ghost";
local147.ghost$D = "Punishment for Ghost.";
local147.groundSpoof = "kick";
local147.groundSpoof$T = "Anti Ground Spoof";
local147.groundSpoof$D = "Punishment for Ground Spoof.";
local147.noClip = "none";
local147.noClip$T = "Anti NoClip";
local147.noClip$D = "Punishment for NoClip.";
local147.noSlow = "kick";
local147.noSlow$T = "Anti NoSlow";
local147.noSlow$D = "Punishment for NoSlow.";
local147.scaffold = "none";
local147.scaffold$T = "Anti Scaffold";
local147.scaffold$D = "Punishment for Scaffold.";
local147.durabilityEdit = "kick";
local147.durabilityEdit$T = "Anti Durability Edit";
local147.durabilityEdit$D = "Punishment for durability edit.";
local147.blockAura = "kick";
local147.blockAura$T = "Anti BlockAura";
local147.blockAura$D = "Punishment for Block aura.";
local147.invalidPlace = "kick";
local147.invalidPlace$T = "Anti Invalid Place";
local147.invalidPlace$D = "Punishment for Invalid Place.";
local147.dupe = "ban";
local147.dupe$T = "Anti Dupe";
local147.dupe$D = "Punishment for Dupe.";
local147.nameSpoof = "ban";
local147.nameSpoof$T = "Anti Name Spoof";
local147.nameSpoof$D = "Punishment for Name Spoof.";
local147.blockReach = "kick";
local147.blockReach$T = "Anti Block Reach";
local147.blockReach$D = "Punishment for Block Reach.";
local147.chestAura = "kick";
local147.chestAura$T = "Anti ChestAura";
local147.chestAura$D = "Punishment for ChestAura.";
local147.chestStealer = "kick";
local147.chestStealer$T = "Anti Chest Stealer";
local147.chestStealer$D = "Punishment for Chest Stealer.";
local147.interactReach = "kick";
local147.interactReach$T = "Anti Interact Reach";
local147.interactReach$D = "Punishment for Interact Reach.";
local147.invalidBreak = "kick";
local147.invalidBreak$T = "Invalid Break";
local147.invalidBreak$D = "Punishment for Invalid Break.";
local147.nuker = "ban";
local147.nuker$T = "Anti Nuker";
local147.nuker$D = "Punishment for Nuker.";
local147.placeAutoClicker = "kick";
local147.placeAutoClicker$T = "Anti Place auto clicker.";
local147.placeAutoClicker$D = "Punishment for Place auto clicker.";
local147.crystalAura = "none";
local147.crystalAura$T = "Anti Crystal Aura.";
local147.crystalAura$D = "Punishment for Crystal Aura";
local147.ghostHand = "none";
local147.ghostHand$T = "Ghost Hand";
local147.ghostHand$D = "Punishment for Ghost Hand.";
const local148 = {
  duration: 86400000
};
local148.duration$T = "Ban Duration";
local148.duration$D = "Duration of the ban in milliseconds. -1 for permanent bans.";
local148.appealAt = "Please contact the server owner if you think this is a mistake.";
local148.appealAt$T = "Appeal Message.";
local148.appealAt$D = "Message displayed to banned players, usually containing appeal instructions.";
const local149 = {
  debugMode: false
};
local149.debugMode$T = "Debug Mode";
local149.debugMode$D = "If this option is true, the plugin will no longer execute punishments on flagged player.";
local149.defaultPunishment = "none";
local149.defaultPunishment$T = "Default Punishment";
local149.defaultPunishment$D = "The default punishment when a player is flagged. Options: none, none, none, freeze";
local149.defaultPunishment$V = ["none", "none", "none", "freeze"];
local149.specfic$T = "Specific Punishment";
local149.specfic$D = "Settings for specific punishments.";
local149.specfic$B = "You can set specific punishment for different type of flags. If the specific punishment is set to default, the default punishment will be applied.";
local149.specfic = local147;
local149.disconnectReason = "Unfair advantage";
local149.disconnectReason$T = "Disconnect Reason";
local149.disconnectReason$D = "Reason shown when a player is frozen or disconnected by the anticheat for being suspected to be cheating.";
local149.ban$T = "Ban Settings";
local149.ban$D = "Settings related to banning players.";
local149.ban = local148;
local149.freezeDuration = 3600000;
local149.freezeDuration$T = "Freeze Duration";
local149.freezeDuration$D = "Duration of the freeze punishment in milliseconds. -1 for no expiry.";
const local150 = {
  aim: D
};
local150.aim$T = "Aim Detection (Premium)";
local150.aim$D = "Enables detection of automated/perfect rotation.";
local150.aim$P = true;
local150.autoclicker = true;
local150.autoclicker$T = "AutoClicker Detection";
local150.autoclicker$D = "Detects illegal auto-clicking behavior.";
local150.reach_g1 = false;
local150.reach_g1$T = "Reach Detection (Gen 1)";
local150.reach_g1$D = "Detects reach hacks using a fast 2D algorithm.";
local150.reach_g2 = D;
local150.reach_g2$T = "Reach Detection (Gen 2, Premium)";
local150.reach_g2$D = "Advanced reach detection with improved precision.";
local150.reach_g2$P = true;
local150.hitbox = D;
local150.hitbox$T = "HitBox Detection (Premium)";
local150.hitbox$D = "Flags attacks that hit an entity without the player facing the hitbox.";
local150.hitbox$P = true;
local150.crystalAura = true;
local150.crystalAura$P = D;
local150.crystalAura$T = "Crystal Aura Detection (Premium)";
local150.crystalAura$D = "Detects Crystal Aura cheat that spams crystals automatically.";
local150.ghostHand = true;
local150.ghostHand$P = D;
local150.ghostHand$T = "Ghost Hand Detection (Premium)";
local150.ghostHand$D = "Detects Ghost Hand cheat that hit entities through blocks.";
local150.killaura = true;
local150.killaura$T = "KillAura Detection";
local150.killaura$D = "Detects common kill-aura behaviors.";
const local151 = {
  groundSpoof: true
};
local151.groundSpoof$T = "Ground Spoof Detection";
local151.groundSpoof$D = "Detects players spoofing their on-ground status to bypass server-side rewind. (i.e. AirJump)";
local151.noClip = true;
local151.noClip$T = "NoClip Detection (Phase)";
local151.noClip$D = "Detects players moving through solid blocks illegitimately.";
local151.noSlow = true;
local151.noSlow$T = "NoSlow Detection";
local151.noSlow$D = "Detects players avoiding movement slowdown from using items.";
const local152 = {
  scaffold: false
};
local152.scaffold$T = "Scaffold Detection";
local152.scaffold$D = "Detects unnatural block placements that indicate scaffold hacks.";
local152.blockAura = true;
local152.blockAura$T = "BlockAura Detection";
local152.blockAura$D = "Detects players interacting with blocks from an illegitimate angle.";
local152.blockReach = true;
local152.blockReach$T = "Block Reach Detection";
local152.blockReach$D = "Detects players interacting with blocks from an illegitimate distance.";
local152.chestAura = true;
local152.chestAura$T = "ChestAura Detection";
local152.chestAura$D = "Detects players interacting with chests in an illegitimate manner.";
local152.chestStealer = false;
local152.chestStealer$T = "Chest Stealer Detection (Premmium)";
local152.chestStealer$D = "Detects players stealing items from containers in an illegitimate manner.";
local152.interactReach = true;
local152.interactReach$T = "Interact Reach Detection";
local152.interactReach$D = "Detects players interacting with blocks and entities from an illegitimate distance.";
local152.invalidBreak = true;
local152.invalidBreak$T = "Invalid Break Detection";
local152.invalidBreak$D = "Detects players breaking blocks that are not reachable (i.e. fully surrounded by solid blocks).";
local152.invalidPlace = true;
local152.invalidPlace$T = "Invalid Place Detection (Premmium)";
local152.invalidPlace$D = "Detects players placing blocks in a way that indicates the use of automated building tools.";
local152.invalidPlace$P = true;
local152.nuker = true;
local152.nuker$T = "Nuker Detection";
local152.nuker$D = "Detects players breaking multiple blocks in a very short time frame, which is indicative of nuker hacks.";
local152.placeAutoClicker = true;
local152.placeAutoClicker$T = "Auto-Clicker (Place)";
local152.placeAutoClicker$D = "Detects automated block placement by monitoring block placement CPS. (Possible to false)";
const local153 = {
  offhand: false
};
local153.offhand$T = "Offhand Detection";
local153.offhand$D = "Detects unnaturally fast offhand equipment swapping.";
const local154 = {
  forceOp: false
};
local154.forceOp$T = "ForceOp Detection";
local154.forceOp$D = "Prevent forceOp from working.";
local154.ghost = false;
local154.ghost$T = "Ghost Detection (Premium)";
local154.ghost$D = "Prevents players from becoming invisible without a proper effect.";
local154.ghost$P = true;
local154.durabilityEdit = true;
local154.durabilityEdit$T = "Anti Durability-Edit (Premium)";
local154.durabilityEdit$D = "Check if player edit their item's durability.";
local154.durabilityEdit$P = true;
local154.dupeA = true;
local154.dupeA$T = "Dupe A";
local154.dupeA$D = "Check if the player attempts to duplicate items through bundle usage.";
local154.dupeB = true;
local154.dupeB$T = "Dupe B (Premium)";
local154.dupeB$D = "Check if the player attempts to duplicate items through duplicating accounts.";
local154.dupeB$P = D;
local154.dupeC = true;
local154.dupeC$T = "Dupe C (Premium)";
local154.dupeC$D = "Check inventory on rejoin against stored snapshot.";
local154.dupeC$P = D;
local154.dupeD = true;
local154.dupeD$T = "Dupe D (Premium)";
local154.dupeD$D = "Detect item duplication attempts through hopper stimulation exploits.";
local154.dupeD$P = D;
local154.nameSpoof = true;
local154.nameSpoof$T = "Name Spoof Detection";
local154.nameSpoof$D = "Detects players changing their names to impersonate others.";
const local155 = {
  xray: false
};
local155.xray$T = "Xray Detection";
local155.xray$D = "Catch the pattern of xray user.";
const local156 = {};
local156.combat$T = "Combat Modules";
local156.combat$D = "Modules for detecting combat-related cheats.";
local156.combat = local150;
local156.movement$T = "Movement Modules";
local156.movement$D = "Modules for detecting movement-related cheats.";
local156.movement = local151;
local156.world$T = "World Modules";
local156.world$D = "Modules for detecting cheats that interact with the world in illegitimate ways.";
local156.world = local152;
local156.player$T = "Player Modules";
local156.player$D = "Modules for detecting player-related cheats and exploits.";
local156.player = local153;
local156.exploit$T = "Exploit Modules";
local156.exploit$D = "Modules for preventing various exploits that can give players an unfair advantage.";
local156.exploit = local154;
local156.visual$T = "Visual Modules";
local156.visual$D = "Modules for detecting visual-related cheats.";
local156.visual = local155;
const local157 = {
  antiBreachSwap: true
};
local157.antiBreachSwap$T = "Anti Breach-Swap";
local157.antiBreachSwap$D = "Adds an attack cooldown to the mace to prevent breach-swap exploits.";
local157.worldBorder = false;
local157.worldBorder$T = "World Border";
local157.worldBorder$D = "Prevents players from moving beyond the defined world border. (-> Advanced Settings)";
const local158 = {
  ghostMode: false
};
local158.ghostMode$T = "Ghost Mode (Premium)";
local158.ghostMode$D = "Hides the anticheat from normal players; takes effect after restart.";
local158.ghostMode$P = true;
const local159 = {
  timeline: false
};
local159.timeline$T = "Timeline System";
local159.timeline$D = "Enables the timeline system for tracking player actions and events. (It might bring a very little performance impact)";
local159.detection$T = "Detection Modules";
local159.detection$D = "Modules for detecting various types of cheating behavior.";
local159.detection = local156;
local159.moderation$T = "Moderation Modules";
local159.moderation$D = "Modules for modifying server rules to promote fair gameplay.";
local159.moderation = local157;
local159.misc$T = "Misc Modules";
local159.misc$D = "Miscellaneous modules that provide extra features for your server.";
local159.misc = local158;
const local160 = {
  onJoin: true
};
local160.onJoin$T = "Log Player Join";
local160.onLeave = true;
local160.onLeave$T = "Log Player Leave";
local160.onFlag = true;
local160.onFlag$T = "Log AntiCheat Flags";
local160.onChatcmd = true;
local160.onChatcmd$T = "Log Chat Commands";
const local161 = {};
local161.x$T = "X coordinates";
local161.x = 0;
local161.z$T = "Z coordinates";
local161.z = 0;
const local162 = {};
local162.maxAxisDiff$T = "Maximum Axis Difference";
local162.maxAxisDiff$D = "Maximum x and z difference from the centre. i.e. if you want to set up a 500x500 border, set this to 250.";
local162.maxAxisDiff = 100000;
local162.centreFromSpawn$T = "Set centre to world spawn";
local162.centreFromSpawn = true;
local162.defaultCentre$T = "Default Border Centre (X,Z)";
local162.defaultCentre = local161;
local162.borderMode = "teleport";
local162.borderMode$T = "Border Mode";
local162.borderMode$D = "Choose how the world border is enforced.\n- Teleport: Teleport player back away from the border.\n- Count-down: Count down before killing the player.\n- Void: Do void damage (20%%) to the player.\n- Deterioration: Do void damage (20%%) that will increase over time (+1%%).";
local162.borderMode$V = ["teleport", "count-down", "void", "deterioration"];
local162.timeToKill = 10000;
local162.timeToKill$T = "Time to Kill (Count-down)";
local162.timeToKill$D = "Time (in ms) before the player is killed in count-down mode.";
const local163 = {};
local163.worldBorder$T = "World Border";
local163.worldBorder$D = "Settings for world border.";
local163.worldBorder = local162;
const local164 = {
  trackDuration: 5000
};
local164.trackDuration$T = "Track Duration";
local164.trackDuration$D = "How long (in ticks) Anti Aim monitors combat.";
local164.maxFlag = 5;
local164.maxFlag$T = "Max Flag Count";
local164.maxFlag$D = "Number of suspicious aim checks before a player is flagged (or 'heated').";
const local165 = {};
local165.maceItem = ["minecraft:mace"];
local165.maceItem$T = "Mace Items";
local165.maceItem$D = "Items that receive the attack cooldown.";
local165.cooldown = 600;
local165.cooldown$T = "Cooldown";
local165.cooldown$D = "Attack cooldown in milliseconds.";
local165.sendMsg = true;
local165.sendMsg$T = "Send Message";
local165.sendMsg$D = "Sends a message to players who attack during the cooldown.";
const local166 = {
  maxHps: 24
};
local166.maxHps$T = "Max Hits per Second";
local166.maxHps$D = "Maximum allowed clicks per second before flagging.";
local166.resetCombatTimerAt = 10000;
local166.resetCombatTimerAt$T = "Reset Combat Timer";
local166.resetCombatTimerAt$D = "Inactivity time (ms) after which CPS resets to 0.";
local166.naturalCombatInterval = 250;
local166.naturalCombatInterval$T = "Natural Combat Interval";
local166.naturalCombatInterval$D = "Inactivity interval (ms) after which total combat time is reduced.";
local166.minFlagInterval = 1000;
local166.minFlagInterval$T = "Minimum Flag Interval.";
local166.minFlagInterval$D = "Minimum time (ms) between consecutive AutoClicker flags.";
local166.stopInteractWithin = 1000;
local166.stopInteractWithin$T = "Stop Interact Within";
local166.stopInteractWithin$D = "Duration (ms) for which combat and placement are blocked after illegal CPS detection.";
local166.placeWindowLength = 500;
local166.placeWindowLength$T = "Place Window Length";
local166.placeWindowLength$D = "Time window (ms) for tracking block placements.";
local166.maxPlaceInWindow = 4;
local166.maxPlaceInWindow$T = "Max Place in Window";
local166.maxPlaceInWindow$D = "Maximum block placements allowed within the window.";
const local167 = {
  heatGain: 10
};
local167.heatGain$T = "Heat Gain (Reach G1)";
local167.heatGain$D = "Heat added per reach flag (Gen 1).";
local167.heatLoss = 1.6;
local167.heatLoss$T = "Heat Loss (Reach G1)";
local167.heatLoss$D = "Heat lost per second for Reach Gen 1.";
const local168 = {
  maxFlag: 5,
  normalReachSq: 9.610000000000001
};
local168.normalReachSq$T = "Max Reach Squared";
local168.normalReachSq$D = "Max Reach distance in blocks (it is squared so square root to get normal value)";
local168.spearReachSq = 22.5625;
local168.spearReachSq$T = "Max Reach Squared For Spear";
local168.spearReachSq$D = "Max Reach distance in blocks (it is squared so square root to get normal value)";
local168.maxFlag$T = "Max Flag (Reach)";
local168.maxFlag$D = "Max flag in the window that lead to a flag.";
const local169 = {
  maxOffsetH: 2
};
local169.maxOffsetH$T = "Max Horizontal Offset (Squared)";
local169.maxOffsetH$D = "Maximum allowed horizontal offset for a valid hit.";
local169.maxOffsetV = 1.8;
local169.maxOffsetV$T = "Max Vertical Offset";
local169.maxOffsetV$D = "Maximum allowed vertical offset for a valid hit.";
local169.checkDuration = 16000;
local169.checkDuration$T = "Buffer Reset At";
local169.checkDuration$D = "In ms, define when buffer reset.";
local169.maxFlag = 4;
local169.maxFlag$T = "Max Flag";
local169.maxFlag$D = "Maximum flag in a buffer window lead to a flag.";
const local170 = {
  flags: 5
};
local170.flags$T = "Max Flags";
local170.flags$D = "Max Crystals exploding before the flag.";
const local171 = {
  flags: 4
};
local171.flags$T = "Max Flags";
local171.flags$D = "Max Ghost hand hits before the flag.";
const local172 = {
  heatGain: 19
};
local172.heatGain$T = "Heat Gain (KillAura)";
local172.heatGain$D = "Heat added per kill-aura flag.";
local172.heatLoss = 3;
local172.heatLoss$T = "Heat Loss (KillAura)";
local172.heatLoss$D = "Heat lost per second for KillAura.";
const local173 = {
  k: 3
};
local173.k$T = "Strict Constant (k)";
local173.k$D = "Xray strictness constant. Range: 2.5-5. Higher = fewer false positives.";
local173.foundValid = 5000;
local173.foundValid$T = "Found Valid Duration";
local173.foundValid$D = "Duration, in ms, valid for counting a new ore is found from deep mining. Lower value = lower false positive.";
local173.experimental = false;
local173.experimental$T = "Experimental Mode (Developer)";
local173.experimental$D = "Send data to the player for analysis.";
local173.experimental$P = true;
const local174 = {
  minReactionTime: 75
};
local174.minReactionTime$T = "Min Reaction Time";
local174.minReactionTime$D = "Minimum time (ms) allowed for offhand equip; faster swaps flag the player.";
local174.heatGain = 30;
local174.heatGain$T = "Heat Gain (Offhand)";
local174.heatGain$D = "Heat added per offhand flag.";
local174.heatLoss = 1;
local174.heatLoss$T = "Heat Loss (Offhand)";
local174.heatLoss$D = "Heat lost per second for Offhand detection.";
const local175 = {
  onlyCheckForcedHost: true
};
local175.onlyCheckForcedHost$T = "Check Forced Host Only";
local175.onlyCheckForcedHost$D = "Only monitors highest-level permission changes to avoid false positives.";
const local176 = {
  containerDistance: 10
};
local176.containerDistance$T = "Container Distance";
local176.containerDistance$D = "Maximum distance from a container to not trigger the check.";
local176.dupeContainers = ["minecraft:hopper", "minecraft:dropper", "minecraft:dispenser"];
local176.dupeContainers$T = "Dupe Containers";
local176.dupeContainers$D = "List of container block types that are monitored for duplication attempts.";
local176.rot = 10;
local176.rot$T = "Rotation Threshold";
local176.rot$D = "Maximum allowed rotation difference to make sure the player didnt close the chest.";
const local177 = {
  strikes: 3
};
local177.strikes$T = "Strikes";
local177.strikes$D = "How many duplicated accounts before executing the punishment, e.g if three players of the same account joins execute the punishment (players inventory clearing doesnt count)";
local177.clearInv = true;
local177.clearInv$T = "Clear inventory";
local177.clearInv$D = "If this option is true the duplicated account inventory will get cleared upon spawning";
const local178 = {};
local178.type$T = "Check Wrong Item Type";
local178.type$D = "Checks if the player changed the item type in their inventory when spawning.";
local178.type = true;
local178.amount$T = "Check Wrong Item Amount";
local178.amount$D = "Checks if the player changed the item amount in their inventory when spawning.";
local178.amount = true;
const local179 = {
  chunks: 4
};
local179.chunks$T = "stimulation Chunks";
local179.chunks$D = "Set this number to the stimulation distance on your server (default is 4)";
const local180 = {
  tolerance: 0
};
local180.tolerance$T = "Durability Tolerance";
local180.tolerance$D = "Allowed durability difference.";
local180.tragetItems = ["chestplate", "leggings", "helmet", "boots", "armor", "sword", "axe", "shovel", "hoe", "shield", "road", "mace", "elytra"];
local180.tragetItems$T = "Target Items";
local180.tragetItems$D = "List of item types that are monitored for durability edits.";
const local181 = {
  dbCompare: false
};
local181.dbCompare$T = "Database Comparison";
local181.dbCompare$D = "Compares current player names against a database of previous names to detect name changes.";
local181.strict = false;
local181.strict$T = "Strict Mode";
local181.strict$D = "Flags player names that include non-ASCII characters, which are often used in name spoofing.";
local181.strictAdoptnoneOnly = false;
local181.strictAdoptnoneOnly$T = "Strict Mode none Only";
local181.strictAdoptnoneOnly$D = "nones players with non-ASCII characters in their names without flagging them.";
local181.repeatedNameCheck = false;
local181.repeatedNameCheck$T = "Repeated Name Check";
local181.repeatedNameCheck$D = "Flags the second player that joins with the same name as an already online player, to prevent name spoofing using similar-looking characters.";
const local182 = {
  maxAngle: 100
};
local182.maxAngle$T = "Max Angle";
local182.maxAngle$D = "Maximum angle difference to the target for a valid block interaction.";
local182.maxOffsetXZ = 1.6;
local182.maxOffsetXZ$T = "Max Horizontal Offset";
local182.maxOffsetXZ$D = "Maximum horizontal offset for a valid block interaction.";
local182.maxOffsetY = 1.6;
local182.maxOffsetY$T = "Max Vertical Offset";
local182.maxOffsetY$D = "Maximum vertical offset for a valid block interaction.";
const local183 = {
  max: 39.69
};
local183.max$T = "Max Reach (Squared)";
local183.max$D = "Maximum distance for block interactions.";
local183.ignoreCreative = true;
local183.ignoreCreative$T = "Ignore Creative Mode";
local183.ignoreCreative$D = "Whether to ignore block reach checks for players in creative mode.";
local183.heatGain$T = "Heat Gain (Block Reach)";
local183.heatGain$D = "Heat added per block reach flag.";
local183.heatGain = 25;
local183.heatLoss$T = "Heat Loss (Block Reach)";
local183.heatLoss$D = "Heat lost per second for Block Reach detection.";
local183.heatLoss = 2.5;
const local184 = {
  maxDelay: 125
};
local184.maxDelay$T = "Max Interaction Delay";
local184.maxDelay$D = "Maximum allowed delay (ms) between opening a chest and interacting with it before flagging.";
const local185 = {
  reactionTime: 150
};
local185.reactionTime$T = "Max Steal Reaction Time";
local185.reactionTime$D = "Maximum time (ms) allowed between opening a chest and stealing an item before flagging.";
local185.maxSpeed = 50;
local185.maxSpeed$T = "Max Steal Speed";
local185.maxSpeed$D = "Maximum speed (ms) between stealing items from a chest before flagging.";
const local186 = {
  max: 16
};
local186.max$T = "Max Reach (Squared)";
local186.max$D = "Maximum distance for entity interactions.";
local186.target = ["minecraft:villager", "minecraft:villager2"];
local186.target$T = "Entity Targets";
local186.target$D = "List of entity types that are monitored for interact reach.";
const local187 = {
  max: 25
};
local187.max$T = "Max Reach (Squared)";
local187.max$D = "Maximum distance for block interactions.";
const local188 = {};
local188.entity$T = "Entity Interactions";
local188.entity = local186;
local188.block$T = "Block Interactions";
local188.block = local187;
local188.count = 3;
local188.count$T = "Flag Count";
local188.count$D = "Number of suspicious interactions before flagging.";
local188.checkDuration = 7500;
local188.checkDuration$T = "Check Duration";
local188.checkDuration$D = "Time window (ms) for counting suspicious interactions.";
const local189 = {
  minBlocks: 2
};
local189.minBlocks$T = "Min Blocks";
local189.minBlocks$D = "Minimum number of blocks broken in a short time to trigger the check.";
local189.maxBlocks = 15;
local189.maxBlocks$T = "Max Blocks";
local189.maxBlocks$D = "Number of blocks broken in a short time that leads to a flag.";
local189.ignoreCreative = true;
local189.ignoreCreative$T = "Ignore Creative Mode";
local189.ignoreCreative$D = "Whether to ignore nuker checks for players in creative mode.";
const local190 = {
  maxCps: 24
};
local190.maxCps$T = "Max CPS";
local190.maxCps$D = "Maximum allowed block placements per second before flagging.";
local190.resetTimerAt = 100;
local190.resetTimerAt$T = "Reset Timer At";
local190.resetTimerAt$D = "Inactivity time (ticks) after which block placement CPS resets to 0.";
const local191 = {
  heatGain: 10,
  heatLoss: 1
};
local191.heatGain$T = "Heat Gain (Scaffold)";
local191.heatGain$D = "Heat added per scaffold flag.";
local191.heatLoss$T = "Heat Loss (Scaffold)";
local191.heatLoss$D = "Heat lost per second for Scaffold detection.";
const local192 = {};
local192.aim$T = "Aim";
local192.aim = local164;
local192.antiBreachSwap$T = "Anti Breach-Swap";
local192.antiBreachSwap = local165;
local192.autoclicker$T = "AutoClicker";
local192.autoclicker = local166;
local192.reach_g1$T = "Reach (Generation 1)";
local192.reach_g1 = local167;
local192.reach_g2$T = "Reach (Generation 2)";
local192.reach_g2 = local168;
local192.hitbox$T = "Hit Box";
local192.hitbox = local169;
local192.crystalAura = local170;
local192.ghostHand = local171;
local192.killaura$T = "KillAura";
local192.killaura = local172;
local192.xray$T = "Xray";
local192.xray = local173;
local192.offhand$T = "Offhand";
local192.offhand = local174;
local192.forceOp$T = "ForceOp";
local192.forceOp = local175;
local192.dupeA$T = "Anti Dupe-A";
local192.dupeA = local176;
local192.dupeB$T = "Anti Dupe-B";
local192.dupeB = local177;
local192.dupeC$T = "Anti Dupe-C";
local192.dupeC = local178;
local192.dupeD$T = "Anti Dupe-D";
local192.dupeD = local179;
local192.antiDurabilityEdit$T = "Anti Durability Edit";
local192.antiDurabilityEdit = local180;
local192.nameSpoof$T = "Name Spoof";
local192.nameSpoof = local181;
local192.blockAura$T = "BlockAura";
local192.blockAura = local182;
local192.blockReach$T = "Block Reach";
local192.blockReach = local183;
local192.chestAura$T = "ChestAura";
local192.chestAura = local184;
local192.chestStealer$T = "Chest Stealer";
local192.chestStealer = local185;
local192.interactReach$T = "Interact Reach";
local192.interactReach = local188;
local192.nuker$T = "Nuker";
local192.nuker = local189;
local192.placeAutoClicker$T = "Place AutoClicker";
local192.placeAutoClicker = local190;
local192.scaffold$T = "Scaffold";
local192.scaffold = local191;
const local193 = {
  maxHeat: 100
};
local193.maxHeat$T = "Max Heat";
local193.maxHeat$D = "Static heat limit for the Nexus heat engine.";
local193.moduleSettings$T = "Module Settings";
local193.moduleSettings$D = "Settings for individual utility modules.";
local193.moduleSettings = local163;
local193.constant$T = "Constants [DANGER]";
local193.constant$D = "Constants used in various detection algorithms. Adjusting these can affect the sensitivity and accuracy of cheat detection.";
local193.constant = local192;
const local194 = {
  prefix: "!"
};
local194.prefix$T = "Chat-command Prefix";
local194.prefix$D = "Prefix when using chat command.";
local194.prefix$B = "Suggested to be short enough. This is the prefix of Nexus chat command. For example, if you set it to '!', you can run a chat command by typing '!command' on chat.";
local194.alertSettings$T = "Alert Settings";
local194.alertSettings$D = "Settings for managing alerts.";
local194.alertSettings = local146;
local194.customDamageCompatibilityFix = true;
local194.customDamageCompatibilityFix$T = "Custom Damage Compatibility Fix";
local194.customDamageCompatibilityFix$D = "Allow to fix the damage event compatibility issue with some addon that apply a custom damage system. (i.e Java-Pvp addon)";
local194.punishment$T = "Punishment Settings";
local194.punishment$D = "Settings for managing punishments when a player get flagged.";
local194.punishment = local149;
local194.toggle$T = "Toggle Modules";
local194.toggle$D = "Enable or disable specific modules of the anticheat.";
local194.toggle = local159;
local194.log$T = "Log Settings";
local194.log$D = "Settings for logging player actions and events.";
local194.log = local160;
local194.advanced$T = "Advanced Settings";
local194.advanced$D = "Advanced settings for fine-tuning the anticheat. Adjust with caution, as improper changes may lead to false positives or negatives.";
local194.advanced = local193;
var T = Object.freeze(local194);
let S = JSON.parse(JSON.stringify(T));
const M = function e(t = [], n = T) {
  const local0 = function () {
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
  const local1 = local0(this, function () {
    if (local1.bind().toString().indexOf("\n") !== -1) {
      return;
    }
    return local1.toString().search("(((.+)+)+)+$").toString().constructor(local1).search("(((.+)+)+)+$");
  });
  local1();
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
(function e(t = [], n = T) {
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
const I = {};
function E(e, t) {
  P.prop68(e.join("/"), t);
  It(S, e, t);
}
M.forEach(e => {
  I[e.toLowerCase()] = e;
});
const P = new w(A.prop74);
const N = new w(A.prop70);
const O = new w(A.prop71);
const B = new w(A.prop72);
const z = new w(A.prop73);
const L = "https://discord.gg/PWCcRZQDPf";
let local195 = "§e";
let R = "§c";
let H = "§8[§uNexus§8] §e";
let F = "§g";
const V = new w(A.prop76);
const q = new w(A.prop77);
function K(t, n = "§uNexus AutoMod", a = "id", o = "Unspecified", i = -1, r = "No data") {
  const s = i === -1 ? -1 : Date.now() + i;
  if (a === "id") {
    const local2 = {
      reason: o,
      expire: s,
      name: r
    };
    V.prop68(t, local2);
    const n = e.getAllPlayers().find(({
      id: e
    }) => e === t);
    if (n) {
      G(n);
    }
  } else if (a === "name") {
    q.prop68(t, {
      reason: o,
      by: n,
      expire: s
    });
  }
}
function G(e) {
  const t = V.prop67(e.id);
  if (t) {
    if (t.expire === -1 || t.expire > Date.now()) {
      U(e, t);
      return true;
    }
    V.prop68(e.id);
  } else {
    const t = q.prop67(e.name);
    if (t) {
      if (t.expire === -1 || t.expire > Date.now()) {
        q.prop68(e.name);
        K(e.id, t.by, "id", t.reason, t.duration, e.name);
        U(e, t);
        return true;
      }
      q.prop68(e.name);
    }
  }
  return false;
}
function U(e, t) {
  const n = j(t);
  e.sendMessage(n);
  Et(e, n);
}
function j(e) {
  const t = S.punishment.ban.appealAt;
  const {
    reason: n,
    expire: a
  } = e;
  return "§cYou have been blacklisted.\n§l§8>> §r§eReason§l§8: §r§c" + n + "\n§r§l§8>> §r§eDuration §l§8: §r§c" + Ot(a === -1 ? -1 : a - Date.now()) + "\n§8>> §r§e" + t + "§r";
}
function W(e) {
  return Object.values(V.prop66()).some(({
    name: t
  }) => t === e) || q.prop69(e);
}
function Y(e) {
  let t = false;
  if (V.prop67(e)) {
    V.prop68(e);
    t = true;
  }
  const n = V.prop66() || {};
  for (const [a, o] of Object.entries(n)) {
    if (o && o.name === e) {
      V.prop68(a);
      t = true;
    }
  }
  if (q.prop67(e)) {
    q.prop68(e);
    t = true;
  }
  return t;
}
const J = new w(A.prop78);
const X = new Map();
function Z(e, t = "Nexus AutoMod", n = "Unspecified", a = -1) {
  const o = a === -1 ? -1 : Date.now() + a * 1000;
  let i = J.prop67(e.id);
  if (i) {
    i.by = t;
    i.reason = n;
    i.expire = o;
    J.prop68(e.id, i);
  } else {
    J.prop68(e.id, {
      name: e.name,
      by: t,
      reason: n,
      expire: o,
      location: e.location,
      dimension: e.dimension.id,
      gameMode: e.prop34,
      rotation: e.getRotation()
    });
  }
  Q(e);
}
function Q(a) {
  const o = J.prop67(a.id);
  if (!o) {
    return;
  }
  const {
    reason: i,
    expire: r
  } = o;
  const s = Date.now();
  if (r !== -1 && s > r) {
    ee(a, o);
    return;
  }
  if (X.has(a.id)) {
    t.clearRun(X.get(a.id));
  }
  const {
    x: c,
    z: l
  } = e.getDefaultSpawnLocation();
  const d = {
    x: c,
    y: -100,
    z: l
  };
  const u = t.runInterval(() => {
    if (!a.isValid || !J.prop69(a.id)) {
      t.clearRun(u);
      X.delete(a.id);
      return;
    }
    const e = Date.now();
    if (r !== -1 && e > r) {
      t.clearRun(u);
      X.delete(a.id);
      ee(a, o);
      return;
    }
    a.setGameMode(n.Spectator);
    a.teleport(d, {
      dimension: Ke
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
  X.set(a.id, u);
}
function ee(t, n) {
  const {
    location: a,
    gameMode: o,
    rotation: i,
    dimension: r
  } = n;
  if (t.isValid) {
    t.teleport(a, {
      rotation: i,
      dimension: e.getDimension(r)
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
  J.prop68(t.id);
}
const local196 = {
  prop79: "0",
  prop80: "1",
  prop81: "2",
  prop82: "3",
  prop83: "4",
  prop84: "5"
};
const local197 = {
  prop85: "0",
  prop86: "1",
  prop87: "2",
  prop88: "3",
  prop89: "4",
  prop90: "5",
  prop91: "6",
  prop92: "7",
  prop93: "8",
  prop94: "9",
  prop82: "10",
  prop95: "11"
};
const te = Object.freeze(local196);
const ne = Object.freeze(local197);
const ae = new w(A.prop75);
function oe(e, t, n, ...a) {
  if (!S.toggle.timeline) {
    return;
  }
  const o = ae.prop67(".");
  const i = Array.isArray(o) ? o : [];
  i.push([e, t, n, a]);
  if (i.length > 1000) {
    i.splice(0, i.length - 1000);
  }
  ae.prop68(".", i);
}
function ie(e, t, n, a, ...o) {
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
  } = S;
  let u = H + "§f" + e.name + " §r§7flagged §c" + t + " §8§l(§r§c" + n + "§8§l)";
  if (o.length > 0) {
    u += " " + o.map(e => {
      const [t, ...n] = e.split("=");
      return "§8§l(§r§f" + t + "§r§8: §7" + n.join("=") + "§r§8§l)";
    }).join(" ");
  }
  Pt(u, d, e);
  if (S.log.onFlag) {
    oe(Date.now(), e.name, te.prop80, t, n, a, Ge.get(e.id), ...o);
  }
  if (!i && !Dt(e)) {
    if (a === "default") {
      a = r;
    }
    switch (a) {
      case "kick":
        Et(e);
        break;
      case "freeze":
        Z(e, "Nexus AutoMod", s, l);
        break;
      case "ban":
        K(e.id, "Nexus AutoMod", "id", s, c, e.name);
    }
  }
}
function re(e, n, a, o, ...i) {
  t.run(() => ie(e, n, a, o, ...i));
}
const se = new Map();
function ce(t, n, a, o, i, r, ...s) {
  const c = t.id;
  const l = Date.now();
  let d = se.get(c);
  if (!d) {
    d = {
      last: l,
      modules: new Map()
    };
    se.set(c, d);
  }
  const u = l - d.last;
  d.last = l;
  const m = u > 0;
  const f = m ? u / 1000 : 0;
  let p = 0;
  const local3 = d.modules;
  if (local3.size > 0) {
    for (const [e, t] of local3) {
      if (m && (t.heat -= t.loss * f, t.heat <= 0)) {
        local3.delete(e);
      } else {
        p += t.heat;
      }
    }
  }
  const h = local3.get(n);
  if (h) {
    h.heat += o;
    h.punish = r;
    p += o;
  } else {
    local3.set(n, {
      heat: o,
      loss: i,
      punish: r,
      module: n
    });
    p += o;
  }
  if (S.toggle.timeline) {
    Ue(l, t.id, ne.prop95, n, a, p.toFixed(2), String(o));
  }
  if (S.alertSettings.showSilentFlag) {
    let e = H + "§f" + t.name + " §r§7failed §c" + n + " §8§l(§r§c" + a + "§8§l)";
    if (s.length > 0) {
      e += " " + s.map(e => {
        const [t, ...n] = e.split("=");
        return "§8§l(§r§f" + t + "§r§8: §7" + n.join("=") + "§r§8§l)";
      }).join(" ");
    }
    Pt(e, S.alertSettings, t);
  }
  const g = S.advanced.maxHeat;
  if (p > g) {
    let o = null;
    let i = -1;
    let s = "\n";
    for (const e of local3.values()) {
      if (e.heat > i) {
        i = e.heat;
        o = e;
      }
      s += "\n§r§8> §7" + n + ": §9" + (e.heat / S.advanced.maxHeat * 100).toFixed(2) + "%";
    }
    if (o) {
      (o.heat / g * 100).toFixed(2);
      o.punish;
      o.module;
    }
    let c = H + F + t.name + local195 + " has been flagged for unfair advantage." + s;
    c += "";
    e.sendMessage(c);
    if (S.log.onFlag) {
      oe(Date.now(), t.name, te.prop80, n, a, r, Ge.get(t.id), ...d);
    }
    if (S.punishment.debugMode || Dt(t)) {
      return;
    }
    if (r === "default") {
      r = S.punishment.defaultPunishment;
    }
    switch (r) {
      case "kick":
        Et(t);
        break;
      case "freeze":
        Z(t, "Nexus AutoMod", S.punishment.disconnectReason, S.punishment.freezeDuration);
        break;
      case "ban":
        K(t.id, "Nexus AutoMod", "id", S.punishment.disconnectReason, S.punishment.ban.duration, t.name);
    }
    local3.clear();
  }
}
function le(e, n, a, o, i, r, ...s) {
  t.run(() => ce(e, n, a, o, i, r, ...s));
}
e.afterEvents.worldLoad.subscribe(() => {
  qe.prop96.push(e => {
    se.delete(e);
  });
});
const local198 = {};
local198.recievePrefix = "nexus.authentication:";
local198.success = "nexus.authentication.success";
local198.failed = "nexus.authentication.failed";
local198.inUse = "nexus.auhtentication.token.inUse:";
local198.authenticatorDown = "nexus.authenticator.isDown";
const local199 = {};
local199.valid = "nexus.subscription.valid";
local199.invalid = "nexus.subscription.invalid";
const local200 = {};
local200.valid = "nexus.information.valid";
local200.invalid = "nexus.information.inValid";
local200.request = "nexus.information.request";
local200.recievePrefix = "nexus.information.message:";
const local201 = {};
local201.messageRate = "nexus.violation.messageRate";
local201.sizeLimit = "nexus.violation.sizeLimit";
local201.invalidMessage = "nexus.violation.invalidMessage";
local201.outdatedProtocol = "nexus.violation.outdatedProtocol";
local201.earlyPacket = "nexus.violation.earlyPacket";
local201.invalidPlayerCounts = "nexus.violation.invalidPLayerCount";
const local202 = {};
local202.tp = "nexus.player.teleport:";
local202.runCommand = "nexus.player.runCommand:";
const local203 = {};
local203.check = "nexus.ban.check:";
local203.result = "nexus.ban.result:";
const local204 = {};
local204.request = "nexus.query.request:";
local204.response = "nexus.query.response:";
const local205 = {};
local205.sync = "nexus.inventory.sync:";
const local206 = {};
local206.accessAccepted = "nexus.access.accepted";
local206.auth = local198;
local206.expirey = local199;
local206.information = local200;
local206.violations = local201;
local206.flagPrefix = "nexus.detection.flag:";
local206.cloudMode = "nexus.cloud.full";
local206.player = local202;
local206.action = "nexus.action:";
local206.cloudSync = "nexus.cloud.sync:";
local206.ban = local203;
local206.query = local204;
local206.inventory = local205;
local206.connection = "nexus.connection.established";
local206.retryLater = "nexus.connection.retryLater:";
local206.disconnection = "nexus.disconnection";
const local207 = {
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
const local208 = {};
local208.head = a.Head;
local208.chest = a.Chest;
local208.legs = a.Legs;
local208.feet = a.Feet;
const de = Object.freeze(local206);
const ue = Object.freeze(local207);
const me = "2.0.2";
const fe = local208;
function pe(e, t = 0) {
  if (!e) {
    return null;
  }
  const local4 = {};
  local4.typeId = e.typeId;
  local4.amount = e.amount;
  const n = local4;
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
              ...pe(a, t + 1)
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
function func209(e, t = 0) {
  if (!e || typeof e.typeId != "string") {
    return;
  }
  let n;
  try {
    if (e.potion && e.potion.effect && i.createPotion) {
      n = i.createPotion({
        effect: e.potion.effect,
        liquid: e.potion.delivery || "Consume"
      });
    }
  } catch {}
  if (n) {
    n.amount = Math.max(1, Math.min(255, Number(e.amount) || 1));
  } else {
    n = new i(e.typeId, Math.max(1, Math.min(255, Number(e.amount) || 1)));
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
          const e = o.get(n.id);
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
          const e = func209(n, t + 1);
          if (e && n.slot < a.size) {
            a.setItem(n.slot, e);
          }
        }
      }
    } catch {}
  }
  return n;
}
function he(e) {
  const t = [];
  const n = e.getComponent("minecraft:inventory")?.container;
  if (n) {
    for (let e = 0; e < n.size; e++) {
      const a = n.getItem(e);
      if (a) {
        t.push({
          slot: e,
          ...pe(a)
        });
      }
    }
  }
  const o = e.getComponent("minecraft:equippable");
  const i = e => {
    try {
      return pe(o?.getEquipment(e));
    } catch {
      return null;
    }
  };
  const r = {};
  for (const [e, t] of Object.entries(fe)) {
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
            ...pe(n)
          });
        }
      }
    }
  } catch {}
  return {
    items: t,
    armor: r,
    offhand: i(a.Offhand),
    enderChest: s,
    size: n?.size ?? 36,
    full: true
  };
}
function ge(e, t) {
  if (!t) {
    return;
  }
  if (!e || e.typeId !== t.typeId) {
    return func209(t);
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
          const t = o.get(n.id);
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
function ye(e, t) {
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
        inventory: o ?? he(e)
      });
    } catch {}
  }
  if (n.length) {
    try {
      const local5 = {
        players: n
      };
      e.send(de.inventory.sync + JSON.stringify(local5));
    } catch (e) {
      console.warn("[Nexus] inventory sync failed: " + e);
    }
  }
}
const be = new Set();
let ve = false;
let we = false;
let xe = false;
let ke = null;
let Ce = null;
function Ae(e, t, n) {
  const local6 = {};
  local6.player = e;
  local6.reason = t;
  local6.snapshot = n;
  if (xe && Ce) {
    ye(Ce, [local6]);
  }
}
let De;
let Te = false;
function Se(e) {
  try {
    if (!e || !we) {
      return;
    }
    const t = {
      config: S,
      bans: V.prop66 && V.prop66() || {},
      bansByName: q.prop66 && q.prop66() || {},
      freezes: J.prop66 && J.prop66() || {}
    };
    e.send(de.cloudSync + JSON.stringify(t));
  } catch (e) {
    console.warn("[Nexus] cloud sync failed: " + e);
  }
}
function Me(e) {
  try {
    if (!we || !ke || !ke.isOpen || !e) {
      return;
    }
    const local7 = {};
    local7.name = e.name;
    local7.id = e.id;
    ke.send(de.ban.check + JSON.stringify(local7));
  } catch {}
}
function Ie(n, a) {
  switch (n) {
    case de.auth.success:
      e.sendMessage("§8[§uNexus§8] §aAuthentication to Nexus Backend has been done!");
      console.warn("[Nexus] Authentication to Nexus Backend has been done!");
      break;
    case de.auth.failed:
      O.prop68("current", undefined);
      xe = false;
      we = false;
      e.sendMessage("§8[§uNexus§8] §cAuthentication to Nexus Backend has been rejected! §eThe license key was removed. Set a valid one with " + S.prefix + "setToken <key>.");
      console.warn("[Nexus] Authentication to Nexus Backend has been rejected! The license key was removed.");
      try {
        if (a.isOpen) {
          a.close();
        }
      } catch {}
      break;
    case de.expirey.valid:
      e.sendMessage("§8[§uNexus§8] §aThe anticheat isn't expired!");
      console.warn("[Nexus] The anticheat isn't expired!");
      break;
    case de.expirey.invalid:
      e.sendMessage("§8[§uNexus§8] §cThe anticheat subscription is expired!");
      console.warn("[Nexus] The anticheat is expired!");
      break;
    case de.information.request:
      e.sendMessage("§8[§uNexus§8] §eanticheat information has been sent!");
      console.warn("[Nexus] anticheat information has been sent!");
      a.send(function () {
        let t = [];
        for (const n of e.getAllPlayers()) {
          t.push({
            name: n.name,
            id: n.id
          });
        }
        const local8 = {
          config: S,
          playerList: t
        };
        local8.protocolVersion = me;
        return de.information.recievePrefix + JSON.stringify(local8);
      }());
      break;
    case de.information.valid:
      e.sendMessage("§8[§uNexus§8] §aanticheat information is valid!");
      console.warn("[Nexus] anticheat information is valid!");
      break;
    case de.information.invalid:
      e.sendMessage("§8[§uNexus§8] §canticheat information is invalid contact support if  you think this is a bug!");
      console.warn("[Nexus] anticheat information is invalid contact support if  you think this is a bug!");
      break;
    case de.connection:
      xe = true;
      Ce = a;
      o = () => Ce;
      i = () => xe && !!Ce && Ce.isOpen !== false;
      if (!ve) {
        ve = true;
        t.runInterval(() => {
          if (!be.size || !i()) {
            return;
          }
          const t = [];
          for (const n of be) {
            const a = e.getEntity(n);
            if (a && a.isValid && a.typeId === "minecraft:player") {
              t.push({
                player: a,
                reason: "change"
              });
            }
          }
          be.clear();
          for (let e = 0; e < t.length; e += 5) {
            ye(o(), t.slice(e, e + 5));
          }
        }, 300);
      }
      e.sendMessage("§8[§uNexus§8] §aThe connection between the backend and the anticheat has been established, time for anticheating!");
      console.warn("[Nexus] The connection between the backend and the anticheat has been established, time for anticheating!");
      break;
    case de.cloudMode:
      e.sendMessage("§8[§uNexus§8] §aCloud protection is active!");
      console.warn("[Nexus] Cloud protection is active!");
      we = true;
      ke = a;
      Se(a);
      for (const t of e.getAllPlayers()) {
        Me(t);
      }
      if (!Te) {
        Te = true;
        t.runInterval(() => {
          if (we && ke && ke.isOpen) {
            Se(ke);
          }
        }, 600);
      }
      break;
    case de.auth.inUse:
      e.sendMessage("§8[§uNexus§8] §cyour license key is in use!");
      console.warn("[Nexus] your license key is in use!");
      xe = false;
      we = false;
      break;
    case de.auth.authenticatorDown:
      e.sendMessage("§8[§uNexus§8] §cthe authenticator for tokens is down! please wait til it up again. join the discord server to recieve latest news: " + L);
      console.warn("[Nexus] the authenticator for tokens is down! please wait til it up again. join the discord server to recieve latest news: " + L);
      xe = false;
      we = false;
      break;
    case de.violations.earlyPacket:
    case de.violations.invalidMessage:
    case de.violations.invalidPlayerCounts:
    case de.violations.messageRate:
    case de.violations.sizeLimit:
      e.sendMessage("§8[§uNexus§8] §cThe anticheat has done a violation (" + n + "), contact support if  you think this is a bug!");
      console.warn("[Nexus] The anticheat has done a violation (" + n + "), contact support if  you think this is a bug!");
      break;
    case de.violations.outdatedProtocol:
      O.prop68("outdated", me);
      xe = false;
      we = false;
      e.sendMessage(He());
      console.warn("[Nexus] The anticheat has an outdated protocol! Stopped reconnecting until the pack is updated.");
      try {
        if (a.isOpen) {
          a.close();
        }
      } catch {}
      break;
    case de.disconnection:
      e.sendMessage("§8[§uNexus§8] §cThe anticheat got disconnected from the backend server!");
      console.warn("[Nexus] The anticheat got disconnected from the backend server!");
      if (a.isOpen) {
        a.close();
      }
      we = false;
      xe = false;
  }
  var o;
  var i;
  if (n.startsWith(de.retryLater)) {
    let t = {};
    try {
      t = JSON.parse(n.slice(de.retryLater.length)) || {};
    } catch {}
    (function (t, n) {
      const a = Math.max(1, Math.min(1440, Number(t) || 15));
      local214 = Date.now() + a * 60 * 1000;
      Le = 0;
      e.sendMessage(H + "§eThe Nexus backend asked us to reconnect later" + (n ? " §8(§7" + n + "§8)" : "") + "§e. Retrying in §a" + a + " §eminute" + (a === 1 ? "" : "s") + "§e.");
      console.warn("[Nexus] backend asked to reconnect later (" + (n || "no reason") + "), retrying in " + a + " min");
    })(t.minutes, t.reason);
    return;
  }
  if (n.startsWith(de.flagPrefix)) {
    const e = JSON.parse(n.replace(de.flagPrefix, ""));
    for (const t of e) {
      ie(t.player, t.module, t.type, t.punishment);
    }
  }
  if (n.startsWith(de.player.tp)) {
    const t = JSON.parse(n.replace(de.player.tp, ""));
    for (const n of t) {
      const {
        player: t,
        location: a,
        dimension: o
      } = n;
      const i = e.getPlayers({
        name: t.name
      })[0];
      i.teleport(a, {
        dimension: e.getDimension(o ?? i.dimension.id)
      });
    }
  }
  if (n.startsWith(de.player.runCommand)) {
    const t = JSON.parse(n.replace(de.player.runCommand, ""));
    for (const n of t) {
      const {
        player: t,
        command: a
      } = n;
      const o = e.getPlayers({
        name: t.name
      })[0];
      if (o && o.isValid) {
        o.runCommand(a);
      }
    }
  }
  if (n.startsWith(de.action)) {
    let e;
    try {
      e = JSON.parse(n.replace(de.action, ""));
    } catch {
      e = [];
    }
    for (const t of e) {
      try {
        Pe(t, a);
      } catch (e) {
        console.warn("[Nexus] action failed: " + e);
      }
    }
  }
  if (n.startsWith(de.ban.result)) {
    let t;
    try {
      t = JSON.parse(n.replace(de.ban.result, ""));
    } catch {
      t = null;
    }
    if (t && t.banned) {
      const n = t.id && e.getEntity(t.id) || Ee(t.name);
      if (n && n.isValid) {
        const local9 = {};
        local9.reason = t.reason ?? "Unspecified";
        local9.expire = t.expire ?? -1;
        const e = j(local9);
        try {
          n.sendMessage(e);
        } catch {}
        Et(n, e);
      }
    }
  }
  if (n.startsWith(de.query.request)) {
    let e;
    try {
      e = JSON.parse(n.replace(de.query.request, ""));
    } catch {
      e = [];
    }
    const t = [];
    for (const n of e) {
      let e = null;
      try {
        e = Ne(n);
      } catch (e) {
        console.warn("[Nexus] query failed: " + e);
      }
      const local10 = {
        id: n.id
      };
      local10.kind = n.kind;
      local10.data = e;
      t.push(local10);
    }
    try {
      a.send(de.query.response + JSON.stringify(t));
    } catch {}
  }
}
function Ee(t) {
  if (t) {
    return e.getPlayers({
      name: t
    })[0];
  } else {
    return undefined;
  }
}
function Pe(t, n) {
  switch (t.kind) {
    case "kick":
      {
        const e = Ee(t.player?.name);
        if (e && e.isValid) {
          Et(e, t.reason ?? "");
        }
        break;
      }
    case "ban":
      {
        const e = Ee(t.player?.name);
        if (e) {
          K(e.id, "§uNexus", "id", t.reason ?? "Unspecified", t.duration ?? -1, e.name);
        } else if (t.player?.name) {
          K(t.player.name, "§uNexus", "name", t.reason ?? "Unspecified", t.duration ?? -1, t.player.name);
        }
        Se(n);
        break;
      }
    case "freeze":
      {
        const e = Ee(t.player?.name);
        if (e && e.isValid) {
          Z(e, "§uNexus", t.reason ?? "Unspecified", t.duration ?? -1);
        }
        Se(n);
        break;
      }
    case "unban":
      if (t.target) {
        Y(String(t.target));
      }
      Se(n);
      break;
    case "unfreeze":
      {
        const e = Ee(t.player?.name);
        if (e && e.isValid) {
          const t = J.prop67(e.id);
          if (t) {
            ee(e, t);
          } else {
            J.prop68(e.id);
          }
        } else if (t.player?.name) {
          const e = J.prop66 && J.prop66() || {};
          for (const [n, a] of Object.entries(e)) {
            if (a && a.name === t.player.name) {
              J.prop68(n);
            }
          }
        }
        Se(n);
        break;
      }
    case "op":
      {
        const e = Ee(t.player?.name);
        if (e && e.isValid) {
          Tt(e, true);
        }
        break;
      }
    case "deop":
      {
        const e = Ee(t.player?.name);
        if (e && e.isValid) {
          Tt(e, false);
        }
        break;
      }
    case "announce":
      e.sendMessage(String(t.message ?? ""));
      break;
    case "tell":
      {
        const n = function (t) {
          if (!t) {
            return [];
          }
          if (t.all) {
            return e.getAllPlayers();
          }
          if (t.name) {
            const e = Ee(t.name);
            if (e) {
              return [e];
            } else {
              return [];
            }
          }
          if (Array.isArray(t.names)) {
            return t.names.map(Ee).filter(Boolean);
          } else if (t.tag) {
            return e.getPlayers({
              tags: [t.tag]
            });
          } else if (t.op) {
            return e.getAllPlayers().filter(e => St(e));
          } else if (t.admin) {
            return e.getAllPlayers().filter(e => e.prop97);
          } else {
            return [];
          }
        }(t.target);
        if (n.length) {
          Nt(n, String(t.message ?? ""));
        }
        break;
      }
    case "run":
      if (t.player?.name) {
        const e = Ee(t.player.name);
        if (e && e.isValid) {
          e.runCommand(String(t.command));
        }
      } else {
        (t.dimension ? e.getDimension(t.dimension) : Ke).runCommand(String(t.command));
      }
      break;
    case "tp":
      {
        const n = Ee(t.player?.name);
        if (!n || !n.isValid) {
          break;
        }
        const a = t.destination ?? {};
        if (a.player) {
          const e = Ee(a.player);
          if (e && e.isValid) {
            n.teleport(e.location, {
              dimension: e.dimension
            });
          }
        } else if (typeof a.x == "number") {
          n.teleport(a, {
            dimension: e.getDimension(t.dimension ?? n.dimension.id)
          });
        }
        break;
      }
    case "setInventory":
      {
        const e = Ee(t.player?.name);
        if (!e || !e.isValid) {
          break;
        }
        (function (e, t) {
          if (!Array.isArray(t)) {
            return 0;
          }
          e.prop98 = Date.now() + 3000;
          const local11 = {
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
          } : e.section === "armor" && i && fe[e.slot] ? {
            ok: true,
            item: i.getEquipment(fe[e.slot])
          } : e.section === "offhand" && i ? {
            ok: true,
            item: i.getEquipment(a.Offhand)
          } : local11;
          const s = (e, t) => {
            if (e.section === "items") {
              n.setItem(e.slot, t);
            } else if (e.section === "enderChest") {
              o.setItem(e.slot, t);
            } else if (e.section === "armor") {
              i.setEquipment(fe[e.slot], t);
            } else if (e.section === "offhand") {
              i.setEquipment(a.Offhand, t);
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
                  a.setItem(e.sub, e.item ? ge(a.getItem(e.sub), e.item) : undefined);
                  s(e, n);
                } else {
                  s(e, e.item ? ge(t.item, e.item) : undefined);
                }
                c++;
              } catch (t) {
                console.warn("[Nexus] inventory edit failed (" + e.section + ":" + e.slot + (typeof e.sub == "number" ? "/" + e.sub : "") + "): " + t);
              }
            }
          }
        })(e, t.changes);
        ye(n, [{
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
              E(t.path, t.value);
            } catch (e) {
              console.warn("[Nexus] setConfig failed for " + t.path.join("/") + ": " + e);
            }
          }
        }
        Se(n);
        break;
      }
  }
}
function Ne(e) {
  const t = Ee(e.player?.name);
  if (!t || !t.isValid) {
    return null;
  }
  if (e.kind === "location") {
    const e = t.getRotation();
    const local12 = {
      x: e.x,
      y: e.y
    };
    const local13 = {};
    local13.name = t.name;
    local13.location = {};
    local13.dimension = t.dimension.id;
    local13.rotation = local12;
    local13.location.x = t.location.x;
    local13.location.y = t.location.y;
    local13.location.z = t.location.z;
    return local13;
  }
  if (e.kind === "inventory") {
    return he(t);
  } else {
    return null;
  }
}
import("@minecraft/server-net").then(e => {
  De = e.websocket;
}).catch(e => {});
const local210 = {
  id: "NA"
};
local210.addresse = "ws://104.243.47.204:25768";
const local211 = {
  id: "AS"
};
local211.addresse = "ws://160.187.210.56:25574";
const local212 = {
  id: "EU"
};
local212.addresse = "ws://95.214.55.72:25591";
const local213 = {};
local213.id = "LOCAL";
local213.addresse = "ws://127.0.0.1:19165";
const Oe = [local210, local211, local212, local213];
let Be;
let ze = false;
let Le = 0;
let local214 = 0;
function Re() {
  return O.prop67("outdated") === me;
}
function He() {
  return H + "§cNexus is outdated and has stopped connecting to the backend. §eUpdate the pack from the Nexus Discord: §b" + L;
}
function Fe(t) {
  Le++;
  console.warn("[Nexus] connection attempt " + Le + "/5 failed (" + t + ")");
  if (Le >= 5) {
    Le = 0;
    local214 = Date.now() + 900000;
    console.warn("[Nexus] backend unreachable after 5 attempts, retrying in 15 minutes");
    e.sendMessage(H + "§cCouldn't reach the Nexus backend after 5 attempts. §eTrying again in 15 minutes.");
  }
}
async function Ve() {
  if (Re()) {
    return;
  }
  if (Date.now() < local214) {
    return;
  }
  if (ze) {
    return;
  }
  const n = O.prop67("current");
  if (!n) {
    return;
  }
  const a = B.prop67("current");
  if (a) {
    if (De) {
      if (!Be?.isOpen) {
        ze = true;
        try {
          let o;
          console.warn("[Nexus] the anticheat isnt connected, trying to connect to " + a.id + " server...");
          e.sendMessage(H + ("§ethe anticheat §cisnt connected§8,§e trying to connect to §a" + a.id + " §eserver§8..."));
          try {
            o = await De.connect(a.addresse);
          } catch (e) {
            Fe("connect error");
            return;
          }
          Be = o;
          if (!o.isOpen) {
            try {
              o.close();
            } catch {}
            Fe("socket didn't open");
            return;
          }
          console.warn("[Nexus] Connected sucessfully");
          e.sendMessage(H + "§aConnected sucessfully");
          let i = false;
          o.afterEvents.message.subscribe(e => {
            if (!i) {
              i = true;
              Le = 0;
            }
            Ie(e.message, o);
          });
          o.send(de.auth.recievePrefix + n);
          t.runTimeout(() => {
            if (!i) {
              try {
                o.close();
              } catch {}
              Fe("no response");
            }
          }, 200);
        } finally {
          ze = false;
        }
      }
    } else {
      console.warn("[Nexus] Server net is disabled. Unable to connect to server.");
    }
  }
}
const local215 = {
  prop99: [],
  prop100: [],
  prop101: [],
  prop102: [],
  prop96: [],
  prop103: [],
  prop104: [],
  prop105: [],
  prop106: [],
  prop107: [],
  prop108: [],
  prop109: [],
  prop110: [],
  prop111: [],
  prop112: [],
  prop113: [],
  prop114: [],
  prop115: [],
  prop116: [],
  prop117: []
};
const qe = local215;
let Ke;
const Ge = new Map();
function Ue(e, t, n, ...a) {
  Ge.get(t)?.push([e, n, ...a]);
}
let je;
let We = [];
let Ye = 0;
function Je() {
  We = e.getAllPlayers();
}
let Xe = [];
function Ze() {
  Xe = [];
}
const Qe = new Map();
async function et(e, t, n, a, o = "") {
  const i = new f();
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
    return et(e, t, n, a, "You should input a number");
  } else {
    return l;
  }
}
async function tt(e, t, n, a) {
  const o = [...t, n];
  const i = Mt(S, qt(o, "T")) ?? n;
  const r = Mt(S, qt(o, "B")) ?? Mt(S, qt(o, "D")) ?? "";
  if (Array.isArray(a)) {
    const t = new f().title("Edit " + i).textField(r || "Enter values separated by commas (e.g., \"value1,value2,value3\")", "Enter values separated by commas", {
      defaultValue: a.join(",")
    });
    const n = await t.show(e);
    if (n.canceled) {
      return;
    }
    const s = n.formValues?.[0];
    if (typeof s == "string") {
      E(o, s.split(",").map(e => e.trim()).filter(e => e.length > 0));
    }
  } else if (typeof a == "number") {
    const t = await et(e, "Edit " + i, r || i, a);
    if (t !== null) {
      E(o, t);
    }
  } else if (typeof a == "string") {
    const local14 = {
      defaultValue: a
    };
    const t = new f().title("Edit " + i).textField(r || "Enter new value", "Enter new value", local14);
    const n = await t.show(e);
    if (n.canceled) {
      return;
    }
    const s = n.formValues?.[0];
    if (typeof s == "string" && s !== a) {
      E(o, s);
    }
  }
}
async function nt(e, t = [], n = "") {
  const a = new m();
  const o = Mt(S, t);
  if (!o) {
    e.sendMessage("§cError: Configuration path not found.");
    return;
  }
  const i = Object.keys(o).filter(e => !e.includes("$"));
  let r = "";
  if (t.length === 0) {
    r += "This is the root of the configuration. Click the property to change them.";
  } else {
    r += Mt(S, qt(t, "D")) ?? "";
  }
  a.button("§c§lBack!");
  for (const e of i) {
    const n = Mt(S, qt([...t, e], "T")) ?? "§4§lTITLE NOT FOUND (bug)";
    const o = Mt(S, qt([...t, e], "D")) ?? "";
    if (o) {
      r += o ? "\n§n" + n + ": §7" + o : "";
    }
    let i = Mt(S, [...t, e]);
    const s = typeof i;
    let c = "";
    Mt(S, qt([...t, e], "P"));
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
  const s = t.length === 0 ? "Configuration" : Mt(S, qt(t, "T")) ?? t.join("/");
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
      at(e);
    } else {
      const n = [...t];
      n.pop();
      nt(e, n);
    }
    return;
  }
  const d = i[l - 1];
  const u = Mt(S, [...t, d]);
  const p = typeof u;
  Mt(S, qt([...t, d], "P"));
  const local15 = Mt(S, qt([...t, d], "V"));
  if (local15 && Array.isArray(local15)) {
    const n = await function (e, t, n, a, o) {
      const i = Mt(S, qt([...t, n], "T")) ?? n;
      const r = Mt(S, qt([...t, n], "B")) ?? Mt(S, qt([...t, n], "D")) ?? n;
      return new f().title("Edit " + i).dropdown(r, o, {
        defaultValueIndex: Math.max(0, o.indexOf(a))
      }).show(e);
    }(e, t, d, u, local15);
    if (!n.canceled) {
      const e = n.formValues?.[0];
      if (typeof e == "number" && e >= 0 && e < local15.length) {
        const n = local15[e];
        E([...t, d], n);
      }
    }
    nt(e, t);
    return;
  }
  if (Array.isArray(u)) {
    await tt(e, t, d, u);
    nt(e, t);
    return;
  }
  switch (p) {
    case "object":
      nt(e, [...t, d]);
      break;
    case "boolean":
      E([...t, d], !u);
      nt(e, t);
      break;
    case "string":
      {
        const n = t.join("/");
        if (n === "punishment/specfic" || n === "punishment/defaultPunishment") {
          const n = ["default", "kick", "ban", "freeze", "none"];
          const a = n.indexOf(u);
          const o = a !== -1 ? n[(a + 1) % n.length] : "default";
          E([...t, d], o);
          nt(e, t);
          break;
        }
        await tt(e, t, d, u);
        nt(e, t);
        break;
      }
    case "number":
      await tt(e, t, d, u);
      nt(e, t);
      break;
    default:
      nt(e, t);
  }
}
function at(e) {
  const n = new m().title("Nexus UI").body("Hello, §e" + e.name + "§r§f, thanks for choosing §uNexus Anticheat§r. You can join our support server at §ehttps://discord.gg/CqZGXeRKPJ").button("Chat command help", "textures/items/book_written.png").button("Get ui item", "textures/items/diamond.png").button("Configuration", "textures/ui/gear.png");
  (async function (e, n) {
    while (e.isValid) {
      const a = await n.show(e);
      if (!a.canceled || a.cancelationReason !== "UserBusy") {
        return a;
      }
      await t.waitTicks(5);
    }
    return;
  })(e, n).then(t => {
    if (t && !t.canceled) {
      switch (t.selection) {
        case 0:
          Jt.prop118(e, "nexus.help");
          break;
        case 1:
          zt(e, new i("nexus:ui", 1));
          e.sendMessage(H + "You have been given the ui item. Hold the item and use it to open the same ui again.");
          break;
        case 2:
          nt(e);
      }
    }
  });
}
const ot = new Map();
function it(e, n, a, o, i) {
  const s = [];
  const c = e.dimension.getBlock(n.location);
  if (!c) {
    return;
  }
  const l = c.getComponent(r.Inventory).container;
  const d = n.inventory;
  for (let n = 0; n < l.size; n++) {
    const r = d[n];
    const u = l.getItem(n);
    const local16 = {};
    local16.typeId = u?.typeId;
    local16.amount = u?.amount;
    local16.i = n;
    s.push(local16);
    if (r.typeId == u?.typeId && r.amount == u?.amount) {
      continue;
    }
    const m = (r?.amount ?? 0) - (u?.amount ?? 0);
    if (m !== o.amount - a.amount) {
      continue;
    }
    const f = {};
    const local17 = {};
    local17.typeId = u?.typeId;
    local17.amount = u?.amount;
    const local18 = {
      slot: n,
      beforeItem: r,
      afterItem: local17
    };
    if (a.typeId != o.typeId && a.typeId && o.typeId) {
      f.type = "swap";
    } else {
      f.type = m > 0 ? "took" : "put";
    }
    f.chest = local18;
    f.player = {
      slot: i,
      beforeItem: a,
      afterItem: o,
      name: e.name,
      id: e.id,
      bypass: Dt(e) || undefined
    };
    f.block = {
      typeId: c.typeId,
      location: func218(c.location)
    };
    f.date = Date.now();
    const local19 = {};
    local19.id = ue.containerItem;
    local19.data = f;
    const p = local19;
    t.run(() => {
      p.data.player.ping = e?.getPing() ?? 0;
      Ut(p);
    });
  }
  n.inventory = s;
  ot.set(e.id, n);
}
let rt = 20;
let st = t.currentTick;
let ct = Date.now();
t.runInterval(() => {
  const e = Date.now();
  const n = e - ct;
  if (n <= 0) {
    return;
  }
  const a = Math.min(20, (t.currentTick - st) * 1000 / n);
  rt = rt * 0.5 + a * 0.5;
  st = t.currentTick;
  ct = e;
}, 20);
const lt = e => e !== null && typeof e == "object" && !Array.isArray(e);
function dt(e, t) {
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
      if (!dt(e[n], t[n])) {
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
    if (!(a in t) || !dt(e[a], t[a])) {
      return false;
    }
  }
  return true;
}
function ut(e) {
  const t = {};
  const n = e[0];
  for (const a of Object.keys(n)) {
    if (n[a] === undefined) {
      continue;
    }
    let o = true;
    let i = true;
    let r = lt(n[a]);
    for (let t = 1; t < e.length; t++) {
      const s = e[t];
      if (!(a in s) || s[a] === undefined) {
        o = false;
        break;
      }
      if (i && !dt(n[a], s[a])) {
        i = false;
      }
      if (r && !lt(s[a])) {
        r = false;
      }
    }
    if (o) {
      if (i) {
        t[a] = n[a];
      } else if (r) {
        const n = ut(e.map(e => e[a]));
        if (Object.keys(n).length) {
          t[a] = n;
        }
      }
    }
  }
  return t;
}
function mt(e, t) {
  const n = {};
  for (const a of Object.keys(e)) {
    const o = e[a];
    if (o !== undefined) {
      if (a in t) {
        if (dt(o, t[a])) {
          continue;
        }
        if (lt(o) && lt(t[a])) {
          n[a] = mt(o, t[a]);
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
function ft(e, t, n) {
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
      if (n.some(e => !lt(e))) {
        i[e].push([null, n]);
        continue;
      }
      const t = ut(n);
      i[e].push([t, n.map(e => {
        const n = mt(e, t);
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
  const local20 = {};
  local20.t = t;
  local20.la = n;
  local20.e = i;
  const d = local20;
  if (!l) {
    d.o = c;
  }
  return d;
}
function pt() {
  t.runInterval(() => {
    if (We.length !== 0) {
      if (Ye >= We.length) {
        Ye = 0;
      }
      je = We[Ye];
      Ye++;
    }
    const e = Date.now();
    for (const e of qe.prop114) {
      e();
    }
    const n = (je || (Je(), je = We[Ye], je))?.id;
    const a = t.currentTick % 2 == 0;
    for (const t of We) {
      const o = t.isValid;
      if (!o || Dt(t)) {
        continue;
      }
      const i = {
        prop0: t.dimension,
        prop1: t.isSwimming,
        prop2: e,
        prop3: t.name,
        prop4: t.getVelocity(),
        prop5: t.location,
        prop6: t.id,
        prop7: t.isJumping,
        prop8: t.isOnGround,
        prop9: t.isFalling,
        prop10: t.isGliding,
        prop11: Dt(t),
        prop12: t.commandPermissionLevel,
        prop13: o.isValid,
        prop14: a
      };
      if (i.prop6 !== n) {
        for (const e of qe.prop115) {
          e(t, i);
        }
        continue;
      }
      const r = ot.get(n);
      if (r) {
        const e = t.getComponent(s.CursorInventory).item;
        const n = {
          typeId: e?.typeId,
          amount: e?.amount ?? 0
        };
        const a = r.lastCursor;
        if (e?.typeId || a?.typeId) {
          it(t, r, a, n, "cursor");
        }
        r.lastCursor = n;
        ot.set(t.id, r);
      }
      for (const e of qe.prop116) {
        e(t, i);
      }
      for (const e of qe.prop115) {
        e(t, i);
      }
    }
  }, 3);
}
function func216(e, t) {
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
function ht(e, {
  center: t,
  extent: n
}) {
  const a = Math.max(0, Math.abs(e.x - t.x) - n.x);
  const o = Math.max(0, Math.abs(e.y - t.y) - n.y);
  return a * a + o * o;
}
function gt({
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
const yt = Math.cos(Math.PI * 120 / 180);
const bt = yt * yt;
const vt = Math.cos(Math.PI * 60 / 180);
const wt = vt * vt;
function xt() {
  e.afterEvents.blockContainerOpened.subscribe(e => {
    const {
      openSource: n,
      block: a,
      dimension: o
    } = e;
    const i = Date.now();
    const r = n.entity;
    const l = {
      id: ue.blockContainerOpened,
      data: {
        player: {
          name: r?.name,
          id: r?.id,
          location: func218(r?.location),
          headLoc: func218(r?.getHeadLocation()),
          bypass: Dt(r) || undefined
        },
        block: {
          typeId: a.typeId,
          location: func218(a.location)
        },
        dimension: o.id,
        date: i
      }
    };
    const d = [];
    const u = a.getComponent("minecraft:inventory")?.container;
    for (let e = 0; e < u?.size; e++) {
      const t = u?.getItem(e);
      const local22 = {};
      local22.typeId = t?.typeId;
      local22.amount = t?.amount;
      local22.slot = e;
      d.push(local22);
    }
    const m = r?.getComponent(s.CursorInventory)?.item;
    const f = {
      typeId: m?.typeId,
      amount: m?.amount ?? 0
    };
    const local21 = {};
    local21.inventory = d;
    local21.location = a.location;
    local21.lastCursor = f;
    ot.set(r?.id, local21);
    t.run(() => {
      l.data.player.ping = r instanceof c ? r.getPing() : 0;
      Ut(l);
    });
  });
  e.afterEvents.playerInventoryItemChange.subscribe(e => {
    const {
      player: t,
      beforeItemStack: n,
      itemStack: a,
      inventoryType: o,
      slot: i
    } = e;
    const r = n?.getComponent("durability");
    const s = a?.getComponent("durability");
    const c = Yt.get(t.id);
    let l;
    let d;
    let u = [];
    if (c) {
      d = t.dimension.getBlock(c.location);
    }
    if (we && c?.location && (l = d?.getComponent("minecraft:inventory"), l)) {
      const e = l.container;
      for (let t = 0; t < e.size; t++) {
        const n = e?.getItem(t);
        const local30 = {};
        local30.typeId = n?.typeId;
        local30.amount = n?.amount;
        u.push(local30);
      }
    }
    var m;
    m = t.id;
    be.add(m);
    const local23 = {};
    local23.valid = r?.isValid;
    local23.max = r?.maxDurability;
    local23.current = r?.damage;
    const local24 = {};
    local24.typeId = n?.typeId;
    local24.amount = n?.amount ?? 0;
    local24.durability = local23;
    const local25 = {};
    local25.max = s?.maxDurability;
    local25.current = s?.damage;
    const local26 = {};
    local26.typeId = a?.typeId;
    local26.amount = a?.amount ?? 0;
    local26.durability = local25;
    const local27 = {
      type: o,
      slot: i
    };
    const local28 = {};
    local28.isContainer = l;
    local28.container = u;
    local28.typeId = d?.typeId;
    const f = Dt(t) || t.prop98 && Date.now() < t.prop98;
    const p = {
      id: ue.inventoryChange,
      data: {
        beforeItem: local24,
        item: local26,
        player: {
          name: t.name,
          id: t.id,
          rotation: Rt(t.getRotation()),
          bypass: f || undefined,
          location: func218(t.location)
        },
        inventory: local27,
        openedChest: local28,
        date: Date.now()
      }
    };
    Ut(p);
    const local29 = ot.get(t.id);
    if (local29) {
      it(t, local29, p.data.beforeItem, p.data.item);
    }
    if (!f) {
      for (const i of qe.prop108) {
        i(t, n, a, o, e);
      }
    }
  });
  e.afterEvents.blockContainerClosed.subscribe(e => {
    const {
      closeSource: n,
      block: a,
      dimension: o
    } = e;
    const i = Date.now();
    const r = n.entity;
    const s = {
      id: ue.blockContainerClosed,
      data: {
        player: {
          name: r?.name,
          id: r?.id,
          location: func218(r?.location),
          headLoc: func218(r?.getHeadLocation()),
          bypass: Dt(r) || undefined
        },
        block: {
          typeId: a.typeId,
          location: func218(a.location)
        },
        dimension: o.id
      },
      date: i
    };
    ot.delete(r.id);
    t.run(() => {
      s.data.player.ping = r instanceof c ? r.getPing() : 0;
      Ut(s);
    });
  });
}
t.beforeEvents.startup.subscribe(e => {
  e.itemComponentRegistry.registerCustomComponent("nexus:ui", {
    onUse: e => {
      if (!e.source.prop97) {
        return e.source.sendMessage("§8[§uNexus§8] §cNo permission! (A cute uwu's cat is looking at you >w<)");
      }
      at(e.source);
    }
  });
});
e.afterEvents.worldLoad.subscribe(() => {
  var n;
  Je();
  n = e.getDimension("overworld");
  Ke = n;
  w.prop62();
  if (x.prop69("at")) {
    x.prop67("at");
  } else {
    const e = Date.now();
    x.prop68("at", e);
  }
  (function () {
    const e = P.prop66();
    Object.entries(e).forEach(([e, t]) => {
      const n = e.split("/");
      if (Mt(S, n) === undefined) {
        P.prop68(e);
      } else {
        It(S, n, t);
      }
    });
  })();
  (function () {
    const e = O.prop67("outdated");
    if (e !== undefined && e !== me) {
      O.prop68("outdated", undefined);
    }
  })();
  if (Re()) {
    e.sendMessage(He());
  }
  if (!O.prop67("current")) {
    e.sendMessage(H + "§cTheres no license key set! Set it with §e" + S.prefix + "setToken <key>§c. Get a free key with /token free in our Discord: §u" + L);
    if (!B.prop67("current")) {
      e.sendMessage(H + "§cThe AntiCheat doesnt have a target server. §eChoose one with " + S.prefix + "setServer <NA|EU|AS>§e.");
    }
  }
  for (const e of We) {
    if (N.prop67(e.id)) {
      e.prop97 = true;
    }
    for (const t of qe.prop101) {
      t(e);
    }
  }
  pt();
  for (const e of qe.prop117) {
    e();
  }
  t.runInterval(async () => {
    const e = z.prop67("current");
    if (e || e == null) {
      Ve();
    }
  }, 200);
  t.runInterval(() => {
    if (!xe) {
      Ze();
      return;
    }
    if (Xe.length === 0) {
      return;
    }
    const e = [[]];
    let n = 0;
    let a = 0;
    for (const t of Xe) {
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
      t.runTimeout(() => {
        if (Be.isOpen) {
          Be.send(JSON.stringify(ft(a, Math.round(rt * 10) / 10, Date.now())));
        }
      }, n);
    }
    Ze();
  }, 5);
  t.runInterval(() => {
    const local31 = {};
    local31.d = {};
    if (xe) {
      Xe.push(local31);
    }
  }, 100);
  e.afterEvents.entityRemove.subscribe(e => {
    Qe.delete(e.removedEntityId);
  });
  e.beforeEvents.entityHurt.subscribe(e => {
    const {
      damageSource: n,
      hurtEntity: a
    } = e;
    const o = n.damagingEntity;
    if (a instanceof c) {
      S.toggle.timeline;
      if (S.customDamageCompatibilityFix && n.cause === "none") {
        const t = Qe.get(a.id);
        if (t && Date.now() - t < 150) {
          e.cancel = true;
          return;
        }
      }
      for (const e of qe.prop100) {
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
    if (!(o instanceof c)) {
      return;
    }
    if (Dt(o)) {
      return;
    }
    const i = a.getAABB();
    const r = o.getHeadLocation();
    const s = {
      prop3: o.name,
      prop15: a.typeId,
      prop16: Kt(o.getRotation(), 4),
      prop17: Kt(o.getViewDirection(), 4),
      prop6: o.id,
      prop18: Kt(a.getVelocity(), 4),
      prop19: a.id,
      prop2: Date.now(),
      prop20: i,
      prop21: r,
      prop22: Kt(ht(r, i), 4),
      prop23: Kt(o.getVelocity(), 4)
    };
    const l = r.y;
    let d;
    let u;
    let m;
    if (l >= -64 && l <= 320) {
      const local36 = {
        maxDistance: 7
      };
      const e = o?.getBlockFromViewDirection(local36);
      d = e?.block;
      u = d?.below();
      m = d?.above();
    }
    const local32 = {
      maxDistance: 7
    };
    const local33 = {};
    local33.isAir = u?.isAir;
    local33.isLiquid = u?.isLiquid;
    const local34 = {};
    local34.isAir = m?.isAir;
    local34.isLiquid = m?.isLiquid;
    const local35 = {};
    local35.faceLocation = blockFromView?.faceLocation;
    local35.face = blockFromView?.face;
    local35.typeId = d?.typeId;
    local35.location = d?.location;
    local35.below = local33;
    local35.above = local34;
    const f = {
      id: ue.hurtEntity,
      data: {
        player: {
          name: s.prop3,
          id: s.prop6,
          viewDir: func218(s.prop17),
          headLoc: func218(r),
          velocity: func218(s.prop23),
          rot: Rt(s.prop16),
          gamemode: o.prop34,
          hasSpear: Lt(Bt(o)?.typeId) || undefined,
          hasCrosshair: Vt(o),
          isLookingAtTheTarget: o.getEntitiesFromViewDirection(local32)[0]?.entity?.id != a.id || undefined,
          bypass: Dt(o) || undefined,
          viewBlock: local35
        },
        target: {
          typeId: s.prop15,
          AABB: Ht(s.prop20),
          id: s.prop19,
          velocity: func218(s.prop18)
        },
        date: Date.now()
      }
    };
    t.run(() => {
      f.data.player.ping = o?.getPing() ?? 0;
      f.data.target.ping = a instanceof c ? a.getPing() : 0;
      Ut(f);
    });
    for (const t of qe.prop99) {
      t(o, a, e, s);
    }
    if (S.customDamageCompatibilityFix && e.cancel) {
      Qe.set(s.prop19, s.prop2);
    }
  });
  e.afterEvents.entityHitEntity.subscribe(e => {
    const t = e.damagingEntity;
    const n = e.hitEntity;
    if (!(t instanceof c)) {
      return;
    }
    if (Dt(t)) {
      return;
    }
    const a = Date.now();
    const local37 = {
      id: n.id
    };
    jt({
      id: ue.hitEntity,
      data: {
        target: local37,
        player: {
          name: t.name,
          id: t.id,
          bypass: Dt(t) || undefined
        },
        date: a
      }
    }, t);
    const local38 = {
      prop6: t.id,
      prop2: a,
      prop19: n.id
    };
    const o = local38;
    for (const e of qe.prop107) {
      e(t, n, o);
    }
  });
  e.beforeEvents.chatSend.subscribe(e => {
    const {
      sender: t,
      message: n
    } = e;
    jt({
      id: ue.chatSend,
      data: {
        message: n,
        player: {
          name: t.name,
          id: t.id,
          bypass: Dt(t) || undefined
        },
        date: Date.now()
      }
    }, t);
  });
  e.afterEvents.playerJoin.subscribe(t => {
    const {
      playerId: n,
      playerName: a
    } = t;
    const o = e.getEntity(n);
    Ut({
      id: ue.playerJoin,
      data: {
        player: {
          name: a,
          id: n,
          bypass: Dt(o) || undefined
        }
      },
      date: Date.now()
    });
  });
  e.afterEvents.playerSpawn.subscribe(({
    player: e,
    initialSpawn: n
  }) => {
    if (!n) {
      return;
    }
    if (Re()) {
      e.sendMessage(He());
    }
    const a = Date.now();
    Ge.set(e.id, []);
    if (S.toggle.timeline) {
      Ue(a, e.id, ne.prop82);
    }
    try {
      if (S.log.onJoin) {
        oe(a, e.name, te.prop82);
      }
    } catch {}
    e.prop34 = e.getGameMode();
    Je();
    if (N.prop67(e.id)) {
      e.prop97 = true;
    } else if (we) {
      Me(e);
      Q(e);
    } else if (!G(e)) {
      Q(e);
    }
    const o = [];
    const i = e.getComponent("minecraft:inventory")?.container;
    for (let e = 0; e < i?.size; e++) {
      const t = i?.getItem(e);
      const local39 = {};
      local39.typeId = t?.typeId;
      local39.amount = t?.amount;
      local39.slot = e;
      o.push(local39);
    }
    const r = {
      id: ue.playerSpawn,
      data: {
        player: {
          name: e.name,
          id: e.id,
          dbName: Wt.prop67(e.id),
          canBypass: Dt(e),
          container: o
        }
      },
      date: a
    };
    Wt.prop68(e.id, Gt(r.data.player.name));
    t.run(() => {
      if (e.isValid) {
        try {
          r.data.player.ping = e.getPing();
        } catch {}
      }
      Ut(r);
      if (e.isValid) {
        Ae(e, "join");
      }
    });
    const s = B.prop67("current");
    if (!O.prop67("current")) {
      e.sendMessage(H + "§cTheres no license key set! Set it with §e" + S.prefix + "setToken <key>§c. Get a free key with /token free in our Discord: §u" + L);
      if (s) {
        return undefined;
      } else {
        e.sendMessage(H + "§cThe AntiCheat doesnt have a target server. §eChoose one with " + S.prefix + "setServer <NA|EU|AS>§e.");
        return;
      }
    }
    for (const t of qe.prop101) {
      t(e);
    }
    if (!Dt(e)) {
      for (const t of qe.prop102) {
        t(e);
      }
    }
  });
  e.beforeEvents.playerLeave.subscribe(e => {
    const n = e.player;
    let a = null;
    try {
      a = he(n);
    } catch {}
    const local40 = {};
    local40.name = n.name;
    local40.id = n.id;
    const o = local40;
    let i;
    let r;
    let s;
    if (a) {
      t.run(() => Ae(o, "leave", a));
    }
    try {
      const e = n.getRotation();
      const local41 = {};
      local41.x = n.location.x;
      local41.y = n.location.y;
      local41.z = n.location.z;
      const local42 = {
        x: e.x,
        y: e.y
      };
      i = local41;
      r = local42;
      s = n.dimension?.id;
    } catch {}
    Ut({
      id: ue.playerLeave,
      data: {
        player: {
          name: n.name,
          id: n.id,
          location: i,
          rotation: r,
          dimension: s,
          bypass: Dt(n) || undefined
        }
      },
      date: Date.now()
    });
  });
  e.afterEvents.playerLeave.subscribe(({
    playerId: e,
    playerName: t
  }) => {
    Ge.delete(e);
    if (S.log.onLeave) {
      oe(Date.now(), t, te.prop83);
    }
    Je();
    for (const t of qe.prop96) {
      t(e);
    }
  });
  e.beforeEvents.playerPlaceBlock.subscribe(e => {
    const {
      block: t,
      player: n
    } = e;
    const a = t.location;
    const o = n.location;
    const i = {
      prop24: Kt(a, 4),
      prop3: n?.name,
      prop2: Date.now(),
      prop6: n.id,
      prop25: Kt(o, 4),
      prop26: Kt(n.getHeadLocation(), 4),
      prop27: Kt(n.getVelocity(), 4),
      prop28: Kt(n.getViewDirection(), 4),
      prop29: Number(func216(o, a).toFixed(4)),
      prop30: t.typeId,
      prop31: t.isSolid,
      prop32: t.hasComponent("minecraft:inventory")
    };
    const r = Dt(n);
    const s = t.below();
    jt({
      id: ue.playerPlaceBlock,
      data: {
        player: {
          id: i.prop6,
          location: func218(o),
          name: i.prop3,
          headLoc: func218(i.prop26),
          viewDir: func218(i.prop28),
          velocity: func218(i.prop27),
          rotation: Rt(n.getRotation()),
          bypass: r || undefined,
          gamemode: n.prop34,
          isFlying: n.isFlying || undefined,
          hasCrosshair: Vt(n),
          isInWater: n.isInWater || undefined,
          isJumping: n.isJumping || undefined
        },
        block: {
          location: func218(a),
          typeId: i.prop30,
          isSolid: i.prop31,
          isContainer: i.prop32,
          below: s ? {
            location: func218(s.location),
            typeId: s.typeId,
            isLiquid: s.isLiquid,
            isAir: s.isAir
          } : undefined,
          center: func218(t.center())
        },
        eventCanceled: e.cancel,
        face: e.face,
        faceLocation: func218(e.faceLocation),
        distance: i.prop29,
        date: i.prop2
      }
    }, n);
    for (const a of qe.prop104) {
      a(n, t, e, i);
    }
    if (!r) {
      for (const a of qe.prop103) {
        a(n, t, e, i);
      }
    }
  });
  e.beforeEvents.playerBreakBlock.subscribe(e => {
    const {
      block: t,
      player: n
    } = e;
    const a = t.location;
    const o = n.location;
    const i = {
      prop24: Kt(a, 4),
      prop3: n?.name,
      prop2: Date.now(),
      prop6: n.id,
      prop25: Kt(o, 4),
      prop26: Kt(n.getHeadLocation(), 4),
      prop27: Kt(n.getVelocity(), 4),
      prop28: Kt(n.getViewDirection(), 4),
      prop29: Number(func216(o, a).toFixed(4)),
      prop30: t.typeId,
      prop31: t.isSolid,
      prop32: t.hasComponent("minecraft:inventory")
    };
    const r = Dt(n);
    jt({
      id: ue.playerBreakBlock,
      data: {
        player: {
          id: i.prop6,
          location: func218(i.prop25),
          name: i.prop3,
          headLoc: func218(i.prop26),
          viewDir: func218(i.prop28),
          velocity: func218(i.prop27),
          bypass: r || undefined
        },
        block: {
          location: func218(i.prop24),
          typeId: i.prop30,
          isSolid: i.prop31,
          isContainer: i.prop32
        },
        date: i.prop2
      }
    }, n);
    for (const a of qe.prop106) {
      a(n, t, e, i);
    }
    if (!Dt(n)) {
      for (const a of qe.prop105) {
        a(n, t, e, i);
      }
    }
  });
  e.beforeEvents.playerInteractWithBlock.subscribe(e => {
    const {
      block: t,
      player: n
    } = e;
    const a = t.location;
    const o = n.location;
    const i = t.above();
    const r = {
      prop24: Kt(a, 4),
      prop3: n?.name,
      prop2: Date.now(),
      prop6: n.id,
      prop25: Kt(o, 4),
      prop26: Kt(n.getHeadLocation(), 4),
      prop27: Kt(n.getVelocity(), 4),
      prop28: Kt(n.getViewDirection(), 4),
      prop29: Number(func216(o, a).toFixed(4)),
      prop30: t.typeId,
      prop31: t.isSolid,
      prop32: t.hasComponent("minecraft:inventory"),
      prop33: i,
      prop34: n.prop34
    };
    const s = [];
    if (r.prop32) {
      const e = t?.getComponent("minecraft:inventory")?.container;
      for (let t = 0; t < e?.size; t++) {
        const n = e?.getItem(t);
        const local43 = {};
        local43.typeId = n?.typeId;
        local43.amount = n?.amount;
        const local44 = {
          item: local43,
          slot: t
        };
        s.push(local44);
      }
    }
    const c = Dt(n);
    jt({
      id: ue.playerInteractWithBlock,
      data: {
        player: {
          id: r.prop6,
          location: func218(o),
          name: r.prop3,
          headLoc: func218(r.prop26),
          viewDir: func218(r.prop28),
          velocity: func218(r.prop27),
          bypass: c || undefined,
          rotation: Rt(n.getRotation()),
          gamemode: r.prop34
        },
        block: {
          location: func218(a),
          typeId: r.prop30,
          isSolid: r.prop31,
          isContainer: r.prop32,
          container: s,
          above: i ? {
            isAir: i.isAir,
            typeId: i.typeId
          } : undefined
        },
        distance: r.prop29,
        date: r.prop2
      }
    }, n);
    for (const a of qe.prop112) {
      a(n, t, e);
    }
    if (!Dt(n)) {
      for (const a of qe.prop110) {
        a(n, t, e, r);
      }
    }
  });
  e.beforeEvents.playerInteractWithEntity.subscribe(e => {
    const {
      player: t,
      target: n
    } = e;
    const a = Date.now();
    for (const a of qe.prop113) {
      a(t, n, e);
    }
    const o = {
      prop23: Kt(t.getVelocity(), 4),
      prop25: Kt(t.location, 4),
      prop6: t.id,
      prop3: t.name,
      prop19: n.id,
      prop18: Kt(n.getVelocity(), 4),
      prop26: Kt(t.getHeadLocation(), 4),
      prop35: Kt(n.location, 4),
      prop36: n.getAABB(),
      prop28: Kt(t.getViewDirection(), 4),
      prop2: a,
      prop37: n.hasComponent(s.Inventory),
      prop34: t.prop34
    };
    const i = Dt(t);
    jt({
      id: ue.entityInteract,
      data: {
        player: {
          location: func218(o.prop25),
          name: o.prop3,
          velocity: func218(o.prop23),
          id: o.prop6,
          headLoc: func218(o.prop26),
          viewDir: func218(o.prop28),
          bypass: Dt(t) || undefined,
          hasCrosshair: Vt(t),
          gamemode: o.prop34
        },
        target: {
          id: o.prop19,
          location: func218(o.prop35),
          AABB: Ht(o.prop36),
          velocity: func218(o.prop18),
          hasContainer: o.prop37
        },
        date: a
      }
    }, t);
    if (!i) {
      for (const a of qe.prop111) {
        a(t, n, e, o);
      }
    }
  });
  e.afterEvents.entityContainerOpened.subscribe(e => {
    const {
      openSource: t,
      entity: n
    } = e;
    const a = Date.now();
    const o = t.entity;
    jt({
      id: ue.entityContainerOpened,
      data: {
        player: {
          name: o?.name,
          id: o?.id,
          location: func218(o?.location),
          headLoc: func218(o?.getHeadLocation()),
          bypass: Dt(o) || undefined
        },
        entity: {
          typeId: n.typeId,
          location: func218(n.location)
        },
        date: a
      }
    }, o);
  });
  e.afterEvents.entityContainerClosed.subscribe(e => {
    const {
      closeSource: t,
      entity: n
    } = e;
    const a = Date.now();
    const o = t.entity;
    jt({
      id: ue.entityContainerOpened,
      data: {
        player: {
          name: o?.name,
          id: o?.id,
          location: func218(o?.location),
          headLoc: func218(o?.getHeadLocation()),
          bypass: Dt(o) || undefined
        },
        entity: {
          typeId: n.typeId,
          location: func218(n.location)
        },
        date: a
      }
    }, o);
  });
  xt();
  e.afterEvents.entityItemDrop.subscribe(e => {
    const {
      entity: t,
      items: n
    } = e;
    if (!(t instanceof c)) {
      return;
    }
    if (Dt(t)) {
      return;
    }
    const a = [];
    for (let e = 0; e < n.length; e++) {
      const t = n[e].getComponent("minecraft:item")?.itemStack.clone();
      const o = t?.getComponent("minecraft:durability");
      const local45 = {};
      local45.hasDurability = o?.isValid;
      local45.damage = o?.damage;
      local45.maxDurability = o?.maxDurability;
      const local46 = {};
      local46.typeId = t?.typeId;
      local46.amount = t?.amount;
      local46.durability = local45;
      a.push(local46);
    }
    jt({
      id: ue.itemDrop,
      data: {
        itemList: a,
        player: {
          name: t.name,
          id: t.id,
          bypass: Dt(t) || undefined
        }
      },
      date: Date.now()
    }, t);
    const o = n.map(e => e.getComponent("item")?.itemStack).filter(e => !!e);
    const i = {};
    for (const e of qe.prop109) {
      e(t, o, i);
    }
  });
  e.afterEvents.itemStartUseOn.subscribe(e => {
    const {
      source: t,
      itemStack: n,
      block: a
    } = e;
    const o = Date.now();
    const local47 = {};
    local47.typeId = n?.typeId;
    const local48 = {};
    local48.typeId = a.typeId;
    jt({
      id: ue.itemStartUseOn,
      data: {
        player: {
          name: t?.name,
          id: t?.id,
          location: func218(t?.location),
          headLoc: func218(t?.getHeadLocation()),
          bypass: Dt(t) || undefined,
          hasCrosshair: Vt(t)
        },
        item: local47,
        block: local48
      },
      date: o
    }, t);
  });
  e.afterEvents.itemStopUseOn.subscribe(e => {
    const {
      source: t,
      block: n
    } = e;
    const a = Date.now();
    jt({
      id: ue.itemStopUseOn,
      data: {
        player: {
          name: t?.name,
          id: t?.id,
          location: func218(t?.location),
          headLoc: func218(t?.getHeadLocation()),
          bypass: Dt(t) || undefined,
          hasCrosshair: Vt(t)
        },
        block: {
          typeId: n.typeId,
          location: func218(n.location)
        }
      },
      date: a
    }, t);
  });
  e.beforeEvents.itemUse.subscribe(e => {
    const {
      source: t,
      itemStack: n
    } = e;
    const a = Date.now();
    const local49 = {};
    local49.typeId = n.typeId;
    local49.amount = n.amount;
    jt({
      id: ue.itemUse,
      data: {
        player: {
          name: t?.name,
          id: t?.id,
          location: func218(t?.location),
          headLoc: func218(t?.getHeadLocation()),
          bypass: Dt(t) || undefined,
          hasCrosshair: Vt(t)
        },
        item: local49
      },
      date: a
    }, t);
  });
});
e.afterEvents.playerGameModeChange.subscribe(({
  player: e,
  toGameMode: t
}) => {
  e.prop34 = t;
});
t.run(() => {
  for (const t of e.getPlayers()) {
    t.prop34 = t.getGameMode();
  }
});
const local217 = {
  i: "id"
};
local217.d = "data";
local217.p = "player";
local217.n = "name";
local217.l = "location";
local217.j = "isJumping";
local217.f = "isFalling";
local217.s = "isSwimming";
local217.g = "isOnGround";
local217.v = "velocity";
local217.di = "dimension";
local217.b = "bypass";
local217.iv = "isValid";
local217.cp = "commandPermissionLevel";
local217.pi = "ping";
local217.is = "isSecondTick";
local217.da = "date";
local217.t = "target";
local217.ti = "typeId";
local217.a = "AABB";
local217.vd = "viewDir";
local217.hl = "headLoc";
local217.r = "rotation";
local217.gm = "gamemode";
local217.hc = "hasCrosshair";
local217.lt = "isLookingAtTheTarget";
local217.hs = "hasSpear";
local217.db = "dbName";
local217.cb = "canBypass";
local217.c = "container";
local217.am = "amount";
local217.sl = "slot";
local217.bo = "block";
local217.bl = "below";
local217.ab = "above";
local217.so = "isSolid";
local217.ic = "isContainer";
local217.ce = "center";
local217.ec = "eventCanceled";
local217.fa = "face";
local217.fl = "faceLocation";
local217.ds = "distance";
local217.li = "isLiquid";
local217.ia = "isAir";
local217.if = "isFlying";
local217.iw = "isInWater";
local217.il = "itemList";
local217.du = "durability";
local217.hd = "hasDurability";
local217.dm = "damage";
local217.md = "maxDurability";
local217.bi = "beforeItem";
local217.ai = "afterItem";
local217.ch = "chest";
local217.ty = "type";
local217.it = "inventory";
local217.os = "openedChest";
local217.en = "entity";
local217.hv = "hasContainer";
local217.me = "message";
local217.la = "latency";
local217.ed = "ended";
local217.d2 = "distance2dSq";
local217.im = "item";
local217.va = "valid";
local217.ma = "max";
local217.cu = "current";
local217.vb = "viewBlock";
const kt = local217;
const Ct = Object.create(null);
for (const [e, t] of Object.entries(kt)) {
  Ct[t] = e;
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
    t[Ct[n] ?? n] = At(e[n]);
  }
  return t;
}
function Dt(e) {
  return !!e.prop97 || !!e.prop119;
}
function Tt(e, t = true) {
  if (t) {
    e.prop97 = true;
    N.prop68(e.id, e.name);
  } else {
    delete e.prop97;
    N.prop68(e.id);
  }
}
function St(e) {
  return e.commandPermissionLevel > 0;
}
function Mt(e, t) {
  return t.reduce((e, t) => e != null ? e[t] : undefined, e);
}
function It(e, t, n) {
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
function Et(e, t = "") {
  try {
    Ke.runCommand("kick \"" + e.name.replaceAll("\"", "\\\"") + "\" " + t);
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
function Pt(t, n, a = undefined) {
  const {
    target: o,
    tag: i
  } = n;
  switch (o) {
    case "exclude":
      if (a) {
        Nt(e.getPlayers({
          excludeNames: [a.name]
        }), t);
      } else {
        e.sendMessage(t);
      }
      break;
    case "tag-and-admin":
    case "tag-and-op":
    case "tag":
      {
        const local50 = {
          tags: [i]
        };
        const n = e.getPlayers(local50);
        const local51 = {
          excludeTags: [i]
        };
        const local52 = {
          excludeTags: [i]
        };
        if (o === "tag-and-admin") {
          n.push(...e.getPlayers(local51).filter(e => e.prop97));
        } else {
          n.push(...e.getPlayers(local52).filter(e => St(e)));
        }
        Nt(n, t);
        break;
      }
    case "op":
      Nt(e.getAllPlayers().filter(e => St(e)), t);
    case "admin":
      Nt(e.getAllPlayers().filter(e => e.prop97), t);
      break;
    default:
      e.sendMessage(t);
  }
}
function Nt(e, t) {
  new Set(e).forEach(e => e.sendMessage(t));
}
function Ot(e) {
  if (!e) {
    return "Permanent";
  }
  const local53 = {};
  local53.prop38 = "century";
  local53.prop39 = 3155760000000;
  const local54 = {};
  local54.prop38 = "year";
  local54.prop39 = 31557600000;
  const local55 = {};
  local55.prop38 = "month";
  local55.prop39 = 2630016000;
  const local56 = {};
  local56.prop38 = "day";
  local56.prop39 = 86400000;
  const local57 = {};
  local57.prop38 = "hour";
  local57.prop39 = 3600000;
  const local58 = {};
  local58.prop38 = "minute";
  local58.prop39 = 60000;
  const local59 = {};
  local59.prop38 = "second";
  local59.prop39 = 1000;
  const t = [local53, local54, local55, local56, local57, local58, local59];
  let n = [];
  let a = e;
  for (const {
    prop38: e,
    prop39: o
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
function Bt(e) {
  return e.getComponent("equippable")?.getEquipment(a.Mainhand);
}
function zt(e, t) {
  e.getComponent("inventory")?.container?.addItem(t);
}
function Lt(e = "") {
  return e.startsWith("minecraft:") && e.endsWith("_spear");
}
function func218(e, t = 4) {
  if (e) {
    return [Number(e.x.toFixed(t)), Number(e.y.toFixed(t)), Number(e.z.toFixed(t))];
  }
}
function Rt(e, t = 4) {
  if (e) {
    return [Number(e.x.toFixed(t)), Number(e.y.toFixed(t))];
  }
}
function Ht(e, t = 4) {
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
function Ft(e, t) {
  return e.x === t.x && e.y === t.y && e.z === t.z;
}
function Vt(e) {
  const t = e.inputInfo;
  return t.lastInputModeUsed != "Touch" || t.touchOnlyAffectsHotbar;
}
function qt(e, t) {
  if (e.length === 0) {
    return [...e];
  }
  const n = [...e];
  const a = n.length - 1;
  n[a] = n[a] + "$" + t;
  return n;
}
function Kt(e, t) {
  for (let n in e) {
    if (typeof e[n] == "number") {
      e[n] = Number(e[n].toFixed(t));
    }
  }
  return e;
}
function Gt(e) {
  return e.replace(/\([0-9]+\)$/, "");
}
function Ut(e) {
  Xe.push(At(e));
}
function jt(e, n) {
  t.run(() => {
    if (e.data?.player) {
      e.data.player.ping = n instanceof c ? n.getPing() : 0;
    }
    Ut(e);
  });
}
const Wt = new w("antiNamespoofNameData");
const Yt = new Map();
const local219 = {};
local219.prop44 = "Test command";
local219.prop43 = "";
local219.prop45 = "General";
class Jt {
  static prop120 = [];
  static prop118(n, a) {
    const o = S.prefix;
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
      const local60 = {};
      local60.NORMAL = "NORMAL";
      local60.IN_QUOTE = "IN_QUOTE";
      const a = local60;
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
      n.sendMessage(H + R + "Syntax Error: Unclosed quotation mark is not supported.");
      return true;
    }
    if (i.length === 0) {
      n.sendMessage(H + R + "Syntax Error: Empty command can't be handled correctly.");
      return true;
    }
    const r = Jt.prop120;
    const s = i.shift();
    const c = String(s).toLowerCase();
    const l = r.find(({
      prop3: e,
      prop40: t
    }) => e.toLowerCase() === c || t && t.some(e => e.toLowerCase() === c));
    if (!l) {
      n.sendMessage(H + R + "Unknown command: " + s + "§c, use " + F + o + "help §cto get the command that is available.");
      return true;
    }
    if (l.prop41 && !n.prop97) {
      n.sendMessage(H + R + "You don't have permission to use that command.");
      return true;
    }
    const d = l.prop121;
    if (i.length > d.length) {
      n.sendMessage(H + R + "Too many parameters provided. Expected at most " + d.length + ", but received " + i.length + ".");
      return true;
    }
    for (let t = 0; t < d.length; t++) {
      const a = d[t];
      const o = i[t];
      if (o === undefined) {
        if (a.prop47) {
          break;
        }
        n.sendMessage(H + R + "Missing parameter: " + a.prop6);
        return true;
      }
      switch (a.prop46) {
        case "int":
        case "float":
          {
            const e = Number(o);
            if (isNaN(e)) {
              n.sendMessage(H + R + "You must enter a number for parameter: " + a.prop6);
              return true;
            }
            if (a.prop46 === "int" && e % 1 == 0) {
              n.sendMessage(H + R + "You must enter an interger for parameter: " + a.prop6);
              return true;
            }
            if (a.prop122?.[0] && e < a.prop122[0] || a.prop122?.[1] && e < a.prop122[1]) {
              n.sendMessage(H + R + "Your string is too long for parameter: " + a.prop6 + ". Range accepted: " + ((a.prop122[0] ?? "x") + "-" + (a.prop122[1] ?? "x")));
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
              n.sendMessage(H + R + "You must enter §gtrue §cor §gfalse§c for parameter: " + a.prop6);
              return true;
          }
          break;
        case "player":
        case "op":
        case "non-op":
          {
            const r = o.replace(/^@/, "");
            const s = e.getPlayers({
              name: r
            })[0];
            if (!s) {
              n.sendMessage(H + R + "Unknown player: " + r);
              return true;
            }
            if (a.prop46 === "op" && !s.prop97 && !St(n)) {
              n.sendMessage(H + R + "An operator is required in paramter: " + a.prop6);
              return true;
            }
            if (a.prop46 === "non-op" && s.prop97) {
              n.sendMessage(H + R + "You can't target an admin.");
              return true;
            }
            if (!a.prop48 && s.id === n.id) {
              n.sendMessage(H + R + "You can't target yourself.");
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
            if (a.prop46 === "name") {
              i[t] = r;
              break;
            }
            const local61 = {
              name: r
            };
            const s = e.getPlayers(local61)[0];
            if (s) {
              const e = s.prop97;
              if (a.prop46 === "opName") {
                if (!e) {
                  n.sendMessage(H + R + "An operator is required in paramter: " + a.prop6);
                  return true;
                }
              } else {
                if (e) {
                  n.sendMessage(H + R + "You can't target an admin.");
                  return true;
                }
                i[t] = s;
              }
            } else {
              const e = Object.values(N.prop66()).find(e => e === r);
              if (a.prop46 === "opName") {
                if (!e) {
                  n.sendMessage(H + R + "An operator is required in paramter: " + a.prop6);
                  return true;
                }
              } else {
                if (e) {
                  n.sendMessage(H + R + "You can't target an admin.");
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
              n.sendMessage("Invalid duration format in parameter: " + a.prop6 + ", correct format: <integer><ms/s/m/h/d/w/mm/y/c>[integer][unit]...");
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
              n.sendMessage(H + R + "Unexpected duration parsing error.");
              return true;
            }
            i[t] = e;
          }
        default:
          {
            const e = o.length;
            if (a.prop122?.[0] && e < a.prop122[0] || a.prop122?.[1] && e < a.prop122[1]) {
              n.sendMessage(H + R + "Your string is too long for parameter: " + a.prop6 + ". Range accepted: " + ((a.prop122[0] ?? "x") + "-" + (a.prop122[1] ?? "x")));
              return true;
            }
          }
      }
    }
    t.run(() => {
      try {
        const e = l.prop123(n, i);
        if (typeof e == "string") {
          n.sendMessage(e);
        }
      } catch (e) {
        console.error(e);
        n.sendMessage(H + R + "An error occurred while executing the command.");
      }
    });
    return true;
  }
  prop3 = "";
  prop40 = [];
  constructor() {
    Jt.prop120.push(this);
  }
  prop121 = [];
  prop41 = false;
  prop123(e, t) {}
  prop42 = local219;
}
e.beforeEvents.chatSend.subscribe(e => {
  const n = e.sender;
  const a = t.currentTick;
  if (n.prop124 && a - n.prop124 <= 4) {
    e.cancel = true;
    return;
  }
  const o = e.message;
  n.prop124 = a;
  if ((!S.toggle.misc.ghostMode || St(n)) && Jt.prop118(n, o)) {
    e.cancel = true;
  }
});
const Xt = ["Information", "Setup", "Moderation", "Utility"];
function Zt(e, t = 60) {
  const n = "§e" + e + "§r";
  const a = t - e.length;
  const o = Math.floor(a / 2);
  const i = a - o;
  return "§8" + "=".repeat(o) + " " + n + " §8" + "=".repeat(i);
}
const local220 = {};
local220.prop44 = "Show all available commands.";
local220.prop43 = "";
local220.prop45 = "information";
new class extends Jt {
  prop3 = "help";
  prop40 = ["commandlist"];
  prop42 = local220;
  prop41 = false;
  prop123(e) {
    const t = e.prop97;
    const n = Jt.prop120.filter(({
      prop41: e
    }) => !e || t);
    if (n.length === 0) {
      return H + R + "No command is available for you.";
    }
    const a = S.prefix;
    const o = ["§8[§uNexus§8] §eAvailable commands§8:", "§8<§cRequired parameter§8> §8[§aOptional parameter§8]"];
    const i = n.reduce((e, t) => {
      const n = t.prop42.prop45.toLowerCase();
      e[n] ||= [];
      e[n].push(t);
      return e;
    }, {});
    for (const e of Xt) {
      const t = i[e.toLowerCase()];
      if (t) {
        o.push(Zt(e));
        for (const {
          prop3: e,
          prop42: {
            prop43: n,
            prop44: i
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
new class extends Jt {
  prop3 = "oplist";
  prop41 = true;
  prop42 = {
    prop44: "List all nexus admins.",
    prop43: "",
    prop45: "information"
  };
  prop123() {
    const e = Object.entries(N.prop66());
    if (e.length === 0) {
      return H + "There are no nexus admins.";
    }
    const t = [H + "Nexus Admins:"];
    for (const [n, a] of e) {
      t.push("§l§8>> §r§g" + a + "§r §8(§fid: " + n + "§8)");
    }
    return t.join("\n");
  }
}();
new class extends Jt {
  prop3 = "banlist";
  prop42 = {
    prop44: "Show a list of banned players.",
    prop43: "",
    prop45: "information"
  };
  prop41 = true;
  prop123(e) {
    const t = Object.values(V.prop66()).map(({
      name: e
    }) => e).concat(Object.keys(q.prop66()));
    if (t.length === 0) {
      return H + "No one is banned.";
    } else {
      return H + "Banned players:" + t.map(e => e.includes(" ") ? "§r\"" + e + "§r\"" : "§r" + e + "§r").reverse().join(", ");
    }
  }
}();
new class extends Jt {
  prop3 = "freezelist";
  prop42 = {
    prop44: "Show a list of frozen players.",
    prop43: "",
    prop45: "information"
  };
  prop41 = true;
  prop123(e) {
    const t = Object.values(J.prop66()).map(({
      name: e
    }) => e);
    if (t.length === 0) {
      return H + "No one is frozen.";
    } else {
      return H + "Frozen players:" + t.map(e => e.includes(" ") ? "§r\"" + e + "§r\"" : "§r" + e + "§r").reverse().join(", ");
    }
  }
}();
const local221 = {};
local221.prop125 = "Nexus AntiCheat";
local221.prop126 = "Nexus V2 A2.0.0";
local221.prop127 = De ? Be?.isOpen ? "§aConnected" : "§cDisconnected" : "§cNot supported";
local221.prop128 = "discord.gg/CqZGXeRKPJ";
local221.prop129 = "jasonlaubb (dc: @uwn_the_great) & Dr. Hex (dc: @_dr_hex_)";
const Qt = local221;
const local222 = {};
local222.prop44 = "Show information about Nexus Anticheat.";
local222.prop43 = "";
local222.prop45 = "information";
new class extends Jt {
  prop3 = "info";
  prop40 = ["download", "about", "acinfo", "status"];
  prop42 = local222;
  prop41 = false;
  prop123(e) {
    Qt.prop127 = De ? Be?.isOpen ? "§aConnected" : "§cDisconnected" : "§cNot supported";
    return H + local195 + "Product information:§r\n§fProduct Name §l§8:§r §7" + Qt.prop125 + "\n§fVersion §l§8:§r §7" + Qt.prop126 + "\n§fCloud Service §l§8:§r §7" + Qt.prop127 + "\n§fDiscord Link §l§8:§r §7" + Qt.prop128 + "\n§fOwner(s) §l§8:§r §7" + Qt.prop129;
  }
}();
new class extends Jt {
  prop3 = "password";
  prop41 = true;
  prop42 = {
    prop44: "Set or change the admin password. If you set a password, only those who know the password can use admin commands.",
    prop43: "<set|remove|forget> [new password|current password] [confirm password] [previous password]",
    prop45: "setup"
  };
  prop121 = [{
    prop6: "action",
    prop46: "any"
  }, {
    prop6: "newPassword",
    prop46: "any",
    prop47: true
  }, {
    prop6: "confirmPassword",
    prop46: "any",
    prop47: true
  }, {
    prop6: "previousPassword",
    prop46: "any",
    prop47: true
  }];
  prop123(e, t) {
    const [n, a, o, r] = t;
    const s = x.prop67("adminPassword");
    switch (n) {
      case "set":
        if (a && a !== o) {
          return H + R + "New password and confirm password do not match.";
        } else if (a) {
          if (o) {
            if (s && !r) {
              return H + R + "You must provide the previous password to change it.";
            } else if (s && r !== s) {
              return H + R + "The provided previous password is incorrect.";
            } else if (a.length < 8) {
              return H + R + "The new password must be at least 8 characters long to ensure security.";
            } else {
              x.prop68("adminPassword", a);
              if (s) {
                return H + "Admin password has been changed successfully.";
              } else {
                return H + "Admin password has been set successfully.";
              }
            }
          } else {
            return H + R + "You must confirm the new password to prevent typos.";
          }
        } else {
          return H + R + "You must provide a new password.";
        }
      case "remove":
        if (s) {
          if (a) {
            if (a !== s) {
              return H + R + "The provided password is incorrect.";
            } else {
              x.prop68("adminPassword");
              return H + "Admin password has been removed successfully.";
            }
          } else {
            return H + R + "You must provide the current password to remove it.";
          }
        } else {
          return H + R + "There is no admin password set.";
        }
      case "forget":
        if (function () {
          try {
            new i("nexus:rescue_tool_enabled");
            return true;
          } catch {
            return false;
          }
        }()) {
          x.prop68("adminPassword");
          return H + "Admin password has been forgotten. You can now set a new password without providing the old one.";
        } else {
          return H + R + "You must have the §gNexus Rescue Tool§c installed in this world to use this action.";
        }
    }
  }
}();
new class extends Jt {
  prop3 = "op";
  prop40 = ["setadmin"];
  prop42 = {
    prop44: "Set a player as nexus opped.",
    prop43: "[player] [password]",
    prop45: "moderation"
  };
  prop121 = [{
    prop6: "player",
    prop46: "non-op",
    prop47: true
  }, {
    prop6: "password",
    prop46: "any",
    prop47: true
  }];
  prop123(e, t) {
    if (!St(e)) {
      return H + R + "You must be a server operator to use this command.";
    }
    const [n, a] = t;
    if (e.prop97 && !n) {
      return H + R + "You have already been a nexus admin.";
    }
    const o = x.prop67("adminPassword");
    if (o) {
      if (!a) {
        return H + R + "You must provide the admin password to use this command.";
      }
      if (a !== o) {
        return H + R + "Incorrect password.";
      }
    }
    Tt(n || e);
    return H + (n ? "Player " + F + n.name + " " + local195 + "is now a nexus admin." : "You are now a nexus admin.");
  }
}();
new class extends Jt {
  prop3 = "deop";
  prop40 = ["deladmin"];
  prop41 = true;
  prop42 = {
    prop44: "Remove admin status from a player.",
    prop43: "[player] [password]",
    prop45: "moderation"
  };
  prop121 = [{
    prop6: "player",
    prop46: "player",
    prop47: true
  }, {
    prop6: "password",
    prop46: "any",
    prop47: true
  }];
  prop123(e, [t, n]) {
    const a = x.prop67("adminPassword");
    if (a) {
      if (!n) {
        return H + R + "You must provide the admin password to use this command.";
      }
      if (n !== a) {
        return H + R + "Incorrect password.";
      }
    }
    if (!t || t instanceof c) {
      Tt(t || e, false);
    } else {
      N.prop68(N.prop66().find(e => e === t));
    }
    return H + (t ? "Player " + F + t.name + " " + local195 + "is no longer a nexus admin." : "You are no longer a nexus admin.");
  }
}();
new class extends Jt {
  prop3 = "ban";
  prop41 = true;
  prop42 = {
    prop44: "Ban a player.",
    prop43: "<player> [reason] [duration]",
    prop45: "moderation"
  };
  prop121 = [{
    prop6: "player",
    prop46: "non-opName"
  }, {
    prop6: "reason",
    prop46: "any",
    prop47: true
  }, {
    prop6: "duration",
    prop46: "duration",
    prop47: true
  }];
  prop123(e, [t, n, a]) {
    const o = W(t.name ?? t);
    if (W(t.name ?? t)) {
      e.sendMessage(H + "Updated ban data of " + (t.name ?? t));
    }
    if (typeof t == "string") {
      K(t, e.name, "name", n, a);
    } else {
      K(t.id, e.name, "id", n, a, t.name);
    }
    if (!o) {
      if (a) {
        return H + "Banned " + F + (t?.name ?? t) + "§e for " + F + Ot(a) + "§e.";
      } else {
        return H + "Banned " + F + (t?.name ?? t) + "§e forever. Use /unban if you want to unban him.";
      }
    }
  }
}();
new class extends Jt {
  prop3 = "unban";
  prop41 = true;
  prop42 = {
    prop44: "Unban a player.",
    prop43: "<player>",
    prop45: "moderation"
  };
  prop121 = [{
    prop6: "player",
    prop46: "name"
  }];
  prop123(e, [t]) {
    if (Y(t)) {
      return H + "Unbanned " + F + t + "§e successfully.";
    } else {
      return H + R + t + "§r§c is not banned. Use §g/banlist§c to check banned players.";
    }
  }
}();
new class extends Jt {
  prop3 = "freeze";
  prop41 = true;
  prop42 = {
    prop44: "Freeze a player.",
    prop43: "<player> [reason] [duration]",
    prop45: "moderation"
  };
  prop121 = [{
    prop6: "player",
    prop46: "non-op"
  }, {
    prop6: "reason",
    prop46: "any",
    prop47: true
  }, {
    prop6: "duration",
    prop46: "duration",
    prop47: true
  }];
  prop123(e, [t, n, a]) {
    Z(t, e.name, n, a);
    return H + (J.prop69(t) ? "Updated freeze data for §g" + t.name : "Freezed §g" + t.name + "§e for " + F + Ot(a));
  }
}();
new class extends Jt {
  prop3 = "unfreeze";
  prop40 = ["unfroze"];
  prop41 = true;
  prop42 = {
    prop44: "Unfreeze a player.",
    prop43: "<player>",
    prop45: "moderation"
  };
  prop121 = [{
    prop6: "player",
    prop46: "name"
  }];
  prop123(e, [t]) {
    const n = Object.entries(J.prop66()).find(([e, n]) => n.name === t)?.[0];
    if (n) {
      ee(e, J.prop67(n));
      J.prop68(n);
      return H + "Unfroze " + F + t + "§e successfully.";
    } else {
      return H + F + t + R + " is not frozen. Use §g/freezelist§c to check frozen players.";
    }
  }
}();
new class extends Jt {
  prop3 = "invcopy";
  prop42 = {
    prop44: "Copy a player's inventory.",
    prop43: "<player>",
    prop45: "moderation"
  };
  prop121 = [{
    prop6: "player",
    prop46: "player",
    prop48: false
  }];
  prop41 = true;
  prop123(e, [t]) {
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
      return H + "Inventory copied!";
    } else {
      return undefined;
    }
  }
}();
const en = new w("ZXhhY3RseWp1ZGdlZG9vcmZsb3dlcmNhbm5vdGR1cmluZ3RocmVhZHByaWNlY3VydmU=");
function tn(e, t) {
  return e + ":" + t.x + "," + t.y + "," + t.z;
}
function nn(e, n, a) {
  n = gt(n);
  const o = a.id;
  const i = tn(o, n);
  const r = {
    x: n.x + 1,
    y: n.y,
    z: n.z
  };
  const s = tn(o, r);
  const c = a.getBlock(n);
  const l = a.getBlock(r);
  if (c && c.isAir && l && l.isAir && !en.prop67(i) && !en.prop67(s)) {
    c.setType("minecraft:chest");
    l.setType("minecraft:chest");
    t.runTimeout(() => {
      const t = c.getComponent("inventory")?.container;
      if (t) {
        en.prop68(i, r.x + "," + r.y + "," + r.z);
        en.prop68(s, n.x + "," + n.y + "," + n.z);
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
function an(e, n, a) {
  n = gt(n);
  const o = tn(a.id, n);
  const i = a.getBlock(n);
  if (i && i.isAir && !en.prop69(o)) {
    i.setType("minecraft:barrel");
    t.runTimeout(() => {
      const t = i.getComponent("inventory")?.container;
      if (t) {
        en.prop68(o, "barrel");
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
qe.prop106.push((e, n, a) => {
  const o = n.dimension.id;
  const i = n.typeId;
  if (e.prop97) {
    if (i === "minecraft:chest") {
      const i = gt(n.location);
      const r = en.prop67(tn(o, i));
      if (!r) {
        return;
      }
      const s = r.split(",").map(Number);
      const c = {
        x: s[0],
        y: s[1],
        z: s[2]
      };
      en.prop68(tn(o, i));
      en.prop68(tn(o, c));
      a.cancel = true;
      t.run(() => {
        n.setType("minecraft:air");
        n.dimension.getBlock(c)?.setType("minecraft:air");
        t.runTimeout(() => {
          const local62 = {
            x: (i.x + c.x) / 2,
            y: (i.y + c.y) / 2
          };
          local62.z = (i.z + c.z) / 2;
          const local63 = {
            location: local62,
            maxDistance: 3
          };
          local63.type = "minecraft:item";
          n.dimension.getEntities(local63).forEach(e => e.remove());
        }, 1);
      });
      e.sendMessage(H + "Protected large chest removed.");
    } else if (i === "minecraft:barrel") {
      const i = gt(n.location);
      en.prop68(tn(o, i));
      a.cancel = true;
      t.run(() => {
        n.setType("minecraft:air");
        t.runTimeout(() => {
          const local64 = {};
          local64.location = i;
          local64.maxDistance = 3;
          local64.type = "minecraft:item";
          n.dimension.getEntities(local64).forEach(e => e.remove());
        }, 1);
      });
      e.sendMessage(H + "Protected barrel removed.");
    }
    return;
  }
  const r = gt(n.location);
  const s = {
    x: r.x,
    y: r.y + 1,
    z: r.z
  };
  if (i === "minecraft:chest") {
    if (en.prop69(tn(o, r)) || en.prop69(tn(o, s))) {
      a.cancel = true;
      e.sendMessage(H + "That location is protected.");
    }
  } else if (i === "minecraft:barrel" && en.prop69(tn(o, r))) {
    a.cancel = true;
    e.sendMessage(H + "That location is protected.");
  }
});
qe.prop103.push((e, t, n) => {
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
  if (en.prop69(tn(o, i))) {
    n.cancel = true;
    e.sendMessage(H + "That location is protected.");
  }
});
qe.prop110.push((e, t, n) => {
  const a = t.typeId;
  if (a !== "minecraft:chest" && a !== "minecraft:barrel") {
    return;
  }
  const o = t.dimension.id;
  if (en.prop69(tn(o, gt(t.location)))) {
    n.cancel = true;
    e.sendMessage(H + "That location is protected.");
  }
});
new class extends Jt {
  prop3 = "invsee";
  prop42 = {
    prop45: "moderation",
    prop44: "Copy another player's inventory into a protected large chest for you to view.",
    prop43: "<player>"
  };
  prop41 = true;
  prop121 = [{
    prop6: "player",
    prop46: "player"
  }];
  prop123(e, [n]) {
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
    i[50] = r.getEquipment(a.Head);
    i[51] = r.getEquipment(a.Chest);
    i[52] = r.getEquipment(a.Legs);
    i[53] = r.getEquipment(a.Feet);
    i[45] = r.getEquipment(a.Offhand);
    i.map(e => e === null ? undefined : e);
    t.run(() => {
      const local65 = {};
      local65.x = e.location.x;
      local65.y = e.location.y + 3;
      local65.z = e.location.z;
      nn(i, local65, e.dimension);
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
    return H + "Open chest (above your head) to take a look on " + n.name + "'s inventory. Break it to remove it safely when you are done.";
  }
}();
new class extends Jt {
  prop3 = "echestwipe";
  prop42 = {
    prop44: "Wipe enderchest of a player.",
    prop43: "<player> [itemType]",
    prop45: "moderation"
  };
  prop121 = [{
    prop6: "player",
    prop46: "player"
  }];
  prop41 = true;
  prop123(e, [n]) {
    t.run(() => {
      n.getComponent("minecraft:ender_inventory").container.clearAll();
    });
    return H + "Removed all enderchest item of " + n.name;
  }
}();
new class extends Jt {
  prop3 = "echestcopy";
  prop42 = {
    prop44: "Copy all enderchest item of a player to your inventory.",
    prop43: "<player>",
    prop45: "moderation"
  };
  prop121 = [{
    prop6: "player",
    prop46: "player"
  }];
  prop41 = true;
  prop123(e, [n]) {
    t.run(() => {
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
    return H + "All enderchest item of " + F + n.name + "§e has been copied to your inventory.";
  }
}();
new class extends Jt {
  prop3 = "echestsee";
  prop42 = {
    prop44: "View a player's enderchest.",
    prop43: "<player>",
    prop45: "moderation"
  };
  prop121 = [{
    prop6: "player",
    prop46: "player"
  }];
  prop41 = true;
  prop123(e, [n]) {
    const a = n.getComponent("minecraft:ender_inventory")?.container;
    if (!a) {
      return;
    }
    const o = [];
    for (let e = 0; e < 27; e++) {
      const t = a.getItem(e);
      o.push(t);
    }
    t.run(() => {
      const local66 = {};
      local66.x = e.location.x;
      local66.y = e.location.y;
      local66.z = e.location.z;
      const t = an(o, local66, e.dimension);
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
    return H + "All enderchest item has been generated to the barrel.\n§a- Open it to view the enderchest's item\n- Break it to remove the barrel safely.";
  }
}();
new class extends Jt {
  prop3 = "despawn";
  prop41 = true;
  prop42 = {
    prop44: "Remove specfic type of entities in all dimensions without dropping loot.",
    prop43: "[entityId|!entityId|all] [skipNamed]",
    prop45: "moderation"
  };
  prop121 = [{
    prop6: "depsawnTarget",
    prop46: "any",
    prop47: true
  }, {
    prop6: "skipNamed",
    prop46: "bool",
    prop47: true
  }];
  prop123(n, [a, o]) {
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
    ["minecraft:overworld", "minecraft:the_end", "minecraft:nether"].map(t => e.getDimension(t)).forEach(e => {
      const local67 = {
        excludeTypes: a
      };
      const local68 = {
        type: a
      };
      const local69 = {
        excludeTypes: a
      };
      const local70 = {};
      local70.type = a;
      if (o) {
        if (i) {
          r.push(...e.getEntities(local67).filter(({
            nameTag: e
          }) => !e));
        } else {
          r.push(...e.getEntities(local68).filter(({
            nameTag: e
          }) => !e));
        }
      } else if (i) {
        r.push(...e.getEntities(local69));
      } else {
        r.push(...e.getEntities(local70));
      }
    });
    t.run(() => {
      r.forEach(e => e.remove());
    });
    return H + "Removed " + r.length + (r.length === 1 ? " entity" : " entities");
  }
}();
new class extends Jt {
  prop3 = "setToken";
  prop41 = true;
  prop42 = {
    prop44: "set the token that the anticheat will use to verify and authenticate to the backend",
    prop43: "<token>",
    prop45: "moderation"
  };
  prop121 = [{
    prop6: "key",
    prop46: "any"
  }];
  prop123(e, [t]) {
    e.sendMessage(H + "§ethe license key has been set to be " + t);
    O.prop68("current", t);
    Le = 0;
    local214 = 0;
  }
}();
new class extends Jt {
  prop3 = "deleteToken";
  prop41 = true;
  prop42 = {
    prop44: "delete the current token causing the anticheat that it will not try connect to backend server of nexus.",
    prop43: "",
    prop45: "moderation"
  };
  prop121 = [];
  prop123(e, []) {
    e.sendMessage(H + "§cthe license key has been deleted!");
    O.prop68("current", false);
  }
}();
new class extends Jt {
  prop3 = "disconnect";
  prop41 = true;
  prop42 = {
    prop44: "disconnects from the nexus backend server.",
    prop43: "",
    prop45: "moderation"
  };
  prop121 = [];
  prop123(e, []) {
    if (Be?.isOpen) {
      Be.close();
      e.sendMessage(H + "§edisconnected from the backend");
      return;
    }
    e.sendMessage(H + "§cthe anticheat already isnt connected yet!");
  }
}();
new class extends Jt {
  prop3 = "setServer";
  prop41 = true;
  prop42 = {
    prop44: "set the default server that the anticheat will try to connect to.",
    prop43: "<server: NA/AS/EU>",
    prop45: "moderation"
  };
  prop121 = [{
    prop6: "targetedServer",
    prop46: "any"
  }];
  prop123(e, [t]) {
    const n = String(t || "").toUpperCase();
    const a = Oe.find(e => e.id === n);
    if (a) {
      B.prop68("current", a);
      e.sendMessage(H + "§atarget server has been changed to §e" + a.id + "§a. If Nexus is already connected, use §edisconnect §aand it reconnects to the new server within about 10 seconds.");
    } else {
      e.sendMessage(H + "§cUnknown server §e" + t + "§c. Choose one of: §e" + Oe.filter(e => e.id !== "LOCAL").map(e => e.id).join("§7, §e") + "§c (pick the closest to your server).");
    }
  }
}();
new class extends Jt {
  prop3 = "autoReconnect";
  prop41 = true;
  prop42 = {
    prop44: "Change wether the pack should auto reconnect or no.",
    prop43: "<boolean: true/false>",
    prop45: "moderation"
  };
  prop121 = [{
    prop6: "status",
    prop46: "boolean"
  }];
  prop123(e, [t]) {
    if (t.toLowerCase() == "true") {
      z.prop68("current", true);
    } else {
      if (t.toLowerCase() != "false") {
        e.sendMessage(H + "§cThe value entred isnt a boolean! please use true/false");
        return;
      }
      z.prop68("current", false);
    }
    e.sendMessage(H + "§eAuto reconnect has been set to " + t);
  }
}();
new class extends Jt {
  prop3 = "connect";
  prop41 = true;
  prop42 = {
    prop44: "Use this command to connect to the backend server.",
    prop43: "",
    prop45: "moderation"
  };
  prop121 = [];
  prop123(e, [t]) {
    if (Be?.isOpen) {
      e.sendMessage(H + "§cThe anticheat is already connected");
      return;
    }
    const n = B.prop67("current");
    if (!O.prop67("current")) {
      e.sendMessage(H + "§cTheres no license key set! Set it with §e" + S.prefix + "setToken <key>§c. Get a free key with /token free in our Discord: §u" + L);
      if (n) {
        e.sendMessage(H + "§cThe AntiCheat doesnt have a target server. §eChoose one with " + S.prefix + "setServer <NA|EU|AS>§e.");
        return;
      } else {
        return undefined;
      }
    }
    Ve();
  }
}();
new class extends Jt {
  prop3 = "ui";
  prop40 = ["commandlist"];
  prop42 = {
    prop44: "Open nexus admin ui",
    prop43: "",
    prop45: "utility"
  };
  prop41 = true;
  prop123(e) {
    t.run(() => at(e));
    return H + "Close the chat screen to view the Admin UI.";
  }
}();
new class extends Jt {
  prop3 = "uiitem";
  prop40 = ["itemui"];
  prop42 = {
    prop44: "Get nexus admin ui item.",
    prop43: "",
    prop45: "utility"
  };
  prop41 = true;
  prop123(e) {
    t.run(() => {
      zt(e, new i("nexus:ui", 1));
    });
    return e.sendMessage(H + "You have been given the ui item. Hold the item and use it to open nexus admin ui.");
  }
}();
new class extends Jt {
  prop3 = "gma";
  prop41 = true;
  prop42 = {
    prop44: "Change your gamemode to advanture.",
    prop45: "utility",
    prop43: ""
  };
  prop123(e) {
    t.run(() => e.setGameMode(n.Adventure));
    return H + "Your gamemode is changed to Adventure.";
  }
}();
new class extends Jt {
  prop3 = "gmc";
  prop41 = true;
  prop42 = {
    prop44: "Change your gamemode to creative.",
    prop45: "utility",
    prop43: ""
  };
  prop123(e) {
    t.run(() => e.setGameMode(n.Creative));
    return H + "Your gamemode is changed to Creative";
  }
}();
new class extends Jt {
  prop3 = "gms";
  prop41 = true;
  prop42 = {
    prop44: "Change your gamemode to survival",
    prop45: "utility",
    prop43: ""
  };
  prop123(e) {
    t.run(() => e.setGameMode(n.Survival));
    return H + "Your gamemode is changed to Survival.";
  }
}();
new class extends Jt {
  prop3 = "gmsp";
  prop41 = true;
  prop42 = {
    prop44: "Change your gamemode to spectator.",
    prop45: "utility",
    prop43: ""
  };
  prop123(e) {
    t.run(() => e.setGameMode(n.Spectator));
    return H + "Your gamemode is changed to Spectator.";
  }
}();
new class extends Jt {
  prop3 = "fakeleave";
  prop42 = {
    prop45: "utility",
    prop44: "Send a translated fake leave message (only).",
    prop43: "[isRealmMessage (Default: false)]"
  };
  prop121 = [{
    prop6: "isRealmMessage",
    prop46: "bool",
    prop47: true
  }];
  prop41 = true;
  prop123(t, n) {
    const local71 = {
      text: "§e"
    };
    const local72 = {};
    local72.translate = n[0] ? "multiplayer.player.left.realms" : "multiplayer.player.left";
    local72.with = [t.name];
    const local73 = {
      rawtext: [local71, local72]
    };
    e.sendMessage(local73);
    return H + "Success!";
  }
}();
new class extends Jt {
  prop3 = "chest";
  prop41 = true;
  prop42 = {
    prop44: "Create a protected large chest (north-to-east) in current location that only verified admin can open.",
    prop45: "utility",
    prop43: ""
  };
  prop123(e) {
    t.run(() => {
      nn([], e.location, e.dimension);
    });
    return H + "A protected large chest has been created at your location.";
  }
}();
new class extends Jt {
  prop3 = "barrel";
  prop41 = true;
  prop42 = {
    prop44: "Create a protected barrel in current location that only verified admin can open.",
    prop45: "utility",
    prop43: ""
  };
  prop123(e) {
    t.run(() => {
      an([], e.location, e.dimension);
    });
    return H + "A protected barrel has been created at your location.";
  }
}();
const on = new Set();
qe.prop99.push(function (e, t, n, a) {
  if (!S.toggle.detection.combat.aim$P) {
    return;
  }
  const o = a.prop6 + ":" + a.prop19;
  if (on.has(o)) {
    return;
  }
  on.add(o);
  const local74 = {};
  local74.prop130 = a.prop2;
  const i = S.advanced.constant.aim;
  const r = local74;
  qe.prop114.push(function n() {
    const a = Date.now();
    if (!e.isValid || !t.isValid || a - r.prop130 > i.trackDuration) {
      on.delete(o);
      const i = qe.prop114.indexOf(n);
      if (i !== -1) {
        qe.prop114.splice(i, 1);
      }
      Ut({
        id: ue.attackTick,
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
    Ut({
      id: ue.attackTick,
      data: {
        player: {
          name: e.name,
          id: e.id,
          rotation: Rt(e.getRotation()),
          velocity: func218(e.getVelocity()),
          viewDir: func218(e.getViewDirection()),
          headLoc: func218(e.getHeadLocation())
        },
        target: {
          id: t.id,
          typeId: t.typeId,
          location: func218(t.location),
          velocity: func218(t.getVelocity()),
          AABB: Ht(t.getAABB())
        },
        date: a
      }
    });
  });
});
const rn = new Map();
qe.prop99.push((e, t, n, a) => {
  if (!S.toggle.moderation.antiBreachSwap || !S.advanced.constant.antiBreachSwap.maceItem.includes(Bt(e)?.typeId ?? "minecraft:air")) {
    return;
  }
  const o = rn.get(a.prop6) ?? 0;
  if (o) {
    const t = a.prop2 - o;
    if (t < S.advanced.constant.antiBreachSwap.cooldown) {
      n.cancel = true;
      e.sendMessage(H + "§cBreach item is currently in cooldown, please wait §g" + (S.advanced.constant.antiBreachSwap.cooldown - t) / 1000 + " §cseconds.");
      return;
    }
  }
  rn.set(a.prop6, a.prop2);
});
qe.prop115.push((n, a) => {
  if (!S.toggle.moderation.worldBorder) {
    return;
  }
  const {
    x: o,
    z: i
  } = a.prop5;
  const r = S.advanced.moduleSettings.worldBorder.centreFromSpawn ? a.prop131 : S.advanced.moduleSettings.worldBorder.defaultCentre;
  const s = S.advanced.moduleSettings.worldBorder.maxAxisDiff;
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
    switch (S.advanced.moduleSettings.worldBorder.borderMode) {
      case "teleport":
        {
          const e = f ? a.prop5.x - Math.sign(c) * (u - s + 0.01) : a.prop5.x;
          const t = p ? a.prop5.z - Math.sign(d) * (m - s + 0.01) : a.prop5.z;
          const local79 = {
            x: e
          };
          local79.y = a.prop5.y;
          local79.z = t;
          n.teleport(local79);
          n.prop132 ??= 0;
          if (a.prop2 - n.prop132 > 1000) {
            n.sendMessage("§c§lHey! §r§7You have reached the world boundary.");
            n.prop132 = a.prop2;
          }
          break;
        }
      case "void":
        const local75 = {
          stayDuration: 10,
          fadeInDuration: 0,
          fadeOutDuration: 0
        };
        local75.subtitle = "§e§kNEXUSONTHETOP";
        n.onScreenDisplay.setTitle("§c§lBack to Safe Zone", local75);
        if (t.currentTick % 10 != 0) {
          break;
        }
        const local76 = {};
        local76.cause = l.void;
        n.applyDamage((o.effectiveMax ?? 20) * 0.2, local76);
        break;
      case "deterioration":
        const local77 = {
          stayDuration: 10,
          fadeInDuration: 0,
          fadeOutDuration: 0
        };
        local77.subtitle = "§e§kNEXUSONTHETOP";
        n.prop133 ??= 0;
        n.onScreenDisplay.setTitle("§c§lBack to Safe Zone", local77);
        if (t.currentTick % 10 != 0) {
          break;
        }
        const local78 = {};
        local78.cause = l.void;
        if (n.applyDamage(o.effectiveMax * (0.1 + n.prop133), local78)) {
          n.prop133 += 0.05;
        }
        break;
      case "count-down":
        {
          n.prop134 ??= a.prop2;
          const t = a.prop2 - n.prop134;
          const o = S.advanced.moduleSettings.worldBorder.timeToKill - t;
          if (o <= 0) {
            const t = n.getSpawnPoint();
            if (!n.kill()) {
              n.teleport(t ?? e.getDefaultSpawnLocation(), {
                dimension: t?.dimension ?? Ke
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
    if (n.prop133) {
      n.prop133 = 0;
    }
    if (n.prop134) {
      delete n.prop134;
    }
  }
});
const sn = new Map();
qe.prop99.push((e, t, n, a) => {
  if (we) {
    return;
  }
  if (!S.toggle.detection.combat.autoclicker) {
    return;
  }
  const o = sn.get(a.prop6);
  if (o && a.prop2 - o.prop135 < S.advanced.constant.autoclicker.stopInteractWithin) {
    n.cancel = true;
  }
});
qe.prop107.push((e, t, n) => {
  if (we) {
    return;
  }
  if (!S.toggle.detection.combat.autoclicker) {
    return;
  }
  const a = sn.get(e.id);
  if (!a) {
    return;
  }
  const o = n - a.prop49;
  if (o > S.advanced.constant.autoclicker.resetCombatTimerAt) {
    a.prop136 = 0;
    a.prop137 = 0;
  } else if (o > S.advanced.constant.autoclicker.naturalCombatInterval) {
    a.prop137 += S.advanced.constant.autoclicker.naturalCombatInterval;
  } else {
    a.prop137 += o;
  }
  a.prop49 = n;
  a.prop136++;
  if (a.hitPast > 1000) {
    const t = a.prop136 / a.prop137 * 1000;
    if (t > S.advanced.constant.autoclicker.maxHps) {
      if (n - a.prop52 > S.advanced.constant.autoclicker.minFlagInterval) {
        a.prop52 = n;
        re(e, "AutoClicker", "Hit", S.punishment.specfic.autoclicker, "avg. Hit/s=" + t.toFixed(2));
      }
      a.prop135 = n;
    }
  }
});
qe.prop103.push((e, t, n, a) => {});
qe.prop101.push(e => {
  const local80 = {
    prop136: 0,
    prop49: 0,
    prop137: 0,
    prop138: 0,
    prop139: 0,
    prop52: 0
  };
  local80.prop135 = 0;
  sn.set(e.id, local80);
});
qe.prop96.push(e => {
  sn.delete(e);
});
qe.prop99.push((e, t, n, a) => {
  if (we) {
    return;
  }
  if (!S.toggle.detection.combat.reach_g1 || a.prop22 < 1 || e.getGameMode() === "Creative") {
    return;
  }
  const o = ht(a.prop21, a.prop20);
  const i = Lt(Bt(e)?.typeId) ? 32.49 : 17.64;
  if (o > i) {
    n.cancel = true;
    le(e, "Reach-G1", "General", S.advanced.constant.reach_g1.heatGain, S.advanced.constant.reach_g1.heatLoss, S.punishment.specfic.reach_g1, "distanceXZ²=" + o.toFixed(3) + "/" + i.toFixed(3));
  }
});
const cn = new Map();
qe.prop99.push((e, t, n, a) => {
  if (we) {
    return;
  }
  if (!S.toggle.detection.combat.killaura) {
    return;
  }
  const o = cn.get(a.prop6);
  if (o) {
    if (a.prop2 - o.prop52 > 4000) {
      o.prop51 = 0;
    }
    o.lastHitTarget = a.prop19;
    if (a.prop22 > 2.5) {
      const t = Vt(e);
      const i = function ({
        x: e,
        z: t
      }, n, a, o) {
        const i = a.x - n.x;
        const r = a.z - n.z;
        const s = e * i + t * r;
        if (o) {
          return s < 0 || s * s < wt * ((e * e + t * t) * (i * i + r * r));
        }
        return !(s >= 0) && s * s > bt * ((e * e + t * t) * (i * i + r * r));
      }(a.prop17, a.prop21, a.prop20.center, t);
      o.prop51 += 1;
      o.prop52 = a.prop2;
      n.cancel = true;
      if (i && o.prop51 >= 6) {
        ce(e, "KillAura", "B", S.advanced.constant.killaura.heatGain, S.advanced.constant.killaura.heatLoss, S.punishment.specfic.killaura);
        o.prop51 = 0;
      }
    }
  } else {
    cn.set(e.id, {
      prop49: 0,
      prop50: a.prop19,
      prop51: 0,
      prop52: a.prop2
    });
  }
});
qe.prop107.push((e, t, n) => {
  if (we) {
    return;
  }
  if (!S.toggle.detection.combat.killaura) {
    return;
  }
  const a = cn.get(n.prop6);
  if (!a) {
    cn.set(n.prop6, {
      prop49: 0,
      prop50: n.prop19,
      prop51: 0,
      prop52: n.prop2
    });
    return;
  }
  if (n.prop2 - a.prop52 > 4000) {
    a.prop51 = 0;
  }
  const o = n.prop2 - a.prop49 < 50;
  a.prop49 = n.prop2;
  if (o && n.prop19 !== a.prop50 && n.prop2 - a.prop52 >= 250) {
    a.prop51 += 1;
    a.prop52 = n.prop2;
    if (a.prop51 >= 6) {
      ce(e, "KillAura", "A", S.advanced.constant.killaura.heatGain, S.advanced.constant.killaura.heatLoss, S.punishment.specfic.killaura, "interval=" + o);
      a.prop51 = 0;
    }
  }
  a.prop50 = n.prop19;
});
qe.prop96.push(e => {
  if (!we) {
    cn.delete(e);
  }
});
const ln = new Map();
const dn = new Map();
qe.prop115.push((e, t) => {
  const n = e.getComponent("equippable");
  const o = n?.getEquipment(a.Offhand);
  const i = t.prop6;
  const r = {
    typeId: o?.typeId,
    amount: o?.amount
  };
  const s = ln.get(i) ?? {
    typeId: o?.typeId,
    amount: o?.amount
  };
  const c = s.typeId != o?.typeId || s.amount != o?.amount;
  const local81 = {};
  local81.typeId = o?.typeId;
  local81.amount = o?.amount;
  ln.set(i, local81);
  if (!c) {
    return;
  }
  const local82 = {};
  local82.name = t.prop3;
  local82.id = t.prop6;
  const local83 = {
    player: local82,
    beforeItem: s,
    afterItem: r
  };
  local83.date = t.prop2;
  const local84 = {};
  local84.id = ue.offHandChange;
  local84.data = local83;
  Ut(local84);
  if (!S.toggle.detection.player.offhand) {
    return;
  }
  if (we) {
    return;
  }
  if (!r.typeId) {
    dn.set(i, t.prop2);
  }
  const l = dn.get(i) ?? t.prop2 - (S.advanced.constant.offhand.minReactionTime + 1);
  if (o) {
    const r = t.prop2 - l;
    if (r < S.advanced.constant.offhand.minReactionTime) {
      n?.setEquipment(a.Offhand);
      zt(e, o);
      ce(e, "Offhand", "General", S.advanced.constant.offhand.heatGain, S.advanced.constant.offhand.heatLoss, "Reaction=" + r);
    } else {
      dn.delete(i);
    }
  }
});
qe.prop96.push(e => {
  ln.delete(e);
  dn.delete(e);
});
const local223 = {
  ["minecraft:coal_ore"]: 33,
  ["minecraft:iron_ore"]: 54,
  ["minecraft:gold_ore"]: 60,
  ["minecraft:lapis_ore"]: 48,
  ["minecraft:redstone_ore"]: 53,
  ["minecraft:diamond_ore"]: 47,
  ["minecraft:emerald_ore"]: 47,
  ["minecraft:ancient_debris"]: 200
};
const local224 = {
  ["minecraft:diamond_ore"]: 12,
  ["minecraft:redstone_ore"]: 16,
  ["minecraft:iron_ore"]: 35,
  ["minecraft:gold_ore"]: 25,
  ["minecraft:copper_ore"]: 40,
  ["minecraft:coal_ore"]: 128,
  ["minecraft:lapis_ore"]: 20,
  ["minecraft:emerald_ore"]: 12
};
const un = new Set(["minecraft:iron_ore", "minecraft:deepslate_iron_ore", "minecraft:gold_ore", "minecraft:deepslate_gold_ore", "minecraft:lapis_ore", "minecraft:deepslate_lapis_ore", "minecraft:redstone_ore", "minecraft:deepslate_redstone_ore", "minecraft:diamond_ore", "minecraft:deepslate_diamond_ore", "minecraft:emerald_ore", "minecraft:deepslate_emerald_ore", "minecraft:ancient_debris"]);
const mn = new Set(["minecraft:stone", "minecraft:deepslate", "minecraft:tuff", "minecraft:granite", "minecraft:diorite", "minecraft:andesite", "minecraft:coal_ore"]);
const fn = new Set([...un, ...mn]);
const pn = local223;
const local225 = local224;
function hn(e) {
  if (e.startsWith("minecraft:deepslate_")) {
    return e.replace("deepslate_", "");
  } else {
    return e;
  }
}
const gn = new Map();
qe.prop105.push((e, t, n, a) => {
  const o = t.typeId.replace("deepslate_", "");
  if (!S.toggle.detection.visual.xray) {
    return;
  }
  const i = S.advanced.constant.xray;
  if (!fn.has(o)) {
    return;
  }
  let r = gn.get(e.id);
  if (!r) {
    r = {
      prop0: e.dimension.id,
      prop53: Date.now(),
      prop51: 0,
      prop54: 0,
      prop55: [],
      prop56: "",
      prop57: 0,
      prop58: 0,
      prop59: 0
    };
    gn.set(e.id, r);
  }
  if (e.dimension.id !== r.prop0 || a.prop2 - r.prop53 > 300000) {
    (function (e, t) {
      if (t.prop51 !== 0) {
        Object.assign(t, {
          prop0: e.dimension.id,
          prop53: Date.now(),
          prop51: 0,
          prop54: 0,
          prop55: [],
          prop56: "",
          prop57: 0,
          prop60: 0,
          prop58: 0,
          prop59: 0
        });
        gn.set(e.id, t);
      }
    })(e, r);
  }
  r.prop53 = a.prop2;
  r.prop51++;
  r.prop55.push(t.location);
  if (mn.has(o)) {
    r.prop59 = a.prop2;
  }
  const s = un.has(o);
  r.prop59 ??= 0;
  if (s && a.prop2 - r.prop59 < i.foundValid) {
    r.prop59 = a.prop2;
    const t = hn(o);
    const n = local225[t];
    if (n && (r.prop56 === t ? r.prop57++ : (r.prop57 = 1, r.prop56 = t), i.experimental && e.sendMessage("§c[Experimental] §7Xray Consecutive Mining: " + r.prop57 + "/" + n + " (" + t + ")"), r.prop57 >= n)) {
      re(e, "Xray", "Consecutive", S.punishment.specfic.xray, "consecutive=" + r.prop57, "threshold=" + n, "ore=" + t);
      if (!i.experimental) {
        gn.delete(e.id);
      }
      return;
    }
  }
  if (s) {
    r.prop54 += function (e) {
      const t = hn(e);
      return pn[t] || 0;
    }(o);
  }
  if (r.prop51 >= 64) {
    const t = r.prop54 / r.prop51;
    const n = function (e, t = 3) {
      if (e < 64) {
        return Infinity;
      }
      const n = 342 / e;
      return 7 + t * Math.sqrt(n);
    }(r.prop51, i.k);
    if (i.experimental) {
      e.sendMessage("§c[Experimental] §7Xray Weighted Score: " + t.toFixed(3) + "/" + n.toFixed(3) + " (count: " + r.prop51 + ")");
    }
    if (t > n) {
      re(e, "Xray", "Score", S.punishment.specfic.xray, "score=" + t.toFixed(5), "threshold=" + n.toFixed(5), "mined=" + r.prop51, "weightedSum=" + r.prop54);
      if (!i.experimental) {
        gn.delete(e.id);
      }
      return;
    }
  }
});
e.afterEvents.playerSpawn.subscribe(e => {
  if (!e.initialSpawn) {
    return;
  }
  const t = e.player;
  let n = gn.get(t.id);
  if (!n) {
    n = {
      prop0: t.dimension.id,
      prop53: Date.now(),
      prop51: 0,
      prop54: 0,
      prop55: [],
      prop56: "minecraft:air",
      prop57: 0,
      prop58: 0,
      prop59: 0
    };
    gn.set(t.id, n);
  }
});
qe.prop115.push(e => {
  if (we) {
    return;
  }
  if (!S.toggle.detection.exploit.forceOp) {
    return;
  }
  const t = e.commandPermissionLevel;
  if (S.advanced.constant.forceOp.onlyCheckForcedHost ? t === 4 : t >= 1) {
    e.commandPermissionLevel = 0;
    ie(e, "ForceOp", "General", S.punishment.specfic.forceOp);
  }
});
qe.prop115.push(t => {
  if (!we && !t.name) {
    const n = t.id;
    if (!e.getAllPlayers().some(({
      id: e
    }) => e === n)) {
      ie(t, "Ghost", "General", S.punishment.specfic.ghost);
    }
  }
});
const yn = /[\uFF21-\uFF3A\uFF41-\uFF5A]|\u00A7|(?![0-9_ A-Za-z])[\u0000-\u00FF]/;
const bn = /^[a-zA-Z0-9_ ]+$/;
qe.prop101.push(e => {
  if (we) {
    return;
  }
  if (!S.toggle.detection.exploit.nameSpoof) {
    return;
  }
  const t = Gt(e.name);
  if (t.length < 3 || t.length > 16) {
    ie(e, "NameSpoof", "A", S.punishment.specfic.nameSpoof);
  } else if (S.advanced.constant.nameSpoof.repeatedNameCheck && t !== e.name) {
    ie(e, "NameSpoof", "B", S.punishment.specfic.nameSpoof);
  } else if (S.advanced.constant.nameSpoof.strict && !S.advanced.constant.nameSpoof.strictAdoptKickOnly || !yn.test(t)) {
    if (!S.advanced.constant.nameSpoof.strict || bn.test(t)) {
      if (S.advanced.constant.nameSpoof.dbCompare) {
        const n = Wt.prop67(e.id);
        Wt.prop68(e.id, t);
        if (n && n !== t) {
          ie(e, "NameSpoof", "E", S.punishment.specfic.nameSpoof);
        }
      }
    } else if (S.advanced.constant.nameSpoof.strictAdoptKickOnly) {
      Et(e, "Your name contains illegal character");
    } else {
      ie(e, "NameSpoof", "D", S.punishment.specfic.nameSpoof);
    }
  } else {
    ie(e, "NameSpoof", "C", S.punishment.specfic.nameSpoof);
  }
});
const vn = new Map();
qe.prop108.push((e, t, n, a, o) => {
  if (we) {
    return;
  }
  const i = S.toggle.detection.exploit.dupeA;
  const r = S.advanced.constant.dupeA;
  if (!i) {
    return;
  }
  const s = o.slot;
  const c = vn.get(e.id);
  const {
    x: l,
    y: d
  } = e.getRotation();
  if (t && t.typeId.includes("bundle") && c) {
    const a = e.dimension.getBlock(c.location);
    if (a && func216(e.location, a.location) < r.containerDistance && (Math.abs(Math.abs(l) - Math.abs(c.rot.x)) < r.rot || Math.abs(Math.abs(d) - Math.abs(c.rot.y)) < r.rot * 2) && a.getComponent("minecraft:inventory") && r.dupeContainers.includes(a.typeId)) {
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
            ie(e, "Dupe", "A", S.punishment.specfic.dupe);
          }
        }
      }
    }
  }
});
qe.prop112.push((e, n, a) => {
  if (we) {
    return;
  }
  if (!n.getComponent("inventory") || !S.toggle.detection.exploit.dupeA) {
    return;
  }
  const o = n.getComponent("inventory")?.container;
  if (o) {
    for (let n = 0; n < o.size; n++) {
      const a = o.getItem(n);
      if (a) {
        if (a.typeId.includes("bundle")) {
          t.run(() => {
            e.dimension.spawnItem(a.clone(), e.location);
            o.setItem(n, undefined);
          });
        }
      }
    }
    vn.set(e.id, {
      rot: e.getRotation(),
      location: n.location
    });
  }
});
qe.prop96.push(e => {
  if (!we) {
    vn.delete(e);
  }
});
const wn = new w("antiDupeD");
function xn(e, t) {
  let n = wn.prop67(t) ?? [];
  if (e.typeId == "minecraft:hopper") {
    let a = false;
    for (const t of n) {
      if (Ft(t.location, e.location)) {
        a = true;
      }
    }
    if (a) {
      return;
    }
    const local85 = {};
    local85.location = e.location;
    n.push(local85);
    wn.prop68(t, n);
  }
}
function kn(e, t) {
  let n = wn.prop67(t) ?? [];
  for (const a of n) {
    if (Ft(a.location, e)) {
      let e = n.indexOf(a);
      if (e !== -1) {
        n.splice(e, 1);
        wn.prop68(t, n);
      }
      break;
    }
  }
}
function Cn(e, t) {
  t.setBlockType(e, "minecraft:air");
  t.spawnItem(new i("minecraft:hopper", 1), e);
}
e.afterEvents.playerPlaceBlock.subscribe(({
  player: e,
  block: t
}) => {
  if (S.toggle.detection.exploit.dupeD) {
    xn(t, t.dimension.id);
  }
});
e.afterEvents.playerInteractWithBlock.subscribe(({
  player: e,
  block: t
}) => {
  if (S.toggle.detection.exploit.dupeD) {
    xn(t, e.dimension.id);
  }
});
e.afterEvents.playerBreakBlock.subscribe(({
  player: e,
  block: t
}) => {
  if (S.toggle.detection.exploit.dupeD && t.typeId == "minecraft:hopper") {
    kn(t.location, t.dimension.id);
  }
});
e.afterEvents.blockExplode.subscribe(e => {
  const t = e.explodedBlockPermutation;
  if (S.toggle.detection.exploit.dupeD && t.type.id == "minecraft:hopper") {
    kn(e.block.location, e.dimension.id);
  }
});
e.afterEvents.pistonActivate.subscribe(e => {
  const {
    block: t,
    isExpanding: n,
    dimension: a
  } = e;
  if (!S.toggle.detection.exploit.dupeD) {
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
      kn(t.location, a.id);
      Cn(t.location, a);
    }
  }
});
e.afterEvents.leverAction.subscribe(function (e) {
  if (e.isPowered) {
    return;
  }
  const t = e.player;
  if (!S.toggle.detection.exploit.dupeD) {
    return;
  }
  const n = t.dimension.id;
  const a = e.block;
  const o = wn.prop67(n) ?? [];
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
    const local89 = {
      location: e
    };
    local89.block = n ? {
      typeId: n.typeId,
      location: {
        ...n.location
      }
    } : null;
    local89.above = a ? {
      typeId: a.typeId,
      location: {
        ...a.location
      }
    } : null;
    local89.below = o ? {
      typeId: o.typeId,
      location: {
        ...o.location
      }
    } : null;
    d.push(local89);
  }
  const local86 = {
    x: i.x,
    y: i.y,
    z: i.z
  };
  const local87 = {
    location: local86
  };
  local87.powered = e.isPowered;
  const local88 = {};
  local88.chunks = S.advanced.constant.dupeD.chunks;
  local88.radius = 64;
  local88.results = d;
  Ut({
    id: ue.lever,
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
        bypass: Dt(t)
      },
      lever: local87,
      scan: local88,
      mapHoppers: o.map(e => ({
        location: e.location
      }))
    },
    date: Date.now()
  });
});
const An = new Map();
qe.prop116.push((e, t) => {
  if (!S.toggle.detection.movement.groundSpoof) {
    return;
  }
  if (!t.prop9 && (t.prop7 || !t.prop8)) {
    return;
  }
  const n = An.get(t.prop6) ?? {
    loc: t.prop5,
    last: t.prop2,
    count: 0,
    lastPlacePos: {}
  };
  n.loc = t.prop5;
  An.set(t.prop6, n);
});
qe.prop103.push((e, t, n, a) => {
  const o = An.get(a.prop6) ?? {
    loc: a.prop25,
    last: a.prop2,
    count: 0,
    lastPlacePos: {}
  };
  if (!(func216(o.lastPlacePos, a.prop25) < a.prop29)) {
    o.lastPlacePos = a.prop24;
    o.lastPlacePos.y += 1;
    An.set(a.prop6, o);
  }
});
qe.prop115.push((e, t) => {
  if (!S.toggle.detection.movement.groundSpoof) {
    return;
  }
  if (!t.prop7 || !t.prop8 || t.prop11) {
    return;
  }
  const n = An.get(t.prop6) ?? {
    loc: t.prop5,
    last: t.prop2,
    count: 0,
    lastPlacePos: {}
  };
  if (func216(n.lastPlacePos, t.prop5) < 5 && Math.abs(n.lastPlacePos.y - t.prop5.y) < 1) {
    if (n.count > 0) {
      n.count--;
    }
    An.set(t.prop6, n);
    return;
  }
  let a;
  let o = t.prop5;
  o.y = Math.ceil(o.y) - 0.5;
  const i = t.prop0.getBlock(t.prop5);
  if (!i?.isAir || !t.prop0.getBlock(o)?.isAir) {
    a = true;
  }
  if (!a) {
    const local90 = {
      x: o.x + 1,
      y: o.y,
      z: o.z
    };
    const local91 = {
      x: o.x - 1,
      y: o.y,
      z: o.z
    };
    const local92 = {
      x: o.x,
      y: o.y,
      z: o.z + 1
    };
    const local93 = {
      x: o.x,
      y: o.y,
      z: o.z - 1
    };
    const local94 = {
      x: o.x - 1,
      y: o.y,
      z: o.z + 1
    };
    const local95 = {
      x: o.x - 1,
      y: o.y,
      z: o.z - 1
    };
    const local96 = {
      x: o.x + 1,
      y: o.y,
      z: o.z + 1
    };
    const local97 = {
      x: o.x + 1,
      y: o.y,
      z: o.z - 1
    };
    const e = [local90, local91, local92, local93, local94, local95, local96, local97];
    for (const n of e) {
      const e = t.prop0.getBlock(n);
      if (!e?.isAir) {
        let e = n;
        e.y++;
        const o = t.prop0.getBlock(e);
        if (o?.isAir || !o?.isSolid) {
          a = true;
          break;
        }
      }
    }
  }
  if (a || n?.flagged) {
    if (t.prop2 - n.last > 10000) {
      n.last = t.prop2;
      n.count = 0;
      const e = t.prop4;
      if (e.x != 0 || e.z != 0) {
        n.loc = t.prop5;
      }
    }
  } else {
    if (t.prop2 - n.last < 200) {
      return;
    }
    e.teleport(n.loc);
    n.last = t.prop2;
    n.count++;
    if (n.count >= 3) {
      ie(e, "GroundSpoof", "General", S.punishment.specfic.groundSpoof);
      n.count = 0;
    }
  }
  An.set(t.prop6, n);
});
qe.prop96.push(e => {
  An.delete(e);
});
const Dn = new Map();
qe.prop116.push((e, t) => {
  if (!S.toggle.detection.movement.noClip) {
    return;
  }
  if (!t.prop9 || t.prop1 || t.prop10 || !t.prop0.getBlock({
    x: t.prop5.x,
    y: t.prop5.y + 1,
    z: t.prop5.z
  })?.isSolid && !t.prop0.getBlock(e.getHeadLocation())?.isSolid) {
    return;
  }
  let n = Dn.get(t.prop6) ?? {
    count: 0,
    last: t.prop2
  };
  const a = t.prop5;
  const o = {
    x: a.x,
    y: a.y + 1.4,
    z: a.z
  };
  n.count++;
  n.last = t.prop2;
  if (n.count >= 5) {
    ie(e, "NoClip", "A", S.punishment.specfic.noClip);
    n.count = 0;
  }
  e.teleport(o);
  Dn.set(t.prop6, n);
});
qe.prop115.push((e, t) => {
  if (!S.toggle.detection.movement.noClip) {
    return;
  }
  const n = t.prop5;
  const a = t.prop6;
  const local98 = {};
  local98.last = t.prop2;
  const local99 = {
    x: n.x,
    y: n.y + 1,
    z: n.z
  };
  if (!((Dn.get(a) ?? local98).last - t.prop2 <= 1500) && !t.prop11 && (!t.prop9 || !!t.prop0.getBlock(local99)?.isSolid && !!t.prop0.getBlock(e.getHeadLocation())?.isSolid)) {
    Dn.set(a, {
      count: 0,
      last: t.prop2
    });
  }
});
qe.prop96.push(e => {
  Dn.delete(e);
});
let Tn = [];
const Sn = new Map();
const Mn = new Map();
qe.prop96.push(e => {
  if (!S.toggle.detection.movement.noSlow) {
    return;
  }
  const n = Tn.findIndex(t => t.id == e);
  if (n !== -1) {
    t.clearRun(Tn[n].run);
    Tn.splice(n, 1);
  }
});
e.afterEvents.itemStartUse.subscribe(function (e) {
  if (!S.toggle.detection.movement.noSlow) {
    return;
  }
  const n = e.source;
  const a = e.itemStack;
  if (a.typeId.includes("spear") || !a.typeId.startsWith("minecraft:")) {
    return;
  }
  if (Dt(n)) {
    return;
  }
  let o = false;
  for (const e of Tn) {
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
  const m = t.runInterval(() => {
    const e = Date.now();
    if (e - Mn.get(l) < 1500) {
      return;
    }
    const t = n.getEffect("speed");
    const a = n.getVelocity();
    const local101 = {
      valid: t
    };
    local101.amplifier = t?.amplifier;
    const local102 = {};
    local102.speed = local101;
    const local103 = {
      name: d,
      id: l,
      effects: local102,
      initialVelocity: i,
      velocity: a,
      location: u
    };
    const local104 = {
      player: local103,
      date: e
    };
    const local105 = {};
    local105.id = ue.slowdown;
    local105.data = local104;
    Ut(local105);
    if (we) {
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
        let t = Sn.get(l);
        const local106 = {
          flags: 0,
          last: 0
        };
        t ||= local106;
        if (e - t.last > 3000) {
          t.flags = 0;
        }
        t.flags++;
        t.last = e;
        Sn.set(l, t);
        if (t.flags >= 3) {
          ie(n, "NoSlow", "General", S.punishment.specfic.noSlow);
          t.flags = 0;
          Sn.set(l, t);
        }
      }
    } else if (m < a && m >= 0.04) {
      a = m;
    }
  }, 2);
  const local100 = {
    id: n.id,
    run: m
  };
  Tn.push(local100);
});
e.afterEvents.itemStopUse.subscribe(function (e) {
  if (!S.toggle.detection.movement.noSlow) {
    return;
  }
  const n = e.source;
  n.name;
  n.id;
  const a = Tn.findIndex(e => e.id == n.id);
  if (a !== -1) {
    t.clearRun(Tn[a].run);
    Tn.splice(a, 1);
  }
  ue.slowdown;
});
qe.prop100.push(e => {
  Mn.set(e.id, Date.now());
});
const In = new Map();
qe.prop103.push((e, t, a, o) => {
  if (we) {
    return;
  }
  if (!S.toggle.detection.world.scaffold) {
    return;
  }
  const {
    face: i,
    faceLocation: r
  } = a;
  const s = e.getGameMode();
  if ([n.Creative, n.Spectator].includes(s) || e.isFlying) {
    return;
  }
  const c = e.location.y - t.location.y;
  const {
    x: l,
    y: m
  } = e.getRotation();
  const f = In.get(e);
  if (!f) {
    return;
  }
  const p = c >= 0.98 && c < 2.5;
  const local107 = !!f.prop140 && o.prop2 - f.prop140 < 350;
  const h = function (e, t) {
    const {
      x: n,
      z: a
    } = e.center();
    switch (t) {
      case d.North:
        const local109 = {
          x: n,
          z: a - 0.5
        };
        return local109;
      case d.South:
        const local110 = {
          x: n,
          z: a + 0.5
        };
        return local110;
      case d.East:
        const local111 = {
          x: n + 0.5,
          z: a
        };
        return local111;
      case d.West:
        const local112 = {
          x: n - 0.5,
          z: a
        };
        return local112;
    }
    const local108 = {
      x: n,
      z: a
    };
    return local108;
  }(t, i);
  const g = function (e, {
    x: t,
    z: n
  }, {
    x: a,
    z: o
  }) {
    switch (e) {
      case d.East:
      case d.West:
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
  const b = f.prop141?.y === t.location.y;
  const v = i === d.Up && f.prop141?.y && t.location.y > f.prop141.y;
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
  }(t.location, f.prop141) && p) {
    const e = function (e) {
      if (e.location.y === 64) {
        return undefined;
      } else {
        return e.below();
      }
    }(t);
    if (e && !e.isLiquid && !e.isAir) {
      f.prop142 = false;
    } else if (!y && !f.prop142) {
      f.prop142 = true;
    }
  }
  if (!local107 || !p || f.prop143 && o.prop2 - f.prop143 > 2000 && g > 2) {
    f.prop144 = 0;
    f.prop145 = 0;
  } else {
    f.prop144++;
    if (f.prop146 !== i && (i !== d.Up || !!v)) {
      f.prop145++;
    }
  }
  const w = function (e, t, n) {
    const a = t.x - e.x;
    const o = t.z - e.z;
    switch (n) {
      case d.North:
        return o > 0;
      case d.South:
        return o < 0;
      case d.East:
        return a < 0;
      case d.West:
        return a > 0;
      default:
        return false;
    }
  }(h, e.location, i);
  if (w) {
    f.prop143 = o.prop2;
  }
  if (f.prop144 > 7) {
    const t = f.prop145 / f.prop144;
    if (t > 0.4 || t > 0.25 && y) {
      a.cancel = true;
      le(e, "Scaffold", "A", S.advanced.constant.scaffold.heatGain, S.advanced.constant.scaffold.heatLoss, "steeringRate=" + t.toFixed(2));
    }
  }
  const x = e.inputInfo;
  const k = x.lastInputModeUsed !== u.Touch || x.touchOnlyAffectsHotbar;
  if (y) {
    if (p && k && l < 0 || f.prop147 !== i && (i !== d.Up || v)) {
      le(e, "Scaffold", "C", S.advanced.constant.scaffold.heatGain, S.advanced.constant.scaffold.heatLoss, "pitch=" + l + ", lastDir=" + f.prop147, "face=" + i);
    }
  } else {
    f.prop147 = i;
    if (p && k && l < 17 && f.prop144 >= 3) {
      a.cancel = true;
      le(e, "Scaffold", "B", S.advanced.constant.scaffold.heatGain, S.advanced.constant.scaffold.heatLoss, "pitch=" + l);
    }
  }
  if (p) {
    if (!y && w && f.prop142) {
      if (l < (k ? 44 : 30) && f.prop144 >= 3) {
        a.cancel = true;
        le(e, "Scaffold", "D", S.advanced.constant.scaffold.heatGain, S.advanced.constant.scaffold.heatLoss, "pitch=" + l);
      }
      if (f.prop148 && b && (l > 60 && g >= 2 || g >= 2.5)) {
        a.cancel = true;
        le(e, "Scaffold", "E", S.advanced.constant.scaffold.heatGain, S.advanced.constant.scaffold.heatLoss, "pitch=" + l, "extender=" + g);
      }
    }
    const n = e.location.y - f.prop141?.y;
    if (!e.isInWater && i === d.Up && f.prop141 && f.prop141.x === t.location.x && f.prop141.z === t.location.z && t.location.y - f.prop141.y === 1 && c >= 0.98 && c < 1.5 && n >= 0.98 && n < 1.5 && local107 && e.isJumping) {
      a.cancel = true;
      le(e, "Scaffold", "G", S.advanced.constant.scaffold.heatGain, S.advanced.constant.scaffold.heatLoss, "height=" + c, "lastHeight=" + n);
    }
  }
  if (Math.abs(l) > 89.91 || l % 1 == 0 && l !== 0 || m % 1 == 0 && m !== 0) {
    a.cancel = true;
    le(e, "Scaffold", "F", S.advanced.constant.scaffold.heatGain, S.advanced.constant.scaffold.heatLoss, "pitch=" + l);
  }
  if (!a.cancel) {
    f.prop140 = o.prop2;
    f.prop149 = l;
    f.prop146 = i;
    f.prop141 = t.location;
    f.prop148 = b;
  }
});
qe.prop101.push(e => {
  const local113 = {
    prop144: 0,
    prop145: 0,
    prop150: 0,
    prop140: undefined,
    prop146: undefined
  };
  local113.prop141 = undefined;
  local113.prop148 = undefined;
  local113.prop143 = undefined;
  local113.prop142 = false;
  local113.prop147 = undefined;
  local113.prop149 = undefined;
  const t = local113;
  In.set(e, t);
});
qe.prop96.push(e => {
  In.delete(e);
});
const En = new Map();
qe.prop105.push((e, t, n, a) => {
  if (we) {
    return;
  }
  const o = S.advanced.constant.blockReach;
  if (!S.toggle.detection.world.blockReach || !e.isValid) {
    return;
  }
  const local114 = {};
  local114.x = t.location.x + 0.5;
  local114.y = t.location.y + 0.5;
  local114.z = t.location.z + 0.5;
  const local115 = {
    center: local114
  };
  const i = local115;
  const r = func216(e.getHeadLocation(), i.center);
  const local116 = {};
  local116.count = 0;
  local116.last = a;
  let s = En.get(e.id) ?? local116;
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
      re(e, "BlockReach", "Break", S.punishment.specfic.blockReach);
    }
    En.set(e.id, s);
  }
});
qe.prop96.push(e => {
  En.delete(e);
});
const Pn = new Map();
qe.prop103.push((e, t, n, a) => {
  if (we) {
    return;
  }
  const o = S.advanced.constant.blockReach;
  if (!S.toggle.detection.world.blockReach || !e.isValid) {
    return;
  }
  const local117 = {};
  local117.x = t.location.x + 0.5;
  local117.y = t.location.y + 0.5;
  local117.z = t.location.z + 0.5;
  const local118 = {
    center: local117
  };
  const i = local118;
  const r = func216(e.getHeadLocation(), i.center);
  const local119 = {
    count: 0,
    last: a
  };
  let s = Pn.get(e.id) ?? local119;
  if (!(r < o.max)) {
    if (a - s.last > o.checkDuration) {
      s.count = 0;
      s.last = a;
    }
    s.count++;
    n.cancel = true;
    if (s.count >= o.count) {
      s.count = 0;
      re(e, "BlockReach", "Place", S.punishment.specfic.blockReach);
    }
    Pn.set(e.id, s);
  }
});
qe.prop96.push(e => {
  Pn.delete(e);
});
const Nn = new Map();
qe.prop110.push((e, t, a, o) => {
  if (we) {
    return;
  }
  const i = S.advanced.constant.interactReach;
  if (!S.toggle.detection.world.interactReach || o.prop34 == n.Creative || !e.isValid || !t.hasComponent("minecraft:inventory")) {
    return;
  }
  const local120 = {};
  local120.x = t.location.x + 0.5;
  local120.y = t.location.y + 0.5;
  local120.z = t.location.z + 0.5;
  const local121 = {
    center: local120
  };
  const r = local121;
  const s = func216(e.getHeadLocation(), r.center);
  const c = Date.now();
  const local122 = {
    count: 0,
    last: c
  };
  const local123 = {
    count: 0,
    last: c
  };
  const local124 = {
    block: local122,
    entity: local123
  };
  let l = Nn.get(e.id) ?? local124;
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
      re(e, "InteractReach", "Block", S.punishment.specfic.interactReach);
    }
    Nn.set(e.id, l);
  }
});
qe.prop111.push((e, t, a, o) => {
  if (we) {
    return;
  }
  const i = S.advanced.constant.interactReach;
  if (!S.toggle.detection.world.interactReach || o.prop34 == n.Creative || !i.entity.target.includes(t.typeId) && !t.hasComponent("minecraft:inventory") || !e.isValid) {
    return;
  }
  const r = func216(e.getHeadLocation(), box.center);
  const s = Date.now();
  const local125 = {};
  local125.count = 0;
  local125.last = s;
  const local126 = {
    count: 0,
    last: s
  };
  const local127 = {
    block: local125,
    entity: local126
  };
  let c = Nn.get(e.id) ?? local127;
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
      re(e, "InteractReach", "Entity", S.punishment.specfic.interactReach);
    }
    Nn.set(e.id, c);
  }
});
qe.prop96.push(e => {
  Nn.delete(e);
});
let On = new Map();
qe.prop103.push((e, n, a, o) => {
  if (we) {
    return;
  }
  const i = S.advanced.constant.placeAutoClicker;
  if (!e || !S.toggle.detection.world.placeAutoClicker || !e.isValid) {
    return;
  }
  let r = On.get(o.prop6);
  const local128 = {};
  local128.count = 0;
  local128.lastPlace = o.prop2;
  local128.place = true;
  if (!r) {
    r = local128;
    On.set(o.prop6, r);
  }
  if (r.place) {
    if (o.prop2 - r.lastPlace >= 1000) {
      r.lastPlace = o.prop2;
      r.count = 0;
    }
    r.count++;
    if (r.count > i.maxCps) {
      a.cancel = true;
      r.place = false;
      re(e, "BlockAutoClicker", "A", S.punishment.specfic.placeAutoClicker);
      t.runTimeout(() => {
        r.place = true;
        On.set(o.prop6, r);
      }, i.resetTimerAt);
      r.count = 0;
    }
    On.set(o.prop6, r);
  } else {
    a.cancel = true;
  }
});
qe.prop96.push(e => {
  On.delete(e);
});
const Bn = new Map();
qe.prop105.push((e, t, n, a) => {
  if (we) {
    return;
  }
  const o = S.advanced.constant.nuker;
  if (!S.toggle.detection.world.nuker || !e.isValid) {
    return;
  }
  const local129 = {
    lastBreak: a - 76
  };
  local129.breakCount = 0;
  local129.banned = false;
  let i = Bn.get(e.id) ?? local129;
  if (a - i.lastBreak <= 76) {
    i.breakCount++;
    if (i.breakCount >= o.minBlocks) {
      n.cancel = true;
    }
    if (i.breakCount >= o.maxBlocks && !i.banned) {
      i.banned = true;
      re(e, "Nuker", "A", S.punishment.specfic.nuker);
    }
  } else {
    i.breakCount = 0;
    i.lastBreak = a;
    i.banned = false;
  }
  Bn.set(e.id, i);
});
qe.prop96.push(e => {
  Bn.delete(e);
});
const zn = new Map();
const Ln = new Map();
qe.prop110.push((e, n, a, o) => {
  if (we) {
    return;
  }
  if (!S.toggle.detection.world.chestAura || !n.hasComponent("inventory") || !e.isValid) {
    return;
  }
  if (n.typeId === "minecraft:chest" && !o.prop33?.isAir && o.prop33?.typeId != "minecraft:chest") {
    return;
  }
  const i = Date.now();
  const local130 = {
    last: i - 126,
    count: 0
  };
  local130.flags = 0;
  local130.closed = false;
  let r = zn.get(e.id) ?? local130;
  const s = Ln.get(e.id);
  if (i - r.last <= 125 && (!s || func216(s, o.prop24) > 0)) {
    a.cancel = true;
    r.count++;
    if (r.count >= 2) {
      r.flags++;
      (function (e) {
        t.runTimeout(() => {
          let n = zn.get(e.id);
          if (!S.toggle.detection.world.chestAura || !e.isValid || !n || n.closed) {
            return;
          }
          n.closed = true;
          zn.set(e.id, n);
          let a = e.location;
          a.y += 10;
          e.teleport(a);
          t.run(() => {
            a.y -= 10;
            e.teleport(a);
            n.closed = false;
            zn.set(e.id, n);
          });
        }, 2);
      })(e);
      if (r.flags >= 2) {
        re(e, "ChestAura", "A", S.punishment.specfic.chestAura);
      }
    }
  } else {
    r.count = 0;
  }
  if (i - r.last >= 5000) {
    r.flags = 0;
  }
  r.last = i;
  zn.set(e.id, r);
  Ln.set(e.id, o.prop24);
});
qe.prop96.push(e => {
  zn.delete(e);
  Ln.delete(e);
});
const local226 = new Map();
qe.prop105.push((e, t, n, a) => {
  if (!S.toggle.detection.world.invalidBreak) {
    return;
  }
  if (func216(a.prop26, {
    x: a.prop24.x + 0.5,
    y: a.prop24.y + 0.5,
    z: a.prop24.z + 0.5
  }) <= 0.5) {
    return;
  }
  const o = a.prop6;
  let i = a.prop24;
  i.x = i.x + 0.5;
  i.y = i.y + 0.5;
  i.z = i.z + 0.5;
  const local131 = {
    count: 0,
    loc: i
  };
  local131.last = a.prop2;
  let r = local226.get(o) ?? local131;
  const s = func216(i, r.loc);
  if (s === 1 && a.prop2 - r.last <= 100) {
    r.loc = i;
    r.last = a.prop2;
    r.count = 0;
    return;
  }
  if (a.prop2 - r.last >= 5000) {
    r.count = 0;
  }
  if (a.prop30 !== "minecraft:bed") {
    const t = function (e, t) {
      const local132 = {
        x: e.x,
        y: e.y + 1,
        z: e.z
      };
      const local133 = {};
      local133.x = e.x;
      local133.y = e.y - 1;
      local133.z = e.z;
      const local134 = {
        x: e.x,
        y: e.y,
        z: e.z + 1
      };
      const local135 = {
        x: e.x + 1,
        y: e.y,
        z: e.z
      };
      const local136 = {};
      local136.x = e.x;
      local136.y = e.y;
      local136.z = e.z - 1;
      const local137 = {
        x: e.x - 1,
        y: e.y,
        z: e.z
      };
      const n = [local132, local133, local134, local135, local136, local137];
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
        re(e, "InvalidBreak", "A", S.punishment.specfic.invalidBreak);
      }
    }
  } else {
    const t = function (e, t) {
      const local138 = {
        x: e.x,
        y: e.y + 1,
        z: e.z
      };
      const local139 = {
        x: e.x,
        y: e.y - 1,
        z: e.z
      };
      const local140 = {
        x: e.x
      };
      local140.y = e.y;
      local140.z = e.z + 1;
      const local141 = {
        x: e.x + 1,
        y: e.y,
        z: e.z
      };
      const local142 = {
        x: e.x,
        y: e.y
      };
      local142.z = e.z - 1;
      const local143 = {
        x: e.x - 1,
        y: e.y,
        z: e.z
      };
      const n = [local138, local139, local140, local141, local142, local143];
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
        re(e, "InvalidBreak", "B", S.punishment.specfic.invalidBreak);
      }
    }
  }
  r.loc = i;
  r.last = a.prop2;
  local226.set(o, r);
});
qe.prop96.push(e => {
  local226.delete(e);
});