#!/usr/bin/env bash
# deploy.sh — ไฟล์เดียวจบ: แตก files.zip → อัปเดตเว็บเดิม → git push → เผยแพร่ Firebase Rules
#
# ใช้:   ./deploy.sh [files.zip] [โฟลเดอร์เว็บเดิม] [--rules-only] [--site-only] [--dry-run]
# ค่าเริ่มต้นของโฟลเดอร์เว็บ: /Users/matung/Desktop/Matang Hub/sapphawathit  (ไม่ต้องพิมพ์ ถ้าไม่ระบุจะใช้ตัวนี้)
# ตัวอย่าง:  ./deploy.sh                 (ใช้ files.zip ในโฟลเดอร์ปัจจุบัน + โฟลเดอร์เริ่มต้น)
#            ./deploy.sh files.zip --rules-only        (อัปเฉพาะ Rules ไม่ต้องระบุโฟลเดอร์เว็บ)
# ไม่ต้องมี firebase.json / .firebaserc — สคริปต์สร้างให้ชั่วคราวเอง และอ่าน projectId จาก config.js ในซิป
set -euo pipefail

DEFAULT_SITE="/Users/matung/Desktop/Matang Hub/sapphawathit"   # โฟลเดอร์เว็บเดิม (ค่าเริ่มต้น)
ZIP=""; SITE_DIR="${SITE_DIR:-$DEFAULT_SITE}"; DRY=0; DO_SITE=1; DO_RULES=1
for a in "$@"; do case "$a" in
  --dry-run) DRY=1;; --rules-only) DO_SITE=0;; --site-only) DO_RULES=0;;
  *) if [[ -z "$ZIP" ]]; then ZIP="$a"; else SITE_DIR="$a"; fi;;
esac; done
ZIP="${ZIP:-files.zip}"
red(){ printf '\033[31m%s\033[0m\n' "$*"; }; grn(){ printf '\033[32m%s\033[0m\n' "$*"; }; ylw(){ printf '\033[33m%s\033[0m\n' "$*"; }
run(){ if ((DRY)); then ylw "[dry-run] $*"; else "$@"; fi; }

[[ -f "$ZIP" ]] || { red "ไม่พบไฟล์ซิป: $ZIP"; exit 1; }
command -v node >/dev/null || { red "ต้องติดตั้ง Node.js ก่อน (https://nodejs.org)"; exit 1; }
SITE_DIR="${SITE_DIR/#\~/$HOME}"
if ((DO_SITE)) && [[ ! -d "$SITE_DIR" ]]; then red "ไม่พบโฟลเดอร์เว็บ: $SITE_DIR"; read -r -p "พิมพ์พาธโฟลเดอร์เว็บเดิม: " SITE_DIR; SITE_DIR="${SITE_DIR/#\~/$HOME}"; fi

# ---------- แตกซิปไว้โฟลเดอร์ชั่วคราว ----------
W="$(mktemp -d)"; trap 'rm -rf "$W"' EXIT
if command -v unzip >/dev/null; then unzip -oq "$ZIP" -d "$W"; else python3 -m zipfile -e "$ZIP" "$W"; fi
cd "$W"
[[ -f database.rules.json && -f app.js && -f config.js ]] || { red "ซิปนี้ไม่มี database.rules.json / app.js / config.js"; exit 1; }

# ---------- ตรวจ Rules ----------
node -e "JSON.parse(require('fs').readFileSync('database.rules.json','utf8'))" || { red "database.rules.json ไม่ใช่ JSON ที่ถูกต้อง"; exit 1; }
RV=$(grep -oE 'RULES_V *= *[0-9]+' app.js | grep -oE '[0-9]+' | head -1)
node -e "const r=JSON.parse(require('fs').readFileSync('database.rules.json','utf8')).rules; process.exit(r.rulesProbe&&r.rulesProbe['v$RV']!==undefined?0:1)" \
  || { red "rulesProbe ไม่มี v$RV — Rules กับ app.js คนละรุ่น"; exit 1; }
PROJECT=$(grep -oE 'projectId *: *"[^"]+"' config.js | cut -d'"' -f2)
[[ -n "$PROJECT" ]] || { red "หา projectId ใน config.js ไม่เจอ"; exit 1; }
grn "✓ Rules รุ่น v$RV · โปรเจกต์ Firebase: $PROJECT"

# ---------- อัปเดตเว็บเดิม ----------
if ((DO_SITE)); then
  [[ -d "$SITE_DIR" ]] || { red "ไม่พบโฟลเดอร์เว็บเดิม: $SITE_DIR"; exit 1; }
  SITE_DIR="$(cd "$SITE_DIR" && pwd)"
  OLD=$(grep -oE "CACHE *= *'[^']+'" "$SITE_DIR/sw.js" 2>/dev/null | cut -d"'" -f2 || true)
  for f in *; do run cp -r "$f" "$SITE_DIR/"; done
  grn "✓ คัดลอกไฟล์ใหม่ทับเว็บเดิมแล้ว (ไฟล์เดิมที่ไม่มีในซิปไม่ถูกแตะ)"
  NEW=$(grep -oE "CACHE *= *'[^']+'" sw.js | cut -d"'" -f2)
  if [[ -n "$OLD" && "$NEW" == "$OLD" ]]; then
    N=$(grep -oE '[0-9]+$' <<<"$NEW"); B="${NEW%$N}$((N+1))"
    run sed -i.bak "s/CACHE = '$NEW'/CACHE = '$B'/" "$SITE_DIR/sw.js"; run rm -f "$SITE_DIR/sw.js.bak"; grn "✓ เพิ่มเลข CACHE: $NEW → $B"
  fi
  if ((!DRY)); then
    MISS=(); while read -r f; do [[ -e "$SITE_DIR/$f" ]] || MISS+=("$f"); done < <(grep -oE '(src|href)="[^":#?]+"' "$SITE_DIR/index.html" | cut -d'"' -f2 | sort -u)
    ((${#MISS[@]})) && { red "⚠ เว็บเดิมยังขาดไฟล์:"; printf '   - %s\n' "${MISS[@]}"; exit 1; }
    grn "✓ ไฟล์ที่ index.html อ้างถึงครบ"
  fi
  if [[ -d "$SITE_DIR/.git" ]]; then
    run git -C "$SITE_DIR" add -A
    run git -C "$SITE_DIR" commit -m "อัปเดตระบบ (Rules v$RV)" || ylw "ไม่มีการเปลี่ยนแปลงให้ commit"
    run git -C "$SITE_DIR" push; grn "✓ push ขึ้น git แล้ว"
  else ylw "โฟลเดอร์เว็บไม่ใช่ git repo — ให้อัปโหลดขึ้นโฮสต์เอง"; fi
fi

# ---------- เผยแพร่ Rules ----------
if ((DO_RULES)); then
  printf '{ "database": { "rules": "database.rules.json" } }\n' > firebase.json   # ไฟล์ตั้งค่าชั่วคราว (ลบเองตอนจบ)
  FB="firebase"; command -v firebase >/dev/null || FB="npx --yes firebase-tools"
  if ((!DRY)); then $FB login:list 2>/dev/null | grep -q '@' || $FB login; fi
  run $FB deploy --only database --project "$PROJECT"
  grn "✓ เผยแพร่ Rules แล้ว"
fi
grn "เสร็จเรียบร้อย"
